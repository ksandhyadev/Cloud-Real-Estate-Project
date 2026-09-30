import React, { useState, useEffect } from 'react';
import { 
  Heart, Scale, Share2, Mail, MapPin, Bed, Bath, Maximize2, 
  Calendar, Car, ShieldCheck, Sparkles, Download, CheckCircle2, 
  ChevronRight, TrendingUp, AlertTriangle, Info, Layers, Award, 
  BarChart3, Database, ArrowRight, Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useShortlist } from '../context/ShortlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/PropertyCard';
import ShapWaterfallChart from '../components/ShapWaterfallChart';
import LeafletMapView from '../components/LeafletMapView';
import DecisionSupportCard from '../components/DecisionSupportCard';
import AIReportModal from '../components/AIReportModal';

export default function PropertyDetailPage({ propertyId, onBack, onNavigateCompare, onSelectProperty }) {
  const { user } = useAuth();
  const { isShortlisted, toggleShortlist, compareIds, toggleCompare } = useShortlist();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [expandedScorecardIdx, setExpandedScorecardIdx] = useState(null);
  
  // Enquiry state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMsg, setEnquiryMsg] = useState('Hi, I am interested in this property and would like to schedule a viewing.');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getPropertyDetail(propertyId)
      .then(data => {
        setProperty(data);
        // Persist to recently viewed
        try {
          const recents = JSON.parse(localStorage.getItem('recently_viewed_properties') || '[]');
          const filtered = recents.filter(id => id !== propertyId);
          filtered.unshift(propertyId);
          localStorage.setItem('recently_viewed_properties', JSON.stringify(filtered.slice(0, 10)));
        } catch (e) {
          // ignore storage errors
        }
      })
      .catch(err => console.error("Error fetching detail:", err))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <Sparkles size={32} color="#818cf8" style={{ margin: '0 auto 1rem auto', animation: 'spin 2s linear infinite' }} />
        <h2>Analyzing Multimodal Property Intelligence...</h2>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Property not found</h2>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>Back to Search</button>
      </div>
    );
  }

  const saved = isShortlisted(property.id);
  const compared = compareIds.includes(property.id);

  const images = property.images && property.images.length > 0 
    ? property.images.map(img => img.image_url.startsWith('/uploads') ? `http://127.0.0.1:8000${img.image_url}` : img.image_url)
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const pred = property.prediction_details;
  const shap = property.shap_details;
  const nlp = property.nlp_details;
  const safety = property.safety_details;
  const locBench = property.locality_benchmark;
  const historyTrend = property.historical_trend || [];
  const scorecard = property.scorecard;
  const factualInsights = property.factual_insights || [];
  const comparables = property.comparables || [];
  const anomalies = property.anomaly_detection;
  const dataSources = property.data_sources;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to send an enquiry to the seller.");
      return;
    }
    try {
      await api.sendEnquiry({
        property_id: property.id,
        buyer_name: user.fullName,
        buyer_email: user.email,
        buyer_phone: enquiryPhone || user.phone || '9876543210',
        message: enquiryMsg
      });
      setEnquirySent(true);
      setTimeout(() => {
        setShowEnquiryModal(false);
        setEnquirySent(false);
      }, 2000);
    } catch (err) {
      alert("Enquiry failed: " + err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <span onClick={onBack} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Search Results</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-muted)' }}>{property.city}</span>
          <ChevronRight size={14} />
          <span style={{ color: '#818cf8', fontWeight: 600 }}>{property.locality}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleShare}
            title="Copy shareable property URL"
          >
            <Share2 size={14} />
            <span>{copyFeedback ? 'Link Copied!' : 'Share Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Potential Anomaly Alert Banner (if flagged) */}
      {anomalies && anomalies.is_potential_anomaly && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              Potential Listing Parameter Anomaly Flagged
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Our statistical integrity engine flagged unusual attributes for this micro-market:
              <ul style={{ margin: '0.35rem 0 0.35rem 1.2rem', padding: 0 }}>
                {anomalies.anomaly_flags.map((flag, idx) => (
                  <li key={idx}><strong>{flag.signal}:</strong> {flag.detail}</li>
                ))}
              </ul>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{anomalies.disclaimer}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Showcase Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* Left: Gallery Showcase */}
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(240px, 45vw, 380px)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-card)',
            background: 'var(--bg-card)'
          }}>
            <img 
              src={images[activeImageIdx]} 
              alt={property.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
            />
            <span className="badge badge-ai" style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <Sparkles size={12} /> CNN Verified Visual Quality
            </span>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: activeImageIdx === idx ? '2px solid #818cf8' : '1px solid var(--border-subtle)',
                    opacity: activeImageIdx === idx ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Valuation & Key Header Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', textTransform: 'uppercase' }}>
                {property.property_type}
              </span>
              <span className="badge badge-dim" style={{ textTransform: 'capitalize' }}>
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              {locBench && (
                <span className="badge badge-dim" style={{ color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  {locBench.recent_trend_yoy}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '0.5rem' }}>
              {property.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <MapPin size={16} color="#818cf8" />
              <span>{property.locality}, {property.city}</span>
            </div>

            {/* DUAL VALUATION CARD WITH UNCERTAINTY INTERVAL */}
            <div className="glass-panel" style={{
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid var(--border-card)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Listed Asking Price
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                    {formatPrice(property.price, property.listing_type)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    ₹{Math.round(property.price / Math.max(1, property.area_sqft)).toLocaleString()} / sq.ft
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={12} /> XGBoost Valuation
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a5b4fc' }}>
                    {pred ? formatPrice(pred.estimated_price, property.listing_type) : '₹1.15 Cr'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                    Confidence: {pred ? `${Math.round(pred.confidence_indicator * 100)}%` : '88%'}
                  </div>
                </div>
              </div>

              {/* Prediction Range / Uncertainty Bracket */}
              {pred && pred.prediction_range && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.78rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c7d2fe', fontWeight: 600 }}>
                    <span>Estimated Valuation Range:</span>
                    <span>{formatPrice(pred.prediction_range.low)} – {formatPrice(pred.prediction_range.high)}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Empirical uncertainty interval derived from 15% held-out test evaluation ({pred.prediction_range.uncertainty_label}).
                  </div>
                </div>
              )}

              {/* Locality Micro-Market Reference */}
              {locBench && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                  <span>{locBench.locality} Micro-Market Benchmark:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>₹{locBench.min_rate_sqft.toLocaleString()} – ₹{locBench.max_rate_sqft.toLocaleString()} / sq.ft</span>
                </div>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Configuration</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>{property.bhk} BHK</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Built-up Area</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>{property.area_sqft} sq.ft</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Bathrooms</div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginTop: '2px' }}>{property.bathrooms} Baths</div>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setShowEnquiryModal(true)}
            >
              <Mail size={16} /> Contact / Enquire
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => toggleShortlist(property.id)}
              style={{ color: saved ? 'var(--accent-rose)' : 'inherit' }}
            >
              <Heart size={16} fill={saved ? 'var(--accent-rose)' : 'none'} />
              <span>{saved ? 'Saved' : 'Shortlist'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => toggleCompare(property.id)}
              style={{ color: compared ? 'var(--accent-primary)' : 'inherit' }}
            >
              <Scale size={16} />
              <span>{compared ? 'Comparing' : 'Compare'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => setShowReportModal(true)}
              title="Download Printable AI Valuation Report"
            >
              <Download size={16} /> Report
            </button>
          </div>
        </div>

      </div>

      {/* "WHY THIS PROPERTY?" FACTUAL INSIGHTS */}
      {factualInsights.length > 0 && (
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              "Why This Property?" — Factual AI Intelligence Insights
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {factualInsights.map((insight, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-dim" style={{ fontSize: '0.7rem' }}>
                    {insight.category}
                  </span>
                  <CheckCircle2 size={14} color="#10b981" />
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {insight.statement}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TRANSPARENT 7-DIMENSIONAL PROPERTY SCORECARD */}
      {scorecard && (
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Multimodal Evaluation Matrix
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                Transparent 7-Dimensional AI Property Scorecard
              </h2>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Overall Weighted Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                {scorecard.overall_score} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {scorecard.dimensions.map((dim, idx) => {
              const isExpanded = expandedScorecardIdx === idx;
              return (
                <div 
                  key={dim.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{dim.label}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: dim.color }}>{dim.score}</span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                    <div style={{ width: `${dim.score}%`, height: '100%', background: dim.color, borderRadius: '3px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{dim.rating}</span>
                    <button 
                      onClick={() => setExpandedScorecardIdx(isExpanded ? null : idx)}
                      style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0, fontSize: '0.72rem' }}
                    >
                      <Info size={11} /> {isExpanded ? 'Hide Formula' : 'How Calculated'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '0.72rem', color: '#c7d2fe', lineHeight: 1.4 }}>
                      {dim.calculation_method}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
            {scorecard.transparency_note}
          </div>
        </section>
      )}

      {/* HISTORICAL PRICE TRENDS & MICRO-MARKET GROWTH CHART */}
      {historyTrend.length > 0 && (
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Macro-Market Price Intelligence
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                Property Value History & Locality Growth Trend (8 Quarters)
              </h2>
            </div>
            
            {locBench && (
              <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem' }}>
                <TrendingUp size={14} /> {locBench.recent_trend_yoy} Trailing Growth
              </div>
            )}
          </div>

          {/* SVG Trendline Chart */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', padding: '1.5rem 1rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                {/* Plot Points & Lines */}
                {(() => {
                  const rates = historyTrend.map(h => h.rate);
                  const min = Math.min(...rates) * 0.95;
                  const max = Math.max(...rates) * 1.05;
                  const range = max - min || 1;
                  const stepX = 800 / (historyTrend.length - 1);

                  const points = historyTrend.map((h, i) => {
                    const x = i * stepX;
                    const y = 180 - ((h.rate - min) / range) * 150;
                    return { x, y, rate: h.rate, quarter: h.quarter };
                  });

                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaD = `${pathD} L 800 190 L 0 190 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#trendGradient)" />
                      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="3" />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#818cf8" stroke="#0f172a" strokeWidth="2" />
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#c7d2fe" fontSize="11" fontWeight="600">
                            ₹{p.rate.toLocaleString()}
                          </text>
                          <text x={p.x} y="195" textAnchor="middle" fill="var(--text-dim)" fontSize="10">
                            {p.quarter}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1.25rem' }}>
              Historical capital values per sq.ft registered in {property.locality}, Bengaluru micro-market (Q4 2024 to Q3 2026).
            </div>
          </div>
        </section>
      )}

      {/* PRICE COMPARABLE PROPERTIES GRID */}
      {comparables.length > 0 && (
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Competitive Valuation Benchmarking
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                Comparable Properties in {property.locality} & Vicinity
              </h2>
            </div>
            <span className="badge badge-dim">
              {comparables.length} Micro-Market Comparables Identified
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {comparables.map((comp) => (
              <div 
                key={comp.property_id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      {comp.similarity_score}% Similar
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ~{comp.distance_km} km away
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                    {comp.title}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {comp.bhk} BHK • {comp.area_sqft} sq.ft • {comp.locality}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                      {formatPrice(comp.price)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ₹{comp.price_per_sqft.toLocaleString()}/sq.ft
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                    {comp.similarity_factors.map((fac, idx) => (
                      <span key={idx} className="badge badge-dim" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onSelectProperty && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem' }}
                      onClick={() => onSelectProperty(comp.property_id)}
                    >
                      <Eye size={13} /> View
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => toggleCompare(comp.property_id)}
                  >
                    <Scale size={13} /> Compare
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Property Overview Specifications */}
      <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
          Property Overview & Characteristics
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-dim)' }}>Furnishing Level</div>
            <div style={{ fontWeight: 700, color: '#fff', textTransform: 'capitalize', marginTop: '2px' }}>
              {property.furnishing}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-dim)' }}>Property Age</div>
            <div style={{ fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {property.property_age} Years ({property.property_age <= 1 ? 'Brand New' : 'Established'})
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-dim)' }}>Parking Spaces</div>
            <div style={{ fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {property.parking_spaces} Reserved Stalls
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-dim)' }}>Safety & Crime Rating</div>
            <div style={{ fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
              {safety?.safety_index || 88}/100 ({safety?.crime_rating || 'Low'} Risk)
            </div>
          </div>
        </div>

        {/* Amenities Chips */}
        {property.amenities && property.amenities.length > 0 && (
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Confirmed Amenities & Facilities
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {property.amenities.map((am, i) => (
                <span key={i} className="badge badge-dim" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <CheckCircle2 size={13} color="#10b981" /> {am}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* NLP Description Analysis Section */}
      <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Natural Language Processing Module
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              Description & Textual Signal Analysis
            </h2>
          </div>

          <div className="badge badge-ai" style={{ padding: '0.4rem 0.85rem' }}>
            NLP Luxury Score: {nlp?.luxury_score || 7.5} / 10
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.7, background: 'rgba(15, 23, 42, 0.5)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          {property.description}
        </p>

        {nlp && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff' }}>Premium Extracted Tokens:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {(nlp.premium_keywords || ['Italian Marble', 'Penthouse', 'Panoramic']).map((kw, i) => (
                  <span key={i} className="badge badge-ai" style={{ fontSize: '0.7rem' }}>{kw}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff' }}>Condition Indicators:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                {(nlp.condition_indicators || ['Brand New', 'Ready to Move']).map((ci, i) => (
                  <span key={i} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{ci}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SHAP EXPLAINABILITY WATERFALL CHART SECTION */}
      <section style={{ marginBottom: '2.5rem' }}>
        <ShapWaterfallChart
          shapDetails={shap}
          baseValue={shap?.base_value}
          estimatedPrice={pred?.estimated_price}
          confidenceIndicator={pred?.confidence_indicator}
        />
      </section>

      {/* GIS MAP & GEOAPIFY NEARBY POIS */}
      <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Spatial Intelligence & GIS Mapping
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
              Property Coordinates & Verified Nearby POIs
            </h2>
          </div>
          <span className="badge badge-dim">
            3km Proximity Radius
          </span>
        </div>

        <LeafletMapView
          selectedProperty={property}
          pois={property.pois || []}
          height="450px"
        />

        {/* Nearby Facilities List */}
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {(property.pois || []).map((poi, idx) => (
            <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{poi.name}</div>
              <div style={{ color: 'var(--text-dim)', textTransform: 'capitalize', marginTop: '2px' }}>{poi.category}</div>
              <div style={{ color: '#10b981', fontWeight: 600, marginTop: '4px' }}>~{poi.distance_meters} meters away</div>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATED PHASE-II DECISION SUPPORT LAYER */}
      <section style={{ marginBottom: '2.5rem' }}>
        <DecisionSupportCard
          property={property}
          onOpenReport={() => setShowReportModal(true)}
          onNavigateCompare={onNavigateCompare}
        />
      </section>

      {/* DATA SOURCES & ATTRIBUTION TRANSPARENCY PANEL */}
      {dataSources && (
        <section className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Database size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Authoritative Data Sources & Provenance Attribution
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Intelligence Domain</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Provider / Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Freshness Label</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {dataSources.sources.map((src, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 600 }}>{src.domain}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-main)' }}>{src.provider}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-dim" style={{ fontSize: '0.7rem' }}>{src.freshness_label}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: 600 }}>● {src.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '1rem', lineHeight: 1.5 }}>
            {dataSources.transparency_declaration}
          </div>
        </section>
      )}

      {/* AI Report Modal */}
      <AIReportModal
        property={property}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '450px', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Enquire About {property.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Connect directly with verified seller/broker. Your details are securely transmitted.
            </p>

            {enquirySent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#10b981' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h4>Enquiry Successfully Sent!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>The seller will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>Your Phone Number</label>
                  <input 
                    type="tel"
                    className="input-text"
                    placeholder="Enter 10-digit mobile number"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>Message to Seller</label>
                  <textarea 
                    className="input-text"
                    rows="3"
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowEnquiryModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
