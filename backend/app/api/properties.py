import os
import shutil
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.config import settings
from app.models.property import Property, PropertyImage, PropertyAmenity
from app.models.ai_data import PropertyPrediction, ShapExplanation, NlpAnalysis, PoiData, SafetyIndicator
from app.models.user import User
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyResponse, PropertyImageBase
)
from app.services.auth_service import get_current_user, get_current_user_optional, require_seller_or_admin
from app.ml.xgboost_engine import xgboost_engine
from app.ml.shap_engine import shap_engine
from app.ml.nlp_engine import nlp_engine
from app.ml.vision_engine import vision_engine
from app.services.poi_service import poi_service
from app.services.safety_service import safety_service
from app.services.locality_service import locality_service
from app.services.comparable_service import comparable_service
from app.services.scorecard_service import scorecard_service
from app.services.insights_service import insights_service
from app.services.anomaly_service import anomaly_service
from app.services.search_parser import search_parser

router = APIRouter(prefix="/properties", tags=["Properties"])

def _format_property_response(p: Property) -> dict:
    # Calculate price delta percent if prediction exists
    delta_pct = None
    est_price = None
    conf = None
    if p.prediction:
        est_price = p.prediction.estimated_price
        conf = p.prediction.confidence_indicator
        delta_pct = round(((p.price - est_price) / max(1.0, est_price)) * 100, 1)

    safety_val = p.safety_indicator.safety_index if p.safety_indicator else 85.0

    return {
        "id": p.id,
        "owner_id": p.owner_id,
        "title": p.title,
        "description": p.description,
        "listing_type": p.listing_type,
        "property_type": p.property_type,
        "price": p.price,
        "area_sqft": p.area_sqft,
        "bhk": p.bhk,
        "bathrooms": p.bathrooms,
        "furnishing": p.furnishing,
        "property_age": p.property_age,
        "parking_spaces": p.parking_spaces,
        "country": getattr(p, "country", "India"),
        "state": getattr(p, "state", "Karnataka"),
        "city": p.city,
        "locality": p.locality,
        "address": p.address,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "status": p.status,
        "created_at": p.created_at,
        "images": [
            {
                "id": img.id,
                "image_url": img.image_url,
                "is_cover": img.is_cover,
                "visual_condition_score": img.visual_condition_score,
                "quality_score": img.quality_score,
                "tags_json": img.tags_json
            } for img in (p.images or [])
        ],
        "amenities": [a.amenity_name for a in (p.amenities or [])],
        "price_per_sqft": round(p.price / max(1.0, p.area_sqft), 2),
        "estimated_price": est_price,
        "confidence_indicator": conf,
        "price_delta_percent": delta_pct,
        "safety_score": safety_val
    }

@router.get("", response_model=List[PropertyResponse])
def get_properties(
    listing_type: Optional[str] = Query(None, description="buy, rent, or plot"),
    property_type: Optional[str] = Query(None, description="apartment, villa, house, plot, commercial"),
    query: Optional[str] = Query(None, description="Search term for city, locality, title"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    bhk: Optional[int] = Query(None),
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    locality: Optional[str] = Query(None),
    furnishing: Optional[str] = Query(None),
    min_area: Optional[float] = Query(None),
    max_area: Optional[float] = Query(None),
    min_safety: Optional[float] = Query(None),
    sort_by: str = Query("relevance", description="relevance, price_asc, price_desc, newest, ai_diff"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    q = db.query(Property).filter(Property.status == "approved")

    if listing_type and listing_type != "all":
        q = q.filter(Property.listing_type == listing_type.lower())
    if property_type and property_type != "all":
        q = q.filter(Property.property_type == property_type.lower())
    if query:
        search_fmt = f"%{query.lower()}%"
        q = q.filter(
            or_(
                Property.title.ilike(search_fmt),
                Property.locality.ilike(search_fmt),
                Property.city.ilike(search_fmt),
                Property.description.ilike(search_fmt)
            )
        )
    if min_price is not None:
        q = q.filter(Property.price >= min_price)
    if max_price is not None:
        q = q.filter(Property.price <= max_price)
    if bhk is not None and bhk > 0:
        q = q.filter(Property.bhk == bhk)
    if country and country != "all":
        q = q.filter(Property.country.ilike(f"%{country}%"))
    if state and state != "all":
        q = q.filter(Property.state.ilike(f"%{state}%"))
    if city and city != "all":
        q = q.filter(Property.city.ilike(f"%{city}%"))
    if locality and locality != "all":
        q = q.filter(Property.locality.ilike(f"%{locality}%"))
    if furnishing and furnishing != "all":
        q = q.filter(Property.furnishing == furnishing.lower())
    if min_area is not None:
        q = q.filter(Property.area_sqft >= min_area)
    if max_area is not None:
        q = q.filter(Property.area_sqft <= max_area)

    # Sorting
    if sort_by == "price_asc":
        q = q.order_by(asc(Property.price))
    elif sort_by == "price_desc":
        q = q.order_by(desc(Property.price))
    elif sort_by == "newest":
        q = q.order_by(desc(Property.created_at))
    else:
        q = q.order_by(desc(Property.id))

    offset = (page - 1) * page_size
    items = q.offset(offset).limit(page_size).all()
    
    results = [_format_property_response(p) for p in items]

    if min_safety:
        results = [r for r in results if (r.get("safety_score") or 0) >= min_safety]

    return results

@router.get("/{id}")
def get_property_detail(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    base_info = _format_property_response(prop)
    
    # Detailed AI structures
    pred_data = None
    if prop.prediction:
        mae = 694233.0
        if xgboost_engine.metadata:
            mae = float(xgboost_engine.metadata.get("mae", 694233.0))
        est = prop.prediction.estimated_price
        pred_data = {
            "estimated_price": est,
            "price_per_sqft": prop.prediction.price_per_sqft,
            "confidence_indicator": prop.prediction.confidence_indicator,
            "model_version": prop.prediction.model_version,
            "predicted_at": prop.prediction.predicted_at,
            "prediction_range": {
                "low": round(max(500000.0, est - mae), -2),
                "high": round(est + mae, -2),
                "mae": mae,
                "uncertainty_label": f"± ₹{round(mae / 100000, 2)} L (1x Empirical MAE)"
            },
            "model_evaluation": {
                "r2_score": 0.9899,
                "mae": mae,
                "rmse": 1147641.0,
                "mape": 3.39,
                "cv_5fold_r2": 0.9906
            }
        }
        
    shap_data = None
    if prop.shap_explanation:
        shap_data = {
            "base_value": prop.shap_explanation.base_value,
            "shap_values": json.loads(prop.shap_explanation.shap_values_json),
            "feature_names": json.loads(prop.shap_explanation.feature_names_json),
            "feature_values": json.loads(prop.shap_explanation.feature_values_json)
        }
        
    nlp_data = None
    if prop.nlp_analysis:
        nlp_data = {
            "luxury_score": prop.nlp_analysis.luxury_score,
            "extracted_amenities": json.loads(prop.nlp_analysis.extracted_amenities_json),
            "condition_indicators": json.loads(prop.nlp_analysis.condition_indicators_json),
            "premium_keywords": json.loads(prop.nlp_analysis.premium_keywords_json),
            "summary": prop.nlp_analysis.summary
        }
        
    safety_data = None
    if prop.safety_indicator:
        safety_data = {
            "safety_index": prop.safety_indicator.safety_index,
            "crime_rating": prop.safety_indicator.crime_rating,
            "flood_risk": prop.safety_indicator.flood_risk,
            "traffic_congestion": prop.safety_indicator.traffic_congestion,
            "data_source": prop.safety_indicator.data_source
        }
        
    pois = [
        {
            "id": p.id,
            "category": p.category,
            "name": p.name,
            "distance_meters": p.distance_meters,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "source": p.source
        } for p in (prop.poi_items or [])
    ]

    # Calculate Decision Support & Transparent Intelligence modules
    comparables = comparable_service.find_comparables_for_property(prop.id, db, limit=4)
    scorecard = scorecard_service.generate_scorecard(prop, db)
    factual_insights = insights_service.generate_factual_insights(prop)
    loc_benchmark = locality_service.get_locality_stats(prop.locality, db=db, property_type=prop.property_type)
    data_sources = insights_service.get_data_sources_panel(prop)
    anomaly_info = anomaly_service.detect_anomalies(
        price=prop.price,
        area_sqft=prop.area_sqft,
        bhk=prop.bhk,
        locality=prop.locality,
        property_type=prop.property_type,
        image_count=len(prop.images or [])
    )
    
    return {
        **base_info,
        "owner": {
            "id": prop.owner.id,
            "full_name": prop.owner.full_name,
            "email": prop.owner.email,
            "phone": prop.owner.phone
        } if prop.owner else None,
        "prediction_details": pred_data,
        "shap_details": shap_data,
        "nlp_details": nlp_data,
        "safety_details": safety_data,
        "pois": pois,
        "comparables": comparables,
        "scorecard": scorecard,
        "factual_insights": factual_insights,
        "locality_benchmark": loc_benchmark,
        "historical_trend": loc_benchmark.get("quarterly_history", []),
        "anomaly_detection": anomaly_info,
        "data_sources": data_sources
    }

@router.get("/smart/search")
def smart_natural_language_search(
    q: str = Query(..., description="Natural language search query"),
    db: Session = Depends(get_db)
):
    parsed = search_parser.parse_query(q)
    f = parsed["filters"]

    query = db.query(Property)
    if "listing_type" in f:
        query = query.filter(Property.listing_type == f["listing_type"])
    if "property_type" in f:
        query = query.filter(Property.property_type == f["property_type"])
    if "bhk" in f:
        query = query.filter(Property.bhk == f["bhk"])
    if "max_price" in f:
        query = query.filter(Property.price <= f["max_price"])
    if "locality" in f:
        query = query.filter(Property.locality.ilike(f"%{f['locality']}%"))
    if "city" in f:
        query = query.filter(Property.city.ilike(f"%{f['city']}%"))

    items = query.all()
    results = [_format_property_response(p) for p in items]

    return {
        "parser_output": parsed,
        "total_results": len(results),
        "results": results
    }

@router.get("/{id}/comparables")
def get_property_comparables(id: int, limit: int = 4, db: Session = Depends(get_db)):
    return comparable_service.find_comparables_for_property(id, db, limit=limit)

@router.get("/{id}/scorecard")
def get_property_scorecard(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return scorecard_service.generate_scorecard(prop, db)

@router.get("/{id}/insights")
def get_property_insights(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return insights_service.generate_factual_insights(prop)

@router.get("/{id}/anomalies")
def get_property_anomalies(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return anomaly_service.detect_anomalies(
        price=prop.price,
        area_sqft=prop.area_sqft,
        bhk=prop.bhk,
        locality=prop.locality,
        property_type=prop.property_type,
        image_count=len(prop.images or [])
    )

@router.get("/{id}/data-sources")
def get_property_data_sources(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return insights_service.get_data_sources_panel(prop)

@router.get("/{id}/historical-trend")
def get_property_historical_trend(id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    stats = locality_service.get_locality_stats(prop.locality, db=db, property_type=prop.property_type)
    return {
        "locality": stats["locality"],
        "property_type": stats["property_type"],
        "current_rate_sqft": stats["median_rate_sqft"],
        "quarterly_history": stats["quarterly_history"]
    }

@router.post("", response_model=PropertyResponse)
def create_property(
    prop_in: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin)
):
    # Step 1: Create property record
    new_prop = Property(
        owner_id=current_user.id,
        title=prop_in.title,
        description=prop_in.description,
        listing_type=prop_in.listing_type.lower(),
        property_type=prop_in.property_type.lower(),
        price=prop_in.price,
        area_sqft=prop_in.area_sqft,
        bhk=prop_in.bhk,
        bathrooms=prop_in.bathrooms,
        furnishing=prop_in.furnishing.lower(),
        property_age=prop_in.property_age,
        parking_spaces=prop_in.parking_spaces,
        country=getattr(prop_in, "country", "India"),
        state=getattr(prop_in, "state", "Karnataka"),
        city=prop_in.city,
        locality=prop_in.locality,
        address=prop_in.address,
        latitude=prop_in.latitude or 12.9716,
        longitude=prop_in.longitude or 77.5946,
        status="approved"  # Auto-approved for prototype
    )
    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)

    # Step 2: Add amenities
    for am in prop_in.amenities:
        db.add(PropertyAmenity(property_id=new_prop.id, amenity_name=am))
    db.commit()

    # Step 3: Run NLP Analysis
    nlp_res = nlp_engine.analyze_description(prop_in.description or "")
    nlp_rec = NlpAnalysis(
        property_id=new_prop.id,
        luxury_score=nlp_res["luxury_score"],
        extracted_amenities_json=json.dumps(nlp_res["extracted_amenities"]),
        condition_indicators_json=json.dumps(nlp_res["condition_indicators"]),
        premium_keywords_json=json.dumps(nlp_res["premium_keywords"]),
        summary=nlp_res["summary"]
    )
    db.add(nlp_rec)

    # Step 4: Safety & Risk profile
    safety_res = safety_service.get_safety_metrics(locality=new_prop.locality, city=new_prop.city)
    safety_rec = SafetyIndicator(
        property_id=new_prop.id,
        safety_index=safety_res["safety_index"],
        crime_rating=safety_res["crime_rating"],
        flood_risk=safety_res["flood_risk"],
        traffic_congestion=safety_res["traffic_congestion"],
        data_source=safety_res["data_source"]
    )
    db.add(safety_rec)

    # Step 5: Run XGBoost Price Prediction
    feat_df = xgboost_engine.prepare_feature_vector(
        area_sqft=new_prop.area_sqft,
        bhk=new_prop.bhk,
        bathrooms=new_prop.bathrooms,
        property_age=new_prop.property_age,
        parking_spaces=new_prop.parking_spaces,
        property_type=new_prop.property_type,
        furnishing=new_prop.furnishing,
        locality=new_prop.locality,
        amenities=prop_in.amenities,
        description=prop_in.description or "",
        safety_score=safety_res["safety_index"]
    )
    pred_res = xgboost_engine.predict(feat_df)
    pred_rec = PropertyPrediction(
        property_id=new_prop.id,
        estimated_price=pred_res["predicted_price"],
        price_per_sqft=pred_res["price_per_sqft"],
        confidence_indicator=pred_res["confidence_indicator"],
        model_version=pred_res["model_version"]
    )
    db.add(pred_rec)

    # Step 6: Run SHAP Explainability
    shap_res = shap_engine.explain(feat_df)
    shap_rec = ShapExplanation(
        property_id=new_prop.id,
        base_value=shap_res["base_value"],
        shap_values_json=json.dumps(shap_res["shap_values_dict"]),
        feature_names_json=json.dumps(list(feat_df.columns)),
        feature_values_json=json.dumps(feat_df.iloc[0].to_dict())
    )
    db.add(shap_rec)

    # Step 7: Add POIs
    pois = poi_service.get_nearby_pois(new_prop.latitude, new_prop.longitude, new_prop.city)
    for p in pois:
        db.add(PoiData(
            property_id=new_prop.id,
            category=p["category"],
            name=p["name"],
            distance_meters=p["distance_meters"],
            latitude=p.get("latitude"),
            longitude=p.get("longitude"),
            source=p.get("source", "Geoapify")
        ))

    db.commit()
    db.refresh(new_prop)
    return _format_property_response(new_prop)

@router.post("/{id}/images")
async def upload_property_image(
    id: int,
    file: UploadFile = File(...),
    is_cover: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin)
):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user.role != "admin" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add images to this property")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    safe_filename = f"prop_{id}_{int(os.times().elapsed * 1000)}{file_ext}"
    dest_path = settings.UPLOAD_DIR / safe_filename
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Analyze with Computer Vision Engine
    cv_res = vision_engine.analyze_image(str(dest_path))
    
    img_url = f"/uploads/{safe_filename}"
    img_rec = PropertyImage(
        property_id=id,
        image_url=img_url,
        is_cover=is_cover,
        visual_condition_score=cv_res["visual_condition_score"],
        quality_score=cv_res["quality_score"],
        tags_json=json.dumps(cv_res["detected_tags"])
    )
    db.add(img_rec)
    db.commit()
    db.refresh(img_rec)
    
    return {
        "id": img_rec.id,
        "image_url": img_rec.image_url,
        "is_cover": img_rec.is_cover,
        "cv_analysis": cv_res
    }

@router.put("/{id}")
def update_property(
    id: int,
    prop_in: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin)
):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user.role != "admin" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this property")
        
    for k, v in prop_in.model_dump(exclude_unset=True).items():
        setattr(prop, k, v)
        
    db.commit()
    db.refresh(prop)
    return _format_property_response(prop)

@router.delete("/{id}")
def delete_property(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin)
):
    prop = db.query(Property).filter(Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if current_user.role != "admin" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this property")
        
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}
