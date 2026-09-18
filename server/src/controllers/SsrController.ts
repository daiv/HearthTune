import { InvalidTokenException, ServerError, UserNotFoundException } from "@/errors/ServerError";
import { checkEmail, checkPassword, render } from "@/helpers";
import { ISsrController } from "@/interfaces/ISsrController";
import { SsrConstructorProps } from "@/types/types";
import { Request, Response } from "express";

export class SsrController implements ISsrController {

  constructor(private services: SsrConstructorProps) { }

  renderDashboard(_: Request, res: Response): void {
    render(res, 'dashboard', {
      title: 'dashBoard', actions: [
        { name: 'Forgot password', url: 'reset-password' },
        { name: 'Download apk', url: 'apk-download' },
      ],
    });
  };

  renderApkDownload(_: Request, res: Response): void {
    render(res, 'authenticate',
      {
        title: 'Download app',
        buttonText: 'Login',
        action: '/apk-download'
      });
  }

  apkDownload = async (_: Request, res: Response): Promise<void> => {
    const url = this.services.resourcesService.getAndroidAppDownloadPath();
    res.download(url);
  }

  renderResetPassword(_: Request, res: Response): void {
    render(res, 'forgotPassword',
      {
        action: '/reset-password',
        buttonText: 'reset',
        title: 'Reset password',
        errors: {}
      });
  }

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const emailError = checkEmail(email);

    if (emailError) return render(res,
      'forgotPassword',
      {
        action: '/reset-password',
        buttonText: 'reset',
        title: 'Reset password',
        errors: {
          email: emailError
        }
      }
    );
    const url = await this.services.authService.generateResetPasswordUrl(email);
    if (url) await this.services.mailService.sendEmail(email, `activation link is 
      ${url}`, 'Activation link');

    render(res, 'msg',
      {
        title: 'Thank you',
        header: 'Request received',
        message: 'If an account is associated with this email, you will receive a password reset link shortly.',
      });
  }

  renderSetPassword(req: Request, res: Response): void {
    const { token } = req.params;

    render(res, 'setNewPassword', {
      action: `/set-new-password`,
      buttonText: 'Set password',
      title: 'Set new password',
      token,
      errors: {
        password: '',
        matchPassword: '',
        general: '',
      }
    });
  }

  setPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password, matchPassword } = req.body;
    const passwordError = checkPassword(password);
    const matchError = matchPassword === password ? '' : 'Password do not match';

    if (!passwordError && !matchError) {
      const userId = await this.services.userService.getUserIdByResetPasswordToken(token);
      if (!userId) throw new ServerError();
      await this.services.userService.setUserPassword(userId, password);
      await this.services.authService.invalidateResetPasswordToken(userId);
      await this.services.sessionService.removeAll(userId);

      render(res, 'msg', {
        title: 'Success',
        header: 'Password changed.',
        message: 'Use your new password to enter.',

      })
    }
    else render(res, 'setNewPassword', {
      action: '/set-new-password',
      buttonText: 'Set password',
      title: 'Set new password',
      token,
      errors: {
        password: passwordError,
        matchPassword: matchError,
        general: '',
      }
    });
  }

  renderCreateAccount = (req: Request, res: Response): void => {
    const { token } = req.params
    render(res, 'createAccount', {
      action: '/create-account',
      buttonText: 'Create',
      title: 'Create account',
      token,
    });
  };

  createAccount = async (req: Request, res: Response): Promise<void> => {
    const { token, password, matchPassword, nick } = req.body
    const passwordError = checkPassword(password);
    const matchError = matchPassword === password ? '' : 'Password do not match';
    const nickError = nick === '' ? 'Nick can not be empty' : '';
    const user = await this.services.activationService.getUserByToken(token);
    if (!passwordError && !nickError) {
      if (!user) throw new InvalidTokenException();

      const success = await this.services.activationService.enableUserAccount(user.id, password, nick);
      if (!success) render(res, 'msg', {
        message: 'Unable to activate your account. Try again later',
        title: 'Errors'
      })
      else {
        const to = this.services.authService.createDownloadUrl(user.id);

        render(res, 'msg', {
          title: 'Welcome',
          header: 'Account activated',
          message: 'Welcome, now you can get the apk :)',
          link: {
            to,
            text: 'Download apk'
          }
        })
      }

    } else render(res, 'createAccount', {
      action: '/create-account',
      buttonText: 'Create',
      title: 'Create account',
      token,
      errors: {
        password: passwordError,
        matchPassword: matchError,
        nick: nickError
      }
    });
  };

  requestNewLink = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    const result = await this.services.activationService.requestNewLinkToAdmin(token);
    if (result) render(res, 'msg',
      {
        message: "Your request has been submitted to the administrator. We’ll notify you as soon as it’s approved. Thanks for your patience!",
        title: 'Request sent'
      });
  };

  allowNewLink = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    try {
      const user = await this.services.activationService.getUserByToken(token);
      if (!user) throw new UserNotFoundException();

      await this.services.activationService.sendActivationLinkTo([user]);
      render(res, 'msg', {
        message: `a new activation link has been sent to ${user.email}`,
        title: 'Success',
      })
    } catch (error) {
      console.error('error!', error);
    }
  };
}