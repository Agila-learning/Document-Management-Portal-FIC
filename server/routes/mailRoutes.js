const express = require('express');
const router = express.Router();
const { sendMail, getMailHistory } = require('../controllers/mailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Send acknowledgement mail
router.post('/send', protect, authorize('Super Admin', 'Admin', 'HR'), sendMail);

// Get mail history
router.get('/history', protect, getMailHistory);

module.exports = router;
