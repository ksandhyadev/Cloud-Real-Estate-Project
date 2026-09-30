"""
Seller AI Assistant & Listing Quality Auditor Service
Provides automated pre-submission and post-submission listing auditing,
transparent quality scoring (0-100), and factual improvement suggestions.
"""

from typing import Dict, Any, List, Optional
from app.services.locality_service import locality_service
from app.ml.nlp_engine import nlp_engine

class SellerAuditService:
    @staticmethod
    def audit_listing(data: Dict[str, Any]) -> Dict[str, Any]:
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        price = float(data.get("price", 0.0))
        area_sqft = float(data.get("area_sqft", 0.0))
        bhk = int(data.get("bhk", 0))
        bathrooms = int(data.get("bathrooms", 0))
        parking_spaces = int(data.get("parking_spaces", 0))
        furnishing = data.get("furnishing", "unfurnished")
        locality = data.get("locality", "Whitefield").strip()
        amenities = data.get("amenities", [])
        images = data.get("images", [])

        suggestions = []
        breakdown = {}

        # 1. Title Completeness (15 pts)
        title_score = 0
        if len(title) >= 15:
            title_score += 10
            if any(str(bhk) in title for _ in [1]):
                title_score += 5
            else:
                suggestions.append("Include your BHK configuration in the title for higher search visibility.")
        else:
            title_score = 5
            suggestions.append("Provide a descriptive title (at least 15 characters, e.g., 'Spacious 3 BHK Luxury Apartment in Whitefield').")
        breakdown["title"] = {"score": title_score, "max": 15, "label": "Title Clarity"}

        # 2. Description Completeness & NLP Quality (20 pts)
        desc_score = 0
        if len(description) >= 60:
            desc_score += 10
            nlp_res = nlp_engine.analyze_description(description)
            luxury_pts = min(10, int(nlp_res["luxury_score"]))
            desc_score += luxury_pts
            if len(nlp_res["extracted_amenities"]) == 0:
                suggestions.append("Mention specific lifestyle features (e.g. gym, clubhouse, balcony, power backup) in your description to boost NLP indexing.")
        else:
            desc_score = 4
            suggestions.append("Add a detailed description (minimum 60 words) highlighting natural lighting, ventilation, and road access.")
        breakdown["description"] = {"score": desc_score, "max": 20, "label": "Description & NLP Depth"}

        # 3. Media & Visual Quality (20 pts)
        img_count = len(images) if isinstance(images, list) else 0
        img_score = 0
        if img_count >= 3:
            img_score = 20
        elif img_count == 2:
            img_score = 14
            suggestions.append("Upload at least 3 high-resolution photos (living room, bedroom, kitchen, exterior view).")
        elif img_count == 1:
            img_score = 8
            suggestions.append("Upload multiple interior and exterior photos to attract verified buyers.")
        else:
            img_score = 0
            suggestions.append("No property photos attached. Listings with 3+ images receive up to 4x higher buyer engagement.")
        breakdown["media"] = {"score": img_score, "max": 20, "label": "Visual Media Count"}

        # 4. Amenities Disclosure (15 pts)
        amenity_count = len(amenities) if isinstance(amenities, list) else 0
        amenity_score = min(15, amenity_count * 3)
        if amenity_count < 3:
            suggestions.append("Select at least 3 amenities (e.g. 24/7 Security, Lift, Covered Parking, Power Backup).")
        breakdown["amenities"] = {"score": amenity_score, "max": 15, "label": "Amenities Coverage"}

        # 5. Core Architectural Attributes (15 pts)
        core_score = 0
        if area_sqft > 200:
            core_score += 5
        else:
            suggestions.append("Specify accurate built-up area in square feet.")

        if bhk >= 1 and bathrooms >= 1:
            core_score += 5
        else:
            suggestions.append("Confirm both BHK and bathroom counts.")

        if parking_spaces >= 1:
            core_score += 5
        else:
            suggestions.append("Specify allocated parking spaces (car/bike) to inform commuters.")
        breakdown["core_attributes"] = {"score": core_score, "max": 15, "label": "Architectural Specs"}

        # 6. Pricing Realism & Locality Alignment (15 pts)
        loc_stats = locality_service.get_locality_stats(locality)
        pricing_score = 0
        rate_sqft = (price / max(1.0, area_sqft)) if area_sqft > 0 else 0
        
        pricing_info = {
            "listing_rate_sqft": round(rate_sqft, 2),
            "locality_median_rate_sqft": loc_stats["median_rate_sqft"],
            "locality_range": f"₹{loc_stats['min_rate_sqft']} - ₹{loc_stats['max_rate_sqft']}/sq.ft",
            "variance_percent": 0.0
        }

        if rate_sqft > 0:
            median_sqft = loc_stats["median_rate_sqft"]
            variance_pct = ((rate_sqft - median_sqft) / median_sqft) * 100.0
            pricing_info["variance_percent"] = round(variance_pct, 1)

            if abs(variance_pct) <= 20.0:
                pricing_score = 15
                pricing_info["evaluation"] = "Well aligned with current locality market benchmark."
            elif variance_pct > 20.0:
                pricing_score = 9
                pricing_info["evaluation"] = f"Listed at +{round(variance_pct, 1)}% above {locality} median rate. Consider providing premium justification in description."
                suggestions.append(f"Price per sq.ft (₹{round(rate_sqft):,}) is higher than the {locality} median (₹{median_sqft:,}/sq.ft). Emphasize luxury fixtures or private garden to justify premium.")
            else:
                pricing_score = 13
                pricing_info["evaluation"] = f"Listed at {round(abs(variance_pct), 1)}% below {locality} median rate (highly competitive)."
        else:
            pricing_score = 5
            suggestions.append("Enter a valid non-zero listing price.")
        breakdown["pricing"] = {"score": pricing_score, "max": 15, "label": "Market Price Alignment"}

        total_quality_score = sum(b["score"] for b in breakdown.values())

        if total_quality_score >= 85:
            tier = "Excellent"
        elif total_quality_score >= 65:
            tier = "Good"
        else:
            tier = "Needs Attention"

        return {
            "quality_score": total_quality_score,
            "quality_tier": tier,
            "breakdown": breakdown,
            "suggestions": suggestions,
            "pricing_analysis": pricing_info,
            "locality": loc_stats["locality"],
            "audit_timestamp": "Real-Time AI Listing Check"
        }

seller_audit_service = SellerAuditService()
