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
} from '@mui/icons-material';
import axios from 'axios';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    location: '',
    rentAmount: '',
    rentDueDay: '1'
  });

  const theme = useTheme();

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/apartments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setApartments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch apartments. Please try again.');
      console.error('Error fetching apartments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setError('');
    setOpen(false);
    setFormData({
      apartmentNumber: '',
      location: '',
      rentAmount: '',
      rentDueDay: '1'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.apartmentNumber.trim()) {
      setError('Apartment number is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.rentAmount || formData.rentAmount <= 0) {
      setError('Valid rent amount is required');
      return false;
    }
    if (!formData.rentDueDay || formData.rentDueDay < 1 || formData.rentDueDay > 31) {
      setError('Rent due day must be between 1 and 31');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const dataToSubmit = {
        apartmentNumber: formData.apartmentNumber.trim(),
        location: formData.location.trim(),
        rentAmount: Number(formData.rentAmount),
        rentDueDay: Number(formData.rentDueDay)
      };

      await axios.post('http://localhost:5000/api/apartments', dataToSubmit, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      await fetchApartments();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add apartment. Please try again.';
      setError(errorMessage);
      console.error('Error adding apartment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/apartments/${id}`);
        fetchApartments();
      } catch (err) {
        setError('Failed to delete apartment. Please try again.');
        console.error('Error deleting apartment:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return theme.palette.success;
      case 'rented':
        return theme.palette.warning;
      case 'maintenance':
        return theme.palette.error;
      default:
        return theme.palette.info;
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Property</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              required
              fullWidth
              label="Apartment Number"
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleChange}
              margin="normal"
              error={!!error && !formData.apartmentNumber}
              helperText={!!error && !formData.apartmentNumber ? "Apartment number is required" : ""}
            />
            <TextField
              required
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              error={!!error && !formData.location}
              helperText={!!error && !formData.location ? "Location is required" : ""}
            />
            <TextField
              required
              fullWidth
              label="Rent Amount"
              name="rentAmount"
              type="number"
              value={formData.rentAmount}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: <MoneyIcon sx={{ mr: 1 }} />,
              }}
              error={!!error && (!formData.rentAmount || formData.rentAmount <= 0)}
              helperText={!!error && (!formData.rentAmount || formData.rentAmount <= 0) ? "Valid rent amount is required" : ""}
            />
            <TextField
              required
              fullWidth
              label="Rent Due Day"
              name="rentDueDay"
              type="number"
              value={formData.rentDueDay}
              onChange={handleChange}
              margin="normal"
              inputProps={{ min: 1, max: 31 }}
              error={!!error && (!formData.rentDueDay || formData.rentDueDay < 1 || formData.rentDueDay > 31)}
              helperText={!!error && (!formData.rentDueDay || formData.rentDueDay < 1 || formData.rentDueDay > 31) ? "Rent due day must be between 1 and 31" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && !open ? (
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
                        {apartment.name}
                      </Typography>
                      <Chip
                        label={apartment.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(apartment.status).light,
                          color: getStatusColor(apartment.status).dark,
                          fontWeight: 500,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {apartment.address}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            ${apartment.rentAmount}/month (Due: Day {apartment.rentDueDay})
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SquareIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {apartment.squareFootage} sq ft
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BedIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {apartment.bedrooms} Beds
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BathIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {apartment.bathrooms} Baths
                          </Typography>
                        </Box>
                      </Grid>
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
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(apartment._id)}
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
    </Box>
  );
};

export default Apartments; 