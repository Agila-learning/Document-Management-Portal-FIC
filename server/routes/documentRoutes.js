const express = require('express');
const router = express.Router();
const { 
    uploadDocument, 
    getDocuments, 
    updateDocument, 
    deleteDocument,
    updateDocumentStatus,
    purgeAllDeletedDocuments,
    permanentDeleteDocument,
    verifyDocumentPassword
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, authorize('Super Admin', 'Admin', 'HR', 'Document Manager'), upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.put('/:id', protect, authorize('Super Admin', 'Admin', 'HR', 'Document Manager'), updateDocument);
router.patch('/:id/status', protect, authorize('Super Admin', 'Admin', 'HR', 'Document Manager'), updateDocumentStatus);
router.delete('/permanent/all', protect, authorize('Super Admin', 'Admin', 'HR'), purgeAllDeletedDocuments);
router.delete('/:id/permanent', protect, authorize('Super Admin', 'Admin', 'HR', 'Document Manager'), permanentDeleteDocument);
router.delete('/:id', protect, authorize('Super Admin', 'Admin', 'HR', 'Document Manager'), deleteDocument);
router.post('/:id/verify-password', protect, verifyDocumentPassword);

module.exports = router;
