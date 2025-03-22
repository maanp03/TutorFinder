const express = require('express');
const router = express.Router();
const {
  createOrUpdateClientProfile,
  getClientProfile,
} = require('../controllers/clientController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/profile', jwtMiddleware, createOrUpdateClientProfile);

router.get('/profile/:userId', jwtMiddleware, getClientProfile);

module.exports = router;
