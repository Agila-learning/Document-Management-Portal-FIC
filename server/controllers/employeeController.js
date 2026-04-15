const Employee = require('../models/Employee');
const ActivityLog = require('../models/ActivityLog');

// @desc    Add a new employee (Specifically for Antigraviity workspace)
// @route   POST /api/employees
// @access  Private (Admin, HR)
exports.createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPLOAD',
            targetType: 'Employee',
            targetId: employee._id,
            details: `Onboarded employee: ${employee.fullName}`,
            ipAddress: req.ip
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
    try {
        const { companyName } = req.query;
        let query = {};
        if (companyName) query.companyName = companyName;

        const employees = await Employee.find(query).sort({ fullName: 1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin, HR)
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee record not found' });
        }

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Employee',
            targetId: employee._id,
            details: `Updated employee metadata: ${employee.fullName}`,
            ipAddress: req.ip
        });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete employee record
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await Employee.findByIdAndDelete(req.params.id);
        
        await ActivityLog.create({
            user: req.user._id,
            action: 'DELETE',
            targetType: 'Employee',
            targetId: req.params.id,
            details: `Removed employee record: ${employee.fullName}`,
            ipAddress: req.ip
        });

        res.json({ message: 'Employee record purged successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
