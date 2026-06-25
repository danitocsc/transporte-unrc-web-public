"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeriesRow } from "@/types/transport";

type ChartCardProps = {
  title: string;
  subtitle: string;
  data: SeriesRow[];
  colors: string[];
  layout?: "horizontal" | "vertical";
};

export function ChartCard({
  title,
  subtitle,
  data,
  colors,
  layout = "horizontal",
}: ChartCardProps) {
  const isVertical = layout === "vertical";
  const chartData = data.map((row) => ({
    ...row,
    label: row.Categoria,
    value: row.Cantidad,
    percentLabel: `${row.Cantidad} (${row.Porcentaje.toFixed(1)}%)`,
  }));

  const chartHeight = isVertical ? Math.max(460, chartData.length * 32) : 320;
  const yAxisWidth = isVertical ? Math.max(140, ...chartData.map((r) => r.label.length * 8)) : undefined;

  return (
    <article className="panel chart-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Serie</p>
          <h3>{title}</h3>
        </div>
        <p>{subtitle}</p>
      </div>
      <div className="chart-shell">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout={isVertical ? "vertical" : "horizontal"}
            margin={{ top: 20, right: 36, left: isVertical ? 8 : 8, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(42, 27, 37, 0.12)" />
            {isVertical ? (
              <>
                <XAxis type="number" stroke="#6a5a63" />
                <YAxis
                   type="category"
                  dataKey="label"
                  width={yAxisWidth}
                  stroke="#6a5a63"
                  tick={{ fontSize: 12 }}
                />
              </>
            ) : (
              <>
                <XAxis dataKey="label" stroke="#6a5a63" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6a5a63" />
              </>
            )}
            <Tooltip
              formatter={(value) => `${value ?? 0} respuestas`}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(42, 27, 37, 0.12)",
                boxShadow: "0 18px 30px rgba(42, 27, 37, 0.10)",
              }}
            />
            <Bar dataKey="value" radius={isVertical ? [0, 10, 10, 0] : [10, 10, 0, 0]}>
              {chartData.map((row, index) => (
                <Cell key={row.label} fill={colors[index % colors.length]} />
              ))}
              <LabelList
                dataKey="value"
                position={isVertical ? "right" : "top"}
                style={{ fill: "#6a5a63", fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chip-row">
        {chartData.slice(0, 8).map((row) => (
          <span key={row.label} className="metric-chip">
            {row.label}: {row.percentLabel}
          </span>
        ))}
      </div>
    </article>
  );
}
