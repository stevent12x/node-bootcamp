const nodemailer = require('nodemailer');

const SendEmail = async options => {
   // 1) Create transporter
   const transporter = nodemailer.createTransport({
      host: process.env.EAMIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USERNAME,
         pass: process.env.EMAIL_PASSWORD
      }
   });
   // 2) Define email options
   // const mailOptions = {
   //    from: 'Steven T <test@steven.io>',
   //    to: options.email,
   //    subject: options.subject,
   //    text: options.message
   //    // html:
   // };
   // 3) Send the email
   await transporter.sendMail({
      from: 'Steven T <test@steven.io>',
      to: options.email,
      subject: options.subject,
      text: options.message
      // html:
   });
};

module.exports = SendEmail;
