// js/Attendees.jsx
import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';

// Subcomponente: Fila de la lista (Limpio y reutilizable)
const AttendeeRow = ({ attendee, onClick }) => (
  <div 
    onClick={() => onClick(attendee)}
    className="flex items-center gap-4 bg-white dark:bg-[#111921] min-h-[76px] py-3 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
  >
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
      {/* Fallback si no hay avatar */}
      {attendee.avatar_url ? (
        <img src={attendee.avatar_url} className="w-full h-full object-cover" />
      ) : (
        attendee.first_name[0]
      )}
    </div>
    <div className="flex flex-1 flex-col justify-center">
      <p className="text-[#111418] dark:text-white text-base font-semibold leading-tight">
        {attendee.first_name} {attendee.last_name}
      </p>
      <p className="text-[#637588] dark:text-gray-400 text-sm font-normal">
        {attendee.company}
      </p>
    </div>
    <div className="flex items-center gap-3">
       <div className={`px-2.5 py-1 rounded-full ${
         attendee.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
       }`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">
            {attendee.status === 'CHECKED_IN' ? 'Checked-in' : 'Confirmed'}
        </span>
      </div>
      <span className="material-symbols-outlined text-gray-300">chevron_right</span>
    </div>
  </div>
);

// Subcomponente: QR Drawer (Requirement 3)
// Recibe el asistente seleccionado y la función para cerrar
const QrDrawer = ({ attendee, onClose }) => {
  if (!attendee) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop con efecto blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose}
      ></div>

      {/* Drawer Content - Animación slide up simulada con Tailwind */}
      <div className="relative bg-white dark:bg-[#111921] rounded-t-3xl shadow-2xl max-h-[90%] overflow-y-auto w-full max-w-[430px] mx-auto animate-in slide-in-from-bottom duration-300">
        
        {/* Handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>

        <div className="px-6 pb-10 flex flex-col items-center">
          {/* Header del Drawer */}
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-primary flex items-center justify-center text-2xl font-bold">
                 {attendee.first_name[0]}
               </div>
               <div>
                 <h3 className="text-xl font-bold text-[#111418] dark:text-white">{attendee.first_name} {attendee.last_name}</h3>
                 <p className="text-sm text-gray-500">{attendee.company}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* QR Code Dinámico */}
          <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 mb-6 border border-gray-100">
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${attendee.unique_qr_code}`}
               alt="QR Code"
               className="w-full h-full object-contain"
             />
          </div>

          {/* Info Badge */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registration ID</p>
            <p className="text-lg font-mono font-bold text-primary">{attendee.unique_qr_code}</p>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white shadow-lg">
              <span className="material-symbols-outlined text-2xl">print</span>
              <span className="text-sm font-semibold">Print Badge</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white">
              <span className="material-symbols-outlined text-2xl">mail</span>
              <span className="text-sm font-semibold">Resend</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const Attendees = () => {
  const { currentEvent } = useContext(EventContext);
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null); // Estado para abrir el Drawer
  const [search, setSearch] = useState("");

  // Refetch al cambiar evento
  useEffect(() => {
    fetch(`/api/attendees?event_id=${currentEvent.id}&search=${search}`)
      .then(res => res.json())
      .then(data => setAttendees(data));
  }, [currentEvent.id, search]);

  return (
    <div className="relative mx-auto max-w-[430px] min-h-screen bg-background-light dark:bg-background-dark shadow-2xl flex flex-col">
      {/* Search Bar */}
      <div className="px-4 py-3 bg-white dark:bg-[#111921] sticky top-0 z-10">
        <input 
          className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-xl px-4 py-3 border-none"
          placeholder="Search by name..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista Dinámica */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {attendees.map(attendee => (
          <AttendeeRow 
            key={attendee.attendee_id} 
            attendee={attendee} 
            onClick={setSelectedAttendee} // Pasa la función para abrir el drawer
          />
        ))}
      </div>

      {/* Drawer Condicional (Requirement 3) */}
      {selectedAttendee && (
        <QrDrawer 
          attendee={selectedAttendee} 
          onClose={() => setSelectedAttendee(null)} 
        />
      )}
    </div>
  );
};

export default Attendees;