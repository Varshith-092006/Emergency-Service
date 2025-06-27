import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Navigation } from 'lucide-react';

// Custom icons for different service types
const createCustomIcon = (type, color = '#3b82f6', isSelected = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? 36 : 25}px;
        height: ${isSelected ? 36 : 25}px;
        border-radius: 50%;
        border: 2px solid ${isSelected ? '#f59e0b' : 'white'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isSelected ? 16 : 10}px;
        transition: all 0.2s;
      ">
        ${type.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [isSelected ? 36 : 25, isSelected ? 36 : 25],
    iconAnchor: [isSelected ? 18 : 12, isSelected ? 18 : 12],
    popupAnchor: [0, isSelected ? -18 : -12],
  });
};

const serviceColors = {
  hospital: '#ef4444',
  police: '#3b82f6',
  ambulance: '#f59e0b',
  fire: '#dc2626',
  pharmacy: '#10b981',
  clinic: '#8b5cf6',
};

const MapComponent = ({ 
  services = [], 
  center = [28.6139, 77.209], 
  zoom = 13, 
  height = '400px',
  showUserLocation = false,
  userLocation = null,
  dangerZones = [],
  onServiceClick = null,
  selectedService = null,
  className = ''
}) => {
  const mapRef = useRef();
  const markerRefs = useRef({});

  // Center and open popup for selected service
  useEffect(() => {
    if (selectedService && mapRef.current && markerRefs.current[selectedService._id]) {
      const marker = markerRefs.current[selectedService._id];
      if (marker) {
        marker.openPopup();
        mapRef.current.setView([
          selectedService.location.coordinates[1],
          selectedService.location.coordinates[0]
        ], mapRef.current.getZoom(), { animate: true });
      }
    }
  }, [selectedService]);

  return (
    <div className={`w-full rounded-lg overflow-hidden shadow-soft border border-gray-200 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenCreated={mapInstance => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: #10b981;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                "></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-green-600 text-sm">📍 You are here</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Service Markers */}
        {services.map((service) => (
          <Marker
            key={service._id}
            position={[service.location.coordinates[1], service.location.coordinates[0]]}
            icon={createCustomIcon(service.type, serviceColors[service.type] || '#ef4444', selectedService && selectedService._id === service._id)}
            eventHandlers={{
              click: () => onServiceClick && onServiceClick(service),
            }}
            ref={ref => { markerRefs.current[service._id] = ref; }}
          >
            <Popup>
              <div className="space-y-2 min-w-[180px]">
                <div className="font-bold text-primary-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {service.name}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {service.type.toUpperCase()}
                </div>
                <div className="text-sm text-gray-700">
                  {service.location.address?.fullAddress || 'No address available'}
                </div>
                {service.contact?.phone && (
                  <div className="text-sm text-gray-600">
                    📞 {service.contact.phone}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {service.contact?.phone && (
                    <a
                      href={`tel:${service.contact.phone}`}
                      className="btn btn-success btn-sm flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${service.location.coordinates[1]},${service.location.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" /> Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Danger Zones */}
        {dangerZones.map((zone, idx) => (
          <Circle
            key={idx}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ 
              color: '#ef4444', 
              fillColor: '#f87171', 
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-red-600 text-sm">⚠️ {zone.label}</div>
                <div className="text-xs text-gray-500">
                  High risk area - Exercise caution
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 