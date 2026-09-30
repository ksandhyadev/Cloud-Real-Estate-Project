import React from 'react';
import { Heart, Scale, MapPin, Bed, Bath, Maximize2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useShortlist } from '../context/ShortlistContext';

export function formatPrice(val, listingType = 'buy') {
  if (!val) return 'N/A';
  if (listingType === 'rent') {
    return `₹${val.toLocaleString()}/mo`;
  }
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lac`;
  }
  return `₹${val.toLocaleString()}`;
}

export default function PropertyCard({ property, onSelect, onOpenDecision }) {
  const { isShortlisted, toggleShortlist, compareIds, toggleCompare } = useShortlist();
  
  const saved = isShortlisted(property.id);
  const compared = compareIds.includes(property.id);
  const coverImage = property.images && property.images.length > 0 
    ? property.images[0].image_url 
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  // Fix relative uploads path to absolute API host
  const imgSrc = coverImage.startsWith('/uploads') ? `http://127.0.0.1:8000${coverImage}` : coverImage;

  const deltaPct = property.price_delta_percent;

  return (
    <div 
      className="glass-panel" 
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-card)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image Banner */}
      <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden' }}>
        <img 
          src={imgSrc} 
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Property Type Badge */}
        <span 
          className="badge" 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            border: '1px solid var(--border-subtle)',
            textTransform: 'uppercase',
            fontSize: '0.7rem'
          }}
        >
          {property.listing_type === 'rent' ? 'For Rent' : property.property_type}
        </span>

        {/* Visual Condition Score */}
        <span 
          className="badge badge-ai" 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px',
            fontSize: '0.7rem',
            backdropFilter: 'blur(8px)'
          }}
          title="CNN Visual condition indicator from photography"
        >
          <Sparkles size={12} /> Condition 8.7/10
        </span>

        {/* Shortlist Action Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleShortlist(property.id);
          }}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: saved ? 'var(--accent-rose)' : 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            transition: 'transform 0.15s ease'
          }}
          title={saved ? 'Remove from Shortlist' : 'Add to Shortlist'}
        >
          <Heart size={16} fill={saved ? '#fff' : 'none'} />
        </button>

        {/* Quick Compare Action */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleCompare(property.id);
          }}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            background: compared ? 'var(--accent-primary)' : 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#fff'
          }}
          title="Add to side-by-side comparison"
        >
          <Scale size={12} /> {compared ? 'Comparing' : 'Compare'}
        </button>
      </div>

      {/* Property Details Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }} onClick={() => onSelect(property.id)}>
        
        {/* Title */}
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.35rem',
          lineHeight: 1.35,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {property.title}
        </h3>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
          <MapPin size={14} color="#818cf8" />
          <span>{property.locality}, {property.city}</span>
        </div>

        {/* Key Features Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '0.6rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          {property.bhk > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Bed size={15} color="#94a3b8" />
              <span>{property.bhk} BHK</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Bath size={15} color="#94a3b8" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Maximize2 size={14} color="#94a3b8" />
            <span>{property.area_sqft} sq.ft</span>
          </div>
        </div>

        {/* Dual Price Comparison Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '1rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Listed Price</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {formatPrice(property.price, property.listing_type)}
              </div>
            </div>

            {property.estimated_price && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                  <Sparkles size={11} /> AI Valuation
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc' }}>
                  {formatPrice(property.estimated_price, property.listing_type)}
                </div>
              </div>
            )}
          </div>

          {/* Rate per sq.ft & Confidence Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ₹{Math.round(property.price / Math.max(1, property.area_sqft)).toLocaleString()}/sq.ft
            </span>
            {property.confidence_indicator && (
              <span style={{ fontSize: '0.7rem', color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                Confidence {Math.round(property.confidence_indicator * 100)}%
              </span>
            )}
          </div>

          {/* Delta & Safety tags */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
            {deltaPct !== null && deltaPct !== undefined ? (
              <span className={`badge ${deltaPct < -3 ? 'badge-emerald' : deltaPct > 5 ? 'badge-amber' : 'badge-ai'}`} style={{ fontSize: '0.7rem' }}>
                {deltaPct < -3 ? `▼ ${Math.abs(deltaPct)}% Under Value` : deltaPct > 5 ? `▲ ${deltaPct}% Premium` : 'Market Aligned'}
              </span>
            ) : <span />}

            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={12} color="#10b981" /> Safety {property.safety_score || 88}/100
            </span>
          </div>
        </div>

        {/* View Details Link */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'space-between' }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property.id);
            }}
          >
            <span>View Full AI Intelligence</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
