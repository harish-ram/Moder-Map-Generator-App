import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin } from 'lucide-react';

function MapPreview({ latitude, longitude, distance, onMapClick, city, country }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: true,
      preferCanvas: true,
    }).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapInstance.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = mapInstance;

    markerRef.current = L.marker([latitude, longitude], {
      draggable: true,
    }).addTo(mapInstance);

    markerRef.current.on('dragend', () => {
      const position = markerRef.current?.getLatLng();
      if (position) {
        onMapClick(position.lat, position.lng);
      }
    });

    circleRef.current = L.circle([latitude, longitude], {
      radius: distance,
      color: '#5b8cff',
      weight: 2,
      opacity: 0.7,
      fill: true,
      fillColor: '#5b8cff',
      fillOpacity: 0.16,
    }).addTo(mapInstance);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
  }, [onMapClick, latitude, longitude, distance]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !circleRef.current) {
      return;
    }

    markerRef.current.setLatLng([latitude, longitude]);
    circleRef.current.setLatLng([latitude, longitude]);
    circleRef.current.setRadius(distance);
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom() || 13, {
      animate: false,
    });
  }, [latitude, longitude, distance]);

  return (
    <div className="map-panel">
      <div className="map-header">
        <MapPin size={18} />
        <span>Map Preview</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Click to select | Drag marker to move
        </span>
      </div>
      
      <div
        ref={mapContainerRef}
        className="map-container"
        style={{ height: '400px' }}
      />

      <div className="map-info">
        <div className="map-info-item">
          <div className="map-info-label">City</div>
          <div className="map-info-value">{city}</div>
        </div>
        <div className="map-info-item">
          <div className="map-info-label">Country</div>
          <div className="map-info-value">{country}</div>
        </div>
        <div className="map-info-item">
          <div className="map-info-label">Latitude</div>
          <div className="map-info-value">{latitude.toFixed(4)}</div>
        </div>
        <div className="map-info-item">
          <div className="map-info-label">Longitude</div>
          <div className="map-info-value">{longitude.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}

export default MapPreview;
