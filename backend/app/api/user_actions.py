import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.property import Property
from app.models.interactions import Shortlist, SavedSearch, Notification, Enquiry
from app.schemas.interactions import (
    ShortlistResponse, CompareRequest, CompareResponse,
    EnquiryCreate, EnquiryResponse, SavedSearchCreate, NotificationResponse
)
from app.services.auth_service import get_current_user
from app.api.properties import _format_property_response

router = APIRouter(prefix="", tags=["User Workflows"])

# --- Shortlist ---
@router.get("/shortlist")
def get_user_shortlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shortlists = db.query(Shortlist).filter(Shortlist.user_id == current_user.id).all()
    results = []
    for item in shortlists:
        if item.property:
            results.append({
                "id": item.id,
                "property_id": item.property_id,
                "created_at": item.created_at,
                "property": _format_property_response(item.property)
            })
    return results

@router.post("/shortlist/{property_id}")
def add_to_shortlist(property_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    existing = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id,
        Shortlist.property_id == property_id
    ).first()
    
    if existing:
        return {"message": "Already shortlisted", "shortlist_id": existing.id}
        
    new_item = Shortlist(user_id=current_user.id, property_id=property_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Added to shortlist", "shortlist_id": new_item.id}

@router.delete("/shortlist/{property_id}")
def remove_from_shortlist(property_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Shortlist).filter(
        Shortlist.user_id == current_user.id,
        Shortlist.property_id == property_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shortlist entry not found")
        
    db.delete(item)
    db.commit()
    return {"message": "Removed from shortlist"}

# --- Compare 2 to 4 Properties ---
@router.post("/compare")
def compare_properties(req: CompareRequest, db: Session = Depends(get_db)):
    if len(req.property_ids) < 2 or len(req.property_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comparison requires between 2 and 4 properties"
        )
        
    props = db.query(Property).filter(Property.id.in_(req.property_ids)).all()
    if len(props) < 2:
        raise HTTPException(status_code=400, detail="Could not find enough matching properties to compare")
        
    prop_details = [_format_property_response(p) for p in props]
    
    # Construct side-by-side comparison matrix
    matrix = {
        "Property Title": [p["title"] for p in prop_details],
        "Property Type": [p["property_type"].capitalize() for p in prop_details],
        "Listed Price": [f"₹{p['price']:,.0f}" for p in prop_details],
        "AI Estimated Value": [f"₹{p['estimated_price']:,.0f}" if p['estimated_price'] else "N/A" for p in prop_details],
        "Price per sq.ft": [f"₹{round(p['price'] / max(1, p['area_sqft'])):,}/sqft" for p in prop_details],
        "Valuation Delta": [f"{p['price_delta_percent']:+.1f}%" if p['price_delta_percent'] is not None else "N/A" for p in prop_details],
        "Built-up Area": [f"{p['area_sqft']} sq.ft" for p in prop_details],
        "BHK Configuration": [f"{p['bhk']} BHK" for p in prop_details],
        "Bathrooms": [str(p['bathrooms']) for p in prop_details],
        "Furnishing": [p['furnishing'].title() for p in prop_details],
        "Property Age": [f"{p['property_age']} Years" for p in prop_details],
        "Locality & City": [f"{p['locality']}, {p['city']}" for p in prop_details],
        "Safety Index": [f"{p['safety_score']}/100" for p in prop_details],
        "Amenities Count": [str(len(p['amenities'])) for p in prop_details]
    }
    
    return {
        "properties": prop_details,
        "comparison_matrix": matrix
    }

# --- Notifications ---
@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.id.desc()).all()

@router.patch("/notifications/{id}/read")
def mark_notification_read(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}

@router.post("/notifications/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

# --- Enquiries ---
@router.post("/enquiries")
def send_enquiry(req: EnquiryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prop = db.query(Property).filter(Property.id == req.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    enquiry = Enquiry(
        property_id=prop.id,
        buyer_id=current_user.id,
        seller_id=prop.owner_id,
        buyer_name=req.buyer_name,
        buyer_email=req.buyer_email,
        buyer_phone=req.buyer_phone,
        message=req.message,
        status="pending"
    )
    db.add(enquiry)
    
    # Notify seller
    notif = Notification(
        user_id=prop.owner_id,
        title=f"New Enquiry for {prop.title}",
        message=f"{req.buyer_name} submitted an enquiry: '{req.message[:80]}...'",
        type="enquiry",
        link_url=f"/properties/{prop.id}"
    )
    db.add(notif)
    db.commit()
    return {"message": "Enquiry submitted successfully", "enquiry_id": enquiry.id}

@router.get("/enquiries/my-inbox")
def get_my_enquiries(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    enquiries = db.query(Enquiry).filter(Enquiry.seller_id == current_user.id).order_by(Enquiry.id.desc()).all()
    return [
        {
            "id": e.id,
            "property_id": e.property_id,
            "property_title": e.property.title if e.property else "Property",
            "buyer_name": e.buyer_name,
            "buyer_email": e.buyer_email,
            "buyer_phone": e.buyer_phone,
            "message": e.message,
            "status": e.status,
            "created_at": e.created_at
        } for e in enquiries
    ]

# --- Saved Searches ---
@router.get("/saved-searches")
def get_saved_searches(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SavedSearch).filter(SavedSearch.user_id == current_user.id).all()

@router.post("/saved-searches")
def create_saved_search(req: SavedSearchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = SavedSearch(
        user_id=current_user.id,
        title=req.title,
        criteria_json=json.dumps(req.criteria),
        alerts_enabled=req.alerts_enabled
    )
    db.add(item)
    db.commit()
    return {"message": "Saved search created", "id": item.id}
