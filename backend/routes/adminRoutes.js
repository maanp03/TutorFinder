const express = require('express');
const { adminLogin } = require('../controllers/adminController');
const router = express.Router();
 
// @route   POST /api/admin/login
// @desc    Login as admin
// @access  Public
router.post('/login', adminLogin);
 
module.exports = router;
