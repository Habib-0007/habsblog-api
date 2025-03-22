import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { AppError } from '../middlewares/errorhandler.middleware';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER, 
      pass: env.EMAIL_PASS, 
    },
  });

  return transporter
};

// Send email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `${env.EMAIL_FROM}`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
    };

    await transporter.sendMail(message);
  } catch (error) {
    console.error('Email error:', error);
    throw new AppError('Email could not be sent', 500);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  name: string,
): Promise<void> => {
  const subject = 'Password Reset Request';

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Hello ${name},</h2>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click on the following link to complete the process:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Regards,<br>The Blog Team</p>
    </div>
  `;

  await sendEmail({
    email,
    subject,
    message: `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to: ${resetUrl}`,
    html,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<void> => {
  const subject = 'Welcome to our Blog Platform';

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #333;">Welcome, ${name}!</h2>
      <p>Thank you for joining our blog platform. We're excited to have you on board!</p>
      <p>With your new account, you can:</p>
      <ul>
        <li>Create and publish blog posts</li>
        <li>Comment on other posts</li>
        <li>Interact with other writers and readers</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy blogging!</p>
      <p>Regards,<br>The Blog Team</p>
    </div>
  `;

  await sendEmail({
    email,
    subject,
    message: `Welcome to our Blog Platform, ${name}! Thank you for joining.`,
    html,
  });
};
