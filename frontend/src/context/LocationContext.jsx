import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_SAVED_ADDRESSES, DEFAULT_CITY, DEFAULT_STATE } from '../constants/defaultLocations';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('restohub_user_location');
      return saved ? JSON.parse(saved) : { area: 'Baner', city: DEFAULT_CITY, state: DEFAULT_STATE, fullText: `Baner, ${DEFAULT_CITY}, ${DEFAULT_STATE}` };
    } catch {
      return { area: 'Baner', city: DEFAULT_CITY, state: DEFAULT_STATE, fullText: `Baner, ${DEFAULT_CITY}, ${DEFAULT_STATE}` };
    }
  });

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('restohub_saved_addresses');
      return saved ? JSON.parse(saved) : DEMO_SAVED_ADDRESSES;
    } catch {
      return DEMO_SAVED_ADDRESSES;
    }
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [geoPermissionStatus, setGeoPermissionStatus] = useState('prompt');

  // Request Geolocation on initial load if permitted
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoPermissionStatus('granted');
          // For demo purposes in Pune region
          const detectedLoc = {
            area: 'Sus',
            city: DEFAULT_CITY,
            state: DEFAULT_STATE,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            fullText: `Sus, ${DEFAULT_CITY}, ${DEFAULT_STATE}`,
          };
          setCurrentLocation(detectedLoc);
          localStorage.setItem('restohub_user_location', JSON.stringify(detectedLoc));
        },
        (error) => {
          console.warn('Geolocation access denied or unavailable:', error.message);
          setGeoPermissionStatus('denied');
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const updateLocation = (locData) => {
    const fullText = `${locData.area ? locData.area + ', ' : ''}${locData.city || DEFAULT_CITY}, ${locData.state || DEFAULT_STATE}`;
    const newLoc = { ...locData, fullText };
    setCurrentLocation(newLoc);
    localStorage.setItem('restohub_user_location', JSON.stringify(newLoc));
  };

  const addSavedAddress = (newAddr) => {
    const formatted = {
      id: Date.now(),
      type: newAddr.type || 'HOME',
      label: newAddr.label || newAddr.type || 'Other',
      flatNo: newAddr.flatNo,
      apartment: newAddr.apartment,
      landmark: newAddr.landmark,
      area: newAddr.area || 'Baner',
      city: newAddr.city || DEFAULT_CITY,
      state: newAddr.state || DEFAULT_STATE,
      pincode: newAddr.pincode || '411045',
      isDefault: savedAddresses.length === 0,
    };
    const updated = [...savedAddresses, formatted];
    setSavedAddresses(updated);
    setSelectedAddress(formatted);
    localStorage.setItem('restohub_saved_addresses', JSON.stringify(updated));
    updateLocation({ area: formatted.area, city: formatted.city, state: formatted.state });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        savedAddresses,
        selectedAddress,
        setSelectedAddress,
        isLocationModalOpen,
        setIsLocationModalOpen,
        updateLocation,
        addSavedAddress,
        geoPermissionStatus,
      }}
    >
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
