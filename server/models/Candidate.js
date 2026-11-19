const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        index: true
    },
    processName: {
        type: String,
        trim: true,
        default: 'General Process'
    },
    hrName: {
        type: String,
        trim: true,
        default: 'HR Desk'
    },
    handlingHr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    collectionStatus: {
        type: String,
        enum: ['Submitted', 'Already Doc Collected', 'Pending Submission'],
        default: 'Submitted',
        index: true
    },
    submittedDate: {
        type: Date,
        default: Date.now
    },
    collectedDate: {
        type: Date,
        default: null
    },
    collectedBy: {
        type: String,
        default: null
    },
    submittedDocumentsList: [{
        name: { type: String, required: true },
        documentType: { type: String, default: 'General' },
        submittedAt: { type: Date, default: Date.now },
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        status: { type: String, enum: ['Submitted', 'Collected', 'Verified'], default: 'Submitted' }
    }],
    aadhaarNumber: {
        type: String,
        trim: true,
        default: undefined,
        set: v => (v && typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined)
    },
    panNumber: {
        type: String,
        trim: true,
        default: undefined,
        set: v => (v && typeof v === 'string' && v.trim() !== '' ? v.trim().toUpperCase() : undefined)
    },
    educationalQualification: String,
    experienceDetails: String,
    verificationStatus: {
        type: String,
        enum: ['Unverified', 'Pending', 'Verified', 'Rejected', 'Incomplete'],
        default: 'Unverified'
    },
    missingDocuments: [String],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    notes: String,
    profilePhoto: String
}, {
    timestamps: true
});

candidateSchema.pre('save', function(next) {
    if (this.aadhaarNumber === '' || !this.aadhaarNumber) {
        this.aadhaarNumber = undefined;
    }
    if (this.panNumber === '' || !this.panNumber) {
        this.panNumber = undefined;
    }
    next();
});

candidateSchema.index({ fullName: 'text', phone: 'text', email: 'text', processName: 'text', hrName: 'text' });

module.exports = mongoose.model('Candidate', candidateSchema);
