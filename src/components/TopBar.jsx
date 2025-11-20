import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import logo from '../assets/logo.png';

const TopBar = () => {
  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={logo} alt="Crop Circles" style={{ width: 30, borderRadius: '50%' }} />
          Crop Circles
        </Typography>

        <IconButton color="inherit">
          <Badge badgeContent={2} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
