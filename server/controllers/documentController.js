const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../config/cloudinary');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private (Admin, HR, Manager)
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, category, description, tags, candidateId, companyName, clientName, confidentiality, expiryDate, password } = req.body;

        const docData = {
            title: title || req.file.originalname,
            category,
            description,
            filePath: req.file.path, // Cloudinary URL
            cloudinaryPublicId: req.file.filename, // Cloudinary public_id
            fileType: path.extname(req.file.originalname),
            fileSize: req.file.size,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.user._id,
            candidate: candidateId || null,
            employee: req.body.employeeId || null,
            companyName,
            clientName,
            confidentiality,
            expiryDate: expiryDate && expiryDate !== '' ? new Date(expiryDate) : undefined
        };

        // Hash password if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            docData.password = await bcrypt.hash(password, salt);
            docData.isProtected = true;
        }

        const document = await Document.create(docData);

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
        const { search, category, fileType, status, candidate, isStarred, isPinned, sortBy, companyName } = req.query;

        // Default query: exclude soft-deleted files unless specifically requested
        let query = {};
        
        if (status) {
            query.status = status;
        } else {
            query.status = { $ne: 'Deleted' };
        }

        if (companyName && companyName !== 'All') {
            query.companyName = companyName;
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
        if (req.query.employee) query.employee = req.query.employee;
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
        const { title, category, description, status, isStarred, isPinned, confidentiality, companyName, expiryDate } = req.body;
        
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        document.title = title || document.title;
        document.category = category || document.category;
        document.description = description !== undefined ? description : document.description;
        document.status = status || document.status;
        document.confidentiality = confidentiality || document.confidentiality;
        document.companyName = companyName || document.companyName;
        
        // Handle expiryDate - allow setting, updating, and clearing
        if (expiryDate !== undefined) {
            document.expiryDate = expiryDate && expiryDate !== '' ? new Date(expiryDate) : null;
        }
        
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

        // 1. Delete from Cloudinary if it exists
        if (document.cloudinaryPublicId) {
            await cloudinary.uploader.destroy(document.cloudinaryPublicId);
        } else {
            // Fallback for local files if any still exist
            const filePath = path.resolve(document.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
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

// @desc    Verify document password
// @route   POST /api/documents/:id/verify-password
// @access  Private
exports.verifyDocumentPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const document = await Document.findById(req.params.id).select('+password');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!document.password) {
            return res.status(400).json({ message: 'Document is not password protected' });
        }

        const isMatch = await bcrypt.compare(password, document.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.json({ success: true, message: 'Password verified' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
