import re
import asyncio
import aiohttp
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse
from langdetect import detect
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, Browser
import logging
from scraping_config import ScrapingConfig, EMAIL_PATTERNS, CONTACT_PATTERNS

logger = logging.getLogger(__name__)

class ScrapingUtils:
    """Utility functions for web scraping operations"""
    
    @staticmethod
    def is_hebrew_text(text: str) -> bool:
        """Check if text contains Hebrew characters"""
        hebrew_pattern = re.compile(r'[\u0590-\u05FF]')
        return bool(hebrew_pattern.search(text))
    
    @staticmethod
    def detect_language(text: str) -> str:
        """Detect language of the text"""
        try:
            return detect(text)
        except:
            return 'unknown'
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove HTML entities
        text = re.sub(r'&[a-zA-Z0-9#]+;', ' ', text)
        
        # Remove special characters but keep Hebrew, English, numbers
        text = re.sub(r'[^\u0590-\u05FF\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\-.,!?()]', '', text)
        
        return text.strip()
    
    @staticmethod
    def extract_emails(text: str) -> List[str]:
        """Extract email addresses from text"""
        emails = []
        for pattern in EMAIL_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            emails.extend(matches)
        
        # Clean and deduplicate
        emails = list(set([email.lower().strip() for email in emails if email]))
        return emails
    
    @staticmethod
    def parse_date(date_str: str) -> Optional[datetime]:
        """Parse date string to datetime object"""
        if not date_str:
            return None
        
        # Common date formats
        date_formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%Y-%m-%d',
            '%d/%m/%Y %H:%M',
            '%d/%m/%Y',
            '%d-%m-%Y %H:%M',
            '%d-%m-%Y',
            '%B %d, %Y',
            '%b %d, %Y',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%S.%f'
        ]
        
        # Clean date string
        date_str = ScrapingUtils.clean_text(date_str)
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        logger.warning(f"Unable to parse date: {date_str}")
        return None
    
    @staticmethod
    def is_public_event(title: str, description: str = "") -> bool:
        """Check if event is public (not private/restricted)"""
        from scraping_config import ScrapingConfig
        
        text = f"{title} {description}".lower()
        
        # Check for excluded keywords
        for keyword in ScrapingConfig.EXCLUDED_KEYWORDS:
            if keyword.lower() in text:
                return False
        
        # Check for public keywords
        for keyword in ScrapingConfig.PUBLIC_EVENT_KEYWORDS:
            if keyword.lower() in text:
                return True
        
        # Default to public if no clear indicators
        return True
    
    @staticmethod
    def calculate_importance(event_data: Dict) -> str:
        """Calculate event importance based on various factors"""
        importance_score = 0
        
        # Festival/concert keywords = high importance
        high_importance_keywords = [
            'festival', 'פסטיבל', 'concert', 'קונצרט',
            'exhibition', 'תערוכה', 'show', 'הופעה'
        ]
        
        # Community/workshop keywords = medium importance
        medium_importance_keywords = [
            'workshop', 'סדנה', 'lecture', 'הרצאה',
            'community', 'קהילה', 'market', 'שוק'
        ]
        
        title = event_data.get('name', '').lower()
        description = event_data.get('description', '').lower()
        text = f"{title} {description}"
        
        # Check for high importance keywords
        for keyword in high_importance_keywords:
            if keyword in text:
                importance_score += 3
                break
        
        # Check for medium importance keywords
        for keyword in medium_importance_keywords:
            if keyword in text:
                importance_score += 2
                break
        
        # Check for price (free events get bonus)
        price = event_data.get('price', '').lower()
        if any(word in price for word in ['free', 'חינם', 'בחינם']):
            importance_score += 1
        
        # Check for organizer email (organized events get bonus)
        if event_data.get('organizer_email'):
            importance_score += 1
        
        # Determine importance level
        if importance_score >= 4:
            return 'high'
        elif importance_score >= 2:
            return 'medium'
        else:
            return 'low'
    
    @staticmethod
    def is_target_date(date_obj: datetime) -> bool:
        """Check if date is in target months (August/September 2025)"""
        if not date_obj:
            return False
        
        return (date_obj.year == ScrapingConfig.TARGET_YEAR and 
                date_obj.month in ScrapingConfig.TARGET_MONTHS)
    
    @staticmethod
    def normalize_url(url: str, base_url: str) -> str:
        """Normalize and complete URL"""
        if not url:
            return ""
        
        # If already absolute URL
        if url.startswith(('http://', 'https://')):
            return url
        
        # If relative URL, join with base URL
        return urljoin(base_url, url)
    
    @staticmethod
    async def get_page_content(session: aiohttp.ClientSession, url: str) -> Optional[str]:
        """Get page content using aiohttp"""
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=ScrapingConfig.TIMEOUT)) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"HTTP {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    @staticmethod
    async def find_contact_page(page: Page, base_url: str) -> Optional[str]:
        """Find contact page URL"""
        try:
            # Look for contact links
            for pattern in CONTACT_PATTERNS:
                contact_links = await page.query_selector_all(f'a[href*="{pattern}"]')
                if contact_links:
                    href = await contact_links[0].get_attribute('href')
                    if href:
                        return ScrapingUtils.normalize_url(href, base_url)
        except Exception as e:
            logger.error(f"Error finding contact page: {e}")
        
        return None
    
    @staticmethod
    async def extract_contact_info(page: Page, event_url: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract contact information from event page"""
        try:
            # First try to find email and organizer on current page
            page_content = await page.content()
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # Extract emails
            emails = ScrapingUtils.extract_emails(page_content)
            email = emails[0] if emails else None
            
            # Extract organizer name
            organizer_patterns = [
                'organizer', 'מארגן', 'מפיק', 'producer',
                'host', 'מנחה', 'contact', 'צור קשר'
            ]
            
            organizer = None
            for pattern in organizer_patterns:
                elements = soup.find_all(text=re.compile(pattern, re.IGNORECASE))
                if elements:
                    # Try to find name near the pattern
                    for element in elements:
                        parent = element.parent
                        if parent:
                            text = parent.get_text()
                            # Simple name extraction logic
                            words = text.split()
                            for i, word in enumerate(words):
                                if pattern.lower() in word.lower():
                                    if i + 1 < len(words):
                                        organizer = words[i + 1]
                                        break
                            if organizer:
                                break
                    if organizer:
                        break
            
            # If no contact info found, try contact page
            if not email or not organizer:
                contact_url = await ScrapingUtils.find_contact_page(page, event_url)
                if contact_url:
                    try:
                        await page.goto(contact_url)
                        await page.wait_for_load_state('networkidle')
                        
                        contact_content = await page.content()
                        if not emails:
                            emails = ScrapingUtils.extract_emails(contact_content)
                            email = emails[0] if emails else email
                        
                        if not organizer:
                            # Try to extract organizer from contact page
                            contact_soup = BeautifulSoup(contact_content, 'html.parser')
                            for pattern in organizer_patterns:
                                elements = contact_soup.find_all(text=re.compile(pattern, re.IGNORECASE))
                                if elements:
                                    # Similar extraction logic
                                    for element in elements:
                                        parent = element.parent
                                        if parent:
                                            text = parent.get_text()
                                            words = text.split()
                                            for i, word in enumerate(words):
                                                if pattern.lower() in word.lower():
                                                    if i + 1 < len(words):
                                                        organizer = words[i + 1]
                                                        break
                                            if organizer:
                                                break
                                    if organizer:
                                        break
                    except Exception as e:
                        logger.error(f"Error accessing contact page {contact_url}: {e}")
            
            return email, organizer
            
        except Exception as e:
            logger.error(f"Error extracting contact info from {event_url}: {e}")
            return None, None
    
    @staticmethod
    async def rate_limit():
        """Apply rate limiting delay"""
        await asyncio.sleep(ScrapingConfig.REQUEST_DELAY)