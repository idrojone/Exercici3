import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

function Users() {

    const [users, setUsers] = useState([]);
    const { token, logout, login } = useContext(AuthContext);
    const { socket, presence } = useSocket();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    console.error('Failed to fetch users', res.status);
                    if (res.status === 401) {
                        logout();
                    }
                    return;
                }
                const data = await res.json();
                console.log(data.users);
                setUsers(data.users);

            } catch (err) {
                console.error('Error fetching users', err);
            }
        };
        fetchUsers();
    }, [token, logout, login]);

    useEffect(() => {
        if (!presence || Object.keys(presence).length === 0) return;
        setUsers(prev => prev.map(u => ({ ...u, online: presence[u._id || u.id] ?? u.online })));
    }, [presence]);

    useEffect(() => {
        if (!socket) return;
        const onPresence = ({ userId, online }) => {
            setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, online } : u));
        };
        socket.on('presence:update', onPresence);
        return () => socket.off('presence:update', onPresence);
    }, [socket]);

    useEffect(() => {
        const onUserCreated = (e) => {
            const user = e.detail;
            setUsers(prev => prev.some(u => (u._id || u.id) === user._id) ? prev : [user, ...prev]);
        };
        const onUserUpdated = (e) => {
            const user = e.detail;
            setUsers(prev => prev.map(u => (u._id === user._id || u.id === user._id) ? { ...u, ...user } : u));
        };
        window.addEventListener('user:created', onUserCreated);
        window.addEventListener('user:updated', onUserUpdated);
        return () => {
            window.removeEventListener('user:created', onUserCreated);
            window.removeEventListener('user:updated', onUserUpdated);
        };
    }, []);

    return (
        <div className="w-full h-full p-4">
            <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>

            <ul>
                {users.length === 0 ? (
                    <li>No hay usuarios.</li>
                ) : (
                    users.map(user => (
                        <li
                            key={user._id || user.id}
                            className="mb-3 p-2 border-b border-gray-50"
                            aria-label={`Usuario ${user.name || user.email}`}

                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <div>
                                        {user.name}
                                        {user.online === true && (
                                            <span className="text-green-500 ml-2" aria-label="Online">●</span>
                                        ) || user.online === false && (
                                            <span className="text-red-500 ml-2" aria-label="Offline">●</span>
                                        )}
                                    </div>
                                    {user.email && (
                                        <div title={user.email}>
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default Users;