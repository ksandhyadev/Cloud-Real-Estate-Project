from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    listing_type = Column(String(50), default="buy", index=True)  # buy, rent, plot
    property_type = Column(String(50), default="apartment", index=True)  # apartment, villa, house, plot, commercial
    
    price = Column(Float, nullable=False, index=True)
    area_sqft = Column(Float, nullable=False, index=True)
    bhk = Column(Integer, default=2, index=True)
    bathrooms = Column(Integer, default=2)
    furnishing = Column(String(50), default="semi-furnished")  # unfurnished, semi-furnished, fully-furnished
    property_age = Column(Integer, default=1)  # in years
    parking_spaces = Column(Integer, default=1)
    
    country = Column(String(100), default="India", index=True)
    state = Column(String(100), default="Karnataka", index=True)
    city = Column(String(100), default="Bangalore", index=True)
    locality = Column(String(100), default="Whitefield", index=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    
    status = Column(String(50), default="approved", index=True)  # approved, pending, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    amenities = relationship("PropertyAmenity", back_populates="property", cascade="all, delete-orphan")
    prediction = relationship("PropertyPrediction", back_populates="property", uselist=False, cascade="all, delete-orphan")
    shap_explanation = relationship("ShapExplanation", back_populates="property", uselist=False, cascade="all, delete-orphan")
    nlp_analysis = relationship("NlpAnalysis", back_populates="property", uselist=False, cascade="all, delete-orphan")
    poi_items = relationship("PoiData", back_populates="property", cascade="all, delete-orphan")
    safety_indicator = relationship("SafetyIndicator", back_populates="property", uselist=False, cascade="all, delete-orphan")
    shortlisted_by = relationship("Shortlist", back_populates="property", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="property", cascade="all, delete-orphan")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_cover = Column(Boolean, default=False)
    visual_condition_score = Column(Float, default=8.5)
    quality_score = Column(Float, default=8.0)
    tags_json = Column(Text, default="[]")  # JSON list of detected tags
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="images")


class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    amenity_name = Column(String(100), nullable=False)

    property = relationship("Property", back_populates="amenities")
