const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const schoolValidation = require('../middleware/validation');

// Add School endpoint
router.post('/addSchool', schoolValidation.validateAddSchool, schoolController.addSchool);

// List Schools endpoint
router.get('/listSchools', schoolValidation.validateListSchools, schoolController.listSchools);

module.exports = router;
