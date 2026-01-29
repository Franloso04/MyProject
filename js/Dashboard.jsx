// js/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';
import { ENDPOINTS } from './config'; // Importamos la config centralizada

const Dashboard = () => {
  const { currentEvent } = useContext(EventContext);
  const [stats, setStats] = useState({ 
    attendees: 0, revenue: 0, checkin_progress: 0, checked_in_absolute: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentEvent?.id) return;
    
    setLoading(true);
    // Fetch directo a la API empresarial
    fetch(ENDPOINTS.STATS(currentEvent.id))
      .then(res => {
        if (!res.ok) throw new Error('Error en API Empresarial');
        return res.json();
      })
      .then(data => {
        // Adaptador: Aseguramos que la UI reciba los nombres de propiedades correctos
        // independientemente de cómo los llame la API externa
        setStats({
            attendees: data.total_attendees || 0,
            revenue: data.total_revenue || 0,
            checkin_progress: data.checkin_percentage || 0,
            checked_in_absolute: data.checked_in_count || 0
        });
        setLoading(false);
      })
      .catch(err => {
          console.error("Dashboard fetch error:", err);
          setLoading(false);
      });
  }, [currentEvent.id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando métricas...</div>;

  return (
    <div className="max-w-md mx-auto pb-24">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold">{currentEvent.name}</h2>
        <span className="text-xs font-medium text-green-500 uppercase">● {currentEvent.status}</span>
      </header>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Attendees */}
        <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500">
            <span className="material-symbols-outlined">groups</span>
            <p className="text-sm font-medium">Asistentes</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.attendees.toLocaleString()}</p>
        </div>

        {/* Revenue */}
        <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500">
            <span className="material-symbols-outlined">payments</span>
            <p className="text-sm font-medium">Ingresos</p>
          </div>
          <p className="text-2xl font-bold mt-1">
             {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.revenue)}
          </p>
        </div>
      </div>

      {/* Check-in Progress Dinámico */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle className="stroke-gray-200" cx="18" cy="18" r="16" fill="none" strokeWidth="3" />
              <circle 
                className="stroke-blue-500 transition-all duration-1000 ease-out" 
                cx="18" cy="18" r="16" fill="none" 
                strokeWidth="3" 
                strokeDasharray={`${stats.checkin_progress}, 100`} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
              {stats.checkin_progress}%
            </div>
          </div>
          <div className="flex-1">
            <span className="text-2xl font-bold block">{stats.checked_in_absolute}</span>
            <span className="text-sm text-gray-500">Checked-in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;