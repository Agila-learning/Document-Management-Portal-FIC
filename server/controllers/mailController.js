const MailLog = require('../models/MailLog');
const ActivityLog = require('../models/ActivityLog');
const { sendAcknowledgementMail } = require('../utils/emailService');

// @desc    Send acknowledgement mail to candidate
// @route   POST /api/mail/send
// @access  Private (Super Admin, Admin, HR)
exports.sendMail = async (req, res) => {
    try {
        const {
            candidateName,
            candidateEmail,
            candidatePhone,
            mailPurpose,
            subject,
            content,
            amountPaid,
            paymentMode,
            transactionId
        } = req.body;

        // Validation
        if (!candidateName || !candidateEmail || !mailPurpose || !subject || !content) {
            return res.status(400).json({
                message: 'Missing required fields: candidateName, candidateEmail, mailPurpose, subject, content'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidateEmail)) {
            return res.status(400).json({ message: 'Invalid email address format' });
        }

        // Payment validation
        if (mailPurpose === 'Payment Receipt' && !amountPaid) {
            return res.status(400).json({ message: 'Amount is required for Payment Receipt purpose' });
        }

        // Handle attachments if they exist
        const attachments = (req.files || []).map(file => ({
            filename: file.originalname,
            path: file.path
        }));
        
        // Send the email
        const result = await sendAcknowledgementMail({
            to: candidateEmail,
            subject,
            candidateName,
            content,
            purpose: mailPurpose,
            amountPaid: amountPaid ? Number(amountPaid) : null,
            paymentMode: paymentMode || null,
            transactionId: transactionId || null,
            attachments: attachments
        });

        // Create mail log entry
        const mailLog = await MailLog.create({
            candidateName,
            candidateEmail,
            candidatePhone: candidatePhone || null,
            mailPurpose,
            subject,
            content,
            amountPaid: amountPaid || null,
            paymentMode: paymentMode || null,
            transactionId: transactionId || null,
            status: result.success ? 'Sent' : 'Failed',
            errorMessage: result.error || null,
            messageId: result.messageId || null,
            sentBy: req.user._id
        });

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'EMAIL',
            targetType: 'Mail',
            targetId: mailLog._id,
            details: `Sent ${mailPurpose} mail to ${candidateName} (${candidateEmail})`,
            ipAddress: req.ip
        });

        if (result.success) {
            res.status(200).json({
                message: `Email sent successfully to ${candidateEmail}`,
                mailLog
            });
        } else {
            res.status(500).json({
                message: `Email sending failed: ${result.error}`,
                mailLog
            });
        }
    } catch (error) {
        console.error('Mail controller error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get mail history
// @route   GET /api/mail/history
// @access  Private
exports.getMailHistory = async (req, res) => {
    try {
        const { purpose, startDate, endDate, page = 1, limit = 20 } = req.query;

        const filter = {};

        if (purpose && purpose !== 'All') {
            filter.mailPurpose = purpose;
        }

        if (startDate || endDate) {
            filter.sentAt = {};
            if (startDate) filter.sentAt.$gte = new Date(startDate);
            if (endDate) filter.sentAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            MailLog.find(filter)
                .populate('sentBy', 'username')
                .sort({ sentAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            MailLog.countDocuments(filter)
        ]);

        res.json({
            logs,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Mail history error:', error);
        res.status(500).json({ message: error.message });
    }
};
