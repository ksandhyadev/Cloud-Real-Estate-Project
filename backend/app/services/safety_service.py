from datetime import datetime
from typing import Dict, Any

class SafetyService:
    @staticmethod
    def get_safety_metrics(locality: str = "Whitefield", city: str = "Bangalore") -> Dict[str, Any]:
        """
        Retrieves safety and environmental risk profiles.
        Academic benchmark simulated dataset with clear transparency tags.
        """
        # Locality baseline profiles
        profiles = {
            "whitefield": {"safety": 88.5, "crime": "Low", "flood": "Low", "traffic": "Moderate to High"},
            "indiranagar": {"safety": 91.0, "crime": "Low", "flood": "Low", "traffic": "Moderate"},
            "koramangala": {"safety": 87.0, "crime": "Low", "flood": "Low to Medium", "traffic": "High"},
            "bandra west": {"safety": 92.5, "crime": "Low", "flood": "Low", "traffic": "Moderate"},
            "hauz khas": {"safety": 89.0, "crime": "Low", "flood": "Low", "traffic": "Moderate"},
            "default": {"safety": 84.0, "crime": "Low to Moderate", "flood": "Low", "traffic": "Moderate"}
        }
        
        loc_key = locality.lower().strip()
        data = profiles.get(loc_key, profiles["default"])
        
        return {
            "safety_index": data["safety"],
            "crime_rating": data["crime"],
            "flood_risk": data["flood"],
            "traffic_congestion": data["traffic"],
            "data_source": "Academic Simulated Benchmark (Metropolitan Geospatial & Safety Indices)",
            "data_type": "Simulated Research Benchmark",
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "disclaimer": "Safety and flood indices are synthesized demonstration indicators for the academic prototype and should not be used as official municipal advisories."
        }

safety_service = SafetyService()
