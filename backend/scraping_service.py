import asyncio
import logging
from typing import List, Dict, Optional
from datetime import datetime
from models import Event, EventCreate, EventSource, ScrapingJob, ScrapingJobCreate, ScrapingJobUpdate
from scrapers import EventbriteScraper, MatkonetScraper, GetoutScraper, HabamaScraper, FunzingScraper
from motor.motor_asyncio import AsyncIOMotorDatabase
import traceback

logger = logging.getLogger(__name__)

class EventScrapingService:
    """Service to manage event scraping operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.scrapers = {
            EventSource.EVENTBRITE: EventbriteScraper,
            EventSource.MATKONET: MatkonetScraper,
            EventSource.GETOUT: GetoutScraper,
            EventSource.HABAMA: HabamaScraper,
            EventSource.FUNZING: FunzingScraper
        }
    
    async def scrape_events_from_source(self, source: EventSource, job_id: str) -> List[Event]:
        """Scrape events from a specific source"""
        events = []
        
        try:
            # Update job status
            await self.update_job_status(job_id, "running", started_at=datetime.utcnow())
            
            # Get scraper class
            scraper_class = self.scrapers.get(source)
            if not scraper_class:
                raise ValueError(f"No scraper available for source: {source}")
            
            # Run scraper
            async with scraper_class() as scraper:
                logger.info(f"Starting scraping from {source}")
                
                # Scrape events
                event_creates = await scraper.scrape_all_events()
                
                # Convert to Event objects and store in database
                for event_create in event_creates:
                    try:
                        # Check if event already exists
                        existing_event = await self.db.events.find_one({"url": event_create.url})
                        if existing_event:
                            logger.debug(f"Event already exists: {event_create.url}")
                            continue
                        
                        # Create Event object
                        event = Event(**event_create.dict())
                        
                        # Store in database
                        await self.db.events.insert_one(event.dict())
                        events.append(event)
                        
                        logger.info(f"Stored event: {event.name}")
                        
                    except Exception as e:
                        logger.error(f"Error storing event: {e}")
                        await self.add_job_error(job_id, f"Error storing event: {e}")
                        continue
                
                # Handle scraper errors
                scraper_errors = scraper.get_errors()
                if scraper_errors:
                    for error in scraper_errors:
                        await self.add_job_error(job_id, error)
                
                # Update job statistics
                await self.update_job_stats(job_id, len(event_creates), len(events), len(event_creates) - len(events))
                
                logger.info(f"Completed scraping from {source}. Found {len(events)} new events.")
                
        except Exception as e:
            error_msg = f"Error scraping from {source}: {e}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            
            await self.add_job_error(job_id, error_msg)
            await self.update_job_status(job_id, "failed", completed_at=datetime.utcnow())
            
        return events
    
    async def scrape_all_sources(self) -> Dict[str, List[Event]]:
        """Scrape events from all sources"""
        all_events = {}
        jobs = []
        
        try:
            # Create scraping jobs for each source
            for source in EventSource:
                job_create = ScrapingJobCreate(source=source)
                job = await self.create_scraping_job(job_create)
                jobs.append((source, job.id))
            
            # Run scrapers concurrently (but with rate limiting)
            semaphore = asyncio.Semaphore(2)  # Max 2 concurrent scrapers
            
            async def scrape_with_semaphore(source: EventSource, job_id: str):
                async with semaphore:
                    return await self.scrape_events_from_source(source, job_id)
            
            # Execute all scraping tasks
            tasks = [scrape_with_semaphore(source, job_id) for source, job_id in jobs]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for (source, job_id), result in zip(jobs, results):
                if isinstance(result, Exception):
                    logger.error(f"Error scraping {source}: {result}")
                    await self.add_job_error(job_id, f"Scraping failed: {result}")
                    await self.update_job_status(job_id, "failed", completed_at=datetime.utcnow())
                    all_events[source.value] = []
                else:
                    all_events[source.value] = result
                    await self.update_job_status(job_id, "completed", completed_at=datetime.utcnow())
            
            # Get top 250 events across all sources
            top_events = await self.get_top_events(250)
            
            logger.info(f"Scraping completed. Total events across all sources: {sum(len(events) for events in all_events.values())}")
            
            return all_events
            
        except Exception as e:
            logger.error(f"Error in scrape_all_sources: {e}")
            logger.error(traceback.format_exc())
            return {}
    
    async def create_scraping_job(self, job_create: ScrapingJobCreate) -> ScrapingJob:
        """Create a new scraping job"""
        job = ScrapingJob(**job_create.dict())
        await self.db.scraping_jobs.insert_one(job.dict())
        return job
    
    async def update_job_status(self, job_id: str, status: str, started_at: Optional[datetime] = None, completed_at: Optional[datetime] = None):
        """Update job status"""
        update_data = {"status": status}
        if started_at:
            update_data["started_at"] = started_at
        if completed_at:
            update_data["completed_at"] = completed_at
        
        await self.db.scraping_jobs.update_one(
            {"id": job_id},
            {"$set": update_data}
        )
    
    async def update_job_stats(self, job_id: str, total_events: int, successful_events: int, failed_events: int):
        """Update job statistics"""
        await self.db.scraping_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "total_events": total_events,
                "successful_events": successful_events,
                "failed_events": failed_events
            }}
        )
    
    async def add_job_error(self, job_id: str, error_message: str):
        """Add error to job"""
        await self.db.scraping_jobs.update_one(
            {"id": job_id},
            {"$push": {"errors": error_message}}
        )
    
    async def get_scraping_jobs(self) -> List[ScrapingJob]:
        """Get all scraping jobs"""
        jobs = await self.db.scraping_jobs.find().to_list(1000)
        return [ScrapingJob(**job) for job in jobs]
    
    async def get_scraping_job(self, job_id: str) -> Optional[ScrapingJob]:
        """Get a specific scraping job"""
        job = await self.db.scraping_jobs.find_one({"id": job_id})
        return ScrapingJob(**job) if job else None
    
    async def get_events(self, source: Optional[EventSource] = None, limit: int = 100) -> List[Event]:
        """Get events from database"""
        query = {}
        if source:
            query["source"] = source.value
        
        events = await self.db.events.find(query).limit(limit).to_list(limit)
        return [Event(**event) for event in events]
    
    async def get_top_events(self, limit: int = 250) -> List[Event]:
        """Get top events by importance and date"""
        # Sort by importance (high first) and then by date
        events = await self.db.events.find().sort([
            ("importance", -1),  # High importance first
            ("date", 1)  # Earlier dates first
        ]).limit(limit).to_list(limit)
        
        return [Event(**event) for event in events]
    
    async def get_events_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Event]:
        """Get events within a date range"""
        query = {
            "date": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        
        events = await self.db.events.find(query).sort([
            ("importance", -1),
            ("date", 1)
        ]).to_list(1000)
        
        return [Event(**event) for event in events]
    
    async def search_events(self, query: str, limit: int = 50) -> List[Event]:
        """Search events by name or description"""
        search_query = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"location": {"$regex": query, "$options": "i"}}
            ]
        }
        
        events = await self.db.events.find(search_query).limit(limit).to_list(limit)
        return [Event(**event) for event in events]
    
    async def delete_old_events(self, days_old: int = 30):
        """Delete events older than specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        result = await self.db.events.delete_many({"created_at": {"$lt": cutoff_date}})
        logger.info(f"Deleted {result.deleted_count} old events")
        return result.deleted_count
    
    async def get_event_stats(self) -> Dict:
        """Get event statistics"""
        total_events = await self.db.events.count_documents({})
        
        # Count by source
        source_counts = {}
        for source in EventSource:
            count = await self.db.events.count_documents({"source": source.value})
            source_counts[source.value] = count
        
        # Count by importance
        importance_counts = {}
        for importance in ["high", "medium", "low"]:
            count = await self.db.events.count_documents({"importance": importance})
            importance_counts[importance] = count
        
        # Count by language
        hebrew_count = await self.db.events.count_documents({"is_hebrew": True})
        english_count = await self.db.events.count_documents({"is_hebrew": False})
        
        return {
            "total_events": total_events,
            "by_source": source_counts,
            "by_importance": importance_counts,
            "by_language": {
                "hebrew": hebrew_count,
                "english": english_count
            }
        }