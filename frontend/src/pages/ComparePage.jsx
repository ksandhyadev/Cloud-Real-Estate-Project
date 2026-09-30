import React, { useState, useEffect } from 'react';
import { Scale, ArrowLeft, Trash2, CheckCircle2, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useShortlist } from '../context/ShortlistContext';
import { formatPrice } from '../components/PropertyCard';

export default function ComparePage({ onSelectProperty, onNavigateSearch }) {
  const { compareIds, toggleCompare, clearCompare } = useShortlist();
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (compareIds.length >= 2) {
      setLoading(true);
      setError('');
      api.compareProperties(compareIds)
        .then(res => setComparisonData(res))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setComparisonData(null);
    }
  }, [compareIds]);

  if (compareIds.length < 2) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)' }}>
          <Scale size={48} color="#818cf8" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            Compare Properties Side-by-Side
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Select between 2 and 4 properties to inspect factual differences in asking price, 
            XGBoost valuations, price/sq.ft, neighborhood safety, and SHAP value drivers.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '1.5rem' }}>
            Currently selected: <strong>{compareIds.length}</strong> (Minimum 2 required)
          </div>
          <button className="btn btn-primary" onClick={onNavigateSearch}>
            Explore Properties to Compare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
            <Scale size={13} /> Factual Comparative Matrix
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            Side-by-Side Property Comparison ({compareIds.length} Selected)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Objective analytical differences to support autonomous buyer decisions (no artificial "winner" bias).
          </p>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={clearCompare}
          style={{ color: 'var(--accent-rose)' }}
        >
          <Trash2 size={14} /> Clear Comparison
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Computing side-by-side matrices...
        </div>
      ) : error ? (
        <div style={{ background: 'var(--accent-rose-bg)', color: 'var(--accent-rose)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : comparisonData ? (
        <div className="glass-panel table-scroll-container" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-card)' }}>
          <div style={{ minWidth: `${Math.max(650, 200 + comparisonData.properties.length * 220)}px` }}>
            {/* Properties Header Cards Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `220px repeat(${comparisonData.properties.length}, 1fr)`,
              borderBottom: '1px solid var(--border-card)',
              background: 'rgba(15, 23, 42, 0.7)'
            }}>
              <div style={{ padding: '1.5rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Comparison Metric
              </div>

            {comparisonData.properties.map(p => (
              <div key={p.id} style={{ padding: '1.5rem', borderLeft: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} color="#818cf8" /> {p.locality}, {p.city}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => onSelectProperty(p.id)}
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => toggleCompare(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0 4px' }}
                    title="Remove from comparison"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Matrix Rows */}
          {Object.entries(comparisonData.comparison_matrix).map(([metric, values], idx) => (
            <div
              key={metric}
              style={{
                display: 'grid',
                gridTemplateColumns: `220px repeat(${values.length}, 1fr)`,
                borderBottom: '1px solid var(--border-subtle)',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#a5b4fc', display: 'flex', alignItems: 'center' }}>
                {metric}
              </div>

              {values.map((val, vIdx) => (
                <div key={vIdx} style={{ padding: '1rem 1.5rem', borderLeft: '1px solid var(--border-subtle)', color: '#fff', fontWeight: metric.includes('Price') ? 700 : 400, display: 'flex', alignItems: 'center' }}>
                  {val}
                </div>
              ))}
            </div>
          ))}
          </div>

        </div>
      ) : null}

    </div>
  );
}
