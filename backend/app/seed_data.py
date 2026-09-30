import json
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.property import Property, PropertyImage, PropertyAmenity
from app.models.ai_data import PropertyPrediction, ShapExplanation, NlpAnalysis, PoiData, SafetyIndicator
from app.models.interactions import Notification
from app.services.auth_service import get_password_hash
from app.ml.xgboost_engine import xgboost_engine
from app.ml.shap_engine import shap_engine
from app.ml.nlp_engine import nlp_engine
from app.services.poi_service import poi_service
from app.services.safety_service import safety_service

DEMO_PROPERTIES = [
    {
        "title": "Sobha Windsor Luxury 3 BHK Sky Residence",
        "description": "Experience ultra-luxury living at Sobha Windsor, Whitefield. Features expansive 3 BHK layout with imported italian marble flooring, panoramic balcony views, designer modular kitchen, vaastu compliant orientation, and dedicated servant quarter. Community provides grand clubhouse, heated swimming pool, 24x7 security, and landscaped gardens.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 18500000.0,
        "area_sqft": 1950.0,
        "bhk": 3,
        "bathrooms": 3,
        "furnishing": "semi-furnished",
        "property_age": 1,
        "parking_spaces": 2,
        "city": "Bangalore",
        "locality": "Whitefield",
        "address": "ECC Road, Whitefield, Bangalore, Karnataka 560066",
        "latitude": 12.9698,
        "longitude": 77.7499,
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Swimming Pool", "Clubhouse", "Gymnasium", "24x7 Security", "Covered Parking", "Power Backup", "Jogging Track", "Piped Gas"]
    },
    {
        "title": "Palm Meadows Contemporary 4 BHK Private Villa",
        "description": "Exquisite bespoke 4 BHK independent villa situated in prestigious Palm Meadows gated enclave. Boasting private plunge pool, lush zen garden terrace, double-height living room, smart home automation, wooden flooring, and covered double car parking. Unmatched privacy with 24x7 manned perimeter security.",
        "listing_type": "buy",
        "property_type": "villa",
        "price": 42000000.0,
        "area_sqft": 3600.0,
        "bhk": 4,
        "bathrooms": 5,
        "furnishing": "fully-furnished",
        "property_age": 3,
        "parking_spaces": 3,
        "city": "Bangalore",
        "locality": "Whitefield",
        "address": "Ramagondanahalli, Varthur Main Rd, Whitefield, Bangalore 560066",
        "latitude": 12.9567,
        "longitude": 77.7289,
        "images": [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Private Pool", "Landscaped Garden", "Smart Home", "Clubhouse", "Tennis Court", "24x7 Security", "Solar Heating", "Power Backup"]
    },
    {
        "title": "Sea-Facing Signature Penthouse in Bandra West",
        "description": "Iconic triplex penthouse overlooking the Arabian Sea in prime Bandra West. Features private express elevator, wrap-around sunset deck, italian marble floors, state-of-the-art jacuzzi, custom German modular kitchen, and smart automated climate control. The pinnacle of coastal luxury living.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 85000000.0,
        "area_sqft": 3200.0,
        "bhk": 4,
        "bathrooms": 4,
        "furnishing": "fully-furnished",
        "property_age": 2,
        "parking_spaces": 3,
        "city": "Mumbai",
        "locality": "Bandra West",
        "address": "Carter Road, Bandra West, Mumbai, Maharashtra 400050",
        "latitude": 19.0657,
        "longitude": 72.8288,
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Sea View", "Private Elevator", "Jacuzzi", "Infinity Pool", "Concierge Service", "Gymnasium", "Valet Parking", "24x7 Security"]
    },
    {
        "title": "Architect-Designed Green Independent House",
        "description": "Serene 3 BHK architect-designed independent house facing green park in Hauz Khas. Features solar-powered grid, rainwater harvesting, open courtyards with natural cross-ventilation, teak wood cabinetry, and spacious private terrace. Fully vaastu compliant and in brand new ready to move condition.",
        "listing_type": "buy",
        "property_type": "house",
        "price": 31000000.0,
        "area_sqft": 2400.0,
        "bhk": 3,
        "bathrooms": 3,
        "furnishing": "semi-furnished",
        "property_age": 2,
        "parking_spaces": 2,
        "city": "Delhi",
        "locality": "Hauz Khas",
        "address": "Block C, Hauz Khas Enclave, New Delhi 110016",
        "latitude": 28.5432,
        "longitude": 77.2065,
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Park Facing", "Solar Power", "Rainwater Harvesting", "Private Terrace", "Covered Parking", "Piped Gas", "Security"]
    },
    {
        "title": "Premium Gated Villa Plot with Clear Titles",
        "description": "Prime residential villa plot situated in a gated community near Bangalore International Airport corridor. Boasts underground electrical cabling, wide 40-foot asphalt roads, avenue plantation, 24x7 security surveillance, and clubhouse amenities. Ready for immediate luxury villa construction.",
        "listing_type": "plot",
        "property_type": "plot",
        "price": 11500000.0,
        "area_sqft": 2400.0,
        "bhk": 0,
        "bathrooms": 0,
        "furnishing": "unfurnished",
        "property_age": 0,
        "parking_spaces": 0,
        "city": "Bangalore",
        "locality": "Whitefield",
        "address": "Prestige Sanctuary Road, Bangalore North 562110",
        "latitude": 13.1986,
        "longitude": 77.7066,
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Gated Community", "Clubhouse", "24x7 Security", "Underground Cabling", "Street Lighting", "Children Play Area"]
    },
    {
        "title": "Designer Furnished 2 BHK Rental Near Metro",
        "description": "Stylishly decorated 2 BHK apartment for rent in 100 Feet Road, Indiranagar. Fully furnished with high-end appliances, smart OLED TV, high-speed fiber internet, workstations, and comfortable plush upholstery. Just 300 meters from Indiranagar Metro Station.",
        "listing_type": "rent",
        "property_type": "apartment",
        "price": 65000.0,
        "area_sqft": 1150.0,
        "bhk": 2,
        "bathrooms": 2,
        "furnishing": "fully-furnished",
        "property_age": 2,
        "parking_spaces": 1,
        "city": "Bangalore",
        "locality": "Indiranagar",
        "address": "12th Main Rd, HAL 2nd Stage, Indiranagar, Bangalore 560038",
        "latitude": 12.9719,
        "longitude": 77.6412,
        "images": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Walking to Metro", "Lift", "Covered Parking", "Power Backup", "Wi-Fi Enabled", "Security", "Piped Gas"]
    },
    {
        "title": "Skyview 3 BHK in HITEC City Financial District",
        "description": "High-rise 3 BHK flat with serene cyber-city views in Gachibowli, Hyderabad. Complete with double glazed soundproof windows, wooden flooring in master bedroom, premium fixtures, and access to infinity rooftop pool. Ideal for tech professionals.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 16800000.0,
        "area_sqft": 1820.0,
        "bhk": 3,
        "bathrooms": 3,
        "furnishing": "semi-furnished",
        "property_age": 1,
        "parking_spaces": 2,
        "country": "India",
        "state": "Telangana",
        "city": "Hyderabad",
        "locality": "Gachibowli",
        "address": "Financial District, Nanakramguda, Hyderabad 500032",
        "latitude": 17.4168,
        "longitude": 78.3428,
        "images": [
            "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Rooftop Infinity Pool", "Gymnasium", "Clubhouse", "24x7 Security", "EV Charging", "Jogging Track", "Power Backup"]
    },
    {
        "title": "HSR Gardenia 3 BHK Luxury Apartment in Sector 2",
        "description": "Premium 3 BHK home in prime HSR Layout Sector 2. Walking distance to popular cafes, tech startups, and green parks. Features teak wood doors, modular island kitchen, 100% vaastu compliant design, imported fittings, and 2 dedicated basement car parking slots.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 21000000.0,
        "area_sqft": 1850.0,
        "bhk": 3,
        "bathrooms": 3,
        "furnishing": "semi-furnished",
        "property_age": 1,
        "parking_spaces": 2,
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "locality": "HSR Layout",
        "address": "14th Main Rd, Sector 2, HSR Layout, Bengaluru, Karnataka 560102",
        "latitude": 12.9116,
        "longitude": 77.6476,
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Clubhouse", "Gymnasium", "Covered Parking", "24x7 Security", "Power Backup", "Rainwater Harvesting"]
    },
    {
        "title": "Koramangala 4 BHK Signature Sky Penthouse",
        "description": "Ultra exclusive 4 BHK penthouse in Koramangala 4th Block. Offers panoramic city skyline view, private terrace plunge jacuzzi, double-height ceiling, Italian marble living lounge, and biometric smart door access. Near major corporate headquarters.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 48000000.0,
        "area_sqft": 3400.0,
        "bhk": 4,
        "bathrooms": 4,
        "furnishing": "fully-furnished",
        "property_age": 2,
        "parking_spaces": 3,
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "locality": "Koramangala",
        "address": "4th Block, Koramangala, Bengaluru, Karnataka 560034",
        "latitude": 12.9345,
        "longitude": 77.6265,
        "images": [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Private Terrace", "Jacuzzi", "Smart Home", "Infinity Pool", "Clubhouse", "24x7 Security", "Concierge"]
    },
    {
        "title": "Mysore Heritage Independent Villa in Gokulam",
        "description": "Classic Karnataka heritage-styled 4 BHK independent villa in Gokulam 3rd Stage, Mysore. Built with traditional red oxide and Athangudi tiles, internal open courtyard, wooden pillar architecture, and landscaped fruit garden. Quiet, high-safety cultural hub.",
        "listing_type": "buy",
        "property_type": "villa",
        "price": 24500000.0,
        "area_sqft": 2800.0,
        "bhk": 4,
        "bathrooms": 4,
        "furnishing": "semi-furnished",
        "property_age": 4,
        "parking_spaces": 2,
        "country": "India",
        "state": "Karnataka",
        "city": "Mysore",
        "locality": "Gokulam",
        "address": "Gokulam 3rd Stage, Mysuru, Karnataka 570002",
        "latitude": 12.3300,
        "longitude": 76.6340,
        "images": [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Private Garden", "Solar Water Heating", "Rainwater Harvesting", "Covered Parking", "Paved Courtyard"]
    },
    {
        "title": "Kadri Hills Coastal View 3 BHK Flat",
        "description": "Breezy 3 BHK apartment in Kadri Hills, Mangalore with panoramic lush valley views. Featuring cross-ventilation, granite kitchen counters, premium CP fittings, high-speed elevators, and backup generator. Proximity to reputed schools and hospitals.",
        "listing_type": "buy",
        "property_type": "apartment",
        "price": 9800000.0,
        "area_sqft": 1600.0,
        "bhk": 3,
        "bathrooms": 3,
        "furnishing": "unfurnished",
        "property_age": 1,
        "parking_spaces": 1,
        "country": "India",
        "state": "Karnataka",
        "city": "Mangalore",
        "locality": "Kadri",
        "address": "Kadri Hills, Mangaluru, Karnataka 575004",
        "latitude": 12.8797,
        "longitude": 74.8560,
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        ],
        "amenities": ["Power Backup", "Gymnasium", "Covered Parking", "24x7 Security", "Children Play Area"]
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains users. Skipping duplicate seeding.")
            return

        print("Seeding initial users (admin, seller, buyer)...")
        admin = User(
            email="admin@realestate.ai",
            hashed_password=get_password_hash("Admin@12345"),
            full_name="Platform Administrator",
            role="admin",
            phone="+91 9876543210"
        )
        seller = User(
            email="seller@realestate.ai",
            hashed_password=get_password_hash("Seller@12345"),
            full_name="Rajesh Sharma (Verified Seller)",
            role="seller",
            phone="+91 9845012345"
        )
        buyer = User(
            email="buyer@realestate.ai",
            hashed_password=get_password_hash("Buyer@12345"),
            full_name="Priya Patel (Home Seeker)",
            role="buyer",
            phone="+91 9731054321"
        )
        db.add_all([admin, seller, buyer])
        db.commit()
        db.refresh(seller)
        db.refresh(buyer)

        print("Seeding demo properties and running multimodal AI evaluations...")
        for prop_dict in DEMO_PROPERTIES:
            # 1. Create property
            prop = Property(
                owner_id=seller.id,
                title=prop_dict["title"],
                description=prop_dict["description"],
                listing_type=prop_dict["listing_type"],
                property_type=prop_dict["property_type"],
                price=prop_dict["price"],
                area_sqft=prop_dict["area_sqft"],
                bhk=prop_dict["bhk"],
                bathrooms=prop_dict.get("bathrooms", 2),
                furnishing=prop_dict.get("furnishing", "semi-furnished"),
                property_age=prop_dict.get("property_age", 1),
                parking_spaces=prop_dict.get("parking_spaces", 1),
                country=prop_dict.get("country", "India"),
                state=prop_dict.get("state", "Karnataka"),
                city=prop_dict.get("city", "Bangalore"),
                locality=prop_dict.get("locality", "Whitefield"),
                address=prop_dict.get("address", "Bangalore, Karnataka"),
                latitude=prop_dict.get("latitude", 12.9716),
                longitude=prop_dict.get("longitude", 77.5946),
                status="approved"
            )
            db.add(prop)
            db.commit()
            db.refresh(prop)

            # 2. Add images
            for idx, img_url in enumerate(prop_dict["images"]):
                db.add(PropertyImage(
                    property_id=prop.id,
                    image_url=img_url,
                    is_cover=(idx == 0),
                    visual_condition_score=8.7,
                    quality_score=9.1,
                    tags_json=json.dumps(["High Quality", "Natural Light", "Modern Architecture"])
                ))

            # 3. Add amenities
            for am in prop_dict["amenities"]:
                db.add(PropertyAmenity(property_id=prop.id, amenity_name=am))

            # 4. NLP Analysis
            nlp_res = nlp_engine.analyze_description(prop_dict["description"])
            db.add(NlpAnalysis(
                property_id=prop.id,
                luxury_score=nlp_res["luxury_score"],
                extracted_amenities_json=json.dumps(nlp_res["extracted_amenities"]),
                condition_indicators_json=json.dumps(nlp_res["condition_indicators"]),
                premium_keywords_json=json.dumps(nlp_res["premium_keywords"]),
                summary=nlp_res["summary"]
            ))

            # 5. Safety Indicators
            safety_res = safety_service.get_safety_metrics(locality=prop.locality, city=prop.city)
            db.add(SafetyIndicator(
                property_id=prop.id,
                safety_index=safety_res["safety_index"],
                crime_rating=safety_res["crime_rating"],
                flood_risk=safety_res["flood_risk"],
                traffic_congestion=safety_res["traffic_congestion"],
                data_source=safety_res["data_source"]
            ))

            # 6. XGBoost Prediction & SHAP Explainability
            feat_df = xgboost_engine.prepare_feature_vector(
                area_sqft=prop.area_sqft,
                bhk=prop.bhk,
                bathrooms=prop.bathrooms,
                property_age=prop.property_age,
                parking_spaces=prop.parking_spaces,
                property_type=prop.property_type,
                furnishing=prop.furnishing,
                locality=prop.locality,
                amenities=prop_dict["amenities"],
                description=prop.description,
                safety_score=safety_res["safety_index"]
            )
            
            # Predict
            pred_res = xgboost_engine.predict(feat_df)
            db.add(PropertyPrediction(
                property_id=prop.id,
                estimated_price=pred_res["predicted_price"],
                price_per_sqft=pred_res["price_per_sqft"],
                confidence_indicator=pred_res["confidence_indicator"],
                model_version=pred_res["model_version"]
            ))

            # SHAP
            shap_res = shap_engine.explain(feat_df)
            db.add(ShapExplanation(
                property_id=prop.id,
                base_value=shap_res["base_value"],
                shap_values_json=json.dumps(shap_res["shap_values_dict"]),
                feature_names_json=json.dumps(list(feat_df.columns)),
                feature_values_json=json.dumps(feat_df.iloc[0].to_dict())
            ))

            # 7. POIs
            pois = poi_service.get_nearby_pois(prop.latitude, prop.longitude, prop.city)
            for p in pois:
                db.add(PoiData(
                    property_id=prop.id,
                    category=p["category"],
                    name=p["name"],
                    distance_meters=p["distance_meters"],
                    latitude=p.get("latitude"),
                    longitude=p.get("longitude"),
                    source=p.get("source", "Geoapify")
                ))

            db.commit()

        # Seed initial notification for buyer
        db.add(Notification(
            user_id=buyer.id,
            title="AI Property Intelligence Ready",
            message="Explore explainable property valuations with SHAP decomposition on Sobha Windsor and Palm Meadows.",
            type="info"
        ))
        db.commit()
        print("Database seeding completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
