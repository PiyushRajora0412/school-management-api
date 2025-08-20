# Deployment Guide for School Management API

This guide covers various deployment options for the School Management API.

## Quick Start with Docker

The fastest way to deploy the application is using Docker Compose:

```bash
# Clone the repository
git clone <your-repo-url>
cd school-management-api

# Start with Docker Compose
docker-compose -f deployment/docker-compose.yml up -d

# Check if services are running
docker-compose -f deployment/docker-compose.yml ps

# View logs
docker-compose -f deployment/docker-compose.yml logs -f app
```

The API will be available at `http://localhost:3000`

## Manual Setup

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Git

### Steps

1. **Clone and Setup**
```bash
git clone <your-repo-url>
cd school-management-api
npm install
```

2. **Database Setup**
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql

# Optional: Add sample data
source database/sample_data.sql
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start the Application**
```bash
# Development
npm run dev

# Production
npm start
```

## Cloud Deployment Options

### 1. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository

#### Steps
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-school-api

# Add MySQL addon
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=your-db-name

# Deploy
git push heroku main

# Run database migrations
heroku run npm run db:setup
```

#### Heroku-specific files needed:
Create `Procfile`:
```
web: npm start
```

### 2. DigitalOcean Droplet

#### Create Droplet
1. Create Ubuntu 22.04 droplet (minimum 1GB RAM)
2. Add SSH key for secure access

#### Setup Script
```bash
#!/bin/bash
# DigitalOcean deployment script

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone <your-repo-url> /var/www/school-api
cd /var/www/school-api

# Install dependencies
npm install --production

# Setup database
mysql -u root -p < database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env file with your settings

# Start with PM2
pm2 start server.js --name "school-api"
pm2 startup
pm2 save

# Setup nginx (optional)
sudo apt install nginx -y
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/school-api`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/school-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. AWS EC2 Deployment

#### Launch EC2 Instance
1. Choose Amazon Linux 2 AMI
2. Select t2.micro (free tier)
3. Configure security group (ports 22, 80, 3000)

#### Setup Commands
```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install MySQL
sudo yum update -y
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Clone and setup application
git clone <your-repo-url>
cd school-management-api
npm install --production

# Setup database and environment
mysql -u root -p < database/schema.sql
cp .env.example .env
# Edit .env file

# Install PM2 and start
npm install -g pm2
pm2 start server.js --name school-api
pm2 startup
pm2 save
```

### 4. Google Cloud Platform

#### Using Cloud Run
```bash
# Install gcloud CLI
# Authenticate
gcloud auth login

# Set project
gcloud config set project your-project-id

# Build and deploy
gcloud run deploy school-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Using Compute Engine
Similar to AWS EC2 setup but use `gcloud` commands for instance management.

## Database Hosting Options

### 1. PlanetScale (Recommended)
- Serverless MySQL platform
- Generous free tier
- Built-in connection pooling
- Easy scaling

Setup:
```bash
# Install PlanetScale CLI
# Create database
pscale database create school-management

# Get connection string
pscale password create school-management main pscale_pw_name

# Update .env with connection details
```

### 2. AWS RDS
```bash
# Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier school-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

### 3. DigitalOcean Managed Database
- Create through DigitalOcean dashboard
- Copy connection details to .env

## Environment Variables for Production

Required environment variables:
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=school_management
DB_PORT=3306
```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs school-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart school-api
```

### Log Rotation
```bash
pm2 install pm2-logrotate
```

## Performance Optimization

### 1. Enable GZIP Compression
Add to nginx config:
```nginx
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

### 2. Database Optimization
- Add proper indexes
- Use connection pooling
- Enable query caching

### 3. Application Optimization
- Use clustering
- Implement caching
- Optimize queries

## Backup Strategy

### Database Backup
```bash
# Create backup
mysqldump -u user -p school_management > backup.sql

# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mysqldump -u user -p school_management > /backups/school_db_$DATE.sql
```

### Application Backup
- Code: Git repository
- Environment: Secure storage for .env
- Database: Regular MySQL dumps

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple application instances
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Monitor performance metrics

## Security Checklist

✅ Use HTTPS in production
✅ Secure database credentials
✅ Enable firewall rules
✅ Regular security updates
✅ Input validation and sanitization
✅ Rate limiting
✅ Database connection encryption
✅ Regular backups
✅ Monitor logs for suspicious activity

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check credentials in .env
   - Verify database server is running
   - Check firewall rules

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 PID
   ```

3. **Memory Issues**
   - Monitor with `pm2 monit`
   - Increase server memory
   - Optimize database queries

4. **High CPU Usage**
   - Check for inefficient queries
   - Monitor with `htop`
   - Consider load balancing

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review server resources

Happy deploying! 🚀
