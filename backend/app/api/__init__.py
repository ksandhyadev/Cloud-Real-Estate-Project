from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.properties import router as properties_router
from app.api.ml import router as ml_router
from app.api.location import router as location_router
from app.api.user_actions import router as user_actions_router
from app.api.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(properties_router)
api_router.include_router(ml_router)
api_router.include_router(location_router)
api_router.include_router(user_actions_router)
api_router.include_router(admin_router)
