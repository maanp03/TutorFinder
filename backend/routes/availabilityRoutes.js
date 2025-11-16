const express = require('express');
const router = express.Router();
const { upsertAvailability, getAvailability } = require('../controllers/availabilityController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/', jwtMiddleware, upsertAvailability);
router.get('/', getAvailability);
router.get('/tutor/:tutorId', getAvailability);

module.exports = router;


