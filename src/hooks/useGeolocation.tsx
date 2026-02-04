import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '@/lib/constants';

interface Location {
  lat: number;
  lng: number;
}

interface GeolocationState {
  location: Location;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    error: null,
    loading: true,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { ...state, refresh: getLocation };
}
