from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.poi_service import poi_service
from app.services.safety_service import safety_service
from app.models.property import Property

router = APIRouter(prefix="", tags=["Location & Safety"])

@router.get("/poi")
def get_points_of_interest(
    lat: float = Query(12.9716, description="Latitude"),
    lon: float = Query(77.5946, description="Longitude"),
    city: str = Query("Bangalore", description="City name")
) -> List[Dict[str, Any]]:
    return poi_service.get_nearby_pois(latitude=lat, longitude=lon, city=city)

@router.get("/safety/{property_id}")
def get_property_safety(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    return safety_service.get_safety_metrics(locality=prop.locality, city=prop.city)

@router.get("/locality/all")
def get_all_locality_benchmarks():
    from app.services.locality_service import locality_service
    return locality_service.get_all_localities()

@router.get("/locality/{name}/stats")
def get_locality_statistics(
    name: str, 
    property_type: Optional[str] = "apartment",
    db: Session = Depends(get_db)
):
    from app.services.locality_service import locality_service
    return locality_service.get_locality_stats(locality_name=name, db=db, property_type=property_type)

