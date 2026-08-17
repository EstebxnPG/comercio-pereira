import type { Metadata } from "next";
import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { getCategorySummaries } from "@/lib/businesses";

export const metadata: Metadata = {
  title: "Categorias",
  description:
    "Categorias de comercios aliados de Pereira disponibles en Compra en Pereira.",
};

export default function CategoriesPage() {
  const categorySummaries = getCategorySummaries();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Categorias"
          title="Explora la oferta local por tipo de comercio"
          description="Cada categoria abre el directorio con el filtro correspondiente. Cuando el proyecto crezca, este espacio puede evolucionar a paginas especializadas por sector."
          primaryHref="/comercios"
          primaryLabel="Ver todos los comercios"
        />
        <section className="bg-[#fbfaf7] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <CategoryGrid categories={categorySummaries} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
