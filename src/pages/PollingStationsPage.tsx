import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import PollingStationMap from '../components/PollingStationMap';
import voterService from '../services/voterService';
import { PollingStation } from '../types/pollingStation';

const PollingStationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stationCount, setStationCount] = useState(0);
  
  useEffect(() => {
    // Check if stations are loaded
    const checkStationsLoaded = () => {
      const stations = voterService.getAllPollingStations();
      if (stations.length > 0) {
        setStationCount(stations.length);
        setLoading(false);
      } else {
        // If not loaded yet, check again after a delay
        setTimeout(checkStationsLoaded, 500);
      }
    };
    
    checkStationsLoaded();
  }, []);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Polling Stations Map
      </Typography>
      <Typography variant="body1" paragraph>
        View all polling stations across the region. Click on a marker to see details.
        {!loading && ` Showing ${stationCount} active polling stations.`}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading polling station data...
          </Typography>
        </Box>
      ) : (
        <PollingStationMap 
          stationAddress="New Delhi, India"
          stationName="All Polling Stations"
          showAllStations={true}
        />
      )}
    </Box>
  );
};

export default PollingStationsPage; 