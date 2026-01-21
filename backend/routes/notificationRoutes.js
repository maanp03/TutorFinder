const express = require('express');
const router = express.Router();
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const jwtMiddleware = require('../middleware/JwtMiddleware');

router.get('/', jwtMiddleware, listNotifications);
router.post('/:id/read', jwtMiddleware, markRead);
router.post('/read-all', jwtMiddleware, markAllRead);

module.exports = router;


