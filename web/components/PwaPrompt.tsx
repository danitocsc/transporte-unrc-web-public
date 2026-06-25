'use client';

import { useState, useEffect } from 'react';

export default function PwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      // Check if already installed
      const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }

    // Detect Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!showPrompt) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Just visually emphasize the instructions
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 z-[9999] pointer-events-none fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-sm mx-auto border border-gray-100 pointer-events-auto relative">
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 text-gray-400 p-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Rutas UNRC" className="w-12 h-12 rounded-xl shadow-sm shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Instala Rutas UNRC TJ</h3>
            <p className="text-xs text-gray-500 mt-1">Mejor experiencia. Más rápido. Sin abrir el navegador.</p>
            
            {isIOS ? (
              <div className="mt-3 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                Toca el botón <strong>Compartir</strong> <svg className="inline w-3 h-3 mx-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> en la barra inferior y selecciona <strong>Añadir a pantalla de inicio</strong> <svg className="inline w-3 h-3 mx-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>.
              </div>
            ) : deferredPrompt ? (
              <button 
                onClick={handleInstallClick}
                className="mt-3 bg-[#7A003C] text-white text-xs font-bold py-1.5 px-4 rounded-full w-full shadow-sm"
              >
                Instalar aplicación
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
