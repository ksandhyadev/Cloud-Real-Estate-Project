from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AmenityBase(BaseModel):
    amenity_name: str

class PropertyImageBase(BaseModel):
    id: Optional[int] = None
    image_url: str
    is_cover: bool = False
    visual_condition_score: Optional[float] = 8.5
    quality_score: Optional[float] = 8.0
    tags_json: Optional[str] = "[]"

    class Config:
        from_attributes = True

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    listing_type: str = "buy"       # buy, rent, plot
    property_type: str = "apartment"# apartment, villa, house, plot, commercial
    price: float
    area_sqft: float
    bhk: int = 2
    bathrooms: int = 2
    furnishing: str = "semi-furnished"
    property_age: int = 1
    parking_spaces: int = 1
    country: str = "India"
    state: str = "Karnataka"
    city: str = "Bangalore"
    locality: str = "Whitefield"
    address: Optional[str] = None
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    amenities: List[str] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    area_sqft: Optional[float] = None
    bhk: Optional[int] = None
    bathrooms: Optional[int] = None
    furnishing: Optional[str] = None
    property_age: Optional[int] = None
    parking_spaces: Optional[int] = None
    status: Optional[str] = None

class PropertyResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    description: Optional[str]
    listing_type: str
    property_type: str
    price: float
    area_sqft: float
    bhk: int
    bathrooms: int
    furnishing: str
    property_age: int
    parking_spaces: int
    country: str = "India"
    state: str = "Karnataka"
    city: str = "Bangalore"
    locality: str = "Whitefield"
    address: Optional[str]
    latitude: float
    longitude: float
    status: str
    created_at: datetime
    images: List[PropertyImageBase] = []
    amenities: List[str] = []
    
    # AI Summary Fields for quick search card display
    estimated_price: Optional[float] = None
    price_per_sqft: Optional[float] = None
    confidence_indicator: Optional[float] = None
    price_delta_percent: Optional[float] = None  # (price - estimated) / estimated * 100
    safety_score: Optional[float] = None

    class Config:
        from_attributes = True

class PropertyFilter(BaseModel):
    query: Optional[str] = None
    listing_type: Optional[str] = None
    property_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bhk: Optional[int] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    furnishing: Optional[str] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    min_safety: Optional[float] = None
    sort_by: Optional[str] = "relevance"  # relevance, price_asc, price_desc, newest, ai_diff
    page: int = 1
    page_size: int = 12
