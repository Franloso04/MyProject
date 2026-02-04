import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import BackofficeLayout from "./layouts/BackofficeLayout";

import Login from "./pages/Login";
import Events from "./pages/Events";

// REUTILIZAMOS tus páginas reales
import Dashboard from "./js/Dashboard";
import Agenda from "./js/Agenda";
import Attendees from "./js/Attendees";
import Scanner from "./js/Scanner";
import Settings from "./js/Settings";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/events" />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Events />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Dashboard />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Agenda />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendees"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Attendees />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Scanner />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <BackofficeLayout>
                <Settings />
              </BackofficeLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/events" />} />
      </Routes>
    </AuthProvider>
  );
}
