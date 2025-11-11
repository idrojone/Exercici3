import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from 'socket.io-client'
import { AuthContext } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!token) return;

        const s = io(import.meta.env.VITE_API_URL, {
            auth: {token},
            autoConnect: true,
            reconnection: true,
        });

        setSocket(s);

        s.on('connect', () => console.log('Socket conectado', s.id));
        s.on('disconnect', (reason) => console.log('Socket desconectaado', reason))

        return () => {
            s.off('connect');
            s.off('disconnect');
            s.close();
            setSocket(null);
        }
    }, [token])

    const value = useMemo(() => ({ socket }), [socket]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext);