import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 6, mt: 8, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 100, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Box mt={4}>
          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            size="large"
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage; 