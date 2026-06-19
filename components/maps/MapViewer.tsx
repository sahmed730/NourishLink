'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'red'; // Will require custom icons in prod, using default for now
}

export interface MapViewerProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  route?: [number, number][];
  className?: string;
  style?: React.CSSProperties;
}

export default function MapViewer({ center, zoom = 13, markers = [], route = [], className = '', style }: MapViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ background: 'var(--color-neutral-100)', ...style }} className={className} />;
  }

  return (
    <div style={{ height: '100%', width: '100%', zIndex: 0, ...style }} className={className}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            <Popup>
              <strong>{marker.title}</strong>
              {marker.description && (
                <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                  {marker.description}
                </div>
              )}
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="var(--color-brand-500)" 
            weight={4} 
            opacity={0.7} 
          />
        )}
      </MapContainer>
    </div>
  );
}
