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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    rent: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    description: '',
    status: 'available',
    imageUrl: 'https://source.unsplash.com/random/400x300/?apartment',
  });
  const theme = useTheme();

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/apartments');
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
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      name: '',
      address: '',
      rent: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      description: '',
      status: 'available',
      imageUrl: 'https://source.unsplash.com/random/400x300/?apartment',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/apartments', formData);
      fetchApartments();
      handleClose();
    } catch (err) {
      setError('Failed to add apartment. Please try again.');
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                            ${apartment.rent}/month
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SquareIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {apartment.squareFeet} sq ft
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

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add New Property
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Property Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  required
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="rent"
                  label="Monthly Rent"
                  type="number"
                  fullWidth
                  required
                  value={formData.rent}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                  fullWidth
                  required
                  value={formData.squareFeet}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="status"
                  label="Status"
                  select
                  fullWidth
                  required
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="rented">Rented</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ px: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Apartments; 