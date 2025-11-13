import { useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from 'react-router-dom';
import MessageList from '../components/messageList';
import MessageInput from '../components/messageInput';

function Chat (props) {
    const location = useLocation();
    const state = location.state || {};
    const conversationId = props.conversationId || state.conversationId || new URLSearchParams(location.search).get('conversationId') || 'global';

    const { token, user } = useContext(AuthContext);
    const { socket, joinConversation, leaveConversation, sendMessage, setTyping } = useSocket();
    const [messages, setMessages] = useState([]);
    const fetchRef = useRef(false);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!conversationId || !token || fetchRef.current) return;
            fetchRef.current = true;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/${conversationId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    console.error('Failed to fetch messages', res.status);
                    return;
                }
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error('Error fetching messages', err);
            }
        };
        fetchMessages();
    }, [conversationId, token]);

    useEffect(() => {
        if (!socket) return;
        // join the conversation room (global or named)
        try { joinConversation?.(conversationId); } catch (e) {}

        const onReceive = (msg) => {
            setMessages(prev => {
                if (!msg || !msg._id) return prev;
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on('message:receive', onReceive);

        return () => {
            try { leaveConversation?.(conversationId); } catch (e) {}
            socket.off('message:receive', onReceive);
        };
    }, [socket, conversationId, joinConversation, leaveConversation]);

    useEffect(() => {
        if (!socket || !user) return;
        const unread = messages
            .filter(m => !(m.readBy || []).includes(user.id))
            .map(m => m._id)
            .filter(Boolean);
        if (unread.length > 0) {
            socket.emit('message:seen', { conversationId, messageIds: unread });
        }
    }, [messages, socket, user, conversationId]);

    const handleSend = async ({ text, recipients }) => {
        if (!sendMessage) return { ok: false, error: 'No socket helper' };
        return new Promise((resolve) => {
            sendMessage({ conversationId, text, recipients: recipients || [] }, (ack) => {
                resolve(ack);
            });
        });
    };

    return (
        <div className="h-187.5 flex flex-col md:flex-row bg-green-100">
            {/* <aside className="md:w-64 w-full bg-white md:border-r md:border-gray-200 p-4 overflow-auto">
                <h2 className="text-lg font-semibold mb-3">Usuarios</h2>
                <UserList />
            </aside> */}

            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-auto p-4">
                    <MessageList
                        messages={messages}
                        currentUserId={user?.id}
                        currentUserName={user?.name}
                    />
                </div>

                <div className="border-t p-3 bg-white">
                    <MessageInput
                        onSend={handleSend}
                        participants={[]}
                        currentUserId={user?.id}
                        currentUserName={user?.name}
                        onTyping={(isTyping) => { try { setTyping(conversationId, isTyping); } catch (e) {} }}
                    />
                </div>
            </main>
        </div>
    );
}

export default Chat;