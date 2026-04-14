const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const { companyName } = req.query;
        let baseQuery = { status: { $ne: 'Deleted' } };
        if (companyName && companyName !== 'All') {
            baseQuery.companyName = companyName;
        }

        const totalDocuments = await Document.countDocuments(baseQuery);
        
        // Recently uploaded (last 24h)
        const simplifiedDate = new Date();
        simplifiedDate.setHours(simplifiedDate.getHours() - 24);
        const recentUploads = await Document.countDocuments({ ...baseQuery, createdAt: { $gte: simplifiedDate } });

        // Expiring soon (next 30 days)
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const expiringSoon = await Document.countDocuments({
            ...baseQuery,
            status: { $nin: ['Deleted', 'Archived'] },
            expiryDate: { $gte: new Date(), $lte: nextMonth }
        });

        // Storage Usage
        const storageStats = await Document.aggregate([
            { $match: baseQuery },
            { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
        ]);
        
        const totalSize = storageStats.length > 0 ? storageStats[0].totalSize : 0;

        // Documents by category
        const categoryStats = await Document.aggregate([
            { $match: baseQuery },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.json({
            totalDocuments,
            recentUploads,
            expiringSoon,
            storageUsed: totalSize,
            storageLimit: 10 * 1024 * 1024 * 1024, // 10GB in bytes
            categoryStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
