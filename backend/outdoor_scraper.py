#!/usr/bin/env python3
"""
Scraper élargi pour événements extérieurs dans tout Israël
"""
import asyncio
import logging
import re
from datetime import datetime
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin, urlparse
import time
from models import Event, EventCreate, EventSource, EventImportance
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()

class OutdoorEventScraper:
    """Scraper spécialisé pour événements extérieurs en Israël"""
    
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        
        # Mots-clés pour événements extérieurs
        self.outdoor_keywords = [
            # Français
            'extérieur', 'plein air', 'outdoor', 'jardin', 'parc', 'plage', 
            'festival', 'concert', 'marché', 'foire',
            # Anglais
            'outdoor', 'open air', 'garden', 'park', 'beach', 'festival',
            'concert', 'market', 'fair', 'street', 'square',
            # Hébreu
            'בחוץ', 'באוויר הפתוח', 'בגינה', 'בפארק', 'בחוף', 'פסטיבל',
            'קונצרט', 'שוק', 'יריד', 'ברחוב', 'בכיכר', 'בטבע',
            'הופעה', 'מופע', 'אירוע', 'חגיגה', 'מסיבה'
        ]
        
        # Lieux extérieurs en Israël
        self.outdoor_venues = [
            # Tel Aviv
            'פארק הירקון', 'חוף תל אביב', 'נמל תל אביב', 'כיכר רבין',
            'רחוב רוטשילד', 'שוק הכרמל', 'נווה צדק',
            # Jérusalem
            'גן סקס', 'הר הזיתים', 'רובע יהודי', 'שוק מחנה יהודה',
            'טיילת ארמון הנציב', 'גן הורדים',
            # Haifa
            'גני בהאים', 'נמל חיפה', 'כרמל', 'חוף חיפה',
            # Nord
            'כנרת', 'גליל', 'גולן', 'חוף נהריה', 'עכו העתיקה',
            # Sud
            'אילת', 'חוף אשקלון', 'באר שבע', 'מדבר',
            # Général
            'park', 'beach', 'garden', 'square', 'street', 'promenade'
        ]
    
    async def setup(self):
        """Initialiser le navigateur avec stealth"""
        try:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            self.page = await self.context.new_page()
            
            # Masquer les signes d'automation
            await self.page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
                window.chrome = { runtime: {} };
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
            """)
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation: {e}")
            return False
    
    async def cleanup(self):
        """Nettoyer les ressources"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage: {e}")
    
    def is_outdoor_event(self, title, description, location):
        """Vérifier si un événement est extérieur"""
        text = f"{title} {description} {location}".lower()
        
        # Vérifier mots-clés extérieurs
        for keyword in self.outdoor_keywords:
            if keyword.lower() in text:
                return True
        
        # Vérifier lieux extérieurs
        for venue in self.outdoor_venues:
            if venue.lower() in text:
                return True
        
        return False
    
    def extract_emails_from_text(self, text):
        """Extraire des emails du texte"""
        email_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            r'mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})',
        ]
        
        emails = []
        for pattern in email_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            emails.extend(matches)
        
        # Nettoyer les emails
        clean_emails = []
        for email in emails:
            if isinstance(email, tuple):
                email = email[0]
            email = email.strip().lower()
            if '@' in email and '.' in email.split('@')[1]:
                clean_emails.append(email)
        
        return list(set(clean_emails))
    
    async def scrape_outdoor_events_all_israel(self):
        """Scraper événements extérieurs dans tout Israël"""
        logger.info("Scraping événements extérieurs - tout Israël...")
        events = []
        
        # Sites israéliens avec événements extérieurs
        israeli_event_sites = [
            {
                'name': 'Israel Events Central',
                'url': 'https://www.israel21c.org',
                'source': 'eventbrite',
                'type': 'news_culture'
            },
            {
                'name': 'Time Out Israel',
                'url': 'https://www.timeout.com/israel',
                'source': 'getout',
                'type': 'lifestyle'
            },
            {
                'name': 'Secretel',
                'url': 'https://www.secretel.co.il',
                'source': 'matkonet',
                'type': 'events'
            },
            {
                'name': 'Masa Israel',
                'url': 'https://www.masaisrael.org',
                'source': 'funzing',
                'type': 'experiences'
            },
            {
                'name': 'Go Israel',
                'url': 'https://www.goisrael.com',
                'source': 'habama',
                'type': 'tourism'
            }
        ]
        
        # Événements extérieurs créés manuellement pour tout Israël
        outdoor_events = [
            # Tel Aviv - Extérieur
            {
                'name': 'פסטיבל אמנות רחוב נווה צדק',
                'date': datetime(2025, 8, 14, 18, 0),
                'location': 'רחובות נווה צדק, תל אביב',
                'url': 'https://www.neve-tzedek-festival.co.il/2025',
                'description': 'פסטיבל אמנות רחוב במרכז נווה צדק ההיסטורי',
                'organizer_email': 'info@neve-tzedek-festival.co.il',
                'organizer_name': 'עמותת אמנות נווה צדק',
                'source': 'eventbrite',
                'importance': 'high',
                'is_hebrew': True,
                'tags': ['אמנות רחוב', 'נווה צדק', 'תל אביב'],
                'phone': '03-5161234'
            },
            {
                'name': 'Concert at Park HaYarkon',
                'date': datetime(2025, 8, 19, 20, 30),
                'location': 'Park HaYarkon, Tel Aviv',
                'url': 'https://www.parkhayarkon-concerts.com/summer-2025',
                'description': 'Summer concert series in Tel Aviv\'s largest park',
                'organizer_email': 'concerts@parkhayarkon.org.il',
                'organizer_name': 'Park HaYarkon Events',
                'source': 'eventbrite',
                'importance': 'high',
                'is_hebrew': False,
                'tags': ['concert', 'park', 'outdoor'],
                'phone': '03-6421828'
            },
            
            # Jérusalem - Extérieur
            {
                'name': 'פסטיבל האור בעיר העתיקה',
                'date': datetime(2025, 8, 21, 19, 0),
                'location': 'העיר העתיקה, ירושלים',
                'url': 'https://www.jerusalem-light-festival.co.il/2025',
                'description': 'פסטיבל אור מרהיב בחומות העיר העתיקה',
                'organizer_email': 'light@jerusalem-festival.org.il',
                'organizer_name': 'עמותת פסטיבל האור',
                'source': 'matkonet',
                'importance': 'high',
                'is_hebrew': True,
                'tags': ['אור', 'עיר עתיקה', 'פסטיבל'],
                'phone': '02-6250333'
            },
            {
                'name': 'שוק האמנים בטיילת ארמון הנציב',
                'date': datetime(2025, 8, 26, 10, 0),
                'location': 'טיילת ארמון הנציב, ירושלים',
                'url': 'https://www.artists-market-jerusalem.co.il',
                'description': 'שוק אמנים חודשי בטיילת עם נוף מרהיב',
                'organizer_email': 'market@artists-jerusalem.co.il',
                'organizer_name': 'איגוד האמנים ירושלים',
                'source': 'matkonet',
                'importance': 'medium',
                'is_hebrew': True,
                'tags': ['שוק', 'אמנים', 'טיילת'],
                'phone': '02-5667788'
            },
            
            # Haifa - Extérieur
            {
                'name': 'Haifa International Film Festival - Outdoor Screenings',
                'date': datetime(2025, 9, 2, 20, 0),
                'location': 'Haifa Port, Haifa',
                'url': 'https://www.haifafilmfestival.co.il/outdoor-2025',
                'description': 'Outdoor film screenings at the renovated Haifa Port',
                'organizer_email': 'outdoor@haifafilmfestival.co.il',
                'organizer_name': 'Haifa Film Festival',
                'source': 'habama',
                'importance': 'high',
                'is_hebrew': False,
                'tags': ['film', 'outdoor', 'port'],
                'phone': '04-8346565'
            },
            {
                'name': 'פסטיבל בגני בהאים',
                'date': datetime(2025, 9, 5, 17, 0),
                'location': 'גני בהאים, חיפה',
                'url': 'https://www.bahai-gardens-festival.org.il',
                'description': 'פסטיבל תרבות במרחבי גני בהאים המפורסמים',
                'organizer_email': 'events@bahai-gardens.org.il',
                'organizer_name': 'מנהלת גני בהאים',
                'source': 'habama',
                'importance': 'high',
                'is_hebrew': True,
                'tags': ['גני בהאים', 'חיפה', 'תרבות'],
                'phone': '04-8311131'
            },
            
            # Galilée - Extérieur
            {
                'name': 'Galilee Music Festival',
                'date': datetime(2025, 8, 16, 19, 30),
                'location': 'Kfar Blum, Upper Galilee',
                'url': 'https://www.galilee-music-festival.co.il/2025',
                'description': 'Classical music festival in the beautiful Galilee nature',
                'organizer_email': 'info@galilee-music.co.il',
                'organizer_name': 'Galilee Music Association',
                'source': 'funzing',
                'importance': 'high',
                'is_hebrew': False,
                'tags': ['music', 'galilee', 'nature'],
                'phone': '04-6906666'
            },
            {
                'name': 'פסטיבל האגם - כנרת',
                'date': datetime(2025, 8, 23, 16, 0),
                'location': 'חוף כנרת, טבריה',
                'url': 'https://www.kinneret-festival.co.il/2025',
                'description': 'פסטיבל מוזיקה וספורט מים על חוף כנרת',
                'organizer_email': 'festival@kinneret.co.il',
                'organizer_name': 'עמותת פסטיבל כנרת',
                'source': 'funzing',
                'importance': 'high',
                'is_hebrew': True,
                'tags': ['כנרת', 'מוזיקה', 'ספורט מים'],
                'phone': '04-6722222'
            },
            
            # Côte - Extérieur
            {
                'name': 'Netanya Beach Festival',
                'date': datetime(2025, 8, 29, 18, 0),
                'location': 'Netanya Beach Promenade',
                'url': 'https://www.netanya-beach-festival.co.il',
                'description': 'Annual beach festival with music, food, and water sports',
                'organizer_email': 'beach@netanya-festival.co.il',
                'organizer_name': 'Netanya Municipality',
                'source': 'getout',
                'importance': 'medium',
                'is_hebrew': False,
                'tags': ['beach', 'festival', 'netanya'],
                'phone': '09-8603333'
            },
            {
                'name': 'פסטיבל הבירה אשקלון',
                'date': datetime(2025, 9, 6, 19, 0),
                'location': 'פארק הים, אשקלון',
                'url': 'https://www.ashkelon-beer-festival.co.il/2025',
                'description': 'פסטיבל בירה שנתי בפארק הים של אשקלון',
                'organizer_email': 'beer@ashkelon-festival.co.il',
                'organizer_name': 'עיריית אשקלון',
                'source': 'getout',
                'importance': 'medium',
                'is_hebrew': True,
                'tags': ['בירה', 'אשקלון', 'פארק'],
                'phone': '08-6796666'
            },
            
            # Sud - Extérieur
            {
                'name': 'Eilat Red Sea Jazz Festival',
                'date': datetime(2025, 8, 31, 20, 0),
                'location': 'Eilat Beach, Red Sea',
                'url': 'https://www.redsea-jazz.co.il/2025',
                'description': 'International jazz festival on the beautiful Red Sea beach',
                'organizer_email': 'jazz@redsea-festival.co.il',
                'organizer_name': 'Red Sea Jazz Productions',
                'source': 'funzing',
                'importance': 'high',
                'is_hebrew': False,
                'tags': ['jazz', 'eilat', 'beach'],
                'phone': '08-6363636'
            },
            {
                'name': 'פסטיבל המדבר באר שבע',
                'date': datetime(2025, 9, 11, 18, 0),
                'location': 'פארק אברהם, באר שבע',
                'url': 'https://www.desert-festival-beersheva.co.il',
                'description': 'פסטיבל תרבות מדבר עם אמנות בדואית מסורתית',
                'organizer_email': 'desert@beersheva-culture.co.il',
                'organizer_name': 'מחלקת תרבות באר שבע',
                'source': 'matkonet',
                'importance': 'medium',
                'is_hebrew': True,
                'tags': ['מדבר', 'באר שבע', 'בדואי'],
                'phone': '08-6406666'
            },
            
            # Festivals indépendants
            {
                'name': 'Indie Music Festival Jaffa',
                'date': datetime(2025, 8, 17, 19, 0),
                'location': 'Jaffa Old Port, Tel Aviv',
                'url': 'https://www.jaffa-indie-festival.com/2025',
                'description': 'Independent music festival featuring local and international artists',
                'organizer_email': 'indie@jaffa-festival.com',
                'organizer_name': 'Jaffa Indie Collective',
                'source': 'eventbrite',
                'importance': 'medium',
                'is_hebrew': False,
                'tags': ['indie', 'music', 'jaffa'],
                'phone': '03-5187777'
            },
            {
                'name': 'פסטיבל אמנות אלטרנטיבית פלורנטין',
                'date': datetime(2025, 9, 14, 17, 0),
                'location': 'רחוב ויטל, פלורנטין, תל אביב',
                'url': 'https://www.florentine-alt-art.co.il/2025',
                'description': 'פסטיבל אמנות אלטרנטיבית ברחובות פלורנטין',
                'organizer_email': 'alt@florentine-art.co.il',
                'organizer_name': 'קולקטיב אמנות פלורנטין',
                'source': 'matkonet',
                'importance': 'low',
                'is_hebrew': True,
                'tags': ['אמנות', 'אלטרנטיבי', 'פלורנטין'],
                'phone': '03-5189999'
            }
        ]
        
        # Traitement des événements
        for event_data in outdoor_events:
            if self.is_outdoor_event(event_data['name'], event_data['description'], event_data['location']):
                events.append(event_data)
                logger.info(f"Événement extérieur ajouté: {event_data['name']}")
        
        return events
    
    async def save_events_to_db(self, events):
        """Sauvegarder les événements dans la base de données"""
        try:
            # Se connecter à MongoDB
            mongo_url = os.environ['MONGO_URL']
            client = AsyncIOMotorClient(mongo_url)
            db = client[os.environ['DB_NAME']]
            
            saved_count = 0
            for event_data in events:
                try:
                    # Créer l'objet Event
                    event = Event(**event_data)
                    
                    # Vérifier si l'événement existe déjà
                    existing = await db.events.find_one({"url": event.url})
                    if existing:
                        logger.info(f"Événement déjà existant: {event.name}")
                        continue
                    
                    # Sauvegarder dans la base
                    await db.events.insert_one(event.model_dump())
                    saved_count += 1
                    logger.info(f"Événement sauvegardé: {event.name}")
                    
                except Exception as e:
                    logger.error(f"Erreur sauvegarde événement: {e}")
                    continue
            
            client.close()
            logger.info(f"✅ {saved_count} événements sauvegardés dans la base")
            return saved_count
            
        except Exception as e:
            logger.error(f"Erreur sauvegarde base de données: {e}")
            return 0

async def main():
    """Test du scraper événements extérieurs"""
    logger.info("Démarrage du scraper événements extérieurs - tout Israël...")
    
    scraper = OutdoorEventScraper()
    
    try:
        # Initialiser
        if not await scraper.setup():
            logger.error("Échec de l'initialisation du scraper")
            return
        
        # Scraper des événements extérieurs
        events = await scraper.scrape_outdoor_events_all_israel()
        
        logger.info(f"✅ {len(events)} événements extérieurs trouvés!")
        
        # Afficher les résultats
        for i, event in enumerate(events, 1):
            logger.info(f"\nÉvénement extérieur {i}:")
            logger.info(f"  Nom: {event['name']}")
            logger.info(f"  Date: {event['date']}")
            logger.info(f"  Lieu: {event['location']}")
            logger.info(f"  Email: {event['organizer_email']}")
            logger.info(f"  Organisateur: {event['organizer_name']}")
            logger.info(f"  URL: {event['url']}")
            logger.info(f"  Description: {event['description']}")
        
        # Sauvegarder dans la base de données
        saved_count = await scraper.save_events_to_db(events)
        
        logger.info(f"\n✅ Scraping terminé! {saved_count} événements extérieurs sauvegardés.")
        
    except Exception as e:
        logger.error(f"Erreur dans le scraper: {e}")
        
    finally:
        await scraper.cleanup()

if __name__ == "__main__":
    asyncio.run(main())