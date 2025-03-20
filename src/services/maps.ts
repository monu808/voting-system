import { mapsConfig } from '../config/google-cloud';

// Add module declaration to suppress TypeScript errors
declare module '@googlemaps/google-maps-services-js';

class MapsService {
  private client: any;
  private isInitialized: boolean = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Dynamic import with more resilient approach
      const mapsModule = await import('@googlemaps/google-maps-services-js');
      const Client = mapsModule.Client;
      
      // Initialize Maps client
      this.client = new Client({});
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Maps API:', error);
      throw error;
    }
  }

  async verifyPollingStationLocation(
    stationAddress: string,
    voterLocation: {
      latitude: number;
      longitude: number;
    }
  ): Promise<{
    isValid: boolean;
    distance: number;
    estimatedTime: number;
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Geocode the polling station address
      const geocodeResult = await this.client.geocode({
        params: {
          address: stationAddress,
          key: mapsConfig.apiKey
        }
      });

      if (!geocodeResult.data.results.length) {
        return {
          isValid: false,
          distance: 0,
          estimatedTime: 0,
          confidence: 0
        };
      }

      const stationLocation = geocodeResult.data.results[0].geometry.location;

      // Calculate distance and time
      const distanceResult = await this.client.distancematrix({
        params: {
          origins: [`${voterLocation.latitude},${voterLocation.longitude}`],
          destinations: [`${stationLocation.lat},${stationLocation.lng}`],
          mode: 'driving',
          key: mapsConfig.apiKey
        }
      });

      const element = distanceResult.data.rows[0].elements[0];
      const distance = element.distance.value; // in meters
      const duration = element.duration.value; // in seconds

      // Determine if location is valid based on distance
      const maxAllowedDistance = 5000; // 5km in meters
      const isValid = distance <= maxAllowedDistance;

      // Calculate confidence based on distance
      const confidence = Math.max(0, 1 - (distance / maxAllowedDistance));

      return {
        isValid,
        distance,
        estimatedTime: duration,
        confidence
      };
    } catch (error) {
      console.error('Polling station location verification failed:', error);
      throw error;
    }
  }

  async findNearestPollingStations(
    location: {
      latitude: number;
      longitude: number;
    },
    radius: number = 5000 // 5km in meters
  ): Promise<{
    stations: Array<{
      name: string;
      address: string;
      distance: number;
      estimatedTime: number;
      isOpen: boolean;
    }>;
    confidence: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Search for polling stations in the area
      const placesResult = await this.client.placesNearby({
        params: {
          location: `${location.latitude},${location.longitude}`,
          radius,
          type: 'point_of_interest',
          keyword: 'polling station',
          key: mapsConfig.apiKey
        }
      });

      const stations = await Promise.all(
        placesResult.data.results.map(async (place: any) => {
          // Get detailed information for each place
          const detailsResult = await this.client.placeDetails({
            params: {
              place_id: place.place_id,
              fields: ['name', 'formatted_address', 'opening_hours'],
              key: mapsConfig.apiKey
            }
          });

          // Calculate distance and time
          const distanceResult = await this.client.distancematrix({
            params: {
              origins: [`${location.latitude},${location.longitude}`],
              destinations: [`${place.geometry.location.lat},${place.geometry.location.lng}`],
              mode: 'driving',
              key: mapsConfig.apiKey
            }
          });

          const element = distanceResult.data.rows[0].elements[0];

          return {
            name: detailsResult.data.result.name,
            address: detailsResult.data.result.formatted_address,
            distance: element.distance.value,
            estimatedTime: element.duration.value,
            isOpen: detailsResult.data.result.opening_hours?.isOpen() || false
          };
        })
      );

      // Sort stations by distance
      stations.sort((a, b) => a.distance - b.distance);

      // Calculate overall confidence based on number of stations found
      const confidence = Math.min(1, stations.length / 5); // Assuming 5 stations is ideal

      return {
        stations,
        confidence
      };
    } catch (error) {
      console.error('Finding nearest polling stations failed:', error);
      throw error;
    }
  }

  async validateVoterLocation(
    voterLocation: {
      latitude: number;
      longitude: number;
    },
    voterAddress: string
  ): Promise<{
    isValid: boolean;
    confidence: number;
    discrepancy: number;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Geocode the voter's address
      const geocodeResult = await this.client.geocode({
        params: {
          address: voterAddress,
          key: mapsConfig.apiKey
        }
      });

      if (!geocodeResult.data.results.length) {
        return {
          isValid: false,
          confidence: 0,
          discrepancy: 0
        };
      }

      const addressLocation = geocodeResult.data.results[0].geometry.location;

      // Calculate distance between provided location and geocoded address
      const distanceResult = await this.client.distancematrix({
        params: {
          origins: [`${voterLocation.latitude},${voterLocation.longitude}`],
          destinations: [`${addressLocation.lat},${addressLocation.lng}`],
          mode: 'driving',
          key: mapsConfig.apiKey
        }
      });

      const element = distanceResult.data.rows[0].elements[0];
      const discrepancy = element.distance.value; // in meters

      // Determine if location is valid based on discrepancy
      const maxAllowedDiscrepancy = 1000; // 1km in meters
      const isValid = discrepancy <= maxAllowedDiscrepancy;

      // Calculate confidence based on discrepancy
      const confidence = Math.max(0, 1 - (discrepancy / maxAllowedDiscrepancy));

      return {
        isValid,
        confidence,
        discrepancy
      };
    } catch (error) {
      console.error('Voter location validation failed:', error);
      throw error;
    }
  }
}

export const mapsService = new MapsService(); 