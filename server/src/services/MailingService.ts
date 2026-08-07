import { IMailingProvider } from "@/interfaces/IMailingProvider";
import { IMailingService } from "@/interfaces/IMailingService";

export class MailingService implements IMailingService {
  constructor(private mailProvider: IMailingProvider) { }

  async sendEmail(to: string, message: string, subject?: string) {
    return await this.mailProvider.sendEmail(to, message, subject);
  }

  async sendActivationEmail(to: string, token: string) {
    return await this.mailProvider.sendActivationEmail(to, token);

  }
}