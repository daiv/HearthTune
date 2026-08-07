import { IMailingProvider } from "@/interfaces/IMailingProvider";
import nodemailer from 'nodemailer';
import { MailOptions } from "nodemailer/lib/json-transport";

export class NodeMailer implements IMailingProvider {

  private transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  async sendEmail(to: string, message: string, subject: string = '')
    : Promise<boolean> {
      
    const mailFinalOptions: MailOptions = {
      to,
      subject,
      from: `HearthTune <${process.env.SMTP_USER}>`,
      html: `<p>${message}</p>`
    }
    try {
      const info = await this.transporter.sendMail(mailFinalOptions);
      if (info.rejected.length === 0) return true;
      else return false;
    } catch (error) {
      return false;
    }
  }
  async sendActivationEmail(to: string, token: string)
    : Promise<boolean> {

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
      const info = await this.transporter.sendMail(mailOptions);
      return info.rejected.length === 0;

    } catch (error) {
      console.error(' error sending message', error);
      return false;
    }
  }
}