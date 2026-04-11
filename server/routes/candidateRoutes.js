const express = require('express');
const router = express.Router();
const { 
    createCandidate, 
    getCandidates, 
    getCandidateById, 
    updateCandidate,
    deleteCandidate
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Super Admin', 'Admin', 'HR'), createCandidate);
router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);
router.put('/:id', protect, authorize('Super Admin', 'Admin', 'HR'), updateCandidate);
router.delete('/:id', protect, authorize('Super Admin', 'Admin', 'HR'), deleteCandidate);

module.exports = router;
