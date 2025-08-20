# School Management API Documentation

## Overview

The School Management API provides endpoints for managing school data with geolocation features. It allows you to add new schools and retrieve schools sorted by proximity to a user's location.

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`

## Authentication

Currently, no authentication is required. For production use, consider implementing API keys or OAuth.

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production use.

## Content Type

All requests that send data should use `application/json` content type.

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object|array,
  "errors": array (only for validation errors)
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Endpoints

### 1. Health Check

Check if the API is running.

#### Request
```
GET /health
```

#### Response
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2023-12-01T10:30:00.000Z",
  "environment": "development"
}
```

### 2. Add School

Add a new school to the database.

#### Request
```
POST /addSchool
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "string (required, 2-255 chars)",
  "address": "string (required, 5-500 chars)",
  "latitude": "number (required, -90 to 90)",
  "longitude": "number (required, -180 to 180)"
}
```

#### Example Request
```json
{
  "name": "Green Valley High School",
  "address": "123 Education Street, Green Valley, CA 91390",
  "latitude": 34.4208,
  "longitude": -118.5739
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Green Valley High School",
    "address": "123 Education Street, Green Valley, CA 91390",
    "latitude": 34.4208,
    "longitude": -118.5739
  }
}
```

#### Validation Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "School name is required",
      "path": "name",
      "location": "body"
    }
  ]
}
```

#### Duplicate Error Response (409)
```json
{
  "success": false,
  "message": "A school already exists at this location"
}
```

### 3. List Schools

Retrieve all schools sorted by distance from user's location.

#### Request
```
GET /listSchools?latitude={lat}&longitude={lng}
```

#### Query Parameters
- `latitude` (required): User's latitude (-90 to 90)
- `longitude` (required): User's longitude (-180 to 180)

#### Example Request
```
GET /listSchools?latitude=34.0522&longitude=-118.2437
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Schools retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Sunshine Elementary School",
      "address": "456 Sunshine Boulevard, Los Angeles, CA 90210",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "distance": 0.0,
      "created_at": "2023-12-01T10:30:00.000Z",
      "updated_at": "2023-12-01T10:30:00.000Z"
    },
    {
      "id": 1,
      "name": "Green Valley High School",
      "address": "123 Education Street, Green Valley, CA 91390",
      "latitude": 34.4208,
      "longitude": -118.5739,
      "distance": 45.2,
      "created_at": "2023-12-01T10:25:00.000Z",
      "updated_at": "2023-12-01T10:25:00.000Z"
    }
  ],
  "count": 2
}
```

#### Validation Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "91",
      "msg": "Latitude must be a valid number between -90 and 90",
      "path": "latitude",
      "location": "query"
    }
  ]
}
```

## Data Models

### School Model
```json
{
  "id": "integer (auto-generated)",
  "name": "string (2-255 characters)",
  "address": "string (5-500 characters)",
  "latitude": "float (-90 to 90)",
  "longitude": "float (-180 to 180)",
  "distance": "float (calculated, in kilometers)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Distance Calculation

The API uses the Haversine formula to calculate the great-circle distance between two points on Earth. The distance is returned in kilometers, rounded to 2 decimal places.

### Haversine Formula
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## Validation Rules

### School Name
- Required
- 2-255 characters
- Alphanumeric, spaces, hyphens, dots, commas, apostrophes, parentheses, and ampersands allowed

### Address
- Required
- 5-500 characters
- Any characters allowed

### Latitude
- Required
- Float between -90 and 90
- Must be a valid number

### Longitude
- Required
- Float between -180 and 180
- Must be a valid number

## Example Usage with cURL

### Add a School
```bash
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Academy",
    "address": "456 Innovation Drive, Silicon Valley, CA 94000",
    "latitude": 37.4419,
    "longitude": -122.1430
  }'
```

### List Schools
```bash
curl -X GET "http://localhost:3000/listSchools?latitude=37.4419&longitude=-122.1430"
```

## SDKs and Client Libraries

Currently, no official SDKs are available. The API can be consumed using any HTTP client library in your preferred programming language.

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

// Add school
async function addSchool(schoolData) {
  try {
    const response = await axios.post('http://localhost:3000/addSchool', schoolData);
    return response.data;
  } catch (error) {
    console.error('Error adding school:', error.response.data);
  }
}

// List schools
async function listSchools(latitude, longitude) {
  try {
    const response = await axios.get(`http://localhost:3000/listSchools`, {
      params: { latitude, longitude }
    });
    return response.data;
  } catch (error) {
    console.error('Error listing schools:', error.response.data);
  }
}
```

### Python Example
```python
import requests

# Add school
def add_school(school_data):
    try:
        response = requests.post('http://localhost:3000/addSchool', json=school_data)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error adding school: {e}")

# List schools
def list_schools(latitude, longitude):
    try:
        response = requests.get('http://localhost:3000/listSchools', 
                              params={'latitude': latitude, 'longitude': longitude})
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error listing schools: {e}")
```

## Testing

### Postman Collection
Import the provided Postman collection for easy testing:
- `School_Management_API.postman_collection.json`
- `School_Management_API_Local.postman_environment.json`

### Unit Tests
Run the test suite:
```bash
npm test
```

## Changelog

### Version 1.0.0
- Initial release
- Add school endpoint
- List schools endpoint
- Distance calculation using Haversine formula
- Input validation
- Error handling

## Support

For API support:
- Check the logs for error details
- Verify your request format matches the documentation
- Ensure all required parameters are provided
- Contact support if issues persist

## Future Enhancements

Planned features for future versions:
- Authentication and authorization
- Rate limiting
- School update and delete endpoints
- Advanced filtering and search
- Pagination for large datasets
- Real-time updates with WebSockets
- Caching for improved performance
- API versioning
