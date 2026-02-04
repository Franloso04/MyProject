import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BackofficeLayout({ children }) {
  const { organization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r px-5 py-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-blue-700">
            {organization?.name || "Backoffice"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Gestión de eventos</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm font-semibold">
          <NavLink className="nav-link" to="/events">
            Mis Eventos
          </NavLink>

          <NavLink className="nav-link" to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink className="nav-link" to="/agenda">
            Agenda de Sesiones
          </NavLink>

          <NavLink className="nav-link" to="/attendees">
            Gestión de Asistentes
          </NavLink>

          <NavLink className="nav-link" to="/scanner">
            Scanner
          </NavLink>

          <NavLink className="nav-link" to="/settings">
            Configuración del Evento
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">
            Panel de Administración
          </h1>

          <div className="text-sm text-gray-600 font-semibold">
            Organización: {organization?.name || "N/A"}
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
