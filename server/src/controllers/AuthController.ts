import { InvalidTokenException, UserNotFoundException } from "@/errors/ServerError";
import { IActivationService } from "@/interfaces/IActivationService";
import { IAuthController } from "@/interfaces/IAuthController";
import { IUserService } from "@/interfaces/IUserService";
import { Request, Response } from 'express';

export class AuthController implements IAuthController {
  constructor(private activationService: IActivationService, private userService: IUserService) { }

  validate = async (req: Request, res: Response) => {
    const { token } = req.params;
    res.render('createAccount', { errors: {}, token });
  }

  validateForm = async (req: Request, res: Response) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    const errors: { password?: string, match?: string } = {};

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/;

    if (password.length < 10) {
      errors.password = 'Password must be at least 10 characters long.';
    }
    else if (!passwordRegex.test(password)) {
      errors.password = 'Password must include at least one uppercase letter, one number, and one special symbol.';
    }

    if (password !== confirmPassword) {
      errors.match = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      console.log('Errors found');
      return res.render('createAccount', { errors, token });
    }

    const user = await this.activationService.getUserByToken(token);
    console.log('user is', user);
    if (!user) throw new InvalidTokenException();
    await this.userService.setUserPassword(user.id, password);
    const success = await this.activationService.enableUserAccount(user.id);

    if (success) res.render('welcome');
    else console.error('Unable to activate your account');

  }

  requestNewLink = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await this.activationService.requestNewLinkToAdmin(token);

    if (result) res.render('linkRequested');
    else res.render('errors', { message: 'Something went wrong. Please try again later.' });
  }

  allowNewLink = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    try {
      const user = await this.activationService.getUserByToken(token);
      if (!user) throw new UserNotFoundException();
      else console.log('user finally is', user);

      await this.activationService.sendActivationLinkTo([user]);
      res.render('success', { message: `A new activation link has been sent to ${user.email}` });
    } catch (error) {
      console.error('error!', error);
    }

  }
}