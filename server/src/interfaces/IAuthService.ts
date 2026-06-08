export interface IAuthService {
  sendActivationLink: (to: string, token: string) => Promise<boolean>;
  sendActivationLinks: () => Promise<void>;
}