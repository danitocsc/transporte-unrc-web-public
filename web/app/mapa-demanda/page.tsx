import PublicMapPage from '@/components/PublicMapPage';
import { readFileSync } from 'fs';
import path from 'path';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function MapaDemandaPage() {
  const dataDir = path.join(process.cwd(), 'public', 'data');

  const stopsRaw = JSON.parse(readFileSync(path.join(dataDir, 'paradas.json'), 'utf-8'));
  const routesRaw = JSON.parse(readFileSync(path.join(dataDir, 'custom_routes.json'), 'utf-8'));
  const summary = JSON.parse(readFileSync(path.join(dataDir, 'summary.json'), 'utf-8'));

  // Only expose non-personal fields — students[] array is never passed to the client
  const stops = (stopsRaw.stops ?? [])
    .filter((s: any) => s.active)
    .map((s: any) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      route_id: s.route_id,
      turno: s.turno,
      dias_raw: s.dias_raw,
    }));

  const routes = (Array.isArray(routesRaw) ? routesRaw : (routesRaw.routes ?? []))
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      color: r.color,
      points: r.points,
    }));

  return (
    <Suspense fallback={<div className="w-full h-full bg-slate-100 animate-pulse" />}>
      <PublicMapPage stops={stops} routes={routes} summary={summary} />
    </Suspense>
  );
}
