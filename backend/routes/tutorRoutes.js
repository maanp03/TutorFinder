const express = require('express');
const { createTutorProfile, getTutorProfile, getAllTutors } = require('../controllers/tutorController');
const jwtMiddleware = require('../middleware/JwtMiddleware');
const router = express.Router();

router.post('/profile', jwtMiddleware, createTutorProfile);

router.get('/profile/:userId', jwtMiddleware, getTutorProfile);

router.get('/profile-all', jwtMiddleware, getAllTutors);

module.exports = router;
