import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

const PollingStationMap: React.FC = () => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Polling Station Locations
      </Typography>
      <Alert severity="info" sx={{ my: 2 }}>
        Please install the required Google Maps package with: npm install @react-google-maps/api
      </Alert>
      <Box 
        height={400} 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        flexDirection="column"
        sx={{ 
          border: '1px dashed grey',
          borderRadius: 1,
          backgroundColor: '#f5f5f5'
        }}
      >
        <MapIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Map will be displayed here after installing the required package
        </Typography>
      </Box>
    </Paper>
  );
};

export default PollingStationMap; 