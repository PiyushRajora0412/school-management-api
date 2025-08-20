const schoolService = require('../services/schoolService');
const { validationResult } = require('express-validator');

class SchoolController {
    /**
     * Add a new school
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async addSchool(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, address, latitude, longitude } = req.body;

            // Call service to add school
            const result = await schoolService.addSchool({
                name: name.trim(),
                address: address.trim(),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            });

            res.status(201).json({
                success: true,
                message: 'School added successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in addSchool controller:', error);

            // Handle duplicate entry error
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'A school with similar details already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to add school',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    /**
     * List schools sorted by proximity
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async listSchools(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { latitude, longitude } = req.query;

            // Call service to get schools
            const schools = await schoolService.getSchoolsSortedByDistance({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            });

            res.status(200).json({
                success: true,
                message: 'Schools retrieved successfully',
                data: schools,
                count: schools.length
            });

        } catch (error) {
            console.error('Error in listSchools controller:', error);

            res.status(500).json({
                success: false,
                message: 'Failed to retrieve schools',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = new SchoolController();
