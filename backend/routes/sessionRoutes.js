const express = require('express');
const router = express.Router();
const { bookSession, getSessions, acceptSession, rejectSession, cancelSession } = require('../controllers/sessionController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.post('/', jwtMiddleware, bookSession);
router.get('/', jwtMiddleware, getSessions);
router.post('/:id/accept', jwtMiddleware, acceptSession);
router.post('/:id/reject', jwtMiddleware, rejectSession);
router.post('/:id/cancel', jwtMiddleware, cancelSession);

module.exports = router;
