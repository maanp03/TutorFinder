const express = require('express');
const { createTutorProfile, getTutorProfile, getAllTutors, deleteAccount } = require('../controllers/tutorController');
const jwtMiddleware = require('../middleware/JwtMiddleware');
const router = express.Router();

router.post('/profile', jwtMiddleware, createTutorProfile);

router.get('/profile/:userId', jwtMiddleware, getTutorProfile);

router.get('/profile-all', jwtMiddleware, getAllTutors);

router.delete('/account', jwtMiddleware, deleteAccount);

module.exports = router;
