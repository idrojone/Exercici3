import { useEffect, useState, useContext } from 'react';
import { setError } from './error.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

function LogIn() {

    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [errorMail, setErrorMail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

     /**
     * Desactiva el scroll de la página cuando el componente se monta y lo reactiva al desmontarse.
     */
    useEffect(() => {
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        return () => {
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
        };
    }, []);

    const handleErrors = () => {
        let valid = true;
        setErrorMail('');
        setErrorPassword('');
        
        if (!regexEmail.test(email)) {
            setErrorMail('Por favor, ingresa un correo electrónico válido.');
            valid = false;
        }
        
        if (email.length === 0) {
            setErrorMail('Por favor, ingresa un correo electrónico.');
            valid = false;
        }
        
        if (password.length < 6) {
            setErrorPassword('La contraseña debe tener al menos 6 caracteres.');
            valid = false;
        }
        
        if (password.length === 0) {
            setErrorPassword('Por favor, ingresa una contraseña.');
            valid = false;
        }

        return valid;
    }

    const handleSubmit = async () => {
        if (!handleErrors()) return;
        try {
            const data = await login({ email, password });
            Swal.fire({
                icon: 'success',
                title: 'Exitoso',
                text: 'Inicio de sesión exitoso',
            });
            navigate('/');
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        }
    }

    return (
       <div className="flex flex-col justify-start bg-green-100 px-4 sm:px-6 lg:px-8 items-start pt-6" style={{ minHeight: 'calc(100vh - 9rem)' }}>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="../src/assets/whatsapp.png" alt="Your Company" className="mx-auto h-24 w-auto" />
                <h2 className="mt-4 text-center text-2xl leading-9 font-bold tracking-tight text-black">Inicia Sessión con tu cuenta</h2>
            </div>  

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm ">
                <form method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-black-100">Correo Electrónico</label>
                        <div className="mt-2">
                        <input id="email" type="email" name="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500 sm:text-sm/6" />
                        </div>
                        <span className='text-sm/4 font-small text-red-500'>{errorMail}</span>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm/6 font-medium text-black-100">Contraseña</label>
                        <div className="text-sm">
                            <a href="#" className="font-semibold text-green-400 hover:text-green-300">¿Olvidaste tu contraseña?</a>
                        </div>
                        </div>
                        <div className="mt-2">
                        <input id="password" type="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-green-500 sm:text-sm/6" />
                        </div>
                        <span className='text-sm/4 font-small text-red-500'>{errorPassword}</span>
                    </div>

                    <div>
                        <button type="submit"  onClick={(e) => { e.preventDefault(); handleSubmit(); }} className="flex w-full justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500">Iniciar Sesión</button>
                    </div>
                </form>
            </div>
        </div>
        
    );
}

export default LogIn;