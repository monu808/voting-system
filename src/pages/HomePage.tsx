import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  AccessibilityNew as AccessibilityIcon,
  VerifiedUser as VerifiedUserIcon,
  CloudDone as CloudDoneIcon,
  SmartButton as SmartButtonIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  // Feature cards
  const features = [
    {
      title: 'Fast Verification',
      description: 'Reduce voter wait times by up to 80% with our multi-factor verification system.',
      icon: <SpeedIcon fontSize="large" color="primary" />
    },
    {
      title: 'Enhanced Security',
      description: 'Blockchain-based audit trails and Google Cloud security ensure tamper-proof verification.',
      icon: <SecurityIcon fontSize="large" color="primary" />
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor voting patterns and identify potential issues with advanced analytics.',
      icon: <AnalyticsIcon fontSize="large" color="primary" />
    },
    {
      title: 'Accessibility',
      description: 'Designed for all voters, including those with disabilities, with voice-guided assistance.',
      icon: <AccessibilityIcon fontSize="large" color="primary" />
    }
  ];

  // Technology cards
  const technologies = [
    {
      title: 'Firebase Authentication',
      description: 'Secure user authentication with multi-factor options.',
      icon: <VerifiedUserIcon fontSize="large" color="secondary" />
    },
    {
      title: 'Google Cloud Vision API',
      description: 'Advanced ID document verification and facial recognition.',
      icon: <CloudDoneIcon fontSize="large" color="secondary" />
    },
    {
      title: 'Gemini AI',
      description: 'AI-powered identity verification and voter assistance.',
      icon: <SmartButtonIcon fontSize="large" color="secondary" />
    },
    {
      title: 'QR Code Verification',
      description: 'Fast-track entry with secure QR code scanning.',
      icon: <QrCodeIcon fontSize="large" color="secondary" />
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?voting)',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Revolutionizing Voting Verification
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Faster, more secure, and accessible voter verification powered by Google technologies.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                {currentUser ? (
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/verification" 
                    size="large"
                  >
                    Start Verification
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/login" 
                    size="large"
                  >
                    Get Started
                  </Button>
                )}
                <Button 
                  variant="outlined" 
                  color="inherit"
                  component={RouterLink}
                  to="#features"
                  size="large"
                >
                  Learn More
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Container sx={{ py: 8 }} id="features">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Key Features
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
          Our solution addresses the critical challenges of the traditional verification process.
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Demo Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                How It Works
              </Typography>
              <Typography variant="body1" paragraph>
                Our secure voter verification process combines multiple technologies to ensure a seamless experience:
              </Typography>
              
              <Box component="ol" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Pre-registration</strong>: Voters upload ID documents through secure channels.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Document Verification</strong>: Google Cloud Vision API validates ID authenticity.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Voter Pass</strong>: Voters receive a secure QR code for polling day.
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    <strong>Day-of Verification</strong>: Fast-track entry with QR code and biometric verification.
                  </Typography>
                </Box>
              </Box>
              
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/verification" 
                size="large" 
                sx={{ mt: 2 }}
              >
                Try the Demo
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://source.unsplash.com/random?technology"
                alt="Verification process"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Google Technologies Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Powered by Google Technologies
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
          We leverage advanced Google Cloud services to deliver a secure and efficient solution.
        </Typography>
        
        <Grid container spacing={4}>
          {technologies.map((tech, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{tech.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {tech.title}
                  </Typography>
                  <Typography>
                    {tech.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container>
          <Grid container spacing={4} justifyContent="center" textAlign="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h2" gutterBottom>
                Ready to Transform Voter Verification?
              </Typography>
              <Typography variant="body1" paragraph>
                Join electoral bodies across the world in adopting our secure, efficient, and accessible voter verification system.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                component={RouterLink} 
                to="/login" 
                size="large" 
                sx={{ mt: 2 }}
              >
                Get Started Today
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 