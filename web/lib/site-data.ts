import { promises as fs } from "node:fs";
import path from "node:path";

import type { MapPayload, SummaryPayload } from "@/types/transport";

const SUMMARY_PATH = path.join(process.cwd(), "public", "data", "summary.json");
const MAP_PATH = path.join(process.cwd(), "public", "data", "map_points.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const contents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(contents) as T;
}

export async function loadSiteData(): Promise<{
  summary: SummaryPayload;
  map: MapPayload;
}> {
  const [summary, map] = await Promise.all([
    readJsonFile<SummaryPayload>(SUMMARY_PATH),
    readJsonFile<MapPayload>(MAP_PATH),
  ]);

  return { summary, map };
}
