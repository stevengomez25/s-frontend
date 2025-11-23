import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TrainerDashboard.css';

// Interfaz para tipar los datos recibidos de la API
interface Appointment {
    _id: string;
    date: string; // YYYY-MM-DD
    timeSlot: string; // HH:MM
    clientName: string;
    clientEmail: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/appointments`; // Asegúrate de mantener la ruta /api/appointments si es necesario

const TrainerDashboard: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // GET /api/appointments
            const response = await axios.get<Appointment[]>(API_URL);
            setAppointments(response.data);
        } catch (err) {
            console.error('Error al obtener citas:', err);
            setError('No se pudieron cargar las citas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (id: string) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
            return;
        }

        try {
            // PATCH /api/appointments/:id/cancel
            await axios.patch(`${API_URL}/${id}/cancel`);
            alert('Cita cancelada exitosamente.');
            // Refrescar la lista de citas
            fetchAppointments(); 
        } catch (err) {
            console.error('Error al cancelar:', err);
            alert('Fallo al cancelar la cita.');
        }
    };

    if (isLoading) return <div className="dashboard-loading">Cargando Agenda...</div>;
    if (error) return <div className="dashboard-error">Error: {error}</div>;

    return (
        <div className="trainer-dashboard">
            <h2>Agenda del Entrenador ({appointments.length} Citas Activas)</h2>
            <button onClick={fetchAppointments} className="refresh-button">Actualizar Agenda</button>
            
            {appointments.length === 0 ? (
                <p className="no-appointments">¡Felicidades! No tienes citas activas pendientes.</p>
            ) : (
                <div className="appointment-list">
                    {appointments.map((app) => (
                        <div key={app._id} className="appointment-card">
                            <div className="card-info">
                                <p className="date-time">
                                    📅 {app.date} ⏰ {app.timeSlot}
                                </p>
                                <p>👤 **Cliente:** {app.clientName}</p>
                                <p>📧 **Email:** {app.clientEmail}</p>
                            </div>
                            <div className="card-actions">
                                <span className={`status ${app.status}`}>
                                    {app.status.toUpperCase()}
                                </span>
                                <button 
                                    className="cancel-btn"
                                    onClick={() => handleCancel(app._id)}
                                >
                                    Cancelar Cita
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;