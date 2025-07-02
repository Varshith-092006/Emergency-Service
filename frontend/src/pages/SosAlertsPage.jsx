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
  const [filters, setFilters] = useState({
    status: [],
    type: [],
    timeRange: '24h'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  // CHANGED: Default center coordinates adjusted to [lat, lng]
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

  // CHANGED: Fixed coordinate order in useEffect
  useEffect(() => {
    if (selectedAlert && selectedAlert.location?.coordinates) {
      setMapCenter([
        selectedAlert.location.coordinates[1], // Latitude
        selectedAlert.location.coordinates[0]  // Longitude
      ]);
    }
  }, [selectedAlert]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with alerts list */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              SOS Alerts
              <Badge color="red" className="ml-2">
                {alerts.length} Active
              </Badge>
            </h1>
            <button 
              onClick={() => refetch()}
              className="p-2 rounded-full hover:bg-gray-100"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-red-500">
              Failed to load alerts. <button onClick={refetch} className="text-blue-500">Try again</button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No alerts found matching your filters
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {alerts.map(alert => (
                <li 
                  key={alert._id} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedAlert?._id === alert._id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {alert.emergencyType === 'medical' ? '🏥' : 
                           alert.emergencyType === 'police' ? '🚓' : 
                           alert.emergencyType === 'fire' ? '🚒' : '⚠️'}
                        </span>
                        <h3 className="font-medium">{alert.user?.name || 'Anonymous'}</h3>
                        <Badge 
                          color={
                            alert.status === 'pending' ? 'yellow' :
                            alert.status === 'acknowledged' ? 'blue' :
                            alert.status === 'responding' ? 'orange' : 'green'
                          }
                          size="sm"
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">
                          {alert.location?.address || 'Unknown location'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeSince(alert.createdAt)}
                    </div>
                  </div>
                  {alert.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {alert.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main content with map and alert details */}
      <div className="flex-1 flex flex-col">
        {/* CHANGED: Map view with corrected coordinate handling */}
        <div className="h-1/2 border-b border-gray-200">
          <MapComponent 
            center={mapCenter}
            zoom={selectedAlert ? 14 : 10}
            markers={alerts
              .filter(alert => alert.location?.coordinates) // Only include alerts with coordinates
              .map(alert => ({
                position: [
                  alert.location.coordinates[1], // Latitude
                  alert.location.coordinates[0]  // Longitude
                ],
                color: 
                  alert.status === 'pending' ? 'yellow' :
                  alert.status === 'acknowledged' ? 'blue' :
                  alert.status === 'responding' ? 'orange' : 'green',
                onClick: () => setSelectedAlert(alert),
                isSelected: selectedAlert?._id === alert._id
              }))}
          />
        </div>

        {/* Alert details */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedAlert ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-3xl">
                      {selectedAlert.emergencyType === 'medical' ? '🏥' : 
                       selectedAlert.emergencyType === 'police' ? '🚓' : 
                       selectedAlert.emergencyType === 'fire' ? '🚒' : '⚠️'}
                    </span>
                    {selectedAlert.user?.name || 'Anonymous'}
                  </h2>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Badge 
                      color={
                        selectedAlert.status === 'pending' ? 'yellow' :
                        selectedAlert.status === 'acknowledged' ? 'blue' :
                        selectedAlert.status === 'responding' ? 'orange' : 'green'
                      }
                    >
                      {selectedAlert.status}
                    </Badge>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(selectedAlert.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedAlert._id, 'acknowledged')}
                    disabled={selectedAlert.status !== 'pending' || updateStatusMutation.isLoading}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 disabled:opacity-50"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedAlert._id, 'resolved')}
                    disabled={selectedAlert.status === 'resolved' || updateStatusMutation.isLoading}
                    className="px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5" />
                      Location Details
                    </h3>
                    <div className="space-y-2">
                      <p>{selectedAlert.location?.address || 'No address provided'}</p>
                      {/* CHANGED: Corrected coordinate display order */}
                      <p className="text-sm text-gray-500">
                        Coordinates: {selectedAlert.location?.coordinates?.[1]?.toFixed(6)} (lat), 
                        {selectedAlert.location?.coordinates?.[0]?.toFixed(6)} (lng)
                      </p>
                      {selectedAlert.location?.accuracy && (
                        <p className="text-sm text-gray-500">
                          Accuracy: ±{selectedAlert.location.accuracy} meters
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <User className="w-5 h-5" />
                      User Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedAlert.user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedAlert.user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5" />
                      Emergency Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Emergency Type</h4>
                        <p className="capitalize">{selectedAlert.emergencyType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="whitespace-pre-wrap">
                          {selectedAlert.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedAlert.contactedServices?.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-medium flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5" />
                        Contacted Services
                      </h3>
                      <ul className="space-y-3">
                        {selectedAlert.contactedServices.map((service, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {service.service?.type === 'hospital' ? '🏥' : 
                               service.service?.type === 'police' ? '🚓' : 
                               service.service?.type === 'fire' ? '🚒' : '🏢'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{service.service?.name || 'Unknown service'}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {service.service?.contact?.phone || 'No contact'}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.response || 'No response'}
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
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-4" />
              <p className="text-lg">Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SosAlertsPage;
