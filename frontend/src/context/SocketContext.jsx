import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { io } from 'socket.io-client'
import { AuthContext } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { token, logout } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!token) return;
        
        const s = io(import.meta.env.VITE_API_URL_WS, {
            auth: { token },
            autoConnect: false,
            transports: ['websocket'],
            reconnection: true,
        });

        const onConnect = () => console.log('Socket conectado', s.id);
        const onDisconnect = (reason) => console.log('Socket desconectado', reason);
        const onConnectError = (err) => {
            console.error('Socket connect_error', err);
            if (err && (err.message?.toLowerCase().includes('auth') || err === 'Authentication error')) {
                try { s.close(); } catch (e) {}
                logout();
            }
        };

        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('connect_error', onConnectError);

        s.connect();

        setSocket(s);
        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('connect_error', onConnectError);
            try { s.close(); } catch (e) {}
            setSocket(null);
        }
    }, [token, logout])

    const joinConversation = useCallback((conversationId) => {
        if (!socket) return;
        socket.emit('join', conversationId);
    }, [socket]);

    const sendMessage = useCallback((payload, cb) => {
        if (!socket) return;
        socket.emit('message:send', payload, cb);
    }, [socket]);

    const setTyping = useCallback((conversationId, isTyping) => {
        if (!socket) return;
        socket.emit('message:typing', { conversationId, typing: isTyping });
    }, [socket]);

    const leaveConversation = useCallback((conversationId) => {
        if (!socket) return;
        socket.emit('leave', conversationId);
    }, [socket]);

    const value = useMemo(() => ({ socket, joinConversation, sendMessage, setTyping, leaveConversation }), [socket]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext);