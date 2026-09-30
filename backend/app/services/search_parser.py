"""
Smart Natural Language Search Parser
Translates freeform user queries (e.g., '2 BHK in Whitefield under 90 lakh near metro')
into structured database filters with high precision regex tokenization.
"""

import re
from typing import Dict, Any, List, Optional

LOCALITY_KEYWORDS = {
    "whitefield": "Whitefield",
    "indiranagar": "Indiranagar",
    "koramangala": "Koramangala",
    "hsr": "HSR Layout",
    "hsr layout": "HSR Layout",
    "bellandur": "Bellandur",
    "sarjapur": "Sarjapur Road",
    "sarjapur road": "Sarjapur Road",
    "electronic city": "Electronic City",
    "electronic city phase 1": "Electronic City",
    "electronic city phase 2": "Electronic City",
    "hebbal": "Hebbal",
    "jayanagar": "Jayanagar",
    "jp nagar": "JP Nagar",
    "j p nagar": "JP Nagar",
    "btm": "BTM Layout",
    "btm layout": "BTM Layout",
    "marathahalli": "Marathahalli",
    "yelahanka": "Yelahanka",
    "banashankari": "Banashankari",
    "malleshwaram": "Malleshwaram",
    "rajajinagar": "Rajajinagar",
    "kalyan nagar": "Kalyan Nagar",
    "kammanahalli": "Kammanahalli",
    "thanisandra": "Thanisandra",
    "hennur": "Hennur",
    "kanakapura road": "Kanakapura Road",
    "bannerghatta road": "Bannerghatta Road",
    "richmond town": "Richmond Town",
    "mg road": "MG Road",
    "gokulam": "Gokulam",
    "kadri": "Kadri",
    "bandra": "Bandra West",
    "andheri": "Andheri West",
    "powai": "Powai",
    "juhu": "Juhu",
    "worli": "Worli",
    "hauz khas": "Hauz Khas",
    "saket": "Saket",
    "dwarka": "Dwarka",
    "vasant kunj": "Vasant Kunj",
    "gachibowli": "Gachibowli",
    "hitec city": "HITEC City",
    "kondapur": "Kondapur",
    "madhapur": "Madhapur",
    "jubilee hills": "Jubilee Hills"
}

CITY_KEYWORDS = {
    "bangalore": "Bangalore",
    "bengaluru": "Bangalore",
    "mysore": "Mysore",
    "mysuru": "Mysore",
    "mangalore": "Mangalore",
    "mangaluru": "Mangalore",
    "mumbai": "Mumbai",
    "delhi": "Delhi",
    "hyderabad": "Hyderabad",
    "pune": "Pune",
    "chennai": "Chennai",
    "kolkata": "Kolkata",
    "noida": "Noida",
    "gurgaon": "Gurgaon"
}

class SearchParser:
    @staticmethod
    def parse_query(query: str) -> Dict[str, Any]:
        q = query.lower().strip()
        filters = {}
        matched_tokens = []

        # 1. BHK Extraction
        bhk_match = re.search(r'(\d+)\s*(?:bhk|bedroom|bed)', q)
        if bhk_match:
            bhk_val = int(bhk_match.group(1))
            filters["bhk"] = bhk_val
            matched_tokens.append(f"{bhk_val} BHK")

        # 2. Listing Type (buy vs rent)
        if re.search(r'\b(rent|rental|lease|to let|to-let|pg|tenant)\b', q):
            filters["listing_type"] = "rent"
            matched_tokens.append("Rent (To-Let)")
        elif re.search(r'\b(buy|sale|purchase|invest|owner)\b', q):
            filters["listing_type"] = "buy"
            matched_tokens.append("Buy (For Sale)")

        # 3. Property Type
        if re.search(r'\b(villa)\b', q):
            filters["property_type"] = "villa"
            matched_tokens.append("Villa")
        elif re.search(r'\b(apartment|flat)\b', q):
            filters["property_type"] = "apartment"
            matched_tokens.append("Apartment")
        elif re.search(r'\b(house|independent house)\b', q):
            filters["property_type"] = "house"
            matched_tokens.append("House")
        elif re.search(r'\b(plot|land)\b', q):
            filters["property_type"] = "plot"
            matched_tokens.append("Plot")
        elif re.search(r'\b(commercial|office)\b', q):
            filters["property_type"] = "commercial"
            matched_tokens.append("Commercial")

        # 4. Budget / Max Price
        # Matches patterns like 'under 90 lakh', 'below 1.5 cr', 'under 50k', '< 80L', '₹90 lakh'
        price_match = re.search(
            r'(?:under|below|less than|within|budget of|<|<=)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l|k|thousand)?',
            q
        )
        if not price_match:
            price_match = re.search(
                r'₹\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|l|k|thousand)?',
                q
            )
        if not price_match:
            price_match = re.search(
                r'(\d+(?:\.\d+)?)\s*(cr|crore|crores|lakh|lakhs|lac|lacs|k|thousand)',
                q
            )

        if price_match:
            num_str = price_match.group(1)
            unit = (price_match.group(2) or "").lower()
            if num_str:
                val = float(num_str)
                if unit in ["cr", "crore", "crores"]:
                    max_p = val * 10000000.0
                    filters["max_price"] = max_p
                    matched_tokens.append(f"Budget ≤ ₹{val} Cr")
                elif unit in ["lakh", "lakhs", "lac", "lacs", "l"]:
                    max_p = val * 100000.0
                    filters["max_price"] = max_p
                    matched_tokens.append(f"Budget ≤ ₹{val} L")
                elif unit in ["k", "thousand"]:
                    max_p = val * 1000.0
                    filters["max_price"] = max_p
                    matched_tokens.append(f"Budget ≤ ₹{val} K")
                elif val >= 500000:
                    filters["max_price"] = val
                    matched_tokens.append(f"Budget ≤ ₹{val:,.0f}")

        # 5. Locality Extraction (priority keyword mapping)
        for kw, canonical in LOCALITY_KEYWORDS.items():
            if re.search(rf'\b{kw}\b', q):
                filters["locality"] = canonical
                matched_tokens.append(canonical)
                break

        # Open-ended location extraction if not in dictionary
        if "locality" not in filters:
            # Check pattern: in <place>, at <place>, near <place>
            loc_match = re.search(r'\b(?:in|at|near|around)\s+([a-zA-Z0-9\s]{3,35}?)(?:\s+(?:under|below|less|for|with|near|budget|\d+bhk|flat|apartment|villa|house|bhk)|$)', q)
            if loc_match:
                extracted = loc_match.group(1).strip().title()
                if extracted.lower() not in ["the", "a", "bangalore", "mumbai", "delhi", "hyderabad", "city", "town", "metro"]:
                    filters["locality"] = extracted
                    matched_tokens.append(extracted)

        # If still no locality, check if query minus tokens leaves a location name
        if "locality" not in filters:
            cleaned = re.sub(r'\b(\d+\s*bhk|bedroom|bed|rent|rental|to let|to-let|buy|sale|villa|apartment|flat|house|plot|under|below|less than|budget of|cr|crore|crores|lakh|lakhs|lac|lacs|k|thousand|₹|\d+)\b', '', q)
            cleaned = re.sub(r'\b(in|at|near|around|with|for)\b', '', cleaned).strip()
            cleaned = ' '.join(cleaned.split())
            if len(cleaned) >= 3 and cleaned.lower() not in ["properties", "property", "house", "houses", "home", "homes", "all"]:
                filters["locality"] = cleaned.title()
                matched_tokens.append(cleaned.title())

        # 6. City Extraction
        for kw, canonical in CITY_KEYWORDS.items():
            if re.search(rf'\b{kw}\b', q):
                filters["city"] = canonical
                matched_tokens.append(canonical)
                break

        # 7. Amenities mentions
        amenities = []
        if "metro" in q or "transit" in q:
            amenities.append("Metro")
        if "pool" in q or "swimming" in q:
            amenities.append("Swimming Pool")
        if "gym" in q or "fitness" in q:
            amenities.append("Gym")
        if "parking" in q:
            amenities.append("Covered Parking")
        if "security" in q or "gated" in q:
            amenities.append("24/7 Security")

        if amenities:
            filters["amenities"] = amenities
            matched_tokens.append("Amenities: " + ", ".join(amenities))

        summary = "Structured Search: " + (" • ".join(matched_tokens) if matched_tokens else "All Properties")

        return {
            "original_query": query,
            "filters": filters,
            "matched_tokens": matched_tokens,
            "summary": summary
        }

search_parser = SearchParser()
