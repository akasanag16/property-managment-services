import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  useTheme,
  Fade,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import {
  Build as BuildIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import api from '../../config/api';

const WorkOrders = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const theme = useTheme();
  const location = useLocation();

  useEffect(() => {
    fetchRequests();
  }, [location.pathname]);

  const getStatusFilter = () => {
    if (location.pathname.includes('active-jobs')) {
      return 'in_progress';
    } else if (location.pathname.includes('completed-jobs')) {
      return 'completed';
    }
    return 'pending';
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const status = getStatusFilter();
      const response = await api.get(`/api/maintenance?status=${status}`);
      setRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch work orders. Please try again.');
      console.error('Error fetching work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    try {
      setLoading(true);
      await api.patch(`/api/maintenance/${request._id}/status`, {
        status: newStatus,
        note: updateNote,
      });
      await fetchRequests();
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setUpdateNote('');
    } catch (err) {
      setError('Failed to update work order status. Please try again.');
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateDialog = (request) => {
    setSelectedRequest(request);
    setUpdateDialogOpen(true);
  };

  const closeUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedRequest(null);
    setUpdateNote('');
  };

  const getPageTitle = () => {
    if (location.pathname.includes('active-jobs')) {
      return 'Active Jobs';
    } else if (location.pathname.includes('completed-jobs')) {
      return 'Completed Jobs';
    }
    return 'Work Orders';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        {getPageTitle()}
      </Typography>

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
            {requests.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No {getPageTitle().toLowerCase()} available at the moment.
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
                        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {request.tenant?.name}
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

                    <CardActions sx={{ p: 2, pt: 0 }}>
                      {request.status === 'pending' && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={() => openUpdateDialog(request)}
                        >
                          Accept Work Order
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          onClick={() => openUpdateDialog(request)}
                        >
                          Mark as Complete
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Fade>
      )}

      <Dialog
        open={updateDialogOpen}
        onClose={closeUpdateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRequest?.status === 'pending' ? 'Accept Work Order' : 'Complete Work Order'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Add a note"
            fullWidth
            multiline
            rows={4}
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={selectedRequest?.status === 'pending' ? 'primary' : 'success'}
            onClick={() => handleUpdateStatus(
              selectedRequest,
              selectedRequest?.status === 'pending' ? 'in_progress' : 'completed'
            )}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 
              selectedRequest?.status === 'pending' ? 'Accept' : 'Complete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkOrders; 