import type { Metadata } from "next";
import { Bitter, Noto_Sans } from "next/font/google";

import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const headingFont = Bitter({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "700"],
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rutas UNRC TJ",
  description: "Micrositio publico del analisis de demanda de transporte estudiantil de la UNRC Unidad Tijuana.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Rutas UNRC TJ",
    statusBarStyle: "default",
  },
};

import PwaPrompt from "@/components/PwaPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />

      </head>
      <body suppressHydrationWarning className={`${headingFont.variable} ${bodyFont.variable} h-full flex flex-col`}>
        {children}
        <PwaPrompt />
      </body>
    </html>
  );
}
