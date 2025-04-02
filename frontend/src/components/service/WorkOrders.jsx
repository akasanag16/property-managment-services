import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchWorkOrders();
  }, [location.pathname]);

  const fetchWorkOrders = async () => {
    try {
      let status = '';
      if (location.pathname.includes('active-jobs')) {
        status = 'in-progress';
      } else if (location.pathname.includes('completed-jobs')) {
        status = 'completed';
      }

      const response = await axios.get(`/api/maintenance${status ? `?status=${status}` : ''}`);
      setWorkOrders(response.data);
    } catch (err) {
      setError('Failed to fetch work orders');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('notes', notes);
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await axios.patch(`/api/maintenance/${orderId}/status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchWorkOrders();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update work order');
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos([...photos, ...files]);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setUpdateDialog(true);
    setNotes('');
    setPhotos([]);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
    setUpdateDialog(false);
    setNotes('');
    setPhotos([]);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {location.pathname.includes('active-jobs') 
            ? 'Active Jobs'
            : location.pathname.includes('completed-jobs')
              ? 'Completed Jobs'
              : 'Work Orders'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {workOrders.map((order) => (
            <Grid item xs={12} md={6} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{order.title}</Typography>
                    <Chip
                      label={order.priority}
                      color={getPriorityColor(order.priority)}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Apartment: {order.apartment.apartmentNumber}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Type: {order.type}
                  </Typography>
                  <Typography variant="body2">{order.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<BuildIcon />}
                    onClick={() => handleOpenDialog(order)}
                  >
                    Update Status
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={updateDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Work Order Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCameraIcon />}
            sx={{ mt: 2 }}
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
          {photos.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {photos.length} photo(s) selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => handleUpdateStatus(selectedOrder?._id, 'in-progress')}
            startIcon={<BuildIcon />}
          >
            Start Work
          </Button>
          <Button
            onClick={() => handleUpdateStatus(selectedOrder?._id, 'completed')}
            startIcon={<CheckCircleIcon />}
            color="success"
          >
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WorkOrders; 