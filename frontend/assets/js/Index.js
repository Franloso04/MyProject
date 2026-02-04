// js/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';
import { EventProvider } from './EventContext';
import './index.css'; // Asegúrate de tener Tailwind importado aquí o en el HTML

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <EventProvider>
      <App />
    </EventProvider>
  </React.StrictMode>
);