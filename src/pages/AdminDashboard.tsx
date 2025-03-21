import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import voterService from '../services/voterService';
import { VoterInfo } from '../services/voterService';
import { Timestamp } from 'firebase/firestore';

// Register ChartJS components
ChartJS.register(...registerables);

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for real-time data
  const [pollingStations, setPollingStations] = useState<any[]>([]);
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [verificationStats, setVerificationStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0
  });
  
  // State for hourly verification data
  const [hourlyVerifications, setHourlyVerifications] = useState<Array<{hour: string, count: number}>>([]);
  
  // Subscribe to real-time data
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to polling stations
    const unsubscribeStations = voterService.subscribeToAllPollingStations((stations) => {
      setPollingStations(stations);
      
      // Calculate statistics
      const stats = {
        total: stations.reduce((sum, station) => sum + (station.totalVerifications || 0), 0),
        successful: stations.reduce((sum, station) => sum + (station.successfulVerifications || 0), 0),
        failed: stations.reduce((sum, station) => sum + (station.failedVerifications || 0), 0),
        pending: 0 // Will be calculated from voters
      };
      
      setVerificationStats(prevStats => ({...prevStats, ...stats}));
      setLoading(false);
      setLastUpdated(new Date());
    });
    
    // Subscribe to voters
    const unsubscribeVoters = voterService.subscribeToVoters((allVoters) => {
      setVoters(allVoters);
      
      // Calculate pending verifications
      const pendingCount = allVoters.filter(v => v.verificationStatus === 'pending').length;
      setVerificationStats(prevStats => ({...prevStats, pending: pendingCount}));
    });
    
    return () => {
      unsubscribeStations();
      unsubscribeVoters();
    };
  }, []);
  
  // Fetch hourly verification data
  useEffect(() => {
    // Function to generate hourly data based on actual voters
    const generateHourlyData = (votersList: VoterInfo[]) => {
      // Group voters by verification hour
      const hourCounts: Record<string, number> = {};
      
      // Initialize hours from 7 AM to 8 PM (standard voting hours)
      for (let i = 7; i <= 20; i++) {
        hourCounts[`${i}:00`] = 0;
      }
      
      // Count verifications by hour
      votersList.forEach(voter => {
        if (voter.verificationDate) {
          let date: Date;
          
          if (voter.verificationDate instanceof Timestamp) {
            // Firebase Timestamp format
            date = voter.verificationDate.toDate();
          } else if (typeof voter.verificationDate === 'object' && 'seconds' in voter.verificationDate) {
            // Timestamp-like object
            date = new Date((voter.verificationDate as any).seconds * 1000);
          } else {
            // Try to parse as Date or fallback to current date
            try {
              date = new Date(voter.verificationDate as any);
            } catch (e) {
              date = new Date();
            }
          }
          
          const hour = date.getHours();
          const hourKey = `${hour}:00`;
          
          if (hourCounts[hourKey] !== undefined) {
            hourCounts[hourKey]++;
          }
        }
      });
      
      // Convert to array format
      return Object.entries(hourCounts).map(([hour, count]) => ({
        hour,
        count
      })).sort((a, b) => {
        const hourA = parseInt(a.hour);
        const hourB = parseInt(b.hour);
        return hourA - hourB;
      });
    };
    
    // Set hourly data when voters are loaded
    if (voters.length > 0) {
      const hourlyData = generateHourlyData(voters);
      setHourlyVerifications(hourlyData);
    } else {
      // Fallback to empty hourly data
      const emptyData = Array.from({ length: 14 }, (_, i) => {
        const hour = (i + 7) % 24; // Start from 7 AM
        return { hour: `${hour}:00`, count: 0 };
      });
      setHourlyVerifications(emptyData);
    }
  }, [voters]);
  
  // Data for verification status chart (using real-time data)
  const verificationStatusData = {
    labels: ['Successful', 'Failed', 'Pending'],
    datasets: [
      {
        data: [verificationStats.successful, verificationStats.failed, verificationStats.pending],
        backgroundColor: ['#34a853', '#ea4335', '#fbbc04'],
        hoverBackgroundColor: ['#2a8644', '#c0392b', '#daa520'],
      },
    ],
  };
  
  // Data for hourly verification chart
  const hourlyVerificationData = {
    labels: hourlyVerifications.map(item => item.hour),
    datasets: [
      {
        label: 'Verifications',
        data: hourlyVerifications.map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: '#4285f4',
        tension: 0.1
      },
    ],
  };
  
  // Data for polling station chart
  const pollingStationData = {
    labels: pollingStations.map(station => station.name),
    datasets: [
      {
        label: 'Successful',
        data: pollingStations.map(station => station.successfulVerifications || 0),
        backgroundColor: '#34a853',
      },
      {
        label: 'Failed',
        data: pollingStations.map(station => station.failedVerifications || 0),
        backgroundColor: '#ea4335',
      },
    ],
  };
  
  // Filter voters based on search and selected station
  const filteredVoters = voters.filter(voter => {
    const matchesSearch = searchQuery === '' || 
      voter.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.voterID.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStation = selectedStation === 'all' || voter.pollingStationId === selectedStation;
    
    return matchesSearch && matchesStation;
  });
  
  const handleAnalyticsNavigation = (section: string) => {
    // Add navigation logic here
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {/* Add refresh functionality */}}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" color="text.secondary">
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Verifications</Typography>
              </Box>
              <Typography variant="h4">{verificationStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Successful</Typography>
              </Box>
              <Typography variant="h4">{verificationStats.successful}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Failed</Typography>
              </Box>
              <Typography variant="h4">{verificationStats.failed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOnIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Stations</Typography>
              </Box>
              <Typography variant="h4">
                {pollingStations.filter(s => s.status === 'operational').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={verificationStatusData} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Verifications
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={hourlyVerificationData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Polling Stations Table */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Polling Stations
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={selectedStation}
                label="Filter by Status"
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <MenuItem value="all">All Stations</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="issue">Issues</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {/* Add export functionality */}}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Station Name</TableCell>
                <TableCell>Booth Number</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Verification Rate</TableCell>
                <TableCell>Total Verifications</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pollingStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>{station.name}</TableCell>
                  <TableCell>{station.boothNumber}</TableCell>
                  <TableCell>{station.district}</TableCell>
                  <TableCell>
                    <Chip
                      label={station.status}
                      color={
                        station.status === 'operational' ? 'success' :
                        station.status === 'issue' ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>{station.verificationRate?.toFixed(1)}%</TableCell>
                  <TableCell>{station.totalVerifications}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleAnalyticsNavigation(station.id)}
                      >
                        <AnalyticsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {/* Add edit functionality */}}
                      >
                        <EditIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Voter Verification Status Table */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Voter Verification Status
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voter ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Polling Station</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verification Date</TableCell>
                  <TableCell>Method</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVoters.map((voter) => {
                  const station = pollingStations.find(s => s.id === voter.pollingStationId);
                  return (
                    <TableRow key={voter.id}>
                      <TableCell>{voter.voterID}</TableCell>
                      <TableCell>{voter.fullName}</TableCell>
                      <TableCell>{station ? station.name : 'Unknown'}</TableCell>
                      <TableCell>
                        <Chip
                          label={voter.verificationStatus}
                          color={
                            voter.verificationStatus === 'verified' ? 'success' :
                            voter.verificationStatus === 'failed' ? 'error' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {voter.verificationDate ? new Date(voter.verificationDate.seconds * 1000).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{voter.verificationMethod || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 