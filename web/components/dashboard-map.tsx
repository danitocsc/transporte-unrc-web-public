"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import type { MapPayload, PublicPoint } from "@/types/transport";

const UNRC_LOCATION: [number, number] = [-116.860092, 32.436451]; // [lng, lat]

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

function buildHeatGeoJSON(points: PublicPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((p) => ({
      type: "Feature" as const,
      properties: { weight: 0.8 },
      geometry: {
        type: "Point" as const,
        coordinates: [p.lon_publica, p.lat_publica],
      },
    })),
  };
}

type DashboardMapProps = {
  data: MapPayload;
};

export function DashboardMap({ data }: DashboardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [data.center[1], data.center[0]], // flip [lat,lng] -> [lng,lat]
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Heatmap source
      map.addSource("heat-points", {
        type: "geojson",
        data: buildHeatGeoJSON(data.points),
      });

      // Heatmap layer
      map.addLayer({
        id: "heat-layer",
        type: "heatmap",
        source: "heat-points",
        paint: {
          "heatmap-radius": 22,
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1,
          "heatmap-opacity": 0.7,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.2, "#ffffb2",
            0.4, "#fed976",
            0.6, "#feb24c",
            0.8, "#fd8d3c",
            0.9, "#fc4e2a",
            1.0, "#bd0026",
          ],
        },
      });
    });

    // UNRC marker
    const unrcEl = document.createElement("div");
    unrcEl.innerHTML = `<div style="background:#dc2626;border-radius:50%;width:20px;height:20px;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`;
    new maplibregl.Marker({ element: unrcEl })
      .setLngLat(UNRC_LOCATION)
      .setPopup(
        new maplibregl.Popup({ offset: 14 }).setHTML(
          "<strong>UNRC Unidad Tijuana</strong><br/>Universidad Nacional Rosario Castellanos"
        )
      )
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="map-wrapper">
      <div
        ref={containerRef}
        style={{ height: 520, width: "100%", borderRadius: 16 }}
      />

      <div className="map-legend">
        <div className="legend-section">
          <strong>Densidad de demanda:</strong>
          <span className="legend-gradient" />
          <span className="legend-labels">
            <span>Baja</span>
            <span>Alta</span>
          </span>
        </div>
        <div className="legend-section">
          <span className="legend-marker" /> UNRC Unidad Tijuana
        </div>
      </div>
    </div>
  );
}
