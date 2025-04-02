import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    location: '',
    rentAmount: '',
    rentDueDay: '',
  });

  // Fetch apartments on component mount
  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await axios.get('/apartments');
      setApartments(response.data);
    } catch (err) {
      setError('Failed to fetch apartments');
      console.error('Error fetching apartments:', err);
    }
  };

  const handleOpen = (apartment = null) => {
    if (apartment) {
      setEditingApartment(apartment);
      setFormData({
        apartmentNumber: apartment.apartmentNumber,
        location: apartment.location,
        rentAmount: apartment.rentAmount,
        rentDueDay: apartment.rentDueDay,
      });
    } else {
      setEditingApartment(null);
      setFormData({
        apartmentNumber: '',
        location: '',
        rentAmount: '',
        rentDueDay: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingApartment(null);
    setFormData({
      apartmentNumber: '',
      location: '',
      rentAmount: '',
      rentDueDay: '',
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
      if (editingApartment) {
        await axios.put(`/apartments/${editingApartment._id}`, formData);
      } else {
        await axios.post('/apartments', formData);
      }
      fetchApartments();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save apartment');
      console.error('Error saving apartment:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this apartment?')) {
      try {
        await axios.delete(`/apartments/${id}`);
        fetchApartments();
      } catch (err) {
        setError('Failed to delete apartment');
        console.error('Error deleting apartment:', err);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Properties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {apartments.map((apartment) => (
          <Grid item xs={12} sm={6} md={4} key={apartment._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {apartment.apartmentNumber}
                </Typography>
                <Typography color="textSecondary">
                  Location: {apartment.location}
                </Typography>
                <Typography color="textSecondary">
                  Rent: ₹{apartment.rentAmount}
                </Typography>
                <Typography color="textSecondary">
                  Due Day: {apartment.rentDueDay}th of every month
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(apartment)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(apartment._id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingApartment ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Apartment Number/ID"
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleChange}
              margin="normal"
              required
              helperText="e.g., Q1, Q2, A101"
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Address or area of the property"
            />
            <TextField
              fullWidth
              label="Rent Amount"
              name="rentAmount"
              type="number"
              value={formData.rentAmount}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Monthly rent amount in ₹"
            />
            <TextField
              fullWidth
              label="Rent Due Day"
              name="rentDueDay"
              type="number"
              value={formData.rentDueDay}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 1, max: 31 }}
              helperText="Day of the month when rent is due (1-31)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingApartment ? 'Update' : 'Add'} Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Apartments; 