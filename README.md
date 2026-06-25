# transporte-unrc-public

Sitio público de transparencia — análisis de demanda de transporte estudiantil UNRC Tijuana.

Expone `/mapa-demanda` (buscador de paradas y rutas piloto) e `/informe` (reporte completo interactivo con datos, metodología, vídeo y testimonios), garantizando la total privacidad de los alumnos.

---

## Estructura

```
.
├── web/                        Next.js 16
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── mapa-demanda/page.tsx
│   │   ├── informe/page.tsx
│   │   └── api/health/route.ts
│   ├── components/
│   │   ├── PublicMapPage.tsx
│   │   ├── chart-card.tsx
│   │   ├── video-player.tsx
│   │   └── maps/PublicStopsMap.tsx
│   ├── public/
│   │   ├── data/               paradas.json, custom_routes.json, summary.json
│   │   ├── brand/              logos y favicons
│   │   └── downloads/          reporte PDF
│   └── next.config.ts
└── README.md
```

---

## Despliegue en Vercel

Este proyecto se despliega automáticamente en Vercel a través de su integración con GitHub:

1. El directorio raíz del proyecto para el despliegue es `web/`.
2. Las compilaciones de producción se ejecutan de manera estándar mediante Next.js.
3. El dominio oficial del sitio es [transporte-unrc.vercel.app](https://transporte-unrc.vercel.app).

---

## Rutas disponibles

| Ruta | Descripción |
|---|---|
| `/` | Redirige a `/mapa-demanda` |
| `/mapa-demanda` | Mapa público e interactivo de paradas y rutas |
| `/informe` | Reporte completo de la demanda y propuesta de movilidad |
| `/api/health` | Healthcheck del sitio |

---

## Privacidad de Datos

Toda la información es completamente pública y anónima. El dataset `paradas.json` expone únicamente coordenadas generales de paradas y datos agrupados. **No se expone en ningún lugar** la matrícula, nombres, correos o direcciones exactas de los estudiantes.
