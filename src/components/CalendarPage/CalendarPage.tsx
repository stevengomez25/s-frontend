import React, { useState } from "react";
// Asegúrate de que las rutas relativas a los componentes sean correctas
import Calendar from "../Calendar/Calendar";
import BookingModal from "../BookingModal/BookingModal";
import axios from "axios";
// Si App.css contiene estilos globales, puede que necesites moverlos a un archivo más genérico
// o importarlo aquí, dependiendo de dónde estén realmente los estilos del body.
import '../../App.css'

// URL base del backend
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE_URL}/api/appointments`;

// Interfaz para el tipo de datos que maneja el modal
interface ClientData {
    name: string;
    email: string;
}

// Renombramos el componente principal a CalendarPage
const CalendarPage: React.FC = () => {
  // Estado para la última fecha seleccionada
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // Estado para almacenar los slots de tiempo disponibles
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  // Estado para manejar la carga (loading)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<
    string | null
  >(null);

  /**
   * Carga los slots disponibles desde la API al seleccionar una fecha.
   * Esta función se pasa como prop al componente Calendar.
   */
  const fetchAvailableSlots = async (date: Date) => {
    // 1. Actualizar estado y UI
    setSelectedDate(date);
    setIsLoading(true);
    setAvailableSlots([]); // Limpiamos los slots anteriores

    // 2. Formatear la fecha a YYYY-MM-DD
    const dateString = date.toISOString().split("T")[0];

    try {
      // 3. Llamada al Backend
      const response = await axios.get<{ slots: string[] }>(
        `${API_URL}/slots/${dateString}`
      );

      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error("Error al obtener los slots:", error);
      setAvailableSlots([]);
      alert(
        "⚠️ Hubo un error al cargar los horarios disponibles. Verifica que el Backend esté corriendo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (timeSlot: string) => {
    // Si tenemos una fecha seleccionada, abrimos el modal
    if (selectedDate) {
      setSelectedSlotForBooking(timeSlot);
    }
  };
  
  const handleConfirmBooking = (data: ClientData) => {
    if (!selectedDate || !selectedSlotForBooking) return;

    // Convertimos la fecha a string YYYY-MM-DD
    const dateString = selectedDate.toISOString().split("T")[0];

    // Cierre inmediato del modal para mejorar la sensación de respuesta
    setSelectedSlotForBooking(null);

    // Llamada al endpoint POST para crear la cita
    axios
      .post(`${API_URL}`, {
        date: dateString,
        timeSlot: selectedSlotForBooking,
        clientName: data.name, // Datos del modal
        clientEmail: data.email, // Datos del modal
        duration: 30,
      })
      .then((response) => {
        alert(
          `🎉 Cita confirmada para ${selectedSlotForBooking}. ¡Revisa tu email!`
        );
        console.log("Reserva exitosa:", response.data);
        // Volvemos a cargar los slots para reflejar el cambio
        fetchAvailableSlots(selectedDate);
      })
      .catch((error) => {
        console.error("Error al reservar:", error.response?.data || error);
        alert(
          `🚫 Fallo en la reserva: ${
            error.response?.data?.message || "Error desconocido"
          }`
        );
      });
  };

  const handleCloseModal = () => {
    setSelectedSlotForBooking(null);
  };
  
  return (
    // Ya no incluimos el Header global aquí para evitar duplicados en el router
    <div> 
      
      <main>
        {/* Usamos fetchAvailableSlots como callback en el componente Calendar */}
        <Calendar onDateSelect={fetchAvailableSlots} />

        <div className="appointment-slots">
          <h3>Slots Disponibles:</h3>

          {isLoading && selectedDate && (
            <p>
              Cargando horarios para el{" "}
              <b>{selectedDate.toLocaleDateString("es-ES")}</b>...
            </p>
          )}

          {!isLoading && selectedDate && availableSlots.length > 0 && (
            // Mostrar los slots como botones clickeables
            <div className="slots-grid">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  className="slot-button"
                  onClick={() => handleSlotClick(slot)}
                  title={`Reservar a las ${slot}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}

          {!isLoading && selectedDate && availableSlots.length === 0 && (
            <p>
              🚫 No hay horarios disponibles para el{" "}
              {selectedDate.toLocaleDateString("es-ES")}.
            </p>
          )}

          {!selectedDate && (
            <p>Selecciona un día en el calendario para ver los horarios.</p>
          )}
        </div>
      </main>
      
      {/* Modal de reserva */}
      {selectedDate && selectedSlotForBooking && (
        <BookingModal
          date={selectedDate}
          timeSlot={selectedSlotForBooking}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default CalendarPage;