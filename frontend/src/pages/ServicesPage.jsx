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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [radius, setRadius] = useState(10);
  const [showOpenNow, setShowOpenNow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: services = [], isLoading, error, refetch } = useQuery(
    ['services', debouncedSearchTerm, selectedType, selectedCategory, currentLocation, radius, sortBy, showOpenNow],
    async ({ signal }) => {
      try {
        const params = {
          search: debouncedSearchTerm || undefined,
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
          signal
        });

        return response.data.data.services;
      } catch (err) {
        if (err.code === 'ERR_CANCELED') {
          return [];
        }
        throw err;
      }
    },
    {
      retry: 2,
      retryDelay: 2000,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      onError: (err) => {
        if (err.code !== 'ERR_CANCELED') {
          toast.error(err.response?.data?.message || 'Failed to load services');
        }
      }
    }
  );

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative">
          <Loader2 className="animate-spin w-12 h-12 text-[var(--primary-color)]" />
          <Timer className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white" />
        </div>
        <p className="mt-4 text-lg text-[var(--text-color)] font-medium">Scanning for emergency services...</p>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-20 animate-in fade-in slide-in-from-top-6 duration-700">
          <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em]">Network Intelligence</span>
          <h1 className="text-6xl sm:text-8xl font-black text-[var(--primary-color)] tracking-tighter italic leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            Service <span className="not-italic text-[var(--text-color)]">Directory</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] font-medium max-w-3xl leading-relaxed italic opacity-80" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentLocation ? '"Providing a real-time bridge to response units near your coordinate for immediate assistance."' : '"A global directory of vital emergency response units dedicated to community safety and swift intervention."'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
          <div className="inline-flex bg-[var(--surface-color)] border border-[var(--border-color)] rounded-xl p-1 shadow-sm self-end">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'list' ? 'bg-[var(--primary-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${viewMode === 'map' ? 'bg-[var(--primary-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}
              title="Map View"
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-4xl">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-[var(--text-muted)] opacity-30 group-focus-within:text-[var(--primary-color)] group-focus-within:opacity-100 transition-all" />
          </div>
          <input
            type="text"
            placeholder="Search network: hospitals, units, coordinates..."
            className="block w-full pl-16 pr-6 py-6 border border-[var(--border-color)] rounded-[2rem] bg-white text-[var(--text-color)] placeholder-[var(--text-muted)] shadow-xl focus:outline-none focus:ring-4 focus:ring-[var(--primary-color)]/5 focus:border-[var(--primary-color)] text-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-color)] ml-1 uppercase tracking-wider opacity-80">Service Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] py-3 px-4 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all cursor-pointer"
            >
              {SERVICE_TYPES.map(type => (
                <option key={type.value} value={type.value} className="bg-[var(--surface-color)]">{type.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-color)] ml-1 uppercase tracking-wider opacity-80">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] py-3 px-4 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all cursor-pointer"
            >
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value} className="bg-[var(--surface-color)]">{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-color)] ml-1 uppercase tracking-wider opacity-80">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] py-3 px-4 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all cursor-pointer"
            >
              {currentLocation && <option value="distance" className="bg-[var(--surface-color)]">Distance</option>}
              <option value="rating" className="bg-[var(--surface-color)]">Rating</option>
              <option value="name" className="bg-[var(--surface-color)]">Name</option>
            </select>
          </div>

          {currentLocation && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[var(--text-color)] ml-1 uppercase tracking-wider opacity-80">Search Radius (km)</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-color)] py-3 px-4 shadow-sm focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all cursor-pointer"
              >
                {[5, 10, 20, 50, 100].map(r => (
                  <option key={r} value={r} className="bg-[var(--surface-color)]">{r} km</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Open Now Toggle */}
        <div className="flex items-center group cursor-pointer" onClick={() => setShowOpenNow(!showOpenNow)}>
          <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${showOpenNow ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${showOpenNow ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <label htmlFor="openNowToggle" className="ml-3 block text-sm font-bold text-[var(--text-color)] uppercase tracking-wider opacity-80 cursor-pointer">
            Live availability only
          </label>
        </div>

        {/* Results Count */}
        <div className="text-sm text-[var(--text-muted)] font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse"></div>
          Found {sortedServices.length} response units {currentLocation && `within ${radius} km`} {showOpenNow && '• Active status'}
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="rounded-lg overflow-hidden shadow-md h-[400px] sm:h-[600px]">
            <MapComponent
              services={sortedServices}
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
              zoom={currentLocation ? 12 : 8}
              showUserLocation={!!currentLocation}
              onServiceClick={(service) => window.location.href = `/services/${service._id}`}
            />
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            <p className="text-gray-600 mb-6">
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
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
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
    <div className="bg-white rounded-[2.5rem] overflow-hidden hover-lift transition-all duration-500 border border-[var(--border-color)] group flex flex-col h-full hover:shadow-2xl">
      <div className="p-10 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[var(--text-color)] mb-3 leading-tight group-hover:text-[var(--primary-color)] transition-colors">{service.name}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20">
                {service.type}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[var(--secondary-color)]/10 text-[var(--secondary-color)] border border-[var(--secondary-color)]/20">
                {service.category}
              </span>
              {service.isOpenNow && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                  Active
                </span>
              )}
            </div>
          </div>
          {service.ratings?.average > 0 && (
            <div className="flex items-center gap-1.5 bg-[var(--surface-color)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl shadow-sm">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-sm font-bold text-[var(--text-color)]">
                {service.ratings.average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--background-color)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0 group-hover:border-[var(--primary-color)]/50 transition-colors">
              <MapPin className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary-color)]" />
            </div>
            <a 
              href={service.location?.coordinates ? `https://www.google.com/maps/search/?api=1&query=${service.location.coordinates[1]},${service.location.coordinates[0]}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location?.address?.fullAddress || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-color)] font-medium transition-colors"
            >
              {service.location?.address?.fullAddress || 'Address not available'}
            </a>
          </div>

          {distance !== null && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--background-color)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0 group-hover:border-[var(--primary-color)]/50 transition-colors">
                <Navigation className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary-color)]" />
              </div>
              <p className="text-sm text-[var(--text-color)] font-bold">
                {distance.toFixed(1)} km <span className="text-[var(--text-muted)] font-medium">away</span>
              </p>
            </div>
          )}

          {service.contact?.phone && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--background-color)] flex items-center justify-center border border-[var(--border-color)] flex-shrink-0 group-hover:border-[var(--primary-color)]/50 transition-colors">
                <Phone className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary-color)]" />
              </div>
              <a 
                href={`tel:${service.contact.phone}`} 
                className="text-sm text-[var(--text-color)] font-bold hover:text-[var(--primary-color)] transition-colors"
              >
                {service.contact.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="p-10 pt-0 flex gap-4">
        <Link
          to={`/services/${service._id}`}
          className="flex-1 btn btn-outline py-4 text-[10px] font-black tracking-[0.2em] uppercase"
        >
          View Intelligence
        </Link>
        {service.contact?.phone && (
          <a
            href={`tel:${service.contact.phone}`}
            className="w-14 h-14 bg-[var(--primary-color)] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;