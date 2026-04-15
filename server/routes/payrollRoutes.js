const express = require('express');
const router = express.Router();
const { 
    createPayrollRecord, 
    getPayrollRecords, 
    updatePaymentStatus 
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Super Admin', 'Admin', 'HR'), createPayrollRecord);
router.get('/', protect, getPayrollRecords);
router.patch('/:id/status', protect, authorize('Super Admin', 'Admin', 'HR'), updatePaymentStatus);

module.exports = router;
