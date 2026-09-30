from app.models.user import User
from app.models.property import Property, PropertyImage, PropertyAmenity
from app.models.ai_data import PropertyPrediction, ShapExplanation, NlpAnalysis, PoiData, SafetyIndicator
from app.models.interactions import Shortlist, SavedSearch, Notification, Enquiry

__all__ = [
    "User",
    "Property",
    "PropertyImage",
    "PropertyAmenity",
    "PropertyPrediction",
    "ShapExplanation",
    "NlpAnalysis",
    "PoiData",
    "SafetyIndicator",
    "Shortlist",
    "SavedSearch",
    "Notification",
    "Enquiry"
]
