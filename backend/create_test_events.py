#!/usr/bin/env python3
"""
Scraper robuste pour tester réellement avec des données
"""
import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict
from models import Event, EventCreate, EventSource, EventImportance
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()

async def create_test_events():
    """Créer des événements de test réalistes pour August-Sept 2025"""
    
    # Se connecter à MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Événements de test réalistes pour août-septembre 2025
    test_events = [
        {
            "name": "פסטיבל תל אביב לאמנות רחוב 2025",
            "name_english": "Tel Aviv Street Art Festival 2025",
            "date": datetime(2025, 8, 15, 19, 0),
            "location": "רחוב רוטשילד, תל אביב",
            "url": "https://www.eventbrite.com/e/tel-aviv-street-art-festival-2025-tickets-123456789",
            "description": "פסטיבל אמנות רחוב מרהיב בלב תל אביב עם אמנים מהארץ והעולם",
            "organizer_email": "info@streetartfestival.co.il",
            "organizer_name": "דנה כהן",
            "source": EventSource.EVENTBRITE,
            "importance": EventImportance.HIGH,
            "is_hebrew": True,
            "tags": ["אמנות", "פסטיבל", "רחוב"],
            "price": "כניסה חופשית",
            "phone": "03-1234567"
        },
        {
            "name": "Summer Jazz Concert Series",
            "name_english": "Summer Jazz Concert Series",
            "date": datetime(2025, 8, 22, 20, 30),
            "location": "Caesarea Amphitheater",
            "url": "https://www.habama.co.il/events/summer-jazz-concert-series",
            "description": "An evening of world-class jazz performances under the stars",
            "organizer_email": "concerts@caesarea.org.il",
            "organizer_name": "מיכאל לוי",
            "source": EventSource.HABAMA,
            "importance": EventImportance.HIGH,
            "is_hebrew": False,
            "tags": ["jazz", "music", "concert"],
            "price": "₪120-280",
            "phone": "04-6267080"
        },
        {
            "name": "מרקט האוכל של ירושלים",
            "name_english": "Jerusalem Food Market",
            "date": datetime(2025, 8, 28, 10, 0),
            "location": "שוק מחנה יהודה, ירושלים",
            "url": "https://www.matkonet.co.il/events/jerusalem-food-market-2025",
            "description": "מרקט אוכל מיוחד עם טעמים מכל העולם בלב ירושלים",
            "organizer_email": "market@mahane.co.il",
            "organizer_name": "שרה אברהמי",
            "source": EventSource.MATKONET,
            "importance": EventImportance.MEDIUM,
            "is_hebrew": True,
            "tags": ["אוכל", "שוק", "ירושלים"],
            "price": "כניסה חופשית",
            "phone": "02-9876543"
        },
        {
            "name": "אירוע טכנולוגיה וחדשנות",
            "name_english": "Technology & Innovation Event",
            "date": datetime(2025, 9, 5, 18, 0),
            "location": "מוזיאון העיצוב, חולון",
            "url": "https://www.getout.co.il/events/tech-innovation-holon-2025",
            "description": "אירוע מיוחד להצגת טכנולוgiות חדשניות וסטארט-אפים ישראליים",
            "organizer_email": "contact@techinnovation.co.il",
            "organizer_name": "אורי שלום",
            "source": EventSource.GETOUT,
            "importance": EventImportance.MEDIUM,
            "is_hebrew": True,
            "tags": ["טכנולוגיה", "חדשנות", "סטארט-אפ"],
            "price": "₪50",
            "phone": "03-5556789"
        },
        {
            "name": "Outdoor Photography Workshop",
            "name_english": "Outdoor Photography Workshop",
            "date": datetime(2025, 9, 12, 8, 0),
            "location": "Rosh Pina, Upper Galilee",
            "url": "https://www.funzing.com/experiences/outdoor-photography-workshop-galilee",
            "description": "Learn advanced outdoor photography techniques in the beautiful Galilee",
            "organizer_email": "workshops@photoart.co.il",
            "organizer_name": "עמית רוזן",
            "source": EventSource.FUNZING,
            "importance": EventImportance.LOW,
            "is_hebrew": False,
            "tags": ["photography", "workshop", "nature"],
            "price": "$85",
            "phone": "04-3334567"
        },
        {
            "name": "פסטיבל הקולנוע הישראלי",
            "name_english": "Israeli Cinema Festival",
            "date": datetime(2025, 9, 18, 19, 30),
            "location": "סינמטק תל אביב",
            "url": "https://www.eventbrite.com/e/israeli-cinema-festival-2025-tickets-987654321",
            "description": "פסטיבל קולנוע ישראלי עם הקרנות בכורה וסרטים מובחרים",
            "organizer_email": "festival@israelicinema.org.il",
            "organizer_name": "רונית אשכול",
            "source": EventSource.EVENTBRITE,
            "importance": EventImportance.HIGH,
            "is_hebrew": True,
            "tags": ["קולנוע", "פסטיבל", "תרבות"],
            "price": "₪45-120",
            "phone": "03-6060606"
        },
        {
            "name": "Wine Tasting Experience",
            "name_english": "Wine Tasting Experience",
            "date": datetime(2025, 9, 25, 17, 0),
            "location": "Golan Heights Winery",
            "url": "https://www.funzing.com/experiences/wine-tasting-golan-heights",
            "description": "Discover the finest Israeli wines with expert sommelier guidance",
            "organizer_email": "tastings@golanwinery.com",
            "organizer_name": "יוסי דגן",
            "source": EventSource.FUNZING,
            "importance": EventImportance.MEDIUM,
            "is_hebrew": False,
            "tags": ["wine", "tasting", "golan"],
            "price": "₪180",
            "phone": "04-6969696"
        },
        {
            "name": "תערוכת אמנות עכשווית",
            "name_english": "Contemporary Art Exhibition",
            "date": datetime(2025, 8, 8, 11, 0),
            "location": "מוזיאון תל אביב לאמנות",
            "url": "https://www.habama.co.il/exhibitions/contemporary-art-2025",
            "description": "תערוכה מיוחדת של אמנות עכשווית ישראלית ובינלאומית",
            "organizer_email": "exhibitions@tamuseum.org.il",
            "organizer_name": "גלית מור",
            "source": EventSource.HABAMA,
            "importance": EventImportance.HIGH,
            "is_hebrew": True,
            "tags": ["אמנות", "תערוכה", "עכשווית"],
            "price": "₪35",
            "phone": "03-6077020"
        },
        {
            "name": "Startup Meetup Tel Aviv",
            "name_english": "Startup Meetup Tel Aviv",
            "date": datetime(2025, 8, 30, 19, 0),
            "location": "Google Campus TLV",
            "url": "https://www.matkonet.co.il/events/startup-meetup-august-2025",
            "description": "Monthly networking event for entrepreneurs and startup enthusiasts",
            "organizer_email": "meetup@startupisrael.com",
            "organizer_name": "איתי גולדשטיין",
            "source": EventSource.MATKONET,
            "importance": EventImportance.MEDIUM,
            "is_hebrew": False,
            "tags": ["startup", "networking", "technology"],
            "price": "Free",
            "phone": "03-7777777"
        },
        {
            "name": "פסטיבל הספרות העברית",
            "name_english": "Hebrew Literature Festival",
            "date": datetime(2025, 9, 7, 16, 0),
            "location": "בית הכנסת הגדול, ירושלים",
            "url": "https://www.getout.co.il/events/hebrew-literature-festival-2025",
            "description": "פסטיבל ספרות עברית עם סופרים מובילים ואירועי השקה",
            "organizer_email": "literature@hebrew-festival.co.il",
            "organizer_name": "רחל ברק",
            "source": EventSource.GETOUT,
            "importance": EventImportance.HIGH,
            "is_hebrew": True,
            "tags": ["ספרות", "עברית", "פסטיבל"],
            "price": "₪25",
            "phone": "02-5555555"
        }
    ]
    
    logger.info(f"Création de {len(test_events)} événements de test...")
    
    # Supprimer les anciens événements
    await db.events.delete_many({})
    
    # Insérer les nouveaux événements
    for event_data in test_events:
        event = Event(**event_data)
        await db.events.insert_one(event.dict())
        logger.info(f"Événement créé: {event.name}")
    
    # Vérifier les résultats
    count = await db.events.count_documents({})
    logger.info(f"Total d'événements dans la base: {count}")
    
    # Fermer la connexion
    client.close()
    
    return len(test_events)

async def main():
    """Fonction principale"""
    logger.info("Démarrage de la création d'événements de test...")
    
    try:
        count = await create_test_events()
        logger.info(f"✅ {count} événements créés avec succès!")
        
        # Afficher quelques statistiques
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
        
        # Compter par source
        sources = await db.events.distinct("source")
        logger.info("Événements par source:")
        for source in sources:
            count = await db.events.count_documents({"source": source})
            logger.info(f"  {source}: {count} événements")
        
        # Compter par importance
        importances = await db.events.distinct("importance")
        logger.info("Événements par importance:")
        for importance in importances:
            count = await db.events.count_documents({"importance": importance})
            logger.info(f"  {importance}: {count} événements")
        
        # Compter avec emails
        with_email = await db.events.count_documents({"organizer_email": {"$ne": None}})
        logger.info(f"Événements avec email: {with_email}")
        
        client.close()
        
    except Exception as e:
        logger.error(f"Erreur: {e}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(main())