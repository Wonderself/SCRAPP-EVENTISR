import asyncio
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, AsyncGenerator
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser
from models import Event, EventCreate, EventSource, EventImportance
from scraping_config import ScrapingConfig, SITE_CONFIGS
from scraping_utils import ScrapingUtils

logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    """Base class for all event scrapers"""
    
    def __init__(self, source: EventSource):
        self.source = source
        self.config = SITE_CONFIGS.get(source.value, {})
        self.scraped_events: List[Dict] = []
        self.errors: List[str] = []
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self.setup_browser()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.cleanup()
    
    async def setup_browser(self):
        """Setup Playwright browser"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=ScrapingConfig.HEADLESS,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            
            # Create page with custom user agent
            self.page = await self.browser.new_page()
            await self.page.set_extra_http_headers({
                'User-Agent': ScrapingConfig.USER_AGENT
            })
            
            # Set viewport
            await self.page.set_viewport_size({"width": 1920, "height": 1080})
            
        except Exception as e:
            logger.error(f"Error setting up browser: {e}")
            raise
    
    async def cleanup(self):
        """Clean up resources"""
        try:
            if self.page:
                await self.page.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def navigate_to_events_page(self) -> bool:
        """Navigate to the events page"""
        try:
            url = self.config.get('base_url')
            if not url:
                raise ValueError(f"No base URL configured for {self.source}")
            
            logger.info(f"Navigating to {url}")
            await self.page.goto(url, wait_until='networkidle')
            
            # Wait for page to load
            await self.page.wait_for_timeout(2000)
            
            return True
            
        except Exception as e:
            error_msg = f"Error navigating to events page: {e}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return False
    
    async def wait_for_events_to_load(self) -> bool:
        """Wait for events to load on the page"""
        try:
            selector = self.config.get('selectors', {}).get('event_cards')
            if not selector:
                return True
            
            # Wait for events to appear
            await self.page.wait_for_selector(selector, timeout=10000)
            return True
            
        except Exception as e:
            logger.warning(f"Events may not have loaded properly: {e}")
            return False
    
    async def extract_event_basic_info(self, event_element) -> Optional[Dict]:
        """Extract basic event information from event element"""
        try:
            selectors = self.config.get('selectors', {})
            
            # Extract basic info
            name = await self.extract_text_from_element(event_element, selectors.get('event_title'))
            date_str = await self.extract_text_from_element(event_element, selectors.get('event_date'))
            location = await self.extract_text_from_element(event_element, selectors.get('event_location'))
            description = await self.extract_text_from_element(event_element, selectors.get('event_description'))
            
            # Extract URL
            url = await self.extract_url_from_element(event_element, selectors.get('event_url'))
            
            if not name or not date_str or not location:
                return None
            
            # Parse date
            date_obj = ScrapingUtils.parse_date(date_str)
            if not date_obj or not ScrapingUtils.is_target_date(date_obj):
                return None
            
            # Check if event is public
            if not ScrapingUtils.is_public_event(name, description or ""):
                return None
            
            # Clean and normalize data
            name = ScrapingUtils.clean_text(name)
            location = ScrapingUtils.clean_text(location)
            description = ScrapingUtils.clean_text(description) if description else None
            url = ScrapingUtils.normalize_url(url, self.config.get('base_url'))
            
            return {
                'name': name,
                'date': date_obj,
                'location': location,
                'url': url,
                'description': description,
                'is_hebrew': ScrapingUtils.is_hebrew_text(name)
            }
            
        except Exception as e:
            logger.error(f"Error extracting basic event info: {e}")
            return None
    
    async def extract_text_from_element(self, element, selector: str) -> Optional[str]:
        """Extract text from element using selector"""
        try:
            if not selector:
                return None
            
            sub_element = await element.query_selector(selector)
            if sub_element:
                return await sub_element.text_content()
            return None
            
        except Exception as e:
            logger.error(f"Error extracting text with selector {selector}: {e}")
            return None
    
    async def extract_url_from_element(self, element, selector: str) -> Optional[str]:
        """Extract URL from element using selector"""
        try:
            if not selector:
                return None
            
            sub_element = await element.query_selector(selector)
            if sub_element:
                return await sub_element.get_attribute('href')
            return None
            
        except Exception as e:
            logger.error(f"Error extracting URL with selector {selector}: {e}")
            return None
    
    async def extract_detailed_info(self, event_data: Dict) -> Dict:
        """Extract detailed information by visiting event page"""
        try:
            if not event_data.get('url'):
                return event_data
            
            # Navigate to event page
            await self.page.goto(event_data['url'], wait_until='networkidle')
            await self.page.wait_for_timeout(1000)
            
            # Extract contact information
            email, organizer = await ScrapingUtils.extract_contact_info(self.page, event_data['url'])
            
            # Update event data
            event_data['organizer_email'] = email
            event_data['organizer_name'] = organizer
            
            # Apply rate limiting
            await ScrapingUtils.rate_limit()
            
            return event_data
            
        except Exception as e:
            logger.error(f"Error extracting detailed info for {event_data.get('url')}: {e}")
            return event_data
    
    async def has_next_page(self) -> bool:
        """Check if there's a next page"""
        try:
            next_selector = self.config.get('selectors', {}).get('next_page')
            if not next_selector:
                return False
            
            next_element = await self.page.query_selector(next_selector)
            return next_element is not None
            
        except Exception:
            return False
    
    async def go_to_next_page(self) -> bool:
        """Navigate to next page"""
        try:
            next_selector = self.config.get('selectors', {}).get('next_page')
            if not next_selector:
                return False
            
            next_element = await self.page.query_selector(next_selector)
            if next_element:
                await next_element.click()
                await self.page.wait_for_load_state('networkidle')
                await self.page.wait_for_timeout(2000)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error navigating to next page: {e}")
            return False
    
    @abstractmethod
    async def scrape_events(self) -> List[Dict]:
        """Main scraping method - to be implemented by subclasses"""
        pass
    
    async def scrape_all_events(self) -> List[EventCreate]:
        """Scrape all events and return EventCreate objects"""
        try:
            # Start scraping
            raw_events = await self.scrape_events()
            
            # Convert to EventCreate objects
            events = []
            for event_data in raw_events:
                try:
                    # Calculate importance
                    importance = ScrapingUtils.calculate_importance(event_data)
                    
                    # Create EventCreate object
                    event_create = EventCreate(
                        name=event_data['name'],
                        date=event_data['date'],
                        location=event_data['location'],
                        url=event_data['url'],
                        description=event_data.get('description'),
                        organizer_email=event_data.get('organizer_email'),
                        organizer_name=event_data.get('organizer_name'),
                        source=self.source,
                        importance=EventImportance(importance),
                        is_hebrew=event_data.get('is_hebrew', False)
                    )
                    
                    events.append(event_create)
                    
                except Exception as e:
                    logger.error(f"Error creating EventCreate object: {e}")
                    continue
            
            # Sort by importance and date
            events.sort(key=lambda x: (
                0 if x.importance == EventImportance.HIGH else 1 if x.importance == EventImportance.MEDIUM else 2,
                x.date
            ))
            
            # Return top events (respecting max limit)
            max_events = ScrapingConfig.MAX_EVENTS_PER_SOURCE
            return events[:max_events]
            
        except Exception as e:
            logger.error(f"Error in scrape_all_events: {e}")
            self.errors.append(f"Scraping failed: {e}")
            return []
    
    def get_errors(self) -> List[str]:
        """Get all errors encountered during scraping"""
        return self.errors