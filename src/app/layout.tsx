import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans, Space_Mono } from "next/font/google";
import { CategoryIconDefs } from "@/components/icons/category-icons";
import "./globals.css";

const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display-raw",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const fontBody = Public_Sans({
  variable: "--font-body-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const fontMono = Space_Mono({
  variable: "--font-mono-raw",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CategoryIconDefs />
        {children}
      </body>
    </html>
  );
}
