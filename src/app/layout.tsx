import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://compra-en-pereira.local",
  ),
  title: {
    default: "Compra en Pereira",
    template: "%s | Compra en Pereira",
  },
  description:
    "Red de comercios aliados de Pereira para descubrir, contactar y compartir negocios locales.",
  openGraph: {
    title: "Compra en Pereira",
    description:
      "Encuentra comercios aliados de Pereira que continuan atendiendo desde sedes, nuevas ubicaciones o canales digitales.",
    url: "/",
    siteName: "Compra en Pereira",
    images: ["/brand/default-og.svg"],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compra en Pereira",
    description: "Descubre, contacta y comparte comercios aliados de Pereira.",
    images: ["/brand/default-og.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
