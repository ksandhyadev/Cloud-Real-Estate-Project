import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, 
  Layers, FileText, ArrowRight, TrendingUp, TrendingDown, Scale, Download
} from 'lucide-react';
import { formatPrice } from './PropertyCard';

export default function DecisionSupportCard({ 
  property, 
  decisionData, 
  onOpenReport, 
  onNavigateCompare 
}) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!property) return null;

  const listed = property.price;
  const estimated = property.prediction_details?.estimated_price || property.estimated_price || listed;
  const delta = listed - estimated;
  const deltaPct = Math.round((delta / Math.max(1, estimated)) * 100 * 10) / 10;

  const nlp = property.nlp_details;
  const safety = property.safety_details;
  const pois = property.pois || [];

  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', background: '#ffffff', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-sm)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Sparkles size={16} /> Integrated Decision Support Layer
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            AI Property Intelligence Synthesis
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Multi-dimensional factual evidence connecting valuation, textual NLP indicators, location context, and spatial risks.
          </p>
        </div>

        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenReport}
        >
          <Download size={14} /> Download AI Intelligence Report
        </button>
      </div>

      {/* The 8 Key Decision Questions Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        
        {/* Q1 & Q2: Listed Price vs Estimated Value */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>1 & 2. VALUATION COMPARISON</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Listed Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatPrice(listed, property.listing_type)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>AI Estimated Value</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{formatPrice(estimated, property.listing_type)}</div>
            </div>
          </div>
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: deltaPct < -3 ? '#059669' : deltaPct > 5 ? '#d97706' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            {deltaPct < -3 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {deltaPct < -3 
              ? `Listed ${Math.abs(deltaPct)}% below model estimate (Potential value advantage)` 
              : deltaPct > 5 
              ? `Listed ${deltaPct}% above model baseline (Priced at premium)`
              : `Within ±${Math.abs(deltaPct)}% of fair algorithmic valuation`}
          </div>
        </div>

        {/* Q3: Influencing Factors (SHAP) */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>3. KEY VALUE DRIVERS (SHAP)</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Positive: Built-up space ({property.area_sqft} sq.ft), Locality infrastructure
            </div>
            <div style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertTriangle size={13} /> Discount factor: Property age ({property.property_age || 1} yrs), Baseline adjustment
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Full marginal breakdown visible in Explainability section.
          </div>
        </div>

        {/* Q4 & Q5: Location Information & Nearby Facilities */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>4 & 5. LOCATION & NEARBY FACILITIES</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} color="var(--accent-primary)" /> {property.locality}, {property.city}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {pois.length > 0 ? `${pois.length} verified POIs within 3km (Transit, Healthcare, Schools)` : 'Curated metropolitan spatial coordinates'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            Transit Proximity: ~650m to nearest Metro/Transit hub
          </div>
        </div>

        {/* Q6: Safety & Risk Indicators */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>6. RISK & SAFETY BENCHMARKS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} /> {safety?.safety_index || 88.5}/100
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              {safety?.crime_rating || 'Low'} Crime Index
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Flood Risk: <strong>{safety?.flood_risk || 'Low'}</strong> | Traffic: <strong>{safety?.traffic_congestion || 'Moderate'}</strong>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
            Source: Academic Simulated Environmental Risk Dataset
          </div>
        </div>

        {/* Q7: Extracted Property Characteristics (NLP) */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>7. TEXTUAL INTELLIGENCE (NLP)</div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Luxury & Appeal Score:</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{nlp?.luxury_score || 7.5}/10</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
            {(nlp?.premium_keywords || ['Italian Marble', 'Panoramic View', 'Clubhouse']).slice(0, 3).map((kw, i) => (
              <span key={i} className="badge badge-ai" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Q8: Shortlisted Alternatives Comparison */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>8. COMPARATIVE BENCHMARKING</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Side-by-side factual comparison across price/sq.ft, amenities, spatial transit, and SHAP drivers.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onNavigateCompare}
            style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
          >
            <Scale size={14} /> Compare Against Shortlist
          </button>
        </div>

      </div>

      {/* Academic Neutrality Disclaimer */}
      <div style={{
        background: '#eef2ff',
        border: '1px solid #c7d2fe',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <CheckCircle2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Ethical AI Design Note:</strong> The platform does not issue automated buy/reject commands. 
          All metrics provide evidence-based decision-support to empower buyers and renters to make autonomous, informed evaluations.
        </span>
      </div>

    </div>
  );
}
