import requests
from typing import List, Dict, Any
from app.config import settings

# Curated benchmark POIs for major hubs when offline or without API key
BENCHMARK_POIS = {
    "Bangalore": [
        {"category": "transit", "name": "Whitefield Metro Station (Purple Line)", "distance_meters": 650, "lat": 12.9698, "lon": 77.7499},
        {"category": "school", "name": "The International School Bangalore (TISB)", "distance_meters": 1800, "lat": 12.9234, "lon": 77.7212},
        {"category": "hospital", "name": "Manipal Hospital Whitefield", "distance_meters": 1200, "lat": 12.9782, "lon": 77.7345},
        {"category": "shopping", "name": "Nexus Shantiniketan Mall", "distance_meters": 950, "lat": 12.9880, "lon": 77.7290},
        {"category": "park", "name": "ITPB Tech Park Lake & Jogging Track", "distance_meters": 1400, "lat": 12.9850, "lon": 77.7380},
    ],
    "Mumbai": [
        {"category": "transit", "name": "Bandra-Kurla Complex Metro Station", "distance_meters": 450, "lat": 19.0657, "lon": 72.8688},
        {"category": "school", "name": "Dhirubhai Ambani International School", "distance_meters": 1100, "lat": 19.0680, "lat": 72.8670},
        {"category": "hospital", "name": "Asian Heart Institute", "distance_meters": 800, "lat": 19.0640, "lon": 72.8620},
        {"category": "shopping", "name": "Jio World Drive", "distance_meters": 750, "lat": 19.0620, "lon": 72.8660},
        {"category": "park", "name": "BKC Central Urban Park", "distance_meters": 900, "lat": 19.0670, "lon": 72.8640},
    ],
    "Delhi": [
        {"category": "transit", "name": "Hauz Khas Yellow/Magenta Interchange", "distance_meters": 550, "lat": 28.5432, "lon": 77.2065},
        {"category": "school", "name": "Delhi Public School R.K. Puram", "distance_meters": 1600, "lat": 28.5680, "lon": 77.1820},
        {"category": "hospital", "name": "Max Super Speciality Hospital Saket", "distance_meters": 2100, "lat": 28.5270, "lon": 77.2140},
        {"category": "shopping", "name": "Select CITYWALK Mall", "distance_meters": 1950, "lat": 28.5284, "lon": 77.2185},
        {"category": "park", "name": "Deer Park & Hauz Khas Lake", "distance_meters": 850, "lat": 28.5490, "lon": 77.1950},
    ],
    "Mysore": [
        {"category": "transit", "name": "Mysuru Junction Railway Station", "distance_meters": 1800, "lat": 12.3168, "lon": 76.6444},
        {"category": "school", "name": "Demonstration School RIE Mysore", "distance_meters": 1200, "lat": 12.3130, "lon": 76.6280},
        {"category": "hospital", "name": "Apollo BGS Hospital Mysore", "distance_meters": 1500, "lat": 12.3020, "lon": 76.6390},
        {"category": "shopping", "name": "Mall of Mysore", "distance_meters": 2400, "lat": 12.3010, "lon": 76.6660},
        {"category": "park", "name": "Karanji Lake Nature Park", "distance_meters": 2100, "lat": 12.3060, "lon": 76.6710},
    ],
    "Mangalore": [
        {"category": "transit", "name": "Mangalore Central Station", "distance_meters": 2200, "lat": 12.8650, "lon": 74.8430},
        {"category": "school", "name": "St. Aloysius High School", "distance_meters": 1900, "lat": 12.8710, "lon": 74.8480},
        {"category": "hospital", "name": "KMC Hospital Mangaluru", "distance_meters": 1100, "lat": 12.8750, "lon": 74.8510},
        {"category": "shopping", "name": "City Centre Mall Mangalore", "distance_meters": 1600, "lat": 12.8720, "lon": 74.8440},
        {"category": "park", "name": "Kadri Park & Botanical Gardens", "distance_meters": 750, "lat": 12.8820, "lon": 74.8590},
    ],
    "Hyderabad": [
        {"category": "transit", "name": "Raidurg Metro Station (Blue Line)", "distance_meters": 700, "lat": 17.4410, "lon": 78.3780},
        {"category": "school", "name": "Oakridge International School Gachibowli", "distance_meters": 1700, "lat": 17.4120, "lon": 78.3390},
        {"category": "hospital", "name": "Continental Hospitals Financial District", "distance_meters": 950, "lat": 17.4190, "lon": 78.3450},
        {"category": "shopping", "name": "Inorbit Mall Cyberabad", "distance_meters": 2200, "lat": 17.4330, "lon": 78.3860},
        {"category": "park", "name": "Gachibowli Bio-Diversity Park", "distance_meters": 1300, "lat": 17.4300, "lon": 78.3690},
    ]
}

class POIService:
    @staticmethod
    def get_nearby_pois(latitude: float, longitude: float, city: str = "Bangalore") -> List[Dict[str, Any]]:
        # If Geoapify API key is present, attempt live query
        if settings.GEOAPIFY_API_KEY:
            try:
                categories = "education.school,healthcare.hospital,commercial.shopping_mall,public_transport.subway"
                url = (
                    f"https://api.geoapify.com/v2/places?"
                    f"categories={categories}&filter=circle:{longitude},{latitude},3000&limit=10&apiKey={settings.GEOAPIFY_API_KEY}"
                )
                response = requests.get(url, timeout=4.0)
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    for feature in data.get("features", []):
                        props = feature.get("properties", {})
                        raw_cat = props.get("categories", ["facility"])[0]
                        cat = "other"
                        if "education" in raw_cat:
                            cat = "school"
                        elif "healthcare" in raw_cat:
                            cat = "hospital"
                        elif "shopping" in raw_cat:
                            cat = "shopping"
                        elif "public_transport" in raw_cat or "subway" in raw_cat:
                            cat = "transit"
                        
                        results.append({
                            "category": cat,
                            "name": props.get("name", props.get("formatted", "Local Facility")),
                            "distance_meters": props.get("distance", 1000),
                            "latitude": props.get("lat"),
                            "longitude": props.get("lon"),
                            "source": "Geoapify Live Places API"
                        })
                    if results:
                        return results
            except Exception:
                pass  # Fall through to graceful benchmark fallback

        # Fallback to realistic academic spatial benchmark data
        city_key = city if city in BENCHMARK_POIS else "Bangalore"
        pois = BENCHMARK_POIS[city_key]
        return [
            {
                "category": poi["category"],
                "name": poi["name"],
                "distance_meters": poi["distance_meters"],
                "latitude": poi.get("lat", latitude + 0.005),
                "longitude": poi.get("lon", longitude + 0.005),
                "source": "Academic Demo Benchmark (Spatial Intelligence Dataset)"
            }
            for poi in pois
        ]

poi_service = POIService()
