import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PhotoCamera as PhotoCameraIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import QRCode from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import voterService, { VoterInfo, VerificationResult } from '../services/voterService';
import locationService from '../services/locationService';
import PollingStationMap from '../components/PollingStationMap';

// Custom styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const VerificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  
  // Verification steps
  const steps = ['Upload ID', 'Capture Photo', 'Verify Information', 'Confirmation'];
  
  // Component state
  const [activeStep, setActiveStep] = useState(0);
  const [idType, setIdType] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [facialImage, setFacialImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [voterDetails, setVoterDetails] = useState<Partial<VoterInfo>>({
    fullName: '',
    voterID: '',
    address: '',
    pollingStationId: '',
    dob: ''
  });
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [pollingStations, setPollingStations] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPollingStation, setSelectedPollingStation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>();
  
  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesList = await locationService.getAllStates();
        setStates(statesList);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };
    
    fetchStates();
  }, []);
  
  // Fetch districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    
    const fetchDistricts = async () => {
      try {
        const districtsList = await locationService.getDistrictsByState(selectedState);
        setDistricts(districtsList);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    
    fetchDistricts();
  }, [selectedState]);
  
  // Fetch polling stations when district changes
  useEffect(() => {
    if (!selectedState || !selectedDistrict) {
      setPollingStations([]);
      return;
    }
    
    const fetchPollingStations = async () => {
      try {
        const stations = await voterService.getPollingStationsByStateAndDistrict(
          selectedState, selectedDistrict
        );
        setPollingStations(stations);
      } catch (error) {
        console.error('Error fetching polling stations:', error);
      }
    };
    
    fetchPollingStations();
  }, [selectedState, selectedDistrict]);
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Watch for changes to polling station ID
  useEffect(() => {
    if (voterDetails.pollingStationId) {
      const station = pollingStations.find(s => s.id === voterDetails.pollingStationId);
      setSelectedPollingStation(station || null);
    } else {
      setSelectedPollingStation(null);
    }
  }, [voterDetails.pollingStationId, pollingStations]);
  
  // Handle ID upload
  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setIdFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setIdPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Capture webcam image
  const captureFacialImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFacialImage(imageSrc);
    }
  };
  
  // Reset webcam capture
  const resetFacialImage = () => {
    setFacialImage(null);
  };
  
  // Handle verification process
  const processVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!voterDetails.voterID) {
        throw new Error('Voter ID is required');
      }
      
      // Verify voter using biometric data
      const result = await voterService.verifyVoterByBiometric(
        voterDetails.voterID,
        facialImage || '',
        idPreview || undefined
      );
      
      setVerificationResult(result);
      
      if (result.success && result.voterInfo) {
        setVoterDetails(result.voterInfo);
        setVerificationId(result.verificationId || null);
      } else {
        setError(result.message);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Verification failed. Please try again.');
      console.error('Verification error:', error);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    // If at the verification step, process the verification
    if (activeStep === 2) {
      processVerification();
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Determine if next button should be disabled
  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !idFile || !idType;
      case 1:
        return !facialImage;
      case 2:
        return loading;
      default:
        return false;
    }
  };
  
  // Update the polling station selection in the form
  const handleStateChange = (e: SelectChangeEvent<string>) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedDistrict('');
    setVoterDetails({ ...voterDetails, state, district: '', pollingStationId: '' });
  };
  
  const handleDistrictChange = (e: SelectChangeEvent<string>) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setVoterDetails({ ...voterDetails, district, pollingStationId: '' });
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Voter Identity Verification
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ py: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 4 }}>
          {/* Step 1: Upload ID */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 1: ID Document Upload
              </Typography>
              <Typography variant="body1" paragraph>
                Please upload a clear scan or photo of your government-issued ID.
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="id-type-label">ID Type</InputLabel>
                    <Select
                      labelId="id-type-label"
                      id="id-type"
                      value={idType}
                      label="ID Type"
                      onChange={(e) => setIdType(e.target.value as string)}
                    >
                      <MenuItem value="aadhaar">Aadhaar Card</MenuItem>
                      <MenuItem value="pan">PAN Card</MenuItem>
                      <MenuItem value="voter_id">Voter ID Card</MenuItem>
                      <MenuItem value="drivers_license">Driver's License</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload ID Document
                    <VisuallyHiddenInput type="file" onChange={handleIdUpload} accept="image/*" />
                  </Button>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {idPreview ? (
                    <Box
                      component="img"
                      src={idPreview}
                      alt="ID Preview"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'contain',
                        border: '1px solid #ccc',
                        borderRadius: 1
                      }}
                    />
                  ) : (
                    <Paper
                      sx={{
                        width: '100%',
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        ID preview will appear here
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 2: Capture Photo */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 2: Capture Photo
              </Typography>
              <Typography variant="body1" paragraph>
                Please position your face in the center of the frame and click "Capture Photo".
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "user"
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {facialImage ? (
                    <Box>
                      <Box
                        component="img"
                        src={facialImage}
                        alt="Captured Photo"
                        sx={{
                          width: '100%',
                          height: 300,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={resetFacialImage}
                        fullWidth
                      >
                        Retake Photo
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<PhotoCameraIcon />}
                      onClick={captureFacialImage}
                      fullWidth
                    >
                      Capture Photo
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 3: Verify Information */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Verify Information
              </Typography>
              <Typography variant="body1" paragraph>
                Please enter your Voter ID and confirm your details.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Voter ID"
                    fullWidth
                    value={voterDetails.voterID}
                    onChange={(e) => setVoterDetails({ ...voterDetails, voterID: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={voterDetails.fullName}
                    onChange={(e) => setVoterDetails({ ...voterDetails, fullName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="state-label">State</InputLabel>
                    <Select
                      labelId="state-label"
                      id="state"
                      value={selectedState}
                      label="State"
                      onChange={handleStateChange}
                    >
                      {states.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" disabled={!selectedState}>
                    <InputLabel id="district-label">District</InputLabel>
                    <Select
                      labelId="district-label"
                      id="district"
                      value={selectedDistrict}
                      label="District"
                      onChange={handleDistrictChange}
                    >
                      {districts.map((district) => (
                        <MenuItem key={district} value={district}>
                          {district}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" disabled={!selectedDistrict}>
                    <InputLabel id="polling-station-label">Polling Station</InputLabel>
                    <Select
                      labelId="polling-station-label"
                      id="polling-station"
                      value={voterDetails.pollingStationId || ''}
                      label="Polling Station"
                      onChange={(e) => setVoterDetails({ ...voterDetails, pollingStationId: e.target.value as string })}
                    >
                      {pollingStations.map((station) => (
                        <MenuItem key={station.id} value={station.id}>
                          {station.name} - {station.boothNumber}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 4: Confirmation */}
          {activeStep === 3 && verificationResult?.success && (
            <Box>
              <Box display="flex" justifyContent="center" mb={4}>
                <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
              </Box>
              
              <Typography variant="h6" gutterBottom align="center">
                Verification Successful!
              </Typography>
              
              <Paper elevation={2} sx={{ p: 3, maxWidth: 400, mx: 'auto', my: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Voter Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={5} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <Typography variant="body2">Name:</Typography>
                  </Grid>
                  <Grid item xs={7} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">{voterDetails.fullName}</Typography>
                  </Grid>
                  
                  <Grid item xs={5} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <Typography variant="body2">Voter ID:</Typography>
                  </Grid>
                  <Grid item xs={7} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">{voterDetails.voterID}</Typography>
                  </Grid>
                  
                  <Grid item xs={5} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <Typography variant="body2">Polling Station:</Typography>
                  </Grid>
                  <Grid item xs={7} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">
                      {voterService.getPollingStation(voterDetails.pollingStationId || '')?.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={5} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                    <Typography variant="body2">Verification ID:</Typography>
                  </Grid>
                  <Grid item xs={7} sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">{verificationId}</Typography>
                  </Grid>
                </Grid>
                
                <Box mt={3} textAlign="center">
                  <QRCode
                    value={verificationId || ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Show this QR code at the polling booth
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isNextDisabled() || activeStep === steps.length - 1}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
      
      <Box mb={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Powered by Google Cloud Technologies
          <br />
          Secure, fast, and reliable voter verification
        </Typography>
      </Box>
      
      {selectedPollingStation && (
        <Box mt={3}>
          <Typography variant="h6">Polling Station Location</Typography>
          <PollingStationMap 
            stationAddress={`${selectedPollingStation.address}, ${selectedPollingStation.district}, ${selectedPollingStation.state}`}
            stationName={selectedPollingStation.name}
            userLocation={userLocation}
          />
        </Box>
      )}
    </Container>
  );
};

export default VerificationPage; 