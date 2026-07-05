import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Credential } from './types/types';
import { MailOptions } from 'nodemailer/lib/json-transport';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export function checkEnvFile() {
  console.log('Checking env file...');
  const mandatoryVar = [
    "MONGO_INITDB_ROOT_USERNAME",
    "MONGO_INITDB_ROOT_PASSWORD",
    "MONGO_INITDB_DATABASE",
    "MONGO_HOSTNAME",
  ];
  const missingEnvVariables = mandatoryVar.filter(envVar => {
    const value = process.env[envVar];
    return !value || value.trim() === "";
  });

  if (missingEnvVariables.length > 0) throw new Error(`The next .env variables are missing: ${missingEnvVariables.join(', ')}`);
  else console.log('env file is ok');
}

export function hashData(text: string): string {
  return crypto
    .createHmac("sha256", process.env.HASHING_KEY!)
    .update(text)
    .digest("hex");
}
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const mockMailResult = {
  accepted: ['@gmail.com'],
  rejected: [],
  ehlo: [
    'SIZE 35882577',
    '8BITMIME',
    'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
    'ENHANCEDSTATUSCODES',
    'PIPELINING',
    'CHUNKING',
    'SMTPUTF8'
  ],
  envelopeTime: 148,
  messageTime: 908,
  messageSize: 1094,
  response: '250 2.0.0 OK  1780241839 ffacd0b85a97d-45ef354b5bdsm18035415f8f.21 - gsmtp',
  envelope: { from: 'd3iv.auth@gmail.com', to: ['@gmail.com'] },
  messageId: '<a5162258-c1ac-e1b4-5fd7-a6948dbe1553@gmail.com>'
}

export async function sendEmail(to: string, message: string, subject: string = ''): Promise<boolean> {
  const mailOptions: MailOptions = {
    to,
    subject,
    from: `HearthTune <${process.env.SMTP_USER}>`,
    html: `<p>${message}</p>`
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.rejected.length === 0) return true;
    else return false;
  } catch (error) {
    return false;
  }
}
export async function sendActivationEmail(to: string, token: string, sendItForReal: boolean = false) {
  const activationUrl = `${process.env.SERVER_URL}/validation/${token}`;
  const mailOptions = {
    from: `HearthTune <${process.env.SMTP_USER}>`,
    to,
    subject: 'Account activation',
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <h2>Welcome to Hearthtune!</h2>
        <p>To activate your account and get the apk file press the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${activationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Activate account
          </a>
        </p>
        <p>or copy this link in your browser:</p>
        <p style="color: #007bff;">${activationUrl}</p>
      </div>`
  };

  try {
    if (sendItForReal) {
      const info = await transporter.sendMail(mailOptions);
      console.log('message sent', info.messageId);
      return info;

    } else {
      const mockResult = { ...mockMailResult, accepted: [to], envelope: { from: 'deiv.auth@gmail.com', to: [to] } }
      return mockResult;
    }
  } catch (error) {
    console.error(' error sending message', error);
    throw new Error(`Email could not be sent`);
  }

}
export function expiresIn(hours: 1 | 5 | 12 | 24 | 48): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
export function createValidationCredentials(expiresAt: Date = expiresIn(48)): Credential {
  const credentials: Credential = {
    expiresAt,
    token: crypto.randomUUID(),
  }
  return credentials;
}