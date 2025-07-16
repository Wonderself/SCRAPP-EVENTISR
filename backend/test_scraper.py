#!/usr/bin/env python3
"""
Test script to verify scraping functionality works
"""
import asyncio
import logging
from scrapers.eventbrite_scraper import EventbriteScraper
from models import EventSource

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_eventbrite_scraper():
    """Test the Eventbrite scraper"""
    logger.info("Testing Eventbrite scraper...")
    
    try:
        async with EventbriteScraper() as scraper:
            # Test basic navigation
            if await scraper.navigate_to_events_page():
                logger.info("✅ Successfully navigated to Eventbrite events page")
                
                # Test event extraction
                events = await scraper.scrape_events()
                logger.info(f"✅ Scraped {len(events)} events from Eventbrite")
                
                # Show sample events
                for i, event in enumerate(events[:3]):
                    logger.info(f"  Event {i+1}: {event.get('name', 'N/A')} - {event.get('date', 'N/A')}")
                
                return True
            else:
                logger.error("❌ Failed to navigate to Eventbrite events page")
                return False
                
    except Exception as e:
        logger.error(f"❌ Error testing Eventbrite scraper: {e}")
        return False

async def main():
    """Main test function"""
    logger.info("Starting scraper tests...")
    
    success = await test_eventbrite_scraper()
    
    if success:
        logger.info("✅ Scraper test completed successfully!")
    else:
        logger.error("❌ Scraper test failed!")
    
    return success

if __name__ == "__main__":
    asyncio.run(main())