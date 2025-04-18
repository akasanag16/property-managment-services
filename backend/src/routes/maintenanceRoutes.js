const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Apartment = require('../models/Apartment');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with validation
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Max 5 files
  }
});

// Create maintenance request
router.post('/', auth, authorize('tenant'), upload.array('photos', 5), async (req, res) => {
  try {
    const { title, type, description, priority, apartment } = req.body;

    // Validate required fields
    if (!title || !type || !description || !apartment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify apartment belongs to tenant
    const apartmentDoc = await Apartment.findOne({
      _id: apartment,
      currentTenant: req.user._id
    });

    if (!apartmentDoc) {
      return res.status(403).json({ message: 'You can only create maintenance requests for your assigned apartment' });
    }

    // Create maintenance request
    const request = new MaintenanceRequest({
      title,
      type,
      description,
      priority: priority || 'medium',
      apartment: apartmentDoc._id,
      tenant: req.user._id,
      owner: apartmentDoc.owner,
      status: 'pending'
    });

    // Add photos if any were uploaded
    if (req.files && req.files.length > 0) {
      request.photos = req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }));
    }

    await request.save();

    // Populate response data
    await request.populate([
      { path: 'tenant', select: 'name email phone' },
      { path: 'apartment', select: 'apartmentNumber location' }
    ]);

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ message: 'Error creating maintenance request', error: error.message });
  }
});

// Serve uploaded photos
router.get('/photos/:filename', (req, res) => {
  const filename = req.params.filename;
  const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadPath, filename);

  // Check if file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'Photo not found' });
  }
});

// Get maintenance requests
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user type
    if (req.user.userType === 'tenant') {
      query.tenant = req.user._id;
    } else if (req.user.userType === 'owner') {
      query.owner = req.user._id;
    } else if (req.user.userType === 'serviceProvider') {
      // For service providers, show assigned requests and available requests
      query.$or = [
        { serviceProvider: req.user._id },
        { serviceProvider: { $exists: false }, status: 'pending' }
      ];
    }

    // Add status filter if provided
    if (req.query.status) {
      if (req.user.userType === 'serviceProvider') {
        // For service providers, handle special status filters
        if (req.query.status === 'active') {
          query.status = 'in_progress';
          query.serviceProvider = req.user._id;
        } else if (req.query.status === 'completed') {
          query.status = 'completed';
          query.serviceProvider = req.user._id;
        }
      } else {
        query.status = req.query.status;
      }
    }

    console.log('Fetching maintenance requests with query:', query);
    console.log('User type:', req.user.userType);
    console.log('User ID:', req.user._id);

    const requests = await MaintenanceRequest.find(query)
      .populate('apartment', 'apartmentNumber location')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('serviceProvider', 'name email phone companyName')
      .sort({ createdAt: -1 });

    console.log('Found requests:', requests.length);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ message: 'Error fetching maintenance requests', error: error.message });
  }
});

// Update maintenance request status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('tenant', 'name email deviceToken')
      .populate('apartment', 'owner')
      .populate('owner', 'name email deviceToken');
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completionDate = new Date();

      // Send notifications to tenant and owner
      const notification = {
        title: 'Maintenance Request Completed',
        body: `Your maintenance request for ${request.apartment.apartmentNumber} has been completed.`,
        data: {
          requestId: request._id.toString(),
          type: 'maintenance_completed'
        }
      };

      // Send to tenant if they have a device token
      if (request.tenant.deviceToken) {
        await request.sendNotification(request.tenant.deviceToken, notification);
      }

      // Send to owner if they have a device token
      if (request.owner.deviceToken) {
        await request.sendNotification(request.owner.deviceToken, notification);
      }
    }
    
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance request', error: error.message });
  }
});

// Add message to maintenance request
router.post('/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.messages.push({
      sender: req.user._id,
      message
    });
    await request.save();

    res.json(request.messages[request.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error: error.message });
  }
});

// Upload completion photos (Service Provider only)
router.post('/:id/completion-photos', auth, authorize('serviceProvider'), upload.array('photos', 5), async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    if (request.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save file paths
    const photos = [];
    if (req.files && req.files.length > 0) {
      photos.push(...req.files.map(file => ({
        url: `/uploads/${file.filename}`
      })));
    }

    request.completionPhotos = request.completionPhotos.concat(photos);
    await request.save();

    res.json(request.completionPhotos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 