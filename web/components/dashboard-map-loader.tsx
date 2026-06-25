"use client";

import dynamic from "next/dynamic";

import type { MapPayload } from "@/types/transport";

const DashboardMapInner = dynamic(
  () => import("@/components/dashboard-map").then((m) => m.DashboardMap),
  {
    ssr: false,
    loading: () => <div className="map-loading">Cargando mapa...</div>,
  }
);

type DashboardMapLoaderProps = {
  data: MapPayload;
};

export function DashboardMapLoader({ data }: DashboardMapLoaderProps) {
  return <DashboardMapInner data={data} />;
}
