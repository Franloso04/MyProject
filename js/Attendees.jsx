// js/Attendees.jsx
import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';
import { ENDPOINTS } from './config';

// 1. Subcomponente: Fila de Asistente
const AttendeeRow = ({ attendee, onClick }) => (
  <div 
    onClick={() => onClick(attendee)}
    className="flex items-center gap-4 bg-white p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
  >
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
      {attendee.avatar_url ? (
          <img src={attendee.avatar_url} className="w-full h-full object-cover" alt="avatar" />
      ) : (
          attendee.first_name[0]
      )}
    </div>
    <div className="flex flex-1 flex-col justify-center">
      <p className="text-[#111418] text-base font-semibold leading-tight">
        {attendee.first_name} {attendee.last_name}
      </p>
      <p className="text-[#637588] text-sm font-normal">
        {attendee.company}
      </p>
    </div>
    <div className={`px-2.5 py-1 rounded-full ${
         attendee.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
       }`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">
            {attendee.status === 'CHECKED_IN' ? 'In' : 'Ok'}
        </span>
    </div>
  </div>
);

// 2. Subcomponente: Drawer con Lógica de QR
const QrDrawer = ({ attendee, onClose }) => {
  if (!attendee) return null;

  // Generamos la URL del QR directamente en el cliente
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${attendee.unique_qr_code}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>

      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90%] overflow-y-auto w-full max-w-[430px] mx-auto animate-[slideUp_0.3s_ease-out]">
        <div className="w-full flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300"></div>
        </div>

        <div className="px-6 pb-10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-primary flex items-center justify-center text-xl font-bold">
                 {attendee.first_name[0]}
               </div>
               <div>
                 <h3 className="text-xl font-bold">{attendee.first_name} {attendee.last_name}</h3>
                 <p className="text-sm text-gray-500">{attendee.job_title} @ {attendee.company}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 mb-6 border border-gray-100">
             <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registration ID</p>
            <p className="text-lg font-mono font-bold text-primary">{attendee.unique_qr_code}</p>
          </div>

          {/* Datos extraídos de la BD */}
          <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
             <div className="flex justify-between mb-2">
                 <span className="text-sm text-gray-500">Ticket Tier</span>
                 <span className="text-sm font-bold">{attendee.ticket_tier || 'General'}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-sm text-gray-500">Dietary Req.</span>
                 <span className="text-sm font-bold">{attendee.dietary_requirements || 'None'}</span>
             </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white shadow-lg">
              <span className="material-symbols-outlined text-2xl">print</span>
              <span className="text-sm font-semibold">Print Badge</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-100 text-gray-700">
              <span className="material-symbols-outlined text-2xl">mail</span>
              <span className="text-sm font-semibold">Resend</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Componente Principal
const Attendees = () => {
  const { currentEvent } = useContext(EventContext);
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!currentEvent?.id) return;
    
    // Fetch con búsqueda integrada en la query string
    fetch(ENDPOINTS.ATTENDEES(currentEvent.id, search))
      .then(res => res.json())
      .then(data => setAttendees(data))
      .catch(err => console.error("Attendees fetch error:", err));
  }, [currentEvent.id, search]);

  return (
    <div className="relative mx-auto max-w-[430px] min-h-screen bg-[#f6f7f8] shadow-2xl flex flex-col">
      <div className="px-4 py-3 bg-white sticky top-0 z-10">
        <input 
          className="w-full bg-[#f0f2f4] rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary"
          placeholder="Search by name or company..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {attendees.map(attendee => (
          <AttendeeRow 
            key={attendee.attendee_id} 
            attendee={attendee} 
            onClick={setSelectedAttendee} 
          />
        ))}
      </div>

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