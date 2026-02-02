// js/Agenda.jsx
import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';
import { ENDPOINTS, API_BASE_URL } from './config';

const Agenda = () => {
  const { currentEvent } = useContext(EventContext);
  
  // 1. Estados necesarios
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Faltaba este estado para abrir/cerrar el formulario

  // Función auxiliar para cargar datos (se usa al inicio y al crear una nueva sesión)
  const loadSessions = () => {
    if (!currentEvent?.id) return;
    
    setLoading(true);
    fetch(ENDPOINTS.AGENDA(currentEvent.id))
      .then(res => res.json())
      .then(data => {
        // Aseguramos que data sea un array (tu API PHP devuelve un array directo, no {data: []})
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Agenda fetch error:", err);
        setLoading(false);
      });
  };

  // 2. useEffect: Carga inicial cuando cambia el evento
  useEffect(() => {
    loadSessions();
  }, [currentEvent.id]);

  // 3. Manejador para crear sesión
  const handleCreateSession = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Construimos el objeto tal como lo espera tu API PHP (SesionController.php)
    const newSession = {
        id_evento: currentEvent.id,
        titulo: formData.get('titulo'),
        hora_inicio: formData.get('hora_inicio'),
        hora_fin: formData.get('hora_fin'), // Añadido por si acaso
        id_ubicacion: 1, // Valor por defecto o podrías poner un select
        estado: 'PUBLISHED'
    };

    try {
        // Usamos API_BASE_URL importado de config.js
        const response = await fetch(`${API_BASE_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession)
        });

        if (response.ok) {
            alert("Sesión creada exitosamente"); 
            setShowModal(false); // Cerramos el modal
            loadSessions(); // IMPORTANTE: Recargamos la lista para ver la nueva sesión
        } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.message || "No se pudo crear"));
        }
    } catch (error) {
        console.error("Error creating session", error);
        alert("Error de conexión con el servidor");
    }
  };

  if (loading && sessions.length === 0) return <div className="p-10 text-center text-gray-500">Cargando Agenda...</div>;

  return (
    <div className="flex flex-col p-4 gap-3 pb-24 bg-[#f6f7f8] min-h-screen">
       {/* Cabecera con botón de crear */}
       <div className="flex justify-between items-center px-1">
           <h3 className="font-bold text-gray-700">Sesiones ({sessions.length})</h3>
           <button 
             onClick={() => setShowModal(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
           >
             <span className="material-symbols-outlined text-[18px]">add</span>
             Nueva
           </button>
       </div>
       
      {/* Lista de Sesiones */}
      {sessions.map((session) => (
        <div key={session.session_id || session.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm flex-1 pr-4 text-gray-900">{session.title || session.titulo}</h3>
            {/* Estado Visual */}
            <div className={`w-2 h-2 rounded-full ${session.publication_status === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 mb-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">meeting_room</span>
              <span>{session.room_name || 'Sala General'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>
                {/* Formateo seguro de fecha */}
                {session.start_time ? new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
              </span>
            </div>

            <div className="col-span-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  session.publication_status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {session.publication_status || 'Draft'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
             <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {session.speaker_photo ? (
                    <img src={session.speaker_photo} className="w-full h-full object-cover" alt="speaker" />
                ) : (
                    <span className="material-symbols-outlined text-xs text-gray-400">person</span>
                )}
             </div>
             <span className="text-xs font-medium text-gray-700">{session.speaker_name || 'Sin ponente'}</span>
          </div>
        </div>
      ))}

      {/* MODAL (Formulario flotante) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Nueva Sesión</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleCreateSession} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                        <input 
                            name="titulo" 
                            type="text" 
                            required 
                            placeholder="Ej. Keynote de Apertura"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Inicio</label>
                            <input 
                                name="hora_inicio" 
                                type="datetime-local" 
                                required 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Fin</label>
                            <input 
                                name="hora_fin" 
                                type="datetime-local" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;