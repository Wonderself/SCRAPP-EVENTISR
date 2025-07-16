import os
from typing import Dict, List, Optional
from dataclasses import dataclass
from fake_useragent import UserAgent

@dataclass
class ScrapingConfig:
    """Configuration for web scraping operations"""
    
    # Rate limiting
    REQUEST_DELAY: float = 1.0  # Delay between requests in seconds
    MAX_RETRIES: int = 3
    TIMEOUT: int = 30
    
    # Browser settings
    HEADLESS: bool = True
    USER_AGENT: str = UserAgent().random
    
    # Event filtering
    MAX_EVENTS_PER_SOURCE: int = 50  # Max 50 events per source = 250 total
    TARGET_MONTHS: List[int] = [8, 9]  # August, September
    TARGET_YEAR: int = 2025
    
    # Language settings
    HEBREW_KEYWORDS: List[str] = [
        'אירוע', 'פסטיבל', 'קונצרט', 'תערוכה', 'הופעה',
        'מופע', 'סדנה', 'הרצאה', 'מסיבה', 'יריד'
    ]
    
    PUBLIC_EVENT_KEYWORDS: List[str] = [
        'קהל', 'ציבור', 'פתוח', 'כולם', 'חינם', 'בחינם',
        'public', 'open', 'free', 'community', 'festival'
    ]
    
    # Excluded keywords (professional/restricted events)
    EXCLUDED_KEYWORDS: List[str] = [
        'פרטי', 'סגור', 'עובדים', 'מוזמנים בלבד', 'חברים',
        'private', 'closed', 'employees', 'members only', 'staff'
    ]

# Website-specific configurations
SITE_CONFIGS: Dict[str, Dict] = {
    'eventbrite': {
        'base_url': 'https://www.eventbrite.com/d/israel--tel-aviv/events/',
        'search_params': {
            'date': 'Aug 2025',
            'location': 'Israel'
        },
        'selectors': {
            'event_cards': '[data-testid="event-card"]',
            'event_title': '[data-testid="event-title"]',
            'event_date': '[data-testid="event-date"]',
            'event_location': '[data-testid="event-location"]',
            'event_url': 'a[href]',
            'event_description': '[data-testid="event-description"]',
            'organizer_name': '[data-testid="organizer-name"]',
            'organizer_email': '[data-testid="organizer-email"]',
            'next_page': '[data-testid="next-page"]'
        },
        'javascript_required': True
    },
    
    'matkonet': {
        'base_url': 'https://www.matkonet.co.il',
        'search_params': {
            'category': 'events',
            'date': '2025-08'
        },
        'selectors': {
            'event_cards': '.event-item',
            'event_title': '.event-title',
            'event_date': '.event-date',
            'event_location': '.event-location',
            'event_url': 'a[href]',
            'event_description': '.event-description',
            'organizer_name': '.organizer-name',
            'organizer_email': '.contact-email',
            'next_page': '.next-page'
        },
        'javascript_required': True
    },
    
    'getout': {
        'base_url': 'https://www.getout.co.il',
        'search_params': {
            'type': 'events',
            'month': '08-2025'
        },
        'selectors': {
            'event_cards': '.event-card',
            'event_title': '.event-title',
            'event_date': '.event-date',
            'event_location': '.event-location',
            'event_url': 'a[href]',
            'event_description': '.event-description',
            'organizer_name': '.organizer',
            'organizer_email': '.contact',
            'next_page': '.pagination-next'
        },
        'javascript_required': True
    },
    
    'habama': {
        'base_url': 'https://www.habama.co.il',
        'search_params': {
            'events': 'true',
            'date': '2025-08'
        },
        'selectors': {
            'event_cards': '.show-item',
            'event_title': '.show-title',
            'event_date': '.show-date',
            'event_location': '.show-venue',
            'event_url': 'a[href]',
            'event_description': '.show-description',
            'organizer_name': '.organizer-name',
            'organizer_email': '.organizer-email',
            'next_page': '.next'
        },
        'javascript_required': True
    },
    
    'funzing': {
        'base_url': 'https://www.funzing.com',
        'search_params': {
            'location': 'israel',
            'date': 'aug-2025'
        },
        'selectors': {
            'event_cards': '.event-card',
            'event_title': '.event-title',
            'event_date': '.event-date',
            'event_location': '.event-location',
            'event_url': 'a[href]',
            'event_description': '.event-description',
            'organizer_name': '.host-name',
            'organizer_email': '.host-email',
            'next_page': '.next-page'
        },
        'javascript_required': True
    }
}

# Email patterns for extraction
EMAIL_PATTERNS = [
    r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
    r'mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
    r'email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
]

# Contact page patterns
CONTACT_PATTERNS = [
    'contact', 'צור קשר', 'יצירת קשר', 'about', 'info',
    'organizer', 'מארגן', 'מפיק', 'producer'
]