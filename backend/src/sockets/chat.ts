import { Server, Socket } from "socket.io";
import { Message } from "../models/Message";


type OnlineMap = Map<string, Set<string>>; // userId -> set(socketId)

export default function registerChatHandlers(io: Server) {
    const online: OnlineMap = new Map();

    io.on("connection", (socket: Socket) => {
        const user = socket.data.user;
        if (!user || !user.id) {
            socket.disconnect();
            return;
        }
       
        const userId: string = user.id;

        // añadir socket al mapa de presencia
        if (!online.has(userId)) online.set(userId, new Set());
        online.get(userId)!.add(socket.id);

        // opcional: emitir presencia a contactos
        socket.join(`user:${userId}`);
        // unir a la sala global para chat público
        socket.join(`conversation:global`);

        socket.on("join", (conversationId: string, cb?: (res: any) => void) => {
            socket.join(`conversation:${conversationId}`);
            cb?.({ ok: true });
        });

        socket.on("leave", (conversationId: string, cb?: (res: any) => void) => {
            socket.leave(`conversation:${conversationId}`);
            cb?.({ ok: true });
        });

        socket.on("message:send", async (payload: {
            conversationId: string;
            text?: string;
            recipients: string[]; // user ids
        }, ack) => {
            try {
                console.log('socket message:send from', userId, 'payload:', payload);
                // validaciones básicas
                    if (!payload || (!payload.text && (!payload.recipients || payload.recipients.length === 0))) {
                        return ack?.({ ok: false, error: "Invalid payload" });
                    }

                    // Si la conversación es la global, permitir a cualquiera
                    const convoId = payload.conversationId || 'global';
                    if (convoId !== 'global') {
                        // Comprobar que el emisor pertenece a la conversación
                        let isParticipant = false;
                        if (payload.recipients && payload.recipients.includes(userId)) isParticipant = true;
                        if (!isParticipant && convoId) {
                            const existing = await Message.findOne({
                                conversationId: convoId,
                                $or: [{ sender: userId }, { recipients: userId }]
                            }).lean();
                            if (existing) isParticipant = true;
                        }
                        if (!isParticipant) {
                            return ack?.({ ok: false, error: "Forbidden: not part of conversation" });
                        }
                    }

                const messageDoc = await Message.create({
                    conversationId: payload.conversationId || 'global',
                    sender: userId,
                    senderName: (user && (user as any).name) || '',
                    recipients: payload.recipients,
                    text: payload.text,
                    readBy: [userId],
                    createdAt: new Date()
                });


                const msg = messageDoc.toObject();

                // Emitir a la sala de conversación
                io.to(`conversation:${msg.conversationId}`).emit("message:receive", msg);

                // Conversation metadata updates removed — keeping only message broadcast for global chat.

                // Emitir también a cada destinatario conectado directamente (por si no están en la sala)
                payload.recipients.forEach(recipientId => {
                    const sockets = online.get(recipientId);
                    if (sockets) {
                        sockets.forEach(sid => io.to(sid).emit("message:receive", msg));
                    }
                });

                ack?.({ ok: true, message: msg });
            } catch (err) {
                console.error("message:send error", err);
                ack?.({ ok: false, error: "Internal error" });
            }
        });

        socket.on("message:typing", (data: { conversationId: string, typing: boolean }) => {
            // reenviar a los miembros de la conversación
            socket.to(`conversation:${data.conversationId}`).emit("message:typing", {
                userId,
                typing: data.typing
            });
        });

        socket.on("message:seen", async (data: { conversationId: string, messageIds: string[] }) => {
            try {
                // marcar como leídos en DB
                await Message.updateMany(
                    { _id: { $in: data.messageIds } },
                    { $addToSet: { readBy: userId } }
                );

                // Notificar al resto
                io.to(`conversation:${data.conversationId}`).emit("message:read", {
                    userId,
                    messageIds: data.messageIds
                });
            } catch (err) {
                console.error("message:seen error", err);
            }
        });

        socket.on("disconnect", () => {
            const set = online.get(userId);
            if (set) {
                set.delete(socket.id);
                if (set.size === 0) {
                    online.delete(userId);
                    // opcional: emitir presencia offline
                    io.emit("presence:update", { userId, online: false });
                }
            }
        });
    });
}