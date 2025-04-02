import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Build as BuildIcon,
  Payment as PaymentIcon,
  ExitToApp as LogoutIcon,
  Message as MessageIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import Apartments from '../apartments/Apartments';
import MaintenanceRequest from '../maintenance/MaintenanceRequest';
import WorkOrders from '../service/WorkOrders';

const drawerWidth = 240;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define menu items based on user type
  const getMenuItems = () => {
    switch (user?.userType) {
      case 'owner':
        return [
          { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
          { text: 'Properties', icon: <ApartmentIcon />, path: '/dashboard/apartments' },
          { text: 'Maintenance', icon: <BuildIcon />, path: '/dashboard/maintenance' },
          { text: 'Payments', icon: <PaymentIcon />, path: '/dashboard/payments' },
          { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/messages' },
        ];
      case 'tenant':
        return [
          { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
          { text: 'My Apartment', icon: <ApartmentIcon />, path: '/dashboard/my-apartment' },
          { text: 'Maintenance Requests', icon: <BuildIcon />, path: '/dashboard/maintenance' },
          { text: 'Rent Payments', icon: <PaymentIcon />, path: '/dashboard/payments' },
          { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/messages' },
        ];
      case 'serviceProvider':
        return [
          { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
          { text: 'Work Orders', icon: <AssignmentIcon />, path: '/dashboard/work-orders' },
          { text: 'Active Jobs', icon: <BuildIcon />, path: '/dashboard/active-jobs' },
          { text: 'Completed Jobs', icon: <AssignmentIcon />, path: '/dashboard/completed-jobs' },
          { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/messages' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {getMenuItems().map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Get welcome message based on user type
  const getWelcomeMessage = () => {
    switch (user?.userType) {
      case 'owner':
        return 'Welcome to your Property Management Dashboard';
      case 'tenant':
        return 'Welcome to your Tenant Portal';
      case 'serviceProvider':
        return 'Welcome to your Service Provider Dashboard';
      default:
        return 'Welcome to Property Maintenance';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Property Maintenance
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user?.name} ({user?.userType})
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Routes>
          <Route path="/" element={
            <Typography variant="h4" gutterBottom>
              {getWelcomeMessage()}
            </Typography>
          } />
          {/* Owner Routes */}
          {user?.userType === 'owner' && (
            <>
              <Route path="/apartments" element={<Apartments />} />
              <Route path="/maintenance" element={
                <Typography>View All Maintenance Requests</Typography>
              } />
              <Route path="/payments" element={
                <Typography>Manage Rent Payments</Typography>
              } />
              <Route path="/messages" element={
                <Typography>Messages</Typography>
              } />
            </>
          )}
          {/* Tenant Routes */}
          {user?.userType === 'tenant' && (
            <>
              <Route path="/my-apartment" element={
                <Typography>My Apartment Details</Typography>
              } />
              <Route path="/maintenance" element={<MaintenanceRequest />} />
              <Route path="/payments" element={
                <Typography>My Rent Payments</Typography>
              } />
              <Route path="/messages" element={
                <Typography>Messages</Typography>
              } />
            </>
          )}
          {/* Service Provider Routes */}
          {user?.userType === 'serviceProvider' && (
            <>
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/active-jobs" element={<WorkOrders />} />
              <Route path="/completed-jobs" element={<WorkOrders />} />
              <Route path="/messages" element={
                <Typography>Messages</Typography>
              } />
            </>
          )}
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard; 