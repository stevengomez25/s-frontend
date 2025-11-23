import React, { useState, useEffect, useCallback } from "react";
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

// Interfaz para el estado del modal de confirmación
interface ConfirmationAction {
  id: string;
  type: "cancel" | "confirm";
  clientName: string;
  timeSlot: string;
  date: string;
}

// URL base para las llamadas API
const API_BASE_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/appointments`;

const TrainerDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para manejar el modal de confirmación/cancelación personalizado
  const [actionToConfirm, setActionToConfirm] =
    useState<ConfirmationAction | null>(null);

  // Función para obtener las citas, envuelta en useCallback para useEffect
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // GET /api/appointments
      const response = await axios.get<Appointment[]>(API_URL);
      // Ordenar citas: primero por fecha, luego por hora.
      const sortedAppointments = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.timeSlot}:00`);
        const dateB = new Date(`${b.date}T${b.timeSlot}:00`);
        return dateA.getTime() - dateB.getTime();
      });
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Error al obtener citas:", err);
      setError("No se pudieron cargar las citas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  function formatearFecha(fechaString: string): string {
    const [year, month, day] = fechaString.split("-").map(Number);
    // Usamos new Date(año, mes-1, día) para evitar problemas de huso horario
    const fecha = new Date(year, month - 1, day); 

    const opcionesDeFormato: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    return fecha.toLocaleString("es-ES", opcionesDeFormato);
  }

  // --- Funciones de Manejo de Acciones ---

  const handleStartConfirmation = (
    id: string,
    type: "cancel" | "confirm",
    app: Appointment
  ) => {
    setActionToConfirm({
      id,
      type,
      clientName: app.clientName,
      timeSlot: app.timeSlot,
      date: formatearFecha(app.date),
    });
  };

  const handleCancel = async () => {
    if (!actionToConfirm || actionToConfirm.type !== "cancel") return;
    const { id } = actionToConfirm;
    setActionToConfirm(null); // Cerrar el modal antes de la acción

    try {
      // PATCH /api/appointments/:id/cancel
      await axios.patch(`${API_URL}/${id}/cancel`);
      alert("Cita cancelada exitosamente."); // Usaremos alert temporalmente
      fetchAppointments();
    } catch (err) {
      console.error("Error al cancelar:", err);
      alert("Fallo al cancelar la cita.");
    }
  };

  const handleConfirm = async () => {
    if (!actionToConfirm || actionToConfirm.type !== "confirm") return;
    const { id } = actionToConfirm;
    setActionToConfirm(null); // Cerrar el modal antes de la acción

    try {
      // PATCH /api/appointments/:id/confirm (ASUMIENDO que este endpoint existe en el backend)
      await axios.patch(`${API_URL}/${id}/confirm`);
      alert("Cita confirmada exitosamente."); // Usaremos alert temporalmente
      fetchAppointments();
    } catch (err) {
      console.error("Error al confirmar:", err);
      alert("Fallo al confirmar la cita. ¿Ya estaba confirmada?");
    }
  };

  const ConfirmationModal: React.FC = () => {
    if (!actionToConfirm) return null;

    const action = actionToConfirm.type === "confirm" ? "Confirmar" : "Cancelar";
    const actionHandler =
      actionToConfirm.type === "confirm" ? handleConfirm : handleCancel;

    return (
      <div className="custom-modal-backdrop">
        <div className="custom-modal-content">
          <h3>
            {action === "Confirmar"
              ? "✅ Confirmar Cita"
              : "🚫 Cancelar Cita"}
          </h3>
          <p>
            ¿Estás seguro de que deseas **{action.toLowerCase()}** la cita para
            **{actionToConfirm.clientName}** el día{" "}
            **{actionToConfirm.date}** a las{" "}
            **{actionToConfirm.timeSlot}**?
          </p>
          <div className="modal-actions">
            <button
              onClick={() => setActionToConfirm(null)}
              className="modal-btn modal-btn-secondary"
            >
              Cerrar
            </button>
            <button
              onClick={actionHandler}
              className={`modal-btn modal-btn-${actionToConfirm.type}`}
            >
              Sí, {action}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading)
    return <div className="dashboard-loading">Cargando Agenda...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="trainer-dashboard">
      <ConfirmationModal />
      
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
                {app.status === "pending" ? (
                  // Si está pendiente, se convierte en un botón de acción
                  <button
                    className="status-button pending"
                    onClick={() =>
                      handleStartConfirmation(app._id, "confirm", app)
                    }
                    title="Clic para confirmar la cita"
                  >
                    PENDIENTE (Clic para confirmar)
                  </button>
                ) : (
                  // Si está confirmado o cancelado, es solo un span
                  <span className={`status ${app.status}`}>
                    {app.status.toUpperCase()}
                  </span>
                )}

                {/* Botón de Cancelar, ahora inicia el modal */}
                <button
                  className="cancel-btn"
                  onClick={() =>
                    handleStartConfirmation(app._id, "cancel", app)
                  }
                  disabled={app.status === "cancelled"}
                >
                  {app.status === "cancelled" ? "Cancelada" : "Cancelar Cita"}
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