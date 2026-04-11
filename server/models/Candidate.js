const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: String,
    aadhaarNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    panNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    educationalQualification: String,
    experienceDetails: String,
    verificationStatus: {
        type: String,
        enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
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

module.exports = mongoose.model('Candidate', candidateSchema);
