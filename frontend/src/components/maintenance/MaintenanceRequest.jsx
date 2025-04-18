import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  Fade,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Stack,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../config/api';

const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    priority: 'medium',
    apartmentId: '',
    images: [],
  });
  const [apartments, setApartments] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchRequests();
    fetchApartments();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/maintenance');
      setRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch maintenance requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      if (userInfo?.userType !== 'tenant') {
        setError('Only tenants can submit maintenance requests.');
        setApartments([]);
        return;
      }

      const response = await api.get('/api/apartments/my-apartment');
      setApartments([response.data]);
      setFormData(prev => ({
        ...prev,
        apartmentId: response.data._id
      }));
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No apartment is currently assigned to you. Please contact your property manager.');
      } else if (err.response?.status === 401) {
        setError('Please log in again to view your apartment.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to submit maintenance requests.');
      } else {
        setError('Failed to fetch your apartment details. Please try again.');
      }
      console.error('Error fetching apartment:', err);
      setApartments([]);
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
      title: '',
      type: '',
      description: '',
      priority: 'medium',
      apartmentId: '',
      images: [],
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData(prev => ({
        ...prev,
        images: Array.from(files),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title || !formData.type || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.apartmentId) {
      setError('Please select an apartment');
      return;
    }

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    // Validate file types and sizes
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    for (const image of formData.images) {
      if (!validImageTypes.includes(image.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }
      if (image.size > maxFileSize) {
        setError('Each image must be less than 5MB');
        return;
      }
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('apartment', formData.apartmentId);

      formData.images.forEach(image => {
        formDataToSend.append('photos', image);
      });

      const response = await api.post('/api/maintenance', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchRequests();
      handleClose();
      
      // Show success message
      setError('');
      setSuccessMessage('Maintenance request submitted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      let errorMessage = 'Failed to submit maintenance request. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      console.error('Error submitting request:', err);
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
          Maintenance Requests
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
          New Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {requests.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No maintenance requests found. Click "New Request" to create one.
                </Alert>
              </Grid>
            ) : (
              requests.map((request) => (
                <Grid item xs={12} sm={6} md={4} key={request._id}>
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
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {request.title}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={request.priority}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette[request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'success'].light,
                              color: theme.palette[request.priority === 'high' ? 'error' : request.priority === 'medium' ? 'warning' : 'success'].dark,
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={request.status}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette[
                                request.status === 'pending' ? 'warning' : 
                                request.status === 'in_progress' ? 'info' : 
                                request.status === 'completed' ? 'success' : 'error'
                              ].light,
                              color: theme.palette[
                                request.status === 'pending' ? 'warning' : 
                                request.status === 'in_progress' ? 'info' : 
                                request.status === 'completed' ? 'success' : 'error'
                              ].dark,
                              fontWeight: 500,
                            }}
                          />
                        </Stack>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <HomeIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.apartment?.apartmentNumber} - {request.apartment?.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BuildIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.type}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1, mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {request.description}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
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
            New Maintenance Request
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Issue Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="plumbing">Plumbing</MenuItem>
                    <MenuItem value="electrical">Electrical</MenuItem>
                    <MenuItem value="hvac">HVAC</MenuItem>
                    <MenuItem value="cleaning">Cleaning</MenuItem>
                    <MenuItem value="pest control">Pest Control</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
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
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required error={!!error && !formData.apartmentId}>
                  <InputLabel>Apartment</InputLabel>
                  <Select
                    name="apartmentId"
                    value={formData.apartmentId}
                    onChange={handleChange}
                    label="Apartment"
                  >
                    {apartments.map((apt) => (
                      <MenuItem key={apt._id} value={apt._id}>
                        {`${apt.apartmentNumber} - ${apt.location}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!error && !formData.apartmentId && (
                    <FormHelperText>Please select an apartment</FormHelperText>
                  )}
                </FormControl>
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
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  sx={{ mr: 2 }}
                >
                  Add Photos
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleChange}
                  />
                </Button>
                {formData.images.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {formData.images.length} photo(s) selected
                  </Typography>
                )}
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
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceRequest; 