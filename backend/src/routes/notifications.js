const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, (req, res) => {
  Notification.find({ 
    userId: req.user._id,
    read: false 
  })
  .sort({ createdAt: -1 })
  .then(notifications => {
    res.json(notifications);
  })
  .catch(err => {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  });
});

// Mark a notification as read
router.patch('/:id', auth, (req, res) => {
  Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  )
  .then(notification => {
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  })
  .catch(err => {
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Error updating notification' });
  });
});

// Mark all notifications as read
router.patch('/', auth, (req, res) => {
  Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true }
  )
  .then(() => {
    res.json({ message: 'All notifications marked as read' });
  })
  .catch(err => {
    console.error('Error updating notifications:', err);
    res.status(500).json({ message: 'Error updating notifications' });
  });
});

module.exports = router; 