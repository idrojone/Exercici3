import { verify } from "crypto";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import UserModel from "../models/User";

export async function initSockets(io: Server) {
    
    // // Middleware de auth para el handshake
    // io.use(async (socket: Socket, next) => {
    //     try {
    //         const token = (socket.handshake.query && (socket.handshake.query as any).token);

    //         if (!token) return next(new Error('Unauthorized'))

    //         const payload: any = verifyToken(String(token));

    //         const user = await UserModel.findById(payload.id).select('name email avatar');
    //         if (!user) return next(new Error('Unauthorized: user not found'));

    //         socket.data.user = { id: user._id.toString(), name: user.name, email: user.email, avatar: user.avatar };
    //         return next();
    //     } catch (err) {
    //         console.error('Socket auth error:', err);
    //         return next(new Error('Unauthorized'));
    //     }
    // })

    // Registro de handlers de conexión
    io.on('connection', (socket: Socket) => {
        console.log('Socket conectado', socket.id, socket.data.user);

        socket.on('join', ({ roomId }: { roomId: string }) => {
            if (!roomId) return;
            socket.join(roomId);
            socket.to(roomId).emit('server:room', { roomId, user: socket.data.user, action: 'join' });
        });

        socket.on('leave', ({ roomId }: { roomId: string }) => {
            if (!roomId) return;
            socket.leave(roomId);
            socket.to(roomId).emit('server:room', { roomId, user: socket.data.user, action: 'leave' });
        });

        // Ejemplo: emitir mensaje a la sala. Reemplaza por persistencia en DB si quieres.
        socket.on('message', (payload: { roomId: string; text: string }) => {
            if (!payload || !payload.roomId || !payload.text) return;
            const msg = {
                id: undefined, // si persistes, reemplaza por id real
                roomId: payload.roomId,
                text: payload.text,
                sender: socket.data.user,
                createdAt: new Date().toISOString(),
            };
            io.to(payload.roomId).emit('server:message', msg);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket desconectado', socket.id, reason);
        });
    });
}