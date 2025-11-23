import React, { useState, type JSX } from 'react';
import './Calendar.css';
// Importa los estilos, asumiendo que los pones aquí o en App.css
// import './Calendar.css'; 

// --- Tipos de Datos (Interfaces) ---
// En este componente simple no necesitamos props, pero definimos la interfaz 
// para demostrar la estructura de TypeScript.
interface CalendarProps {
    // Si necesitáramos un callback al seleccionar una fecha
    onDateSelect: (date: Date) => void;
}

// --- Constantes ---
const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// --- Funciones Auxiliares ---
const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};


const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
    
    // Estados tipados: Date | null
    const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    const today: Date = new Date();
    const year: number = currentDisplayDate.getFullYear();
    const month: number = currentDisplayDate.getMonth();
    
    // Maneja la navegación entre meses
    const handleMonthChange = (direction: 'prev' | 'next'): void => {
        const newDate = new Date(currentDisplayDate);
        
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        
        setCurrentDisplayDate(newDate);
    };

    // Maneja el clic en un día del calendario
    const handleDayClick = (date: Date): void => {
        setSelectedDate(date); 

        onDateSelect(date);

        console.log("Día seleccionado:", date.toISOString().split('T')[0]);
        // Aquí se integraría la llamada al Backend (API MERN) para obtener slots.
        
    };
    
    // Función que se encarga de crear todas las celdas del calendario
    const renderDays = (): JSX.Element[] => {
        const days: JSX.Element[] = [];
        
        // Cálculo de Días del Mes
        const firstDayOfMonth: number = new Date(year, month, 1).getDay(); // 0=Dom
        const daysInMonth: number = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth: number = new Date(year, month, 0).getDate();

        // 1. Días del Mes Anterior (Padding)
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(
                <div key={`prev-${i}`} className="date-cell past">
                    {daysInPrevMonth - firstDayOfMonth + i + 1}
                </div>
            );
        }

        // 2. Días del Mes Actual
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate: Date = new Date(year, month, day);
            
            let classes: string[] = ['selectable'];

            if (isSameDay(cellDate, today)) {
                classes.push('current-day');
            }

            if (selectedDate && isSameDay(cellDate, selectedDate)) {
                classes.push('selected');
            }
            
            // Simular un día con cita
            if (day === 15) {
                classes.push('has-appointment');
            }
            
            days.push(
                <div 
                    key={`curr-${day}`} 
                    className={`date-cell ${classes.join(' ')}`}
                    onClick={() => handleDayClick(cellDate)}
                >
                    {day}
                </div>
            );
        }

        // 3. Días del Mes Siguiente (Padding)
        const totalPaddingCells: number = days.length;
        const remainingCells: number = 42 - totalPaddingCells; 

        for (let i = 1; i <= remainingCells && totalPaddingCells + i <= 42; i++) {
            days.push(
                <div key={`next-${i}`} className="date-cell next-month">
                    {i}
                </div>
            );
        }

        return days;
    };


    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button 
                    id="prev-month" 
                    onClick={() => handleMonthChange('prev')}
                    aria-label="Mes anterior"
                >&lt;</button>
                <h2 id="current-month-year">{MONTH_NAMES[month]} {year}</h2>
                <button 
                    id="next-month" 
                    onClick={() => handleMonthChange('next')}
                    aria-label="Mes siguiente"
                >&gt;</button>
            </div>
            
            <div className="calendar-grid">
                {/* Nombres de los días */}
                {DAY_NAMES.map((name: string) => (
                    <div key={name} className="day-name">{name}</div>
                ))}

                {/* Días del mes generados dinámicamente */}
                {renderDays()}
            </div>
            
            {selectedDate && (
                <div className="selection-info">
                    Día Seleccionado: 
                    <b>{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
                </div>
            )}
        </div>
    );
};

export default Calendar;