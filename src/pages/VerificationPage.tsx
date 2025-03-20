import React, { useState, useRef } from 'react';
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
  const [voterDetails, setVoterDetails] = useState({
    fullName: '',
    voterID: '',
    address: '',
    pollingStation: '',
    dob: ''
  });
  
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
      
      // In a real implementation, this would call Firebase Cloud Functions
      // to process the ID and facial image using Google Cloud Vision API 
      // and other Google services for verification
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful verification data
      setVoterDetails({
        fullName: currentUser?.displayName || 'John Doe',
        voterID: 'VT' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        address: '123 Main St, Anytown, USA',
        pollingStation: 'Central Community Center',
        dob: '1985-05-15'
      });
      
      // Generate a unique verification ID
      setVerificationId(`VF-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`);
      
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
                      <MenuItem value="passport">Passport</MenuItem>
                      <MenuItem value="driver_license">Driver's License</MenuItem>
                      <MenuItem value="national_id">National ID Card</MenuItem>
                      <MenuItem value="voter_id">Voter ID Card</MenuItem>
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
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Your document will be securely processed using Google Cloud Vision API to extract information. 
                All data is encrypted and handled according to data protection regulations.
              </Typography>
            </Box>
          )}
          
          {/* Step 2: Facial Photo */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 2: Capture Photo for Verification
              </Typography>
              <Typography variant="body1" paragraph>
                Please take a clear photo of your face for identity verification.
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  {!facialImage ? (
                    <Box sx={{ position: 'relative' }}>
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PhotoCameraIcon />}
                        onClick={captureFacialImage}
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Capture Photo
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={facialImage}
                        alt="Facial Image"
                        sx={{
                          width: '100%',
                          borderRadius: '8px'
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={resetFacialImage}
                        sx={{ mt: 2 }}
                        fullWidth
                      >
                        Retake Photo
                      </Button>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h6" gutterBottom>
                      Tips for a Good Photo
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                      <li>Ensure your face is well-lit</li>
                      <li>Look directly at the camera</li>
                      <li>Remove sunglasses or other accessories that cover your face</li>
                      <li>Maintain a neutral expression</li>
                      <li>Make sure your entire face is visible in the frame</li>
                    </Typography>
                  </Paper>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Your facial image will be compared with your ID document using Google's advanced facial recognition technology.
                    This comparison is done securely and is not stored beyond the verification process.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 3: Verify Information */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Confirm Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                Please review and confirm the information extracted from your ID.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    defaultValue={currentUser?.displayName || ''}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    defaultValue="1990-01-01"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    defaultValue=""
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ID Number"
                    defaultValue=""
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="polling-station-label">Polling Station</InputLabel>
                    <Select
                      labelId="polling-station-label"
                      id="polling-station"
                      label="Polling Station"
                      defaultValue=""
                    >
                      <MenuItem value="station1">Central Community Center</MenuItem>
                      <MenuItem value="station2">North District School</MenuItem>
                      <MenuItem value="station3">South Library</MenuItem>
                      <MenuItem value="station4">East City Hall</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                By proceeding, you confirm that the information above is correct. Providing false information may 
                result in disqualification from the voting process.
              </Typography>
            </Box>
          )}
          
          {/* Step 4: Confirmation */}
          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center' }}>
              {loading ? (
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <CircularProgress size={60} />
                  <Typography variant="h6">
                    Processing your verification...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a few moments while we securely verify your identity.
                  </Typography>
                </Box>
              ) : (
                <>
                  <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Verification Successful!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Congratulations! Your identity has been successfully verified.
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
                        <Typography variant="body2">{voterDetails.pollingStation}</Typography>
                      </Grid>
                      
                      <Grid item xs={5} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                        <Typography variant="body2">Verification ID:</Typography>
                      </Grid>
                      <Grid item xs={7} sx={{ textAlign: 'left' }}>
                        <Typography variant="body2">{verificationId}</Typography>
                      </Grid>
                    </Grid>
                    
                    <Box mt={3} display="flex" justifyContent="center">
                      {verificationId && (
                        <QRCode value={verificationId} size={150} />
                      )}
                    </Box>
                  </Paper>
                  
                  <Typography variant="body2" color="text.secondary">
                    Please take a screenshot or save this QR code. Present it at your polling station for 
                    fast-track verification on election day.
                  </Typography>
                  
                  <Box mt={4}>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/')}
                      sx={{ mx: 1 }}
                    >
                      Return Home
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}
          
          {/* Navigation buttons */}
          {activeStep < 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                {activeStep === steps.length - 2 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box my={4}>
        <Typography variant="body2" color="text.secondary" align="center">
          Your security is our priority. All data is encrypted and processed using Google Cloud's secure infrastructure.
          <br />
          This verification system uses advanced AI technology from Google's Gemini API for identity validation.
        </Typography>
      </Box>
    </Container>
  );
};

export default VerificationPage; 