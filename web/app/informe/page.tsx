import Image from "next/image";
import Link from "next/link";

import { ChartCard } from "@/components/chart-card";
import { DashboardMapLoader } from "@/components/dashboard-map-loader";
import { VideoPlayer } from "@/components/video-player";
import { loadSiteData } from "@/lib/site-data";
import { Map, FileText, LayoutDashboard, Download } from 'lucide-react';

const VINO_SCALE = ["#BC955C", "#630038", "#235B4E", "#B80845", "#F75F17", "#0DA870"];

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function getThemeIcon(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("tarifa") || lower.includes("precio")) return "coin";
  if (lower.includes("cobertura") || lower.includes("colonias")) return "map-pin";
  if (lower.includes("ruta") || lower.includes("directa") || lower.includes("transbordo")) return "bus";
  if (lower.includes("horario") || lower.includes("puntualidad")) return "clock";
  if (lower.includes("retorno") || lower.includes("entrada")) return "repeat";
  if (lower.includes("seguridad") || lower.includes("cruce")) return "alert";
  if (lower.includes("vulnerable") || lower.includes("apoyo")) return "handshake";
  if (lower.includes("seguimiento")) return "bell";
  return "megaphone";
}

const ICON_PATHS: Record<string, string> = {
  coin: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H11.5v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.65c.1 1.7 1.37 2.66 2.85 2.97V19h1.73v-1.67c1.52-.29 2.72-1.16 2.72-2.74 0-2.19-1.82-2.98-3.64-3.45z",
  "map-pin": "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  bus: "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z",
  clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  alert: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  handshake: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  megaphone: "M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z",
};

export default async function HomePage() {
  const { summary, map } = await loadSiteData();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header style={{ background: '#630038' }} className="flex items-center gap-3 px-4 py-3 shrink-0 z-[1200]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/favicon.png" alt="UNRC" className="h-8 w-auto object-contain" />
          <div className="text-white min-w-0">
            <div className="font-bold text-sm sm:text-base leading-tight truncate">Transporte Universitario</div>
            <div className="text-xs opacity-80 hidden sm:block">UNRC Unidad Tijuana</div>
          </div>
        </div>

        {/* Desktop Navigation Options */}
        <div className="hidden md:flex items-center gap-2 mx-4">
          <Link
            href="/mapa-demanda"
            className="px-3 py-1.5 text-xs font-semibold rounded-md !text-white/80 hover:!text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors !no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            Explorar
          </Link>
          <Link
            href="/mapa-demanda?sidebar=true"
            className="px-3 py-1.5 text-xs font-semibold rounded-md !text-white/80 hover:!text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors !no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
            Paradas
          </Link>
          <Link
            href="/informe"
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white !text-[#630038] flex items-center gap-1.5 transition-colors !no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Informe
          </Link>
        </div>

        <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          Proyecto piloto 2026
        </span>
      </header>

      {/* Main content scrollable container */}
      <div className="flex-1 h-full overflow-y-auto pb-16 md:pb-0 bg-[#fefefe]">
        <main className="site-shell">
      <section className="hero-block">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">{summary.recipientInstitution}</span>
            <div className="hero-brand-logo">
              <Image
                src="/brand/logo1.png"
                alt="Logo UNRC"
                width={420}
                height={130}
                priority
              />
            </div>
            <h1 style={{ color: '#E8D193' }}>{summary.reportTitle}</h1>
            <p className="hero-subtitle">
              Asi se mueven los estudiantes de la UNRC en Tijuana: rutas, horarios,
              colonias y propuestas directas de quienes usan el transporte todos los dias.
            </p>
            <p className="hero-summary">
              Este estudio recoge las voces de {summary.metrics.totalResponses} estudiantes para
              entender como llegan a la universidad, cuanto pagan y que necesitan mejorar.
              Toda la informacion es publica y anonima.
            </p>
            <div className="hero-actions">
              <Link className="primary-action flex items-center gap-2" href={summary.downloads.pdf}>
                <FileText className="w-5 h-5" />
                Descargar reporte PDF
              </Link>

              <Link className="route-finder-action flex items-center gap-2" href="/mapa-demanda">
                <Map className="w-5 h-5" />
                Buscar mi ruta
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <strong>Elaborado por:</strong> {summary.author.name}
              </span>
              <span>
                <strong>Contacto:</strong> {summary.author.email}
              </span>
            </div>

          </div>
          <div className="hero-side flex flex-col gap-4">
            <div className="story-card">
              <p className="eyebrow">Dato clave</p>
              <h2>
                {summary.metrics.topColonia} es la colonia con mas estudiantes y la mayoria
                asiste en turno {summary.metrics.topTurno.toLowerCase()}.
              </h2>
              <p>
                Estos resultados pueden ayudar a diseñar rutas mas eficientes, tarifas justas
                y horarios que funcionen para la comunidad universitaria.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10 overflow-hidden text-white">
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-80 mb-2 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Contexto del problema.
              </p>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2 shadow-inner">
                <VideoPlayer
                  src="https://tkx.mp.lura.live/rest/v2/mcp/video/1463714/master.m3u8?anvack=D7xyKLzOp0JHoIwNS7oKVgID6aJEQveO&eud=UNCm6h3DllNiat2gvgt%2FxI%2Bm4RI3cBabrR8kYW1kakrL914X%2FzGmYzxQG5tXX5FSyiiK9NWC9wr3eQXYw9pjZg%3D%3D"
                  poster="/news-thumbnail.jpg"
                />
              </div>
              <p className="text-xs font-semibold leading-snug">
                Alumnos piden puente peatonal en Tijuana por cruce peligroso
              </p>
              <p className="text-[10px] opacity-75 mt-1">
                Fuente: <a href="https://www.nmas.com.mx/baja-california/sociedad/alumnos-piden-puente-peatonal-universidad-tijuana-cruce-peligroso/" target="_blank" rel="noopener noreferrer" className="underline !text-white hover:opacity-80">N+ Baja California</a> / Tritón Comunicaciones S.A. de C.V.
              </p>
            </div>
          </div>
        </div>

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Estudiantes encuestados</span>
            <strong>{summary.metrics.totalResponses}</strong>
            <small>Voces que cuentan para tomar decisiones</small>
          </article>
          <article className="metric-panel">
            <span>Ubicaciones identificadas</span>
            <strong>{summary.metrics.geolocated}</strong>
            <small>{summary.metrics.geolocatedPct}% pudieron ubicarse en el mapa</small>
          </article>
          <article className="metric-panel">
            <span>Sugerencias recibidas</span>
            <strong>{summary.metrics.comments}</strong>
            <small>{summary.metrics.commentsPct}% compartieron propuestas concretas</small>
          </article>
          <article className="metric-panel">
            <span>Colonias de origen</span>
            <strong>{summary.metrics.uniqueColonias}</strong>
            <small>La mas frecuente: {summary.metrics.topColonia}</small>
          </article>
        </div>

        <nav className="anchor-row" aria-label="Secciones del reporte">
          <a href="#mapa">Mapa</a>
          <a href="#rutas-piloto">Rutas Piloto</a>
          <a href="#series">Datos</a>
          <a href="#sugerencias">Propuestas</a>
          <a href="#nube">Voces</a>
          <a href="#proceso">El Proceso</a>
          <a href="#metodologia">Transparencia</a>
          <a href="#descargas">Descargas</a>
          <a href="#tecnico">Tecnico</a>
        </nav>
      </section>

      <section id="proceso" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Metodología</p>
            <h2>El proceso detrás de los datos</h2>
          </div>
          <p>
            Este proyecto transforma encuestas crudas en una propuesta logística optimizada, demostrando un flujo de trabajo completo desde la ingeniería de datos hasta el desarrollo frontend.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-0">
          <div className="relative flex flex-col items-center text-center p-6 bg-[#235B4E] text-white rounded-xl md:rounded-none md:[clip-path:polygon(0%_0%,_90%_0%,_100%_50%,_90%_100%,_0%_100%)] md:pr-10 z-40 md:-mr-4">
            <div className="w-10 h-10 rounded-full bg-white text-[#235B4E] flex items-center justify-center font-bold text-lg mb-4 shadow-sm">1</div>
            <h3 className="font-bold text-sm mb-2 text-white">Recolección</h3>
            <p className="text-xs text-white/90">Encuestas en Google Forms con respuestas abiertas de direcciones y necesidades.</p>
          </div>
          <div className="relative flex flex-col items-center text-center p-6 bg-[#BC955C] text-black rounded-xl md:rounded-none md:[clip-path:polygon(0%_0%,_90%_0%,_100%_50%,_90%_100%,_0%_100%,_10%_50%)] md:pl-10 md:pr-10 z-30 md:-mr-4">
            <div className="w-10 h-10 rounded-full bg-white text-[#BC955C] flex items-center justify-center font-bold text-lg mb-4 shadow-sm">2</div>
            <h3 className="font-bold text-sm mb-2 text-black">Procesamiento (Python)</h3>
            <p className="text-xs text-black/90">Limpieza con Pandas y geocodificación automática usando la API de Geopy/Nominatim.</p>
          </div>
          <div className="relative flex flex-col items-center text-center p-6 bg-[#F75F17] text-white rounded-xl md:rounded-none md:[clip-path:polygon(0%_0%,_90%_0%,_100%_50%,_90%_100%,_0%_100%,_10%_50%)] md:pl-10 md:pr-10 z-20 md:-mr-4">
            <div className="w-10 h-10 rounded-full bg-white text-[#F75F17] flex items-center justify-center font-bold text-lg mb-4 shadow-sm">3</div>
            <h3 className="font-bold text-sm mb-2 text-white">Análisis Logístico</h3>
            <p className="text-xs text-white/90">Clustering espacial para definir paradas y trazado de rutas basado en demanda.</p>
          </div>
          <div className="relative flex flex-col items-center text-center p-6 bg-[#630038] text-white rounded-xl md:rounded-none md:[clip-path:polygon(0%_0%,_100%_0%,_100%_100%,_0%_100%,_10%_50%)] md:pl-12 z-10">
            <div className="w-10 h-10 rounded-full bg-white text-[#630038] flex items-center justify-center font-bold text-lg mb-4 shadow-sm">4</div>
            <h3 className="font-bold text-sm mb-2 text-white">Visualización (React)</h3>
            <p className="text-xs text-white/90">Dashboard interactivo SSR con Next.js, MapLibre GL JS y reportes en PDF.</p>
          </div>
        </div>
      </section>

      <section id="metodologia" className="section-block split-layout">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Transparencia</p>
              <h2>Cuidamos la informacion personal</h2>
            </div>
          </div>
          <ul className="method-list">
            <li>Ningun nombre, correo, telefono o matricula aparece en esta publicacion.</li>
            <li>Las ubicaciones se movieron aleatoriamente unos metros para proteger domicilios.</li>
            <li>Los datos originales se guardan de forma segura solo para uso interno.</li>
          </ul>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Para medios y directivos</p>
              <h2>Que incluye este estudio</h2>
            </div>
          </div>
          <div className="disclosure-grid">
            <div>
              <h3>Datos publicos</h3>
              <ul>
                <li>Estadisticas de turnos, dias, colonias y sugerencias.</li>
                <li>Puntos en el mapa que muestran densidad sin revelar domicilios.</li>
                <li>Reporte PDF y dataset descargable para analisis independiente.</li>
              </ul>
            </div>
            <div>
              <h3>Protegemos</h3>
              <ul>
                <li>Identidad de los estudiantes (nombres, correos, telefonos).</li>
                <li>Direcciones exactas o referencias domiciliarias.</li>
                <li>Ubicaciones reales de origen.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="mapa" className="section-block split-layout">
        <div className="panel panel-map">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Mapa de demanda</p>
              <h2>De donde salen los estudiantes</h2>
            </div>
            <p>
              Cada punto representa un estudiante. Las zonas mas brillantes son donde hay mas
              concentracion de personas que necesitan transporte.
            </p>
          </div>
          <DashboardMapLoader data={map} />
        </div>
        <aside className="panel insight-stack">
          <div>
            <p className="eyebrow">En palabras simples</p>
            <h3>Que nos dice el mapa</h3>
          </div>
          <ul className="insight-list">
            <li>
              <strong>{summary.metrics.topColonia}</strong> es donde viven mas estudiantes de la UNRC.
            </li>
            <li>
              Se identificaron {summary.map.count} puntos de salida en toda la zona metropolitana.
            </li>
            <li>
              El <strong>{summary.metrics.topTurno.toLowerCase()}</strong> concentra la mayor demanda de transporte.
            </li>
            <li>{summary.suggestions.fareSummary}</li>
          </ul>
          <div className="chip-row">
            {summary.series.colonias.slice(0, 6).map((row: any) => (
              <span key={row.Categoria} className="metric-chip">
                {row.Categoria}: {row.Porcentaje.toFixed(1)}%
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section id="rutas-piloto" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Solución Propuesta</p>
            <h2>Diseño de Rutas Piloto</h2>
          </div>
          <p>
            A partir de la muestra operativa con ubicación validada, se diseñaron 2 rutas piloto que cubren el 100% de la demanda, con tiempos de viaje estimados de 90 minutos por trayecto.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="panel">
            <div className="panel-head">
              <h3>Ruta 1: Centro UNRC vía Corredor 2000</h3>
            </div>
            <ul className="insight-list">
              <li><strong>Cobertura:</strong> 107 alumnos</li>
              <li><strong>Desglose por turno:</strong> Matutino (49), Intermedio (32), Vespertino (26)</li>
              <li><strong>Paradas principales:</strong> Plaza Paseo 2000, Puente Peatonal Real de San Francisco, Parada Sendero.</li>
              <li><strong>Horarios de salida:</strong> 5:30 am (Mat.), 9:30 am (Int.), 1:30 pm (Vesp.)</li>
            </ul>
          </article>
          <article className="panel">
            <div className="panel-head">
              <h3>Ruta 2: La Mesa UNRC vía Camino Verde</h3>
            </div>
            <ul className="insight-list">
              <li><strong>Cobertura:</strong> 83 alumnos</li>
              <li><strong>Desglose por turno:</strong> Matutino (47), Intermedio (21), Vespertino (15)</li>
              <li><strong>Paradas principales:</strong> Calzapato Carrousel, Mitote, Oxxo Monte Bello.</li>
              <li><strong>Horarios de salida:</strong> 5:30 am (Mat.), 9:30 am (Int.), 1:30 pm (Vesp.)</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="series" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Los numeros</p>
            <h2>Como se distribuye la demanda de transporte</h2>
          </div>
          <p>
            Turnos, dias de asistencia y las colonias con mas estudiantes. Esta informacion
            sirve para planificar rutas y horarios.
          </p>
        </div>
        <div className="chart-grid">
          <ChartCard
            title="Turnos de clase"
            subtitle="En que horario llegan mas estudiantes"
            data={summary.series.turnos}
            colors={VINO_SCALE}
          />
          <ChartCard
            title="Dias de asistencia"
            subtitle="Que dias necesitan transporte"
            data={summary.series.dias}
            colors={["#630038", "#BC955C", "#235B4E", "#F75F17"]}
          />
          <ChartCard
            title="Colonias de origen"
            subtitle="De donde vienen los estudiantes"
            data={summary.series.colonias}
            colors={["#BC955C", "#630038", "#235B4E", "#B80845", "#0DA870"]}
            layout="vertical"
          />
        </div>
      </section>

      <section id="sugerencias" className="section-block">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Lo que piden los estudiantes</p>
              <h2>Temas mas mencionados</h2>
            </div>
            <p>
              Cada icono representa un tema recurrente en las sugerencias. Los numeros indican
              cuantas veces fue mencionado.
            </p>
          </div>
          <div className="theme-icon-grid">
            {summary.suggestions.themes.map((theme: any) => (
              <article key={theme.label} className="theme-icon-card">
                <span className="theme-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d={ICON_PATHS[getThemeIcon(theme.label)]} />
                  </svg>
                </span>
                <div>
                  <h3>{theme.label}</h3>
                  <p>{theme.count} menciones ({theme.percentage.toFixed(1)}%)</p>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="section-block">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Tarifa sugerida por los alumnos</p>
              <h2>Cuanto creen que deberia costar el transporte</h2>
            </div>
            <p>
              Los montos que aparecen abajo son propuestas directas de los estudiantes
              sobre lo que consideran una tarifa justa para llegar a la universidad.
            </p>
          </div>
          <div className="fare-grid">
            {summary.suggestions.topFareValues.map((item: any) => (
              <div key={item.value} className="fare-card">
                <span className="fare-amount">${item.value}</span>
                <span className="fare-label">pesos</span>
                <span className="fare-count">{item.count} estudiantes</span>
              </div>
            ))}
          </div>
          <div className="highlight-card">
            <p className="eyebrow">Para autoridades y medios</p>
            <p>
              Los estudiantes proponen una tarifa entre $8 y $20 pesos segun la ruta.
              Las colonias con mayor demanda (Natura, Centro, Urbi Villas del Prado) son
              la base ideal para una ruta piloto. El Boulevard 2000 aparece recurrentemente
              como eje de conectividad.
            </p>
          </div>
        </article>
      </section>

      <section id="nube" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">En sus propias palabras</p>
            <h2>Testimonios de los estudiantes</h2>
          </div>
          <p>
            Estas son las sugerencias que compartieron los alumnos sobre el transporte
            universitario. Desplazate para leerlas todas.
          </p>
        </div>
        <div className="testimonials-scroll">
          {summary.suggestions.highlights.map((item: any, index: number) => (
            <article key={index} className="testimonial-card">
              <blockquote>{item.text}</blockquote>
              <div className="testimonial-meta">
                <span>{item.colonia}</span>
                <span>{item.turno}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="descargas" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Material publico</p>
            <h2>Descarga el reporte y los datos</h2>
          </div>
          <p>
            Todo esta disponible para estudiantes, medios, investigadores y tomadores de decisiones.
            Los datos son anonimos y reproducibles.
          </p>
        </div>
        <div className="download-grid">
          <article className="panel download-card">
            <h3>Reporte completo en PDF</h3>
            <p>
              Incluye hallazgos, graficas, recomendaciones y un codigo QR para acceder al mapa
              interactivo desde cualquier dispositivo.
            </p>
            <Link className="primary-action" href={summary.downloads.pdf}>
              Descargar PDF
            </Link>
          </article>

        </div>
      </section>

      <section id="tecnico" className="section-block">
        <div className="section-head">
          <div>
            <p className="eyebrow">Detalles tecnicos</p>
            <h2>Como se construyo este proyecto</h2>
          </div>
          <p>
            Para desarrolladores, investigadores y equipos tecnicos interesados en replicar
            o adaptar este modelo.
          </p>
        </div>
        <div className="tech-grid">
          <article className="panel tech-card">
            <h3>Procesamiento de datos</h3>
            <ul>
              <li><strong>Python 3.12</strong> con pandas para limpieza y analisis</li>
              <li><strong>Geopy / Nominatim</strong> para geocodificacion de direcciones</li>
              <li><strong>fpdf2</strong> para generacion automatica del reporte PDF</li>
              <li><strong>matplotlib</strong> para graficas estadisticas</li>
            </ul>
          </article>
          <article className="panel tech-card">
            <h3>Sitio web</h3>
            <ul>
              <li><strong>Next.js 16</strong> con App Router y TypeScript</li>
              <li><strong>Recharts</strong> para graficos interactivos</li>
              <li><strong>MapLibre GL JS</strong> para mapas vectoriales acelerados por hardware</li>
            </ul>
          </article>
          <article className="panel tech-card">
            <h3>Infraestructura</h3>
            <ul>
              <li><strong>Vercel</strong> para alojamiento y despliegue continuo del frontend</li>
            </ul>
          </article>
          <article className="panel tech-card">
            <h3>Codigo fuente</h3>
            <p>
              El proyecto es completamente abierto. Puedes ver el codigo, contribuir o
              adaptarlo para tu universidad.
            </p>
            <Link
              className="primary-action"
              href="https://github.com/danitocsc/transporte-unrc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en GitHub
            </Link>
          </article>
        </div>
      </section>
        </main>
      </div>

      {/* Bottom Nav Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 z-[1200] flex items-center justify-around md:hidden px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link 
           href="/mapa-demanda"
           className="flex flex-col items-center justify-center w-full h-full space-y-1 !text-gray-500 hover:!text-[#630038] !no-underline"
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
           <span className="text-[10px] font-bold">Explorar</span>
        </Link>
        
        <Link 
           href="/mapa-demanda?sidebar=true"
           className="flex flex-col items-center justify-center w-full h-full space-y-1 !text-gray-500 hover:!text-[#630038] !no-underline"
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
           <span className="text-[10px] font-bold">Paradas</span>
        </Link>

        <Link
           href="/informe"
           className="flex flex-col items-center justify-center w-full h-full space-y-1 !text-[#630038] !no-underline"
        >
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
           <span className="text-[10px] font-bold">Informe</span>
        </Link>
      </nav>
    </div>
  );
}
