const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs
// @route   GET /api/activity
// @access  Private (Admin, Super Admin)
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user', 'username role')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activity for dashboard
// @route   GET /api/activity/recent
// @access  Private
exports.getRecentActivity = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
