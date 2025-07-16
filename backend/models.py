from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid
from enum import Enum

class EventStatus(str, Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"
    COMPLETED = "completed"

class EventSource(str, Enum):
    EVENTBRITE = "eventbrite"
    MATKONET = "matkonet"
    GETOUT = "getout"
    HABAMA = "habama"
    FUNZING = "funzing"

class EventImportance(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., description="Event name in original language")
    name_english: Optional[str] = Field(None, description="Event name translated to English")
    date: datetime = Field(..., description="Event date and time")
    location: str = Field(..., description="Event location")
    url: str = Field(..., description="Full URL of the event")
    description: Optional[str] = Field(None, description="Brief description (1 sentence max)")
    organizer_email: Optional[str] = Field(None, description="Email of the organizer")
    organizer_name: Optional[str] = Field(None, description="Name of the organizer")
    source: EventSource = Field(..., description="Source website")
    status: EventStatus = Field(default=EventStatus.ACTIVE, description="Event status")
    importance: EventImportance = Field(default=EventImportance.MEDIUM, description="Event importance")
    is_hebrew: bool = Field(default=False, description="Whether event is in Hebrew")
    tags: List[str] = Field(default_factory=list, description="Event tags/categories")
    price: Optional[str] = Field(None, description="Event price information")
    phone: Optional[str] = Field(None, description="Contact phone number")
    image_url: Optional[str] = Field(None, description="Event image URL")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('date')
    def validate_date(cls, v):
        """Ensure date is in August or September 2025"""
        if v.year != 2025:
            raise ValueError('Event must be in 2025')
        if v.month not in [8, 9]:  # August = 8, September = 9
            raise ValueError('Event must be in August or September 2025')
        return v

    @validator('url')
    def validate_url(cls, v):
        """Basic URL validation"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v

class EventCreate(BaseModel):
    name: str
    name_english: Optional[str] = None
    date: datetime
    location: str
    url: str
    description: Optional[str] = None
    organizer_email: Optional[str] = None
    organizer_name: Optional[str] = None
    source: EventSource
    status: EventStatus = EventStatus.ACTIVE
    importance: EventImportance = EventImportance.MEDIUM
    is_hebrew: bool = False
    tags: List[str] = []
    price: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    name_english: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    organizer_email: Optional[str] = None
    organizer_name: Optional[str] = None
    status: Optional[EventStatus] = None
    importance: Optional[EventImportance] = None
    is_hebrew: Optional[bool] = None
    tags: Optional[List[str]] = None
    price: Optional[str] = None
    phone: Optional[str] = None
    image_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ScrapingJob(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source: EventSource
    status: str = Field(default="pending")  # pending, running, completed, failed
    total_events: int = Field(default=0)
    successful_events: int = Field(default=0)
    failed_events: int = Field(default=0)
    errors: List[str] = Field(default_factory=list)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ScrapingJobCreate(BaseModel):
    source: EventSource

class ScrapingJobUpdate(BaseModel):
    status: Optional[str] = None
    total_events: Optional[int] = None
    successful_events: Optional[int] = None
    failed_events: Optional[int] = None
    errors: Optional[List[str]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None