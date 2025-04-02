# Property Maintenance Application

A full-stack web application for managing property maintenance requests between owners, tenants, and service providers.

## Features

### For Property Owners
- Manage multiple properties
- View maintenance requests
- Track rent payments
- Assign service providers
- Communication with tenants and service providers

### For Tenants
- Submit maintenance requests
- Track request status
- Pay rent
- View apartment details
- Communication with owners and service providers

### For Service Providers
- View work orders
- Update job status
- Track active and completed jobs
- Upload completion photos
- Communication with owners and tenants

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/property-maintenance
   JWT_SECRET=your-secret-key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Access the application at http://localhost:5173

## Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## User Types and Access

### Owner
- Full access to property management
- Can view all maintenance requests
- Can manage rent payments
- Can assign service providers

### Tenant
- Can submit maintenance requests
- Can view their apartment details
- Can make rent payments
- Limited to their own data

### Service Provider
- Can view assigned work orders
- Can update job status
- Can upload completion photos
- Limited to assigned jobs

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Apartments
- GET /api/apartments
- POST /api/apartments
- PUT /api/apartments/:id
- DELETE /api/apartments/:id

### Maintenance
- GET /api/maintenance
- POST /api/maintenance
- PATCH /api/maintenance/:id/status
- POST /api/maintenance/:id/messages

### Rent
- GET /api/rent
- POST /api/rent
- PATCH /api/rent/:id/status

## Security Features
- JWT Authentication
- Password Hashing
- Role-based Access Control
- Input Validation
- Error Handling

## Development Notes
- Use environment variables for sensitive data
- Follow REST API best practices
- Implement proper error handling
- Maintain code consistency
- Document API changes

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License. 