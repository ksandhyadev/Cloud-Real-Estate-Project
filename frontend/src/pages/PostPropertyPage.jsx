import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, CheckCircle2, ChevronRight, ChevronLeft, 
  Upload, Sparkles, AlertCircle, Home, Layers, DollarSign, Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../components/PropertyCard';

export default function PostPropertyPage({ onListingCreated, onCancel }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    listing_type: 'buy', // buy or rent
    property_type: 'apartment',
    title: '',
    bhk: 2,
    area_sqft: 1250,
    price: 9500000,

    // Step 2: Location
    city: 'Bangalore',
    locality: 'Whitefield',
    address: 'Near Tech Park, Whitefield Main Road',
    latitude: 12.9698,
    longitude: 77.7499,

    // Step 3: Details
    bathrooms: 2,
    furnishing: 'semi-furnished',
    property_age: 1,
    parking_spaces: 1,
    amenities: ['Power Backup', '24x7 Security', 'Covered Parking', 'Lift'],

    // Step 4: Images
    images: [],
    previewUrls: [],

    // Step 5: Description
    description: 'Beautiful modern apartment featuring spacious open layout, modular kitchen, large balcony, and round-the-clock security.'
  });

  // Step 7 Pre-valuation state & Seller AI Assistant
  const [aiPreview, setAiPreview] = useState(null);
  const [auditResult, setAuditResult] = useState(null);

  useEffect(() => {
    // Run seller audit in background
    api.auditSellerListing({
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      area_sqft: Number(formData.area_sqft),
      bhk: Number(formData.bhk),
      bathrooms: Number(formData.bathrooms),
      parking_spaces: Number(formData.parking_spaces),
      locality: formData.locality,
      amenities: formData.amenities,
      images: formData.previewUrls
    }).then(res => setAuditResult(res)).catch(() => {});
  }, [step, formData.locality, formData.price, formData.area_sqft, formData.title, formData.description]);

  const availableAmenities = [
    'Swimming Pool', 'Clubhouse', 'Gymnasium', '24x7 Security', 
    'Covered Parking', 'Power Backup', 'Jogging Track', 'Piped Gas',
    'Rainwater Harvesting', 'Solar Heating', 'Lift', 'Children Play Area'
  ];

  const updateField = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const toggleAmenity = (name) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== name)
          : [...prev.amenities, name]
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newUrls = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        previewUrls: [...prev.previewUrls, ...newUrls]
      }));
    }
  };

  // Step navigation
  const nextStep = async () => {
    setError('');
    if (step === 1 && !formData.title.trim()) {
      setError("Please provide a property title.");
      return;
    }
    if (step === 6) {
      // Run AI pre-valuation before Step 7
      setLoading(true);
      try {
        const preview = await api.predictPrice({
          area_sqft: formData.area_sqft,
          bhk: formData.bhk,
          bathrooms: formData.bathrooms,
          property_age: formData.property_age,
          parking_spaces: formData.parking_spaces,
          property_type: formData.property_type,
          furnishing: formData.furnishing,
          city: formData.city,
          locality: formData.locality,
          amenities: formData.amenities,
          description: formData.description
        });
        setAiPreview(preview);
        setStep(7);
      } catch (err) {
        setError("Failed to run AI pre-valuation: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create property
      const createdProp = await api.createProperty({
        title: formData.title,
        description: formData.description,
        listing_type: formData.listing_type,
        property_type: formData.property_type,
        price: Number(formData.price),
        area_sqft: Number(formData.area_sqft),
        bhk: Number(formData.bhk),
        bathrooms: Number(formData.bathrooms),
        furnishing: formData.furnishing,
        property_age: Number(formData.property_age),
        parking_spaces: Number(formData.parking_spaces),
        city: formData.city,
        locality: formData.locality,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        amenities: formData.amenities
      });

      // 2. Upload images if provided
      if (formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const fileData = new FormData();
          fileData.append('file', formData.images[i]);
          await api.uploadImage(createdProp.id, fileData);
        }
      }

      onListingCreated(createdProp.id);
    } catch (err) {
      setError("Failed to publish property: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    '1. Basic Info',
    '2. Location',
    '3. Details',
    '4. Images',
    '5. Description',
    '6. Review',
    '7. AI Analysis'
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '820px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.5rem' }}>
          <Sparkles size={13} /> Seller Listing Engine
        </span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Post Your Property</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Publish your listing with instant multimodal XGBoost valuation & SHAP explanation
        </p>
      </div>

      {/* 7-Step Progress Stepper */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginBottom: '2.5rem',
        overflowX: 'auto',
        padding: '0.5rem 0'
      }}>
        {stepLabels.map((lbl, idx) => {
          const sNum = idx + 1;
          const isDone = sNum < step;
          const isCurrent = sNum === step;

          return (
            <div 
              key={sNum}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                minWidth: '70px',
                opacity: isDone || isCurrent ? 1 : 0.4
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: isCurrent ? '0 0 12px rgba(99,102,241,0.5)' : 'none'
              }}>
                {isDone ? <CheckCircle2 size={16} /> : sNum}
              </div>
              <span style={{ fontSize: '0.65rem', color: isCurrent ? '#a5b4fc' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {lbl.split('. ')[1]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div style={{
          background: 'var(--accent-rose-bg)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Real-Time Seller AI Assistant & Listing Quality Audit Panel */}
      {auditResult && step < 7 && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Seller AI Assistant & Quality Audit
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className={`badge ${auditResult.quality_score >= 80 ? 'badge-emerald' : auditResult.quality_score >= 60 ? 'badge-ai' : 'badge-amber'}`} style={{ fontSize: '0.75rem' }}>
                Listing Quality: {auditResult.quality_score}/100 ({auditResult.quality_tier})
              </span>
            </div>
          </div>

          {/* Pricing check vs Locality Median */}
          {auditResult.pricing_analysis && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.85rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>
                Your Rate: <strong style={{ color: 'var(--text-main)' }}>₹{Math.round(auditResult.pricing_analysis.listing_rate_sqft).toLocaleString()}/sq.ft</strong>
              </span>
              <span>
                {auditResult.locality} Median: <strong style={{ color: '#818cf8' }}>₹{auditResult.pricing_analysis.locality_median_rate_sqft.toLocaleString()}/sq.ft</strong>
              </span>
              <span style={{ color: auditResult.pricing_analysis.variance_percent > 15 ? '#f59e0b' : '#10b981' }}>
                {auditResult.pricing_analysis.evaluation || `${auditResult.pricing_analysis.variance_percent > 0 ? '+' : ''}${auditResult.pricing_analysis.variance_percent}% vs median`}
              </span>
            </div>
          )}

          {/* Suggestions List */}
          {auditResult.suggestions && auditResult.suggestions.length > 0 && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <strong style={{ color: '#c7d2fe' }}>Factual Suggestions to Maximize Inquiries:</strong>
              <ul style={{ margin: '0.3rem 0 0 1.2rem', padding: 0 }}>
                {auditResult.suggestions.map((sug, i) => (
                  <li key={i} style={{ color: 'var(--text-main)', marginTop: '2px' }}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step Content Panels */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '2.5rem', marginBottom: '2rem' }}>
        
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 1: Basic Information</h3>
            
            {/* Listing Type (Sell vs Rent) */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Transaction Purpose
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {['buy', 'rent'].map(t => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => updateField('listing_type', t)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: formData.listing_type === t ? 'var(--accent-primary)' : 'var(--border-card)',
                      background: formData.listing_type === t ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-secondary)',
                      color: formData.listing_type === t ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t === 'buy' ? 'Sell Property' : 'Rent Out Property'}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Title */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Listing Title
              </label>
              <input
                type="text"
                placeholder="e.g. Prestige Lakeview 3 BHK with Lake View"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
              />
            </div>

            {/* Property Type & BHK */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Property Type
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => updateField('property_type', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">Independent House</option>
                  <option value="plot">Plot / Land</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  BHK Configuration
                </label>
                <select
                  value={formData.bhk}
                  onChange={(e) => updateField('bhk', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                >
                  <option value="0">0 (Plot/Commercial)</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>
            </div>

            {/* Area & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Built-up Area (sq.ft)
                </label>
                <input
                  type="number"
                  value={formData.area_sqft}
                  onChange={(e) => updateField('area_sqft', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Asking Price (INR)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 2: Property Location & Address</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                >
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Locality / Suburb
                </label>
                <input
                  type="text"
                  placeholder="e.g. Whitefield, Indiranagar"
                  value={formData.locality}
                  onChange={(e) => updateField('locality', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Full Street Address / Landmark
              </label>
              <input
                type="text"
                placeholder="Building Name, Cross Road, Pin Code"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Geospatial Coordinates Attached</div>
              Latitude: <strong>{formData.latitude}</strong> | Longitude: <strong>{formData.longitude}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                Nearby schools, hospitals, and transit hubs will be automatically linked via Geoapify GIS spatial query.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Property Details */}
        {step === 3 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 3: Property Details & Amenities</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Property Age (Years)
                </label>
                <input
                  type="number"
                  value={formData.property_age}
                  onChange={(e) => updateField('property_age', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                  Parking Spaces
                </label>
                <input
                  type="number"
                  value={formData.parking_spaces}
                  onChange={(e) => updateField('parking_spaces', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>
                Furnishing Status
              </label>
              <select
                value={formData.furnishing}
                onChange={(e) => updateField('furnishing', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="fully-furnished">Fully Furnished</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'block' }}>
                Select Amenities Included
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {availableAmenities.map(am => (
                  <label key={am} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer', background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(am)}
                      onChange={() => toggleAmenity(am)}
                      style={{ accentColor: 'var(--accent-primary)' }}
                    />
                    {am}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Images */}
        {step === 4 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 4: Property Photography</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              High definition photos will be evaluated by our computer vision engine for brightness, sharpness, and visual condition scoring.
            </p>

            <label style={{
              border: '2px dashed var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'border-color 0.2s ease'
            }}>
              <Upload size={36} color="#818cf8" />
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Click to upload property photos</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Supports JPG, PNG, WEBP (Max 10MB per file)</div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            {/* Previews */}
            {formData.previewUrls.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Uploaded Images ({formData.previewUrls.length})
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {formData.previewUrls.map((url, i) => (
                    <div key={i} style={{ width: '100px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
                      <img src={url} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Description */}
        {step === 5 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 5: Property Description</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Our NLP module will analyze your text for luxury terms (e.g. Italian marble, private pool, vaastu, panoramic view).
            </p>

            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your property architecture, interior fittings, community, and neighborhood advantages..."
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />

            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.2)', fontSize: '0.8rem', color: '#67e8f9' }}>
              💡 <strong>Tip for Higher Valuation:</strong> Highlighting specific luxury finishes like wooden flooring, double-height ceiling, or branded fixtures triggers positive NLP signals for the valuation regressor.
            </div>
          </div>
        )}

        {/* STEP 6: Review */}
        {step === 6 && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>Step 6: Review Your Listing</h3>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Title:</strong> {formData.title}</div>
              <div><strong>Purpose:</strong> {formData.listing_type === 'rent' ? 'For Rent' : 'For Sale'}</div>
              <div><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{formData.property_type}</span></div>
              <div><strong>Asking Price:</strong> {formatPrice(formData.price, formData.listing_type)}</div>
              <div><strong>Built-up Area:</strong> {formData.area_sqft} sq.ft</div>
              <div><strong>BHK:</strong> {formData.bhk} BHK</div>
              <div><strong>Location:</strong> {formData.locality}, {formData.city}</div>
              <div><strong>Furnishing:</strong> {formData.furnishing}</div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click <strong>"Run AI Pre-Valuation"</strong> to execute the multimodal XGBoost model and inspect Shapley drivers before final publishing.
            </div>
          </div>
        )}

        {/* STEP 7: AI Analysis Preview & Final Submit */}
        {step === 7 && aiPreview && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
              <CheckCircle2 size={20} /> Multimodal AI Analysis Complete!
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Your Asking Price</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {formatPrice(formData.price, formData.listing_type)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ₹{Math.round(formData.price / Math.max(1, formData.area_sqft)).toLocaleString()} / sq.ft
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Model-Estimated Value</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>
                  {formatPrice(aiPreview.predicted_price, formData.listing_type)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                  Confidence: {Math.round(aiPreview.model_confidence_indicator * 100)}%
                </div>
              </div>
            </div>

            {/* Uncertainty Interval & Locality Reference */}
            {aiPreview.prediction_range && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: '#c7d2fe', fontWeight: 600 }}>Empirical Valuation Range: </span>
                  <span style={{ color: 'var(--text-main)' }}>{formatPrice(aiPreview.prediction_range.low)} – {formatPrice(aiPreview.prediction_range.high)}</span>
                </div>
                {aiPreview.locality_reference && (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {aiPreview.locality_reference.locality} Benchmark: ₹{aiPreview.locality_reference.min_rate_sqft.toLocaleString()} – ₹{aiPreview.locality_reference.max_rate_sqft.toLocaleString()}/sq.ft
                  </div>
                )}
              </div>
            )}

            {/* Top Positive & Negative SHAP Drivers */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                Key Value Drivers (SHAP)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <strong style={{ color: '#10b981' }}>Value Enhancers:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                    {aiPreview.positive_drivers.slice(0, 3).map((d, i) => (
                      <li key={i}>{d.feature_label} (+{formatPrice(d.shapValue)})</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(244, 63, 94, 0.08)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <strong style={{ color: '#f43f5e' }}>Market Calibration:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                    {aiPreview.negative_drivers.slice(0, 2).map((d, i) => (
                      <li key={i}>{d.feature_label} ({formatPrice(d.shapValue)})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Your listing will be instantly discoverable in search results with full GIS mapping, POIs, and explainable AI badges.
            </p>
          </div>
        )}

      </div>

      {/* Wizard Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {step > 1 ? (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={prevStep}
            disabled={loading}
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}

        {step < 7 ? (
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={loading}
          >
            {loading ? 'Analyzing with XGBoost...' : step === 6 ? 'Run AI Pre-Valuation' : 'Next Step'}
            <ChevronRight size={16} />
          </button>
        ) : (
          <button 
            type="button" 
            className="btn btn-emerald" 
            onClick={handleFinalSubmit}
            disabled={loading}
          >
            {loading ? 'Publishing Listing...' : 'Publish Listing Now'}
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>

    </div>
  );
}
