const Candidate = require('../models/Candidate');
const Document = require('../models/Document');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const MailLog = require('../models/MailLog');
const { sendCandidateDocumentSubmissionEmail } = require('../utils/emailService');

// @desc    Get candidate options metadata (HR users, program names, standard document list)
// @route   GET /api/candidates/metadata/options
// @access  Private
exports.getCandidateOptions = async (req, res) => {
    try {
        const users = await User.find({ status: { $ne: 'Inactive' } }, 'username email role');
        const distinctPrograms = await Candidate.distinct('processName');
        const distinctHrs = await Candidate.distinct('hrName');
        
        const defaultPrograms = [
            'Customer Operations',
            'Voice Process',
            'Non-Voice / BPO',
            'Tech Support',
            'HR & Recruitment',
            'IT & Software Services',
            'Finance & Accounts',
            'Sales & Business Development',
            'Operations & Logistics'
        ];
        
        const programs = Array.from(new Set([...defaultPrograms, ...distinctPrograms.filter(Boolean)]));
        const hrList = Array.from(new Set([
            ...users.map(u => u.username),
            ...distinctHrs.filter(Boolean)
        ]));

        const standardDocuments = [
            '10th Marksheet',
            '11th Marksheet',
            '12th Marksheet',
            'UG Certificate',
            'PG Certificate',
            'Consolidated Marksheet',
            'Semester Marksheet',
            'Aadhar Card',
            'PAN Card',
            'Resume / CV',
            'Relieving / Experience Letter',
            'Last 3 Months Payslips',
            'Passport Size Photo',
            'Bank Passbook / Cancelled Cheque'
        ];

        res.json({
            users: users.map(u => ({ id: u._id, name: u.username, email: u.email, role: u.role })),
            programs,
            hrList,
            standardDocuments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a candidate profile with process, HR, and submission details
// @route   POST /api/candidates
// @access  Private (Admin, HR)
exports.createCandidate = async (req, res) => {
    try {
        const hrName = req.body.hrName || req.user.name || 'HR Operations';
        const candidateData = {
            ...req.body,
            hrName,
            handlingHr: req.user._id,
            submittedDate: req.body.submittedDate ? new Date(req.body.submittedDate) : new Date(),
            collectionStatus: req.body.collectionStatus || 'Submitted'
        };

        // Clean phone number: digits only (10 digits)
        if (candidateData.phone) {
            candidateData.phone = candidateData.phone.replace(/\D/g, '').slice(0, 10);
        }

        // Avoid empty strings triggering duplicate key errors on sparse indexes
        if (!candidateData.aadhaarNumber || typeof candidateData.aadhaarNumber !== 'string' || candidateData.aadhaarNumber.trim() === '') {
            delete candidateData.aadhaarNumber;
        } else {
            candidateData.aadhaarNumber = candidateData.aadhaarNumber.trim();
        }

        if (!candidateData.panNumber || typeof candidateData.panNumber !== 'string' || candidateData.panNumber.trim() === '') {
            delete candidateData.panNumber;
        } else {
            candidateData.panNumber = candidateData.panNumber.trim().toUpperCase();
        }

        // If registered directly as 'Already Doc Collected'
        if (candidateData.collectionStatus === 'Already Doc Collected') {
            candidateData.collectedDate = req.body.collectedDate ? new Date(req.body.collectedDate) : new Date();
            candidateData.collectedBy = req.body.collectedBy || hrName;
        }

        const candidate = await Candidate.create(candidateData);

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPLOAD',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Created candidate profile: ${candidate.fullName} for process: ${candidate.processName || 'General'}`,
            ipAddress: req.ip
        });

        // Trigger automated acknowledgement email if candidate email is present
        if (candidate.email && candidate.email.trim() !== '') {
            try {
                const mailResult = await sendCandidateDocumentSubmissionEmail({
                    to: candidate.email,
                    candidateName: candidate.fullName,
                    processName: candidate.processName,
                    hrName: candidate.hrName,
                    submittedDate: candidate.submittedDate,
                    documentsList: candidate.submittedDocumentsList || [],
                    collectionStatus: candidate.collectionStatus,
                    missingDocuments: candidate.missingDocuments || []
                });

                await MailLog.create({
                    candidateName: candidate.fullName,
                    candidateEmail: candidate.email,
                    candidatePhone: candidate.phone || null,
                    mailPurpose: 'Document Collection',
                    subject: `Document Submission Acknowledgement - ${candidate.fullName} [${candidate.processName || 'FIC'}]`,
                    content: `Automated document submission acknowledgement sent for process: ${candidate.processName}`,
                    status: mailResult.success ? 'Sent' : 'Failed',
                    errorMessage: mailResult.error || null,
                    messageId: mailResult.messageId || null,
                    sentBy: req.user._id
                });
            } catch (mailErr) {
                console.error('Auto-email sending failed:', mailErr);
            }
        }

        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all candidates with smart search (Name / Mobile Phone) and filters
// @route   GET /api/candidates
// @access  Private
exports.getCandidates = async (req, res) => {
    try {
        const { search, collectionStatus, processName } = req.query;
        let query = {};

        // Smart search by Candidate Full Name or Mobile Number (Phone) or Email
        if (search && search.trim() !== '') {
            const cleanSearch = search.trim();
            // Match substring in name, phone, or email
            query.$or = [
                { fullName: { $regex: cleanSearch, $options: 'i' } },
                { phone: { $regex: cleanSearch, $options: 'i' } },
                { email: { $regex: cleanSearch, $options: 'i' } },
                { processName: { $regex: cleanSearch, $options: 'i' } },
                { hrName: { $regex: cleanSearch, $options: 'i' } }
            ];
        }

        // Filter by collection status ('Submitted' or 'Already Doc Collected')
        if (collectionStatus && collectionStatus !== 'All') {
            query.collectionStatus = collectionStatus;
        }

        // Filter by process if given
        if (processName && processName !== 'All') {
            query.processName = processName;
        }

        const candidates = await Candidate.find(query)
            .populate('documents')
            .populate('handlingHr', 'name username email')
            .sort({ submittedDate: -1, createdAt: -1 });

        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get candidate by ID with all populated documents and details
// @route   GET /api/candidates/:id
// @access  Private
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id)
            .populate('documents')
            .populate('handlingHr', 'name username email');
            
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
        const updateData = { ...req.body };

        // Clean phone number: digits only (10 digits)
        if (updateData.phone) {
            updateData.phone = updateData.phone.replace(/\D/g, '').slice(0, 10);
        }

        // Avoid empty strings triggering duplicate key errors on sparse indexes
        if (updateData.aadhaarNumber !== undefined) {
            if (!updateData.aadhaarNumber || typeof updateData.aadhaarNumber !== 'string' || updateData.aadhaarNumber.trim() === '') {
                delete updateData.aadhaarNumber;
                await Candidate.findByIdAndUpdate(req.params.id, { $unset: { aadhaarNumber: 1 } });
            } else {
                updateData.aadhaarNumber = updateData.aadhaarNumber.trim();
            }
        }

        if (updateData.panNumber !== undefined) {
            if (!updateData.panNumber || typeof updateData.panNumber !== 'string' || updateData.panNumber.trim() === '') {
                delete updateData.panNumber;
                await Candidate.findByIdAndUpdate(req.params.id, { $unset: { panNumber: 1 } });
            } else {
                updateData.panNumber = updateData.panNumber.trim().toUpperCase();
            }
        }

        // Handle collection status change
        if (updateData.collectionStatus === 'Already Doc Collected') {
            if (!updateData.collectedDate) {
                updateData.collectedDate = new Date();
            }
            if (!updateData.collectedBy) {
                updateData.collectedBy = req.user.name || updateData.hrName || 'HR Operations';
            }
        } else if (updateData.collectionStatus === 'Submitted') {
            // If moved back to Submitted, reset collected fields
            updateData.collectedDate = null;
            updateData.collectedBy = null;
        }

        const candidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('documents')
            .populate('handlingHr', 'name username email');
        
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Log Activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Updated candidate profile: ${candidate.fullName} (Status: ${candidate.collectionStatus})`,
            ipAddress: req.ip
        });

        res.json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Quick update Collection Status (Mark as 'Already Doc Collected' or 'Submitted')
// @route   PATCH /api/candidates/:id/collection-status
// @access  Private (Admin, HR)
exports.updateCollectionStatus = async (req, res) => {
    try {
        const { collectionStatus, collectedDate, collectedBy } = req.body;
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        candidate.collectionStatus = collectionStatus || 'Already Doc Collected';
        
        if (candidate.collectionStatus === 'Already Doc Collected') {
            candidate.collectedDate = collectedDate ? new Date(collectedDate) : new Date();
            candidate.collectedBy = collectedBy || req.user.name || candidate.hrName || 'HR Operations';
        } else {
            candidate.collectedDate = null;
            candidate.collectedBy = null;
        }

        await candidate.save();

        await ActivityLog.create({
            user: req.user._id,
            action: 'EDIT',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Updated document collection status to ${candidate.collectionStatus} for candidate: ${candidate.fullName}`,
            ipAddress: req.ip
        });

        res.json({
            message: `Candidate collection status updated to ${candidate.collectionStatus}`,
            candidate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send / Resend Document Submission Acknowledgement Email
// @route   POST /api/candidates/:id/send-ack
// @access  Private (Admin, HR)
exports.sendCandidateAck = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('documents');

        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        if (!candidate.email) {
            return res.status(400).json({ message: 'Candidate has no registered email address' });
        }

        // Build list of documents from candidate documents and submittedDocumentsList
        let docList = candidate.submittedDocumentsList && candidate.submittedDocumentsList.length > 0
            ? candidate.submittedDocumentsList
            : (candidate.documents || []).map(d => ({
                name: d.title,
                documentType: d.category,
                submittedAt: d.createdAt
            }));

        const mailResult = await sendCandidateDocumentSubmissionEmail({
            to: candidate.email,
            candidateName: candidate.fullName,
            processName: candidate.processName,
            hrName: candidate.hrName,
            submittedDate: candidate.submittedDate,
            documentsList: docList,
            collectionStatus: candidate.collectionStatus,
            missingDocuments: candidate.missingDocuments || []
        });

        // Record in MailLog
        const mailLog = await MailLog.create({
            candidateName: candidate.fullName,
            candidateEmail: candidate.email,
            candidatePhone: candidate.phone || null,
            mailPurpose: 'Document Collection',
            subject: `Document Submission Acknowledgement - ${candidate.fullName} [${candidate.processName || 'FIC'}]`,
            content: `Document submission acknowledgement sent for process: ${candidate.processName}. Status: ${candidate.collectionStatus}`,
            status: mailResult.success ? 'Sent' : 'Failed',
            errorMessage: mailResult.error || null,
            messageId: mailResult.messageId || null,
            sentBy: req.user._id
        });

        await ActivityLog.create({
            user: req.user._id,
            action: 'EMAIL',
            targetType: 'Candidate',
            targetId: candidate._id,
            details: `Sent document submission acknowledgement email to ${candidate.fullName} (${candidate.email})`,
            ipAddress: req.ip
        });

        if (mailResult.success) {
            res.json({ message: `Acknowledgement email sent successfully to ${candidate.email}`, mailLog });
        } else {
            res.status(500).json({ message: `Failed to send email: ${mailResult.error}`, mailLog });
        }
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
