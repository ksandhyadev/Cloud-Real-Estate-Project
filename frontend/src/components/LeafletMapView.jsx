import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, School, Hospital, ShoppingCart, Train } from 'lucide-react';
import { formatPrice } from './PropertyCard';

// Fix Leaflet default marker icons issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons
const createCustomIcon = (color, text) => {
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        background: ${color};
        color: #fff;
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        border: 2px solid #fff;
        white-space: nowrap;
      ">
        ${text}
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

const poiIcons = {
  school: createCustomIcon('#3b82f6', '🏫 School'),
  hospital: createCustomIcon('#ef4444', '🏥 Hospital'),
  transit: createCustomIcon('#10b981', '🚇 Transit'),
  shopping: createCustomIcon('#f59e0b', '🛍️ Mall'),
  park: createCustomIcon('#84cc16', '🌳 Park'),
  other: createCustomIcon('#6b7280', '📍 Facility')
};

export default function LeafletMapView({ 
  properties = [], 
  selectedProperty = null, 
  pois = [], 
  center = [12.9716, 77.5946],
  zoom = 12,
  height = "500px",
  onSelectProperty 
}) {
  const [poiFilters, setPoiFilters] = useState({
    school: true,
    hospital: true,
    transit: true,
    shopping: true,
    park: true
  });

  const activeCenter = selectedProperty 
    ? [selectedProperty.latitude, selectedProperty.longitude] 
    : (properties.length > 0 ? [properties[0].latitude, properties[0].longitude] : center);

  const togglePoiCategory = (cat) => {
    setPoiFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
      
      {/* Map Filter Controls overlay */}
      {pois.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '0.6rem 0.8rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          gap: '0.6rem',
          fontSize: '0.75rem'
        }}>
          {['school', 'hospital', 'transit', 'shopping'].map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-main)', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={poiFilters[cat] !== false} 
                onChange={() => togglePoiCategory(cat)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              {cat}
            </label>
          ))}
        </div>
      )}

      <MapContainer 
        center={activeCenter} 
        zoom={selectedProperty ? 14 : zoom} 
        style={{ width: '100%', height: '100%', background: '#e2e8f0' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected Property Pin & Radius Buffer */}
        {selectedProperty && (
          <>
            <Circle 
              center={[selectedProperty.latitude, selectedProperty.longitude]}
              radius={2000}
              pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.12, dashArray: '4, 4' }}
            />
            <Marker 
              position={[selectedProperty.latitude, selectedProperty.longitude]}
              icon={createCustomIcon('#6366f1', `📍 ${formatPrice(selectedProperty.price, selectedProperty.listing_type)}`)}
            >
              <Popup>
                <div style={{ color: '#111', padding: '4px' }}>
                  <strong>{selectedProperty.title}</strong>
                  <br />
                  {selectedProperty.locality}, {selectedProperty.city}
                  <br />
                  Listed: {formatPrice(selectedProperty.price, selectedProperty.listing_type)}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Properties Pins when browsing multiple */}
        {!selectedProperty && properties.map(p => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={createCustomIcon('#6366f1', formatPrice(p.price, p.listing_type))}
            eventHandlers={{
              click: () => onSelectProperty && onSelectProperty(p.id)
            }}
          >
            <Popup>
              <div style={{ color: '#111', minWidth: '150px' }}>
                <strong style={{ fontSize: '0.85rem' }}>{p.title}</strong>
                <div style={{ fontSize: '0.75rem', color: '#555', margin: '4px 0' }}>
                  {p.locality}, {p.city}
                </div>
                <div style={{ fontWeight: 700, color: '#4f46e5' }}>
                  {formatPrice(p.price, p.listing_type)}
                </div>
                {p.estimated_price && (
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    AI Est: {formatPrice(p.estimated_price, p.listing_type)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* POI Markers */}
        {pois
          .filter(poi => poiFilters[poi.category] !== false)
          .map((poi, idx) => (
            <Marker
              key={`poi-${idx}`}
              position={[poi.latitude, poi.longitude]}
              icon={poiIcons[poi.category] || poiIcons.other}
            >
              <Popup>
                <div style={{ color: '#111', fontSize: '0.8rem' }}>
                  <strong>{poi.name}</strong>
                  <div>Category: {poi.category.toUpperCase()}</div>
                  <div>Distance: ~{poi.distance_meters} meters</div>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>Source: {poi.source}</div>
                </div>
              </Popup>
            </Marker>
          ))}

      </MapContainer>
    </div>
  );
}
