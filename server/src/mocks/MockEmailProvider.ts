import { IMailingProvider } from "@/interfaces/IMailingProvider";

export class MockEmailProvider implements IMailingProvider {
  async sendEmail(to: string, message: string, subject?: string): Promise<boolean> {
    console.warn('mock email:');
    console.log('to', message);
    return true;
  };
  async sendActivationEmail(to: string, token: string): Promise<boolean> {
    const activationUrl = `${process.env.SERVER_URL}/validation/${token}`;
    console.warn('mock activation email:');
    console.log(to, activationUrl);
    return true;
  }
}