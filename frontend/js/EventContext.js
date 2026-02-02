import React, { createContext, useState, useEffect } from 'react';

export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  // Estado del evento seleccionado (Requirement 4)
  const [currentEvent, setCurrentEvent] = useState({
    id: 1,
    name: 'TechConf 2024', // Valor inicial
    status: 'LIVE'
  });

  // Función para cambiar evento (simulada)
  const switchEvent = (newEvent) => {
    setCurrentEvent(newEvent);
    // Aquí podrías recargar datos de la API
  };

  return (
    <EventContext.Provider value={{ currentEvent, switchEvent }}>
      {children}
    </EventContext.Provider>
  );
};