const mongoose = require('mongoose');

const mailLogSchema = new mongoose.Schema({
    candidateName: {
        type: String,
        required: true,
        trim: true
    },
    candidateEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    candidatePhone: {
        type: String,
        trim: true
    },
    mailPurpose: {
        type: String,
        enum: ['Document Collection', 'NOC Signed', 'Payment Receipt', 'Custom'],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    amountPaid: {
        type: Number,
        default: null
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', null],
        default: null
    },
    transactionId: {
        type: String,
        trim: true,
        default: null
    },
    status: {
        type: String,
        enum: ['Sent', 'Failed'],
        default: 'Sent'
    },
    errorMessage: {
        type: String,
        default: null
    },
    messageId: {
        type: String,
        default: null
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
mailLogSchema.index({ sentAt: -1 });
mailLogSchema.index({ mailPurpose: 1 });
mailLogSchema.index({ candidateEmail: 1 });

module.exports = mongoose.model('MailLog', mailLogSchema);
