import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Newz Mídia – Agência de mídia online e offline", template: "%s · Newz Mídia" },
  description:
    "Agência de mídia online e offline em Pindamonhangaba. Google, Meta, TikTok, marketplaces, rádio, jornal, outdoor, ônibus e carros de aplicativo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Work+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-navy antialiased">{children}</body>
    </html>
  );
}
