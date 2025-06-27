import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const LocationContext = createContext();

// Cache for addresses
const addressCache = new Map();
const getCacheKey = (lat, lng) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const { user, updateLocation } = useAuth();

  // Rate limiting for Nominatim requests
  let lastRequestTime = 0;

  // Check location permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        
        result.onchange = () => {
          setLocationPermission(result.state);
        };
      });
    }
  }, []);

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoords = useCallback(async (lat, lng) => {
    const cacheKey = getCacheKey(lat, lng);
    
    // Return cached address if available
    if (addressCache.has(cacheKey)) {
      return addressCache.get(cacheKey);
    }

    // Rate limiting - max 1 request per second
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastRequestTime)));
    }
    lastRequestTime = Date.now();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Nominatim request failed');
      
      const data = await response.json();
      
      // Format the address nicely
      let formattedAddress = 'Nearby location';
      if (data.address) {
        const { road, suburb, city, state, country } = data.address;
        formattedAddress = [road, suburb, city, state, country]
          .filter(Boolean)
          .join(', ');
      } else if (data.display_name) {
        formattedAddress = data.display_name;
      }

      // Cache the result
      addressCache.set(cacheKey, formattedAddress);
      return formattedAddress;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates if geocoding fails
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (options = {}) => {
    setIsLoadingLocation(true);
    setLocationError(null);

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions);
      });

      const { latitude, longitude, accuracy } = position.coords;
      const location = {
        lat: latitude,
        lng: longitude,
        accuracy,
        timestamp: position.timestamp
      };

      setCurrentLocation(location);

      // Get address from coordinates
      const locationAddress = await getAddressFromCoords(latitude, longitude);
      setAddress(locationAddress);

      // Update user location in backend if authenticated
      if (user) {
        try {
          await updateLocation({ lat: latitude, lng: longitude });
        } catch (error) {
          console.error('Failed to update location in backend:', error);
        }
      }

      return { ...location, address: locationAddress };
    } catch (error) {
      let errorMessage = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access.';
          setLocationPermission('denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting location.';
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoadingLocation(false);
    }
  }, [user, updateLocation, getAddressFromCoords]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      await getCurrentLocation();
      setLocationPermission('granted');
      toast.success('Location access granted!');
    } catch (error) {
      setLocationPermission('denied');
      toast.error('Location access denied');
    }
  }, [getCurrentLocation]);

  // Watch location changes
  const startLocationWatch = useCallback((callback) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location = {
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: position.timestamp
        };

        setCurrentLocation(location);
        
        // Get address for new location
        const locationAddress = await getAddressFromCoords(latitude, longitude);
        setAddress(locationAddress);
        
        if (callback) {
          callback(location);
        }

        // Update user location in backend if authenticated
        if (user) {
          updateLocation({ lat: latitude, lng: longitude }).catch(console.error);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        toast.error('Failed to track location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );

    return watchId;
  }, [user, updateLocation, getAddressFromCoords]);

  // Stop location watching
  const stopLocationWatch = useCallback((watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);

  const value = {
    currentLocation,
    address,
    locationPermission,
    isLoadingLocation,
    locationError,
    getCurrentLocation,
    requestLocationPermission,
    startLocationWatch,
    stopLocationWatch,
    getAddressFromCoords,
    calculateDistance
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;