import React, { useEffect } from 'react';

const Scanner = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    // La librería html5-qrcode se carga globalmente desde el CDN
    const html5QrcodeScanner = new window.Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        // Al detectar un QR exitoso:
        html5QrcodeScanner.clear().then(() => {
            onScanSuccess(decodedText);
        }).catch(err => console.error("Error clearing scanner", err));
      },
      (errorMessage) => {
        // Error de lectura (pasa constantemente si no enfoca un QR, es normal ignorarlo)
      }
    );

    // Limpieza al cerrar el componente
    return () => {
      html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
            <span className="material-symbols-outlined text-gray-600">close</span>
        </button>
        
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Escanear Ticket</h3>
        
        {/* Aquí es donde la librería renderiza la cámara */}
        <div id="reader" className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300"></div>
        
        <p className="text-center text-sm text-gray-500 mt-4">
            Apunta la cámara al código QR del asistente
        </p>
      </div>
    </div>
  );
};

export default Scanner;