import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            sx={{ width: 100, height: 100, mb: 2 }}
            src={currentUser?.photoURL || undefined}
          >
            {currentUser?.displayName?.charAt(0)}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {currentUser?.displayName || 'User Profile'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 