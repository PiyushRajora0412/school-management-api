# Testing Guide for School Management API

## Overview

This guide covers testing strategies and procedures for the School Management API, including unit tests, integration tests, and API testing.

## Testing Tools

- **Jest**: Unit and integration testing framework
- **Supertest**: HTTP assertion library for API testing
- **Postman**: Manual API testing and collection sharing
- **Artillery**: Load testing
- **ESLint**: Code quality and style checking

## Setup Testing Environment

### Install Testing Dependencies
```bash
npm install --save-dev jest supertest artillery eslint
```

### Configure Jest
Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/config/**"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"]
  }
}
```

## Unit Tests

### Distance Calculator Tests
Create `src/utils/__tests__/distanceCalculator.test.js`:

```javascript
const { calculateDistance, isValidCoordinates } = require('../distanceCalculator');

describe('Distance Calculator', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between NYC and LA correctly', () => {
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3944.42, 1); // ~3944 km
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    test('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('isValidCoordinates', () => {
    test('should validate correct coordinates', () => {
      expect(isValidCoordinates(40.7128, -74.0060)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(-90, -180)).toBe(true);
      expect(isValidCoordinates(90, 180)).toBe(true);
    });

    test('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(-91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(0, -181)).toBe(false);
      expect(isValidCoordinates('invalid', 0)).toBe(false);
    });
  });
});
```

### Service Tests
Create `src/services/__tests__/schoolService.test.js`:

```javascript
const schoolService = require('../schoolService');
const schoolRepository = require('../../repositories/schoolRepository');

// Mock the repository
jest.mock('../../repositories/schoolRepository');

describe('School Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSchool', () => {
    test('should add school successfully', async () => {
      const schoolData = {
        name: 'Test School',
        address: 'Test Address',
        latitude: 40.7128,
        longitude: -74.0060
      };

      schoolRepository.findSchoolByLocation.mockResolvedValue(null);
      schoolRepository.createSchool.mockResolvedValue(1);

      const result = await schoolService.addSchool(schoolData);

      expect(result).toEqual({
        id: 1,
        ...schoolData
      });
      expect(schoolRepository.createSchool).toHaveBeenCalledWith(schoolData);
    });

    test('should throw error for duplicate location', async () => {
      const schoolData = {
        name: 'Test School',
        address: 'Test Address',
        latitude: 40.7128,
        longitude: -74.0060
      };

      schoolRepository.findSchoolByLocation.mockResolvedValue({ id: 1 });

      await expect(schoolService.addSchool(schoolData))
        .rejects.toThrow('A school already exists at this location');
    });

    test('should throw error for invalid coordinates', async () => {
      const schoolData = {
        name: 'Test School',
        address: 'Test Address',
        latitude: 91,
        longitude: -74.0060
      };

      await expect(schoolService.addSchool(schoolData))
        .rejects.toThrow('Invalid coordinates provided');
    });
  });

  describe('getSchoolsSortedByDistance', () => {
    test('should return schools sorted by distance', async () => {
      const mockSchools = [
        { id: 1, name: 'Far School', latitude: 35.0, longitude: -119.0 },
        { id: 2, name: 'Near School', latitude: 40.7, longitude: -74.0 }
      ];

      schoolRepository.getAllSchools.mockResolvedValue(mockSchools);

      const result = await schoolService.getSchoolsSortedByDistance({
        latitude: 40.7128,
        longitude: -74.0060
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Near School');
      expect(result[1].name).toBe('Far School');
      expect(result[0].distance).toBeLessThan(result[1].distance);
    });
  });
});
```

## Integration Tests

### API Integration Tests
Create `src/__tests__/api.test.js`:

```javascript
const request = require('supertest');
const app = require('../../server');

describe('School Management API', () => {
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Server is running');
    });
  });

  describe('POST /addSchool', () => {
    test('should add school successfully', async () => {
      const schoolData = {
        name: 'Integration Test School',
        address: '123 Test Street, Test City, TC 12345',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const response = await request(app)
        .post('/addSchool')
        .send(schoolData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(schoolData);
      expect(response.body.data).toHaveProperty('id');
    });

    test('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        address: '123', // Too short
        latitude: 91, // Invalid
        longitude: -181 // Invalid
      };

      const response = await request(app)
        .post('/addSchool')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });
  });

  describe('GET /listSchools', () => {
    test('should list schools sorted by distance', async () => {
      const response = await request(app)
        .get('/listSchools')
        .query({ latitude: 40.7128, longitude: -74.0060 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 1) {
        // Check if sorted by distance
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].distance)
            .toBeLessThanOrEqual(response.body.data[i + 1].distance);
        }
      }
    });

    test('should return validation error for missing parameters', async () => {
      const response = await request(app)
        .get('/listSchools')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return validation error for invalid coordinates', async () => {
      const response = await request(app)
        .get('/listSchools')
        .query({ latitude: 91, longitude: -181 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /invalid-endpoint', () => {
    test('should return 404 for invalid endpoints', async () => {
      const response = await request(app)
        .get('/invalid-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('availableEndpoints');
    });
  });
});
```

## Database Tests

### Database Integration Tests
Create `src/repositories/__tests__/schoolRepository.test.js`:

```javascript
const schoolRepository = require('../schoolRepository');
const db = require('../../config/database');

describe('School Repository', () => {
  beforeAll(async () => {
    // Setup test database
    await db.execute('DELETE FROM schools WHERE name LIKE "Test%"');
  });

  afterAll(async () => {
    // Cleanup test data
    await db.execute('DELETE FROM schools WHERE name LIKE "Test%"');
    await db.end();
  });

  describe('createSchool', () => {
    test('should create school successfully', async () => {
      const schoolData = {
        name: 'Test Repository School',
        address: 'Test Address for Repository',
        latitude: 40.7128,
        longitude: -74.0060
      };

      const schoolId = await schoolRepository.createSchool(schoolData);

      expect(schoolId).toBeGreaterThan(0);

      // Verify school was created
      const school = await schoolRepository.findSchoolById(schoolId);
      expect(school).toMatchObject(schoolData);
    });
  });

  describe('getAllSchools', () => {
    test('should retrieve all schools', async () => {
      const schools = await schoolRepository.getAllSchools();

      expect(schools).toBeInstanceOf(Array);
      expect(schools.length).toBeGreaterThan(0);

      if (schools.length > 0) {
        expect(schools[0]).toHaveProperty('id');
        expect(schools[0]).toHaveProperty('name');
        expect(schools[0]).toHaveProperty('address');
        expect(schools[0]).toHaveProperty('latitude');
        expect(schools[0]).toHaveProperty('longitude');
      }
    });
  });

  describe('findSchoolByLocation', () => {
    test('should find school by exact location', async () => {
      // First create a school
      const schoolData = {
        name: 'Test Location School',
        address: 'Test Location Address',
        latitude: 41.0000,
        longitude: -75.0000
      };

      const schoolId = await schoolRepository.createSchool(schoolData);

      // Then find it by location
      const foundSchool = await schoolRepository.findSchoolByLocation(
        schoolData.latitude, 
        schoolData.longitude
      );

      expect(foundSchool).not.toBeNull();
      expect(foundSchool.id).toBe(schoolId);
    });

    test('should return null for non-existent location', async () => {
      const school = await schoolRepository.findSchoolByLocation(99.9999, 99.9999);
      expect(school).toBeNull();
    });
  });
});
```

## Load Testing

### Artillery Configuration
Create `load-test.yml`:

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
  payload:
    path: "test-data.csv"
    fields:
      - "name"
      - "address"
      - "latitude"
      - "longitude"

scenarios:
  - name: "Health Check"
    weight: 20
    flow:
      - get:
          url: "/health"

  - name: "Add School"
    weight: 30
    flow:
      - post:
          url: "/addSchool"
          json:
            name: "{{ name }}"
            address: "{{ address }}"
            latitude: "{{ latitude }}"
            longitude: "{{ longitude }}"

  - name: "List Schools"
    weight: 50
    flow:
      - get:
          url: "/listSchools"
          qs:
            latitude: "40.7128"
            longitude: "-74.0060"
```

Create `test-data.csv`:
```csv
name,address,latitude,longitude
Load Test School 1,123 Test St,40.7128,-74.0060
Load Test School 2,456 Test Ave,34.0522,-118.2437
Load Test School 3,789 Test Blvd,41.8781,-87.6298
```

### Run Load Tests
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## Manual Testing with Postman

### Test Cases Checklist

#### Add School API
- ✅ Valid school data
- ✅ Empty name field
- ✅ Name too short (< 2 chars)
- ✅ Name too long (> 255 chars)
- ✅ Invalid characters in name
- ✅ Empty address field
- ✅ Address too short (< 5 chars)
- ✅ Address too long (> 500 chars)
- ✅ Missing latitude
- ✅ Invalid latitude (> 90)
- ✅ Invalid latitude (< -90)
- ✅ Non-numeric latitude
- ✅ Missing longitude
- ✅ Invalid longitude (> 180)
- ✅ Invalid longitude (< -180)
- ✅ Non-numeric longitude
- ✅ Duplicate school location

#### List Schools API
- ✅ Valid coordinates
- ✅ Missing latitude parameter
- ✅ Missing longitude parameter
- ✅ Invalid latitude (> 90)
- ✅ Invalid latitude (< -90)
- ✅ Invalid longitude (> 180)
- ✅ Invalid longitude (< -180)
- ✅ Non-numeric coordinates
- ✅ Empty database
- ✅ Multiple schools sorting

#### General API Tests
- ✅ Health check endpoint
- ✅ Invalid endpoint (404)
- ✅ CORS headers
- ✅ Content-Type validation
- ✅ Large request body
- ✅ Malformed JSON

## Test Data

### Sample Valid Schools
```json
[
  {
    "name": "Central High School",
    "address": "123 Main Street, Downtown, City, State 12345",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  {
    "name": "Westside Elementary",
    "address": "456 Oak Avenue, Westside, City, State 12346",
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  {
    "name": "North Valley Academy",
    "address": "789 Pine Road, North Valley, City, State 12347",
    "latitude": 41.8781,
    "longitude": -87.6298
  }
]
```

### Edge Cases
```json
[
  {
    "name": "A",
    "address": "1234",
    "latitude": 91,
    "longitude": -181
  },
  {
    "name": "",
    "address": "",
    "latitude": "invalid",
    "longitude": "invalid"
  },
  {
    "name": "School at North Pole",
    "address": "North Pole",
    "latitude": 90,
    "longitude": 0
  },
  {
    "name": "School at South Pole",
    "address": "South Pole",
    "latitude": -90,
    "longitude": 0
  }
]
```

## Continuous Integration

### GitHub Actions
Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: school_management_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Setup test database
      run: |
        mysql -h 127.0.0.1 -u root -ppassword school_management_test < database/schema.sql

    - name: Run tests
      run: npm test
      env:
        NODE_ENV: test
        DB_HOST: 127.0.0.1
        DB_USER: root
        DB_PASSWORD: password
        DB_NAME: school_management_test

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v1
```

## Test Reports

### Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Performance Benchmarks
Track these metrics:
- API response time (< 100ms for health, < 500ms for others)
- Database query time (< 50ms)
- Memory usage (< 100MB base)
- Concurrent users (handle 100+ simultaneous requests)

## Best Practices

### Writing Tests
1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies** properly
4. **Test edge cases** and error conditions
5. **Keep tests independent** - no test should depend on another

### Test Organization
1. **Group related tests** using `describe` blocks
2. **Use setup/teardown** functions for common operations
3. **Separate unit and integration tests**
4. **Use meaningful assertions** with specific expectations

### Continuous Testing
1. **Run tests on every commit**
2. **Maintain high test coverage** (aim for 80%+)
3. **Fix failing tests immediately**
4. **Review test results** in CI/CD pipeline

Remember: Good tests are your safety net when making changes and help ensure your API works correctly for all users.
