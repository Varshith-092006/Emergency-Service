import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useLocation } from '../contexts/LocationContext';
import api from '../services/api';
import MapComponent from '../components/map/MapComponent';
import { 
  Loader2, 
  Search, 
  MapPin, 
  Phone, 
  List, 
  Map,
  Clock,
  Navigation,
  AlertCircle,
  Timer
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const { data: services = [], isLoading, error, refetch } = useQuery(
    ['services', searchTerm, selectedType, selectedCategory, currentLocation, radius, sortBy, showOpenNow, lastRefresh],
    async ({ signal }) => {
      try {
        const params = {
          search: searchTerm || undefined,
          type: selectedType || undefined,
          category: selectedCategory || undefined,
          isOpenNow: showOpenNow ? 'true' : undefined,
          sort: sortBy === 'rating' ? '-ratings.average' : undefined
        };

        const endpoint = currentLocation && (sortBy === 'distance' || viewMode === 'map') 
          ? '/api/services/nearby' 
          : '/api/services';

        const response = await api.get(endpoint, {
          params: endpoint === '/api/services/nearby' ? {
            ...params,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            maxDistance: radius
          } : params,
          signal // Pass the abort signal
        });

        return response.data.data.services;
      } catch (err) {
        if (err.code === 'ERR_CANCELED') {
          // Request was canceled (e.g., due to rapid filter changes)
          return [];
        }
        throw err;
      }
    },
    {
      retry: 2,
      retryDelay: 2000,
      staleTime: 5 * 60 * 1000,
      onError: (err) => {
        if (err.code !== 'ERR_CANCELED') {
          toast.error(err.response?.data?.message || 'Failed to load services');
        }
      }
    }
  );

  // Debounce rapid filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastRefresh(Date.now());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedCategory, radius, showOpenNow]);

  // Sort services
  const sortedServices = React.useMemo(() => {
    if (!services) return [];
    
    let results = [...services];
    
    if (currentLocation && sortBy === 'distance') {
      results.sort((a, b) => {
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
      });
    } else if (sortBy === 'rating') {
      results.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return results;
  }, [services, sortBy, currentLocation]);

  // Calculate distance between coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
          <Timer className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white" />
        </div>
        <p className="mt-4 text-lg">Loading emergency services...</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a moment depending on your filters
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <AlertCircle className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Failed to load services</h3>
          <p className="text-sm">{error.message}</p>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => refetch()}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedCategory('');
                setShowOpenNow(false);
                refetch();
              }}
              className="btn btn-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Services</h1>
          <p className="text-gray-600">
            {currentLocation ? 'Services near your location' : 'Browse all emergency services'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md ${viewMode === 'map' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}
          >
            <Map className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, type, or location..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="label">
                <span className="label-text">Service Type</span>
              </label>
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
              <label className="label">
                <span className="label-text">Category</span>
              </label>
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
              <label className="label">
                <span className="label-text">Sort By</span>
              </label>
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
                <label className="label">
                  <span className="label-text">Search Radius (km)</span>
                </label>
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
              className="toggle toggle-primary"
              id="openNowToggle"
            />
            <label htmlFor="openNowToggle" className="cursor-pointer">
              Show only open now
            </label>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Found {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''}
        {currentLocation && ` within ${radius} km`}
        {showOpenNow && ', currently open'}
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0 h-[600px]">
            <MapComponent
              services={sortedServices}
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
              zoom={currentLocation ? 12 : 8}
              showUserLocation={!!currentLocation}
              onServiceClick={(service) => window.location.href = `/services/${service._id}`}
            />
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map(service => (
            <ServiceCard 
              key={service._id} 
              service={service} 
              currentLocation={currentLocation} 
              calculateDistance={calculateDistance}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search filters or expanding your search radius
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedCategory('');
              setShowOpenNow(false);
              setRadius(10);
            }}
            className="btn btn-primary"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ service, currentLocation, calculateDistance }) => {
  const distance = currentLocation ? 
    calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      service.location.coordinates[1],
      service.location.coordinates[0]
    ) : null;

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{service.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="badge badge-primary capitalize">{service.type}</span>
              <span className="badge badge-secondary capitalize">{service.category}</span>
              {service.isOpenNow && (
                <span className="badge badge-success">Open Now</span>
              )}
              {!service.isActive && (
                <span className="badge badge-error">Inactive</span>
              )}
            </div>
          </div>
          {service.ratings?.average > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
              <span className="text-yellow-500">★</span>
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

export default ServicesPage;