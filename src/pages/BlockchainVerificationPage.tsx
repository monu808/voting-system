import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

const BlockchainVerificationPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Blockchain Verification
        </Typography>
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            This page displays the blockchain verification tools for validating voting records.
          </Typography>
          <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', my: 2 }} />
        </Box>
      </Paper>
    </Container>
  );
};

export default BlockchainVerificationPage; 