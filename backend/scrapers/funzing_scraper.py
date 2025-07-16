import logging
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
from models import EventSource
from base_scraper import BaseScraper
from scraping_utils import ScrapingUtils
from scraping_config import ScrapingConfig

logger = logging.getLogger(__name__)

class FunzingScraper(BaseScraper):
    """Funzing event scraper"""
    
    def __init__(self):
        super().__init__(EventSource.FUNZING)
    
    async def scrape_events(self) -> List[Dict]:
        """Scrape events from Funzing"""
        events = []
        
        try:
            # Navigate to Funzing events page
            if not await self.navigate_to_events_page():
                return events
            
            # Handle site navigation
            await self.navigate_to_events_section()
            
            # Apply location and date filters
            await self.apply_location_filter()
            await self.apply_date_filter()
            
            page_count = 0
            max_pages = 10  # Limit to prevent infinite loops
            
            while page_count < max_pages:
                logger.info(f"Scraping Funzing page {page_count + 1}")
                
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
            
            logger.info(f"Found {len(events)} events on Funzing")
            return events
            
        except Exception as e:
            error_msg = f"Error scraping Funzing: {e}"
            logger.error(error_msg)
            self.errors.append(error_msg)
            return events
    
    async def navigate_to_events_section(self):
        """Navigate to events section on Funzing"""
        try:
            # Look for events navigation links
            events_links = [
                'a[href*="event"]',
                'a[href*="experience"]',
                'text="Events"',
                'text="Experiences"',
                '.menu-events',
                '.events-link'
            ]
            
            for link_selector in events_links:
                try:
                    link = await self.page.query_selector(link_selector)
                    if link:
                        await link.click()
                        await self.page.wait_for_load_state('networkidle')
                        await self.page.wait_for_timeout(2000)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"Could not navigate to events section: {e}")
    
    async def apply_location_filter(self):
        """Apply location filter for Israel"""
        try:
            # Look for location filter elements
            location_selectors = [
                '[data-filter="location"]',
                '.location-filter',
                'select[name*="location"]',
                'select[name*="city"]',
                '.filter-location',
                '.location-picker'
            ]
            
            for selector in location_selectors:
                try:
                    location_element = await self.page.query_selector(selector)
                    if location_element:
                        await location_element.click()
                        await self.page.wait_for_timeout(1000)
                        
                        # Try to select Israel
                        israel_options = [
                            '[value="israel"]',
                            '[value="Israel"]',
                            'text="Israel"',
                            'text="Tel Aviv"'
                        ]
                        
                        for option_selector in israel_options:
                            try:
                                option = await self.page.query_selector(option_selector)
                                if option:
                                    await option.click()
                                    await self.page.wait_for_timeout(1000)
                                    break
                            except:
                                continue
                        
                        break
                        
                except Exception as e:
                    logger.debug(f"Location filter attempt failed: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"Could not apply location filter: {e}")
    
    async def apply_date_filter(self):
        """Apply date filter for August/September 2025"""
        try:
            # Look for date filter elements
            date_selectors = [
                '[data-filter="date"]',
                '.date-filter',
                'select[name*="date"]',
                'select[name*="month"]',
                '.filter-date',
                '.date-picker'
            ]
            
            for selector in date_selectors:
                try:
                    date_element = await self.page.query_selector(selector)
                    if date_element:
                        await date_element.click()
                        await self.page.wait_for_timeout(1000)
                        
                        # Try to select August 2025
                        month_options = [
                            '[value="2025-08"]',
                            '[value="aug-2025"]',
                            'text="August 2025"',
                            'text="Aug 2025"'
                        ]
                        
                        for option_selector in month_options:
                            try:
                                option = await self.page.query_selector(option_selector)
                                if option:
                                    await option.click()
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
            event_cards = await self.page.query_selector_all('.event-card')
            
            if not event_cards:
                # Try alternative selectors
                alternative_selectors = [
                    '.experience-card',
                    '.event-item',
                    '.event',
                    '.activity',
                    '.listing-item',
                    '.card'
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
        """Extract basic event information from Funzing event card"""
        try:
            # Funzing-specific selectors
            selectors = {
                'title': ['.event-title', '.title', 'h3', 'h2', '.name', '.experience-title'],
                'date': ['.event-date', '.date', '.time', '.when', '.datetime'],
                'location': ['.event-location', '.location', '.where', '.venue', '.address'],
                'url': ['a[href]'],
                'description': ['.event-description', '.description', '.summary', '.excerpt'],
                'price': ['.event-price', '.price', '.cost', '.ticket-price'],
                'host': ['.host-name', '.organizer', '.teacher', '.guide']
            }
            
            # Extract information
            name = await self.extract_text_with_fallback(event_element, selectors['title'])
            date_str = await self.extract_text_with_fallback(event_element, selectors['date'])
            location = await self.extract_text_with_fallback(event_element, selectors['location'])
            description = await self.extract_text_with_fallback(event_element, selectors['description'])
            price = await self.extract_text_with_fallback(event_element, selectors['price'])
            host = await self.extract_text_with_fallback(event_element, selectors['host'])
            
            # Extract URL
            url = await self.extract_url_with_fallback(event_element, selectors['url'])
            
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
            url = ScrapingUtils.normalize_url(url, "https://www.funzing.com")
            host = ScrapingUtils.clean_text(host) if host else None
            
            return {
                'name': name,
                'date': date_obj,
                'location': location,
                'url': url,
                'description': description,
                'price': price,
                'organizer_name': host,
                'is_hebrew': ScrapingUtils.is_hebrew_text(name)
            }
            
        except Exception as e:
            logger.error(f"Error extracting basic event info: {e}")
            return None
    
    async def extract_text_with_fallback(self, element, selectors: List[str]) -> Optional[str]:
        """Extract text with fallback selectors"""
        try:
            for selector in selectors:
                result = await self.extract_text_from_element(element, selector)
                if result:
                    return result
            return None
            
        except Exception as e:
            logger.error(f"Error in extract_text_with_fallback: {e}")
            return None
    
    async def extract_url_with_fallback(self, element, selectors: List[str]) -> Optional[str]:
        """Extract URL with fallback selectors"""
        try:
            for selector in selectors:
                result = await self.extract_url_from_element(element, selector)
                if result:
                    return result
            return None
            
        except Exception as e:
            logger.error(f"Error in extract_url_with_fallback: {e}")
            return None