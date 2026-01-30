// js/Agenda.jsx
import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';
import { ENDPOINTS } from './config';

const Agenda = () => {
  const { currentEvent } = useContext(EventContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const handleCreateSession = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSession = {
        id_evento: currentEvent.id,
        titulo: formData.get('titulo'),
        hora_inicio: formData.get('hora_inicio'),
        estado: 'PUBLISHED' // Default
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sessions`, { // Asegúrate que la ruta coincida con index.php case 'sessions'
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession)
        });
        if (response.ok) {
            // Recargar sesiones o añadir al estado local
            alert("Sesión creada"); 
            setShowModal(false);
        }
    } catch (error) {
        console.error("Error creating session", error);
    }
};
  
  useEffect(() => {
    if (!currentEvent?.id) return;

    fetch(ENDPOINTS.AGENDA(currentEvent.id))
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => console.error("Agenda fetch error:", err));
  }, [currentEvent.id]);

  if (loading) return <div className="p-10 text-center">Cargando Agenda...</div>;

  return (
    <div className="flex flex-col p-4 gap-3 pb-24 bg-[#f6f7f8] min-h-screen">
       <h3 className="font-bold text-gray-700 px-1">Sesiones ({sessions.length})</h3>
       
      {sessions.map((session) => (
        <div key={session.session_id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm flex-1 pr-4">{session.title}</h3>
            {/* Visual Toggle basado en estado de la API */}
            <div className={`w-10 h-5 rounded-full relative ${session.publication_status === 'PUBLISHED' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute transition-all ${session.publication_status === 'PUBLISHED' ? 'right-0' : 'left-0'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 mb-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">meeting_room</span>
              <span>{session.room_name || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>
                {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>

            <div className="col-span-2 mt-1">
              {session.publication_status === 'PUBLISHED' ? (
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                  Published
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                  Draft
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
             <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                {/* Fallback de imagen si la API devuelve null */}
                <img src={session.speaker_photo || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="speaker" />
             </div>
             <span className="text-xs font-medium text-gray-700">{session.speaker_name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Agenda;