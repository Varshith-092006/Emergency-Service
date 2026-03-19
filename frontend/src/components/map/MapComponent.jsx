import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Navigation, RefreshCw } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useTheme } from '../../contexts/ThemeContext';

const createCustomIcon = (type, color = 'var(--primary-color)', isSelected = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? 40 : 28}px;
        height: ${isSelected ? 40 : 28}px;
        border-radius: 12px;
        border: 3px solid ${isSelected ? 'var(--warning-color)' : 'white'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: ${isSelected ? 18 : 12}px;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: rotate(45deg);
      ">
        <div style="transform: rotate(-45deg);">${type.charAt(0).toUpperCase()}</div>
      </div>
    `,
    iconSize: [isSelected ? 40 : 28, isSelected ? 40 : 28],
    iconAnchor: [isSelected ? 20 : 14, isSelected ? 20 : 14],
    popupAnchor: [0, isSelected ? -20 : -14],
  });
};

const serviceColors = {
  hospital: 'var(--error-color)',
  police: 'var(--primary-color)',
  ambulance: 'var(--warning-color)',
  fire: 'var(--error-color)',
  pharmacy: 'var(--success-color)',
  clinic: 'var(--primary-dark)',
  medical: 'var(--error-color)',
  other: 'var(--secondary-color)',
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
  const { theme } = useTheme();
  const [hoveredService, setHoveredService] = useState(null);

  const isDark = theme === 'dark';
  
  // CartoDB tiles are often cleaner for modern UI
  const tileUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
    <div className={`w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] transition-all duration-300 ${
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
          url={tileUrl}
          attribution={tileAttribution}
        />
        
        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: var(--primary-color);
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid ${isDark ? '#0f172a' : 'white'};
                  box-shadow: 0 0 15px var(--primary-color);
                  animation: pulse 2s infinite;
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup className="theme-aware-popup">
              <div className="text-center p-1">
                <div className="font-bold text-[var(--primary-color)] text-sm mb-1 text-gradient">Your Location</div>
                <div className="text-[10px] text-[var(--text-muted)] font-medium">
                  ACCURACY: ±{userLocation.accuracy.toFixed(0)}m
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Service Markers */}
        {services.map((service) => {
          if (!service.location?.coordinates || service.location.coordinates.length < 2) {
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
                serviceColors[serviceType] || 'var(--primary-color)', 
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
                  <div className="p-3 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl shadow-xl">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                      Signal Lock: {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                    <div className="font-black text-[var(--text-color)] text-base uppercase tracking-tight">{service.name}</div>
                    <div className="text-xs text-[var(--text-muted)] font-medium mt-1">
                      {getAddressText(service.location.address)}
                    </div>
                  </div>
                </Popup>
              )}
              <Popup className={isMobile ? 'w-64' : 'w-80'}>
                <div className="p-4 space-y-4 bg-[var(--surface-color)] text-[var(--text-color)]">
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-[0.2em]">
                      {serviceType} protocol active
                    </div>
                    <div className="text-xl font-black tracking-tighter uppercase leading-tight">
                      {service.name}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-[var(--background-color)] rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--primary-color)] mt-0.5" />
                      <span className="text-xs font-bold leading-relaxed">
                        {getAddressText(service.location.address)}
                      </span>
                    </div>
                  </div>

                  {service.contact?.phone && (
                    <div className="flex items-center gap-2 text-sm font-black text-[var(--success-color)]">
                      <Phone className="w-4 h-4" />
                      {service.contact.phone}
                    </div>
                  )}

                  <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-3'} mt-6 pt-4 border-t border-[var(--border-color)]`}>
                    {service.contact?.phone && (
                      <a
                        href={`tel:${service.contact.phone}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 modern-gradient text-[10px] font-black rounded-xl shadow-lg text-white uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                        onClick={e => e.stopPropagation()}
                      >
                        <Phone className="w-3.5 h-3.5 mr-2" />
                        Initiate Call
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-color)] text-[10px] font-black rounded-xl text-[var(--text-color)] uppercase tracking-widest hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 active:scale-95 transition-all"
                      onClick={e => e.stopPropagation()}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-2" />
                      Plot Route
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
              color: 'var(--error-color)', 
              fillColor: 'var(--error-color)', 
              fillOpacity: 0.15,
              weight: 3,
              dashArray: '8, 8'
            }}
          >
            <Popup className="danger-popup">
              <div className="p-3 text-center">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Hazard Warning</div>
                <div className="font-black text-[var(--text-color)] uppercase tracking-tight text-sm mb-2">{zone.label}</div>
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-red-500/10 py-1 px-2 rounded-lg border border-red-500/20">
                  Critical Awareness Required
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