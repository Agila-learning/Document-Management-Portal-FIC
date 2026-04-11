const express = require('express');
const router = express.Router();
const { register, login, getMe, seedAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/seed-admin', seedAdmin);
router.get('/me', protect, getMe);

module.exports = router;
