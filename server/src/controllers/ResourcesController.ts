import { checkEmail, checkLoginErrors, render } from "@/helpers";
import { IResourcesController } from "@/interfaces/IResourcesController";
import { AuthService } from "@/services";
import { ResourcesService } from "@/services/ResourcesService";
import { LoginProps } from "@/types/types";
import { Request, Response } from 'express';

export class ResourcesController implements IResourcesController {
  constructor(private resourcesService: ResourcesService, private authService: AuthService) { }

  downloadAndroidApp = (req: Request, res: Response) => {
    try {
      res.download(this.resourcesService.getAndroidAppDownloadPath());
    } catch (error) {
      console.error(error);
    }
  }
  renderDownloadLogin = (req: Request, res: Response) => {
    console.log('endpoint reached');
    const { email } = req.params;
    res.render('downloadLogin', { errors: {}, email });
  }

  downloadAndroidAppWithCredentials = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const emailError = checkEmail(email);
    const passwordError = !password ? 'Password can not be empty' : '';
    try {
      const isValid = await this.authService.checkEmailPassword(email, password);
      const general = emailError || passwordError ? 'Check fields' : 'Invalid credentials';
      if (!isValid) {
        return res.render('downloadLogin', { errors: { general, email: emailError, password: passwordError }, email });
      }

      return res.download(this.resourcesService.getAndroidAppDownloadPath());
    } catch (error) {
      console.error(error);
      return res.render('downloadLogin', {
        errors: { email: 'Server error. Please try again later.' },
        email
      });
    }
  }

  renderDashBoard = (req: Request, res: Response) => {
    render(res, 'authenticate', { title: 'Sign in', buttonText: 'Login' });

  }
  dashBoard = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { fieldsAreOk, emailError, passwordError } = checkLoginErrors(email, password);
    const options: LoginProps = {
      email,
      title: 'Sign in',
      buttonText: 'Login',
      errors: {
        email: emailError,
        password: passwordError,
        general: undefined
      }
    }
    if (!fieldsAreOk) return render(res, 'authenticate', options);

    const validCredentials = await this.authService.checkEmailPassword(email, password);
    if (!validCredentials) return render(res, 'authenticate',
      {
        ...options,
        errors: {
          ...options.errors,
          general: 'Invalid credentials'
        }
      });

    return res.download(this.resourcesService.getAndroidAppDownloadPath());

  }
}