import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(...registerables);

// Mock data
const mockVerificationStats = {
  total: 12583,
  successful: 11845,
  failed: 738,
  pending: 189,
};

const mockPollingStations = [
  { id: 'ps1', name: 'Central Community Center', total: 3245, successful: 3102, failed: 143 },
  { id: 'ps2', name: 'North District School', total: 2890, successful: 2712, failed: 178 },
  { id: 'ps3', name: 'South Library', total: 3125, successful: 2987, failed: 138 },
  { id: 'ps4', name: 'East City Hall', total: 3323, successful: 3044, failed: 279 },
];

const mockRecentVerifications = [
  { id: 'v123456', voterName: 'John Smith', station: 'Central Community Center', status: 'success', time: '10:15 AM' },
  { id: 'v123457', voterName: 'Maria Garcia', station: 'North District School', status: 'failed', time: '10:14 AM' },
  { id: 'v123458', voterName: 'David Chen', station: 'South Library', status: 'success', time: '10:12 AM' },
  { id: 'v123459', voterName: 'Sarah Johnson', station: 'East City Hall', status: 'success', time: '10:10 AM' },
  { id: 'v123460', voterName: 'Ali Patel', station: 'Central Community Center', status: 'success', time: '10:08 AM' },
];

const mockHourlyVerifications = [
  { hour: '7 AM', count: 345 },
  { hour: '8 AM', count: 782 },
  { hour: '9 AM', count: 1253 },
  { hour: '10 AM', count: 1845 },
  { hour: '11 AM', count: 0 }, // Future hours
  { hour: '12 PM', count: 0 },
  { hour: '1 PM', count: 0 },
  { hour: '2 PM', count: 0 },
  { hour: '3 PM', count: 0 },
  { hour: '4 PM', count: 0 },
  { hour: '5 PM', count: 0 },
  { hour: '6 PM', count: 0 },
  { hour: '7 PM', count: 0 },
];

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  
  // Data for verification status chart
  const verificationStatusData = {
    labels: ['Successful', 'Failed', 'Pending'],
    datasets: [
      {
        data: [mockVerificationStats.successful, mockVerificationStats.failed, mockVerificationStats.pending],
        backgroundColor: ['#34a853', '#ea4335', '#fbbc04'],
        hoverBackgroundColor: ['#2a8644', '#c0392b', '#daa520'],
      },
    ],
  };
  
  // Data for hourly verification chart
  const hourlyVerificationData = {
    labels: mockHourlyVerifications.map(item => item.hour),
    datasets: [
      {
        label: 'Verifications',
        data: mockHourlyVerifications.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: '#4285f4',
        tension: 0.1
      },
    ],
  };
  
  // Data for polling station chart
  const pollingStationData = {
    labels: mockPollingStations.map(station => station.name),
    datasets: [
      {
        label: 'Successful',
        data: mockPollingStations.map(station => station.successful),
        backgroundColor: '#34a853',
      },
      {
        label: 'Failed',
        data: mockPollingStations.map(station => station.failed),
        backgroundColor: '#ea4335',
      },
    ],
  };
  
  // Simulate refresh data
  const refreshData = () => {
    setLastUpdated(new Date());
  };
  
  // Filter recent verifications based on search and station filter
  const filteredVerifications = mockRecentVerifications.filter(verification => {
    const matchesSearch = searchQuery === '' || 
      verification.voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStation = selectedStation === 'all' || verification.station === selectedStation;
    
    return matchesSearch && matchesStation;
  });
  
  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Monitor voter verification status and performance metrics
        </Typography>
      </Box>
      
      {/* Alert for system status */}
      <Alert severity="success" sx={{ mb: 4 }}>
        All verification systems are functioning normally. Last updated at {lastUpdated.toLocaleTimeString()}.
        <IconButton 
          size="small" 
          onClick={refreshData} 
          sx={{ ml: 2 }}
          aria-label="refresh data"
        >
          <RefreshIcon />
        </IconButton>
      </Alert>
      
      {/* Dashboard overview cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Verifications
                  </Typography>
                  <Typography variant="h4" component="div">
                    {mockVerificationStats.total.toLocaleString()}
                  </Typography>
                </Box>
                <PeopleIcon fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Successful
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {mockVerificationStats.successful.toLocaleString()}
                  </Typography>
                </Box>
                <CheckCircleIcon fontSize="large" color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Failed
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {mockVerificationStats.failed.toLocaleString()}
                  </Typography>
                </Box>
                <ErrorIcon fontSize="large" color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Polling Stations
                  </Typography>
                  <Typography variant="h4" component="div">
                    {mockPollingStations.length}
                  </Typography>
                </Box>
                <LocationOnIcon fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Verification Volume
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Number of verifications processed each hour
            </Typography>
            <Box height={300}>
              <Line data={hourlyVerificationData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Status
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Distribution of verification outcomes
            </Typography>
            <Box height={300} display="flex" justifyContent="center">
              <Doughnut data={verificationStatusData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification by Polling Station
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Successful and failed verifications at each polling station
            </Typography>
            <Box height={300}>
              <Bar 
                data={pollingStationData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: false }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent verifications table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Recent Verifications
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="station-filter-label">Polling Station</InputLabel>
              <Select
                labelId="station-filter-label"
                id="station-filter"
                value={selectedStation}
                label="Polling Station"
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <MenuItem value="all">All Stations</MenuItem>
                {mockPollingStations.map(station => (
                  <MenuItem key={station.id} value={station.name}>{station.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              size="small"
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
            
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
            >
              Export
            </Button>
          </Stack>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Verification ID</TableCell>
                <TableCell>Voter Name</TableCell>
                <TableCell>Polling Station</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVerifications.length > 0 ? (
                filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>{verification.id}</TableCell>
                    <TableCell>{verification.voterName}</TableCell>
                    <TableCell>{verification.station}</TableCell>
                    <TableCell>
                      <Chip 
                        label={verification.status === 'success' ? 'Successful' : 'Failed'}
                        color={verification.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{verification.time}</TableCell>
                    <TableCell align="right">
                      <Button size="small">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No verifications found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      <Box mb={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          This dashboard is powered by Google Cloud Analytics and Firebase Realtime Database.
          <br />
          It provides secure, real-time monitoring of the voter verification process.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 