import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const ClickHandler = ({ onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });
  return null;
};

const MapComponent = ({ position, onPositionChange, height = '500px' }) => {
  useEffect(() => {
    // Force a re-render of the map when the component mounts
    const timer = setTimeout(() => {
      const map = document.querySelector('.leaflet-container');
      if (map) {
        map._leaflet_id = null;
        map.remove();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={position ? [position.lat, position.lng] : [7.8731, 80.7718]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          // Force the map to update its size
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPositionChange={onPositionChange} />
        {position && (
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              Latitude: {position.lat.toFixed(5)} <br />
              Longitude: {position.lng.toFixed(5)}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {position && (
        <div style={{ marginTop: '10px' }}>
          <strong>Selected Coordinates:</strong><br />
          Latitude: {position.lat.toFixed(5)}, Longitude: {position.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
