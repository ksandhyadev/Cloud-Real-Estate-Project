"""
Listing Anomaly & Statistical Outlier Detection Service
Identifies mathematical and dimensional inconsistencies in real estate listings.
Always designated as 'Potential Listing Anomaly' for user review rather than verified fraud.
"""

from typing import Dict, Any, List, Optional
from app.services.locality_service import locality_service

class AnomalyService:
    @staticmethod
    def detect_anomalies(
        price: float,
        area_sqft: float,
        bhk: int,
        locality: str,
        property_type: str = "apartment",
        image_count: int = 1
    ) -> Dict[str, Any]:
        flags = []
        loc_stats = locality_service.get_locality_stats(locality)
        median_rate = loc_stats["median_rate_sqft"]
        min_rate = loc_stats["min_rate_sqft"]
        max_rate = loc_stats["max_rate_sqft"]

        rate_sqft = (price / max(1.0, area_sqft)) if area_sqft > 0 else 0

        # 1. Price Per Sq.Ft Extreme Outlier
        if rate_sqft > 0:
            if rate_sqft > max_rate * 1.8:
                flags.append({
                    "signal": "Substantially High Price/Sq.Ft",
                    "severity": "medium",
                    "detail": f"Rate of ₹{round(rate_sqft):,}/sq.ft is 80%+ above the {loc_stats['locality']} benchmark upper bound (₹{max_rate:,}/sq.ft)."
                })
            elif rate_sqft < min_rate * 0.45:
                flags.append({
                    "signal": "Unusually Low Price/Sq.Ft",
                    "severity": "high",
                    "detail": f"Rate of ₹{round(rate_sqft):,}/sq.ft is over 55% below the {loc_stats['locality']} lower threshold (₹{min_rate:,}/sq.ft). Verify title clear status."
                })

        # 2. Area vs BHK Inconsistency
        if bhk >= 3 and area_sqft < 650:
            flags.append({
                "signal": "Area-to-BHK Discrepancy",
                "severity": "medium",
                "detail": f"{bhk} BHK layout registered on only {area_sqft} sq.ft, which is unusually compact for this configuration."
            })
        elif bhk == 1 and area_sqft > 2500:
            flags.append({
                "signal": "Area-to-BHK Discrepancy",
                "severity": "low",
                "detail": f"1 BHK layout registered on {area_sqft} sq.ft, which significantly exceeds standard single-bedroom floor plans."
            })

        # 3. Total Valuation vs Locality Baseline
        if price < 1500000 and area_sqft > 800 and "karnataka" in loc_stats["state"].lower():
            flags.append({
                "signal": "Atypical Total Valuation",
                "severity": "high",
                "detail": f"Total price ₹{round(price/100000, 2)}L is atypical for a {area_sqft} sq.ft residence in {loc_stats['city']}."
            })

        # 4. Media Completeness
        if image_count == 0:
            flags.append({
                "signal": "No Visual Media",
                "severity": "low",
                "detail": "Listing currently has zero visual photos attached for buyer inspection."
            })

        is_anomaly = len(flags) > 0

        return {
            "is_potential_anomaly": is_anomaly,
            "anomaly_count": len(flags),
            "status_label": "Potential Listing Anomaly" if is_anomaly else "Consistent with Market Norms",
            "anomaly_flags": flags,
            "locality_baseline": {
                "locality": loc_stats["locality"],
                "median_rate_sqft": median_rate,
                "expected_range": f"₹{min_rate:,} - ₹{max_rate:,}/sq.ft"
            },
            "disclaimer": "Academic anomaly indicator: Signals indicate mathematical deviation from micro-market averages. This is not a legal fraud determination."
        }

anomaly_service = AnomalyService()
