import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import api from '../services/api';
import MapComponent from '../components/map/MapComponent';
import { Loader2, Search, MapPin, Phone, List, Map, Clock, Navigation, AlertCircle } from 'lucide-react';

const SERVICE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'police', label: 'Police Station' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'fire', label: 'Fire Station' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'veterinary', label: 'Veterinary' },
  { value: 'other', label: 'Other' }
];

const SERVICE_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'routine', label: 'Routine' }
];

const ServicesPage = () => {
  const { currentLocation } = useLocation();
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [radius, setRadius] = useState(10);
  const [showOpenNow, setShowOpenNow] = useState(false);

  const { data: services = [], isLoading, error } = useQuery(
    ['services', searchTerm, selectedType, selectedCategory, currentLocation, radius, sortBy, showOpenNow],
    async () => {
      const params = {
        search: searchTerm || undefined,
        type: selectedType || undefined,
        category: selectedCategory || undefined,
        isOpenNow: showOpenNow ? 'true' : undefined
      };

      // Clean up params (remove undefined values)
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      if (currentLocation && (sortBy === 'distance' || viewMode === 'map')) {
        const res = await api.get('api/admin/services/nearby', {
          params: {
            ...params,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            maxDistance: radius
          }
        });
        return res.data.data.services;
      }
      
      const res = await api.get('api/services', { params });
      return res.data.data.services;
    },
    {
      retry: 2,
      refetchOnWindowFocus: false,
      onError: (err) => {
        console.error('Error fetching services:', err);
      }
    }
  );

  const filteredServices = React.useMemo(() => {
    if (!services) return [];
    let results = [...services];
    
    if (currentLocation && sortBy === 'distance') {
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    }
    
    return results;
  }, [services, sortBy, currentLocation]);

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-5 h-5" />
        <span>Error loading services: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and View Mode Toggle (same as before) */}
      
      {/* Search and Filters */}
      <div className="card">
        <div className="card-body space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              className="input input-bordered pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="form-label">Service Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="select select-bordered w-full"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-bordered w-full"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="form-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered w-full"
              >
                {currentLocation && <option value="distance">Distance</option>}
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Search Radius (only shown when location available) */}
            {currentLocation && (
              <div>
                <label className="form-label">Search Radius (km)</label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="select select-bordered w-full"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>
            )}
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOpenNow}
              onChange={() => setShowOpenNow(!showOpenNow)}
              className="checkbox checkbox-primary"
            />
            <span>Show only open now</span>
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
          <div className="text-sm text-gray-600">
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            {currentLocation && ` within ${radius} km`}
          </div>

          {viewMode === 'map' ? (
            <div className="card">
              <div className="card-body p-0 h-[600px]">
                <MapComponent
                  services={filteredServices}
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
                  zoom={currentLocation ? 12 : 8}
                  showUserLocation={!!currentLocation}
                  onServiceClick={(service) => window.location.href = `/services/${service._id}`}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  currentLocation={currentLocation} 
                />
              ))}
            </div>
          )}

          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">
                Try adjusting your search filters or expanding your search radius
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ServiceCard = ({ service, currentLocation }) => {
  const distance = currentLocation ? 
    calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      service.location.coordinates[1],
      service.location.coordinates[0]
    ) : null;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="card-body space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{service.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="badge badge-primary">{service.type}</span>
              <span className="badge badge-secondary">{service.category}</span>
              {service.isOpenNow && (
                <span className="badge badge-success">Open Now</span>
              )}
            </div>
          </div>
          {service.ratings?.average > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {service.ratings.average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600 line-clamp-2">
              {service.location.address.fullAddress}
            </div>
          </div>

          {distance !== null && (
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
              <a 
                href={`tel:${service.contact.phone}`} 
                className="text-sm text-gray-600 hover:underline"
              >
                {service.contact.phone}
              </a>
            </div>
          )}

          {service.operatingHours && !service.operatingHours.is24Hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {service.operatingHours[new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()]?.open} -{' '}
                {service.operatingHours[new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()]?.close}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link
            to={`/services/${service._id}`}
            className="btn btn-primary btn-sm flex-1"
          >
            View Details
          </Link>
          {service.contact?.phone && (
            <a
              href={`tel:${service.contact.phone}`}
              className="btn btn-success btn-sm"
            >
              Call Now
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for distance calculation
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export default ServicesPage;