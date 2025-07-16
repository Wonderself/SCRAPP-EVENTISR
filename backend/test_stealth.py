#!/usr/bin/env python3
"""
Test script to work around anti-bot measures
"""
import asyncio
import logging
from playwright.async_api import async_playwright
import random
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_with_stealth():
    """Test with stealth measures"""
    logger.info("Testing with stealth measures...")
    
    try:
        async with async_playwright() as playwright:
            # Use a more realistic browser setup
            browser = await playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            # Set up realistic context
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            page = await context.new_page()
            
            # Add stealth measures
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                
                window.chrome = {
                    runtime: {},
                };
            """)
            
            # Try multiple sites to see which one works
            sites_to_test = [
                ("GetOut", "https://www.getout.co.il"),
                ("Habama", "https://www.habama.co.il"),
                ("Matkonet", "https://www.matkonet.co.il"),
                ("Funzing", "https://www.funzing.com"),
                ("Eventbrite", "https://www.eventbrite.com/d/israel--tel-aviv/events/")
            ]
            
            for site_name, url in sites_to_test:
                logger.info(f"Testing {site_name}: {url}")
                
                try:
                    # Random delay to seem more human
                    await asyncio.sleep(random.uniform(1, 3))
                    
                    await page.goto(url, wait_until='networkidle')
                    await page.wait_for_timeout(3000)  # Wait for page to load
                    
                    # Get page title
                    title = await page.title()
                    logger.info(f"  {site_name} title: {title}")
                    
                    # Check if we hit a captcha or verification page
                    if any(keyword in title.lower() for keyword in ['verification', 'captcha', 'security', 'blocked']):
                        logger.warning(f"  {site_name}: Hit anti-bot measure - {title}")
                    else:
                        logger.info(f"  {site_name}: Successfully loaded page")
                        
                        # Try to find any events or content
                        content = await page.content()
                        
                        # Look for event-related keywords
                        event_indicators = ['event', 'אירוע', 'concert', 'קונצרט', 'festival', 'פסטיבל']
                        found_keywords = []
                        for keyword in event_indicators:
                            if keyword in content.lower():
                                found_keywords.append(keyword)
                        
                        logger.info(f"  {site_name}: Found event keywords: {found_keywords}")
                        
                        # Try to find links that might be events
                        links = await page.query_selector_all("a[href]")
                        logger.info(f"  {site_name}: Found {len(links)} links total")
                        
                        # Sample some link text
                        sample_links = []
                        for link in links[:10]:  # Sample first 10 links
                            text = await link.text_content()
                            href = await link.get_attribute('href')
                            if text and text.strip():
                                sample_links.append(f"{text.strip()[:50]}... -> {href}")
                        
                        logger.info(f"  {site_name}: Sample links:")
                        for link in sample_links[:5]:
                            logger.info(f"    {link}")
                    
                except Exception as e:
                    logger.error(f"  {site_name}: Error - {e}")
                    
                logger.info(f"  {site_name}: Test completed\n")
            
            await browser.close()
            return True
            
    except Exception as e:
        logger.error(f"Error in stealth test: {e}")
        return False

async def main():
    """Main test function"""
    logger.info("Starting stealth scraping test...")
    
    success = await test_with_stealth()
    
    if success:
        logger.info("✅ Stealth test completed!")
    else:
        logger.error("❌ Stealth test failed!")
    
    return success

if __name__ == "__main__":
    asyncio.run(main())