import React, { useState } from 'react';
import { 
  Search, Building2, Home, Castle, Trees, Building, Sparkles, 
  ArrowRight, ShieldCheck, Cpu, BarChart3, MapPin, CheckCircle2, PlusCircle
} from 'lucide-react';
import PropertyCard, { formatPrice } from '../components/PropertyCard';

export default function HomePage({ properties = [], onSelectProperty, onSearchWithFilters, onNavigate, onOpenPostProperty }) {
  const [activeTab, setActiveTab] = useState('buy'); // buy, rent, plot
  const [selectedType, setSelectedType] = useState('all');
  const [city, setCity] = useState('Bangalore');
  const [bhk, setBhk] = useState('all');
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchWithFilters({
      listing_type: activeTab,
      property_type: selectedType !== 'all' ? selectedType : null,
      city: city !== 'all' ? city : null,
      bhk: bhk !== 'all' ? Number(bhk) : null,
      query: query || null
    });
  };

  const propertyTypes = [
    { id: 'apartment', label: 'Apartments', icon: Building2, count: '1,200+' },
    { id: 'villa', label: 'Villas', icon: Castle, count: '450+' },
    { id: 'house', label: 'Houses', icon: Home, count: '680+' },
    { id: 'plot', label: 'Plots / Land', icon: Trees, count: '320+' },
    { id: 'commercial', label: 'Commercial', icon: Building, count: '180+' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 4rem 0',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0b1120 70%)',
        borderBottom: '1px solid var(--border-card)',
        overflow: 'hidden'
      }}>
        {/* Glow ambient circle */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          {/* Academic Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="badge badge-ai" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> Explainable Multimodal Real Estate Intelligence
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            maxWidth: '850px',
            margin: '0 auto 1.25rem auto',
            letterSpacing: '-0.02em'
          }}>
            Discover Properties with <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explainable AI</span> Valuation
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            Analyze properties through structured attributes, NLP description signals, computer vision indicators, and Geoapify spatial intelligence.
          </p>

          {/* Primary Search Component */}
          <div className="glass-panel" style={{
            maxWidth: '960px',
            margin: '0 auto',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            
            {/* Transaction Purpose Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              {[
                { id: 'buy', label: 'Buy Property' },
                { id: 'rent', label: 'Rent Property' },
                { id: 'plot', label: 'Plot / Land' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Controls */}
            <form onSubmit={handleSearchSubmit} className="hero-search-form">
              
              {/* City */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Metro City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="all">All Cities</option>
                </select>
              </div>

              {/* Property Type */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="plot">Plot / Land</option>
                </select>
              </div>

              {/* BHK */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  BHK
                </label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="all">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Keyword / Locality */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Locality / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Whitefield, Bandra..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Submit CTA */}
              <button 
                type="submit"
                className="btn btn-primary hero-search-form-btn"
                style={{ height: '44px', width: '100%', padding: 0 }}
              >
                <Search size={18} /> Search
              </button>
            </form>

          </div>

          {/* Quick Category Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            {propertyTypes.map(t => {
              const Icon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => onSearchWithFilters({ property_type: t.id })}
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                  }}
                >
                  <Icon size={16} color="#818cf8" />
                  <span>{t.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.count}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Featured Properties Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verified Market Listings
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                Featured AI-Evaluated Properties
              </h2>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('search')}
            >
              <span>Explore All {properties.length} Listings</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Properties Grid */}
          <div className="grid-responsive-cards">
            {properties.slice(0, 6).map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                onSelect={onSelectProperty}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How Multimodal AI Valuation Works Explainer */}
      <section style={{
        padding: '4rem 0',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-card)',
        borderBottom: '1px solid var(--border-card)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multimodal Architecture
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem', marginBottom: '2.5rem' }}>
            How Explainable Property Intelligence Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left'
          }}>
            {/* Step 1 */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Cpu size={22} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                1. Structured & Spatial Vector
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Ingests built-up area, BHK configuration, property age, locality tiers, and nearby POI density from Geoapify.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ background: 'rgba(6, 182, 212, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Sparkles size={22} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                2. NLP Text Intelligence
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Extracts unstated luxury tokens, Italian marble, private pools, vaastu alignment, and generates a normalized luxury score.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BarChart3 size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                3. XGBoost Price Regressor
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Ensemble gradient boosting calculates market value with verified R² 0.989 calibration against verified transaction history.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={22} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                4. SHAP Explainability
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Eliminates the AI black box by decomposing every valuation into exact positive and negative Shapley feature attributions.
              </p>
            </div>
          </div>

          {/* Post Property Banner CTA */}
          <div className="glass-panel" style={{
            marginTop: '3.5rem',
            padding: '2rem 2.5rem',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Are You a Property Owner or Seller?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                List your property in 7 simple steps and get instant multimodal AI valuation and SHAP analysis.
              </p>
            </div>

            <button 
              className="btn btn-emerald"
              onClick={onOpenPostProperty}
            >
              <PlusCircle size={16} /> Post Your Property Now
            </button>
          </div>

        </div>
      </section>

      {/* Platform Statistics */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                0.989
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                XGBoost Model R² Score
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                SHAP Explainable Attributions
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'var(--font-heading)' }}>
                11+
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Multimodal Input Dimensions
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-heading)' }}>
                3 km
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Spatial POI Radius Intelligence
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
