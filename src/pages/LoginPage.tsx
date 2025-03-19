import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, register, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      if (isRegistering) {
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google.');
      console.error('Google sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegisterDialog = () => {
    setOpenRegisterDialog(true);
  };

  const handleCloseRegisterDialog = () => {
    setOpenRegisterDialog(false);
    setIsRegistering(false);
    setDisplayName('');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {isRegistering ? 'Register' : 'Sign in'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          {isRegistering && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Full Name"
              name="displayName"
              autoComplete="name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (isRegistering ? 'Register' : 'Sign In')}
          </Button>
          
          <Divider sx={{ my: 2 }}>or</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Sign in with Google
          </Button>
          
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link component={RouterLink} to="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link 
                component="button" 
                variant="body2" 
                onClick={handleOpenRegisterDialog}
              >
                {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Registration Dialog */}
      <Dialog open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Full Name"
              name="displayName"
              autoComplete="name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegisterDialog}>Cancel</Button>
          <Button 
            onClick={() => {
              setIsRegistering(true);
              handleCloseRegisterDialog();
            }}
            variant="contained"
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <Box mt={4}>
        <Typography variant="body2" color="text.secondary" align="center">
          This secure login is powered by Firebase Authentication, providing enterprise-grade security for voter verification.
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage; 