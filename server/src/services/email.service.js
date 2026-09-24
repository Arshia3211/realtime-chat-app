import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isSmtpConfigured = Boolean(env.smtp.host && env.smtp.user && env.smtp.password);

let transporterPromise = null;

// Uses the SMTP settings from .env. In development without SMTP settings it falls
// back to an Ethereal test inbox (https://ethereal.email): emails are captured,
// never delivered, and a preview link is printed to the console.
const createTransporter = async () => {
  if (isSmtpConfigured) {
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }

  if (env.isProduction) {
    throw new Error('SMTP is not configured');
  }

  const account = await nodemailer.createTestAccount();
  console.log('[email] SMTP not configured — using an Ethereal test inbox');
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass },
  });
};

const getTransporter = () => {
  transporterPromise ??= createTransporter().catch((error) => {
    transporterPromise = null; // allow a retry on the next email
    throw error;
  });
  return transporterPromise;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: env.smtp.from ?? 'Realtime Chat <no-reply@realtime-chat.local>',
    to,
    subject,
    text,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[email] preview "${subject}" → ${previewUrl}`);
  }
  return info;
};

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const sendPasswordResetEmail = ({ to, name, resetUrl, expiresInMinutes }) =>
  sendEmail({
    to,
    subject: 'Reset your Realtime Chat password',
    text: [
      `Hi ${name},`,
      '',
      'We received a request to reset your password. Open the link below to choose a new one:',
      resetUrl,
      '',
      `This link expires in ${expiresInMinutes} minutes. If you didn't request this, you can ignore this email.`,
    ].join('\n'),
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#171717;color:#fff;border-radius:6px;text-decoration:none">Reset password</a></p>
      <p style="color:#666;font-size:13px">This link expires in ${expiresInMinutes} minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
