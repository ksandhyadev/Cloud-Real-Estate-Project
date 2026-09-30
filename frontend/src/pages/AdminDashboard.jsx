import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Trash2, Users, Building2, BarChart2, Activity, Database, Sparkles, Cpu, Layers } from 'lucide-react';
import { api } from '../services/api';
import { formatPrice } from '../components/PropertyCard';

export default function AdminDashboard({ onSelectProperty }) {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminStats(),
      api.getAdminProperties("all"),
      api.getHealth()
    ]).then(([s, props, h]) => {
      setStats(s);
      setProperties(props);
      setHealth(h);
    }).catch(err => console.error("Admin load error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateListingStatus(id, status);
      setProperties(properties.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this property?")) return;
    try {
      await api.deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const mlGov = stats?.ml_model_governance;
  const missingAudit = stats?.missing_data_audit;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.4rem' }}>
          <Shield size={13} /> Platform Governance & Audit Panel
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Administrator Console
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Monitor system health, audit machine learning governance metrics, and manage community property listings.
        </p>
      </div>

      {/* Top Stats Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Users size={16} /> Total Registered Users
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
              {stats.total_users}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Building2 size={16} /> Total Listings
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
              {stats.total_properties}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <BarChart2 size={16} /> Average Listed Price
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
              {formatPrice(stats.average_listed_price)}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Sparkles size={16} /> Average AI Valuation
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '0.4rem' }}>
              {formatPrice(stats.average_estimated_price)}
            </div>
          </div>
        </div>
      )}

      {/* Subsystem Health & ML Governance Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* ML Model Versioning & Empirical Validation Metrics */}
        {mlGov && (
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                <Cpu size={18} /> Model Governance & Validation
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                {mlGov.model_version}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>R² Score</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{mlGov.r2_score.toFixed(4)}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>MAE</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{Math.round(mlGov.mae).toLocaleString()}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>5-Fold CV R²</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>{mlGov.cv_5fold_r2_mean.toFixed(4)}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <div><strong>Dataset Version:</strong> {mlGov.dataset_version} ({mlGov.test_samples} test transactions)</div>
              <div><strong>Evaluation:</strong> {mlGov.evaluation_notes}</div>
            </div>
          </div>
        )}

        {/* System Subsystems & API Health */}
        {health && (
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 700, fontSize: '0.9rem' }}>
                <Activity size={18} /> Subsystems & API Health Checks
              </div>
              <span className={`badge ${health.status === 'healthy' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                System: {health.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              {health.subsystems && Object.entries(health.subsystems).map(([key, info]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{key.replace('_', ' ')}</span>
                  <span style={{ color: info.status === 'connected' || info.status === 'loaded' || info.status === 'operational' || info.status === 'writable' || info.status === 'live_configured' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                    ● {info.status}
                  </span>
                </div>
              ))}
            </div>

            {missingAudit && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Data Completeness: <strong style={{ color: '#10b981' }}>{missingAudit.data_completeness_pct}%</strong></span>
                <span>Missing Photos: <strong>{missingAudit.properties_without_images}</strong></span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Moderation Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-card)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Listing Moderation & Integrity Queue ({properties.length})</span>
          <span className="badge badge-dim" style={{ fontSize: '0.75rem' }}>Auto-Sync Enabled</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '1rem 1.5rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Property Title</th>
                <th style={{ padding: '1rem' }}>City / Locality</th>
                <th style={{ padding: '1rem' }}>Asking Price</th>
                <th style={{ padding: '1rem' }}>AI Estimated Value</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)' }}>#{p.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    <div style={{ cursor: 'pointer', color: '#818cf8' }} onClick={() => onSelectProperty(p.id)}>
                      {p.title}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.locality}, {p.city}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatPrice(p.price, p.listing_type)}
                  </td>
                  <td style={{ padding: '1rem', color: '#a5b4fc', fontWeight: 600 }}>
                    {p.estimated_price ? formatPrice(p.estimated_price, p.listing_type) : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${p.status === 'approved' ? 'badge-emerald' : p.status === 'rejected' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      {p.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'approved')}
                          className="btn btn-emerald btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Approve Listing"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'rejected')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-rose)' }}
                          title="Reject Listing"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                        title="Remove Listing"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
