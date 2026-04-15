const express = require('express');
const router = express.Router();
const { 
    createEmployee, 
    getEmployees, 
    updateEmployee, 
    deleteEmployee 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Super Admin', 'Admin', 'HR'), createEmployee);
router.get('/', protect, getEmployees);
router.put('/:id', protect, authorize('Super Admin', 'Admin', 'HR'), updateEmployee);
router.delete('/:id', protect, authorize('Super Admin', 'Admin'), deleteEmployee);

module.exports = router;
