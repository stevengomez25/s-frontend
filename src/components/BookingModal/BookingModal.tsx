import React, { useState } from 'react';
import './BookingModal.css'; // Estilos para el modal

// Definición de las propiedades (Props) que recibirá el modal
interface BookingModalProps {
    date: Date; // Fecha seleccionada
    timeSlot: string; // Hora seleccionada
    onClose: () => void; // Función para cerrar el modal
    onConfirm: (data: { name: string, email: string }) => void; // Función para confirmar la reserva
}

const BookingModal: React.FC<BookingModalProps> = ({ date, timeSlot, onClose, onConfirm }) => {
    // Estados locales para los campos del formulario
    const [clientName, setClientName] = useState<string>('');
    const [clientEmail, setClientEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Formatear la fecha para mostrarla en el modal
    const formattedDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validación básica
        if (!clientName.trim() || !clientEmail.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        if (!clientEmail.includes('@') || !clientEmail.includes('.')) {
            setError('Por favor, ingresa un email válido.');
            return;
        }

        // Llamar a la función de confirmación pasada desde App.tsx
        onConfirm({ name: clientName.trim(), email: clientEmail.trim() });
    };

    return (
        // Contenedor principal del modal (overlay oscuro)
        <div className="modal-overlay" onClick={onClose}>
            {/* Contenido del modal (evitar que el clic en el contenido cierre el modal) */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Confirmar Reserva</h2>
                
                <div className="booking-summary">
                    <p>📅 Fecha: {formattedDate}</p>
                    <p>⏰ Hora: {timeSlot}</p>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                    <label htmlFor="clientName">Nombre Completo</label>
                    <input
                        id="clientName"
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                    />

                    <label htmlFor="clientEmail">Correo Electrónico</label>
                    <input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tu.email@ejemplo.com"
                        required
                    />

                    {error && <p className="error-message">⚠️ {error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="confirm-button">
                            Confirmar Cita
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;