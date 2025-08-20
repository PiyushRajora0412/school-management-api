-- School Management Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS school_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE school_management;

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude FLOAT(10, 6) NOT NULL,
    longitude FLOAT(10, 6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for better performance
    INDEX idx_location (latitude, longitude),
    INDEX idx_name (name),
    INDEX idx_created_at (created_at),

    -- Unique constraint to prevent duplicate schools at exact same location
    UNIQUE KEY unique_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT INTO schools (name, address, latitude, longitude) VALUES
    ('Central High School', '123 Main Street, Downtown, City, State 12345', 40.7128, -74.0060),
    ('Westside Elementary', '456 Oak Avenue, Westside, City, State 12346', 40.7580, -73.9855),
    ('North Valley Academy', '789 Pine Road, North Valley, City, State 12347', 40.7831, -73.9712),
    ('Eastmont Middle School', '321 Elm Street, Eastmont, City, State 12348', 40.7489, -73.9680),
    ('Southpark High School', '654 Maple Drive, Southpark, City, State 12349', 40.6892, -74.0445);

-- Create indexes for spatial queries if needed (MySQL 5.7+)
-- ALTER TABLE schools ADD SPATIAL INDEX spatial_location (POINT(latitude, longitude));
