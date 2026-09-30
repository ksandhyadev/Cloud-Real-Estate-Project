import React, { useState, useEffect } from 'react';
import { Building2, PlusCircle, Trash2, Mail, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/PropertyCard';

export default function SellerDashboard({ onNavigatePostProperty, onSelectProperty }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProperties(),
      api.getMyEnquiries().catch(() => [])
    ]).then(([allProps, enqs]) => {
      // Filter seller's own listings if user id matches, or show demo seller listings
      const myProps = user ? allProps.filter(p => p.owner_id === user.id || user.role === 'seller') : allProps;
      setProperties(myProps);
      setEnquiries(enqs);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await api.deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
            <Building2 size={13} /> Seller Management Portal
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Seller Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage your listings, inspect AI valuation accuracy, and respond to buyer enquiries.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={onNavigatePostProperty}>
          <PlusCircle size={16} /> Post New Property
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Active Listings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>{properties.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Buyer Enquiries</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', marginTop: '0.25rem' }}>{enquiries.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>AI Valuation Calibration</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>R² 0.989</div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid var(--border-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-card)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
          My Published Properties
        </div>

        {properties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No properties posted yet. Click "Post New Property" to get started!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Property</th>
                  <th style={{ padding: '1rem' }}>Type</th>
                  <th style={{ padding: '1rem' }}>Asking Price</th>
                  <th style={{ padding: '1rem' }}>AI Estimated Value</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      <div style={{ cursor: 'pointer', color: '#818cf8' }} onClick={() => onSelectProperty(p.id)}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{p.locality}, {p.city}</div>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                      {p.property_type} ({p.bhk} BHK)
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {formatPrice(p.price, p.listing_type)}
                    </td>
                    <td style={{ padding: '1rem', color: '#a5b4fc', fontWeight: 600 }}>
                      {p.estimated_price ? formatPrice(p.estimated_price, p.listing_type) : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                        title="Delete Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiries Section */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border-card)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={18} color="#818cf8" /> Recent Buyer Enquiries ({enquiries.length})
        </h3>
        
        {enquiries.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No buyer enquiries received yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {enquiries.map(e => (
              <div key={e.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{e.buyer_name} ({e.buyer_email})</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>"{e.message}"</div>
                {e.buyer_phone && (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem' }}>Phone: {e.buyer_phone}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
