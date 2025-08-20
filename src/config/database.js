const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    port: process.env.DB_PORT || 3306,

    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,

    // Additional settings for better performance
    charset: 'utf8mb4',
    timezone: '+00:00',

    // Reconnection settings
    reconnect: true,
    idleTimeout: 300000,
    maxReconnects: 3
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection test successful');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return false;
    }
};

// Initialize database tables
const initializeDatabase = async () => {
    try {
        const connection = await pool.getConnection();

        // Create schools table if it doesn't exist
        const createSchoolsTable = `
            CREATE TABLE IF NOT EXISTS schools (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(500) NOT NULL,
                latitude FLOAT(10, 6) NOT NULL,
                longitude FLOAT(10, 6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_location (latitude, longitude),
                INDEX idx_name (name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.execute(createSchoolsTable);
        console.log('✅ Database tables initialized');

        connection.release();
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
};

// Initialize on module load
initializeDatabase().catch(console.error);

module.exports = pool;
