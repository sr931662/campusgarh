const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send email using EJS template
  async sendEmail({ to, subject, template, context }) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${template}.ejs`);
      const html = await ejs.renderFile(templatePath, context);
      const mailOptions = {
        from: `"CampusGarh" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send error:', error.message);
      throw error; // re-throw so callers can handle / log fallback URLs
    }
  }

  // Send verification email
  async sendVerificationEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - CampusGarh',
      template: 'verification',
      context: { name: user.name, url },
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset - CampusGarh',
      template: 'passwordReset',
      context: { name: user.name, url },
    });
  }
}

module.exports = new EmailService();