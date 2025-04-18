const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

// Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    // Ensure user exists and is verified
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your account to view notifications.'
      });
    }

    // Get notifications for the user
    const notifications = await Notification.find({ 
      userId: req.user._id,
      read: false 
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to most recent 50 unread notifications

    // Return empty array with message if no notifications
    if (notifications.length === 0) {
      return res.json({
        notifications: [],
        message: 'No unread notifications.'
      });
    }

    res.json({
      notifications,
      message: `You have ${notifications.length} unread notification(s).`
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Error fetching notifications. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Mark notification as read
router.patch('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.json(notification);
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating notification'
    });
  }
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