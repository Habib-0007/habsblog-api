import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const generateToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};

export const sendResetPasswordEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  const mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           http://localhost:3000/reset-password/${token}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};
