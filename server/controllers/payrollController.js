const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Generate payroll record for a specific employee
// @route   POST /api/payroll
// @access  Private (Admin, HR)
exports.createPayrollRecord = async (req, res) => {
    try {
        const { employeeId, month, year, lopDays, baseSalary } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Logic: (BaseSalary / 30) * (30 - LOPDays) - Simplistic for now
        // A more robust logic would use actual days in the month
        const daysInMonth = 30; // Standardized
        const calculatedSalary = Math.round((baseSalary / daysInMonth) * (daysInMonth - lopDays));

        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            baseSalary,
            lopDays,
            calculatedSalary,
            paymentStatus: 'Pending'
        });

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPLOAD',
            targetType: 'Payroll',
            targetId: payroll._id,
            details: `Generated payroll for ${employee.fullName} - ${month}/${year}`,
            ipAddress: req.ip
        });

        res.status(201).json(payroll);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Payroll for this employee and month already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payroll records by month/year or employee
// @route   GET /api/payroll
// @access  Private
exports.getPayrollRecords = async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let query = {};
        if (month) query.month = month;
        if (year) query.year = year;
        if (employeeId) query.employee = employeeId;

        const records = await Payroll.find(query)
            .populate('employee', 'fullName email designation')
            .sort({ month: -1, year: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment status
// @route   PATCH /api/payroll/:id/status
// @access  Private (Admin, HR)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentDate, remarks } = req.body;
        
        const payroll = await Payroll.findById(req.params.id).populate('employee');
        if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });

        payroll.paymentStatus = paymentStatus;
        if (paymentDate) payroll.paymentDate = paymentDate;
        if (remarks) payroll.remarks = remarks;

        await payroll.save();

        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Payroll',
            targetId: payroll._id,
            details: `Updated payment status for ${payroll.employee.fullName} to ${paymentStatus}`,
            ipAddress: req.ip
        });

        res.json(payroll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
