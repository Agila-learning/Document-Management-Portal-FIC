const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 resolution to prevent Render IPv6 ENETUNREACH issues
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Create reusable transporter
const createTransporter = () => {
    // If it's a Gmail connection, strictly force Port 587 (STARTTLS) and generic IPv4
    const isGmail = !process.env.SMTP_HOST || process.env.SMTP_HOST.includes('gmail');
    
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

    // Custom fallback
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
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
 * Generate professional HTML email template
 */
const generateEmailHTML = ({ candidateName, subject, content, purpose, amountPaid, paymentMode, transactionId }) => {
    const purposeColorMap = {
        'Document Collection': { primary: '#2563eb', light: '#eff6ff', label: '📄 Document Collection' },
        'NOC Signed': { primary: '#059669', light: '#ecfdf5', label: '✅ NOC Acknowledgement' },
        'Payment Receipt': { primary: '#d97706', light: '#fffbeb', label: '💰 Payment Receipt' },
        'Custom': { primary: '#7c3aed', light: '#f5f3ff', label: '📧 Official Communication' }
    };

    const theme = purposeColorMap[purpose] || purposeColorMap['Custom'];

    // Build payment details block if applicable
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

    // Convert newlines in plain-text content to <br>
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
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd); border-radius: 16px 16px 0 0; padding: 32px 28px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Forge India Connect</h1>
                <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Document Management Portal</p>
            </div>

            <!-- Purpose Badge -->
            <div style="background: #ffffff; padding: 0 28px;">
                <div style="display: inline-block; background: ${theme.light}; color: ${theme.primary}; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 24px; border: 1px solid ${theme.primary}20;">
                    ${theme.label}
                </div>
            </div>

            <!-- Body -->
            <div style="background: #ffffff; padding: 24px 28px;">
                <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 15px; font-weight: 600;">Dear ${candidateName},</p>
                
                <div style="color: #334155; font-size: 14px; line-height: 1.7; font-weight: 500;">
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

            <!-- Footer -->
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
 * Send acknowledgement email
 * @param {Object} params 
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendAcknowledgementMail = async ({ to, subject, candidateName, content, purpose, amountPaid, paymentMode, transactionId }) => {
    try {
        const transporter = createTransporter();

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
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAcknowledgementMail, generateEmailHTML };
