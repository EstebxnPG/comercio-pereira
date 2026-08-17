import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { PageHero } from "@/components/page-hero";
import { StatusSection } from "@/components/status-section";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Como usar Compra en Pereira para encontrar, revisar y contactar comercios aliados.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Como funciona"
          title="Encuentra comercios sin intermediarios"
          description="Compra en Pereira no procesa pagos ni pedidos. Su funcion es ayudarte a descubrir comercios, revisar sus datos disponibles y contactarlos directamente."
          primaryHref="/comercios"
          primaryLabel="Buscar comercios"
        />
        <HowItWorksSection />
        <StatusSection />
      </main>
      <Footer />
    </>
  );
}
