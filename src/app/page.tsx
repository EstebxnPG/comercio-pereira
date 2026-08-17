import Link from "next/link";
import Image from "next/image";
import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSearch } from "@/components/hero-search";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { InitiativeSection } from "@/components/initiative-section";
import {
  getCategories,
  getCategorySummaries,
  getPublishedBusinesses,
} from "@/lib/businesses";
import { SITE_SLOGAN } from "@/lib/constants";

export default function Home() {
  const businesses = getPublishedBusinesses();
  const categories = getCategories();
  const categorySummaries = getCategorySummaries();
  const featuredBusinesses = businesses.slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-[#7F1D1D] text-white">
          <div className="absolute inset-0">
            <Image
              src="/brand/imagen-pereire-hero.png"
              alt="Plaza de Bolivar de Pereira con el Bolivar Desnudo"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F1D1D]/90 via-[#7F1D1D]/58 to-[#7F1D1D]/20" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#7F1D1D]/70 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-wide text-[#f5c84c]">
                Compra local, mueve a Pereira
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
                {SITE_SLOGAN}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
                Descubre comercios aliados de Pereira que continuan atendiendo
                desde sus establecimientos, nuevas ubicaciones o canales
                digitales.
              </p>
            </div>
            <HeroSearch categories={categories} />
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-white/90">
              <Link href="/categorias" className="underline-offset-4 hover:underline">
                {categorySummaries.length} categorias
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/comercios" className="underline-offset-4 hover:underline">
                {businesses.length} comercios publicados
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/como-funciona" className="underline-offset-4 hover:underline">
                Como funciona
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
                  Categorias
                </p>
                <h2 className="mt-2 text-3xl font-black text-[#22211f]">
                  Explora por tipo de comercio
                </h2>
              </div>
              <Link
                href="/categorias"
                className="inline-flex min-h-11 items-center text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
              >
                Ver todas las categorias
              </Link>
            </div>
            <div className="mt-8">
              <CategoryGrid categories={categorySummaries.slice(0, 6)} />
            </div>
          </div>
        </section>

        <section className="bg-[#fbfaf7] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
                  Comercios destacados
                </p>
                <h2 className="mt-2 text-3xl font-black text-[#22211f]">
                  Perfiles para compartir hoy
                </h2>
              </div>
              <Link
                href="/comercios"
                className="inline-flex min-h-11 items-center text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
              >
                Abrir directorio completo
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/comercios/${business.slug}`}
                  className="rounded-lg border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#B3262E] hover:shadow-sm"
                >
                  <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
                    {business.category}
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-[#22211f]">
                    {business.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {business.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <InitiativeSection />
      </main>
      <Footer />
    </>
  );
}
