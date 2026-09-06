import { checkLoginErrors, render } from '@/helpers';
import { AuthService } from '@/services';
import { Request, Response, NextFunction } from 'express';


export const requireDashboardAuth = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    const { fieldsAreOk, emailError, passwordError } = checkLoginErrors(email, password);
    const action = req.originalUrl;
    const options = {
      email,
      title: 'Sign in',
      buttonText: 'Login',
      action,
      errors: {
        email: emailError,
        password: passwordError,
        general: undefined
      }
    };

    if (!fieldsAreOk) {
      return render(res, 'authenticate', options);
    }

    const validCredentials = await authService.checkEmailPassword(email, password);
    if (!validCredentials) {
      return render(res, 'authenticate', {
        ...options,
        errors: {
          ...options.errors,
          general: 'Invalid credentials'
        }
      });
    }
    next();
  };
};