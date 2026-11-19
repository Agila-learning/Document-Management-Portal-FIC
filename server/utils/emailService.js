const nodemailer = require('nodemailer');
const dns = require('dns');
const https = require('https');
const fs = require('fs');

// Optional DNS resolution order
// If user whitelisted IPv6 in Brevo, let the OS resolve automatically

// Create reusable transporter
const createTransporter = () => {
    const isGmail = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail');
    
    if (isGmail) {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Must be false for port 587 (uses STARTTLS)
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Brevo (smtp-relay.brevo.com) or custom SMTP fallback
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send email directly via Brevo REST API (Fastest and bypasses SMTP IP blocks)
 */
const sendViaBrevoApi = ({ to, subject, htmlContent, senderName, senderEmail, attachments = [] }) => {
    return new Promise((resolve) => {
        if (!process.env.BREVO_API_KEY) {
            return resolve({ success: false, error: 'No BREVO_API_KEY configured' });
        }

        const formattedSenderEmail = senderEmail || process.env.SMTP_FROM_EMAIL || 'forgeindiaconnectfic@gmail.com';
        const formattedSenderName = senderName || process.env.SMTP_FROM_NAME || 'Forge India Connect';

        const payload = {
            sender: {
                name: formattedSenderName,
                email: formattedSenderEmail
            },
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
            subject,
            htmlContent
        };

        if (attachments && attachments.length > 0) {
            payload.attachment = attachments.map(att => {
                if (att.content) {
                    return { content: att.content.toString('base64'), name: att.filename };
                } else if (att.path && fs.existsSync(att.path)) {
                    return { content: fs.readFileSync(att.path).toString('base64'), name: att.filename };
                }
                return null;
            }).filter(Boolean);
        }

        const postData = JSON.stringify(payload);

        const options = {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ success: true, messageId: json.messageId });
                    } else {
                        resolve({ success: false, error: json.message || `Brevo API status ${res.statusCode}` });
                    }
                } catch (e) {
                    resolve({ success: false, error: e.message });
                }
            });
        });

        req.on('error', (err) => resolve({ success: false, error: err.message }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, error: 'Brevo API request timed out' });
        });

        req.write(postData);
        req.end();
    });
};

/**
 * Generate professional HTML email template for manual mail
 */
const generateEmailHTML = ({ candidateName, subject, content, purpose, amountPaid, paymentMode, transactionId }) => {
    const purposeColorMap = {
        'Document Collection': { primary: '#2563eb', light: '#eff6ff', label: '📄 Document Collection' },
        'NOC Signed': { primary: '#059669', light: '#ecfdf5', label: '✅ NOC Acknowledgement' },
        'Payment Receipt': { primary: '#d97706', light: '#fffbeb', label: '💰 Payment Receipt' },
        'Onboarding': { primary: '#7c3aed', light: '#f5f3ff', label: '👋 Employee Onboarding' },
        'Offer Letter': { primary: '#2563eb', light: '#eff6ff', label: '✉️ Offer Letter' },
        'Termination': { primary: '#dc2626', light: '#fef2f2', label: '⚠️ Employment Update' },
        'Employee Documents Collected': { primary: '#059669', light: '#ecfdf5', label: '📂 Records Updated' },
        'Custom': { primary: '#64748b', light: '#f8fafc', label: '📧 Official Communication' }
    };

    const theme = purposeColorMap[purpose] || purposeColorMap['Custom'];

    let paymentBlock = '';
    if (purpose === 'Payment Receipt' && amountPaid) {
        paymentBlock = `
        <div style="background: ${theme.light}; border: 1px solid ${theme.primary}20; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: ${theme.primary}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Amount Paid</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: 800; text-align: right;">₹${Number(amountPaid).toLocaleString('en-IN')}</td>
                </tr>
                ${paymentMode ? `<tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Payment Mode</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${paymentMode}</td>
                </tr>` : ''}
                ${transactionId ? `<tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Reference / Txn ID</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 700; text-align: right;">${transactionId}</td>
                </tr>` : ''}
            </table>
        </div>`;
    }

    const formattedContent = content.replace(/\n/g, '<br/>');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
            <div style="background: linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd); border-radius: 16px 16px 0 0; padding: 32px 28px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Forge India Connect</h1>
                <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Document Management Portal</p>
                <div style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 6px 16px; margin-top: 14px;">
                    <span style="color: #ffffff; font-size: 12px; font-weight: 700;">${theme.label}</span>
                </div>
            </div>

            <div style="background: #ffffff; padding: 32px 28px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; font-weight: 600;">
                    Dear ${candidateName},
                </p>
                
                <div style="font-size: 14px; line-height: 1.7; color: #334155; margin-bottom: 24px;">
                    ${formattedContent}
                </div>

                ${paymentBlock}

                <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.7;">
                        Warm Regards,<br/>
                        <strong style="color: #0f172a;">Forge India Connect</strong><br/>
                        <span style="color: #64748b; font-size: 12px;">Human Resources & Document Management</span>
                    </p>
                </div>
            </div>

            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 16px 16px; padding: 20px 28px; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                    This is an official communication from Forge India Connect.<br/>
                    Please do not reply to this email. For queries, contact your HR representative.
                </p>
                <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 10px;">
                    © ${new Date().getFullYear()} Forge India Connect. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>`;
};

/**
 * Send manual acknowledgement email (Tries Brevo REST API, then falls back to SMTP)
 */
const sendAcknowledgementMail = async ({ to, subject, candidateName, content, purpose, amountPaid, paymentMode, transactionId, attachments = [] }) => {
    const htmlContent = generateEmailHTML({
        candidateName,
        subject,
        content,
        purpose,
        amountPaid,
        paymentMode,
        transactionId
    });

    const fromName = process.env.SMTP_FROM_NAME || 'Forge India Connect';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'forgeindiaconnectfic@gmail.com';

    // 1. Try Brevo REST API first if configured
    if (process.env.BREVO_API_KEY) {
        const brevoResult = await sendViaBrevoApi({
            to,
            subject,
            htmlContent,
            senderName: fromName,
            senderEmail: fromEmail,
            attachments
        });

        if (brevoResult.success) {
            return brevoResult;
        }
        console.warn('Brevo API send failed, trying SMTP fallback:', brevoResult.error);
    }

    // 2. Fallback to Nodemailer SMTP
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html: htmlContent,
            attachments: attachments
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email fallback send error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send Automated Document Submission Email to Candidate (Tries Brevo REST API, then falls back to SMTP)
 */
const sendCandidateDocumentSubmissionEmail = async ({
    to,
    candidateName,
    processName,
    hrName,
    submittedDate,
    documentsList = [],
    collectionStatus = 'Submitted',
    missingDocuments = []
}) => {
    try {
        if (!to) {
            return { success: false, error: 'No recipient email provided' };
        }

        const fromName = process.env.SMTP_FROM_NAME || 'Forge India Connect';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'forgeindiaconnectfic@gmail.com';

        const formattedDate = new Date(submittedDate || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const docItemsHtml = (documentsList && documentsList.length > 0)
            ? documentsList.map((doc, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; font-size: 13px;">${idx + 1}. ${doc.name || doc.title || 'Document'}</td>
                    <td style="padding: 10px 12px; color: #64748b; font-size: 12px;">${doc.documentType || doc.category || 'General'}</td>
                    <td style="padding: 10px 12px; text-align: right;">
                        <span style="background: #ecfdf5; color: #047857; font-weight: 700; font-size: 11px; padding: 3px 8px; border-radius: 999px;">
                            ✓ Submitted
                        </span>
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="3" style="padding: 14px; text-align: center; color: #64748b; font-size: 13px;">Initial documentation logged</td></tr>`;

        const missingDocsHtml = (missingDocuments && missingDocuments.length > 0)
            ? `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; color: #92400e; font-weight: 700; font-size: 13px;">⚠️ Pending / Required Documents:</p>
                <ul style="margin: 0; padding-left: 20px; color: #b45309; font-size: 12px;">
                    ${missingDocuments.map(item => `<li style="margin-bottom: 3px;">${item}</li>`).join('')}
                </ul>
            </div>`
            : '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); border-radius: 16px 16px 0 0; padding: 30px 24px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Forge India Connect</h1>
                    <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Document Submission Acknowledgement</p>
                </div>

                <!-- Body Content -->
                <div style="background: #ffffff; padding: 28px 24px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 14px 0; font-size: 16px; color: #0f172a; font-weight: 600;">
                        Dear ${candidateName},
                    </p>
                    <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                        Your documents have been successfully recorded in our central portal. Below are the registered details of your submission:
                    </p>

                    <!-- Meta Summary Card -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 42%;">Submission Date:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Program / Process:</td>
                                <td style="padding: 6px 0; color: #1e40af; font-weight: 700;">${processName || 'General Process'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Assigned HR Representative:</td>
                                <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${hrName || 'HR Operations'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Collection Status:</td>
                                <td style="padding: 6px 0;">
                                    <span style="background: #dbeafe; color: #1d4ed8; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 999px;">
                                        ${collectionStatus}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Submitted Documents List -->
                    <h3 style="margin: 22px 0 10px 0; font-size: 14px; color: #0f172a; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                        📄 Submitted Documents (${documentsList.length})
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
                                <th style="padding: 8px 12px;">Document Name</th>
                                <th style="padding: 8px 12px;">Type</th>
                                <th style="padding: 8px 12px; text-align: right;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${docItemsHtml}
                        </tbody>
                    </table>

                    ${missingDocsHtml}

                    <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                        Our HR operations team will review your submitted credentials. If you have any questions or additional files, please coordinate with your assigned HR representative <strong>${hrName}</strong>.
                    </p>

                    <!-- Signoff -->
                    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.7;">
                            Warm Regards,<br/>
                            <strong style="color: #0f172a;">${hrName}</strong><br/>
                            <span style="color: #64748b; font-size: 12px;">Forge India Connect - Human Resources</span>
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 16px 16px; padding: 18px 24px; text-align: center;">
                    <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                        This is an official automated document submission receipt from Forge India Connect.<br/>
                        For verification queries, contact your HR representative.
                    </p>
                    <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 10px;">
                        © ${new Date().getFullYear()} Forge India Connect. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>`;

        const subject = `Document Submission Acknowledgement - ${candidateName} [${processName || 'FIC'}]`;

        // 1. Try Brevo REST API first
        if (process.env.BREVO_API_KEY) {
            const apiResult = await sendViaBrevoApi({
                to,
                subject,
                htmlContent: html,
                senderName: fromName,
                senderEmail: fromEmail
            });

            if (apiResult.success) {
                return apiResult;
            }
            console.warn('Brevo API send failed for candidate ack, attempting SMTP fallback:', apiResult.error);
        }

        // 2. Fallback to SMTP
        const transporter = createTransporter();
        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Candidate acknowledgement email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { 
    sendAcknowledgementMail, 
    generateEmailHTML,
    sendCandidateDocumentSubmissionEmail 
};
