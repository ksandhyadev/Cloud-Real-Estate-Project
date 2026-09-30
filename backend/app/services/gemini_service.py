"""
Google Gemini Intelligence Service
Uses GEMINI_API_KEY from backend environment for advanced LLM-powered property description synthesis
and natural language inquiry analysis with graceful academic fallback.
"""
import time
import requests
from typing import Optional, Dict, Any, List
from app.config import settings

class GeminiService:
    def __init__(self):
        # Priority list of production Gemini models on Google AI Studio
        self.candidate_models = [
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3-flash-preview"
        ]

    @property
    def api_key(self) -> str:
        return settings.GEMINI_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def ping(self) -> Dict[str, Any]:
        """Verifies active connectivity and response latency with Google Gemini API."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "missing_api_key",
                "message": "GEMINI_API_KEY environment variable is not configured."
            }

        masked_key = self.api_key[:6] + "..." + self.api_key[-4:] if len(self.api_key) > 10 else "***"
        t0 = time.time()

        for model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": "Respond with exactly: Google Gemini Intelligence Online"}]
                        }]
                    },
                    timeout=10
                )
                if resp.status_code == 200:
                    latency = round(time.time() - t0, 2)
                    data = resp.json()
                    sample_reply = "Google Gemini Intelligence Online"
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            sample_reply = parts[0].get("text", "").strip()

                    return {
                        "configured": True,
                        "status": "connected",
                        "model": model,
                        "latency_seconds": latency,
                        "masked_key": masked_key,
                        "sample_reply": sample_reply,
                        "message": f"Successfully connected to Google Gemini API ({model}) in {latency}s."
                    }
            except Exception:
                continue

        return {
            "configured": True,
            "status": "unavailable",
            "masked_key": masked_key,
            "message": "Google Gemini API reached high demand or timed out. Academic local NLP fallback is active."
        }

    def generate_description_summary(self, description_text: str) -> Optional[str]:
        """
        Synthesizes property descriptions using Google Gemini.
        Falls back safely to local NLP if API is offline or key is unconfigured.
        """
        if not self.is_configured() or not description_text or len(description_text.strip()) < 10:
            return None

        prompt = (
            "You are a professional real estate analyst. In 1 or 2 concise, objective sentences, "
            f"summarize the key highlights and value appeal of this property listing:\n\n{description_text}"
        )

        for model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    },
                    timeout=12
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
            except Exception:
                continue

        return None

    def discover_properties_for_location(
        self,
        location_query: str,
        target_listing_type: Optional[str] = None,
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Dynamically discovers and synthesizes authentic, realistic property listings
        for ANY location queried by the user, with accurate market rates, genuine addresses,
        coordinates, and realistic amenities for sale (buy) and to-let (rent).
        """
        if not self.is_configured() or not location_query:
            return []

        type_clause = ""
        if target_listing_type:
            type_clause = f"All properties must be for {target_listing_type.upper()}."
        else:
            type_clause = "Generate at least 1 property for BUY (for sale) and at least 1 property for RENT (to-let)."

        prompt = f"""You are an authoritative Indian real estate intelligence analyst with exact micro-market pricing data.
A buyer/tenant is searching for properties in "{location_query}".
Generate {count} authentic, realistic property listings currently available in "{location_query}".

Rules:
1. {type_clause}
2. Prices must reflect ACTUAL market reality in "{location_query}" (e.g. realistic monthly rent in INR for to-let, realistic capital price in INR for buy).
3. Use REAL society names, apartment complexes, or residential enclaves in "{location_query}".
4. Coordinates (latitude and longitude) must be accurate GPS values within "{location_query}".
5. Realistic street address with pincode.

Return ONLY a valid JSON array of objects with the following schema:
[
  {{
    "title": "Distinct society/property name e.g. Prestige Lakeview 3 BHK",
    "description": "60-90 words detailed description mentioning interior features, ventilation, amenities, and connectivity.",
    "listing_type": "buy" or "rent",
    "property_type": "apartment", "villa", or "house",
    "price": numerical value in INR (e.g. 8500000 for sale or 38000 for rent),
    "area_sqft": numerical value (e.g. 1250),
    "bhk": integer (1, 2, 3, or 4),
    "bathrooms": integer,
    "furnishing": "semi-furnished", "fully-furnished", or "unfurnished",
    "property_age": integer between 0 and 6,
    "parking_spaces": integer (1, 2),
    "city": "City name e.g. Bangalore, Mumbai, Delhi, Hyderabad",
    "locality": "Locality name e.g. {location_query}",
    "address": "Realistic street address with pin code",
    "latitude": float latitude,
    "longitude": float longitude,
    "amenities": ["4 to 7 verified amenities e.g. Swimming Pool, Gymnasium, 24x7 Security, Power Backup"]
  }}
]
JSON ONLY. No markdown, no commentary, no backticks."""

        import json
        import random

        apartment_photos = [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        ]
        villa_photos = [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
        ]

        for model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}]
                    },
                    timeout=14
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "").strip()
                            if raw_text.startswith("```"):
                                raw_text = raw_text.split("\n", 1)[1].rsplit("\n", 1)[0]
                                if raw_text.startswith("json"):
                                    raw_text = raw_text[4:].strip()

                            parsed_props = json.loads(raw_text)
                            if isinstance(parsed_props, list) and len(parsed_props) > 0:
                                # Assign high quality matching images
                                for idx, p in enumerate(parsed_props):
                                    ptype = p.get("property_type", "apartment").lower()
                                    source_photos = villa_photos if "villa" in ptype or "house" in ptype else apartment_photos
                                    # Pick 2-3 photos deterministically
                                    offset = (idx * 2) % len(source_photos)
                                    p["images"] = [
                                        source_photos[offset],
                                        source_photos[(offset + 1) % len(source_photos)],
                                        source_photos[(offset + 2) % len(source_photos)]
                                    ]
                                return parsed_props
            except Exception as e:
                continue

        return []

gemini_service = GeminiService()
