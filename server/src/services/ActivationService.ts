import { UserNotFoundException } from "@/errors/ServerError";
import { createValidationCredentials, sendActivationEmail, sendEmail } from "@/helpers";
import { IActivationService } from "@/interfaces/IActivationService";
import { UserModel } from "@/models";
import { UserRepository } from "@/repositories";
import { Credential, IsTokenLegitResponse, User } from "@/types/types";

export class ActivationService implements IActivationService {
  constructor(private userRepository: UserRepository) { }

  async sendActivationLink(to: string, token: string): Promise<boolean> {
    const mailSuccess = await sendActivationEmail(to, token);
    return mailSuccess.rejected.length === 0;
  }
  async enableUserAccount(userId: string): Promise<boolean> {

    const user = await UserModel.findById({ _id: userId });
    if (!user) throw new UserNotFoundException();
    if (!user.password) throw new Error('password is not set');

    if (user.credentials) {
      const removedCredentials = await this.userRepository.removeCredentials(userId);
    }
    user.status = "active";
    user.activatedAt = new Date();
    return !!(await this.userRepository.save(user));
  }

  prepareUserCredentials(user: User): User & { emailSent: boolean } {
    const credentials: Credential = createValidationCredentials();
    console.log('user:', user.email);
    const activationUrl = `${process.env.SERVER_URL}/validation/${credentials?.token}`;
    console.log('activationLink', activationUrl);
    return { ...user, credentials, emailSent: false };
  }

  async sendActivationLinkToWhiteListedUsers() {
    const usersToEmail = (await this.userRepository.getUserByStatus('whiteListed')) || [];
    await this.sendActivationLinkTo(usersToEmail);
  }
  async requestNewLinkToAdmin(token: string): Promise<boolean> {
    console.log('requested new link...');
    if (!token) return false;
    const user = await this.getUserByToken(token);
    if (!user) return false;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (!superAdminEmail) return false;

    const { emailSent, ...preparedUser } = this.prepareUserCredentials(user);

    const activationLink = `${process.env.SERVER_URL}/allow-new-link/${preparedUser.credentials?.token}`;
    preparedUser.status = 'new_invitation_requested';
    await this.userRepository.save(preparedUser);
    const message = `
      <p>${preparedUser.email} requests a new link to activate his account. 
      The previous token expired at ${preparedUser.credentials?.expiresAt.toDateString()}.</p>
      
      <p>Click here to approve the request:</p>
      <a href="${activationLink}">Approve New Access</a>
    `;
    const isEmailSentToAdmin = await sendEmail(superAdminEmail, message, 'new invitation request');
    if (isEmailSentToAdmin) return true;
    return false;
  }
  async sendActivationLinkTo(usersToEmail: User[]): Promise<void> {
    type UserResponse = User & { emailSent: boolean };
    const users = usersToEmail.map(this.prepareUserCredentials);
    const usersSuccessfullyMailed = (await Promise.allSettled(users
      .map(async (user: UserResponse) => {
        const { email, credentials } = user;
        const emailSent = await this.sendActivationLink(email, credentials!.token);
        return { ...user, emailSent };
      })
    ))
      .filter((res): res is PromiseFulfilledResult<UserResponse> => res.status === 'fulfilled' && res.value.emailSent)
      .map(userResponse => {
        const { emailSent, ...plainUser } = userResponse.value;
        return plainUser;
      });

    await Promise.all(usersSuccessfullyMailed.map(async (user) => {
      const updatedUser: User = { ...user, status: "verification_pending" }
      return this.userRepository.save(updatedUser);
    }));
  }

  async isValidationTokenLegit(token: string): Promise<IsTokenLegitResponse> {
    const validationResponse = await this.userRepository.getCredentialsFromValidationToken(token);
    if (!validationResponse || !validationResponse?.credentials) return { valid: false, cause: "invalid token" };
    const { id, credentials } = validationResponse;
    const now = new Date();

    if (now > credentials.expiresAt) return { valid: false, cause: "token expired" };
    return { valid: true, ...validationResponse };
  }

  async updateStateByExpiredToken(token: string): Promise<boolean> {
    const result = await this.userRepository.getCredentialsFromValidationToken(token);
    if (!result || !result.credentials || !token) return false;
    const now = new Date();
    const expired = now > result.credentials.expiresAt;

    if (expired) {
      const id = result.id || (await this.getUserByToken(token))?.id || null;
      if (!id) return false;
      await this.userRepository.setUserStatus(id, 'invitation_expired');
      return true;
    }
    return false;
  }
  async getUserByToken(token: string): Promise<User | null> {
    const user = await this.userRepository.getUserByToken(token);
    return user;
  }

  async removeCredentials(userId: string): Promise<boolean> {
    return await this.userRepository.removeCredentials(userId);
  }
}