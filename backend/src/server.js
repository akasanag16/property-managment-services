const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://property-managment-services.vercel.app',
  'https://property-managment-services-ku4pwapr5.vercel.app',
  'https://property-managment-services-git-main-akasanag-gitamins-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Pre-flight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize MongoDB connection
let isConnected = false;

const initializeMongoDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    await initializeMongoDB();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      error: error.message
    });
  }
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const apartmentRoutes = require('./routes/apartmentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const rentRoutes = require('./routes/rentRoutes');
const notificationsRouter = require('./routes/notifications');

// Routes with database connection
const withDB = (handler) => {
  return async (req, res, next) => {
    try {
      await initializeMongoDB();
      return handler(req, res, next);
    } catch (error) {
      console.error('Route error:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };
};

// Apply routes with database connection
app.use('/api/auth', (req, res, next) => withDB(authRoutes)(req, res, next));
app.use('/api/apartments', (req, res, next) => withDB(apartmentRoutes)(req, res, next));
app.use('/api/maintenance', (req, res, next) => withDB(maintenanceRoutes)(req, res, next));
app.use('/api/rent', (req, res, next) => withDB(rentRoutes)(req, res, next));
app.use('/api/notifications', (req, res, next) => withDB(notificationsRouter)(req, res, next));

// Basic route for testing
app.get('/api', async (req, res) => {
  try {
    await initializeMongoDB();
    res.json({ message: 'Welcome to Property Maintenance API', status: 'Connected' });
  } catch (error) {
    res.status(500).json({ message: 'API Error', error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Export the app for serverless use
module.exports = app; 