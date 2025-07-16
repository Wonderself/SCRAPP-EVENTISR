import logging
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from models import EventSource
from base_scraper import BaseScraper
from scraping_utils import ScrapingUtils

logger = logging.getLogger(__name__)

class EventbriteScraper(BaseScraper):
    """Eventbrite event scraper"""
    
    def __init__(self):
        super().__init__(EventSource.EVENTBRITE)
    
    async def scrape_events(self) -> List[Dict]:
        """Scrape events from Eventbrite"""
        events = []
        
        try:
            # Navigate to Eventbrite Israel events page
            if not await self.navigate_to_events_page():
                return events
            
            # Handle search/filtering for August/September 2025
            await self.apply_date_filter()
            
            page_count = 0
            max_pages = 10  # Limit to prevent infinite loops
            
            while page_count < max_pages:
                logger.info(f"Scraping Eventbrite page {page_count + 1}")
                
                # Wait for events to load
                await self.wait_for_events_to_load()
                
                # Extract events from current page
                page_events = await self.extract_events_from_page()
                events.extend(page_events)
                
                # Check if we have enough events
                if len(events) >= ScrapingConfig.MAX_EVENTS_PER_SOURCE:
                    break
                
                # Try to go to next page
                if not await self.has_next_page():
                    break
                
                if not await self.go_to_next_page():
                    break
                
                page_count += 1
                await ScrapingUtils.rate_limit()
            
            logger.info(f"Found {len(events)} events on Eventbrite")
            return events
            
        except Exception as e:
            error_msg = f"Error scraping Eventbrite: {e}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return events
    
    async def apply_date_filter(self):
        """Apply date filter for August/September 2025"""
        try:
            # Look for date filter elements
            date_selectors = [
                '[data-testid="date-filter"]',
                '.date-filter',
                '[aria-label*="date"]',
                '.filter-date'
            ]
            
            for selector in date_selectors:
                try:
                    date_element = await self.page.query_selector(selector)
                    if date_element:
                        await date_element.click()
                        await self.page.wait_for_timeout(1000)
                        
                        # Try to select August 2025
                        month_selectors = [
                            '[data-testid="month-august"]',
                            '[data-value="2025-08"]',
                            'text="August 2025"'
                        ]
                        
                        for month_selector in month_selectors:
                            try:
                                month_element = await self.page.query_selector(month_selector)
                                if month_element:
                                    await month_element.click()
                                    await self.page.wait_for_timeout(1000)
                                    break
                            except:
                                continue
                        
                        break
                        
                except Exception as e:
                    logger.debug(f"Date filter attempt failed: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"Could not apply date filter: {e}")
    
    async def extract_events_from_page(self) -> List[Dict]:
        """Extract events from current page"""
        events = []
        
        try:
            # Get all event cards
            event_cards = await self.page.query_selector_all('[data-testid="event-card"]')
            
            if not event_cards:
                # Try alternative selectors
                alternative_selectors = [
                    '.event-card',
                    '.event-item',
                    '[data-testid="event-tile"]',
                    '.search-event-card'
                ]
                
                for selector in alternative_selectors:
                    event_cards = await self.page.query_selector_all(selector)
                    if event_cards:
                        break
            
            logger.info(f"Found {len(event_cards)} event cards on page")
            
            for card in event_cards:
                try:
                    # Extract basic info
                    event_data = await self.extract_event_basic_info(card)
                    if not event_data:
                        continue
                    
                    # Extract detailed info by visiting event page
                    event_data = await self.extract_detailed_info(event_data)
                    
                    events.append(event_data)
                    
                    # Respect rate limiting
                    await ScrapingUtils.rate_limit()
                    
                except Exception as e:
                    logger.error(f"Error extracting event from card: {e}")
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error extracting events from page: {e}")
            return events
    
    async def extract_event_basic_info(self, event_element) -> Optional[Dict]:
        """Extract basic event information from Eventbrite event card"""
        try:
            # Eventbrite-specific selectors
            selectors = {
                'title': '[data-testid="event-title"]',
                'date': '[data-testid="event-date"]',
                'location': '[data-testid="event-location"]',
                'url': 'a[href*="/e/"]',
                'description': '[data-testid="event-description"]',
                'price': '[data-testid="event-price"]'
            }
            
            # Try alternative selectors if primary ones don't work
            alternative_selectors = {
                'title': ['.event-title', '.event-name', 'h3', 'h2'],
                'date': ['.event-date', '.event-time', '.date-time'],
                'location': ['.event-location', '.venue-name', '.location'],
                'url': ['a[href*="/e/"]', 'a[href*="eventbrite.com"]'],
                'description': ['.event-description', '.event-summary', '.description'],
                'price': ['.event-price', '.price', '.ticket-price']
            }
            
            # Extract information
            name = await self.extract_text_with_fallback(event_element, selectors['title'], alternative_selectors['title'])
            date_str = await self.extract_text_with_fallback(event_element, selectors['date'], alternative_selectors['date'])
            location = await self.extract_text_with_fallback(event_element, selectors['location'], alternative_selectors['location'])
            description = await self.extract_text_with_fallback(event_element, selectors['description'], alternative_selectors['description'])
            price = await self.extract_text_with_fallback(event_element, selectors['price'], alternative_selectors['price'])
            
            # Extract URL
            url = await self.extract_url_with_fallback(event_element, selectors['url'], alternative_selectors['url'])
            
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
            url = ScrapingUtils.normalize_url(url, "https://www.eventbrite.com")
            
            return {
                'name': name,
                'date': date_obj,
                'location': location,
                'url': url,
                'description': description,
                'price': price,
                'is_hebrew': ScrapingUtils.is_hebrew_text(name)
            }
            
        except Exception as e:
            logger.error(f"Error extracting basic event info: {e}")
            return None
    
    async def extract_text_with_fallback(self, element, primary_selector: str, fallback_selectors: List[str]) -> Optional[str]:
        """Extract text with fallback selectors"""
        try:
            # Try primary selector
            result = await self.extract_text_from_element(element, primary_selector)
            if result:
                return result
            
            # Try fallback selectors
            for selector in fallback_selectors:
                result = await self.extract_text_from_element(element, selector)
                if result:
                    return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error in extract_text_with_fallback: {e}")
            return None
    
    async def extract_url_with_fallback(self, element, primary_selector: str, fallback_selectors: List[str]) -> Optional[str]:
        """Extract URL with fallback selectors"""
        try:
            # Try primary selector
            result = await self.extract_url_from_element(element, primary_selector)
            if result:
                return result
            
            # Try fallback selectors
            for selector in fallback_selectors:
                result = await self.extract_url_from_element(element, selector)
                if result:
                    return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error in extract_url_with_fallback: {e}")
            return None