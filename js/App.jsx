// js/App.jsx
import React, { useContext, useState } from 'react';
import { EventContext } from './EventContext';
import Dashboard from './Dashboard';
import Agenda from './Agenda';
import Attendees from './Attendees';
import Settings from './Settings'; // Nuevo componente para Config

const App = () => {
  const { currentEvent } = useContext(EventContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Renderizado condicional de las vistas
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'agenda':    return <Agenda />;
      case 'attendees': return <Attendees />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display pb-20">
      {/* Barra Superior Genérica (cambia según la vista si es necesario) */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{currentEvent?.name || 'Cargando...'}</h2>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-gray-500 uppercase">En Vivo</span>
                </div>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                A
            </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-md mx-auto">
        {renderContent()}
      </main>

      {/* Navegación Inferior (Bottom Nav) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-2 pb-6 flex justify-between items-center z-50 max-w-md mx-auto">
        <NavButton icon="dashboard" label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon="calendar_today" label="Agenda" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
        <NavButton icon="group" label="People" active={activeTab === 'attendees'} onClick={() => setActiveTab('attendees')} />
        <NavButton icon="settings" label="Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;