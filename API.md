# Property Management System API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: Your production URL

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "tenant"
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

## Apartment Endpoints

### Get All Apartments
- **GET** `/api/apartments`
- **Headers:** `Authorization: Bearer {token}`

### Get Single Apartment
- **GET** `/api/apartments/:id`
- **Headers:** `Authorization: Bearer {token}`

### Create Apartment
- **POST** `/api/apartments`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "number": "A101",
    "floor": 1,
    "building": "A",
    "rent": 1000,
    "status": "available"
  }
  ```

## Maintenance Endpoints

### Create Maintenance Request
- **POST** `/api/maintenance`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "apartmentId": "apartment_id",
    "description": "Issue description",
    "priority": "high"
  }
  ```

### Get Maintenance Requests
- **GET** `/api/maintenance`
- **Headers:** `Authorization: Bearer {token}`

## Rent Endpoints

### Create Rent Payment
- **POST** `/api/rent`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "apartmentId": "apartment_id",
    "amount": 1000,
    "paymentDate": "2024-02-01"
  }
  ```

### Get Rent History
- **GET** `/api/rent/history/:apartmentId`
- **Headers:** `Authorization: Bearer {token}`

## Notifications Endpoints

### Get User Notifications
- **GET** `/api/notifications`
- **Headers:** `Authorization: Bearer {token}`

### Mark Notification as Read
- **PATCH** `/api/notifications/:id`
- **Headers:** `Authorization: Bearer {token}`

## Error Responses

### Authentication Errors
```json
{
  "status": "error",
  "message": "Invalid token"
}
```

### Validation Errors
```json
{
  "status": "error",
  "message": "Validation Error",
  "details": "Error details here"
}
```

### Server Errors
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting
- 100 requests per IP per 15 minutes

## Notes
- All protected routes require a valid JWT token in the Authorization header
- Dates should be in ISO 8601 format
- All responses are in JSON format 