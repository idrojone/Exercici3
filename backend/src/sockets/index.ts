import { Server } from "socket.io";
import { socketAuthenticate } from "../middlewares/socketAuth.middleware";
import registerChatHandlers from "./chat";
import { setIO } from './socketManager';

export async function initSockets(io: Server) {
    setIO(io);
    io.use((socket, next) => {
        return socketAuthenticate(socket as any, next as any);
    });

    registerChatHandlers(io);
}