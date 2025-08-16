const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
      this.transporter = null;
    }
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    if (!this.transporter) {
      console.error('Email service not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"School Management System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
        attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  async sendEmailWithTemplate({ to, subject, template, data, attachments = [] }) {
    try {
      const html = await this.renderTemplate(template, data);
      const text = this.htmlToText(html);
      
      return await this.sendEmail({
        to,
        subject,
        html,
        text,
        attachments,
      });
    } catch (error) {
      console.error('Template email sending failed:', error);
      return false;
    }
  }

  async renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(
        process.env.EMAIL_TEMPLATES_PATH || './templates/emails',
        `${templateName}.html`
      );
      
      let template = await fs.readFile(templatePath, 'utf8');
      
      // Replace placeholders with data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, data[key]);
      });
      
      return template;
    } catch (error) {
      console.error('Template rendering failed:', error);
      // Fallback to simple template
      return this.getFallbackTemplate(templateName, data);
    }
  }

  getFallbackTemplate(templateName, data) {
    const templates = {
      emailVerification: `
        <h2>Email Verification</h2>
        <p>Hello ${data.name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${data.verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
      passwordReset: `
        <h2>Password Reset</h2>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
      welcome: `
        <h2>Welcome to School Management System</h2>
        <p>Hello ${data.name},</p>
        <p>Welcome to our school management system! Your account has been created successfully.</p>
        <p>You can now log in to your account and start using the system.</p>
      `,
      gradeNotification: `
        <h2>Grade Update</h2>
        <p>Hello ${data.studentName},</p>
        <p>Your grade for ${data.courseName} has been updated.</p>
        <p>Grade: ${data.grade}</p>
        <p>Score: ${data.score}%</p>
        <p>Please log in to view more details.</p>
      `,
      attendanceNotification: `
        <h2>Attendance Update</h2>
        <p>Hello ${data.parentName},</p>
        <p>This is to notify you about ${data.studentName}'s attendance for ${data.date}.</p>
        <p>Status: ${data.status}</p>
        <p>Course: ${data.courseName}</p>
        <p>Please log in to view more details.</p>
      `,
      assignmentDue: `
        <h2>Assignment Due Reminder</h2>
        <p>Hello ${data.studentName},</p>
        <p>This is a reminder that your assignment "${data.assignmentName}" is due on ${data.dueDate}.</p>
        <p>Course: ${data.courseName}</p>
        <p>Please submit your assignment before the deadline.</p>
      `,
      eventReminder: `
        <h2>Event Reminder</h2>
        <p>Hello ${data.name},</p>
        <p>This is a reminder about the upcoming event:</p>
        <h3>${data.eventTitle}</h3>
        <p>Date: ${data.eventDate}</p>
        <p>Time: ${data.eventTime}</p>
        <p>Location: ${data.eventLocation}</p>
        <p>Description: ${data.eventDescription}</p>
      `,
      feeReminder: `
        <h2>Fee Payment Reminder</h2>
        <p>Hello ${data.parentName},</p>
        <p>This is a reminder that the fee payment for ${data.studentName} is due on ${data.dueDate}.</p>
        <p>Amount: $${data.amount}</p>
        <p>Please log in to make the payment.</p>
      `,
    };

    return templates[templateName] || `
      <h2>Notification</h2>
      <p>Hello ${data.name || 'there'},</p>
      <p>This is a notification from the School Management System.</p>
    `;
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Specific email methods
  async sendEmailVerification(email, name, verificationUrl) {
    return await this.sendEmailWithTemplate({
      to: email,
      subject: 'Email Verification - School Management System',
      template: 'emailVerification',
      data: { name, verificationUrl },
    });
  }

  async sendPasswordReset(email, name, resetUrl) {
    return await this.sendEmailWithTemplate({
      to: email,
      subject: 'Password Reset - School Management System',
      template: 'passwordReset',
      data: { name, resetUrl },
    });
  }

  async sendWelcomeEmail(email, name) {
    return await this.sendEmailWithTemplate({
      to: email,
      subject: 'Welcome to School Management System',
      template: 'welcome',
      data: { name },
    });
  }

  async sendGradeNotification(studentEmail, studentName, courseName, grade, score) {
    return await this.sendEmailWithTemplate({
      to: studentEmail,
      subject: 'Grade Update Notification',
      template: 'gradeNotification',
      data: { studentName, courseName, grade, score },
    });
  }

  async sendAttendanceNotification(parentEmail, parentName, studentName, date, status, courseName) {
    return await this.sendEmailWithTemplate({
      to: parentEmail,
      subject: 'Attendance Update Notification',
      template: 'attendanceNotification',
      data: { parentName, studentName, date, status, courseName },
    });
  }

  async sendAssignmentDueReminder(studentEmail, studentName, assignmentName, courseName, dueDate) {
    return await this.sendEmailWithTemplate({
      to: studentEmail,
      subject: 'Assignment Due Reminder',
      template: 'assignmentDue',
      data: { studentName, assignmentName, courseName, dueDate },
    });
  }

  async sendEventReminder(email, name, eventData) {
    return await this.sendEmailWithTemplate({
      to: email,
      subject: 'Event Reminder',
      template: 'eventReminder',
      data: { name, ...eventData },
    });
  }

  async sendFeeReminder(parentEmail, parentName, studentName, amount, dueDate) {
    return await this.sendEmailWithTemplate({
      to: parentEmail,
      subject: 'Fee Payment Reminder',
      template: 'feeReminder',
      data: { parentName, studentName, amount, dueDate },
    });
  }

  async sendBulkEmail(recipients, subject, template, data) {
    const results = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmailWithTemplate({
        to: recipient.email,
        subject,
        template,
        data: { ...data, name: recipient.name },
      });
      
      results.push({
        email: recipient.email,
        success: result,
      });
    }
    
    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export functions for easy use
const sendEmail = (options) => emailService.sendEmail(options);
const sendEmailWithTemplate = (options) => emailService.sendEmailWithTemplate(options);
const sendEmailVerification = (email, name, verificationUrl) => 
  emailService.sendEmailVerification(email, name, verificationUrl);
const sendPasswordReset = (email, name, resetUrl) => 
  emailService.sendPasswordReset(email, name, resetUrl);
const sendWelcomeEmail = (email, name) => 
  emailService.sendWelcomeEmail(email, name);
const sendGradeNotification = (studentEmail, studentName, courseName, grade, score) => 
  emailService.sendGradeNotification(studentEmail, studentName, courseName, grade, score);
const sendAttendanceNotification = (parentEmail, parentName, studentName, date, status, courseName) => 
  emailService.sendAttendanceNotification(parentEmail, parentName, studentName, date, status, courseName);
const sendAssignmentDueReminder = (studentEmail, studentName, assignmentName, courseName, dueDate) => 
  emailService.sendAssignmentDueReminder(studentEmail, studentName, assignmentName, courseName, dueDate);
const sendEventReminder = (email, name, eventData) => 
  emailService.sendEventReminder(email, name, eventData);
const sendFeeReminder = (parentEmail, parentName, studentName, amount, dueDate) => 
  emailService.sendFeeReminder(parentEmail, parentName, studentName, amount, dueDate);
const sendBulkEmail = (recipients, subject, template, data) => 
  emailService.sendBulkEmail(recipients, subject, template, data);

module.exports = {
  emailService,
  sendEmail,
  sendEmailWithTemplate,
  sendEmailVerification,
  sendPasswordReset,
  sendWelcomeEmail,
  sendGradeNotification,
  sendAttendanceNotification,
  sendAssignmentDueReminder,
  sendEventReminder,
  sendFeeReminder,
  sendBulkEmail,
};
