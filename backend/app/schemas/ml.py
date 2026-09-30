from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    area_sqft: float
    bhk: int = 2
    bathrooms: int = 2
    property_age: int = 2
    parking_spaces: int = 1
    property_type: str = "apartment"
    furnishing: str = "semi-furnished"
    city: str = "Bangalore"
    locality: str = "Whitefield"
    amenities: List[str] = []
    description: Optional[str] = ""

class ShapFeatureContribution(BaseModel):
    feature: str
    feature_label: str
    feature_value: Any
    shap_value: float
    contribution: str  # "positive" or "negative"
    relative_weight: float

class PredictionResponse(BaseModel):
    predicted_price: float
    price_per_sqft: float
    model_confidence_indicator: float  # Labelled honestly per requirements
    base_price: float
    model_version: str
    positive_drivers: List[ShapFeatureContribution]
    negative_drivers: List[ShapFeatureContribution]
    all_contributions: List[ShapFeatureContribution]
    prediction_range: Optional[Dict[str, Any]] = None
    locality_reference: Optional[Dict[str, Any]] = None
    comparable_count: Optional[int] = None
    data_freshness: Optional[str] = None
    evaluation_metrics: Optional[Dict[str, Any]] = None


class NlpRequest(BaseModel):
    text: str

class NlpResponse(BaseModel):
    luxury_score: float
    extracted_amenities: List[str]
    condition_indicators: List[str]
    premium_keywords: List[str]
    sentiment_tone: str
    summary: str

class VisionResponse(BaseModel):
    visual_condition_score: float
    quality_score: float
    sharpness_index: float
    brightness_balance: float
    detected_tags: List[str]
    disclaimer: str = "Visual indicator metric derived from image analysis for academic prototype. Not a substitute for physical structural inspection."

class DecisionSupportSummary(BaseModel):
    property_id: int
    title: str
    listed_price: float
    estimated_price: float
    price_delta: float
    price_delta_percent: float
    valuation_verdict: str  # "Fair Market Alignment", "Below Estimated Value (Potential Value Opportunity)", "Premium Listed"
    confidence_indicator: float
    top_positive_factors: List[str]
    top_negative_factors: List[str]
    nlp_luxury_rating: float
    safety_rating: float
    poi_summary: Dict[str, int]
    evidence_checklist: List[Dict[str, Any]]
