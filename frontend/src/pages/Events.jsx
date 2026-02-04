import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await apiRequest("events/get_events.php", "GET");
        setEvents(data || []);
      } catch (err) {
        setError(err.message || "Error cargando eventos");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="text-gray-600 font-semibold text-lg">Cargando eventos...</div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Eventos</h2>
      <p className="text-sm text-gray-500 mb-6">
        Selecciona un evento para administrarlo
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          No hay eventos disponibles para tu organización.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold text-gray-800">{ev.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Fecha: {ev.date || "No definida"}
              </p>
              <p className="text-sm text-gray-500">
                Ubicación: {ev.location || "No definida"}
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Administrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
