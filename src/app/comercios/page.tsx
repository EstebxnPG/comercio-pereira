import type { Metadata } from "next";
import { BusinessDirectory } from "@/components/business-directory";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StatusSection } from "@/components/status-section";
import { getCategories, getPublishedBusinessesPage } from "@/lib/businesses";
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
    limite?: string | string[];
    q?: string | string[];
  }>;
};

export default async function BusinessesPage(props: BusinessesPageProps) {
  const categories = getCategories();
  const searchParams = await props.searchParams;
  const selectedCategory = categories.includes(
    getSingleParam(searchParams.categoria) ?? "",
  )
    ? getSingleParam(searchParams.categoria) ?? "all"
      : "all";
  const rawStatus = getSingleParam(searchParams.estado);
  const selectedStatus =
    rawStatus && BUSINESS_STATUSES.includes(rawStatus as BusinessStatus)
      ? (rawStatus as BusinessStatus)
      : "all";
  const selectedQuery = parseSearch(getSingleParam(searchParams.q));
  const limit = parseLimit(getSingleParam(searchParams.limite));
  const businessesPage = await getPublishedBusinessesPage({
    category: selectedCategory,
    limit,
    query: selectedQuery,
    status: selectedStatus,
  });

  return (
    <>
      <Header />
      <main>
        <BusinessDirectory
          businesses={businessesPage.businesses}
          categories={categories}
          initialCategory={selectedCategory}
          initialLimit={limit}
          initialStatus={selectedStatus}
          initialQuery={selectedQuery}
          totalBusinesses={businessesPage.total}
        />
        <StatusSection />
      </main>
      <Footer />
    </>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSearch(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "";
}

function parseLimit(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 24) {
    return 24;
  }

  return Math.min(parsed, 96);
}
