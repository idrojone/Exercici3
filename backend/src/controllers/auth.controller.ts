import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Faltan campos' });

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email ya está en uso' });

    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash: hash });

    const token = signToken({ id: user._id, email: user.email });
    return res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Credenciales inválidas' });

    const token = signToken({ id: user._id, email: user.email });
    return res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await UserModel.find().select('name email').lean();
    return res.json({ users });
  } catch (err) {
    console.error('getUsers error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export default { register, login, getUsers };
