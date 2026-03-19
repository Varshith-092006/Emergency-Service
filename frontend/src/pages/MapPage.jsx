import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Crosshair, AlertTriangle, Menu, Sliders, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from 'react-query';
import { useLocation } from '../contexts/LocationContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/map/Sidebar';
import MapComponent from '../components/map/MapComponent';

const SERVICE_TYPES = [
  { key: 'hospital', label: 'Hospitals', color: '#ef4444', icon: '🏥' },
  { key: 'police', label: 'Police', color: '#3b82f6', icon: '🚓' },
  { key: 'ambulance', label: 'Ambulance', color: '#f59e0b', icon: '🚑' },
  { key: 'pharmacy', label: 'Pharmacy', color: '#10b981', icon: '💊' },
];

const DEFAULT_DANGER_ZONES = [
  { lat: 28.6139, lng: 77.209, radius: 1000, label: 'High Crime Area' },
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const MapPage = () => {
  const { currentLocation, address, getCurrentLocation, isLoadingLocation } = useLocation();
  const { sendSOSAlert, socket } = useSocket();
  const queryClient = useQueryClient();

  const [radius, setRadius] = useState(5);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [selectedType, setSelectedType] = useState('hospital');
  const [selectedService, setSelectedService] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [controlsOpen, setControlsOpen] = useState(false);

  const { data: services = [], isLoading, isError } = useQuery(
    ['services-nearby', currentLocation, radius],
    async () => {
      if (!currentLocation) return [];
      try {
        const { data } = await api.get('/api/services/nearby', {
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
      staleTime: 300000
    }
  );

  // Fetch active SOS alerts to display on the map
  const { data: sosAlerts = [], refetch: refetchSOS } = useQuery(
    ['sos-alerts-map'],
    async () => {
      try {
        const { data } = await api.get('/api/sos', {
          params: { status: 'pending' }
        });
        return data.data?.sosAlerts || [];
      } catch (error) {
        // Non-admin users may not have access to all alerts, silently fail
        console.error('Could not fetch SOS alerts for map:', error);
        return [];
      }
    },
    {
      refetchInterval: 30000,
      staleTime: 10000
    }
  );

  // Listen for real-time SOS events to instantly show new markers
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = () => {
      // Refetch SOS alerts when a new one arrives via socket
      refetchSOS();
    };

    socket.on('emergency-alert', handleNewAlert);
    return () => {
      socket.off('emergency-alert', handleNewAlert);
    };
  }, [socket, refetchSOS]);

  // Convert SOS alerts to marker format compatible with MapComponent
  const sosMarkers = useMemo(() => {
    return sosAlerts
      .filter(alert => alert.location?.coordinates && alert.location.coordinates.length >= 2)
      .map(alert => ({
        _id: `sos-${alert._id}`,
        type: alert.emergencyType || 'other',
        name: `🆘 SOS: ${alert.user?.name || alert.description || 'Emergency Alert'}`,
        location: {
          coordinates: [
            alert.location.coordinates[0], // Longitude
            alert.location.coordinates[1]  // Latitude
          ],
          address: {
            fullAddress: alert.location?.address || alert.description || 'SOS Alert Location'
          }
        },
        contact: {
          phone: alert.user?.phone || null
        }
      }));
  }, [sosAlerts]);

  const filteredServices = useMemo(
    () => services.filter(s => s.type === selectedType),
    [services, selectedType]
  );

  // Combine filtered services with SOS alert markers
  const allMapMarkers = useMemo(
    () => [...filteredServices, ...sosMarkers],
    [filteredServices, sosMarkers]
  );

  const handleSOS = async () => {
  if (!currentLocation) {
    toast.error('Please enable location services to send SOS');
    return;
  }
  try {
    await Promise.all([
      sendSOSAlert(currentLocation, 'other'),
      api.post('/api/sos', {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        emergencyType: 'other',
        address: address || 'Current location',
        description: 'Emergency SOS from map interface',
        accuracy: 50 // Add accuracy if available
      })
    ]);
    toast.success('🚨 Emergency alert sent successfully!');
    // Immediately refetch SOS alerts to show the new marker
    refetchSOS();
  } catch (error) {
    console.error('SOS Error:', error);
    toast.error(error.response?.data?.message || 'Failed to send emergency alert. Please try again.');
  }
};

  const handleRefreshLocation = async () => {
    try {
      await getCurrentLocation();
      toast.success('Location and address refreshed');
    } catch (error) {
      toast.error('Unable to refresh location');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[var(--background-color)]">
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

      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-[var(--surface-color)]/80 backdrop-blur-md border-b border-[var(--border-color)] z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-xl text-[var(--text-color)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--primary-color)] tracking-tighter uppercase italic" style={{ fontFamily: 'var(--font-serif)' }}>
                Service <span className="not-italic text-[var(--text-color)]">Locator</span>
              </h1>
              <div className="hidden sm:flex items-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                <MapPin className="w-3 h-3 mr-1.5 text-[var(--primary-color)]" />
                <span className="truncate max-w-[200px]">
                  {isLoadingLocation ? 'Synchronizing Coordinates...' : 
                   address || 
                   (currentLocation ? 'Coordinate Established' : 'GPS Signal Lost')}
                </span>
                {currentLocation && (
                  <button 
                    onClick={handleRefreshLocation}
                    className="ml-2 p-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors text-[var(--primary-color)]"
                    title="Recalibrate"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary animate-pulse-glow"
            onClick={handleSOS}
            aria-label="Request Emergency Assistance"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span>Request SOS</span>
          </button>
        </header>

        <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
          {controlsOpen && (
            <div className="glass-panel p-5 rounded-2xl shadow-2xl flex flex-col gap-4 border border-[var(--border-color)] animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={handleRefreshLocation}
                className="flex items-center justify-center gap-3 bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-color)] rounded-xl px-5 py-3 text-sm font-bold shadow-sm hover:bg-[var(--surface-hover)] transition-all disabled:opacity-50 active:scale-95"
                disabled={isLoadingLocation}
              >
                <Crosshair className="w-4 h-4 text-[var(--primary-color)]" />
                Recalibrate GPS
              </button>

              <button
                onClick={() => setShowDangerZones(!showDangerZones)}
                className={`flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  showDangerZones
                    ? 'bg-red-500 text-white shadow-red-500/20'
                    : 'bg-[var(--surface-color)] border border-red-500/30 text-red-500'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {showDangerZones ? 'Deactivate' : 'Activate'} Danger Zones
              </button>

              <div className="flex items-center justify-between gap-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 shadow-inner text-sm">
                <label htmlFor="radius-select" className="font-bold text-[var(--text-muted)] uppercase tracking-widest text-[10px]">
                  Scanning Radius:
                </label>
                <select
                  id="radius-select"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="bg-transparent text-[var(--text-color)] font-bold focus:outline-none cursor-pointer"
                >
                  {RADIUS_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[var(--surface-color)]">
                      {option} km
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className="w-14 h-14 bg-[var(--primary-color)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-300"
            aria-label={controlsOpen ? 'Collapse Data Controls' : 'Expand Data Controls'}
          >
            <Sliders className={`w-6 h-6 transition-transform duration-500 ${controlsOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapComponent
            services={allMapMarkers}
            center={
              currentLocation
                ? [currentLocation.lat, currentLocation.lng]
                : [28.6139, 77.209]
            }
            zoom={14}
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