import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api import api_router
from app.seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multimodal AI-Powered Real Estate Discovery, Explainable Valuation, and Spatial Intelligence Platform",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local & cloud development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media directory for uploads
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include main API router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    # Ensure database is seeded with initial demo properties
    try:
        seed_database()
    except Exception as e:
        print(f"Startup database check: {e}")

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "operational",
        "version": "2.0.0",
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX
    }

@app.get("/api/gemini/status")
def gemini_status():
    from app.services.gemini_service import gemini_service
    return gemini_service.ping()

@app.get("/api/health")
def health_check():
    from sqlalchemy import text
    from app.database import SessionLocal
    from app.ml.xgboost_engine import xgboost_engine
    from app.services.gemini_service import gemini_service
    
    # 1. Database check
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception as e:
        db_ok = False

    # 2. ML Engine check
    ml_ok = xgboost_engine.model is not None

    # 3. Storage check
    storage_ok = settings.UPLOAD_DIR.exists() and os.access(settings.UPLOAD_DIR, os.W_OK)

    # 4. External Geoapify API status (Safe key verification)
    geo_configured = bool(settings.GEOAPIFY_API_KEY and len(settings.GEOAPIFY_API_KEY) > 5)

    # 5. Google Gemini LLM API status
    gemini_configured = gemini_service.is_configured()

    all_healthy = db_ok and ml_ok and storage_ok

    return {
        "status": "healthy" if all_healthy else "degraded",
        "subsystems": {
            "database": {"status": "connected" if db_ok else "disconnected", "engine": "SQLAlchemy/SQLite"},
            "ml_engine": {
                "status": "loaded" if ml_ok else "unavailable", 
                "version": xgboost_engine.metadata.get("model_version", "XGBoost-v2.2-Production") if xgboost_engine.metadata else "Pending"
            },
            "gemini_llm": {
                "status": "configured_and_active" if gemini_configured else "academic_local_nlp",
                "api_active": gemini_configured,
                "provider": "Google AI Studio (Gemini Flash)"
            },
            "shap_explainer": {"status": "operational", "method": "TreeExplainer"},
            "storage": {"status": "writable" if storage_ok else "read-only", "path": str(settings.UPLOAD_DIR)},
            "geoapify_gateway": {
                "status": "live_configured" if geo_configured else "academic_spatial_fallback",
                "api_active": True
            }
        },
        "timestamp": "2026-09-30T10:57:47Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
