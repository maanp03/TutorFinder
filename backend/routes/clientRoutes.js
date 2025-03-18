const express = require('express');
const { createClientProfile, getClientProfile } = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/profile', authMiddleware, createClientProfile);

router.get('/profile/:userId', authMiddleware, getClientProfile);

module.exports = router;
