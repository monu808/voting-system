import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider, 
  Avatar, 
  Tooltip,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  HowToVote as HowToVoteIcon,
  AccountCircle,
  Dashboard,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Mobile menu state
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  // User menu state
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  // Handle mobile menu open
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  // Handle mobile menu close
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Navigation items based on authentication state and user role
  const navItems = [
    { label: 'Home', path: '/', requiredAuth: false },
    { label: 'Verification', path: '/verification', requiredAuth: true },
    { label: 'Dashboard', path: '/admin', requiredAuth: true, adminOnly: true },
    { label: 'Polling Stations', path: '/polling-stations', requiredAuth: true, adminOnly: true },
    { label: 'Blockchain', path: '/blockchain-verification', requiredAuth: true, adminOnly: true }
  ];

  // Add this console log to debug
  console.log('Current user role:', userRole);

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <HowToVoteIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Secure Voter
          </Typography>

          {/* Mobile menu button */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="mobile menu"
              aria-controls="menu-mobile"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-mobile"
              anchorEl={mobileMenuAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {navItems.map((item) => {
                // Same logic as desktop menu
                if (item.adminOnly && userRole !== 'admin') return null;
                if (item.requiredAuth && !currentUser) return null;
                
                return (
                  <MenuItem 
                    key={item.path} 
                    onClick={() => {
                      handleMobileMenuClose();
                      navigate(item.path);
                    }}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <HowToVoteIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Secure Voter
          </Typography>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => {
              // Skip admin items if user is not admin
              if (item.adminOnly && userRole !== 'admin') {
                return null;
              }
              
              // Skip items requiring auth for non-auth users
              if (item.requiredAuth && !currentUser) return null;
              
              return (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Authentication section */}
          <Box sx={{ flexGrow: 0 }}>
            {currentUser ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                    <Avatar 
                      alt={currentUser.displayName || "User"} 
                      src={currentUser.photoURL || undefined}
                    >
                      {!currentUser.photoURL && (currentUser.displayName?.charAt(0) || <AccountCircle />)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-user"
                  anchorEl={userMenuAnchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={isUserMenuOpen}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={handleUserMenuClose}>
                    <Avatar sx={{ mr: 2, width: 24, height: 24 }} /> Profile
                  </MenuItem>
                  {userRole === 'admin' && (
                    <MenuItem onClick={() => {
                      handleUserMenuClose();
                      navigate('/admin');
                    }}>
                      <Dashboard sx={{ mr: 2, width: 24, height: 24 }} /> Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 2, width: 24, height: 24 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button 
                variant="outlined" 
                color="inherit" 
                component={RouterLink} 
                to="/login"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 