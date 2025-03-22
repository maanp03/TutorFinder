const express = require('express');
const router = express.Router();
const { bookSession, getSessions } = require('../controllers/sessionController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/', jwtMiddleware, bookSession);

router.get('/', jwtMiddleware, getSessions);

module.exports = router;
