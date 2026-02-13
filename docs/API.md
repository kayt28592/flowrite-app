# 📚 Flowrite API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-api.railway.app/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b3c2d9e1a2b3c4d5e6f7",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7b3c2d9e1a2b3c4d5e6f7",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### GET /auth/me
Get current user profile (Protected).

**Headers:** Authorization: Bearer <token>

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f7b3c2d9e1a2b3c4d5e6f7",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-02-07T10:30:00.000Z"
  }
}
```

### Customers

#### GET /customers
Get all customers with pagination and search (Protected).

**Query Parameters:**
- `search` (optional): Search by name or email
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Example:** `/customers?search=ABC&page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "customers": [...],
  "total": 45,
  "page": 1,
  "totalPages": 5
}
```

#### GET /customers/:id
Get a single customer by ID (Protected).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f7b3c2d9e1a2b3c4d5e6f7",
    "name": "ABC Construction",
    "email": "contact@abc.com",
    "phone": "0412345678",
    "address": "123 Main St, Sydney NSW 2000"
  }
}
```

#### POST /customers
Create a new customer (Protected).

**Request Body:**
```json
{
  "name": "ABC Construction",
  "email": "contact@abc.com",
  "phone": "0412345678",
  "address": "123 Main St, Sydney NSW 2000"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

#### PUT /customers/:id
Update a customer (Protected).

#### DELETE /customers/:id
Delete a customer (Protected).

### Submissions

#### GET /submissions
Get all submissions with filters (Protected).

**Query Parameters:**
- `customer`: Filter by customer name
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `status`: Filter by status (pending, completed, cancelled)
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "success": true,
  "submissions": [...],
  "total": 120,
  "page": 1,
  "totalPages": 6
}
```

#### POST /submissions
Create a new submission (Protected).

**Request Body:**
```json
{
  "customer": "ABC Construction",
  "date": "2024-02-07",
  "time": "10:30",
  "address": "456 Site Ave, Sydney NSW",
  "order": "Concrete Mix A - 10m³",
  "amount": 12.5,
  "rego": "ABC123",
  "signature": "data:image/png;base64,iVBORw0KG..."
}
```

### Dockets

#### GET /dockets
Get all dockets (Protected).

**Query Parameters:**
- `customer`: Filter by customer name
- `page`: Page number
- `limit`: Items per page

#### GET /dockets/:id
Get a single docket with all submissions (Protected).

#### POST /dockets/generate
Generate a new docket from submissions (Protected).

**Request Body:**
```json
{
  "customer": "ABC Construction",
  "startDate": "2024-02-01",
  "endDate": "2024-02-07"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "docketNumber": "20240200001",
    "customer": "ABC Construction",
    "startDate": "2024-02-01",
    "endDate": "2024-02-07",
    "submissions": [...],
    "totalAmount": 125.5
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Get Customers (with token)
```bash
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Postman Collection

Import this collection to Postman for easy testing:
[Download Postman Collection](./postman_collection.json)
