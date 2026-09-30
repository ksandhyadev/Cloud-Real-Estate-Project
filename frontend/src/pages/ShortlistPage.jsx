import React, { useState, useEffect } from 'react';
import { Heart, Scale, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useShortlist } from '../context/ShortlistContext';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';

export default function ShortlistPage({ onSelectProperty, onNavigateSearch, onNavigateCompare }) {
  const { user } = useAuth();
  const { shortlistedIds, toggleCompare } = useShortlist();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch all properties to filter shortlisted ones
    api.getProperties()
      .then(allProps => {
        const saved = allProps.filter(p => shortlistedIds.has(p.id));
        setProperties(saved);
      })
      .catch(err => console.error("Error loading shortlist:", err))
      .finally(() => setLoading(false));
  }, [shortlistedIds]);

  const handleCompareAll = () => {
    properties.slice(0, 4).forEach(p => toggleCompare(p.id));
    onNavigateCompare();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
            <Heart size={13} fill="#f43f5e" color="#f43f5e" /> Saved Properties
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            My Shortlist ({properties.length})
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review your saved properties and launch comparative analytics anytime.
          </p>
        </div>

        {properties.length >= 2 && (
          <button 
            className="btn btn-primary"
            onClick={handleCompareAll}
          >
            <Scale size={16} /> Compare Shortlisted Properties
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading saved properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)' }}>
          <Heart size={44} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Your shortlist is empty</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Browse our listings and click the heart icon on any property card to save it here for later evaluation.
          </p>
          <button className="btn btn-primary" onClick={onNavigateSearch}>
            Explore Properties
          </button>
        </div>
      ) : (
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
      )}

    </div>
  );
}
