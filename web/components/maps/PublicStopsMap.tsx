'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

export interface PublicStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  route_id: string;
  turno: string;
  dias_raw: string;
}

export interface PublicRoute {
  id: string;
  name: string;
  description?: string;
  color: string;
  points: [number, number][];
}

interface Props {
  stops: PublicStop[];
  routes: PublicRoute[];
  userLocation?: [number, number] | null;
  nearestStopId?: string | null;
  onStopClick?: (stop: PublicStop) => void;
  selectedStopId?: string | null;
}

const UNRC_LAT = 32.436451;
const UNRC_LNG = -116.860092;

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

function createStopElement(
  size: number,
  bg: string,
  border: string,
): HTMLDivElement {
  const el = document.createElement('div');
  const svgSize = Math.round(size * 0.6);
  el.innerHTML = `<div style="background:${bg};border-radius:50%;width:${size}px;height:${size}px;border:2.5px solid ${border};box-shadow:0 2px 6px rgba(0,0,0,0.35);cursor:pointer;display:flex;align-items:center;justify-content:center;">
    <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
  </div>`;
  el.style.cursor = 'pointer';
  return el;
}

export default function PublicStopsMap({
  stops,
  routes,
  userLocation,
  nearestStopId,
  onStopClick,
  selectedStopId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [-116.94, 32.47],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Add route lines
      routes.forEach((route) => {
        if (!route.points?.length) return;
        const coordinates = route.points.map(([lat, lng]) => [lng, lat] as [number, number]);

        map.addSource(`route-${route.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates },
          },
        });

        map.addLayer({
          id: `route-line-${route.id}`,
          type: 'line',
          source: `route-${route.id}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': route.color || '#666',
            'line-width': 5,
            'line-opacity': 0.85,
          },
        });

        // Route click popup
        map.on('click', `route-line-${route.id}`, (e) => {
          new maplibregl.Popup({ offset: 10 })
            .setLngLat(e.lngLat)
            .setHTML(`<b>${route.name}</b>${route.description ? '<br>' + route.description.slice(0, 80) : ''}`)
            .addTo(map);
        });

        map.on('mouseenter', `route-line-${route.id}`, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', `route-line-${route.id}`, () => {
          map.getCanvas().style.cursor = '';
        });
      });
    });

    // UNRC marker
    const unrcEl = document.createElement('div');
    unrcEl.innerHTML = `<div style="background:#7A003C;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">U</div>`;
    new maplibregl.Marker({ element: unrcEl })
      .setLngLat([UNRC_LNG, UNRC_LAT])
      .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML('<b>UNRC Unidad Tijuana</b><br>Destino del servicio'))
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw/redraw stop markers
  const drawStops = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stops.forEach((stop) => {
      const isNearest = stop.id === nearestStopId;
      const isSelected = stop.id === selectedStopId;
      const bg = isNearest ? '#0ea5e9' : isSelected ? '#7A003C' : '#374151';
      const border = isNearest || isSelected ? '#fff' : '#9ca3af';
      const size = isNearest || isSelected ? 36 : 28;

      const el = createStopElement(size, bg, border);

      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(
        `<div style="min-width:160px"><b>${stop.name}</b><br><span style="color:#666">${stop.turno} · ${stop.dias_raw}</span></div>`
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.lng, stop.lat])
        .setPopup(popup)
        .addTo(map);

      if (onStopClick) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onStopClick(stop);
        });
      }

      markersRef.current.push(marker);
    });
  }, [stops, nearestStopId, selectedStopId, onStopClick]);

  useEffect(() => {
    drawStops();
  }, [drawStops]);

  // User location marker + nearest line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Cleanup previous
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Remove old nearest line
    if (map.getLayer('nearest-line')) map.removeLayer('nearest-line');
    if (map.getSource('nearest-line')) map.removeSource('nearest-line');

    if (!userLocation) return;

    // User dot
    const userEl = document.createElement('div');
    userEl.innerHTML = `<div style="background:#0ea5e9;border:3px solid #fff;border-radius:50%;width:18px;height:18px;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`;
    userMarkerRef.current = new maplibregl.Marker({ element: userEl })
      .setLngLat([userLocation[1], userLocation[0]])
      .setPopup(new maplibregl.Popup({ offset: 10 }).setText('Tu ubicación'))
      .addTo(map);

    // Dashed line to nearest stop
    const nearest = stops.find((s) => s.id === nearestStopId);
    if (nearest) {
      if (map.isStyleLoaded()) {
        addNearestLine(map, userLocation, nearest);
      } else {
        map.on('load', () => addNearestLine(map, userLocation, nearest));
      }

      map.fitBounds(
        [
          [Math.min(userLocation[1], nearest.lng), Math.min(userLocation[0], nearest.lat)],
          [Math.max(userLocation[1], nearest.lng), Math.max(userLocation[0], nearest.lat)],
        ],
        { padding: 60 }
      );
    } else {
      map.flyTo({ center: [userLocation[1], userLocation[0]], zoom: 14 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, nearestStopId]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}

function addNearestLine(map: maplibregl.Map, userLocation: [number, number], nearest: PublicStop) {
  if (map.getSource('nearest-line')) return;
  map.addSource('nearest-line', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [userLocation[1], userLocation[0]],
          [nearest.lng, nearest.lat],
        ],
      },
    },
  });
  map.addLayer({
    id: 'nearest-line',
    type: 'line',
    source: 'nearest-line',
    paint: {
      'line-color': '#0ea5e9',
      'line-width': 2,
      'line-dasharray': [6, 4],
      'line-opacity': 0.8,
    },
  });
}
