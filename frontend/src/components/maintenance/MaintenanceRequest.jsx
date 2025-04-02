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
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    apartment: '',
    images: [],
  });
  const [apartments, setApartments] = useState([]);
  const theme = useTheme();

  const categories = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliance',
    'Structural',
    'Pest Control',
    'Other',
  ];

  useEffect(() => {
    fetchRequests();
    fetchApartments();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/maintenance');
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
      const response = await axios.get('/api/apartments');
      setApartments(response.data);
    } catch (err) {
      console.error('Error fetching apartments:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      apartment: '',
      images: [],
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setFormData({
        ...formData,
        images: Array.from(files),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(image => {
            formDataToSend.append('images', image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('/api/maintenance', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchRequests();
      handleClose();
    } catch (err) {
      setError('Failed to submit maintenance request. Please try again.');
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/maintenance/${id}`);
        fetchRequests();
      } catch (err) {
        setError('Failed to delete maintenance request. Please try again.');
        console.error('Error deleting request:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.palette.error;
      case 'medium':
        return theme.palette.warning;
      case 'low':
        return theme.palette.success;
      default:
        return theme.palette.info;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.palette.warning;
      case 'in_progress':
        return theme.palette.info;
      case 'completed':
        return theme.palette.success;
      default:
        return theme.palette.error;
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Fade in={true} timeout={500}>
          <Grid container spacing={3}>
            {requests.map((request) => (
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
                            backgroundColor: getPriorityColor(request.priority).light,
                            color: getPriorityColor(request.priority).dark,
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={request.status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(request.status).light,
                            color: getStatusColor(request.status).dark,
                            fontWeight: 500,
                          }}
                        />
                      </Stack>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <HomeIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {request.apartment}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BuildIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {request.category}
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
                        onClick={() => handleDelete(request._id)}
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
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
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
                <FormControl fullWidth required>
                  <InputLabel>Apartment</InputLabel>
                  <Select
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    label="Apartment"
                  >
                    {apartments.map((apt) => (
                      <MenuItem key={apt._id} value={apt._id}>
                        {apt.name}
                      </MenuItem>
                    ))}
                  </Select>
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