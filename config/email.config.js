const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
async function sendMail(to, subject, text) {
  try {
   const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    logger.info({to}, "Email send successfully")
    return info;
  } catch (error) {
    logger.error("Email error", error.message);
    throw error;
  }
}

module.exports = { sendMail };
