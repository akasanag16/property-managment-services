import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  Grid,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'tenant',
    companyName: '',
    serviceTypes: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const availableServiceTypes = [
    'plumbing',
    'electrical',
    'hvac',
    'cleaning',
    'pest control',
    'general'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleServiceTypesChange = (event) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: event.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6 || !/\d/.test(formData.password)) {
      setError('Password must be at least 6 characters and contain a number');
      return false;
    }
    if (!formData.phone || !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }
    if (formData.userType === 'serviceProvider') {
      if (!formData.companyName) {
        setError('Company name is required for service providers');
        return false;
      }
      if (formData.serviceTypes.length === 0) {
        setError('Please select at least one service type');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', formData);
      console.log('Registration successful:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.errors?.[0]?.msg || 
        err.response?.data?.message || 
        err.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                helperText="Password must be at least 6 characters and contain a number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="phone"
                label="Phone Number"
                id="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                helperText="Enter at least 10 digits, can include +, spaces, or hyphens"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                name="userType"
                label="User Type"
                id="userType"
                value={formData.userType}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="tenant">Tenant</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="serviceProvider">Service Provider</MenuItem>
              </TextField>
            </Grid>

            {formData.userType === 'serviceProvider' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="companyName"
                    label="Company Name"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="service-types-label">Service Types</InputLabel>
                    <Select
                      labelId="service-types-label"
                      id="serviceTypes"
                      multiple
                      value={formData.serviceTypes}
                      onChange={handleServiceTypesChange}
                      input={<OutlinedInput label="Service Types" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {availableServiceTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Already have an account? Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 