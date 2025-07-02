import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Navigation, RefreshCw } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';

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
  isMobile = false,
  showUserLocation = false,
  userLocation = null,
  dangerZones = [],
  onServiceClick = null,
  selectedService = null
}) => {
  const mapRef = useRef();
  const { getAddressFromCoords } = useLocation();
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    if (selectedService && mapRef.current) {
      mapRef.current.setView([
        selectedService.location.coordinates[1],
        selectedService.location.coordinates[0]
      ], mapRef.current.getZoom(), { animate: true });
    }
  }, [selectedService]);

  const getAddressText = (address) => {
    if (!address) return 'No address available';
    if (typeof address === 'string') return address;
    if (address.fullAddress) return address.fullAddress;
    return 'No address available';
  };

  return (
    <div className={`w-full rounded-lg overflow-hidden shadow-soft border border-gray-200 ${
      isMobile ? 'h-[60vh]' : 'h-full'
    }`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenCreated={mapInstance => (mapRef.current = mapInstance)}
        zoomControl={!isMobile}
        touchZoom={isMobile}
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
                <div className="text-xs text-gray-500 mt-1">
                  Accuracy: ±{userLocation.accuracy.toFixed(0)} meters
                </div>
                <button
                  onClick={async () => {
                    const newAddress = await getAddressFromCoords(
                      userLocation.lat,
                      userLocation.lng
                    );
                  }}
                  className="mt-2 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh address
                </button>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Service Markers */}
        {services.map((service) => {
          if (!service.location?.coordinates || service.location.coordinates.length !== 2) {
            return null;
          }

          const serviceType = service.type || 'other';
          const [lng, lat] = service.location.coordinates;
          const isHovered = hoveredService?._id === service._id;

          return (
            <Marker
              key={service._id}
              position={[lat, lng]}
              icon={createCustomIcon(
                serviceType, 
                serviceColors[serviceType] || '#ef4444', 
                selectedService?._id === service._id
              )}
              eventHandlers={{
                mouseover: () => setHoveredService(service),
                mouseout: () => setHoveredService(null),
                click: () => onServiceClick && onServiceClick(service),
              }}
            >
              {isHovered && (
                <Popup className="hover-popup" closeButton={false}>
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                    <div className="font-semibold">{service.name}</div>
                    <div className="text-sm text-gray-700">
                      {getAddressText(service.location.address)}
                    </div>
                    {service.contact?.phone && (
                      <div className="text-sm mt-1">
                        <Phone className="inline mr-1" size={14} />
                        {service.contact.phone}
                      </div>
                    )}
                  </div>
                </Popup>
              )}
              <Popup className={isMobile ? 'w-64' : 'w-72'}>
                <div className="space-y-2">
                  <div className="font-bold text-primary-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {service.name}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {serviceType.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-700">
                    {getAddressText(service.location.address)}
                  </div>
                  {service.contact?.phone && (
                    <div className="text-sm text-gray-600">
                      📞 {service.contact.phone}
                    </div>
                  )}
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-2'} mt-3`}>
                    {service.contact?.phone && (
                      <a
                        href={`tel:${service.contact.phone}`}
                        className={`inline-flex items-center ${
                          isMobile ? 'justify-center' : ''
                        } px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700`}
                        onClick={e => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center ${
                        isMobile ? 'justify-center' : ''
                      } px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700`}
                      onClick={e => e.stopPropagation()}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
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

      <style jsx global>{`
        .hover-popup .leaflet-popup-content-wrapper {
          border-radius: 6px;
          padding: 0;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .hover-popup .leaflet-popup-content {
          margin: 0;
        }
        .hover-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          transition: transform 0.2s;
        }
        .custom-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default MapComponent;