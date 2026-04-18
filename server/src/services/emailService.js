const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

class EmailService {
  constructor() {
    // Use Resend SMTP if RESEND_API_KEY is set, else fall back to generic SMTP
    if (process.env.RESEND_API_KEY) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  // Send email using EJS template
  async sendEmail({ to, subject, template, context }) {
    const templatePath = path.join(__dirname, '../templates/emails', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, context);
    const from = process.env.RESEND_API_KEY
      ? `"CampusGarh" <${process.env.RESEND_FROM || 'onboarding@resend.dev'}>`
      : `"CampusGarh" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`;
    await this.transporter.sendMail({ from, to, subject, html });
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
    // Send enquiry confirmation to student
  async sendEnquiryConfirmation(enquiry) {
    await this.sendEmail({
      to: enquiry.email,
      subject: 'We Received Your Enquiry – CampusGarh',
      template: 'enquiryConfirmation',
      context: {
        name: enquiry.studentName,
        phone: enquiry.phone,
        message: enquiry.message || '',
      },
    });
  }

  // Notify assigned counsellor of new lead
  async sendCounsellorNotification(enquiry, counsellor) {
    await this.sendEmail({
      to: counsellor.email,
      subject: `New Lead Assigned: ${enquiry.studentName} – CampusGarh`,
      template: 'counsellorNotification',
      context: {
        counsellorName: counsellor.name,
        studentName: enquiry.studentName,
        studentEmail: enquiry.email,
        studentPhone: enquiry.phone,
        message: enquiry.message || '',
        sourceUrl: enquiry.sourceUrl || '',
        dashboardUrl: `${process.env.CLIENT_URL}/dashboard`,
      },
    });
  }

}

module.exports = new EmailService();