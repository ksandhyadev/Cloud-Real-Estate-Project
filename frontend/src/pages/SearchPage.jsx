import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map, ListFilter, ArrowUpDown, Search as SearchIcon, Sparkles, X, RotateCcw, AlertTriangle } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard from '../components/PropertyCard';
import LeafletMapView from '../components/LeafletMapView';
import { api } from '../services/api';

const DEFAULT_FILTERS = {
  listing_type: 'all',
  property_type: 'all',
  city: 'all',
  bhk: null,
  min_price: null,
  max_price: null,
  min_safety: 70,
  furnishing: 'all',
  sort_by: 'relevance',
  query: ''
};

export default function SearchPage({ initialFilters = {}, onSelectProperty }) {
  // Load persisted filters if available
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem('realestate_search_filters');
      if (saved) {
        return { ...JSON.parse(saved), ...initialFilters };
      }
    } catch (e) {
      // ignore storage error
    }
    return { ...DEFAULT_FILTERS, ...initialFilters };
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Smart natural language search state
  const [smartPrompt, setSmartPrompt] = useState('');
  const [smartSearchActive, setSmartSearchActive] = useState(false);
  const [smartTokens, setSmartTokens] = useState([]);
  const [aiDiscoveryMsg, setAiDiscoveryMsg] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await api.getProperties(filters);
      setProperties(data);
      // Persist filters
      try {
        sessionStorage.setItem('realestate_search_filters', JSON.stringify(filters));
      } catch (e) {}
    } catch (err) {
      console.error("Failed to load properties:", err);
      setFetchError(err.message || 'Failed to connect to property search service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!smartSearchActive) {
      fetchProperties();
    }
  }, [filters]);

  const handleSmartSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!smartPrompt.trim()) return;

    setLoading(true);
    setFetchError('');
    try {
      const res = await api.smartSearch(smartPrompt);
      setProperties(res.results || []);
      setSmartTokens(res.parser_output?.matched_tokens || []);
      setSmartSearchActive(true);
      if (res.ai_discovered && res.ai_discovery_note) {
        setAiDiscoveryMsg(res.ai_discovery_note);
      } else {
        setAiDiscoveryMsg('');
      }
    } catch (err) {
      console.error("Smart search error:", err);
      setFetchError("Natural language search failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSmartSearch = () => {
    setSmartPrompt('');
    setSmartSearchActive(false);
    setSmartTokens([]);
    setAiDiscoveryMsg('');
    fetchProperties();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSmartPrompt('');
    setSmartSearchActive(false);
    setSmartTokens([]);
    setAiDiscoveryMsg('');
    try {
      sessionStorage.removeItem('realestate_search_filters');
    } catch (e) {}
  };

  const samplePrompts = [
    "2 BHK in Electronic City under 90 lakh",
    "2 BHK in Whitefield under 90 lakh near metro",
    "Villa in Indiranagar under 3.5 cr",
    "3 BHK rent in HSR Layout under 50k",
    "Apartment in Koramangala with pool"
  ];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Smart Search Prompt Bar */}
      <div className="glass-panel" style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.75rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-card)',
        background: '#ffffff',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <form onSubmit={handleSmartSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <SearchIcon size={18} color="#4f46e5" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              className="input-text"
              style={{
                width: '100%',
                paddingLeft: '46px',
                paddingRight: '36px',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-full)',
                background: '#f8fafc',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)'
              }}
              placeholder="Natural Language Search: e.g., '2 BHK in Whitefield under 90 lakh near metro'"
              value={smartPrompt}
              onChange={(e) => setSmartPrompt(e.target.value)}
            />
            {smartPrompt && (
              <button 
                type="button" 
                onClick={clearSmartSearch}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={16} /> AI Search
          </button>
        </form>

        {/* Quick Sample Prompts & Active Tokens */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
          {smartTokens.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Parsed Filters:</span>
              {smartTokens.map((t, i) => (
                <span key={i} className="badge badge-ai" style={{ fontSize: '0.72rem' }}>{t}</span>
              ))}
              <button 
                onClick={clearSmartSearch} 
                style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0 }}
              >
                <X size={12} /> Clear NLP filter
              </button>
            </div>
          ) : (
            <>
              <span style={{ color: 'var(--text-dim)' }}>Try conversational queries:</span>
              {samplePrompts.map((p, idx) => (
                <span 
                  key={idx}
                  onClick={() => {
                    setSmartPrompt(p);
                    api.smartSearch(p).then(res => {
                      setProperties(res.results || []);
                      setSmartTokens(res.parser_output?.matched_tokens || []);
                      setSmartSearchActive(true);
                    });
                  }}
                  style={{
                    color: 'var(--text-muted)',
                    background: '#f1f5f9',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  "{p}"
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Property Catalog & Market Discovery
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Showing {properties.length} properties evaluated by XGBoost multimodal intelligence and spatial GIS POIs
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Mobile Filter Toggle Button */}
          <button
            className="mobile-only btn btn-secondary btn-sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: showMobileFilters ? 'var(--accent-primary)' : 'var(--border-card)',
              background: showMobileFilters ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
              color: showMobileFilters ? '#a5b4fc' : 'var(--text-main)'
            }}
          >
            <ListFilter size={15} color={showMobileFilters ? '#818cf8' : 'currentColor'} />
            <span>{showMobileFilters ? 'Hide Filters' : 'Filters & Refine'}</span>
          </button>

          {/* View Toggle (Grid / Map) */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LayoutGrid size={15} /> Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'map' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'map' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Map size={15} /> Map View
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive 2-Column Search Layout */}
      <div className="responsive-search-layout">
        
        {/* Left Column: Filter Sidebar */}
        <aside className={`search-filter-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`} style={{ position: 'sticky', top: '90px' }}>
          <FilterSidebar 
            filters={filters} 
            setFilters={(newFilters) => {
              setSmartSearchActive(false);
              setFilters(newFilters);
            }} 
            onReset={handleResetFilters} 
          />
        </aside>

        {/* Right Column: Search Results */}
        <main>
          {/* Real-time Dynamic AI Discovery Banner */}
          {aiDiscoveryMsg && !loading && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Sparkles size={20} color="#4f46e5" />
              <div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  Live AI Market Discovery & Valuation
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {aiDiscoveryMsg}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
              <Sparkles size={28} color="#4f46e5" style={{ margin: '0 auto 1rem auto', animation: 'spin 2s linear infinite' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {smartPrompt ? `Querying Google Gemini & evaluating properties in "${smartPrompt}"...` : 'Loading properties and AI valuations...'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Powered by Google Gemini API & XGBoost Multi-Modal Regressor
              </div>
            </div>
          ) : fetchError ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <AlertTriangle size={40} color="#e11d48" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Failed to retrieve listings</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
                {fetchError}
              </p>
              <button className="btn btn-secondary" onClick={fetchProperties}>
                <RotateCcw size={15} /> Retry Connection
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 'var(--radius-lg)' }}>
              <SearchIcon size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>No properties matched your criteria</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '460px', margin: '0.4rem auto 1.25rem auto' }}>
                Try exploring our verified micro-markets with pre-evaluated XGBoost valuations & Gemini summaries:
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                {['Electronic City', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Koramangala'].map((loc, idx) => (
                  <button
                    key={idx}
                    className="badge badge-dim"
                    style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', border: '1px solid var(--border-card)', fontSize: '0.8rem' }}
                    onClick={() => {
                      setSmartPrompt(loc);
                      api.smartSearch(loc).then(res => {
                        setProperties(res.results || []);
                        setSmartTokens(res.parser_output?.matched_tokens || []);
                        setSmartSearchActive(true);
                      });
                    }}
                  >
                    📍 {loc}
                  </button>
                ))}
              </div>

              <button className="btn btn-secondary" onClick={handleResetFilters}>
                <RotateCcw size={14} /> Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {properties.map(p => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onSelect={onSelectProperty}
                />
              ))}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Click any property marker on the interactive GIS map to inspect details, price per sq.ft, and POIs.
              </div>
              <LeafletMapView
                properties={properties}
                height="650px"
                onSelectProperty={onSelectProperty}
              />
            </div>
          )}
        </main>

      </div>

    </div>
  );
}
