import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import api from '../../config/api';

const AssignTenant = ({ open, onClose, apartmentId, onSuccess }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchAvailableTenants();
    }
  }, [open]);

  const fetchAvailableTenants = async () => {
    try {
      setLoading(true);
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      // Check if user is an owner
      if (userInfo?.userType !== 'owner') {
        setError('Only owners can assign tenants to apartments');
        return;
      }

      const response = await api.get('/api/users/tenants');
      // Filter out tenants that are already assigned to apartments
      const availableTenants = response.data.filter(tenant => !tenant.currentApartment);
      setTenants(availableTenants);
    } catch (err) {
      setError('Failed to fetch available tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTenant) {
      setError('Please select a tenant');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/api/apartments/${apartmentId}/assign-tenant`, {
        tenantId: selectedTenant
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign tenant');
      console.error('Error assigning tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTenant('');
    setError('');
    onClose();
  };

  // If there's an error and no tenants, don't show the form
  if (error && tenants.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Tenant to Apartment</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Tenant to Apartment</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Select Tenant</InputLabel>
          <Select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            label="Select Tenant"
          >
            {tenants.map((tenant) => (
              <MenuItem key={tenant._id} value={tenant._id}>
                {tenant.name} ({tenant.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedTenant}
        >
          {loading ? <CircularProgress size={24} /> : 'Assign Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTenant; 