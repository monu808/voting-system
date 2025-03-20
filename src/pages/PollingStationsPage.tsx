import React from 'react';
import { Box, Typography } from '@mui/material';
import PollingStationMap from '../components/PollingStationMap';
import voterService from '../services/voterService';

const PollingStationsPage: React.FC = () => {
  const stations = voterService.getAllPollingStations();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Polling Stations Map
      </Typography>
      <PollingStationMap 
        stationAddress="New Delhi, India"
        stationName="All Polling Stations"
      />
    </Box>
  );
};

export default PollingStationsPage; 