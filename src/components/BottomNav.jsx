import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = useState('home');

  // Sync tab with current URL
  useEffect(() => {
    if (location.pathname.startsWith('/home')) setValue('home');
    else if (location.pathname.startsWith('/profile')) setValue('profile');
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue === 'home' ? '/home' : '/profile');
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
