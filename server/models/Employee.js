const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    phone: String,
    designation: {
        type: String,
        required: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        default: 'Antigraviity'
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Resigned', 'Terminated'],
        default: 'Active'
    },
    candidateRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate'
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
