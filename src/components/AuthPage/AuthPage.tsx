import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

// Simulamos que el nombre de usuario del entrenador es 'trainer'
const TRAINER_USERNAME = 'trainer';

interface AuthPageProps {
    onLogin: (isLoggedIn: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (username.toLowerCase() === TRAINER_USERNAME) {
            // Éxito: Llamamos al callback de login y navegamos
            onLogin(true);
            navigate('/dashboard'); 
        } else {
            setError('Nombre de usuario incorrecto.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Acceso para Entrenadores</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <label htmlFor="username">Nombre de Usuario:</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Inserte usuario"
                />
                
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="login-button">
                    Acceder
                </button>
            </form>
            <p className="auth-note">¡Bienvenido! Usa tu clave única para ingresar.</p>
        </div>
    );
};

export default AuthPage;