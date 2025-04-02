import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

const MaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    photos: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const maintenanceTypes = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliance',
    'Structural',
    'Pest Control',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('priority', formData.priority);
      formData.photos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      await axios.post('/maintenance/request', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Maintenance request submitted successfully!');
      setFormData({
        title: '',
        description: '',
        type: '',
        priority: 'medium',
        photos: [],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit Maintenance Request
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
            helperText="Brief description of the issue"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Type of Issue</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type of Issue"
            >
              {maintenanceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            margin="normal"
            multiline
            rows={4}
            helperText="Detailed description of the issue"
          />

          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ mt: 2, mb: 2 }}
          >
            Upload Photos
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </Button>

          {formData.photos.length > 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {formData.photos.length} photo(s) selected
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MaintenanceRequest; 