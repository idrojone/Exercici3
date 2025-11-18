import { useContext } from 'react';
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext';

function Header() {

    const { user, logout } = useContext(AuthContext)
    // console.log(user);

    return (
        <header className="bg-green-500 text-white font-bold">
            <div className="p-4 relative">
                <img src="../src/assets/whatsapp.png" alt="Logo" className="w-40 absolute left-4 top-1/2 transform -translate-y-1/2 mt-6" />
                <h1 className="w-full text-center text-7xl">WhatsApp</h1>
            </div>
            <nav>
                <ul className="flex justify-center gap-8 p-4 bg-green-500 text-white font-bold">
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/chat">Chat</Link></li>
                    { !user && (
                        <>
                            <li><Link to="/login">Iniciar Sesión</Link></li>
                            <li><Link to="/register">Registrarse</Link></li>
                        </>)
                    }
                    { user && (
                        <>
                            <li>Bienvenido {user.name}</li>
                            <li><button onClick={logout}>Cerrar Sesión</button></li>
                        </>
                    )

                    }
                </ul>
            </nav>
        </header>
    );
}

export default Header;