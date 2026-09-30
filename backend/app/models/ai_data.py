from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PropertyPrediction(Base):
    __tablename__ = "property_predictions"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, unique=True)
    estimated_price = Column(Float, nullable=False)
    price_per_sqft = Column(Float, nullable=False)
    confidence_indicator = Column(Float, default=0.88)  # Academic label: Model confidence indicator
    model_version = Column(String(50), default="XGBoost-v2.1")
    predicted_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="prediction")


class ShapExplanation(Base):
    __tablename__ = "shap_explanations"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, unique=True)
    base_value = Column(Float, nullable=False)
    shap_values_json = Column(Text, nullable=False)    # JSON dict of {feature: shap_value}
    feature_names_json = Column(Text, nullable=False)  # JSON list of feature names
    feature_values_json = Column(Text, nullable=False) # JSON dict of {feature: actual_value}
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="shap_explanation")


class NlpAnalysis(Base):
    __tablename__ = "nlp_analyses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, unique=True)
    luxury_score = Column(Float, default=7.5)  # 0 to 10 scale
    extracted_amenities_json = Column(Text, default="[]")
    condition_indicators_json = Column(Text, default="[]")
    premium_keywords_json = Column(Text, default="[]")
    summary = Column(Text, nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="nlp_analysis")


class PoiData(Base):
    __tablename__ = "poi_data"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # school, hospital, transit, shopping, park
    name = Column(String(200), nullable=False)
    distance_meters = Column(Float, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source = Column(String(100), default="Geoapify API / Academic Demo Benchmark")

    property = relationship("Property", back_populates="poi_items")


class SafetyIndicator(Base):
    __tablename__ = "safety_indicators"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, unique=True)
    safety_index = Column(Float, default=85.0)  # 0-100 scale
    crime_rating = Column(String(50), default="Low")  # Low, Moderate, High
    flood_risk = Column(String(50), default="Low")    # Low, Medium, Elevated
    traffic_congestion = Column(String(50), default="Moderate")  # Low, Moderate, Severe
    data_source = Column(String(255), default="Academic Benchmark Simulation (Locality Crime & Environmental Index)")
    recorded_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="safety_indicator")
