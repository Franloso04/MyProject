import React, { useEffect, useState } from 'react';

const Agenda = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => setSessions(data));
  }, []);

  return (
    <div className="flex flex-col p-4 gap-3 pb-24 bg-[#f6f7f8] min-h-screen">
       {/* Requirement 2: Bucle de sesiones */}
      {sessions.map((session) => (
        <div key={session.session_id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm flex-1 pr-4">{session.title}</h3>
            {/* Toggle Switch Visual */}
            <div className={`w-10 h-5 rounded-full relative cursor-pointer ${session.publication_status === 'PUBLISHED' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute transition-all ${session.publication_status === 'PUBLISHED' ? 'right-0' : 'left-0'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 mb-3">
             {/* Datos de la sesión */}
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">meeting_room</span>
              <span>{session.room_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {/* Requirement 2: Badge Dinámico */}
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

          {/* Speaker Info */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
             <img src={session.speaker_photo || 'default-avatar.png'} className="w-6 h-6 rounded-full object-cover" />
             <span className="text-xs font-medium text-gray-700">{session.speaker_name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};