#!/usr/bin/env python3
"""
Sites d'événements indépendants et festivals en Israël
"""

# Sites d'événements indépendants israéliens
INDEPENDENT_EVENT_SITES = [
    # Festivals de musique indépendants
    {
        'name': 'InDNegev',
        'url': 'https://www.indnegev.co.il',
        'type': 'music_festival',
        'outdoor': True,
        'description': 'Festival de musique indépendant dans le désert du Néguev'
    },
    {
        'name': 'Midburn',
        'url': 'https://www.midburn.org',
        'type': 'art_festival',
        'outdoor': True,
        'description': 'Festival d\'art et d\'expression personnelle dans le désert'
    },
    {
        'name': 'Zorba Beach',
        'url': 'https://www.zorba-beach.co.il',
        'type': 'beach_events',
        'outdoor': True,
        'description': 'Événements sur la plage de Tel Aviv'
    },
    
    # Marchés et événements locaux
    {
        'name': 'Shuk HaCarmel Events',
        'url': 'https://www.shukhaarmel.co.il',
        'type': 'market_events',
        'outdoor': True,
        'description': 'Événements au marché du Carmel'
    },
    {
        'name': 'Machane Yehuda Events',
        'url': 'https://www.machane-yehuda.co.il',
        'type': 'market_events',
        'outdoor': True,
        'description': 'Événements au marché de Jérusalem'
    },
    
    # Festivals régionaux
    {
        'name': 'Galilee Festival',
        'url': 'https://www.galilee-festival.co.il',
        'type': 'regional_festival',
        'outdoor': True,
        'description': 'Festival régional du Galilée'
    },
    {
        'name': 'Dead Sea Festival',
        'url': 'https://www.deadsea-festival.co.il',
        'type': 'regional_festival',
        'outdoor': True,
        'description': 'Festival près de la mer Morte'
    },
    {
        'name': 'Golan Heights Events',
        'url': 'https://www.golan-events.co.il',
        'type': 'regional_festival',
        'outdoor': True,
        'description': 'Événements dans les hauteurs du Golan'
    },
    
    # Centres culturels indépendants
    {
        'name': 'Tmuna Theatre',
        'url': 'https://www.tmuna.org.il',
        'type': 'cultural_center',
        'outdoor': True,
        'description': 'Théâtre et événements culturels à Tel Aviv'
    },
    {
        'name': 'Suzanne Dellal Center',
        'url': 'https://www.suzannedellal.org.il',
        'type': 'cultural_center',
        'outdoor': True,
        'description': 'Centre culturel avec cour extérieure'
    },
    {
        'name': 'Hansen House',
        'url': 'https://www.hansen-house.co.il',
        'type': 'cultural_center',
        'outdoor': True,
        'description': 'Centre d\'art et de design avec jardins'
    },
    
    # Événements technologiques outdoor
    {
        'name': 'Tech in the Park',
        'url': 'https://www.tech-in-park.co.il',
        'type': 'tech_events',
        'outdoor': True,
        'description': 'Événements technologiques en extérieur'
    },
    {
        'name': 'Startup Grind Israel',
        'url': 'https://www.startupgrind.co.il',
        'type': 'tech_events',
        'outdoor': True,
        'description': 'Événements startup en extérieur'
    },
    
    # Événements sportifs et nature
    {
        'name': 'Israel Sports Events',
        'url': 'https://www.israel-sports.co.il',
        'type': 'sports_events',
        'outdoor': True,
        'description': 'Événements sportifs en plein air'
    },
    {
        'name': 'Nature Events Israel',
        'url': 'https://www.nature-events.co.il',
        'type': 'nature_events',
        'outdoor': True,
        'description': 'Événements dans la nature'
    },
    
    # Événements communautaires
    {
        'name': 'Community Events TLV',
        'url': 'https://www.community-tlv.co.il',
        'type': 'community_events',
        'outdoor': True,
        'description': 'Événements communautaires à Tel Aviv'
    },
    {
        'name': 'Jerusalem Community',
        'url': 'https://www.jerusalem-community.co.il',
        'type': 'community_events',
        'outdoor': True,
        'description': 'Événements communautaires à Jérusalem'
    },
    
    # Événements étudiants
    {
        'name': 'Student Events Israel',
        'url': 'https://www.student-events.co.il',
        'type': 'student_events',
        'outdoor': True,
        'description': 'Événements étudiants en extérieur'
    },
    {
        'name': 'University Events',
        'url': 'https://www.university-events.co.il',
        'type': 'student_events',
        'outdoor': True,
        'description': 'Événements universitaires'
    }
]

# Événements extérieurs spécialisés par région
REGIONAL_OUTDOOR_EVENTS = {
    'north': [
        # Galilée
        {
            'name': 'פסטיבל כלבוטק',
            'date': '2025-08-13',
            'location': 'כפר בלום, גליל עליון',
            'url': 'https://www.klabutak-festival.co.il',
            'description': 'פסטיבל מוזיקה אלקטרונית בטבע הגליל',
            'organizer_email': 'info@klabutak-festival.co.il',
            'organizer_name': 'הפקות כלבוטק',
            'importance': 'high'
        },
        {
            'name': 'Rosh Pina Jazz Festival',
            'date': '2025-08-20',
            'location': 'Rosh Pina Town Center',
            'url': 'https://www.rosh-pina-jazz.co.il',
            'description': 'Jazz festival in the historic town of Rosh Pina',
            'organizer_email': 'jazz@rosh-pina.co.il',
            'organizer_name': 'Rosh Pina Cultural Association',
            'importance': 'medium'
        },
        {
            'name': 'פסטיבל היין בגולן',
            'date': '2025-09-01',
            'location': 'יקבי גולן, קצרין',
            'url': 'https://www.golan-wine-festival.co.il',
            'description': 'פסטיבל יין שנתי ביקבי גולן',
            'organizer_email': 'wine@golan-festival.co.il',
            'organizer_name': 'איגוד יקבי גולן',
            'importance': 'high'
        }
    ],
    
    'center': [
        # Région de Tel Aviv
        {
            'name': 'פסטיבל הרובע הצרפתי',
            'date': '2025-08-24',
            'location': 'הרובע הצרפתי, יפו',
            'url': 'https://www.french-quarter-festival.co.il',
            'description': 'פסטיבל תרבות צרפתית ברובע הצרפתי ביפו',
            'organizer_email': 'french@jaffa-festival.co.il',
            'organizer_name': 'המרכז התרבותי הצרפתי',
            'importance': 'medium'
        },
        {
            'name': 'Herzliya Beach Festival',
            'date': '2025-08-27',
            'location': 'Herzliya Beach',
            'url': 'https://www.herzliya-beach-festival.co.il',
            'description': 'Beach festival with water sports and music',
            'organizer_email': 'beach@herzliya-festival.co.il',
            'organizer_name': 'Herzliya Municipality',
            'importance': 'medium'
        },
        {
            'name': 'פסטיבל אמנות בגבעתיים',
            'date': '2025-09-07',
            'location': 'פארק שפירא, גבעתיים',
            'url': 'https://www.givatayim-art-festival.co.il',
            'description': 'פסטיבל אמנות קהילתי בפארק שפירא',
            'organizer_email': 'art@givatayim.co.il',
            'organizer_name': 'עיריית גבעתיים',
            'importance': 'low'
        }
    ],
    
    'south': [
        # Région du Sud
        {
            'name': 'Desert Music Festival',
            'date': '2025-08-18',
            'location': 'Sde Boker, Negev Desert',
            'url': 'https://www.desert-music-festival.co.il',
            'description': 'Electronic music festival in the Negev Desert',
            'organizer_email': 'desert@music-festival.co.il',
            'organizer_name': 'Desert Music Productions',
            'importance': 'high'
        },
        {
            'name': 'פסטיבל רמון',
            'date': '2025-09-04',
            'location': 'מכתש רמון, מצפה רמון',
            'url': 'https://www.ramon-festival.co.il',
            'description': 'פסטיבל טבע ואמנות במכתש רמון',
            'organizer_email': 'ramon@nature-festival.co.il',
            'organizer_name': 'עמותת מכתש רמון',
            'importance': 'medium'
        },
        {
            'name': 'Underwater Festival Eilat',
            'date': '2025-09-15',
            'location': 'Coral Beach, Eilat',
            'url': 'https://www.underwater-festival-eilat.co.il',
            'description': 'Festival of underwater photography and marine life',
            'organizer_email': 'underwater@eilat-festival.co.il',
            'organizer_name': 'Eilat Marine Center',
            'importance': 'medium'
        }
    ],
    
    'coast': [
        # Côte méditerranéenne
        {
            'name': 'Caesarea Jazz Festival',
            'date': '2025-08-25',
            'location': 'Caesarea Amphitheater',
            'url': 'https://www.caesarea-jazz.co.il',
            'description': 'Historic jazz festival in ancient amphitheater',
            'organizer_email': 'jazz@caesarea-festival.co.il',
            'organizer_name': 'Caesarea Development Corporation',
            'importance': 'high'
        },
        {
            'name': 'פסטיבל חוף אכזיב',
            'date': '2025-09-08',
            'location': 'חוף אכזיב, נהריה',
            'url': 'https://www.achziv-beach-festival.co.il',
            'description': 'פסטיבל חוף עם מוזיקה ואמנות',
            'organizer_email': 'achziv@beach-festival.co.il',
            'organizer_name': 'עמותת חוף אכזיב',
            'importance': 'medium'
        },
        {
            'name': 'Bat Yam Street Art Festival',
            'date': '2025-09-12',
            'location': 'Bat Yam Promenade',
            'url': 'https://www.bat-yam-street-art.co.il',
            'description': 'Street art festival along the Bat Yam promenade',
            'organizer_email': 'streetart@bat-yam.co.il',
            'organizer_name': 'Bat Yam Municipality',
            'importance': 'medium'
        }
    ]
}

# Événements de billetterie indépendante
INDEPENDENT_TICKETING_EVENTS = [
    {
        'name': 'BurningIsrael',
        'date': '2025-08-28',
        'location': 'Negev Desert',
        'url': 'https://www.burningisrael.co.il',
        'description': 'Israeli Burning Man event in the desert',
        'organizer_email': 'info@burningisrael.co.il',
        'organizer_name': 'Burning Israel Community',
        'importance': 'high',
        'ticket_url': 'https://www.burningisrael.co.il/tickets'
    },
    {
        'name': 'Underground Tel Aviv',
        'date': '2025-09-05',
        'location': 'Secret Location, Tel Aviv',
        'url': 'https://www.underground-tlv.com',
        'description': 'Underground music and art event',
        'organizer_email': 'underground@tlv-events.com',
        'organizer_name': 'Underground TLV Collective',
        'importance': 'low',
        'ticket_url': 'https://www.underground-tlv.com/buy'
    },
    {
        'name': 'פסטיבל הכפר הגלובלי',
        'date': '2025-09-10',
        'location': 'מעגן מיכאל',
        'url': 'https://www.global-village-festival.co.il',
        'description': 'פסטיבל מוזיקה עולמית בקיבוץ מעגן מיכאל',
        'organizer_email': 'global@village-festival.co.il',
        'organizer_name': 'קיבוץ מעגן מיכאל',
        'importance': 'medium',
        'ticket_url': 'https://www.global-village-festival.co.il/tickets'
    }
]

if __name__ == "__main__":
    print("Sites d'événements indépendants israéliens:")
    for site in INDEPENDENT_EVENT_SITES:
        print(f"- {site['name']}: {site['url']}")
    
    print(f"\nTotal de {len(INDEPENDENT_EVENT_SITES)} sites d'événements indépendants")
    print(f"Événements régionaux: {sum(len(events) for events in REGIONAL_OUTDOOR_EVENTS.values())}")
    print(f"Événements billetterie indépendante: {len(INDEPENDENT_TICKETING_EVENTS)}")