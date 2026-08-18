import type { Metadata } from "next";
import { BusinessDirectory } from "@/components/business-directory";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { StatusSection } from "@/components/status-section";
import { getCategories, getPublishedBusinesses } from "@/lib/businesses";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";

export const metadata: Metadata = {
  title: "Comercios",
  description:
    "Directorio de comercios aliados de Pereira con filtros por categoria y estado de atencion.",
};

type BusinessesPageProps = {
  searchParams: Promise<{
    categoria?: string | string[];
    estado?: string | string[];
    q?: string | string[];
  }>;
};

export default async function BusinessesPage(props: BusinessesPageProps) {
  const businesses = await getPublishedBusinesses();
  const categories = getCategories();
  const searchParams = await props.searchParams;
  const selectedCategory =
    typeof searchParams.categoria === "string" &&
    categories.includes(searchParams.categoria)
      ? searchParams.categoria
      : "all";
  const selectedStatus =
    typeof searchParams.estado === "string" &&
    BUSINESS_STATUSES.includes(searchParams.estado as BusinessStatus)
      ? (searchParams.estado as BusinessStatus)
      : "all";
  const selectedQuery =
    typeof searchParams.q === "string" ? searchParams.q : "";

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Directorio"
          title="Comercios aliados"
          description="Busca negocios por nombre, categoria o descripcion. Filtra por estado de atencion y abre perfiles listos para contactar o compartir."
        />
        <BusinessDirectory
          businesses={businesses}
          categories={categories}
          initialCategory={selectedCategory}
          initialStatus={selectedStatus}
          initialQuery={selectedQuery}
        />
        <StatusSection />
      </main>
      <Footer />
    </>
  );
}
