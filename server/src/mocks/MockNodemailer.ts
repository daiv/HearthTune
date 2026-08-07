import { IMailingProvider } from "@/interfaces/IMailingProvider";

export class MockNodeMailer implements IMailingProvider {
  async sendEmail(to: string, message: string, subject?: string): Promise<boolean> {
    return true;
  };
  async sendActivationEmail(to: string, token: string): Promise<boolean> {
    return true;
  }
}