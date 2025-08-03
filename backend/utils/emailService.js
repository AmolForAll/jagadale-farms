const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - Jagadale Farms',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2e7d32; text-align: center;">Jagadale Farms</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Hello ${username},</h3>
          <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: #2e7d32; color: white; padding: 15px 30px; font-size: 24px; letter-spacing: 5px; border-radius: 8px; display: inline-block;">${otp}</span>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for ${process.env.OTP_EXPIRE_MINUTES} minutes only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        <p style="text-align: center; color: #666; font-size: 12px;">
          © 2025 Jagadale Farms. All rights reserved.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
