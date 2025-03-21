import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, Alert, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import voterService from '../services/voterService';
import { PollingStation } from '../types/pollingStation';

// Fix for Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface PollingStationMapProps {
  stationName?: string;
  stationAddress?: string;
  showAllStations?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const PollingStationMap: React.FC<PollingStationMapProps> = ({
  stationName = '',
  stationAddress = '',
  showAllStations = false,
  userLocation
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [stations, setStations] = useState<PollingStation[]>([]);
  const [centerPosition, setCenterPosition] = useState<[number, number]>([28.6139, 77.2090]); // Default: New Delhi
  
  useEffect(() => {
    if (showAllStations) {
      try {
        const allStations = voterService.getAllPollingStations();
        
        if (allStations.length === 0) {
          setMapError('No polling stations data available. Please try again later.');
          return;
        }
        
        setStations(allStations);
        
        // Find a station with valid location data for centering the map
        const stationWithLocation = allStations.find(station => 
          station.location && 
          station.location.latitude && 
          station.location.longitude &&
          !isNaN(station.location.latitude) && 
          !isNaN(station.location.longitude)
        );
        
        if (stationWithLocation && stationWithLocation.location) {
          setCenterPosition([
            stationWithLocation.location.latitude,
            stationWithLocation.location.longitude
          ]);
          setMapLoaded(true);
        } else {
          setMapError('Location data not available for any polling station. Using default location.');
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading polling stations:', error);
        setMapError('Failed to load polling stations. Please try again later.');
      }
    } else if (stationName && stationAddress) {
      // Try to geocode the address to get coordinates
      geocodeAddress(stationAddress);
    }
  }, [showAllStations, stationName, stationAddress]);
  
  const geocodeAddress = async (address: string) => {
    try {
      // In a real application, you would use a geocoding service like Google Maps Geocoding API
      // For now, we'll just use a fixed location for demonstration
      setCenterPosition([28.6139, 77.2090]); // Default: New Delhi
      setMapLoaded(true);
    } catch (error) {
      console.error('Geocoding error:', error);
      setMapError('Failed to load the map location. Please check the address.');
    }
  };
  
  // Only load map if we have loaded the Google Maps API
  return (
    <Paper elevation={2} sx={{ p: 0, height: 500, width: '100%', overflow: 'hidden' }}>
      {mapError ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {mapError}
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      ) : (
        <Box sx={{ height: '100%', width: '100%' }}>
          <MapContainer 
            center={centerPosition} 
            zoom={showAllStations ? 10 : 13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {showAllStations ? (
              // Show all polling stations
              stations.map(station => {
                // Skip stations without location data
                if (!station.location || !station.location.latitude || !station.location.longitude) {
                  return null;
                }
                
                return (
                  <Marker 
                    key={station.id}
                    position={[station.location.latitude, station.location.longitude]}
                  >
                    <Popup>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {station.name}
                      </Typography>
                      <Typography variant="body2">
                        Booth: {station.boothNumber}
                      </Typography>
                      <Typography variant="body2">
                        {station.address}
                      </Typography>
                      <Typography variant="body2">
                        Status: <strong>{station.status}</strong>
                      </Typography>
                      <Typography variant="body2">
                        {station.verificationStats ? 
                          `Verifications: ${station.verificationStats.successful} successful / ${station.verificationStats.failed} failed` :
                          `Total voters: ${station.totalVoters || 0}`
                        }
                      </Typography>
                    </Popup>
                  </Marker>
                );
              })
            ) : (
              // Show just one station
              <Marker position={centerPosition}>
                <Popup>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {stationName}
                  </Typography>
                  <Typography variant="body2">
                    {stationAddress}
                  </Typography>
                </Popup>
              </Marker>
            )}
            
            {userLocation && (
              <Marker 
                position={[userLocation.latitude, userLocation.longitude]}
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })}
              >
                <Popup>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Your Location
                  </Typography>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </Box>
      )}
    </Paper>
  );
};

export default PollingStationMap; 