const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Apartment = require('../models/Apartment');
const User = require('../models/User');
const { validateApartment, validate } = require('../middleware/validation');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// Apply auth middleware to all routes
router.use(auth);

// Get tenant's assigned apartment
router.get('/my-apartment', auth, authorize('tenant'), async (req, res) => {
  try {
    const apartment = await Apartment.findOne({ currentTenant: req.user._id })
      .populate('owner', 'name email phone');
    
    if (!apartment) {
      return res.status(404).json({ message: 'No apartment assigned to this tenant' });
    }

    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment', error: error.message });
  }
});

// Get all apartments (filtered by user type)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    const userType = req.user.userType;
    
    // Filter apartments based on user type
    switch (userType) {
      case 'tenant':
        // Tenants can see their assigned apartment
        query.currentTenant = req.user._id;
        break;
      case 'owner':
        // Owners can see their properties
        query.owner = req.user._id;
        break;
      case 'admin':
        // Admin can see all apartments
        break;
      case 'serviceProvider':
        // Service providers can see apartments with their assigned maintenance requests
        const maintenanceRequests = await MaintenanceRequest.find({
          serviceProvider: req.user._id
        }).distinct('apartment');
        query._id = { $in: maintenanceRequests };
        break;
      default:
        return res.status(403).json({
          status: 'error',
          message: `Access denied. ${userType} cannot view apartments.`
        });
    }

    console.log('Fetching apartments with query:', JSON.stringify(query));
    console.log('User type:', userType);
    console.log('User ID:', req.user._id);

    const apartments = await Apartment.find(query)
      .populate('owner', 'name email phone')
      .populate('currentTenant', 'name email phone')
      .sort({ apartmentNumber: 1 });

    // Return appropriate message if no apartments found
    if (apartments.length === 0) {
      let message = '';
      switch (userType) {
        case 'tenant':
          message = 'No apartment is currently assigned to you.';
          break;
        case 'owner':
          message = 'You have no properties listed yet.';
          break;
        case 'serviceProvider':
          message = 'No apartments are currently assigned to your maintenance requests.';
          break;
        default:
          message = 'No apartments found.';
      }
      return res.json({ apartments: [], message });
    }

    res.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching apartments. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new apartment (owner only)
router.post('/', authorize('owner'), validateApartment, validate, async (req, res) => {
  try {
    const { apartmentNumber, location, rentAmount, rentDueDay } = req.body;
    
    // Check if apartment number already exists for this owner
    const existingApartment = await Apartment.findOne({ 
      owner: req.user._id,
      apartmentNumber 
    });
    
    if (existingApartment) {
      return res.status(400).json({ message: 'Apartment number already exists' });
    }

    const apartment = new Apartment({
      apartmentNumber,
      location,
      rentAmount,
      rentDueDay,
      owner: req.user._id,
      status: 'vacant'
    });

    await apartment.save();

    // Update owner's ownedApartments array
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { ownedApartments: apartment._id } }
    );

    res.status(201).json(apartment);
  } catch (error) {
    console.error('Error creating apartment:', error);
    res.status(500).json({ message: 'Error creating apartment', error: error.message });
  }
});

// Get apartment details
router.get('/:id', async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // Add user-specific conditions
    if (req.user.userType === 'tenant') {
      query.currentTenant = req.user._id;
    } else if (req.user.userType === 'owner') {
      query.owner = req.user._id;
    }

    const apartment = await Apartment.findOne(query)
      .populate('owner', 'name email phone')
      .populate('currentTenant', 'name email phone');

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.json(apartment);
  } catch (error) {
    console.error('Error fetching apartment details:', error);
    res.status(500).json({ message: 'Error fetching apartment details', error: error.message });
  }
});

// Update apartment (Owner only)
router.patch('/:id', authorize('owner'), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['location', 'rentAmount', 'rentDueDay', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    updates.forEach(update => apartment[update] = req.body[update]);
    await apartment.save();

    res.json(apartment);
  } catch (error) {
    console.error('Error updating apartment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Assign tenant to apartment (Owner only)
router.post('/:id/assign-tenant', async (req, res) => {
  try {
    const { tenantId } = req.body;
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    // Check if tenant exists and is not already assigned
    const tenant = await User.findOne({
      _id: tenantId,
      userType: 'tenant',
      currentApartment: { $exists: false }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found or already assigned to an apartment' });
    }

    // Update tenant's apartment
    tenant.currentApartment = apartment._id;
    await tenant.save();

    // Update apartment's current tenant
    apartment.currentTenant = tenant._id;
    apartment.status = 'occupied';
    await apartment.save();

    // Populate the response
    await apartment.populate('currentTenant', 'name email phone');

    res.json(apartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove tenant from apartment (Owner only)
router.post('/:id/remove-tenant', async (req, res) => {
  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    if (!apartment.currentTenant) {
      return res.status(400).json({ message: 'No tenant assigned to this apartment' });
    }

    // Update tenant's apartment
    await User.findByIdAndUpdate(apartment.currentTenant, {
      $unset: { currentApartment: 1 }
    });

    // Update apartment's current tenant
    apartment.currentTenant = null;
    apartment.status = 'vacant';
    await apartment.save();

    res.json(apartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an apartment
router.put('/:id', validateApartment, validate, async (req, res) => {
  try {
    const { apartmentNumber, location, rentAmount, rentDueDay } = req.body;
    
    // Check if apartment exists and belongs to the owner
    const apartment = await Apartment.findOne({ 
      _id: req.params.id,
      owner: req.user._id 
    });
    
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    // Check if new apartment number conflicts with existing ones
    if (apartmentNumber !== apartment.apartmentNumber) {
      const existingApartment = await Apartment.findOne({
        owner: req.user._id,
        apartmentNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingApartment) {
        return res.status(400).json({ message: 'Apartment number already exists' });
      }
    }

    apartment.apartmentNumber = apartmentNumber;
    apartment.location = location;
    apartment.rentAmount = rentAmount;
    apartment.rentDueDay = rentDueDay;

    await apartment.save();
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating apartment', error: error.message });
  }
});

// Delete apartment (Owner only)
router.delete('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    // Check if apartment has a tenant
    if (apartment.currentTenant) {
      return res.status(400).json({ 
        message: 'Cannot delete apartment with active tenant. Please remove tenant first.' 
      });
    }

    await apartment.deleteOne();
    res.json({ message: 'Apartment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting apartment', error: error.message });
  }
});

module.exports = router; 