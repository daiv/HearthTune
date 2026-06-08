import { expiresIn, sendEmail } from "../helpers";
import { IAuthService } from "@/interfaces/IAuthService";
import { User, UserCredentials } from "@/types/types";
import { UserService } from "./UserService";

export class AuthService implements IAuthService {

  constructor(private userService: UserService) { }

  async sendActivationLink(to: string, token: string): Promise<boolean> {
    const mailSuccess = await sendEmail(to, token);
    return mailSuccess.rejected.length === 0;
  }

  async sendActivationLinks() {
    type UserResponse = User & { activated: boolean };
    const usersToEmail: UserResponse[] = (await this.userService.getWhiteListedUsers())?.map(user => {
      const credentials: UserCredentials = {
        expiration: expiresIn(12),
        token: crypto.randomUUID()
      };
      return { ...user, credentials, activated: false };
    }) || [];

    const usersSuccessfullyMailed = (await Promise.allSettled(usersToEmail
      .map(async (user) => {
        const { email, credentials } = user;
        const activated = await this.sendActivationLink(email, credentials!.token);
        return { ...user, activated };
      })
    ))
      .filter((res): res is PromiseFulfilledResult<UserResponse> => res.status === 'fulfilled')
      .map(userResponse => {
        const { activated, ...plainUser } = userResponse.value;
        return plainUser;
      });

    await Promise.all(usersSuccessfullyMailed.map(async (user) => {
      const updatedUser: User = { ...user, status: "email sent" }
      return this.userService.saveUser(updatedUser);
    }));
  }
}