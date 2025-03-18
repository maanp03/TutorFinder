const express = require('express');
const { createTutorProfile, getTutorProfile } = require('../controllers/tutorController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/profile', authMiddleware, createTutorProfile);

router.get('/profile/:userId', authMiddleware, getTutorProfile);

module.exports = router;
