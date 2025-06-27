import React, { useState, useMemo } from 'react';
import { MapPin, Crosshair, AlertTriangle, Menu, Sliders } from 'lucide-react';
import { useQuery } from 'react-query';
import { useLocation } from '../contexts/LocationContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/map/Sidebar';
import MapComponent from '../components/map/MapComponent';

// Constants
const SERVICE_TYPES = [
  { key: 'hospital', label: 'Hospitals', color: '#ef4444', icon: '🏥' },
  { key: 'police', label: 'Police', color: '#3b82f6', icon: '🚓' },
  { key: 'ambulance', label: 'Ambulance', color: '#f59e0b', icon: '🚑' },
];

const DEFAULT_DANGER_ZONES = [
  { lat: 28.6139, lng: 77.209, radius: 1000, label: 'High Crime Area' },
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const MapPage = () => {
  // Context hooks
  const { currentLocation, getCurrentLocation, address } = useLocation();
  const { sendSOSAlert } = useSocket();

  // State management
  const [radius, setRadius] = useState(5);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [selectedType, setSelectedType] = useState('hospital');
  const [selectedService, setSelectedService] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Data fetching
  const { data: services = [], isLoading, isError } = useQuery(
    ['services-nearby', currentLocation, radius],
    async () => {
      if (!currentLocation) return [];
      try {
        const { data } = await api.get('/services/nearby', {
          params: { 
            lat: currentLocation.lat, 
            lng: currentLocation.lng, 
            maxDistance: radius 
          },
        });
        return data.data?.services || [];
      } catch (error) {
        toast.error('Failed to load nearby services');
        return [];
      }
    },
    { 
      enabled: !!currentLocation,
      staleTime: 300000 // 5 minutes cache
    }
  );

  // Memoized filtered services
  const filteredServices = useMemo(
    () => services.filter(s => s.type === selectedType),
    [services, selectedType]
  );

  // Event handlers
  const handleSOS = async () => {
    if (!currentLocation) {
      toast.error('Please enable location services to send SOS');
      return;
    }
    try {
      await Promise.all([
        sendSOSAlert(currentLocation, 'other'),
        api.post('/sos', {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          emergencyType: 'other',
          description: 'Emergency SOS from map interface',
        })
      ]);
      toast.success('🚨 Emergency alert sent successfully!');
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Failed to send emergency alert. Please try again.');
    }
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
      toast.success('Location updated');
    } catch (error) {
      toast.error('Unable to get current location');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        serviceTypes={SERVICE_TYPES}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        services={filteredServices}
        onServiceClick={setSelectedService}
        isLoading={isLoading}
        isError={isError}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white shadow-sm z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Emergency Services Map
            </h1>

            <div className="hidden sm:flex items-center ml-4 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-xs">
                {address || (currentLocation ? 'Locating...' : 'Location unavailable')}
              </span>
            </div>
          </div>

          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-lg font-bold shadow-md flex items-center gap-2 animate-pulse-glow"
            onClick={handleSOS}
            aria-label="Send emergency SOS"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="hidden sm:inline">Emergency SOS</span>
          </button>
        </header>

        {/* Floating Controls */}
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3">
          {controlsOpen && (
            <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg flex flex-col gap-3">
              {/* Location Button */}
              <button
                onClick={handleGetLocation}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow disabled:opacity-50"
                disabled={isLoading}
              >
                <Crosshair className="w-4 h-4" />
                My Location
              </button>

              {/* Danger Zones Toggle */}
              <button
                onClick={() => setShowDangerZones(!showDangerZones)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow ${
                  showDangerZones
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border border-red-600 text-red-600 hover:bg-red-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {showDangerZones ? 'Hide' : 'Show'} Danger Zones
              </button>

              {/* Radius Selector */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 shadow text-sm">
                <label htmlFor="radius-select" className="font-medium">
                  Radius:
                </label>
                <select
                  id="radius-select"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                >
                  {RADIUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} km
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Controls Toggle Button */}
          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={controlsOpen ? 'Hide controls' : 'Show controls'}
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapComponent
            services={filteredServices}
            center={
              currentLocation
                ? [currentLocation.lat, currentLocation.lng]
                : [28.6139, 77.209] // Default to Delhi coordinates
            }
            zoom={14}
            height="100%"
            showUserLocation={!!currentLocation}
            userLocation={currentLocation}
            dangerZones={showDangerZones ? DEFAULT_DANGER_ZONES : []}
            onServiceClick={setSelectedService}
            selectedService={selectedService}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;