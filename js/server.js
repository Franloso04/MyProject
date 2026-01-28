// server.js
const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración del Pool de MariaDB (Optimizado)
const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'event_management_db',
  connectionLimit: 10
});

// 2. Middleware de Seguridad Multi-Tenancy
// Extrae organization_id y lo inyecta en la request.
// Simulado para este ejemplo (en prod usarías JWT real)
const authMiddleware = (req, res, next) => {
  // SIMULACIÓN: Asumimos que el usuario viene autenticado y tiene org_id = 1
  // En producción: const token = req.headers.authorization...
  req.user = { organization_id: 1 }; 
  next();
};

app.use(authMiddleware);

// --- ENDPOINTS ---

// A. DASHBOARD STATS
// Calcula métricas en tiempo real filtrando por Organización y Evento
app.get('/api/dashboard/stats', async (req, res) => {
  const { event_id } = req.query;
  const org_id = req.user.organization_id;

  if (!event_id) return res.status(400).json({ error: 'Falta event_id' });

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Consulta optimizada para traer todo en una sola llamada a DB
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM attendees a 
         JOIN events e ON a.event_id = e.event_id 
         WHERE e.organization_id = ? AND e.event_id = ?) as total_attendees,
         
        (SELECT COUNT(*) FROM attendees a 
         JOIN events e ON a.event_id = e.event_id 
         WHERE e.organization_id = ? AND e.event_id = ? AND a.status = 'CHECKED_IN') as checked_in,
         
        -- Suma ficticia de ingresos basada en VIP vs General
        (SELECT COALESCE(SUM(CASE WHEN ticket_tier LIKE '%VIP%' THEN 100 ELSE 50 END), 0)
         FROM attendees a 
         JOIN events e ON a.event_id = e.event_id 
         WHERE e.organization_id = ? AND e.event_id = ?) as revenue
    `;

    const rows = await conn.query(query, [org_id, event_id, org_id, event_id, org_id, event_id]);
    const stats = rows[0];

    // Cálculo del porcentaje para el círculo de progreso
    const percentage = stats.total_attendees > 0 
      ? Math.round((Number(stats.checked_in) / Number(stats.total_attendees)) * 100) 
      : 0;

    res.json({
      attendees: Number(stats.total_attendees),
      checked_in_absolute: Number(stats.checked_in),
      checkin_progress: percentage,
      revenue: Number(stats.revenue)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en servidor' });
  } finally {
    if (conn) conn.release();
  }
});

// B. AGENDA (Sesiones)
app.get('/api/agenda', async (req, res) => {
  const { event_id } = req.query;
  const org_id = req.user.organization_id;

  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT 
        s.session_id, s.title, s.start_time, s.end_time, s.publication_status,
        r.name as room_name,
        sp.full_name as speaker_name, sp.photo_url as speaker_photo
      FROM sessions s
      JOIN events e ON s.event_id = e.event_id
      LEFT JOIN rooms r ON s.room_id = r.room_id
      LEFT JOIN speakers sp ON s.speaker_id = sp.speaker_id
      WHERE e.organization_id = ? AND s.event_id = ?
      ORDER BY s.start_time ASC
    `;
    const rows = await conn.query(query, [org_id, event_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// C. ATTENDEES (Lista completa)
app.get('/api/attendees', async (req, res) => {
  const { event_id } = req.query;
  const org_id = req.user.organization_id;

  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT 
        a.attendee_id, a.first_name, a.last_name, a.company, a.job_title, 
        a.status, a.unique_qr_code, a.ticket_tier
      FROM attendees a
      JOIN events e ON a.event_id = e.event_id
      WHERE e.organization_id = ? AND a.event_id = ?
    `;
    const rows = await conn.query(query, [org_id, event_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));