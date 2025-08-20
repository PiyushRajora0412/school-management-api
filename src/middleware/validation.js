const { body, query } = require('express-validator');

class SchoolValidation {
    /**
     * Validation rules for adding a school
     */
    validateAddSchool = [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('School name is required')
            .isLength({ min: 2, max: 255 })
            .withMessage('School name must be between 2 and 255 characters')
            .matches(/^[a-zA-Z0-9\s\-\.,'()&]+$/)
            .withMessage('School name contains invalid characters'),

        body('address')
            .trim()
            .notEmpty()
            .withMessage('School address is required')
            .isLength({ min: 5, max: 500 })
            .withMessage('School address must be between 5 and 500 characters'),

        body('latitude')
            .notEmpty()
            .withMessage('Latitude is required')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude must be a valid number between -90 and 90')
            .custom((value) => {
                const lat = parseFloat(value);
                if (isNaN(lat)) {
                    throw new Error('Latitude must be a valid number');
                }
                return true;
            }),

        body('longitude')
            .notEmpty()
            .withMessage('Longitude is required')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude must be a valid number between -180 and 180')
            .custom((value) => {
                const lng = parseFloat(value);
                if (isNaN(lng)) {
                    throw new Error('Longitude must be a valid number');
                }
                return true;
            })
    ];

    /**
     * Validation rules for listing schools
     */
    validateListSchools = [
        query('latitude')
            .notEmpty()
            .withMessage('Latitude query parameter is required')
            .isFloat({ min: -90, max: 90 })
            .withMessage('Latitude must be a valid number between -90 and 90')
            .custom((value) => {
                const lat = parseFloat(value);
                if (isNaN(lat)) {
                    throw new Error('Latitude must be a valid number');
                }
                return true;
            }),

        query('longitude')
            .notEmpty()
            .withMessage('Longitude query parameter is required')
            .isFloat({ min: -180, max: 180 })
            .withMessage('Longitude must be a valid number between -180 and 180')
            .custom((value) => {
                const lng = parseFloat(value);
                if (isNaN(lng)) {
                    throw new Error('Longitude must be a valid number');
                }
                return true;
            })
    ];
}

module.exports = new SchoolValidation();
