const db = require('../config/database');

class SchoolRepository {
    /**
     * Create a new school in the database
     * @param {Object} schoolData - School data to insert
     * @returns {number} Inserted school ID
     */
    async createSchool(schoolData) {
        const { name, address, latitude, longitude } = schoolData;

        const query = `
            INSERT INTO schools (name, address, latitude, longitude)
            VALUES (?, ?, ?, ?)
        `;

        try {
            const [result] = await db.execute(query, [name, address, latitude, longitude]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating school:', error);
            throw error;
        }
    }

    /**
     * Get all schools from the database
     * @returns {Array} Array of school objects
     */
    async getAllSchools() {
        const query = `
            SELECT id, name, address, latitude, longitude, created_at, updated_at
            FROM schools
            ORDER BY created_at DESC
        `;

        try {
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error('Error fetching schools:', error);
            throw error;
        }
    }

    /**
     * Find school by coordinates (with tolerance)
     * @param {number} latitude - Latitude to search
     * @param {number} longitude - Longitude to search
     * @param {number} tolerance - Coordinate tolerance (default: 0.0001)
     * @returns {Object|null} School object or null if not found
     */
    async findSchoolByLocation(latitude, longitude, tolerance = 0.0001) {
        const query = `
            SELECT id, name, address, latitude, longitude
            FROM schools
            WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?
            LIMIT 1
        `;

        try {
            const [rows] = await db.execute(query, [latitude, tolerance, longitude, tolerance]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding school by location:', error);
            throw error;
        }
    }

    /**
     * Find school by ID
     * @param {number} id - School ID
     * @returns {Object|null} School object or null if not found
     */
    async findSchoolById(id) {
        const query = `
            SELECT id, name, address, latitude, longitude, created_at, updated_at
            FROM schools
            WHERE id = ?
        `;

        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding school by ID:', error);
            throw error;
        }
    }

    /**
     * Get schools within a certain radius from a point
     * @param {number} latitude - Center latitude
     * @param {number} longitude - Center longitude
     * @param {number} radiusKm - Radius in kilometers
     * @returns {Array} Array of school objects within radius
     */
    async getSchoolsWithinRadius(latitude, longitude, radiusKm) {
        // Using Haversine formula in SQL for efficient querying
        const query = `
            SELECT id, name, address, latitude, longitude,
                   (6371 * acos(
                       cos(radians(?)) * cos(radians(latitude)) *
                       cos(radians(longitude) - radians(?)) +
                       sin(radians(?)) * sin(radians(latitude))
                   )) AS distance
            FROM schools
            HAVING distance < ?
            ORDER BY distance
        `;

        try {
            const [rows] = await db.execute(query, [latitude, longitude, latitude, radiusKm]);
            return rows;
        } catch (error) {
            console.error('Error getting schools within radius:', error);
            throw error;
        }
    }
}

module.exports = new SchoolRepository();
