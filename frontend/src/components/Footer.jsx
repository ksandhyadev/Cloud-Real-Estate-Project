import React from 'react';
import { Building2, Shield, Cpu, MapPin, BarChart3, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print" style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-card)',
      padding: '3.5rem 0 2rem 0',
      marginTop: '5rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Col 1: Project Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                Cloud Real Estate Analysis
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              An academic major-project prototype integrating explainable multimodal artificial intelligence, 
              computer vision condition extraction, geospatial POI analytics, and XGBoost price valuation.
            </p>
          </div>

          {/* Col 2: AI & Architecture */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc', marginBottom: '1rem' }}>
              Multimodal AI Engine
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={14} color="#818cf8" /> XGBoost Price Regressor (R² ~ 0.989)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={14} color="#10b981" /> SHAP TreeExplainer Waterfall Engine
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={14} color="#06b6d4" /> NLP Domain Feature & Luxury Tokenizer
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#f59e0b" /> Geoapify Spatial Intelligence & POIs
              </li>
            </ul>
          </div>

          {/* Col 3: Research Contribution & Transparency */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a5b4fc', marginBottom: '1rem' }}>
              Academic Transparency
            </h4>
            <div style={{
              background: '#f8fafc',
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>
                <Shield size={14} /> Academic Benchmark Notice
              </div>
              Model valuations and safety indices represent research demonstration benchmarks. 
              The system presents factual trade-offs without prescribing unconditional purchase mandates.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div>
            © {new Date().getFullYear()} Cloud-Based Real Estate Analysis. Engineering Major Project Prototype.
          </div>
          <div>
            Built with React, FastAPI, XGBoost, SHAP, and OpenStreetMap.
          </div>
        </div>
      </div>
    </footer>
  );
}
