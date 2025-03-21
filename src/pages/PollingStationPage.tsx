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
import voterService, { VoterInfo } from '../services/voterService';
import { PollingStation } from '../types/pollingStation';
import { Timestamp } from 'firebase/firestore';

// Remove mock data declarations
// Mock polling station data, mock queue data, and mock recent verification data

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
  const [stationData, setStationData] = useState<PollingStation | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [queueData, setQueueData] = useState<VoterInfo[]>([]);
  const [recentVerifications, setRecentVerifications] = useState<VoterInfo[]>([]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load polling station data
  useEffect(() => {
    if (!id) {
      setError('Invalid polling station ID');
      setLoading(false);
      return;
    }
    
    // Get polling station by ID
    const station = voterService.getPollingStationById(id);
    
    if (station) {
      setStationData(station);
      setLoading(false);
      
      // Subscribe to real-time voter data for this station
      const unsubscribe = voterService.subscribeToVoters((allVoters) => {
        // Filter voters for this station
        const stationVoters = allVoters.filter(v => v.pollingStationId === id);
        
        // Set all voters for this station
        setVoters(stationVoters);
        
        // Set waiting voters (pending verification)
        const waiting = stationVoters.filter(v => v.verificationStatus === 'pending')
          .sort((a, b) => a.voterID.localeCompare(b.voterID))
          .slice(0, 5); // Show only first 5
        setQueueData(waiting);
        
        // Set recently verified voters
        const verified = stationVoters.filter(v => v.verificationStatus !== 'pending')
          .sort((a, b) => {
            // Sort by verification date, most recent first
            if (!a.verificationDate) return 1;
            if (!b.verificationDate) return -1;
            
            let dateA: Date;
            let dateB: Date;
            
            if (a.verificationDate instanceof Timestamp) {
              dateA = a.verificationDate.toDate();
            } else if (typeof a.verificationDate === 'object' && 'seconds' in a.verificationDate) {
              dateA = new Date((a.verificationDate as any).seconds * 1000);
            } else {
              dateA = new Date(a.verificationDate as any);
            }
            
            if (b.verificationDate instanceof Timestamp) {
              dateB = b.verificationDate.toDate();
            } else if (typeof b.verificationDate === 'object' && 'seconds' in b.verificationDate) {
              dateB = new Date((b.verificationDate as any).seconds * 1000);
            } else {
              dateB = new Date(b.verificationDate as any);
            }
            
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 8); // Show only first 8
        setRecentVerifications(verified);
      });
      
      // Clean up subscription
      return () => unsubscribe();
    } else {
      setError('Polling station not found');
      setLoading(false);
    }
  }, [id]);
  
  // Refresh function to update queue with latest data
  const refreshQueue = () => {
    // No need to manually refresh as we're using real-time data
    // Just show a notification that data is always real-time
    alert('Queue data is already real-time and will update automatically');
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
                    {stationData.verificationStats?.total.toLocaleString() || '0'}
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
                  <Typography variant="h4" component="div" color={
                    (stationData.verificationStats?.successful / stationData.verificationStats?.total * 100) > 94 
                      ? 'success.main' 
                      : 'warning.main'
                  }>
                    {stationData.verificationStats?.total > 0 
                      ? ((stationData.verificationStats.successful / stationData.verificationStats.total) * 100).toFixed(1) 
                      : '0'}%
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
                      {stationData.verificationStats?.successful.toLocaleString() || '0'}
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
                      {stationData.verificationStats?.failed.toLocaleString() || '0'}
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
              {queueData.filter((voter) => voter.verificationStatus === 'pending').length} voters waiting, 
              {queueData.filter((voter) => voter.verificationStatus === 'processing').length} currently being processed
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 180, overflow: 'auto' }}>
              {queueData.map((voter, index) => (
                <ListItem key={voter.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={voter.fullName}
                    secondary={
                      <>
                        Voter ID: {voter.voterID}
                        <br />
                        Status: {voter.verificationStatus}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={`Position ${index + 1}`}
                      color={index === 0 ? 'success' : 'primary'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
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
            {recentVerifications.map((voter) => {
              // Format date for display
              let verificationTime = 'Unknown time';
              if (voter.verificationDate) {
                let date: Date;
                if (voter.verificationDate instanceof Timestamp) {
                  date = voter.verificationDate.toDate();
                } else if (typeof voter.verificationDate === 'object' && 'seconds' in voter.verificationDate) {
                  date = new Date((voter.verificationDate as any).seconds * 1000);
                } else {
                  date = new Date(voter.verificationDate as any);
                }
                verificationTime = date.toLocaleTimeString();
              }
              
              return (
                <ListItem key={voter.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      {voter.verificationStatus === 'verified' ? 
                        <CheckCircleIcon color="success" /> : 
                        <CancelIcon color="error" />
                      }
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={voter.fullName}
                    secondary={
                      <>
                        Voter ID: {voter.voterID}
                        <br />
                        Time: {verificationTime}
                        <br />
                        Verified by: {voter.verificationOfficerId || 'System'}
                        {voter.verificationNotes && (
                          <>
                            <br />
                            Notes: {voter.verificationNotes}
                          </>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={voter.verificationStatus === 'verified' ? 'Verified' : 'Failed'}
                      color={voter.verificationStatus === 'verified' ? 'success' : 'error'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
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