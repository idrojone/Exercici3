import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { setError } from '../components/error';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        setLoading(false);
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const res = await fetch(import.meta.env.VITE_API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            let errBody = {};
            try { errBody = await res.json(); } catch (e) {}
            const msg = errBody?.message || 'Error al iniciar sesión.';
            setError(msg);
            throw new Error(msg);
        }

        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }, []);


    const register = useCallback(async ({ name, email, password }) => {
        const res = await fetch(import.meta.env.VITE_API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            let errBody = {};
            try { errBody = await res.json(); } catch (e) {}
            const msg = errBody?.message || 'Error al registrar el usuario.';
            setError(msg);
            throw new Error(msg);
        }
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Swal.fire({
            icon: 'success',
            title: 'Exitoso',
            text: 'Logout exitoso',
        });
    }, []);

    const value = useMemo(() => ({ user, token, loading, login, logout, register }), [user, token, loading, login, logout, register]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
