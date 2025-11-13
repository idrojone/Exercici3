import { Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import UserModel from "../models/User";

export async function socketAuthenticate( socket: Socket, next: (err?: Error) => void ){
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Token no proporcionado'));
        }
        
        const payload = verifyToken(token);

        const user = await UserModel.findById(payload.id);
        if (!user) return next(new Error('Usuario no encontrado'));

        socket.data.user = { id: user._id.toString(), email: user.email, name: (user as any).name };

        return next();
        
    } catch (error) {
        next(new Error('Autenticación fallida'));
    }
}