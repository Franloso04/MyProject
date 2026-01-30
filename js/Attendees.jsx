// js/Attendees.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { EventContext } from './EventContext';
import { ENDPOINTS, API_BASE_URL } from './config';
import Scanner from './Scanner'; // Requiere haber creado js/Scanner.jsx

// 1. Subcomponente: Fila de Asistente
const AttendeeRow = ({ attendee, onClick }) => (
  <div 
    onClick={() => onClick(attendee)}
    className="flex items-center gap-4 bg-white p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
  >
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden relative">
      {attendee.avatar_url ? (
          <img src={attendee.avatar_url} className="w-full h-full object-cover" alt="avatar" />
      ) : (
          <span className="text-lg">{attendee.first_name?.[0]}</span>
      )}
      {/* Indicador visual si ya hizo check-in */}
      {attendee.status === 'CHECKED_IN' && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-700 font-bold">check</span>
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col justify-center">
      <p className="text-[#111418] text-base font-semibold leading-tight">
        {attendee.first_name} {attendee.last_name}
      </p>
      <p className="text-[#637588] text-sm font-normal">
        {attendee.company}
      </p>
    </div>
    <div className={`px-2.5 py-1 rounded-full ${
         attendee.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
       }`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">
            {attendee.status === 'CHECKED_IN' ? 'In' : 'Ok'}
        </span>
    </div>
  </div>
);

// 2. Subcomponente: Drawer con Lógica de QR
const QrDrawer = ({ attendee, onClose }) => {
  if (!attendee) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${attendee.unique_qr_code || attendee.token_qr}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose}></div>

      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90%] overflow-y-auto w-full max-w-[430px] mx-auto animate-[slideUp_0.3s_ease-out]">
        <div className="w-full flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-gray-300"></div>
        </div>

        <div className="px-6 pb-10 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-primary flex items-center justify-center text-xl font-bold">
                 {attendee.first_name?.[0]}
               </div>
               <div>
                 <h3 className="text-xl font-bold">{attendee.first_name} {attendee.last_name}</h3>
                 <p className="text-sm text-gray-500">{attendee.cargo || 'Asistente'} @ {attendee.company || 'N/A'}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="w-full max-w-[280px] aspect-square bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 mb-6 border border-gray-100">
             <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registration ID</p>
            <p className="text-lg font-mono font-bold text-primary">{attendee.token_qr || 'SIN-TOKEN'}</p>
          </div>

          <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
             <div className="flex justify-between mb-2">
                 <span className="text-sm text-gray-500">Categoría</span>
                 <span className="text-sm font-bold">{attendee.nombre_categoria || 'General'}</span>
             </div>
             <div className="flex justify-between">
                 <span className="text-sm text-gray-500">Estado</span>
                 <span className={`text-sm font-bold ${attendee.estado === 'CHECKED_IN' ? 'text-green-600' : 'text-blue-600'}`}>
                    {attendee.estado}
                 </span>
             </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white shadow-lg active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-2xl">print</span>
              <span className="text-sm font-semibold">Print Badge</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-100 text-gray-700 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-2xl">mail</span>
              <span className="text-sm font-semibold">Resend</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Componente Principal
const Attendees = () => {
  const { currentEvent } = useContext(EventContext);
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Nuevos estados
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef(null);

  // Función para cargar datos (reutilizable)
  const loadAttendees = () => {
    if (!currentEvent?.id) return;
    setLoading(true);
    fetch(ENDPOINTS.ATTENDEES(currentEvent.id, search))
      .then(res => res.json())
      .then(data => {
          // Adaptamos la respuesta si viene envuelta en { data: [...] } o es array directo
          const list = data.data ? data.data : data;
          setAttendees(Array.isArray(list) ? list : []);
          setLoading(false);
      })
      .catch(err => {
          console.error("Attendees fetch error:", err);
          setLoading(false);
      });
  };

  useEffect(() => {
    loadAttendees();
  }, [currentEvent.id, search]);

  // --- LÓGICA DE IMPORTACIÓN CSV ---
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (confirm(`¿Importar asistentes desde ${file.name}?`)) {
        setLoading(true);
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            const text = event.target.result;
            // Parseo básico de CSV (Asume formato: Nombre,Apellidos,Email,Empresa)
            const rows = text.split('\n').slice(1); // Saltar cabecera
            let successCount = 0;

            for (let row of rows) {
                const cols = row.split(',');
                if (cols.length < 3) continue; // Saltar filas vacías

                const payload = {
                    id_evento: currentEvent.id,
                    id_categoria: 1, // Default ID categoría
                    nombre: cols[0]?.trim(),
                    apellidos: cols[1]?.trim(),
                    email: cols[2]?.trim(),
                    empresa: cols[3]?.trim() || '',
                    estado: 'CONFIRMADO'
                };

                try {
                    await fetch(`${API_BASE_URL}/asistentes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    successCount++;
                } catch (err) {
                    console.error("Error importando fila:", row, err);
                }
            }
            alert(`Importación completada: ${successCount} asistentes añadidos.`);
            loadAttendees(); // Recargar lista
            e.target.value = ''; // Limpiar input
        };
        
        reader.readAsText(file);
    }
  };

  // --- LÓGICA DE ESCÁNER ---
  const handleScan = async (qrToken) => {
    setShowScanner(false);
    
    // Feedback visual inmediato
    const processingToast = document.createElement('div');
    processingToast.className = "fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full z-[60]";
    processingToast.innerText = "Procesando...";
    document.body.appendChild(processingToast);

    try {
        const response = await fetch(`${API_BASE_URL}/registros_acceso/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                token_qr: qrToken,
                id_evento: currentEvent.id 
            })
        });

        const data = await response.json();
        document.body.removeChild(processingToast);

        if (response.ok) {
            alert(`✅ ACCESO PERMITIDO\n${data.asistente.nombre} ${data.asistente.apellidos}`);
            loadAttendees(); // Refrescar para ver el estado 'In'
        } else {
            // Manejo específico de errores
            if(response.status === 409) {
                alert(`⚠️ YA REGISTRADO\n${data.asistente.nombre} ${data.asistente.apellidos} ya entró.`);
            } else {
                alert(`❌ ERROR: ${data.message}`);
            }
        }
    } catch (error) {
        document.body.removeChild(processingToast);
        alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="relative mx-auto max-w-[430px] min-h-screen bg-[#f6f7f8] shadow-2xl flex flex-col">
      {/* Input Oculto para CSV */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv" 
        className="hidden" 
      />

      <div className="px-4 py-3 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex gap-2 mb-2">
            <input 
            className="flex-1 bg-[#f0f2f4] rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Search by name or company..."
            onChange={(e) => setSearch(e.target.value)}
            />
            {/* Botón Importar CSV estilo botón de acción */}
            <button 
                onClick={handleImportClick}
                className="flex items-center justify-center w-12 bg-gray-100 rounded-xl hover:bg-gray-200 text-primary"
                title="Importar CSV"
            >
                <span className="material-symbols-outlined">upload_file</span>
            </button>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400 px-1">
            <span>{attendees.length} asistentes</span>
            <span>{currentEvent?.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {loading ? (
            <div className="p-10 text-center text-gray-400">Cargando...</div>
        ) : attendees.length > 0 ? (
            attendees.map(attendee => (
            <AttendeeRow 
                key={attendee.id || attendee.attendee_id} // Fallback para ID
                attendee={attendee} 
                onClick={setSelectedAttendee} 
            />
            ))
        ) : (
            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                <p>No hay asistentes</p>
                <button onClick={handleImportClick} className="mt-4 text-primary font-bold">Importar ahora</button>
            </div>
        )}
      </div>

      {/* Botón Flotante (FAB) para Escáner */}
      <button 
        onClick={() => setShowScanner(true)}
        className="fixed bottom-24 right-[max(1rem,calc(50vw-200px))] w-14 h-14 bg-primary rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white z-40 hover:bg-blue-600 transition-all active:scale-90"
      >
        <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
      </button>

      {/* Renderizado Condicional del Escáner */}
      {showScanner && (
        <Scanner 
            onScanSuccess={handleScan} 
            onClose={() => setShowScanner(false)} 
        />
      )}

      {selectedAttendee && (
        <QrDrawer 
          attendee={selectedAttendee} 
          onClose={() => setSelectedAttendee(null)} 
        />
      )}
    </div>
  );
};

export default Attendees;