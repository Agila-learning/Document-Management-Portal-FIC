const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    baseSalary: {
        type: Number,
        required: true
    },
    lopDays: {
        type: Number,
        default: 0
    },
    calculatedSalary: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Processed', 'Paid'],
        default: 'Pending'
    },
    paymentDate: Date,
    remarks: String
}, {
    timestamps: true
});

// Index to prevent duplicate records for same employee/month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
