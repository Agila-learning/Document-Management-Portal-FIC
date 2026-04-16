const express = require('express');
const router = express.Router();
const { sendMail, getMailHistory } = require('../controllers/mailController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Send acknowledgement mail with optional attachments
router.post('/send', protect, authorize('Super Admin', 'Admin', 'HR'), upload.array('attachments'), sendMail);

// Get mail history
router.get('/history', protect, getMailHistory);

module.exports = router;
