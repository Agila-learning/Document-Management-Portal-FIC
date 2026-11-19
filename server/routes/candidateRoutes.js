const express = require('express');
const router = express.Router();
const { 
    createCandidate, 
    getCandidates, 
    getCandidateById, 
    updateCandidate,
    deleteCandidate,
    updateCollectionStatus,
    sendCandidateAck,
    getCandidateOptions
} = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/metadata/options', protect, getCandidateOptions);
router.post('/', protect, authorize('Super Admin', 'Admin', 'HR'), createCandidate);
router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);
router.put('/:id', protect, authorize('Super Admin', 'Admin', 'HR'), updateCandidate);
router.patch('/:id/collection-status', protect, authorize('Super Admin', 'Admin', 'HR'), updateCollectionStatus);
router.post('/:id/send-ack', protect, authorize('Super Admin', 'Admin', 'HR'), sendCandidateAck);
router.delete('/:id', protect, authorize('Super Admin', 'Admin', 'HR'), deleteCandidate);

module.exports = router;
