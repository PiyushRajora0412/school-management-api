const schoolRepository = require('../repositories/schoolRepository');
const { calculateDistance } = require('../utils/distanceCalculator');

class SchoolService {
    /**
     * Add a new school to the database
     * @param {Object} schoolData - School information
     * @returns {Object} Created school data
     */
    async addSchool(schoolData) {
        const { name, address, latitude, longitude } = schoolData;

        // Additional business logic validation
        if (!this.isValidCoordinates(latitude, longitude)) {
            throw new Error('Invalid coordinates provided');
        }

        // Check if school already exists at the same location
        const existingSchool = await schoolRepository.findSchoolByLocation(latitude, longitude);
        if (existingSchool) {
            throw new Error('A school already exists at this location');
        }

        // Create school
        const schoolId = await schoolRepository.createSchool({
            name,
            address,
            latitude,
            longitude
        });

        // Return the created school
        return {
            id: schoolId,
            name,
            address,
            latitude,
            longitude
        };
    }

    /**
     * Get all schools sorted by distance from user location
     * @param {Object} userLocation - User's latitude and longitude
     * @returns {Array} Schools sorted by distance
     */
    async getSchoolsSortedByDistance(userLocation) {
        const { latitude, longitude } = userLocation;

        // Validate user coordinates
        if (!this.isValidCoordinates(latitude, longitude)) {
            throw new Error('Invalid user coordinates provided');
        }

        // Get all schools from database
        const schools = await schoolRepository.getAllSchools();

        // Calculate distance for each school and sort
        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: calculateDistance(
                latitude,
                longitude,
                school.latitude,
                school.longitude
            )
        }));

        // Sort by distance (ascending)
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        return schoolsWithDistance;
    }

    /**
     * Validate if coordinates are within valid range
     * @param {number} latitude - Latitude value
     * @param {number} longitude - Longitude value
     * @returns {boolean} True if valid, false otherwise
     */
    isValidCoordinates(latitude, longitude) {
        return (
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180
        );
    }
}

module.exports = new SchoolService();
