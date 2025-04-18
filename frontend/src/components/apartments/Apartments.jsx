import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  useTheme,
  Fade,
  Tooltip,
  CircularProgress,
  Alert,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  BedOutlined as BedIcon,
  BathtubOutlined as BathIcon,
  Square as SquareIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AssignTenant from './AssignTenant';
import api from '../../config/api';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    location: '',
    rentAmount: '',
    rentDueDay: 1,
    status: 'vacant',
    amenities: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
  });
  const [assignTenantOpen, setAssignTenantOpen] = useState(false);
  const [selectedApartmentForTenant, setSelectedApartmentForTenant] = useState(null);

  const theme = useTheme();

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/apartments');
      
      if (response.data.length === 0) {
        // Check user type from the stored user info
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (userInfo?.userType === 'tenant') {
          setError('No apartment is currently assigned to you.');
        } else if (userInfo?.userType === 'owner') {
          setError('You have no properties listed yet.');
        } else {
          setError('No properties found in the system.');
        }
      } else {
        setApartments(response.data);
        setError('');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in again to view properties.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view these properties.');
      } else {
        setError('Failed to fetch properties. Please try again.');
      }
      console.error('Error fetching apartments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      apartmentNumber: '',
      location: '',
      rentAmount: '',
      rentDueDay: 1,
      status: 'vacant',
      amenities: '',
      squareFootage: '',
      bedrooms: '',
      bathrooms: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentAmount' || name === 'rentDueDay' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/apartments', formData);
      await fetchApartments();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add property. Please try again.';
      setError(errorMessage);
      console.error('Error adding apartment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (apartment) => {
    setSelectedApartment(apartment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setSelectedApartment(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApartment) return;

    try {
      setLoading(true);
      setError('');
      
      await api.delete(`/api/apartments/${selectedApartment._id}`);
      await fetchApartments();
      setDeleteDialogOpen(false);
      setSelectedApartment(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete apartment. Please try again.';
      setError(errorMessage);
      console.error('Error deleting apartment:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'vacant':
        return 'success';
      case 'occupied':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleAssignTenantClick = (apartment) => {
    setSelectedApartmentForTenant(apartment);
    setAssignTenantOpen(true);
  };

  const handleAssignTenantClose = () => {
    setSelectedApartmentForTenant(null);
    setAssignTenantOpen(false);
  };

  const handleAssignTenantSuccess = () => {
    fetchApartments();
  };

  const handleRemoveTenant = async (apartment) => {
    try {
      setLoading(true);
      await api.post(`/api/apartments/${apartment._id}/remove-tenant`);
      await fetchApartments();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove tenant. Please try again.';
      setError(errorMessage);
      console.error('Error removing tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Properties
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="apartmentNumber"
                  label="Apartment Number"
                  fullWidth
                  required
                  value={formData.apartmentNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  label="Location"
                  fullWidth
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="rentAmount"
                  label="Monthly Rent"
                  type="number"
                  fullWidth
                  required
                  value={formData.rentAmount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="rentDueDay"
                  label="Rent Due Day"
                  type="number"
                  fullWidth
                  required
                  value={formData.rentDueDay}
                  onChange={handleChange}
                  inputProps={{
                    min: 1,
                    max: 31,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="vacant">Vacant</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="amenities"
                  label="Amenities"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="List amenities separated by commas"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="squareFootage"
                  label="Square Footage"
                  type="number"
                  fullWidth
                  required
                  value={formData.squareFootage}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="bedrooms"
                  label="Bedrooms"
                  type="number"
                  fullWidth
                  required
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="bathrooms"
                  label="Bathrooms"
                  type="number"
                  fullWidth
                  required
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Property
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete apartment {selectedApartment?.apartmentNumber}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {apartments.map((apartment) => (
              <Grid item xs={12} sm={6} md={4} key={apartment._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={apartment.imageUrl}
                    alt={apartment.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {apartment.apartmentNumber}
                      </Typography>
                      <Chip
                        label={apartment.status}
                        size="small"
                        color={getStatusColor(apartment.status)}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {apartment.location}
                      </Typography>
                    </Box>

                    {apartment.currentTenant && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Tenant: {apartment.currentTenant.name} ({apartment.currentTenant.email})
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            ${apartment.rentAmount}/month
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Due: Day {apartment.rentDueDay}
                          </Typography>
                        </Box>
                      </Grid>
                      {apartment.squareFootage && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SquareIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {apartment.squareFootage} sq ft
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {apartment.bedrooms && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BedIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {apartment.bedrooms} Beds
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {apartment.bathrooms && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {apartment.bathrooms} Baths
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    <Typography variant="body2" color="text.secondary" sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2
                    }}>
                      {apartment.description}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={apartment.status === 'occupied' ? 'Remove Tenant' : 'Assign Tenant'}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => apartment.status === 'occupied' 
                          ? handleRemoveTenant(apartment) 
                          : handleAssignTenantClick(apartment)}
                      >
                        {apartment.status === 'occupied' ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteClick(apartment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      <AssignTenant
        open={assignTenantOpen}
        onClose={handleAssignTenantClose}
        apartmentId={selectedApartmentForTenant?._id}
        onSuccess={handleAssignTenantSuccess}
      />
    </Box>
  );
};

export default Apartments; 