import React from 'react';
import { Filter, RotateCcw, Building, Home, Layers, DollarSign, Shield, ArrowUpDown } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, onReset }) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
          <Filter size={18} color="var(--accent-primary)" /> Filter Properties
        </div>
        <button 
          onClick={onReset}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          title="Reset all filters"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Listing Type Tabs (Buy / Rent / Plot) */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Transaction Purpose
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {['all', 'buy', 'rent'].map(type => (
            <button
              key={type}
              onClick={() => handleChange('listing_type', type)}
              style={{
                padding: '0.45rem 0',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: (filters.listing_type || 'all') === type ? 'var(--accent-primary)' : 'transparent',
                color: (filters.listing_type || 'all') === type ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type Dropdown */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Property Type
        </label>
        <select
          value={filters.property_type || 'all'}
          onChange={(e) => handleChange('property_type', e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        >
          <option value="all">All Property Types</option>
          <option value="apartment">Apartment / Flat</option>
          <option value="villa">Luxury Villa</option>
          <option value="house">Independent House</option>
          <option value="plot">Plot / Residential Land</option>
        </select>
      </div>

      {/* City */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Metro City
        </label>
        <select
          value={filters.city || 'all'}
          onChange={(e) => handleChange('city', e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        >
          <option value="all">All Cities</option>
          <option value="Bangalore">Bangalore (Bengaluru)</option>
          <option value="Mysore">Mysore (Mysuru)</option>
          <option value="Mangalore">Mangalore (Mangaluru)</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi NCR</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
      </div>

      {/* Locality Input */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Locality / Area
        </label>
        <input
          type="text"
          placeholder="e.g. Whitefield, HSR, Gokulam..."
          value={filters.locality || ''}
          onChange={(e) => handleChange('locality', e.target.value)}
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        />
      </div>

      {/* BHK Selector */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Bedrooms (BHK)
        </label>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 1, 2, 3, 4].map(bhk => (
            <button
              key={bhk}
              onClick={() => handleChange('bhk', bhk === 'all' ? null : bhk)}
              style={{
                flex: 1,
                minWidth: '42px',
                padding: '0.45rem 0',
                border: '1px solid',
                borderColor: (filters.bhk === bhk || (bhk === 'all' && !filters.bhk)) ? 'var(--accent-primary)' : 'var(--border-card)',
                borderRadius: 'var(--radius-sm)',
                background: (filters.bhk === bhk || (bhk === 'all' && !filters.bhk)) ? 'var(--accent-primary)' : '#ffffff',
                color: (filters.bhk === bhk || (bhk === 'all' && !filters.bhk)) ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {bhk === 'all' ? 'Any' : `${bhk} BHK`}
            </button>
          ))}
        </div>
      </div>

      {/* Budget / Price Range */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Budget Range (INR)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="Min Price"
            value={filters.min_price || ''}
            onChange={(e) => handleChange('min_price', e.target.value ? Number(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '0.55rem',
              background: '#ffffff',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.max_price || ''}
            onChange={(e) => handleChange('max_price', e.target.value ? Number(e.target.value) : null)}
            style={{
              width: '100%',
              padding: '0.55rem',
              background: '#ffffff',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }}
          />
        </div>
      </div>

      {/* Minimum Neighborhood Safety Index Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Min Safety Index
          </label>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
            {filters.min_safety || 70}/100
          </span>
        </div>
        <input 
          type="range" 
          min="60" 
          max="95" 
          step="5"
          value={filters.min_safety || 70}
          onChange={(e) => handleChange('min_safety', Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
        />
      </div>

      {/* Furnishing Status */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>
          Furnishing
        </label>
        <select
          value={filters.furnishing || 'all'}
          onChange={(e) => handleChange('furnishing', e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        >
          <option value="all">Any Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-Furnished</option>
          <option value="fully-furnished">Fully Furnished</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ArrowUpDown size={12} /> Sort Order
        </label>
        <select
          value={filters.sort_by || 'relevance'}
          onChange={(e) => handleChange('sort_by', e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            background: '#ffffff',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-main)',
            fontSize: '0.85rem'
          }}
        >
          <option value="relevance">Relevance & Best AI Match</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newly Listed</option>
        </select>
      </div>

    </div>
  );
}
