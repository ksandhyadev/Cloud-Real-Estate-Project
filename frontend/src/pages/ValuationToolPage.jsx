import React, { useState } from 'react';
import { Sparkles, Calculator, Cpu, BarChart3, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { formatPrice } from '../components/PropertyCard';
import ShapWaterfallChart from '../components/ShapWaterfallChart';

export default function ValuationToolPage() {
  const [params, setParams] = useState({
    area_sqft: 1850,
    bhk: 3,
    bathrooms: 3,
    property_age: 2,
    parking_spaces: 2,
    property_type: 'apartment',
    furnishing: 'semi-furnished',
    city: 'Bangalore',
    locality: 'Whitefield',
    amenities: ['Swimming Pool', 'Clubhouse', 'Gymnasium', '24x7 Security', 'Covered Parking'],
    description: 'Luxurious 3 BHK apartment featuring italian marble flooring, panoramic views, modular kitchen, and modern clubhouse access.'
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const availableAmenities = [
    'Swimming Pool', 'Clubhouse', 'Gymnasium', '24x7 Security', 
    'Covered Parking', 'Power Backup', 'Jogging Track', 'Piped Gas'
  ];

  const updateParam = (key, val) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  const toggleAmenity = (am) => {
    setParams(prev => {
      const exists = prev.amenities.includes(am);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== am) : [...prev.amenities, am]
      };
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.predictPrice(params);
      setPredictionResult(res);
    } catch (err) {
      alert("Valuation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '980px' }}>
      
      {/* Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
          <Cpu size={14} /> Interactive Machine Learning Sandbox
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
          Real-Time AI Property Valuator
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0.5rem auto 0 auto', lineHeight: 1.6 }}>
          Directly query our trained XGBoost Regressor & SHAP TreeExplainer. 
          Modify features below to observe marginal Shapley value adjustments in real time.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '2rem',
        alignItems: 'start',
        marginBottom: '3rem'
      }}>
        
        {/* Form Column */}
        <form onSubmit={handlePredict} className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Input Property Specifications
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Property Type
              </label>
              <select
                value={params.property_type}
                onChange={(e) => updateParam('property_type', e.target.value)}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              >
                <option value="apartment">Apartment / Flat</option>
                <option value="villa">Luxury Villa</option>
                <option value="house">Independent House</option>
                <option value="plot">Plot / Land</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Locality / Suburb
              </label>
              <select
                value={params.locality}
                onChange={(e) => updateParam('locality', e.target.value)}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              >
                <option value="Whitefield">Whitefield (Bangalore)</option>
                <option value="Indiranagar">Indiranagar (Bangalore)</option>
                <option value="Bandra West">Bandra West (Mumbai)</option>
                <option value="Hauz Khas">Hauz Khas (Delhi)</option>
                <option value="Gachibowli">Gachibowli (Hyderabad)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Area (sq.ft)
              </label>
              <input
                type="number"
                value={params.area_sqft}
                onChange={(e) => updateParam('area_sqft', Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                BHK
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={params.bhk}
                onChange={(e) => updateParam('bhk', Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Bathrooms
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={params.bathrooms}
                onChange={(e) => updateParam('bathrooms', Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Property Age (Years)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={params.property_age}
                onChange={(e) => updateParam('property_age', Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                Furnishing Level
              </label>
              <select
                value={params.furnishing}
                onChange={(e) => updateParam('furnishing', e.target.value)}
                style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully Furnished</option>
              </select>
            </div>
          </div>

          {/* Description for NLP Parser */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Description Text (Analyzed by NLP Tokenizer)
            </label>
            <textarea
              rows={3}
              value={params.description}
              onChange={(e) => updateParam('description', e.target.value)}
              style={{ width: '100%', padding: '0.65rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          {/* Amenities checkboxes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              Amenities Included
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {availableAmenities.map(am => (
                <label key={am} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={params.amenities.includes(am)}
                    onChange={() => toggleAmenity(am)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  {am}
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Evaluating Model...' : 'Compute AI Valuation & SHAP Analysis'}
            <Sparkles size={16} />
          </button>
        </form>

        {/* Live Result Highlight Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
            <div style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.5rem' }}>
              XGBoost Regressor Valuation
            </div>
            
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              {predictionResult ? formatPrice(predictionResult.predicted_price) : formatPrice(18500000)}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              ₹{predictionResult ? predictionResult.price_per_sqft.toLocaleString() : '10,000'} per sq.ft
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
              <span className="badge badge-ai">
                Model: XGBoost-v2.1
              </span>
              <span className="badge badge-emerald">
                Confidence: {predictionResult ? `${(predictionResult.model_confidence_indicator * 100).toFixed(0)}%` : '89%'}
              </span>
            </div>
          </div>

          {/* Quick Guidance Info */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              How the Regressor Computes This
            </h4>
            The model builds 180 decision trees taking into account spatial locality coefficients, 
            built-up area, BHK configuration, natural language luxury indicators, and neighborhood facilities.
          </div>
        </div>

      </div>

      {/* SHAP Waterfall Attribution Section */}
      {predictionResult && (
        <ShapWaterfallChart
          shapDetails={{
            base_value: predictionResult.base_price,
            shap_values: Object.fromEntries(predictionResult.all_contributions.map(c => [c.feature, c.shap_value])),
            feature_names: predictionResult.all_contributions.map(c => c.feature),
            feature_values: Object.fromEntries(predictionResult.all_contributions.map(c => [c.feature, c.feature_value]))
          }}
          baseValue={predictionResult.base_price}
          estimatedPrice={predictionResult.predicted_price}
          confidenceIndicator={predictionResult.model_confidence_indicator}
        />
      )}

    </div>
  );
}
