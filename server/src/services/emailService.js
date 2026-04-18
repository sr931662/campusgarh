const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

class EmailService {
  constructor() {
    if (process.env.RESEND_API_KEY) {
      const fromDomain = process.env.RESEND_FROM;
      if (!fromDomain) {
        console.warn('[EmailService] RESEND_API_KEY is set but RESEND_FROM is missing — emails will likely be dropped by Resend. Set RESEND_FROM to a verified domain email.');
      }
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
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[EmailService] SMTP env vars (SMTP_HOST, SMTP_USER, SMTP_PASS) are not fully configured. Email sending will fail.');
      }
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

    // Verify SMTP connection on startup (non-blocking)
    this.transporter.verify().then(() => {
      console.log('[EmailService] SMTP transporter ready');
    }).catch((err) => {
      console.error('[EmailService] SMTP transporter verification failed:', err.message);
    });
  }

  async sendEmail({ to, subject, template, context }) {
    const templatePath = path.join(__dirname, '../templates/emails', `${template}.ejs`);
    const html = await ejs.renderFile(templatePath, context);
    const from = process.env.RESEND_API_KEY
      ? `"CampusGarh" <${process.env.RESEND_FROM || 'onboarding@resend.dev'}>`
      : `"CampusGarh" <${process.env.SMTP_USER}>`;
    const info = await this.transporter.sendMail({ from, to, subject, html });
    console.log(`[EmailService] Email sent to ${to} | messageId: ${info.messageId}`);
    return info;
  }

  async sendVerificationEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - CampusGarh',
      template: 'verification',
      context: { name: user.name, url },
    });
  }

  async sendPasswordResetEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await this.sendEmail({
      to: user.email,
      subject: 'Password Reset - CampusGarh',
      template: 'passwordReset',
      context: { name: user.name, url },
    });
  }

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

  async sendShareEmail({ to, title, url, image, excerpt }) {
    await this.sendEmail({
      to,
      subject: `Check this out on CampusGarh: ${title}`,
      template: 'shareEmail',
      context: { title, url, image: image || '', excerpt: excerpt || '' },
    });
  }
}

module.exports = new EmailService();
