const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['UPLOAD', 'EDIT', 'DELETE', 'VIEW', 'DOWNLOAD', 'LOGIN', 'LOGOUT', 'RENAME', 'MOVE', 'VERIFY', 'RESTORE']
    },
    targetType: {
        type: String,
        enum: ['Document', 'Candidate', 'User', 'System', 'Employee', 'Payroll'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: String
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
