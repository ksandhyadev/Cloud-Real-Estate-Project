import re
from typing import Dict, List, Any

LUXURY_TERMS = [
    "penthouse", "panoramic", "italian marble", "jacuzzi", "private elevator",
    "duplex", "smart home", "imported fixtures", "sky villa", "sea view",
    "infinity pool", "clubhouse", "concierge", "designer interior", "wooden flooring",
    "vaastu compliant", "corner plot", "private terrace", "servant quarter", "premium"
]

AMENITY_TERMS = [
    "swimming pool", "gym", "gymnasium", "power backup", "clubhouse",
    "24x7 security", "security", "children play area", "covered parking", "parking",
    "badminton court", "tennis court", "jogging track", "cctv", "lift",
    "rainwater harvesting", "solar heating", "piped gas", "ev charging", "garden"
]

CONDITION_TERMS = [
    "brand new", "ready to move", "recently renovated", "well maintained",
    "pristine condition", "under construction", "under warranty", "freshly painted",
    "architect designed", "flawless finish"
]

class NLPEngine:
    @staticmethod
    def analyze_description(text: str) -> Dict[str, Any]:
        if not text or not isinstance(text, str):
            return {
                "luxury_score": 5.0,
                "extracted_amenities": [],
                "condition_indicators": ["standard condition"],
                "premium_keywords": [],
                "sentiment_tone": "Neutral",
                "summary": "No description provided."
            }
        
        lowered = text.lower()
        
        # Extract matched terms
        found_luxury = [term for term in LUXURY_TERMS if re.search(r'\b' + re.escape(term) + r'\b', lowered)]
        found_amenities = [term for term in AMENITY_TERMS if re.search(r'\b' + re.escape(term) + r'\b', lowered)]
        found_condition = [term for term in CONDITION_TERMS if re.search(r'\b' + re.escape(term) + r'\b', lowered)]
        
        # Calculate luxury score (base 5.0, max 10.0)
        luxury_boost = min(4.5, len(found_luxury) * 0.9 + len(found_amenities) * 0.3)
        luxury_score = round(min(10.0, 4.5 + luxury_boost), 1)
        
        # Determine sentiment tone
        if len(found_luxury) >= 3 or "brand new" in lowered or "pristine" in lowered:
            tone = "Highly Favorable / Premium Appeal"
        elif len(found_amenities) >= 2:
            tone = "Positive / Well-Equipped"
        else:
            tone = "Standard Informative"
            
        summary = (
            f"Property profile highlights {len(found_amenities)} key amenities "
            f"and {len(found_luxury)} premium attributes. "
            f"Luxury score evaluated at {luxury_score}/10."
        )

        # Enhance summary via Google Gemini API if configured; otherwise use calibrated local NLP
        gemini_summary = None
        try:
            from app.services.gemini_service import gemini_service
            gemini_summary = gemini_service.generate_description_summary(text)
        except Exception:
            pass

        return {
            "luxury_score": luxury_score,
            "extracted_amenities": list(set(found_amenities)),
            "condition_indicators": list(set(found_condition)) if found_condition else ["Move-in ready condition"],
            "premium_keywords": list(set(found_luxury)),
            "sentiment_tone": tone,
            "summary": gemini_summary if gemini_summary else summary
        }

nlp_engine = NLPEngine()
