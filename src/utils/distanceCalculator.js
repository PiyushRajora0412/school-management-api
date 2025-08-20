/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Earth's radius in kilometers
    const R = 6371;

    // Convert degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    const distance = R * c;

    // Round to 2 decimal places
    return Math.round(distance * 100) / 100;
}

/**
 * Calculate distance in miles
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles (rounded to 2 decimal places)
 */
function calculateDistanceInMiles(lat1, lon1, lat2, lon2) {
    const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
    const distanceMiles = distanceKm * 0.621371; // Convert km to miles
    return Math.round(distanceMiles * 100) / 100;
}

/**
 * Validate if coordinates are within valid ranges
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCoordinates(latitude, longitude) {
    return (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const toDegrees = (radians) => radians * (180 / Math.PI);

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaLambda = toRadians(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - 
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let bearing = toDegrees(Math.atan2(y, x));

    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;

    return Math.round(bearing * 100) / 100;
}

module.exports = {
    calculateDistance,
    calculateDistanceInMiles,
    isValidCoordinates,
    calculateBearing
};
