const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Create new patient
router.post('/', patientController.createPatient);

// Get all patients
router.get('/', patientController.getAllPatients);

// Get single patient by ID
router.get('/:id', patientController.getPatientById);

// Delete a patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;
