const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/authRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const rentRoutes = require('./routes/rentRoutes');
const notificationsRouter = require('./routes/notifications');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property-maintenance');
    console.log('Connected to MongoDB');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/apartments', apartmentRoutes);
    app.use('/api/maintenance', maintenanceRoutes);
    app.use('/api/rent', rentRoutes);
    app.use('/api/notifications', notificationsRouter);

    // Basic route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Property Maintenance API' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
        app.listen(PORT + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

startServer(); 