const express = require('express');
const { adminLogin, getTutors, getClients } = require('../controllers/adminController');
const jwtMiddleware = require('../middleware/JwtMiddleware');
const router = express.Router();

router.post('/login', adminLogin);
router.get('/tutors', jwtMiddleware, getTutors);
router.get('/clients', jwtMiddleware, getClients);

module.exports = router;
