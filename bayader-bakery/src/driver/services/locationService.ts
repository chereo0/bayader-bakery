import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface DriverLocation {
  driver: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  lastUpdated: string;
}

class LocationService {
  private watchId: number | null = null;
  private isTracking: boolean = false;

  /**
   * Start tracking driver location
   */
  startTracking(onUpdate?: (position: GeolocationPosition) => void): void {
    if (this.isTracking) {
      console.log('[LOCATION] Already tracking');
      return;
    }

    if (!navigator.geolocation) {
      console.error('[LOCATION] Geolocation not supported');
      throw new Error('Geolocation is not supported by your browser');
    }

    console.log('[LOCATION] Starting location tracking...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('[LOCATION] Position updated:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

        // Send to backend
        this.updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy
        }).catch(err => {
          console.error('[LOCATION] Failed to send location to backend:', err);
        });

        // Call custom callback
        if (onUpdate) {
          onUpdate(position);
        }
      },
      (error) => {
        console.error('[LOCATION] Error getting position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    this.isTracking = true;
  }

  /**
   * Stop tracking driver location
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('[LOCATION] Stopped tracking');

      // Deactivate on backend
      this.deactivateLocation().catch(err => {
        console.error('[LOCATION] Failed to deactivate on backend:', err);
      });
    }
  }

  /**
   * Update driver location on backend
   */
  async updateLocation(location: LocationUpdate): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_BASE_URL}/driver/location`,
      location,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update location');
    }
  }

  /**
   * Get driver location (for admin/staff)
   */
  async getDriverLocation(driverId: string): Promise<DriverLocation> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${API_BASE_URL}/driver/location/${driverId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch driver location');
    }

    return response.data.data;
  }

  /**
   * Deactivate location tracking
   */
  async deactivateLocation(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.delete(
      `${API_BASE_URL}/driver/location`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export default new LocationService();
