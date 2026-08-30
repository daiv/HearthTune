import { checkEmail } from "@/helpers";
import { IResourcesController } from "@/interfaces/IResourcesController";
import { AuthService } from "@/services";
import { ResourcesService } from "@/services/ResourcesService";
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
}