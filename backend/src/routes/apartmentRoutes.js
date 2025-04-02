const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Apartment = require('../models/Apartment');
const User = require('../models/User');
const { validateApartment, validate } = require('../middleware/validation');

// All routes should be owner-only
router.use(auth, authorize('owner'));

// Create new apartment (owner only)
router.post('/', validateApartment, validate, async (req, res) => {
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
      owner: req.user._id
    });

    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating apartment', error: error.message });
  }
});

// Get all apartments (filtered by user type)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filter apartments based on user type
    if (req.user.userType === 'tenant') {
      query.currentTenant = req.user._id;
    } else if (req.user.userType === 'owner') {
      query.owner = req.user._id;
    }

    const apartments = await Apartment.find(query)
      .populate('owner', 'name email phone')
      .populate('currentTenant', 'name email phone');

    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartments', error: error.message });
  }
});

// Get apartment details
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('currentTenant', 'name email phone');

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment details', error: error.message });
  }
});

// Update apartment (Owner only)
router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['location', 'rentAmount', 'rentDueDate', 'status'];
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

    const tenant = await User.findOne({
      _id: tenantId,
      userType: 'tenant'
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Update tenant's apartment
    tenant.apartmentId = apartment._id;
    await tenant.save();

    // Update apartment's current tenant
    apartment.currentTenant = tenant._id;
    apartment.status = 'occupied';
    await apartment.save();

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
      $unset: { apartmentId: 1 }
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

// Get all apartments
router.get('/all', async (req, res) => {
  try {
    const apartments = await Apartment.find()
      .populate('currentTenant', 'name email')
      .populate('owner', 'name email');
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartments', error: error.message });
  }
});

// Get all apartments for the logged-in owner
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find({ owner: req.user._id })
      .populate('currentTenant', 'name email phone')
      .sort({ apartmentNumber: 1 });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartments', error: error.message });
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

// Delete an apartment
router.delete('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.json({ message: 'Apartment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting apartment', error: error.message });
  }
});

module.exports = router; 