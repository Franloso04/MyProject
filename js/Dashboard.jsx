import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from './EventContext';

const Dashboard = () => {
  const { currentEvent } = useContext(EventContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de fetch a tu endpoint
    fetch(`/api/dashboard/stats?eventId=${currentEvent.id}`)
      .then(res => res.json())
      .then(data => {
        setStats(data); // Espera: { attendees, revenue, checkin_progress, checked_in_absolute }
        setLoading(false);
      });
  }, [currentEvent.id]);

  if (loading) return <div>Loading Stats...</div>;

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Header Dinámico (Requirement 4) */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#111921] border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold">{currentEvent.name}</h2>
        <span className="text-xs font-medium text-green-500 uppercase">● {currentEvent.status} NOW</span>
      </header>

      {/* Cards de Estadísticas (Requirement 1) */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Attendees Card */}
        <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500">
            <span className="material-symbols-outlined">groups</span>
            <p className="text-sm font-medium">Attendees</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.attendees.toLocaleString()}</p>
        </div>

        {/* Revenue Card */}
        <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500">
            <span className="material-symbols-outlined">payments</span>
            <p className="text-sm font-medium">Revenue</p>
          </div>
          <p className="text-2xl font-bold mt-1">${stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Check-in Progress Circle */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle className="stroke-gray-200" cx="18" cy="18" r="16" fill="none" strokeWidth="3" />
              {/* Lógica dinámica del círculo SVG */}
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