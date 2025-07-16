from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime
import csv
import json
import io
from models import Event, EventCreate, EventSource, ScrapingJob, ScrapingJobCreate
from scraping_service import EventScrapingService
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

def create_event_router(db: AsyncIOMotorDatabase) -> APIRouter:
    """Create event routes with database dependency"""
    router = APIRouter(prefix="/events", tags=["events"])
    scraping_service = EventScrapingService(db)
    
    @router.post("/scrape/all")
    async def scrape_all_events(background_tasks: BackgroundTasks):
        """Scrape events from all sources"""
        try:
            # Start scraping in background
            background_tasks.add_task(scraping_service.scrape_all_sources)
            
            return {
                "message": "Started scraping from all sources",
                "sources": [source.value for source in EventSource]
            }
            
        except Exception as e:
            logger.error(f"Error starting scraping from all sources: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/scrape/{source}")
    async def scrape_events_from_source(
        source: EventSource,
        background_tasks: BackgroundTasks
    ):
        """Scrape events from a specific source"""
        try:
            # Create scraping job
            job_create = ScrapingJobCreate(source=source)
            job = await scraping_service.create_scraping_job(job_create)
            
            # Start scraping in background
            background_tasks.add_task(
                scraping_service.scrape_events_from_source,
                source,
                job.id
            )
            
            return {
                "message": f"Started scraping from {source}",
                "job_id": job.id
            }
            
        except Exception as e:
            logger.error(f"Error starting scraping from {source}: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/", response_model=List[Event])
    async def get_events(
        source: Optional[EventSource] = None,
        limit: int = Query(default=100, ge=1, le=1000),
        importance: Optional[str] = Query(None, regex="^(high|medium|low)$"),
        is_hebrew: Optional[bool] = None
    ):
        """Get events with filtering options"""
        try:
            events = await scraping_service.get_events(source=source, limit=limit)
            
            # Apply additional filters
            if importance:
                events = [event for event in events if event.importance == importance]
            
            if is_hebrew is not None:
                events = [event for event in events if event.is_hebrew == is_hebrew]
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting events: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/top/{limit}")
    async def get_top_events(limit: int):
        """Get top events by importance"""
        try:
            # Validate limit
            if limit < 1 or limit > 1000:
                raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")
            
            events = await scraping_service.get_top_events(limit=limit)
            return events
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting top events: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/search")
    async def search_events(
        q: str = Query(..., min_length=2),
        limit: int = Query(default=50, ge=1, le=100)
    ):
        """Search events by name, description, or location"""
        try:
            events = await scraping_service.search_events(query=q, limit=limit)
            return events
            
        except Exception as e:
            logger.error(f"Error searching events: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/date-range")
    async def get_events_by_date_range(
        start_date: datetime,
        end_date: datetime
    ):
        """Get events within a date range"""
        try:
            events = await scraping_service.get_events_by_date_range(start_date, end_date)
            return events
            
        except Exception as e:
            logger.error(f"Error getting events by date range: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/stats")
    async def get_event_stats():
        """Get event statistics"""
        try:
            stats = await scraping_service.get_event_stats()
            return stats
            
        except Exception as e:
            logger.error(f"Error getting event stats: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/export/csv")
    async def export_events_csv(
        source: Optional[EventSource] = None,
        limit: int = Query(default=250, ge=1, le=1000)
    ):
        """Export events to CSV"""
        try:
            events = await scraping_service.get_events(source=source, limit=limit)
            
            # Create CSV content
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Name', 'Date', 'Location', 'URL', 'Description', 
                'Organizer Email', 'Organizer Name', 'Source', 'Importance',
                'Is Hebrew', 'Price', 'Phone'
            ])
            
            # Write data
            for event in events:
                writer.writerow([
                    event.name,
                    event.date.isoformat(),
                    event.location,
                    event.url,
                    event.description or '',
                    event.organizer_email or '',
                    event.organizer_name or '',
                    event.source,
                    event.importance,
                    event.is_hebrew,
                    event.price or '',
                    event.phone or ''
                ])
            
            # Create response
            output.seek(0)
            
            return StreamingResponse(
                io.BytesIO(output.getvalue().encode('utf-8')),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=events_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
            
        except Exception as e:
            logger.error(f"Error exporting events to CSV: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/export/json")
    async def export_events_json(
        source: Optional[EventSource] = None,
        limit: int = Query(default=250, ge=1, le=1000)
    ):
        """Export events to JSON"""
        try:
            events = await scraping_service.get_events(source=source, limit=limit)
            
            # Convert to JSON-serializable format
            events_data = []
            for event in events:
                event_dict = event.dict()
                # Convert datetime to ISO string
                event_dict['date'] = event.date.isoformat()
                event_dict['created_at'] = event.created_at.isoformat()
                event_dict['updated_at'] = event.updated_at.isoformat()
                event_dict['scraped_at'] = event.scraped_at.isoformat()
                events_data.append(event_dict)
            
            # Create JSON content
            json_content = json.dumps(events_data, indent=2, ensure_ascii=False)
            
            return StreamingResponse(
                io.BytesIO(json_content.encode('utf-8')),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=events_{datetime.now().strftime('%Y%m%d')}.json"}
            )
            
        except Exception as e:
            logger.error(f"Error exporting events to JSON: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Scraping job routes
    @router.get("/jobs", response_model=List[ScrapingJob])
    async def get_scraping_jobs():
        """Get all scraping jobs"""
        try:
            jobs = await scraping_service.get_scraping_jobs()
            return jobs
            
        except Exception as e:
            logger.error(f"Error getting scraping jobs: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/jobs/{job_id}", response_model=ScrapingJob)
    async def get_scraping_job(job_id: str):
        """Get a specific scraping job"""
        try:
            job = await scraping_service.get_scraping_job(job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            return job
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting scraping job: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.delete("/cleanup")
    async def cleanup_old_events(days_old: int = Query(default=30, ge=1)):
        """Delete events older than specified days"""
        try:
            deleted_count = await scraping_service.delete_old_events(days_old)
            return {"message": f"Deleted {deleted_count} old events"}
            
        except Exception as e:
            logger.error(f"Error cleaning up old events: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    return router