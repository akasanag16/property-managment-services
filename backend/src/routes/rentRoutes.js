const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const RentPayment = require('../models/RentPayment');
const Apartment = require('../models/Apartment');
const User = require('../models/User');

// Create rent payment record
router.post('/', async (req, res) => {
  try {
    const { apartmentId, amount, dueDate } = req.body;
    const payment = new RentPayment({
      apartment: apartmentId,
      tenant: req.user._id, // From auth middleware
      amount,
      dueDate
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating rent payment', error: error.message });
  }
});

// Get rent payments (filtered by user type)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    if (req.user.userType === 'tenant') {
      query.tenant = req.user._id;
    } else if (req.user.userType === 'owner') {
      const apartments = await Apartment.find({ owner: req.user._id });
      query.apartment = { $in: apartments.map(apt => apt._id) };
    }

    const payments = await RentPayment.find(query)
      .populate('apartment')
      .populate('tenant', 'name email')
      .sort({ dueDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rent payments', error: error.message });
  }
});

// Mark rent as paid
router.patch('/:id/paid', async (req, res) => {
  try {
    const payment = await RentPayment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Rent payment not found' });
    }

    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rent payment', error: error.message });
  }
});

// Send rent reminder
router.post('/:id/remind', async (req, res) => {
  try {
    const payment = await RentPayment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Rent payment not found' });
    }

    payment.remindersSent.push({
      type: payment.status === 'overdue' ? 'overdue' : 'reminder'
    });
    await payment.save();

    // Here you would typically send an actual notification
    // For now, we'll just return success
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reminder', error: error.message });
  }
});

// Get all rent payments for owner's properties
router.get('/owner', auth, authorize('owner'), async (req, res) => {
  try {
    const apartments = await Apartment.find({ owner: req.user._id });
    const apartmentIds = apartments.map(apt => apt._id);

    const payments = await RentPayment.find({
      apartment: { $in: apartmentIds }
    })
      .populate('apartment', 'apartmentId location')
      .populate('tenant', 'name email phone')
      .sort({ dueDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get tenant's rent payments
router.get('/tenant', auth, authorize('tenant'), async (req, res) => {
  try {
    const payments = await RentPayment.find({ tenant: req.user._id })
      .populate('apartment', 'apartmentId location')
      .sort({ dueDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update rent payment status (Owner only)
router.patch('/:id/status', auth, authorize('owner'), async (req, res) => {
  try {
    const { status, paymentDate, paymentMethod, referenceNumber } = req.body;
    const payment = await RentPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Rent payment not found' });
    }

    // Check if apartment belongs to owner
    const apartment = await Apartment.findOne({
      _id: payment.apartment,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(403).json({ message: 'Access denied' });
    }

    payment.status = status;
    if (status === 'paid') {
      payment.paymentDate = paymentDate || new Date();
      payment.paymentMethod = paymentMethod;
      payment.referenceNumber = referenceNumber;
    }

    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get overdue payments
router.get('/overdue', auth, authorize('owner'), async (req, res) => {
  try {
    const apartments = await Apartment.find({ owner: req.user._id });
    const apartmentIds = apartments.map(apt => apt._id);

    const overduePayments = await RentPayment.find({
      apartment: { $in: apartmentIds },
      status: 'overdue'
    })
      .populate('apartment', 'apartmentId location')
      .populate('tenant', 'name email phone')
      .sort({ dueDate: 1 });

    res.json(overduePayments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get upcoming payments
router.get('/upcoming', auth, authorize('owner'), async (req, res) => {
  try {
    const apartments = await Apartment.find({ owner: req.user._id });
    const apartmentIds = apartments.map(apt => apt._id);

    const upcomingPayments = await RentPayment.find({
      apartment: { $in: apartmentIds },
      status: 'pending',
      dueDate: { $gte: new Date() }
    })
      .populate('apartment', 'apartmentId location')
      .populate('tenant', 'name email phone')
      .sort({ dueDate: 1 });

    res.json(upcomingPayments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add reminder to payment
router.post('/:id/reminders', auth, authorize('owner'), async (req, res) => {
  try {
    const { type } = req.body;
    const payment = await RentPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Rent payment not found' });
    }

    // Check if apartment belongs to owner
    const apartment = await Apartment.findOne({
      _id: payment.apartment,
      owner: req.user._id
    });

    if (!apartment) {
      return res.status(403).json({ message: 'Access denied' });
    }

    payment.reminders.push({ type });
    await payment.save();

    res.json(payment.reminders[payment.reminders.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 