
export interface IMailingProvider {
  sendEmail: (to: string, message: string, subject?: string) => Promise<boolean>;
  sendActivationEmail: (to: string, token: string) => Promise<boolean>;
}