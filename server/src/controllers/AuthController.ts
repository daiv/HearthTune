import { IAuthService } from "@/interfaces/IAuthService";
import { AuthService } from "@/services";
import { Request, Response } from 'express';

export class AuthController {
  constructor(private authService: IAuthService) { }
  validate = async (req: Request, res: Response) => {

    const { token } = req.params;
    console.log('token is', token);
    //todo check token
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
      console.log('try again');
      return res.render('createAccount', { errors, token });
    }

    console.log('Validación exitosa, procediendo a guardar...');
  }

}