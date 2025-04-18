import React, { useState, useEffect } from 'react';
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
  Badge,
  Avatar,
  Divider,
  useTheme,
  Fade,
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
  Person as PersonIcon,
} from '@mui/icons-material';
import Apartments from '../apartments/Apartments';
import MaintenanceRequest from '../maintenance/MaintenanceRequest';
import WorkOrders from '../service/WorkOrders';
import api from '../../config/api';

const drawerWidth = 280;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const theme = useTheme();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Property Manager
        </Typography>
      </Toolbar>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          backgroundColor: theme.palette.background.default,
          borderRadius: 2
        }}>
          <Avatar sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
          }}>
            {user?.name?.[0]?.toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
              {user?.userType}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <List sx={{ flexGrow: 1 }}>
        {getMenuItems().map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: theme.palette.primary.light + '20',
              },
              ...(window.location.pathname === item.path && {
                backgroundColor: theme.palette.primary.light + '30',
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              }),
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <List sx={{ p: 2 }}>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.light + '20',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.3s ease-in-out',
        }}
      >
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
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={notifications.length} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
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
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Fade in={true} timeout={500}>
          <Box>
            <Routes>
              <Route 
                path="/" 
                element={
                  <Box sx={{ 
                    p: 4, 
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[1],
                  }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {getWelcomeMessage()}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Manage your properties and maintenance requests efficiently.
                    </Typography>
                  </Box>
                } 
              />
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
        </Fade>
      </Box>
    </Box>
  );
};

export default Dashboard; 