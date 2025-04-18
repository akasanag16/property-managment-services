const app = require('./server');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
const startServer = async () => {
  try {
    console.log('Starting server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await connectDB();
    console.log('MongoDB connection successful');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`Server is accessible at http://localhost:${PORT}`);
      console.log('API endpoints are ready to accept requests');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

startServer(); 