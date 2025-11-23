import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TrainerDashboard.css";

// Interfaz para tipar los datos recibidos de la API
interface Appointment {
  _id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  clientName: string;
  clientEmail: string;
  status: "pending" | "confirmed" | "cancelled";
}

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
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
      console.error("Error al obtener citas:", err);
      setError("No se pudieron cargar las citas.");
    } finally {
      setIsLoading(false);
    }
  };

  function formatearFecha(fechaString: string): string {
    // 1. Crear un objeto Date a partir del string ISO.
    // La 'Z' indica UTC, por lo que el objeto Date se crea correctamente en ese huso horario.
    const fecha = new Date(fechaString);

    // 2. Definir las opciones de formato para obtener el estilo deseado.
    const opcionesDeFormato: Intl.DateTimeFormatOptions = {
      day: "numeric", // Mostrar el día como número (ej: 10)
      month: "long", // Mostrar el mes completo (ej: noviembre)
      year: "numeric", // Mostrar el año como número (ej: 2025)
    };

    // 3. Usar toLocaleString para formatear la fecha según las opciones y el idioma español.
    // 'es-ES' se usa aquí como un locale genérico de español. Puedes usar 'es-CO', 'es-MX', etc.
    const fechaFormateada = fecha.toLocaleString("es-ES", opcionesDeFormato);

    // El resultado de toLocaleString será algo como: "10 de noviembre de 2025"
    return fechaFormateada;
  }

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
      alert("Cita cancelada exitosamente.");
      // Refrescar la lista de citas
      fetchAppointments();
    } catch (err) {
      console.error("Error al cancelar:", err);
      alert("Fallo al cancelar la cita.");
    }
  };

  const handleConfirm = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres confirmar esta cita?")) {
      return;
    }
    try {
      await axios.patch(`${API_URL}/${id}/confirm`);
      alert("Cita confirmada exitosamente.");
      fetchAppointments();
    } catch (err) {
      console.error("Error al confirmar: ", err);
      alert("Fallo al confirmar la cita.");
    }
  };

  if (isLoading)
    return <div className="dashboard-loading">Cargando Agenda...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="trainer-dashboard">
      <h2>Agenda del Entrenador ({appointments.length} Citas Activas)</h2>
      <button onClick={fetchAppointments} className="refresh-button">
        Actualizar Agenda
      </button>

      {appointments.length === 0 ? (
        <p className="no-appointments">
          ¡Felicidades! No tienes citas activas pendientes.
        </p>
      ) : (
        <div className="appointment-list">
          {appointments.map((app) => (
            <div key={app._id} className="appointment-card">
              <div className="card-info">
                <p className="date-time">
                  📅 {formatearFecha(app.date)} ⏰ {app.timeSlot}
                </p>
                <p>👤 Cliente: {app.clientName}</p>
                <p>📧 Email: {app.clientEmail}</p>
              </div>
              <div className="card-actions">
                <button
                  className={`status ${app.status} pending-container`}
                  onClick={() => handleConfirm(app._id)}
                >
                    <span className="text-original">{app.status.toUpperCase()}</span>
                    <span className="text-hover">¿Confirmar?</span>
                </button>
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
