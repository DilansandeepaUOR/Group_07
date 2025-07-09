import React, { useEffect, useRef } from 'react';
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
  const mapRef = useRef(null);

  useEffect(() => {
    // Force a re-render of the map when the component mounts
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Update map center when position changes
  useEffect(() => {
    if (mapRef.current && position) {
      mapRef.current.setView([position.lat, position.lng], mapRef.current.getZoom());
    }
  }, [position]);

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer 
        center={position ? [position.lat, position.lng] : [7.8731, 80.7718]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        whenCreated={(map) => {
          mapRef.current = map;
          // Force the map to update its size
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPositionChange={onPositionChange} />
        {position && (
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>Selected Location</strong><br />
                Latitude: {position.lat.toFixed(6)}<br />
                Longitude: {position.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {position && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-10 border border-gray-200">
          <div className="text-sm font-medium text-[#008879] mb-1">Selected Location</div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Lat: {position.lat.toFixed(6)}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Lng: {position.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
