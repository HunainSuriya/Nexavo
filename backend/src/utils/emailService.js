const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  secure: false,
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
});

// Send contact form email
async function sendContactEmail(enquiryData) {
  const { client_name, email, project_type, message } = enquiryData;
  
  const mailOptions = {
    from: env.email.from,
    to: env.email.user, // Send to agency email
    subject: `New Contact Form Submission from ${client_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Nexavo - New Enquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Name:</td>
            <td style="padding: 10px;">${client_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Email:</td>
            <td style="padding: 10px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Project Type:</td>
            <td style="padding: 10px;">${project_type || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #f3f4f6; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">Sent from Nexavo Agency Website Contact Form</p>
      </div>
    `,
  };
  
  // Auto-reply to client
  const autoReplyOptions = {
    from: env.email.from,
    to: email,
    subject: `Thank you for contacting Nexavo, ${client_name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Thank You for Reaching Out!</h2>
        <p>Dear ${client_name},</p>
        <p>We have received your message regarding <strong>${project_type || 'your project'}</strong>.</p>
        <p>Our team will review your requirements and get back to you within 24-48 hours.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Nexavo Team</strong></p>
        <p style="color: #6b7280; font-size: 12px;">www.nexavo.com</p>
      </div>
    `,
  };
  
  await transporter.sendMail(mailOptions);
  await transporter.sendMail(autoReplyOptions);
}

module.exports = { sendContactEmail };