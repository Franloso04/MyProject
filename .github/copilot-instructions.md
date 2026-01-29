# Copilot Instructions for Event Management System

## Architecture Overview

This is a hybrid **PHP REST API + React frontend** for event management with attendee tracking.

- **Backend**: PHP 7.4+ with PDO, organized in MVC pattern (`api-eventos/`)
- **Frontend**: React components (JSX) with context state management
- **Database**: MySQL with PDO prepared statements (anti-SQL injection)
- **Server**: MAMP with static base path `/MyProject/api-eventos`

## Key Components & Data Flows

### Backend Structure
- **Entry point**: `api-eventos/index.php` - Router that parses REST routes (`/eventos`, `/asistentes`) and maps to controllers
- **Models** (`models/`): `Evento`, `Asistente` - Database abstraction with SQL queries
- **Controllers** (`controllers/`): Handle HTTP methods, validate input, return JSON
- **Database**: `config/database.php` - PDO singleton using `eventos_app` database (default LAMP credentials: root/no-password)

### Frontend Architecture
- **Context API**: `EventContext` holds `currentEvent` state, accessed by all components via `useContext(EventContext)`
- **Centralized config**: `config.js` defines API endpoints with `ENDPOINTS` object
- **Components**: `Dashboard`, `Attendees`, `Agenda` fetch from API and adapt responses to local UI state
- **Data adaptation pattern**: Controllers return API data; frontend normalizes field names (e.g., `total_attendees` → `attendees`)

### Critical Data Model
**Eventos** (Events):
- `id`, `id_organizacion`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `estado`

**Asistentes** (Attendees):
- `id`, `id_evento`, `id_categoria`, `email` (unique per event), `nombre`, `apellidos`, `token_qr`, `campos_personalizados` (JSON)
- Joined with `eventos` and `categorias_asistentes` in queries

## Critical Patterns & Conventions

### API Response Format
All endpoints return `{ data: [...] }` array structure:
```php
echo json_encode(array("data" => $items));  // Always wrapped in "data"
```
Frontend expects this wrapper; adapt if external APIs differ.

### Database Queries
- Use **prepared statements** with `bindParam()` to prevent SQL injection
- **JOIN with LEFT JOIN** to fetch related names (e.g., `nombre_organizacion` from `organizaciones`)
- Models have `leer()` (GET all), `leerUno()` (GET one), `crear()` (POST), `actualizar()` (PUT), `eliminar()` (DELETE)

### Validation & Error Handling
- Controllers validate required fields before calling model methods
- HTTP status codes: `200` OK, `201` Created, `400` Bad Request, `404` Not Found, `409` Conflict (duplicate email), `503` Server Error
- Special: Asistente `existeEmail()` prevents duplicate registrations per event

### Routing Convention
```
GET    /eventos           → EventoController::index()  [list all]
GET    /eventos/{id}      → EventoController::show($id)
POST   /eventos           → EventoController::store()  [create]
GET    /asistentes        → AsistenteController::index()
GET    /asistentes/{id}   → AsistenteController::show($id)
POST   /asistentes        → AsistenteController::store()
PUT    /asistentes/{id}   → AsistenteController::update($id)
DELETE /asistentes/{id}   → AsistenteController::delete($id)
```

### Field Mapping
When adding new fields:
- Database column → Model property (public, snake_case in SQL)
- Model method transforms to camelCase or normalized names for API response
- Frontend config adapter handles name normalization from external APIs

## Development Setup

### Prerequisites
- MAMP running with MySQL (default host/credentials)
- Database: `eventos_app` created with tables `eventos`, `asistentes`, `organizaciones`, `categorias_asistentes`
- Base API path hardcoded: `/MyProject/api-eventos` in `index.php` line 19

### Running the API
1. Start MAMP Apache + MySQL
2. Access: `http://localhost/MyProject/api-eventos/eventos` 
3. Check logs: `error_log()` messages appear in MAMP error log

### Adding New Endpoints
1. Create new method in corresponding Controller (`index()`, `show()`, `store()`, `update()`, `delete()`)
2. Add `case 'resource'` block in `index.php` router
3. Create matching Model with `leer()`, `crear()`, etc.

## Common Gotchas & Fixes

- **CORS**: Enabled in `index.php` headers for all origins (`*`)
- **Base path mismatch**: If API 404s, update `$base_path` in `index.php` to match your server structure
- **JSON decode**: Use `json_decode(file_get_contents("php://input"))` for raw POST bodies
- **Empty results**: Controllers return `{ data: [] }` even for zero rows (not null)
- **React context access**: Always use `useContext(EventContext)` inside functional components, check `currentEvent?.id` for null safety
- **Email uniqueness**: `Asistente::existeEmail()` validates per-event; duplicate emails across events are allowed

## Files to Reference for Patterns

- **API routing**: [index.php](api-eventos/index.php#L19-L61)
- **Model queries**: [models/Asistente.php](models/Asistente.php#L40-L50) (joins pattern)
- **Controller flow**: [controllers/EventoController.php](controllers/EventoController.php#L18-L35)
- **React context**: [js/EventContext.js](js/EventContext.js)
- **Frontend API calls**: [js/Dashboard.jsx](js/Dashboard.jsx#L12-L32) (error handling + adaptation)
