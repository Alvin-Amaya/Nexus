import { authService } from '../services/auth.service.js';

// Los controladores solo traducen HTTP <-> servicio; la lógica vive en services/.
export const authController = {
  register: async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  login: async (req, res) => {
    const result = await authService.login(req.body);
    res.json(result);
  },

  me: async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  },
};
