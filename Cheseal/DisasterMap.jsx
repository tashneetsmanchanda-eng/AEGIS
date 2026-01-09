import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * DisasterMap - React Component for displaying disaster risk heatmap
 * Uses react-leaflet with heatmap layer
 */
const DisasterMap = ({ center = [25.7617, -80.1918], zoom = 10, heatmapData = [] }) => {
  return (
    <div className="disaster-map-container" style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {heatmapData.length > 0 && (
          <HeatmapLayer
            points={heatmapData}
            longitudeExtractor={(point) => point[1]}
            latitudeExtractor={(point) => point[0]}
            intensityExtractor={(point) => point[2] || 1}
            radius={20}
            max={1.0}
            blur={15}
            gradient={{
              0.0: 'blue',
              0.5: 'yellow',
              1.0: 'red'
            }}
          />
        )}
        
        <Marker position={center}>
          <Popup>
            Risk Assessment Location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DisasterMap;

