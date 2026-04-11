const express = require('express');
const router = express.Router();
const { getActivityLogs, getRecentActivity } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Super Admin', 'Admin'), getActivityLogs);
router.get('/recent', protect, getRecentActivity);

module.exports = router;
