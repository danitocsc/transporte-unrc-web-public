export type Turno = 'Matutino' | 'Intermedio' | 'Vespertino';

export interface PublicPoint {
  punto_id: string;
  colonia: string;
  turno: string;
  dias: string;
  licenciatura: string;
  lat_publica: number;
  lon_publica: number;
  fuente_coordenada_publica: string;
  sugerencia_publica: string;
}

export interface MapPayload {
  generatedAt: string;
  center: [number, number];
  focusBounds: [[number, number], [number, number]];
  points: PublicPoint[];
}

export interface SuggestionWord {
  text: string;
  weight: number;
  [k: string]: string | number;
}

export interface SuggestionHighlight {
  text: string;
  colonia: string;
  turno: string;
  [k: string]: string;
}

export interface SummaryPayload {
  recipientInstitution: string;
  reportTitle: string;
  generatedAt: string;
  author: { name: string; email: string; [k: string]: string };
  hosting: { brand: string; url: string; logo: string; label: string; [k: string]: string };
  downloads: { pdf: string; csv: string; [k: string]: string };
  metrics: {
    totalResponses: number;
    geolocated: number;
    geolocatedPct: number;
    comments: number;
    commentsPct: number;
    uniqueColonias: number;
    topColonia: string;
    topTurno: string;
    [k: string]: string | number;
  };
  map: { count: number; [k: string]: unknown };
  series: {
    turnos: SeriesRow[];
    dias: SeriesRow[];
    colonias: SeriesRow[];
    [k: string]: SeriesRow[];
  };
  suggestions: {
    fareSummary: string;
    themes: Array<{ icon: string; label: string; count: number; [k: string]: unknown }>;
    topFareValues: Array<{ value: number | string; [k: string]: unknown }>;
    highlights: Array<{ text: string; [k: string]: unknown }>;
    [k: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SeriesRow {
  Categoria: string;
  Cantidad: number;
  Porcentaje: number;
  [key: string]: string | number;
}

export interface SurveyRecord {
  matricula: string;
  turno: Turno | null;
  dias_asistencia: string | null;
  licenciatura: string | null;
  lugar_origen: string | null;
  lat: number | null;
  lng: number | null;
  // Future fields
  hora_toma_transporte?: string;
  tipo_transporte?: string;
  tiempo_trayecto?: string;
  hora_ideal_parada?: string;
  preferencia_servicio?: string;
}
