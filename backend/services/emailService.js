const nodemailer = require('nodemailer');

// This is a stub service. In a real application, you would configure
// the transporter with real SMTP credentials (e.g., SendGrid, AWS SES, Gmail).

const sendEmail = async ({ to, subject, html, attachments }) => {
    // Log email to console for development
    console.log('--- EMAIL SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- CONTENT ---');
    // console.log(html); 
    console.log('------------------');

    // Simulate delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, messageId: 'mock-123' });
        }, 500);
    });
};

module.exports = { sendEmail };
