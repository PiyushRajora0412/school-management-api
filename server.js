const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const schoolRoutes = require('./src/routes/schoolRoutes');

// Import database connection
const db = require('./src/config/database');

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/', schoolRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'POST /addSchool',
            'GET /listSchools?latitude=<lat>&longitude=<lng>',
            'GET /health'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error Handler:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
const PORT = process.env.PORT || 3000;

// Test database connection before starting server
db.getConnection()
    .then(connection => {
        connection.release();
        console.log('✅ Database connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        });
    })
    .catch(error => {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    });

module.exports = app;
