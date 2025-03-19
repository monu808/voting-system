import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Secure Voter Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Revolutionizing the voting process with faster and secure automated verification.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" gutterBottom>
              Home
            </Link>
            <Link component={RouterLink} to="/verification" color="inherit" display="block" gutterBottom>
              Verification
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block" gutterBottom>
              Login
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="https://firebase.google.com/" target="_blank" rel="noopener" color="inherit" display="block" gutterBottom>
              Firebase
            </Link>
            <Link href="https://cloud.google.com/" target="_blank" rel="noopener" color="inherit" display="block" gutterBottom>
              Google Cloud
            </Link>
            <Link href="https://ai.google.dev/gemini/" target="_blank" rel="noopener" color="inherit" display="block" gutterBottom>
              Gemini API
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" component={RouterLink} to="/">
            Secure Voter Verification
          </Link>{' '}
          {new Date().getFullYear()}
          {'. Powered by Google Technologies.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 