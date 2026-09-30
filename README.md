# Cloud-Based Real Estate Analysis — AI Property Intelligence Platform
### Engineering Major Project Prototype | Autonomous Multimodal Valuation & Spatial Intelligence

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB.svg?logo=react)](https://react.dev)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost_R2_0.989-FF6600.svg)](https://xgboost.ai)
[![SHAP](https://img.shields.io/badge/XAI-SHAP_TreeExplainer-10B981.svg)](https://shap.readthedocs.io)
[![PyTorch](https://img.shields.io/badge/CV-PyTorch_MobileNetV2-EE4C2C.svg?logo=pytorch)](https://pytorch.org)
[![OpenCV](https://img.shields.io/badge/Vision-OpenCV_5.0-5C3EE8.svg?logo=opencv)](https://opencv.org)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet_OpenStreetMap-199900.svg?logo=leaflet)](https://leafletjs.com)
[![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED.svg?logo=docker)](https://docker.com)

---

## 1. Executive Summary & Academic Scope

**Cloud-Based Real Estate Analysis** is an engineering major project prototype that combines modern property discovery, seller listing workflows, and side-by-side comparison with an explainable multimodal Artificial Intelligence engine.

### Core Research Purpose:
> **"Analyze a property using structured, textual, visual, and location-based information and provide an explainable estimate of its value."**

### Key Research Contributions:
1. **Multimodal Feature Synthesis**: Fuses tabular structural specs (built-up area, BHK, age, bathrooms), natural language text signals (luxury vocabulary, condition markers), visual features (PyTorch MobileNetV2 CNN embeddings + OpenCV Laplacian sharpness), and GIS spatial POIs (Geoapify proximity to schools, hospitals, transit, shopping).
2. **Explainable AI (XAI)**: Eliminates the algorithmic "black box" by computing authentic Shapley marginal contributions via `shap.TreeExplainer` on the trained XGBoost regressor ($R^2 \approx 0.989$).
3. **Phase-II AI Property Decision-Support Layer**: Answers 8 critical buyer/renter questions uniting listed price, AI valuation, positive/negative drivers, POIs, and environmental risks without prescribing biased "buy" mandates.
4. **Honest Academic Metrics**: Explicitly reports a calibrated `"Model Confidence Indicator"` and clearly identifies benchmark simulated data to ensure ethical AI transparency.

---

## 2. Geographic Hierarchy & Market Focus

The system is architected around a strict geographic hierarchy:
```
Country (India)
 └── State (Karnataka, Maharashtra, Delhi, Telangana)
      └── City (Bangalore / Bengaluru, Mysore, Mangalore, Mumbai, Delhi, Hyderabad)
           └── Locality (Whitefield, Indiranagar, HSR Layout, Koramangala, Bellandur, Gokulam, Kadri, Bandra West, Hauz Khas, Gachibowli)
                └── Property Listing
```

- **Primary Geographic Focus**: **Bangalore / Bengaluru, Karnataka, India**.
- **Supported Karnataka Regional Hubs**: Mysore (Mysuru), Mangalore (Mangaluru).
- **Supported Metropolitan Corridors**: Mumbai, Delhi NCR, Hyderabad.

---

## 3. System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │   Client Tier: React 18 + Vite + Vanilla CSS │
                    │   (Map View, SHAP Waterfall, Comparison, UI) │
                    └──────────────────────┬───────────────────────┘
                                           │  REST API / JWT Bearer
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       Application Tier: FastAPI (Python)     │
                    │   Routers: Auth, Properties, ML, POI, Admin  │
                    └──────┬───────────────┬───────────────┬───────┘
                           │               │               │
            ┌──────────────▼────┐   ┌──────▼──────┐   ┌────▼─────────────┐
            │ SQLAlchemy Relational │   │ Geoapify    │   │ Local Media      │
            │ SQLite / PostgreSQL   │   │ Places API  │   │ /uploads Static  │
            └───────────────────┘   └─────────────┘   └──────────────────┘
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │          Multimodal AI & XAI Pipeline        │
                    ├──────────────────────────────────────────────┤
                    │ 1. XGBoost Regressor (Trained with R² ~0.989)│
                    │ 2. SHAP TreeExplainer (Shapley Attributions) │
                    │ 3. NLP Tokenizer (Luxury & Amenities Signal) │
                    │ 4. PyTorch MobileNetV2 CNN + OpenCV Laplacian│
                    │ 5. Decision Support Synthesizer              │
                    └──────────────────────────────────────────────┘
```

---

## 4. Technology Stack

| Layer | Component | Technologies Used |
|---|---|---|
| **Frontend** | Framework & Build | React 18, Vite 5, Vanilla Modern CSS (Tailored HSL Slate tokens) |
| | Mapping & Visuals | Leaflet, React-Leaflet, OpenStreetMap tiles |
| | Icons & UX | Lucide-React |
| **Backend** | REST API Framework | FastAPI 0.110+, Uvicorn (ASGI) |
| | Data Validation | Pydantic v2 (Strict typing, EmailStr) |
| | Security & Auth | PyJWT, Direct `bcrypt` password hashing |
| | ORM & Database | SQLAlchemy 2.0, SQLite (Dev) / PostgreSQL (Prod ready) |
| **Machine Learning**| Regressor | XGBoost (`XGBRegressor` with 180 estimators, max_depth=5) |
| | Explainability | SHAP (`shap.TreeExplainer` calculating exact $\phi_i$ attributions) |
| | Deep Learning / CV | PyTorch 2.14+, Torchvision (MobileNetV2), OpenCV (`cv2`) |
| | NLP Engine | Regex token extractors & lexical domain weighting |
| **Location / POI** | Spatial Intelligence | Geoapify Places API (with resilient offline cache & fallback) |
| **DevOps / Cloud** | Containers & Deploy | Docker, Docker Compose, AWS EC2 / Lightsail ready |

---

## 5. Quick Start Guide (Running Locally)

### Prerequisites:
- Python 3.10+
- Node.js v18+ (Tested on Node v24)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/cloud-real-estate-analysis.git
cd "cloud-real-estate-analysis"
```

### Step 2: Backend Setup
```bash
# 1. Create Python virtual environment
python -m venv backend/venv

# 2. Activate virtual environment (Windows PowerShell)
.\backend\venv\Scripts\Activate.ps1
# (On Linux / macOS: source backend/venv/bin/activate)

# 3. Install backend dependencies
pip install -r backend/requirements.txt
pip install opencv-python-headless torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 4. Train model & Seed realistic demo database
$env:PYTHONPATH="backend"
python -m app.seed_data

# 5. Launch FastAPI development server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be running at:* `http://127.0.0.1:8000`  
*Swagger Documentation:* `http://127.0.0.1:8000/docs`

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# 1. Install NPM packages
npm install

# 2. Run Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend will be running at:* `http://127.0.0.1:5173`

---

## 6. Pre-Configured Test Accounts (1-Click Login)

The platform includes 3 pre-seeded demo user accounts:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Buyer / Renter** | `buyer@realestate.ai` | `Buyer@12345` | Discover, filter, inspect SHAP waterfalls, shortlist, side-by-side compare, send enquiries |
| **Seller / Owner** | `seller@realestate.ai` | `Seller@12345` | 7-step property posting wizard, upload images, run live AI pre-valuation, manage listings |
| **Administrator** | `admin@realestate.ai` | `Admin@12345` | Moderation queue, approve/reject community listings, audit platform statistics |

*Tip: You can click the **"Demo Login"** button on the top right navbar to sign in instantly with one click.*

---

## 7. Core Feature Walkthrough

### 1. Home Page & Multi-Tab Search
- "What are you looking for?" multi-tab query bar supporting **Buy**, **Rent**, and **Plot/Land**.
- Category selector pills (Apartment, Villa, House, Plot, Commercial).
- Highlights verified listings with live AI estimated price and valuation delta pills.

### 2. Search & Filtering Interface
- 2-Column responsive layout with collapsible left filter sidebar and right results feed.
- Multi-criteria filters: Purpose, Property type, Price slider, BHK buttons, City, Locality text search, Furnishing, Minimum neighborhood safety threshold.
- Instant toggle between **Grid View** and interactive **Leaflet Map View**.

### 3. 7-Step "Post Property" Wizard
- Step 1: Basic Information (Sell/Rent, Property type, Title, Area, Price, BHK)
- Step 2: Location (City, Locality, Address, Coordinates)
- Step 3: Property Details (Bathrooms, Age, Parking, Amenities check-grid)
- Step 4: Images (Multi-file upload with OpenCV sharpness & brightness assessment)
- Step 5: Description (Text area with live NLP luxury signal extraction)
- Step 6: Review (Summary card)
- Step 7: AI Pre-Valuation & Submit (Runs live XGBoost + SHAP calculation before final publishing)

### 4. Explainable AI (SHAP Waterfall) Section
- Displays: `"Why does the AI estimate this value?"`
- Decomposes the market base value ($E[X]$) into exact positive value enhancers (green bars) and discount factors (red/amber bars).
- Includes an expandable technical modal showing exact mathematical $\phi_i$ values and Shapley efficiency equations for project viva demonstration.

### 5. Side-by-Side Property Comparison Matrix
- Compare between 2 and 4 selected properties across 14 factual metrics: Price, AI Valuation, Price/sq.ft, Valuation Delta %, BHK, Area, Bathrooms, Furnishing, Property Age, Locality, Safety Index, and Amenities.
- Free of subjective "winner" scores, allowing buyers to perform unbiased evaluation.

### 6. Phase-II Integrated AI Decision Support Layer
- Directly synthesizes:
  1. Listed Price
  2. Model-Estimated Value
  3. Key Influencing Factors (SHAP)
  4. Geospatial Context
  5. Nearby Facilities (Geoapify POIs)
  6. Risk & Safety Benchmarks
  7. Textual Characteristics (NLP)
  8. Comparative Benchmarking against Shortlist

### 7. Downloadable / Printable AI Valuation Dossier
- Instant 1-click printable PDF report generating clean, multi-section property intelligence dossiers for buyers, sellers, and examiners.

---

## 8. Docker Deployment

Launch both backend and frontend services using Docker Compose:

```bash
# Build and run multi-container environment
docker compose up --build -d
```
- Frontend: `http://localhost`
- Backend API: `http://localhost:8000`

---

## 9. AWS Low-Cost Deployment Strategy

The application is container-ready for AWS free-tier and low-cost deployment:

1. **Option A: AWS Lightsail Containers (Recommended for College Projects)**
   - Cost: ~$7–$10/month (or free tier eligible).
   - Single-container deployment running `docker-compose.yml`.
2. **Option B: AWS EC2 t3.micro (Free Tier)**
   - Launch Ubuntu 22.04 LTS `t3.micro`.
   - Install Docker & Docker Compose:
     ```bash
     sudo apt update && sudo apt install -y docker.io docker-compose
     ```
   - Clone repository, run `docker compose up -d`.
   - Assign Elastic IP and map DNS.

---

## 10. Viva / Academic Defense Preparation Guide

When defending this project before external examiners, emphasize the following points:

- **Q: Why XGBoost over standard Multiple Linear Regression or Random Forest?**  
  *A:* Real estate valuations have complex non-linear feature interactions (e.g., area value diminishes with higher property age, but is amplified by high-tier locality coefficients). XGBoost gradient boosted decision trees provide superior gradient descent optimization with regularization ($L_1 / L_2$) preventing overfitting, achieving an $R^2 \approx 0.989$.
- **Q: Why SHAP (SHapley Additive exPlanations)?**  
  *A:* Unlike heuristic feature importance (e.g., Gini impurity) which only gives global rankings, SHAP TreeExplainer computes local attribution for *each individual property*. It guarantees efficiency ($\sum \phi_i = f(x) - E[X]$) and symmetry based on game-theoretic principles.
- **Q: How does the system handle missing external APIs?**  
  *A:* The architecture follows the **Graceful Degradation** design pattern. If the Geoapify API key is absent, rate-limited, or offline, the POI service transparently falls back to a realistic spatial benchmark dataset without crashing the UI.
- **Q: How is the decision support layer distinct from a recommendation system?**  
  *A:* Traditional recommendation systems push black-box "Buy this" directives. Our Phase-II Decision Support Layer acts as an *evidence aggregator*, surfacing factual trade-offs (price delta, SHAP drivers, POI transit proximity, environmental flood risk) to empower human decision autonomy.

---

## 11. Automated Testing

Run the backend Pytest test suite:
```bash
$env:PYTHONPATH="backend"
pytest backend/tests/test_api.py -v
```

All 9 comprehensive tests verify:
- API Health & Uptime
- Authentication & JWT Token Issuance
- Property Listing & Geographic Filters
- Detailed Multimodal Property Retrieval
- On-Demand XGBoost Price Prediction
- SHAP Feature Decomposition
- NLP Text Analyzer
- Side-by-Side Property Comparison Matrix
- Phase-II Integrated Decision Support Layer

---

## 12. License & Academic Attribution
Developed as an Engineering Major Project in Computer Science & Engineering.  
Designed and implemented with production-grade modularity, explainability, and full-stack software engineering standards.
