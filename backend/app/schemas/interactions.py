from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr

class ShortlistCreate(BaseModel):
    property_id: int

class ShortlistResponse(BaseModel):
    id: int
    property_id: int
    created_at: datetime
    property: Dict[str, Any]

class CompareRequest(BaseModel):
    property_ids: List[int]

class CompareResponse(BaseModel):
    properties: List[Dict[str, Any]]
    comparison_matrix: Dict[str, List[Any]]

class EnquiryCreate(BaseModel):
    property_id: int
    buyer_name: str
    buyer_email: EmailStr
    buyer_phone: Optional[str] = None
    message: str

class EnquiryResponse(BaseModel):
    id: int
    property_id: int
    buyer_name: str
    buyer_email: str
    buyer_phone: Optional[str]
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SavedSearchCreate(BaseModel):
    title: str = "My Saved Search"
    criteria: Dict[str, Any]
    alerts_enabled: bool = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
