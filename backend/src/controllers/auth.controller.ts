import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { signToken } from '../utils/jwt';
import { log } from 'console';
import { getIO } from '../sockets/socketManager';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Faltan campos' });

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email ya está en uso' });

    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash: hash, online: true });
 
    const token = signToken({ id: user._id, email: user.email });
    // emit user:created and presence to notify other clients
    try {
      const io = getIO();
      io?.emit('user:created', { user: { _id: user._id.toString(), name: user.name, email: user.email, online: true } });
      io?.emit('presence:update', { userId: user._id.toString(), online: true });
    } catch (e) {}
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

    user.online = true;
    await user.save();
    try {
      const io = getIO();
      io?.emit('presence:update', { userId: user._id.toString(), online: true });
      io?.emit('user:updated', { user: { _id: user._id.toString(), name: user.name, email: user.email, online: true } });
    } catch (e) {}
    
    const token = signToken({ id: user._id, email: user.email });
    return res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await UserModel.find().select('name email online').lean();
    return res.json({ users });
  } catch (err) {
    console.error('getUsers error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: 'Usuario no autenticado' });
    const user = await UserModel.findById(userId);
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });
    user.online = false;
    await user.save();
    try {
      const io = getIO();
      io?.emit('presence:update', { userId: user._id.toString(), online: false });
      io?.emit('user:updated', { user: { _id: user._id.toString(), name: user.name, email: user.email, online: false } });
    } catch (e) {}
    return res.json({ message: 'Logout exitoso' });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export default { register, login, getUsers, logout };
