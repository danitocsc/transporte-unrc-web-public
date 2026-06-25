'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { PublicStop, PublicRoute } from '@/components/maps/PublicStopsMap';

const PublicStopsMap = dynamic(() => import('@/components/maps/PublicStopsMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" />,
});

interface Props {
  stops: PublicStop[];
  routes: PublicRoute[];
  summary: Record<string, unknown>;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ROUTE_NAMES: Record<string, string> = {
  'route-la-mesa-unrc-001': 'La Mesa',
  'route-centro-unrc-001': 'Centro',
};

export default function PublicMapPage({ stops, routes, summary }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestStopId, setNearestStopId] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<PublicStop | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [filterRoute, setFilterRoute] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userTurno, setUserTurno] = useState<string>('');
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore generic script errors from third-party/injected scripts (like extensions or translation overlays)
      if (
        event.message === "script error." ||
        event.message === "Script error." ||
        !event.filename ||
        event.lineno === 0
      ) {
        return;
      }
      setErrorLog(event.message + ' at ' + event.filename + ':' + event.lineno);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      setErrorLog('Unhandled promise rejection: ' + event.reason);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    const sidebarParam = searchParams.get('sidebar');
    if (sidebarParam === 'true') {
      setSidebarOpen(true);
    } else if (sidebarParam === 'false') {
      setSidebarOpen(false);
    }
  }, [searchParams]);

  const nearestStop = useMemo(
    () => stops.find((s) => s.id === nearestStopId) ?? null,
    [stops, nearestStopId]
  );

  const nearestRoute = useMemo(
    () => nearestStop ? routes.find((r) => r.id === nearestStop.route_id) : null,
    [nearestStop, routes]
  );

  const filteredStops = useMemo(
    () => (filterRoute === 'all' ? stops : stops.filter((s) => s.route_id === filterRoute)),
    [stops, filterRoute]
  );

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        const sorted = [...stops].sort(
          (a, b) => haversine(latitude, longitude, a.lat, a.lng) - haversine(latitude, longitude, b.lat, b.lng)
        );
        const nearest = sorted[0];
        if (nearest) {
          setNearestStopId(nearest.id);
          setSelectedStop(nearest);
          setSidebarOpen(true);
        }
        setGeoLoading(false);
      },
      (err) => {
        setGeoError('No se pudo obtener tu ubicación. ' + err.message);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [stops]);

  const renderSchedulePrompt = () => (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <label className="text-[11px] font-semibold text-black uppercase tracking-wide mb-1 block">¿A qué turno asistes?</label>
      <select 
        value={userTurno}
        onChange={(e) => setUserTurno(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-md p-1.5 bg-white text-black outline-none focus:border-[#630038]"
      >
        <option value="">Selecciona tu turno...</option>
        <option value="Matutino">Matutino</option>
        <option value="Intermedio">Intermedio</option>
        <option value="Vespertino">Vespertino</option>
      </select>
      {userTurno && (
        <div className="mt-2 bg-[#f0f7ff] border border-[#bae6fd] rounded-md p-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0369a1]">Horario estimado</span>
          <span className="text-sm font-bold text-[#0284c7]">
            {userTurno === 'Matutino' ? '06:30 AM' : userTurno === 'Intermedio' ? '11:00 AM' : '03:30 PM'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header style={{ background: '#630038' }} className="flex items-center gap-3 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/favicon.png" alt="UNRC" className="h-8 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="text-white min-w-0">
            <div className="font-bold text-sm sm:text-base leading-tight truncate">Transporte Universitario</div>
            <div className="text-xs opacity-80 hidden sm:block">UNRC Unidad Tijuana</div>
          </div>
        </div>

        {/* Desktop Navigation Options */}
        <div className="hidden md:flex items-center gap-2 mx-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              !sidebarOpen
                ? 'bg-white text-[#630038]'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Explorar
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              sidebarOpen
                ? 'bg-white text-[#630038]'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
            Paradas
          </button>
          <Link
            href="/informe"
            className="px-3 py-1.5 text-xs font-semibold rounded-md !text-white/80 hover:!text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors !no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Informe
          </Link>
        </div>

        <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          Proyecto piloto 2026
        </span>
        <button
          className={`ml-2 px-3 py-1.5 transition-colors sm:hidden flex items-center gap-1.5 text-sm font-semibold rounded-md ${sidebarOpen ? 'bg-white text-[#630038]' : 'bg-[rgba(255,255,255,0.15)] text-white'}`}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Mostrar/ocultar panel"
        >
          {sidebarOpen ? 'Cerrar' : 'Menú'}
        </button>
      </header>

      {errorLog && (
        <div className="bg-red-600 text-white p-3 font-mono text-xs z-[9999] overflow-auto max-h-40 shrink-0">
          <strong>JS Error:</strong> {errorLog}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative pb-16 md:pb-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="absolute md:relative inset-0 w-full md:w-80 shrink-0 flex flex-col border-r border-gray-200 overflow-hidden bg-white z-[1100] md:shadow-none">

            {/* Nearest stop result */}
            {nearestStop ? (
              <div className="mx-3 mt-3 rounded-lg p-3 text-sm border" style={{ background: '#f0f7ff', borderColor: '#0ea5e9' }}>
                <p className="font-bold text-blue-700 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0ea5e9"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Tu parada más cercana
                </p>
                <p className="font-semibold">{nearestStop.name}</p>
                <p className="text-black text-xs mt-0.5">
                  Días activos: {nearestStop.dias_raw}
                </p>
                {nearestRoute && (
                  <p className="mt-1 text-xs">
                    <span className="font-medium">Ruta:</span>{' '}
                    <span className="inline-block px-1.5 py-0.5 rounded text-white text-xs" style={{ background: nearestRoute.color }}>
                      {nearestRoute.name}
                    </span>
                  </p>
                )}
                {userLocation && (
                  <p className="text-xs text-black mt-1">
                    A {haversine(userLocation[0], userLocation[1], nearestStop.lat, nearestStop.lng).toFixed(1)} km de distancia
                  </p>
                )}
                {renderSchedulePrompt()}
              </div>
            ) : (
              <div className="mx-3 mt-3 shrink-0">
                <button
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-95"
                  style={{ background: '#630038' }}
                >
                  {geoLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/>
                    </svg>
                  )}
                  Encontrar mi parada más cercana
                </button>
                {geoError && (
                  <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg text-center border border-red-200">
                    {geoError}
                  </div>
                )}
              </div>
            )}

            {/* Selected stop detail */}
            {selectedStop && selectedStop.id !== nearestStopId && (
              <div className="mx-3 mt-2 rounded-lg p-3 text-sm border border-gray-200 bg-gray-50">
                <p className="font-bold" style={{ color: '#630038' }}>{selectedStop.name}</p>
                <p className="text-black text-xs mt-0.5">
                  Días activos: {selectedStop.dias_raw}
                </p>
                {renderSchedulePrompt()}
              </div>
            )}

            {/* Route filter */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-xs font-semibold text-black uppercase tracking-wide mb-2">Filtrar por ruta</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRoute('all')}
                  className={`flex-1 text-xs py-1.5 rounded-md font-semibold border transition-colors ${filterRoute === 'all' ? 'text-white border-transparent' : 'bg-white text-black border-gray-200 hover:bg-gray-50'}`}
                  style={filterRoute === 'all' ? { background: '#630038', borderColor: '#630038' } : {}}
                >
                  Todas
                </button>
                {routes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setFilterRoute(r.id)}
                    className={`flex-1 text-xs py-1.5 rounded-md font-semibold border transition-colors ${filterRoute === r.id ? 'text-white border-transparent' : 'bg-white text-black border-gray-200 hover:bg-gray-50'}`}
                    style={filterRoute === r.id ? { background: r.color, borderColor: r.color } : {}}
                  >
                    {ROUTE_NAMES[r.id] ?? r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stops list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <p className="text-xs text-black mb-2">{filteredStops.length} paradas</p>
              {filteredStops.map((stop) => {
                const route = routes.find((r) => r.id === stop.route_id);
                const isNearest = stop.id === nearestStopId;
                const isSelected = stop.id === selectedStop?.id;
                return (
                  <button
                    key={stop.id}
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors border ${isNearest ? 'border-blue-300 bg-blue-50' : isSelected ? 'border-gray-300 bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={route?.color ?? '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
                      <span className="text-sm font-medium text-black truncate">{stop.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Login teaser */}
            <div className="m-3 rounded-lg p-3 border border-dashed border-gray-300 bg-gray-50 shrink-0">
              <div className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="mt-0.5 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-black">Próximamente: acceso con matrícula</p>
                  <p className="text-xs text-black mt-0.5 leading-tight">
                    Inicia sesión para ver tu parada asignada y recibir avisos de horario.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Map */}
        <div className="flex-1 relative min-w-0 flex flex-col">
          <PublicStopsMap
            stops={filteredStops}
            routes={routes}
            userLocation={userLocation}
            nearestStopId={nearestStopId}
            selectedStopId={selectedStop?.id}
            onStopClick={setSelectedStop}
          />
          
          {/* Floating Action Button for Location */}
          <div className="absolute bottom-[4.5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-sm pointer-events-none">
            <button
              onClick={handleGeolocate}
              disabled={geoLoading}
              className="w-full pointer-events-auto flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all shadow-[0_4px_14px_0_rgba(122,0,60,0.39)] disabled:opacity-60 hover:scale-[1.02] active:scale-95"
              style={{ background: '#630038' }}
            >
              {geoLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/>
                </svg>
              )}
              Encontrar mi parada más cercana
            </button>
            {geoError && (
              <div className="mt-2 text-xs font-medium text-red-600 bg-white/90 p-2 rounded-lg text-center backdrop-blur-sm shadow pointer-events-auto">
                {geoError}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Nav Bar (Mobile) */}
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 z-[1200] flex items-center justify-around md:hidden px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button 
             onClick={() => setSidebarOpen(false)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${!sidebarOpen ? 'text-[#630038]' : 'text-gray-500'}`}
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
             <span className="text-[10px] font-bold">Explorar</span>
          </button>
          
          <button 
             onClick={() => setSidebarOpen(true)}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${sidebarOpen ? 'text-[#630038]' : 'text-gray-500'}`}
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
             <span className="text-[10px] font-bold">Paradas</span>
          </button>

          <Link
             href="/informe"
             className="flex flex-col items-center justify-center w-full h-full space-y-1 !text-gray-500 hover:!text-[#630038] !no-underline"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             <span className="text-[10px] font-bold">Informe</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
