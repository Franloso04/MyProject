import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Función auxiliar para saber si el botón está activo
  const isActive = (path) => location.pathname === path ? "text-primary" : "text-gray-400 hover:text-primary";

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display pb-20">
      
      {/* AQUÍ SE INYECTA EL CONTENIDO DE CADA PÁGINA (DASHBOARD, AGENDA, ETC.) */}
      <main className="max-w-md mx-auto">
        {children}
      </main>

      {/* NAVEGACIÓN INFERIOR (Extraída de tus HTMLs) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 px-6 py-2 pb-6 flex justify-between items-center z-50 max-w-md mx-auto">
        
        <Link to="/app/dashboard" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/app/dashboard')}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link to="/app/agenda" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/app/agenda')}`}>
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="text-[10px] font-medium">Agenda</span>
        </Link>

        <Link to="/app/attendees" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/app/attendees')}`}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] font-medium">People</span>
        </Link>

        <Link to="/app/settings" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/app/settings')}`}>
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-medium">Config</span>
        </Link>

      </nav>
    </div>
  );
};

export default Layout;