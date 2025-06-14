import { Request, Response } from "express";
import AuthService from "../services/auth.service";

export default class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const result = await AuthService.register({ email, password, name });
    res.status(result.status).json(result);
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    res.status(result.status).json(result);
  }

  static async me(req: Request, res: Response) {
    res.json({ user: (req as any).user });
  }
}
