# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Issues

#### Symptom
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'username'@'localhost'
```

#### Solutions
1. **Check Database Credentials**
   ```bash
   # Verify .env file
   cat .env | grep DB_

   # Test MySQL connection manually
   mysql -h localhost -u your_user -p your_database
   ```

2. **Create MySQL User**
   ```sql
   CREATE USER 'schooluser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON school_management.* TO 'schooluser'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Check MySQL Service**
   ```bash
   # Check if MySQL is running
   sudo systemctl status mysql

   # Start MySQL if stopped
   sudo systemctl start mysql
   ```

#### Symptom
```
Error: ER_BAD_DB_ERROR: Unknown database 'school_management'
```

#### Solution
```sql
-- Create the database
CREATE DATABASE school_management;

-- Run schema
USE school_management;
SOURCE database/schema.sql;
```

### 2. Port Already in Use

#### Symptom
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solutions
1. **Find and Kill Process**
   ```bash
   # Find process using port 3000
   lsof -i :3000

   # Kill the process (replace PID with actual process ID)
   kill -9 PID
   ```

2. **Use Different Port**
   ```bash
   # In .env file
   PORT=3001
   ```

### 3. Module Not Found Errors

#### Symptom
```
Error: Cannot find module 'express'
```

#### Solutions
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Clear npm Cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node Version**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

### 4. Validation Errors

#### Symptom
API returns 400 with validation errors

#### Solutions
1. **Check Request Format**
   ```json
   // Correct format for addSchool
   {
     "name": "School Name",
     "address": "Full Address",
     "latitude": 40.7128,
     "longitude": -74.0060
   }
   ```

2. **Verify Data Types**
   - Name: String (2-255 chars)
   - Address: String (5-500 chars)
   - Latitude: Number (-90 to 90)
   - Longitude: Number (-180 to 180)

3. **Check Query Parameters**
   ```
   GET /listSchools?latitude=40.7128&longitude=-74.0060
   ```

### 5. Empty Response from listSchools

#### Symptom
API returns empty array for schools

#### Solutions
1. **Check if Schools Exist**
   ```sql
   SELECT COUNT(*) FROM schools;
   ```

2. **Add Sample Data**
   ```sql
   SOURCE database/sample_data.sql;
   ```

3. **Verify Coordinates**
   Ensure latitude/longitude parameters are valid numbers.

### 6. High Memory Usage

#### Symptom
Application crashes with memory errors

#### Solutions
1. **Monitor Memory Usage**
   ```bash
   # If using PM2
   pm2 monit

   # System memory
   free -h
   htop
   ```

2. **Optimize Database Connections**
   ```javascript
   // In database.js, reduce connection pool size
   connectionLimit: 5  // Instead of 10
   ```

3. **Add Memory Limits**
   ```bash
   # Start with memory limit
   node --max-old-space-size=512 server.js
   ```

### 7. Slow API Response

#### Symptom
API takes long time to respond

#### Solutions
1. **Add Database Indexes**
   ```sql
   ALTER TABLE schools ADD INDEX idx_location (latitude, longitude);
   ```

2. **Enable MySQL Query Cache**
   ```sql
   SET GLOBAL query_cache_size = 67108864;  -- 64MB
   SET GLOBAL query_cache_type = 1;
   ```

3. **Monitor Slow Queries**
   ```sql
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

### 8. CORS Issues

#### Symptom
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:3001' has been blocked by CORS policy
```

#### Solutions
1. **Update CORS Configuration**
   ```javascript
   // In server.js
   app.use(cors({
     origin: ['http://localhost:3001', 'https://yourdomain.com'],
     credentials: true
   }));
   ```

2. **Allow All Origins (Development Only)**
   ```javascript
   app.use(cors()); // Allows all origins
   ```

### 9. Environment Variables Not Loading

#### Symptom
```
Error: Environment variable DB_HOST is undefined
```

#### Solutions
1. **Check .env File**
   ```bash
   # Verify file exists and has correct format
   cat .env
   ```

2. **Verify dotenv Loading**
   ```javascript
   // At top of server.js
   require('dotenv').config();
   console.log('DB_HOST:', process.env.DB_HOST);
   ```

3. **Check File Location**
   ```bash
   # .env should be in project root
   ls -la | grep .env
   ```

### 10. Distance Calculation Issues

#### Symptom
Incorrect distances returned

#### Solutions
1. **Verify Coordinate Format**
   - Use decimal degrees (not degrees/minutes/seconds)
   - Latitude: -90 to 90
   - Longitude: -180 to 180

2. **Check Haversine Implementation**
   ```javascript
   // Test with known coordinates
   const distance = calculateDistance(40.7128, -74.0060, 40.7614, -73.9776);
   console.log('Distance NYC to Central Park:', distance); // Should be ~8.4 km
   ```

## Debugging Steps

### 1. Enable Debug Logging
```javascript
// Add to server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body, req.query);
    next();
  });
}
```

### 2. Check Database Connection
```javascript
// Add test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3. Monitor Application Logs
```bash
# If using PM2
pm2 logs school-api --lines 100

# If running directly
node server.js 2>&1 | tee app.log
```

### 4. Test with Curl
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test add school
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{"name":"Test School","address":"Test Address","latitude":40.7128,"longitude":-74.0060}'

# Test list schools
curl "http://localhost:3000/listSchools?latitude=40.7128&longitude=-74.0060"
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Add more indexes if needed
ALTER TABLE schools ADD INDEX idx_name (name);
ALTER TABLE schools ADD INDEX idx_created_at (created_at);

-- Analyze table
ANALYZE TABLE schools;

-- Check query execution plan
EXPLAIN SELECT * FROM schools ORDER BY created_at DESC;
```

### 2. Connection Pool Tuning
```javascript
// In database.js
const dbConfig = {
  // ... other config
  connectionLimit: 10,        // Adjust based on concurrent users
  acquireTimeout: 60000,      // 60 seconds
  timeout: 60000,             // 60 seconds
  reconnect: true,
  idleTimeout: 300000,        // 5 minutes
  maxReconnects: 3
};
```

### 3. Add Caching (Redis)
```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache school list for 5 minutes
app.get('/listSchools', async (req, res) => {
  const cacheKey = `schools:${req.query.latitude}:${req.query.longitude}`;

  try {
    const cached = await client.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ... normal processing
    const result = await schoolService.getSchoolsSortedByDistance(userLocation);

    // Cache for 5 minutes
    await client.setex(cacheKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    // ... error handling
  }
});
```

## Getting Help

### 1. Check Logs First
Always check application and database logs for specific error messages.

### 2. Verify Configuration
Double-check environment variables and database settings.

### 3. Test Components Separately
- Test database connection separately
- Test API endpoints individually
- Verify input data format

### 4. Use Development Tools
- Postman for API testing
- MySQL Workbench for database queries
- Browser DevTools for frontend issues

### 5. Common File Locations
```
Logs:
- PM2: ~/.pm2/logs/
- System: /var/log/
- Application: ./logs/ (if configured)

Configuration:
- Environment: ./.env
- Database: ./src/config/database.js
- Server: ./server.js

Database:
- Schema: ./database/schema.sql
- Sample Data: ./database/sample_data.sql
```

Remember: Most issues are related to configuration, database connectivity, or input validation. Start with these areas when troubleshooting.
