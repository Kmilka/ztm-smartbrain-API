const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,   
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

function createMessage(...content) {
  const messageInfo = {
    from: '<smartbrain.io@invalidmail.com> SmartBrain',
    subject: "Password Reset at SmartBrain App",
    passwordResetText: "Hi! You have requested reset password for your SmartBrain App account. Press the link below. If you did not make this request, please ignore this email.",
    blankEmailText: "Hi! You or someone else have requested reset password at SmartBrain App account for this email. However, this email address is not in our database of registered users and therefore password reset request has failed. If you are the SmartBrain App user and were expecting this email, please try again using email you gave when opening your account. Otherwise, please ignore this email."
  }
  const userEmail = content[0];
  const link = content[1];
  
  return transporter.sendMail({
    from: messageInfo.from,
    to: userEmail,
    subject: messageInfo.subject,
    text: link? `${messageInfo.passwordResetText} Link: ${link}`: `${messageInfo.blankEmailText}`,
    html: "",
  }, function(error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email was sent");
    }
  });
}

module.exports = {
  createMessage: createMessage,
}