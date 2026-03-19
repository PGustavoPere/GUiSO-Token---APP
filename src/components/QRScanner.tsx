import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw, Image as ImageIcon, Upload } from 'lucide-react';
import { motion } from 'motion/react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerId = "qr-reader-element";

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.warn("Error al detener el escáner:", e);
      }
    }
  };

  const startScanner = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      await stopScanner();

      // Ensure the element exists
      const element = document.getElementById(scannerId);
      if (!element) {
        throw new Error("Elemento de escaneo no encontrado");
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      // Prefer rear camera (facingMode: "environment") as requested
      try {
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          (decodedText) => {
            onScan(decodedText);
          },
          () => {} // Ignore scan errors
        );
      } catch (err) {
        // Fallback to any camera if rear is not available
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await html5QrCode.start(
            devices[0].id, 
            config, 
            (decodedText) => {
              onScan(decodedText);
            },
            () => {}
          );
        } else {
          throw err;
        }
      }
      
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Error al iniciar el escáner:", err);
      let msg = "No se pudo acceder a la cámara.";
      if (err.message?.includes("Permission denied")) {
        msg = "Permiso denegado. Por favor, permití el acceso a la cámara en los ajustes de tu navegador.";
      } else if (err.message?.includes("NotFound")) {
        msg = "No se encontró ninguna cámara en este dispositivo.";
      } else {
        msg = "Error al iniciar la cámara. Verificá que no esté siendo usada por otra app y que uses HTTPS.";
      }
      setError(msg);
      setIsInitializing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsInitializing(true);
      setError(null);
      
      // Stop camera if running
      await stopScanner();

      const html5QrCode = new Html5Qrcode(scannerId);
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err: any) {
      console.error("Error al escanear archivo:", err);
      setError("No se detectó ningún código QR válido en la imagen. Intentá con otra foto más clara.");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 800);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-guiso-cream/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-guiso-orange/10 rounded-xl text-guiso-orange">
              <Camera size={20} />
            </div>
            <h3 className="font-display font-bold text-gray-900">Escanear Pago</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-gray-900 relative aspect-square flex items-center justify-center overflow-hidden">
          <div id={scannerId} className="w-full h-full"></div>
          
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-4 z-10">
              <RefreshCw size={32} className="animate-spin text-guiso-orange" />
              <p className="text-sm font-medium">Iniciando cámara...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center gap-4 z-20">
              <AlertCircle size={48} className="text-red-500" />
              <p className="text-sm font-bold leading-relaxed">{error}</p>
              <div className="flex flex-col gap-2 w-full">
                <button 
                  onClick={() => startScanner()}
                  className="px-6 py-3 bg-guiso-orange text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Reintentar Cámara
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <ImageIcon size={16} /> Subir Imagen
                </button>
              </div>
            </div>
          )}

          {/* Scanner Overlay UI */}
          {!isInitializing && !error && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-guiso-orange rounded-3xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                
                {/* Scanning line animation */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-guiso-orange/50 shadow-[0_0_15px_rgba(255,99,33,0.8)]"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-900">Escaneá el código QR del comercio</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Asegurá que el código esté bien iluminado y dentro del cuadro.
            </p>
          </div>

          <div className="pt-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors"
            >
              <Upload size={14} />
              O subir imagen desde galería
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm backdrop-blur-md transition-all"
      >
        Cancelar
      </button>
    </motion.div>
  );
};
