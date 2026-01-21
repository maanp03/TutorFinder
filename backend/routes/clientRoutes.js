const express = require('express');
const router = express.Router();
const {
  createOrUpdateClientProfile,
  getClientProfile,
  deleteAccount,
} = require('../controllers/clientController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/profile', jwtMiddleware, createOrUpdateClientProfile);

router.get('/profile/:userId', jwtMiddleware, getClientProfile);

router.delete('/account', jwtMiddleware, deleteAccount);

module.exports = router;
