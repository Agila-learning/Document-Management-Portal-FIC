const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const path = require('path');
const fs = require('fs');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private (Admin, HR, Manager)
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, category, description, tags, candidateId, companyName, clientName, confidentiality, expiryDate } = req.body;

        const document = await Document.create({
            title: title || req.file.originalname,
            category,
            description,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname),
            fileSize: req.file.size,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.user._id,
            candidate: candidateId || null,
            companyName,
            clientName,
            confidentiality,
            expiryDate: expiryDate && expiryDate !== '' ? new Date(expiryDate) : undefined
        });

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPLOAD',
            targetType: 'Document',
            targetId: document._id,
            details: `Uploaded document: ${document.title}`,
            ipAddress: req.ip
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents with search and filters
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
    try {
        const { search, category, fileType, status, candidate, isStarred, isPinned, sortBy } = req.query;

        // Default query: exclude soft-deleted files unless specifically requested
        let query = {};
        
        if (status) {
            query.status = status;
        } else {
            query.status = { $ne: 'Deleted' };
        }

        // Search
        if (search) {
            query.$text = { $search: search };
        }

        // Filters
        if (category) query.category = category;
        if (fileType) query.fileType = fileType;
        if (status) query.status = status;
        if (candidate) query.candidate = candidate;
        if (isStarred) query.isStarred = (isStarred === 'true');
        if (isPinned) query.isPinned = (isPinned === 'true');

        // Sorting
        let sortOption = { createdAt: -1 };
        if (sortBy === 'newest') sortOption = { createdAt: -1 };
        if (sortBy === 'oldest') sortOption = { createdAt: 1 };
        if (sortBy === 'alphabetical') sortOption = { title: 1 };

        const documents = await Document.find(query)
            .populate('uploadedBy', 'username email')
            .sort(sortOption);

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update document metadata
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
    try {
        const { title, category, description, status, isStarred, isPinned, confidentiality } = req.body;
        
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.title = title || document.title;
        document.category = category || document.category;
        document.description = description || document.description;
        document.status = status || document.status;
        document.confidentiality = confidentiality || document.confidentiality;
        
        if (isStarred !== undefined) document.isStarred = isStarred;
        if (isPinned !== undefined) document.isPinned = isPinned;

        const updatedDocument = await document.save();

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Document',
            targetId: document._id,
            details: `Updated document metadata: ${document.title}`,
            ipAddress: req.ip
        });

        res.json(updatedDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Soft delete document (Move to recycle bin / archive)
// @route   DELETE /api/documents/:id
// @access  Private (Admin, Manager)
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.status = 'Deleted'; // Soft delete
        await document.save();

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'DELETE',
            targetType: 'Document',
            targetId: document._id,
            details: `Soft deleted document: ${document.title}`,
            ipAddress: req.ip
        });

        res.json({ message: 'Document moved to recycle bin' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Permanently delete document (Cleanup file and DB)
// @route   DELETE /api/documents/:id/permanent
// @access  Private (Admin)
exports.permanentDeleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // 1. Delete physical file
        const filePath = path.resolve(document.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 2. Remove from DB
        await Document.findByIdAndDelete(req.params.id);

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'DELETE',
            targetType: 'Document',
            targetId: document._id,
            details: `Permanently deleted document: ${document.title}`,
            ipAddress: req.ip
        });

        res.json({ message: 'Document permanently removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
