const express = require('express');
const router = express.Router();
const { upsertAvailability, getAvailability } = require('../controllers/availabilityController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/', jwtMiddleware, upsertAvailability);
router.get('/', getAvailability);

module.exports = router;


