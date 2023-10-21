const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const AppError = require('./appError');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Steven T <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        secure: false,
        auth: {
          user: process.env.BREVO_USER,
          pass: process.env.BREVO_KEY
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EAMIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the email
  async send(template, subject) {
    // 1 Render the HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2 Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.htmlToText(html)
    };

    // 3 Create a transporter and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    try {
      this.send('welcome', 'Welcome to Natours!');
    } catch (err) {
      return new AppError(err.data.message, 404);
    }
  }

  async sendPasswordReset() {
    this.send(
      'passwordReset',
      'You password reset token (Valid for 10 minutes)'
    );
  }
};
