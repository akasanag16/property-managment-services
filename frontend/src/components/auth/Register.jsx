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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    userType: 'tenant',
    companyName: '',
    serviceTypes: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const availableServiceTypes = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Carpentry',
    'Painting',
    'Cleaning',
    'Pest Control',
    'Appliance Repair',
    'General Maintenance',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    setError('');
  };

  const handleServiceTypesChange = (event) => {
    setFormData({
      ...formData,
      serviceTypes: event.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending registration request:', formData);
      const response = await axios.post('/auth/register', formData);
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
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
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
          <TextField
            margin="normal"
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="Phone Number"
            id="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
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

          {formData.userType === 'serviceProvider' && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="companyName"
                label="Company Name"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={loading}
              />
              <FormControl fullWidth margin="normal" required>
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
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
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