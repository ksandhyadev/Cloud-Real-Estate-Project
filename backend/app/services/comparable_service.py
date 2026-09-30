"""
Price Comparable Engine
Discovers and ranks comparable properties based on locality proximity,
BHK configuration, area variance, price/sq.ft, and architectural category.
"""

import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.property import Property

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class ComparableService:
    @staticmethod
    def find_comparables_for_property(
        property_id: int, 
        db: Session, 
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        target = db.query(Property).filter(Property.id == property_id).first()
        if not target:
            return []

        candidates = db.query(Property).filter(Property.id != property_id).all()
        return ComparableService._rank_candidates(target, candidates, limit)

    @staticmethod
    def find_comparables_for_attributes(
        locality: str,
        city: str,
        bhk: int,
        area_sqft: float,
        price: float,
        property_type: str,
        latitude: float,
        longitude: float,
        db: Session,
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        # Dummy target object
        class DummyTarget:
            pass
        target = DummyTarget()
        target.id = 0
        target.locality = locality
        target.city = city
        target.bhk = bhk
        target.area_sqft = area_sqft
        target.price = price
        target.property_type = property_type
        target.latitude = latitude
        target.longitude = longitude

        candidates = db.query(Property).all()
        return ComparableService._rank_candidates(target, candidates, limit)

    @staticmethod
    def _rank_candidates(target: Any, candidates: List[Property], limit: int = 4) -> List[Dict[str, Any]]:
        target_rate = target.price / max(1.0, target.area_sqft)
        target_loc_clean = target.locality.lower().strip()
        target_city_clean = target.city.lower().strip()
        target_type_clean = target.property_type.lower().strip()

        scored_list = []

        for p in candidates:
            cand_rate = p.price / max(1.0, p.area_sqft)
            cand_loc_clean = p.locality.lower().strip()
            cand_city_clean = p.city.lower().strip()
            cand_type_clean = p.property_type.lower().strip()

            # 1. Locality & City Match (35 pts)
            loc_score = 0
            factors = []
            if target_loc_clean in cand_loc_clean or cand_loc_clean in target_loc_clean:
                loc_score = 35
                factors.append(f"Same locality ({p.locality})")
            elif target_city_clean == cand_city_clean:
                loc_score = 20
                factors.append(f"Same city ({p.city})")
            else:
                loc_score = 5

            # 2. BHK Alignment (20 pts)
            bhk_diff = abs(target.bhk - p.bhk)
            if bhk_diff == 0:
                bhk_score = 20
                factors.append(f"Exact matching {p.bhk} BHK layout")
            elif bhk_diff == 1:
                bhk_score = 12
                factors.append(f"Comparable {p.bhk} BHK configuration")
            else:
                bhk_score = 4

            # 3. Area Variance (20 pts)
            area_var_pct = abs(target.area_sqft - p.area_sqft) / max(1.0, target.area_sqft)
            area_score = max(0.0, 20.0 * (1.0 - min(1.0, area_var_pct)))
            if area_var_pct <= 0.15:
                factors.append(f"Within {round(area_var_pct * 100, 1)}% built-up area variance")

            # 4. Price/Sqft Proximity (15 pts)
            rate_var_pct = abs(target_rate - cand_rate) / max(1.0, target_rate)
            rate_score = max(0.0, 15.0 * (1.0 - min(1.0, rate_var_pct)))
            if rate_var_pct <= 0.15:
                factors.append("Close price/sq.ft alignment")

            # 5. Property Type (10 pts)
            if target_type_clean == cand_type_clean:
                type_score = 10
                factors.append(f"Identical {p.property_type.title()} category")
            else:
                type_score = 3

            total_similarity = round(loc_score + bhk_score + area_score + rate_score + type_score, 1)

            # Spatial distance
            dist_km = haversine_distance_km(
                target.latitude, target.longitude,
                p.latitude, p.longitude
            )

            cover_img = ""
            if p.images and len(p.images) > 0:
                cover_img = p.images[0].image_url

            scored_list.append({
                "property_id": p.id,
                "title": p.title,
                "locality": p.locality,
                "city": p.city,
                "property_type": p.property_type,
                "bhk": p.bhk,
                "area_sqft": p.area_sqft,
                "price": p.price,
                "price_per_sqft": round(cand_rate, 2),
                "distance_km": dist_km,
                "cover_image": cover_img,
                "similarity_score": min(99.0, total_similarity),
                "similarity_factors": factors,
                "data_source": "Verified Active Listing"
            })

        # Sort by similarity score descending
        scored_list.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_list[:limit]

comparable_service = ComparableService()
