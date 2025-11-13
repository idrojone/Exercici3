import { Server } from "socket.io";
import { socketAuthenticate } from "../middlewares/socketAuth.middleware";
import registerChatHandlers from "./chat";

export async function initSockets(io: Server) {
    io.use((socket, next) => {
        return socketAuthenticate(socket as any, next as any);
    });

    registerChatHandlers(io);
}