import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  TextField,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCodeScanner as QrCodeScannerIcon,
  LocationOn as LocationOnIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Mock polling station data
const mockStationData = {
  'ps1': {
    id: 'ps1',
    name: 'Central Community Center',
    address: '123 Main Street, Cityville',
    totalVerifications: 3245,
    successfulVerifications: 3102,
    failedVerifications: 143,
    verificationRate: 95.6,
    status: 'operational',
    staff: [
      { id: 'staff1', name: 'Emma Wilson', role: 'Station Manager', status: 'active' },
      { id: 'staff2', name: 'Michael Brown', role: 'Verification Officer', status: 'active' },
      { id: 'staff3', name: 'Sophia Lee', role: 'Verification Officer', status: 'break' }
    ]
  },
  'ps2': {
    id: 'ps2',
    name: 'North District School',
    address: '456 Oak Avenue, Townsburg',
    totalVerifications: 2890,
    successfulVerifications: 2712,
    failedVerifications: 178,
    verificationRate: 93.8,
    status: 'operational',
    staff: [
      { id: 'staff4', name: 'James Johnson', role: 'Station Manager', status: 'active' },
      { id: 'staff5', name: 'Emily Davis', role: 'Verification Officer', status: 'active' },
      { id: 'staff6', name: 'Daniel Martinez', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps3': {
    id: 'ps3',
    name: 'South Library',
    address: '789 Pine Boulevard, Villageton',
    totalVerifications: 3125,
    successfulVerifications: 2987,
    failedVerifications: 138,
    verificationRate: 95.6,
    status: 'operational',
    staff: [
      { id: 'staff7', name: 'Olivia Taylor', role: 'Station Manager', status: 'active' },
      { id: 'staff8', name: 'William Anderson', role: 'Verification Officer', status: 'active' },
      { id: 'staff9', name: 'Ava Thomas', role: 'Verification Officer', status: 'active' }
    ]
  },
  'ps4': {
    id: 'ps4',
    name: 'East City Hall',
    address: '101 Elm Street, Metropolis',
    totalVerifications: 3323,
    successfulVerifications: 3044,
    failedVerifications: 279,
    verificationRate: 91.6,
    status: 'issue',
    staff: [
      { id: 'staff10', name: 'Noah Harris', role: 'Station Manager', status: 'active' },
      { id: 'staff11', name: 'Isabella Clark', role: 'Verification Officer', status: 'active' },
      { id: 'staff12', name: 'Mason Lewis', role: 'Verification Officer', status: 'inactive' }
    ]
  }
};

// Mock queue data
const mockQueueData = [
  { id: 'v5431', name: 'Sarah Johnson', status: 'waiting', position: 1, waitTime: '~2 min' },
  { id: 'v5432', name: 'Robert Chen', status: 'waiting', position: 2, waitTime: '~5 min' },
  { id: 'v5433', name: 'Maria Rodriguez', status: 'waiting', position: 3, waitTime: '~8 min' },
  { id: 'v5434', name: 'James Wilson', status: 'processing', position: 0, waitTime: 'Now' },
  { id: 'v5435', name: 'Emily Davis', status: 'processing', position: 0, waitTime: 'Now' }
];

// Mock recent verification data
const mockRecentVerifications = [
  { id: 'v5430', name: 'John Smith', status: 'success', timestamp: '10:45 AM', verifiedBy: 'Michael Brown' },
  { id: 'v5429', name: 'Linda Parker', status: 'failed', timestamp: '10:42 AM', verifiedBy: 'Sophia Lee', reason: 'ID document expired' },
  { id: 'v5428', name: 'David Miller', status: 'success', timestamp: '10:38 AM', verifiedBy: 'Michael Brown' },
  { id: 'v5427', name: 'Jennifer White', status: 'success', timestamp: '10:36 AM', verifiedBy: 'Sophia Lee' },
  { id: 'v5426', name: 'Mohammed Al-Farsi', status: 'success', timestamp: '10:33 AM', verifiedBy: 'Michael Brown' },
  { id: 'v5425', name: 'Patricia Thompson', status: 'failed', timestamp: '10:30 AM', verifiedBy: 'Michael Brown', reason: 'Facial verification failed' },
  { id: 'v5424', name: 'Richard Harris', status: 'success', timestamp: '10:28 AM', verifiedBy: 'Sophia Lee' },
  { id: 'v5423', name: 'Susan Martinez', status: 'success', timestamp: '10:25 AM', verifiedBy: 'Michael Brown' }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`polling-station-tabpanel-${index}`}
      aria-labelledby={`polling-station-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PollingStationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationData, setStationData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [queueData, setQueueData] = useState(mockQueueData);
  const [recentVerifications] = useState(mockRecentVerifications);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load polling station data
  useEffect(() => {
    // Simulate API call to fetch polling station data
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      if (id && mockStationData[id as keyof typeof mockStationData]) {
        setStationData(mockStationData[id as keyof typeof mockStationData]);
        setLoading(false);
      } else {
        setError('Polling station not found');
        setLoading(false);
      }
    }, 1000);
  }, [id]);
  
  // Simulate refreshing the queue
  const refreshQueue = () => {
    setQueueData([...queueData].sort(() => Math.random() - 0.5));
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !stationData) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'An error occurred while loading the polling station data.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {stationData.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Polling Station Management
        </Typography>
      </Box>
      
      {stationData.status === 'issue' && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          There are issues with this polling station that require attention. 
          The verification failure rate is above threshold.
        </Alert>
      )}
      
      {/* Station Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="flex-start" mb={2}>
              <LocationOnIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Station Information
                </Typography>
                <Typography variant="body1">
                  {stationData.address}
                </Typography>
                <Chip 
                  label={stationData.status === 'operational' ? 'Operational' : 'Issues Detected'} 
                  color={stationData.status === 'operational' ? 'success' : 'warning'} 
                  size="small" 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Station Staff
            </Typography>
            <List dense>
              {stationData.staff.map((staffMember: any) => (
                <ListItem key={staffMember.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={staffMember.name} 
                    secondary={staffMember.role} 
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={staffMember.status} 
                      color={
                        staffMember.status === 'active' ? 'success' : 
                        staffMember.status === 'break' ? 'info' : 'error'
                      }
                      size="small" 
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Verifications
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stationData.totalVerifications.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" component="div" color={stationData.verificationRate > 94 ? 'success.main' : 'warning.main'}>
                    {stationData.verificationRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Successful
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="div">
                      {stationData.successfulVerifications.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Failed
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="div">
                      {stationData.failedVerifications.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Paper sx={{ mt: 3, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1">
                Current Queue Status
              </Typography>
              <IconButton size="small" onClick={refreshQueue}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {queueData.filter((voter) => voter.status === 'waiting').length} voters waiting, 
              {queueData.filter((voter) => voter.status === 'processing').length} currently being processed
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 180, overflow: 'auto' }}>
              {queueData.map((voter) => (
                <Box 
                  key={voter.id} 
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    bgcolor: voter.status === 'processing' ? 'action.hover' : 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">
                      {voter.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {voter.status === 'processing' ? 'Now Processing' : `Position: ${voter.position}`}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      ID: {voter.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wait: {voter.waitTime}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs for different data views */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="polling station tabs">
            <Tab label="Recent Verifications" id="polling-station-tab-0" />
            <Tab label="QR Code Verification" id="polling-station-tab-1" />
            <Tab label="Manual Verification" id="polling-station-tab-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Recent Verifications
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {recentVerifications.map((verification) => (
              <Paper 
                key={verification.id} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: verification.status === 'failed' ? 'error.light' : 'background.paper',
                  borderLeft: verification.status === 'failed' ? '4px solid' : 'none',
                  borderColor: 'error.main'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">
                      {verification.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {verification.id} | Time: {verification.timestamp} | Verified by: {verification.verifiedBy}
                    </Typography>
                    {verification.reason && (
                      <Typography variant="body2" color="error">
                        Reason: {verification.reason}
                      </Typography>
                    )}
                  </Box>
                  <Chip 
                    icon={verification.status === 'success' ? <CheckCircleIcon /> : <CancelIcon />}
                    label={verification.status === 'success' ? 'Successful' : 'Failed'} 
                    color={verification.status === 'success' ? 'success' : 'error'} 
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box textAlign="center" py={4}>
            <QrCodeScannerIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              QR Code Verification
            </Typography>
            <Typography variant="body1" paragraph>
              Scan a voter's QR code to quickly verify their identity and check them in.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<QrCodeScannerIcon />}
            >
              Start Scanning
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Manual Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            If a voter doesn't have a QR code or it cannot be scanned, use manual verification.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Voter ID"
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ID Document Number"
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
              >
                Verify Voter
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                sx={{ mt: 2 }}
              >
                Clear Form
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box mb={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Powered by Google Cloud Technologies
          <br />
          Secure, fast, and reliable voter verification
        </Typography>
      </Box>
    </Container>
  );
};

export default PollingStationPage; 