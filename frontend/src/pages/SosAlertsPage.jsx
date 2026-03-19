import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Bell, BellOff, MapPin, Clock, AlertTriangle, 
  Filter, RefreshCw, ChevronDown, ChevronUp,
  Phone, Mail, User, Shield, Check, X
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import MapComponent from '../components/map/MapComponent';
import Badge from '../components/ui/Badge';
import { useSocket } from '../contexts/SocketContext';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'bg-blue-500' },
  { value: 'responding', label: 'Responding', color: 'bg-orange-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' }
];

const TYPE_OPTIONS = [
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'police', label: 'Police', icon: '🚓' },
  { value: 'fire', label: 'Fire', icon: '🚒' },
  { value: 'other', label: 'Other', icon: '⚠️' }
];

const SosAlertsPage = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [filters, setFilters] = useState({
    status: [],
    type: [],
    timeRange: '24h'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center

  // Fetch alerts
  const { data: alerts = [], isLoading, isError, refetch } = useQuery(
    ['sos-alerts', filters],
    async () => {
      const params = {};
      if (filters.status.length) params.status = filters.status.join(',');
      if (filters.type.length) params.emergencyType = filters.type.join(',');
      if (filters.timeRange) params.timeRange = filters.timeRange;
      
      const res = await api.get('/api/sos/admin/active', { params });
      return res.data.data.activeSos;
    },
    { refetchInterval: 30000 }
  );

  // Listen for real-time SOS socket events so chatbot alerts appear immediately
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (data) => {
      // Show a toast for the incoming alert
      toast.error('🚨 New SOS Alert received!', {
        duration: 8000,
        icon: '🆘'
      });
      // Immediately refetch alerts from the server
      refetch();
    };

    socket.on('emergency-alert', handleNewAlert);
    return () => {
      socket.off('emergency-alert', handleNewAlert);
    };
  }, [socket, refetch]);

  // Update mutation for status changes
  const updateStatusMutation = useMutation(
    ({ id, status, notes }) => api.put(`/api/sos/${id}/status`, { status, notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['sos-alerts']);
        toast.success('Status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    }
  );

  // Handle status change
  const handleStatusChange = (alertId, newStatus) => {
    updateStatusMutation.mutate({ 
      id: alertId, 
      status: newStatus,
      notes: `Status changed to ${newStatus}`
    });
  };

  // Toggle filter selection
  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  // Format time since alert
  const formatTimeSince = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    if (selectedAlert && selectedAlert.location?.coordinates) {
      setMapCenter([
        selectedAlert.location.coordinates[1], // Latitude
        selectedAlert.location.coordinates[0]  // Longitude
      ]);
    }
  }, [selectedAlert]);

  // Prepare services data for MapComponent
  const getAlertMarkerData = () => {
    return alerts
      .filter(alert => alert.location?.coordinates && alert.location.coordinates.length >= 2)
      .map(alert => ({
        _id: alert._id,
        type: alert.emergencyType,
        name: alert.user?.name || 'Anonymous',
        location: {
          coordinates: [
            alert.location.coordinates[0], // Longitude
            alert.location.coordinates[1]  // Latitude
          ],
          address: {
            fullAddress: alert.location?.address || 'Unknown location'
          }
        },
        contact: {
          phone: alert.user?.phone
        }
      }));
  };

  return (
    <div className="flex h-screen bg-[var(--background-color)]">
      {/* Sidebar with alerts list */}
      <div className="w-full md:w-96 bg-[var(--surface-color)] border-r border-[var(--border-color)] flex flex-col shadow-xl z-20 transition-all duration-300">
        <div className="p-8 border-b border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black flex flex-col text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
              <span className="not-italic text-[10px] font-black uppercase tracking-[0.4em] text-[var(--secondary-color)] mb-2">Security Console</span>
              Alert <span className="not-italic">Matrix</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse-glow">
                {alerts.length}
              </span>
              <button 
                onClick={() => refetch()}
                className="p-3 rounded-2xl text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--surface-hover)] transition-all border border-[var(--border-color)]"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFilters && (
              <div className="mt-2 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter('status', option.value)}
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${filters.status.includes(option.value) ? option.color + ' text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {filters.status.includes(option.value) ? <Check className="w-3 h-3" /> : null}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Emergency Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter('type', option.value)}
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${filters.type.includes(option.value) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {filters.type.includes(option.value) ? <Check className="w-3 h-3" /> : null}
                        <span className="mr-1">{option.icon}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Time Range</h3>
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="1h">Last hour</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="relative">
                <RefreshCw className="animate-spin w-10 h-10 text-[var(--primary-color)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--primary-color)] rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Decoding Feed...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center glass-panel m-4 rounded-2xl border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-500 font-bold text-sm mb-3">Signal Interrupted</p>
              <button onClick={() => refetch()} className="px-4 py-2 modern-gradient text-white text-xs font-bold rounded-xl active:scale-95 transition-all">Reconnect</button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] font-medium opacity-50">
              Zero active threats detected in this matrix.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {alerts.map(alert => (
                <li 
                  key={alert._id} 
                  className={`p-6 transition-all duration-300 cursor-pointer border-l-4 group active:scale-[0.98] ${selectedAlert?._id === alert._id ? 'bg-[var(--primary-color)]/10 border-l-[var(--primary-color)] shadow-inner' : 'hover:bg-[var(--surface-hover)] border-l-transparent'}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--background-color)] flex items-center justify-center text-lg border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                          {alert.emergencyType === 'medical' ? '🏥' : 
                           alert.emergencyType === 'police' ? '🚓' : 
                           alert.emergencyType === 'fire' ? '🚒' : '⚠️'}
                        </div>
                        <h3 className="font-bold text-[var(--text-color)] truncate text-lg tracking-tight">{alert.user?.name || 'Unknown Operator'}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                            alert.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            alert.status === 'acknowledged' ? 'bg-blue-100 text-blue-700' :
                            alert.status === 'responding' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                         }`}>
                            {alert.status} PROTOCOL
                         </span>
                      </div>
                      <div className="flex items-center text-[10px] font-medium text-[var(--text-muted)] group-hover:text-[var(--primary-color)] transition-colors">
                        <MapPin className="flex-shrink-0 w-3 h-3 mr-1.5" />
                        <span className="truncate">
                          {alert.location?.address || 'Geolocation Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] flex items-center uppercase tracking-widest opacity-60">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeSince(alert.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main content with map and alert details */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Map view */}
        <div className="h-2/5 border-b border-[var(--border-color)] relative">
          <MapComponent 
            center={mapCenter}
            zoom={selectedAlert ? 15 : 12}
            services={getAlertMarkerData()}
            showUserLocation={false}
            selectedService={selectedAlert ? {
              _id: selectedAlert._id,
              type: selectedAlert.emergencyType,
              location: {
                coordinates: [
                  selectedAlert.location.coordinates[0],
                  selectedAlert.location.coordinates[1]
                ]
              }
            } : null}
            onServiceClick={setSelectedAlert}
          />
          <div className="absolute top-6 right-6 z-[1000]">
            <div className="glass-panel px-4 py-2 rounded-xl border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-color)] shadow-2xl">
              Live Satellite Feed
            </div>
          </div>
        </div>

        {/* Alert details */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--background-color)]">
          {selectedAlert ? (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b border-[var(--border-color)]">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-[var(--primary-color)]/10 flex items-center justify-center text-4xl shadow-inner border border-[var(--primary-color)]/20">
                    {selectedAlert.emergencyType === 'medical' ? '🏥' : 
                     selectedAlert.emergencyType === 'police' ? '🚓' : 
                     selectedAlert.emergencyType === 'fire' ? '🚒' : '⚠️'}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-[var(--text-color)] tracking-tighter uppercase mb-2">
                      {selectedAlert.user?.name || 'Unidentified Civilian'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge 
                        color={
                          selectedAlert.status === 'pending' ? 'yellow' :
                          selectedAlert.status === 'acknowledged' ? 'blue' :
                          selectedAlert.status === 'responding' ? 'orange' : 'green'
                        }
                        className="py-1 px-3 text-[10px] font-black italic uppercase tracking-widest"
                      >
                        {selectedAlert.status} Protocol
                      </Badge>
                      <div className="h-1 w-1 rounded-full bg-[var(--text-muted)] opacity-30"></div>
                      <div className="flex items-center text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        Transmitted: {new Date(selectedAlert.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedAlert._id, 'acknowledged')}
                    disabled={selectedAlert.status !== 'pending' || updateStatusMutation.isLoading}
                    className="px-6 py-3 bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 rounded-xl font-bold text-sm hover:bg-[var(--primary-color)] hover:text-white transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAlert._id, 'resolved')}
                    disabled={selectedAlert.status === 'resolved' || updateStatusMutation.isLoading}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                  >
                    Resolve Alert
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side info */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="p-1.5 bg-[var(--primary-color)]/10 rounded-lg">
                        <MapPin className="text-[var(--primary-color)] w-4 h-4" />
                      </div>
                      Deployment Coordinates
                    </h3>
                    <div className="space-y-4">
                        <a 
                          href={selectedAlert.location?.coordinates && selectedAlert.location.coordinates.length >= 2 ? `https://www.google.com/maps/search/?api=1&query=${selectedAlert.location.coordinates[1]},${selectedAlert.location.coordinates[0]}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAlert.location?.address || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-2xl font-bold text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors leading-tight block"
                        >
                          {selectedAlert.location?.address || 'Geolocation Pending...'}
                        </a>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-[var(--border-color)]">
                        <div>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">LATITUDE</p>
                          <p className="font-mono text-[var(--text-color)] text-sm">{selectedAlert.location?.coordinates?.[1]?.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">LONGITUDE</p>
                          <p className="font-mono text-[var(--text-color)] text-sm">{selectedAlert.location?.coordinates?.[0]?.toFixed(6)}</p>
                        </div>
                        {selectedAlert.location?.accuracy && (
                          <div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">ACCURACY</p>
                            <p className="font-mono text-[var(--text-color)] text-sm">±{selectedAlert.location.accuracy}m</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="text-amber-500 w-4 h-4" />
                      </div>
                      Incident Brief
                    </h3>
                    <div className="bg-[var(--background-color)] p-6 rounded-2xl border border-[var(--border-color)] shadow-inner">
                      <p className="text-[var(--text-color)] font-medium leading-relaxed whitespace-pre-wrap italic opacity-90">
                        {selectedAlert.description ? `"${selectedAlert.description}"` : "No descriptive intel provided by operator."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side info */}
                <div className="space-y-8">
                  <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <User className="text-blue-500 w-4 h-4" />
                      </div>
                      Subject Intel
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-[var(--background-color)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-[var(--primary-color)]/50 transition-colors">
                          <Phone className="w-4 h-4 text-[var(--primary-color)]" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">COMMS CHANNEL</p>
                          <a href={`tel:${selectedAlert.user?.phone}`} className="font-bold text-[var(--text-color)] hover:underline">{selectedAlert.user?.phone || 'OFFLINE'}</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-[var(--background-color)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                          <Mail className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">DIGITAL SIGNATURE</p>
                          <p className="font-bold text-[var(--text-color)] truncate max-w-[150px]">{selectedAlert.user?.email || 'UNREGISTERED'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedAlert.contactedServices?.length > 0 && (
                    <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
                      <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <Shield className="text-green-500 w-4 h-4" />
                        </div>
                        Active Responders
                      </h3>
                      <ul className="space-y-6">
                        {selectedAlert.contactedServices.map((service, index) => (
                          <li key={index} className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <div className="text-xl">
                                {service.service?.type === 'hospital' ? '🏥' : 
                                 service.service?.type === 'police' ? '🚓' : 
                                 service.service?.type === 'fire' ? '🚒' : '🏢'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[var(--text-color)] truncate text-sm">{service.service?.name}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                  {service.service?.contact?.phone || 'No direct comms'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-1 px-3 py-1.5 bg-[var(--background-color)] rounded-lg border border-[var(--border-color)] text-[10px] font-bold text-[var(--primary-color)] italic">
                              {service.response || 'Awaiting response...'}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] opacity-30 select-none">
              <div className="relative mb-8">
                <AlertTriangle className="w-24 h-24" />
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
              </div>
              <p className="text-2xl font-black uppercase tracking-[0.3em]">System Idling</p>
              <p className="text-sm font-bold mt-2">SELECT INCIDENT NODE FOR FULL SPECTRUM ANALYSIS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SosAlertsPage;