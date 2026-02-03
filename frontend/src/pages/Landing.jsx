import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="bg-white dark:bg-[#0f172a] min-h-screen font-display text-slate-900 dark:text-white">
      {/* Navbar Pública */}
      <nav className="border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">event_available</span>
            </div>
            <span className="text-xl font-bold tracking-tight">EventFlow</span>
          </div>
          <div className="flex gap-4">
            <Link to="/app/dashboard" className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 transition-colors">
              Acceso Clientes
            </Link>
            <Link to="/app/dashboard" className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
              Empezar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold uppercase tracking-wider mb-8 border border-blue-100 dark:border-blue-800">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            v2.0 Disponible
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            La plataforma integral para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">eventos corporativos</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            Gestiona registros, agenda, ponentes y analíticas en tiempo real. 
            Todo lo que tu organización necesita en un solo lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/app/dashboard" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all">
              <span className="material-symbols-outlined">add_circle</span>
              Crear mi primer evento
            </Link>
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">play_circle</span>
              Ver Demo
            </button>
          </div>
        </div>

        {/* Decoración de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
};

export default Landing;