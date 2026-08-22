const nodemailer = require('nodemailer');
const { ERRORS } = require('../utils/AppError');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = require('../config/env');

const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'localhost',
    port: Number(SMTP_PORT) || 587,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
});

/**
 * Send password reset email with secure token link
 * @param {string} to
 * @param {string} resetLink
 */
async function sendPasswordResetEmail(to, resetLink) {
    try {
        await transporter.sendMail({
            from: SMTP_FROM || 'no-reply@globetrotter.local',
            to,
            subject: 'Reset your GlobeTrotter password',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your GlobeTrotter account. Click the button or link below to choose a new password:</p>
                    <p style="margin: 24px 0;">
                        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </p>
                    <p>Or paste this link into your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p><em>This link is valid for 30 minutes. If you did not request a password reset, you can safely ignore this email.</em></p>
                </div>
            `,
        });
    } catch (error) {
        console.error('Email delivery error:', error);
        throw ERRORS.EMAIL_SEND_FAILED;
    }
}

module.exports = { sendPasswordResetEmail };
