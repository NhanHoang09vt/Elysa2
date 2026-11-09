import { Router } from 'express';
import { AuthService } from '../services/auth.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();
const authService = new AuthService();

authRouter.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, username, email, password } = req.body;
    const identifier = usernameOrEmail || username || email;
    const result = await authService.login(identifier, password);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

authRouter.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json({ success: true, data: req.user });
});
