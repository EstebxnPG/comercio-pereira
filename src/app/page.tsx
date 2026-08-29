import Link from "next/link";
import Image from "next/image";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { BrandRail } from "@/components/brand-rail";
import { BusinessCard } from "@/components/business-card";
import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSearch } from "@/components/hero-search";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { InitiativeSection } from "@/components/initiative-section";
import {
  getBusinessesToDiscover,
  getCategories,
  getCategorySummaries,
  getPublishedBusinesses,
} from "@/lib/businesses";
import { SITE_SLOGAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Home() {
  const businesses = await getPublishedBusinesses();
  const categories = getCategories();
  const categorySummaries = await getCategorySummaries();
  const businessesToDiscover = await getBusinessesToDiscover(6);
  const homeCategoryNames = [
    "Moda y Ropa",
    "Calzado y Marroquineria",
    "Belleza y Cuidado Personal",
    "Tecnologia y Electronica",
    "Hogar y Decoracion",
    "Ferreteria y Construccion",
    "Servicios Profesionales",
    "Comida y Restaurantes",
  ];
  const homeCategories = homeCategoryNames
    .map((categoryName) =>
      categorySummaries.find((category) => category.name === categoryName),
    )
    .filter((category) => category !== undefined);

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-[#1f1715] text-white">
          <div className="absolute inset-0">
            <Image
              src="/brand/imagen-pereire-hero.png"
              alt="Plaza de Bolivar de Pereira con el Bolivar Desnudo"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(31_23_21/0.88),rgb(65_22_18/0.62)_48%,rgb(31_23_21/0.22))]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfaf7] via-[#fbfaf7]/30 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-black uppercase text-[#f5c84c] ring-1 ring-white/18 sm:text-xs">
                {SITE_SLOGAN}
              </p>
              <h1 className="mt-3 max-w-3xl text-[2.25rem] font-black leading-[1.02] sm:mt-5 sm:text-6xl">
                Encuentra donde comprar en Pereira.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/90 sm:mt-5 sm:text-xl sm:leading-8">
                Busca comercios, servicios y negocios de la ciudad. Entra a sus
                perfiles y contacta directamente.
              </p>
            </div>
            <HeroSearch categories={categories} />
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-white/90">
              <Link href="/categorias" className="underline-offset-4 hover:underline">
                {categorySummaries.length} categorias
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/comercios" className="underline-offset-4 hover:underline">
                {businesses.length} comercios publicados
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#fbfaf7] py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[#B3262E]">
                  Explora rapido
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-[#22211f]">
                  Que estas buscando?
                </h2>
              </div>
              <Link
                href="/categorias"
                className="inline-flex min-h-11 items-center text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
              >
                Ver todas las categorias
              </Link>
            </div>
            <div className="mt-7">
              <CategoryGrid categories={homeCategories} />
            </div>
          </div>
        </section>

        <section className="bg-white py-11 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[#B3262E]">
                  Por descubrir
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-[#22211f]">
                  Comercios para explorar hoy
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-stone-600">
                  Una muestra rotativa de negocios publicados. La informacion
                  completa vive en cada perfil.
                </p>
              </div>
              <Link
                href="/comercios"
                className="inline-flex min-h-11 items-center text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
              >
                Abrir directorio completo
              </Link>
            </div>
            <AutoScrollCarousel
              className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3"
            >
              {businessesToDiscover.map((business) => (
                <div key={business.id} className="w-[86%] shrink-0 snap-start sm:w-auto">
                  <BusinessCard business={business} />
                </div>
              ))}
            </AutoScrollCarousel>
          </div>
        </section>

        <BrandRail businesses={businesses} />
        <HowItWorksSection />
        <InitiativeSection />
      </main>
      <Footer />
    </>
  );
}
