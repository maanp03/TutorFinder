const express = require('express');
const jwtMiddleware = require('../middleware/JwtMiddleware');
const { adminLogin, getTutors, getClients, deleteTutor, deleteClient, getAcceptedSessions } = require('../controllers/adminController');
const router = express.Router();

// Admin login
router.post('/login', adminLogin);

// Get all tutors
router.get('/tutors',jwtMiddleware, getTutors);

// Get all clients
router.get('/clients',jwtMiddleware, getClients);

// Delete a tutor
router.delete('/tutors/:tutorId', deleteTutor);

// Delete a client
router.delete('/clients/:clientId', deleteClient);

// Get accepted sessions
router.get('/sessions', jwtMiddleware, getAcceptedSessions);

module.exports = router;
