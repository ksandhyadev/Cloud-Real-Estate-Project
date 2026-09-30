import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["subsystems"]["database"]["status"] == "connected"
    assert data["subsystems"]["ml_engine"]["status"] == "loaded"

def test_auth_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "buyer@realestate.ai", "password": "Buyer@12345"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "buyer@realestate.ai"

def test_get_properties():
    response = client.get("/api/properties")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 5
    first = items[0]
    assert "title" in first
    assert "estimated_price" in first
    assert "price_per_sqft" in first
    assert "safety_score" in first

def test_property_filters():
    # Filter by apartment
    response = client.get("/api/properties?property_type=apartment")
    assert response.status_code == 200
    for prop in response.json():
        assert prop["property_type"] == "apartment"

    # Filter by buy
    response_buy = client.get("/api/properties?listing_type=buy")
    assert response_buy.status_code == 200
    for prop in response_buy.json():
        assert prop["listing_type"] == "buy"

def test_property_detail_with_ai():
    # Get first property
    props = client.get("/api/properties").json()
    prop_id = props[0]["id"]
    
    response = client.get(f"/api/properties/{prop_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == prop_id
    assert "prediction_details" in detail
    assert "shap_details" in detail
    assert "nlp_details" in detail
    assert "safety_details" in detail
    assert "pois" in detail
    assert "comparables" in detail
    assert "scorecard" in detail
    assert "factual_insights" in detail
    assert "locality_benchmark" in detail
    assert "historical_trend" in detail
    assert "anomaly_detection" in detail
    assert "data_sources" in detail
    assert len(detail["comparables"]) >= 1
    assert len(detail["scorecard"]["dimensions"]) == 7

def test_ml_prediction_endpoint():
    payload = {
        "area_sqft": 1800,
        "bhk": 3,
        "bathrooms": 3,
        "property_age": 2,
        "parking_spaces": 1,
        "property_type": "apartment",
        "furnishing": "semi-furnished",
        "city": "Bangalore",
        "locality": "Whitefield",
        "amenities": ["Swimming Pool", "Clubhouse"],
        "description": "Spacious luxury flat with modern finish and marble floors"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["predicted_price"] > 0
    assert len(res["positive_drivers"]) > 0
    assert "model_confidence_indicator" in res
    assert "prediction_range" in res
    assert res["prediction_range"]["low"] < res["predicted_price"] < res["prediction_range"]["high"]
    assert "locality_reference" in res

def test_model_info_metrics():
    response = client.get("/api/ml/model-info")
    assert response.status_code == 200
    meta = response.json()
    assert "r2_score" in meta
    assert meta["r2_score"] > 0.95
    assert "mae" in meta
    assert "cv_5fold_r2_mean" in meta

def test_locality_stats():
    response = client.get("/api/locality/whitefield/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["city"] == "Bangalore"
    assert stats["median_rate_sqft"] > 5000
    assert "quarterly_history" in stats
    assert len(stats["quarterly_history"]) == 8

def test_comparables_endpoint():
    props = client.get("/api/properties").json()
    prop_id = props[0]["id"]
    response = client.get(f"/api/properties/{prop_id}/comparables")
    assert response.status_code == 200
    comps = response.json()
    assert len(comps) >= 1
    assert "similarity_score" in comps[0]
    assert "similarity_factors" in comps[0]

def test_scorecard_endpoint():
    props = client.get("/api/properties").json()
    prop_id = props[0]["id"]
    response = client.get(f"/api/properties/{prop_id}/scorecard")
    assert response.status_code == 200
    sc = response.json()
    assert "overall_score" in sc
    assert len(sc["dimensions"]) == 7
    # Verify documented calculation methods
    for d in sc["dimensions"]:
        assert "calculation_method" in d
        assert len(d["calculation_method"]) > 10

def test_smart_natural_language_search():
    query = "2 BHK in Whitefield under 90 lakh near metro"
    response = client.get(f"/api/properties/smart/search?q={query}")
    assert response.status_code == 200
    data = response.json()
    assert "parser_output" in data
    f = data["parser_output"]["filters"]
    assert f.get("bhk") == 2
    assert "Whitefield" in f.get("locality", "")
    assert f.get("max_price") == 9000000.0

def test_seller_audit_listing():
    draft = {
        "title": "Modern 2 BHK Flat",
        "description": "Lovely flat in Whitefield with gym and balcony.",
        "price": 8500000,
        "area_sqft": 1200,
        "bhk": 2,
        "bathrooms": 2,
        "parking_spaces": 1,
        "locality": "Whitefield",
        "amenities": ["Gym", "Balcony", "Security"],
        "images": [{"url": "test.jpg"}, {"url": "test2.jpg"}]
    }
    response = client.post("/api/seller/audit-listing", json=draft)
    assert response.status_code == 200
    res = response.json()
    assert "quality_score" in res
    assert "suggestions" in res
    assert "pricing_analysis" in res

def test_nlp_endpoint():
    payload = {"text": "Ultra luxury penthouse with panoramic views, italian marble, and private elevator."}
    response = client.post("/api/nlp", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["luxury_score"] >= 6.0
    assert "panoramic" in str(res["premium_keywords"]).lower() or "penthouse" in str(res["premium_keywords"]).lower()

def test_compare_properties():
    props = client.get("/api/properties").json()
    ids = [props[0]["id"], props[1]["id"]]
    response = client.post("/api/compare", json={"property_ids": ids})
    assert response.status_code == 200
    comp = response.json()
    assert "comparison_matrix" in comp
    assert len(comp["properties"]) == 2

def test_decision_support():
    props = client.get("/api/properties").json()
    prop_id = props[0]["id"]
    response = client.get(f"/api/properties/{prop_id}/decision-support")
    assert response.status_code == 200
    data = response.json()
    assert "valuation_verdict" in data
    assert "evidence_checklist" in data
    assert len(data["evidence_checklist"]) >= 4

