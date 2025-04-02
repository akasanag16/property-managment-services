# Property Maintenance Application Backend

This is the backend server for the Property Maintenance Application. It provides RESTful APIs for user management, property management, and maintenance request handling.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-maintenance
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/me - Get current user profile
- PATCH /api/users/me - Update user profile

## Project Structure

```
backend/
├── src/
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── server.js       # Main application file
├── .env                # Environment variables
└── package.json        # Project dependencies
```

## Development

To start the development server with hot reload:
```bash
npm run dev
```

## Testing

To run tests:
```bash
npm test
```

## Production

For production deployment:
1. Update the `.env` file with production values
2. Build and start the server:
```bash
npm start
``` 