// js/Settings.jsx
import React, { useContext, useEffect, useState } from 'react';
import { EventContext } from './EventContext';
import { API_BASE_URL } from './config';

const Settings = () => {
  const { currentEvent, switchEvent } = useContext(EventContext);
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    // Cargar lista de eventos disponibles para cambiar
    fetch(`${API_BASE_URL}/eventos`)
      .then(res => res.json())
      .then(data => {
        if(data.data) setEventsList(data.data);
      });
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Evento Activo</h3>
        <p className="text-gray-500 text-sm mb-4">Selecciona el evento que quieres gestionar.</p>
        
        <div className="space-y-2">
          {eventsList.map(evt => (
            <button
              key={evt.id}
              onClick={() => switchEvent({ id: evt.id, name: evt.nombre, status: evt.estado })}
              className={`w-full text-left p-3 rounded-lg border ${currentEvent.id === evt.id ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="font-bold text-sm">{evt.nombre}</div>
              <div className="text-xs opacity-70">{evt.fecha_inicio}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-2">Acciones Rápidas</h3>
        <button className="w-full py-2.5 mb-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
            Exportar Datos (CSV)
        </button>
        <button className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">
            Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Settings;