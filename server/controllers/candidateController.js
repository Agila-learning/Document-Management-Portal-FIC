const Candidate = require('../models/Candidate');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a candidate profile
// @route   POST /api/candidates
// @access  Private (Admin, HR)
exports.createCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.create(req.body);

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPLOAD',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Created candidate profile: ${candidate.fullName}`,
            ipAddress: req.ip
        });

        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find()
            .populate('documents')
            .sort({ createdAt: -1 });

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get candidate by ID with documents
// @route   GET /api/candidates/:id
// @access  Private
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('documents');
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/:id
// @access  Private (Admin, HR)
exports.updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Updated candidate profile: ${candidate.fullName}`,
            ipAddress: req.ip
        });

        res.json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete candidate profile
// @route   DELETE /api/candidates/:id
// @access  Private (Admin, HR)
exports.deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        await Candidate.findByIdAndDelete(req.params.id);

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'DELETE',
            targetType: 'Candidate',
            targetId: req.params.id,
            details: `Deleted candidate profile: ${candidate.fullName}`,
            ipAddress: req.ip
        });

        res.json({ message: 'Candidate profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
