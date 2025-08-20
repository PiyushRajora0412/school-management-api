# 🚀 Quick Setup Guide - School Management API

**Get the API running in under 5 minutes!**

## Option 1: Docker Setup (Recommended) 🐳

**Prerequisites:** Docker and Docker Compose installed

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd school-management-api

# 2. Start everything with Docker
docker-compose -f deployment/docker-compose.yml up -d

# 3. Wait for services to start (30-60 seconds)
docker-compose -f deployment/docker-compose.yml logs -f

# 4. Test the API
curl http://localhost:3000/health
```

**✅ Done! API is running at http://localhost:3000**

## Option 2: Manual Setup 🛠️

**Prerequisites:** Node.js 18+, MySQL 8.0+

```bash
# 1. Clone and install
git clone <your-repository-url>
cd school-management-api
npm install

# 2. Setup database
mysql -u root -p
CREATE DATABASE school_management;
EXIT;

mysql -u root -p school_management < database/schema.sql
mysql -u root -p school_management < database/sample_data.sql

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Start the server
npm start
```

**✅ Done! API is running at http://localhost:3000**

## 🧪 Quick Test

### Test with Postman
1. Import `School_Management_API.postman_collection.json`
2. Import `School_Management_API_Local.postman_environment.json`
3. Run the collection tests

### Test with cURL
```bash
# Add a school
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Test School",
    "address": "123 Test Street, Test City",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'

# List schools by proximity
curl "http://localhost:3000/listSchools?latitude=40.7128&longitude=-74.0060"
```

## 🌐 Deploy to Cloud

### Heroku (Free Tier)
```bash
heroku create your-school-api
heroku addons:create cleardb:ignite
git push heroku main
```

### DigitalOcean ($5/month)
```bash
# Create droplet, then:
git clone <your-repo>
cd school-management-api
npm install --production
pm2 start server.js
```

## 📞 Need Help?

- **Documentation:** Check `docs/` folder
- **Issues:** Common problems in `docs/TROUBLESHOOTING.md`
- **API Reference:** `docs/API_DOCUMENTATION.md`

**🎉 You're all set! The API is ready to use!**
