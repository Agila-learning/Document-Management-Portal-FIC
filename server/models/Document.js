const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'MOU', 'NOC', 'SLA', 'Candidate', 'Offer Letters', 
            'Posters', 'Legal', 'HR', 'Client', 'Miscellaneous'
        ]
    },
    description: String,
    filePath: {
        type: String,
        required: true
    },
    fileType: String,
    fileSize: Number,
    tags: [String],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiryDate: Date,
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    },
    companyName: String,
    clientName: String,
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Pending', 'Verified', 'Archived', 'Deleted'],
        default: 'Active'
    },
    confidentiality: {
        type: String,
        enum: ['Public', 'Internal', 'Confidential', 'Highly Confidential'],
        default: 'Internal'
    },
    versionHistory: [{
        version: Number,
        filePath: String,
        uploadedDate: { type: Date, default: Date.now },
        description: String
    }],
    isStarred: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for search
documentSchema.index({ title: 'text', description: 'text', tags: 'text', companyName: 'text' });

module.exports = mongoose.model('Document', documentSchema);
