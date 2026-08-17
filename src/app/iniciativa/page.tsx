import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InitiativeSection } from "@/components/initiative-section";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Iniciativa",
  description:
    "Contexto de la iniciativa ciudadana Compra en Pereira y su enfoque de visibilidad comercial.",
};

export default function InitiativePage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Iniciativa"
          title="Una vitrina digital para dar visibilidad y espacio"
          description="El proyecto organiza informacion publica autorizada de comercios aliados para que mas personas puedan encontrarlos, contactarlos y compartirlos."
          primaryHref="/comercios"
          primaryLabel="Ver comercios"
        />
        <InitiativeSection />
      </main>
      <Footer />
    </>
  );
}
