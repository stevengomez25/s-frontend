import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Importamos las páginas específicas:
import CalendarPage from './components/CalendarPage/CalendarPage'; 
import AuthPage from './components/AuthPage/AuthPage';
import TrainerDashboard from './components/TrainerDashboard/TrainerDashboard';
import './App.css'; // Estilos globales

const App: React.FC = () => {
    // Estado de autenticación global
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Función para manejar el logout (opcional)
    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>¡Agenda tu Entrenamiento!</h1>
                    <nav className="main-nav">
                        {/* Usamos <a> para recargar la página si es necesario, o Link de react-router-dom */}
                        <a href="/">Agendar Cita</a> | 
                        {isAuthenticated ? (
                            <>
                                <a href="/dashboard">Dashboard</a> | 
                                <button onClick={handleLogout} className="logout-btn">
                                    Salir
                                </button>
                            </>
                        ) : (
                            <a href="/login">Acceso Entrenador</a>
                        )}
                    </nav>
                </header>
                
                <main>
                    <Routes>
                        {/* Ruta de Agendamiento de Citas (Cliente) */}
                        {/* Simplemente renderizamos la página que contiene el calendario */}
                        <Route path="/" element={<CalendarPage />} /> 
                        
                        {/* Ruta de Login/Auth */}
                        <Route 
                            path="/login" 
                            element={<AuthPage onLogin={setIsAuthenticated} />} 
                        />
                        
                        {/* Ruta del Dashboard (Protegida) */}
                        <Route 
                            path="/dashboard" 
                            // Si está autenticado, muestra el Dashboard. Si no, redirige a Login.
                            element={isAuthenticated ? <TrainerDashboard /> : <Navigate to="/login" replace />} 
                        />
                        
                        {/* 404/Ruta por defecto */}
                        <Route path="*" element={<h1>404: Página no encontrada</h1>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;