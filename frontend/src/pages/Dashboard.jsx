import React, { useEffect, useState, useContext } from 'react';
import { EventContext } from '../context/EventContext'; // Asegúrate que la ruta sea correcta según tu estructura
import { ENDPOINTS } from '../api/config'; // Tu configuración de API

const Dashboard = () => {
  const { currentEvent } = useContext(EventContext);
  
  // Estado para las métricas (Datos dinámicos)
  const [stats, setStats] = useState({ 
    attendees: 0, 
    revenue: 0, 
    checkin_progress: 0, 
    checked_in_absolute: 0,
    total_tickets: 0 
  });
  
  const [loading, setLoading] = useState(true);

  // Efecto para cargar datos reales
  useEffect(() => {
    if (!currentEvent?.id) return;
    
    setLoading(true);
    fetch(ENDPOINTS.STATS(currentEvent.id)) // Usa tu endpoint real
      .then(res => res.json())
      .then(data => {
        setStats({
            attendees: data.total_attendees || 0,
            revenue: data.total_revenue || 0,
            checkin_progress: data.checkin_percentage || 0,
            checked_in_absolute: data.checked_in_count || 0,
            total_tickets: data.total_capacity || 1500 // Fallback si no viene de la API
        });
        setLoading(false);
      })
      .catch(err => {
          console.error("Error cargando dashboard:", err);
          setLoading(false);
      });
  }, [currentEvent]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center p-4">
        <div className="text-primary font-bold animate-pulse">Cargando Dashboard...</div>
    </div>
  );

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      
      {/* 1. HEADER ESPECÍFICO DEL DASHBOARD (Igual que tu HTML) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#111921] border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </button>
                <div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight dark:text-white">
                        {currentEvent?.name || 'Evento Sin Nombre'}
                    </h2>
                    <div className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Vivo</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined dark:text-white">notifications</span>
                </button>
                <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                     {/* Placeholder de avatar */}
                    <span className="material-symbols-outlined text-primary">person</span>
                </div>
            </div>
        </div>
      </header>

      {/* 2. STATS CARDS (Attendees & Revenue) */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">groups</span>
                <p className="text-sm font-medium">Asistentes</p>
            </div>
            <p className="text-2xl font-bold leading-tight mt-1 dark:text-white">
                {stats.attendees.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
                <span className="text-[#078838] text-xs font-bold leading-normal">+12%</span>
                <span className="text-gray-400 text-xs">de {stats.total_tickets} cupo</span>
            </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-xl">payments</span>
                <p className="text-sm font-medium">Ingresos</p>
            </div>
            <p className="text-2xl font-bold leading-tight mt-1 dark:text-white">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.revenue)}
            </p>
            <div className="flex items-center gap-1">
                <span className="text-[#078838] text-xs font-bold leading-normal">+5.4%</span>
                <span className="text-gray-400 text-xs">esta semana</span>
            </div>
        </div>
      </div>

      {/* 3. CHECK-IN PROGRESS (Gráfico Circular SVG) */}
      <div className="px-4 py-2">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold dark:text-white">Progreso Check-in</h3>
                <span className="text-primary text-sm font-semibold animate-pulse">Actualizando</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative size-24 shrink-0">
                    <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Círculo de fondo */}
                        <circle className="stroke-gray-200 dark:stroke-gray-700" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                        {/* Círculo de progreso dinámico */}
                        <circle 
                            className="stroke-primary transition-all duration-1000 ease-out" 
                            cx="18" cy="18" fill="none" r="16" 
                            strokeDasharray={`${stats.checkin_progress}, 100`} 
                            strokeLinecap="round" 
                            strokeWidth="3">
                        </circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold dark:text-white">{stats.checkin_progress}%</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold dark:text-white">{stats.checked_in_absolute}</span>
                        <span className="text-sm text-gray-500 font-medium">Presentes Ahora</span>
                    </div>
                    {/* Barra de progreso lineal */}
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-1000" style={{width: `${stats.checkin_progress}%`}}></div>
                    </div>
                    <p className="text-gray-500 text-xs font-normal">
                        {stats.total_tickets - stats.checked_in_absolute} tickets por escanear
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS (Recuperado del HTML) */}
      <div className="mt-4">
        <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-base font-bold leading-tight tracking-tight dark:text-white">Acciones Rápidas</h3>
            <button className="text-primary text-sm font-semibold hover:underline">Ver Todo</button>
        </div>
        {/* Contenedor con scroll horizontal oculto */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            {/* Botón 1: New Session */}
            <button className="flex min-w-[120px] flex-col items-center gap-3 rounded-xl bg-primary p-4 text-white shadow-md active:scale-95 transition-transform">
                <div className="bg-white/20 p-2 rounded-lg">
                    <span className="material-symbols-outlined">add_circle</span>
                </div>
                <span className="text-sm font-bold">Nueva Sesión</span>
            </button>

            {/* Botón 2: Broadcast */}
            <button className="flex min-w-[120px] flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm active:scale-95 transition-transform">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                </div>
                <span className="text-sm font-bold dark:text-white">Difusión</span>
            </button>

            {/* Botón 3: Print ID */}
            <button className="flex min-w-[120px] flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm active:scale-95 transition-transform">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">badge</span>
                </div>
                <span className="text-sm font-bold dark:text-white">Imprimir ID</span>
            </button>

            {/* Botón 4: Scanner */}
            <button className="flex min-w-[120px] flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm active:scale-95 transition-transform">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                </div>
                <span className="text-sm font-bold dark:text-white">Escáner</span>
            </button>
        </div>
      </div>

      {/* 5. TODAY'S AGENDA (Recuperado del HTML) */}
      <div className="px-4 py-2">
        <h3 className="text-base font-bold leading-tight tracking-tight mb-3 dark:text-white">Agenda de Hoy</h3>
        <div className="space-y-3">
            
            {/* Item Agenda 1 */}
            <div className="flex gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center min-w-[60px] bg-gray-50 dark:bg-[#111921] rounded-lg py-2">
                    <span className="text-xs font-bold text-primary uppercase">10:00</span>
                    <span className="text-xs font-medium text-gray-500">AM</span>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm dark:text-white">Keynote: Futuro de la IA</p>
                    <p className="text-xs text-gray-500">Escenario Principal • 450 Reservas</p>
                </div>
                <button className="self-center">
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
            </div>

            {/* Item Agenda 2 */}
            <div className="flex gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center min-w-[60px] bg-gray-50 dark:bg-[#111921] rounded-lg py-2">
                    <span className="text-xs font-bold text-primary uppercase">11:30</span>
                    <span className="text-xs font-medium text-gray-500">AM</span>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm dark:text-white">DevOps: Mejores Prácticas</p>
                    <p className="text-xs text-gray-500">Sala B • 120 Reservas</p>
                </div>
                <button className="self-center">
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
            </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;