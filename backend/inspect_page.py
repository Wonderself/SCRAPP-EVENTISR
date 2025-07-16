#!/usr/bin/env python3
"""
Test script to inspect the actual Eventbrite page structure
"""
import asyncio
import logging
from playwright.async_api import async_playwright

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def inspect_eventbrite_page():
    """Inspect the actual Eventbrite page structure"""
    logger.info("Inspecting Eventbrite page structure...")
    
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Navigate to Eventbrite Israel events
            await page.goto("https://www.eventbrite.com/d/israel--tel-aviv/events/")
            await page.wait_for_timeout(5000)  # Wait for page to load
            
            # Get page title
            title = await page.title()
            logger.info(f"Page title: {title}")
            
            # Try to find event cards with various selectors
            selectors_to_try = [
                "[data-testid='event-card']",
                ".event-card",
                ".search-result-card",
                "[data-testid='event-tile']",
                ".event-listing-card",
                "[data-testid='search-result-card']",
                ".event-item",
                ".listing-card"
            ]
            
            for selector in selectors_to_try:
                try:
                    elements = await page.query_selector_all(selector)
                    logger.info(f"Selector '{selector}': Found {len(elements)} elements")
                    
                    if elements:
                        # Try to get text from first element
                        first_element = elements[0]
                        text = await first_element.text_content()
                        logger.info(f"  First element text: {text[:100]}...")
                        break
                        
                except Exception as e:
                    logger.debug(f"  Error with selector '{selector}': {e}")
            
            # Get page content sample
            content = await page.content()
            logger.info(f"Page content length: {len(content)} characters")
            
            # Look for event-related keywords in the HTML
            event_keywords = ["event", "title", "date", "location", "venue"]
            for keyword in event_keywords:
                if keyword in content.lower():
                    logger.info(f"Found keyword '{keyword}' in page content")
            
            # Try to find any links that might be events
            links = await page.query_selector_all("a[href*='/e/']")
            logger.info(f"Found {len(links)} links that might be events (/e/ pattern)")
            
            # Try alternative pattern
            links2 = await page.query_selector_all("a[href*='event']")
            logger.info(f"Found {len(links2)} links with 'event' in href")
            
            await browser.close()
            
            return True
            
    except Exception as e:
        logger.error(f"Error inspecting Eventbrite page: {e}")
        return False

async def main():
    """Main inspection function"""
    logger.info("Starting page inspection...")
    
    success = await inspect_eventbrite_page()
    
    if success:
        logger.info("✅ Page inspection completed!")
    else:
        logger.error("❌ Page inspection failed!")
    
    return success

if __name__ == "__main__":
    asyncio.run(main())