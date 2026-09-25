import type { Metadata } from "next";
import Link from "next/link";
import { CategorySidebar } from "@/components/category-sidebar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SubcategoryDirectory } from "@/components/subcategory-directory";
import { getCategories, getPublishedBusinessesByIds } from "@/lib/businesses";
import { getShortCategoryLabel } from "@/lib/category-labels";
import {
  getMostViewedProductIds,
  getProductSubcategoriesForCategory,
  getPublishedProductsForSubcategory,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Categorias",
  description:
    "Explora productos de comercios aliados de Pereira por categoria y subcategoria.",
};

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  searchParams: Promise<{
    categoria?: string | string[];
    subcategoria?: string | string[];
  }>;
};

export default async function CategoriesPage(props: CategoriesPageProps) {
  const categories = getCategories();
  const searchParams = await props.searchParams;
  const requestedCategory = getSingleParam(searchParams.categoria);
  const selectedCategory = categories.includes(requestedCategory ?? "")
    ? (requestedCategory as string)
    : categories[0];
  const subcategories = await getProductSubcategoriesForCategory(selectedCategory);
  const requestedSubcategory = getSingleParam(searchParams.subcategoria);
  const selectedSubcategory = subcategories.find(
    (subcategory) => subcategory.slug === requestedSubcategory,
  );
  const categoryHref = `/categorias?categoria=${encodeURIComponent(selectedCategory)}`;

  let directory: { brandIds: string[]; brands: Awaited<ReturnType<typeof getPublishedBusinessesByIds>>; featuredIds: string[]; products: Awaited<ReturnType<typeof getPublishedProductsForSubcategory>>["products"] } | null =
    null;

  if (selectedSubcategory) {
    const productsPage = await getPublishedProductsForSubcategory({
      category: selectedCategory,
      limit: 24,
      subcategorySlug: selectedSubcategory.slug,
    });
    const businessIds = [
      ...new Set(productsPage.products.map((product) => product.businessId)),
    ].slice(0, 10);
    const [featuredIds, brands] = await Promise.all([
      getMostViewedProductIds(
        productsPage.products.map((product) => product.id),
        2,
      ),
      getPublishedBusinessesByIds(businessIds),
    ]);

    directory = {
      brandIds: businessIds,
      brands,
      featuredIds,
      products: productsPage.products,
    };
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <div className="mx-auto flex max-w-6xl">
          <CategorySidebar categories={categories} selectedCategory={selectedCategory} />

          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            <p className="text-xs font-black uppercase tracking-wide text-brand sm:text-sm">
              Categorias
            </p>
            <h1 className="mt-1.5 font-display text-xl font-extrabold text-ink sm:text-3xl">
              {getShortCategoryLabel(selectedCategory)}
            </h1>

            {selectedSubcategory ? (
              <>
                <p className="mt-1 text-sm text-stone-600">
                  {selectedSubcategory.name}
                </p>
                <SubcategoryDirectory
                  backHref={categoryHref}
                  brands={directory?.brands ?? []}
                  featuredProductIds={directory?.featuredIds ?? []}
                  products={directory?.products ?? []}
                />
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-stone-600">
                  Elige un tipo de producto dentro de {getShortCategoryLabel(selectedCategory)}.
                </p>
                {subcategories.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/categorias?categoria=${encodeURIComponent(selectedCategory)}&subcategoria=${subcategory.slug}`}
                        className="md-focus rounded-2xl border border-[var(--md-outline-variant)] bg-white px-4 py-3 text-center text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="md-surface mt-4 border-dashed p-6 text-center">
                    <p className="font-display text-base font-bold text-ink">
                      Aun no hay productos publicados en esta categoria.
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Vuelve pronto, los comercios siguen publicando su catalogo.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
