import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext.jsx';
import api from '../services/api';
import MapComponent from '../components/map/MapComponent';
import { 
  Loader2, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Grid, 
  List, 
  Map,
  Star,
  Clock,
  Navigation
} from 'lucide-react';

const ServicesPage = () => {
  const { currentLocation } = useLocation();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [radius, setRadius] = useState(10);

  // Fetch services
  const { data: services, isLoading, error } = useQuery(
    ['services', searchTerm, selectedType, currentLocation, radius],
    async () => {
      const params = {
        search: searchTerm,
        type: selectedType,
        limit: 50,
      };

      // Add location-based search if user location is available
      if (currentLocation) {
        params.lat = currentLocation.lat;
        params.lng = currentLocation.lng;
        params.maxDistance = radius;
      }

      const res = await api.get('api/services', { params });
      return res.data.data.services;
    }
  );

  // Filter and sort services
  const filteredServices = React.useMemo(() => {
    if (!services) return [];

    let filtered = services;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location?.address?.fullAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(service => service.type === selectedType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'distance':
          if (!currentLocation) return 0;
          const distA = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            a.location.coordinates[1],
            a.location.coordinates[0]
          );
          const distB = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            b.location.coordinates[1],
            b.location.coordinates[0]
          );
          return distA - distB;
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchTerm, selectedType, sortBy, currentLocation]);

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get distance for a service
  const getServiceDistance = (service) => {
    if (!currentLocation || !service.location?.coordinates) return null;
    return calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      service.location.coordinates[1],
      service.location.coordinates[0]
    );
  };

  // Service type options
  const serviceTypes = [
    { value: '', label: 'All Types' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'police', label: 'Police Station' },
    { value: 'ambulance', label: 'Ambulance' },
    { value: 'fire', label: 'Fire Station' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'clinic', label: 'Clinic' },
  ];

  if (error) {
    return (
      <div className="text-center text-error-600">
        Error loading services. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Services</h1>
          <p className="text-gray-600">
            Find nearby emergency services and get directions
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'map' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services by name, type, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Service Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-input"
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                {currentLocation && <option value="distance">Distance</option>}
              </select>
            </div>

            {currentLocation && (
              <div>
                <label className="form-label">Search Radius</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="form-input"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                  setSortBy('name');
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin w-8 h-8 text-primary-600" />
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            {currentLocation && ' near your location'}
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="card">
              <div className="card-body p-0">
                <MapComponent
                  services={filteredServices}
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.209]}
                  zoom={currentLocation ? 12 : 10}
                  height="600px"
                  showUserLocation={!!currentLocation}
                  userLocation={currentLocation}
                  onServiceClick={(service) => {
                    // Navigate to service detail
                    window.location.href = `/services/${service._id}`;
                  }}
                />
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const distance = getServiceDistance(service);
                
                return (
                  <div key={service._id} className="card hover:shadow-medium transition-shadow">
                    <div className="card-body space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="badge badge-primary capitalize">
                              {service.type}
                            </span>
                            {service.isActive !== undefined && (
                              <span className={`badge ${service.isActive ? 'badge-success' : 'badge-error'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {service.location?.address?.fullAddress || 'No address available'}
                          </div>
                        </div>

                        {distance && (
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {distance.toFixed(1)} km away
                            </span>
                          </div>
                        )}

                        {service.contact?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {service.contact.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link
                          to={`/services/${service._id}`}
                          className="btn btn-primary btn-sm flex items-center gap-1 flex-1"
                        >
                          <MapPin className="w-4 h-4" /> Details
                        </Link>
                        {service.contact?.phone && (
                          <a
                            href={`tel:${service.contact.phone}`}
                            className="btn btn-success btn-sm flex items-center gap-1"
                          >
                            <Phone className="w-4 h-4" /> Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {filteredServices.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or expanding your search radius.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesPage; 