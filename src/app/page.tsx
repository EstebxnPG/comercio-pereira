import Link from "next/link";
import Image from "next/image";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { BrandRail } from "@/components/brand-rail";
import { BusinessCard } from "@/components/business-card";
import { CategoryQuickGrid } from "@/components/category-quick-grid";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSearch } from "@/components/hero-search";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { InitiativeSection } from "@/components/initiative-section";
import { SubmitCtaSection } from "@/components/submit-cta-section";
import {
  getCategories,
  getCategorySummaries,
  getPublishedBusinesses,
  getTrustedBusinessesToDiscover,
} from "@/lib/businesses";
import { SITE_SLOGAN } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Home() {
  const businesses = await getPublishedBusinesses();
  const categories = getCategories();
  const categorySummaries = await getCategorySummaries();
  const businessesToDiscover = await getTrustedBusinessesToDiscover();
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
        <section className="relative overflow-hidden bg-[#1a1210] text-white sm:hidden">
          <div className="relative aspect-[4/5] max-h-[30rem] w-full overflow-hidden">
            <Image
              src="/brand/imagen-pereire-hero.png"
              alt="Plaza de Bolivar de Pereira con el Bolivar Desnudo"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(20_14_11/0)_30%,rgb(20_14_11/0.55)_68%,rgb(107_26_22/0.92)_88%,rgb(107_26_22/0.97)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 px-[1.1rem] pb-[3.2rem]">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-gold-soft">
                <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {SITE_SLOGAN}
              </p>
              <h1 className="mt-[.6rem] font-display text-[1.9rem] font-extrabold leading-[1.05]">
                Encuentra donde comprar en Pereira.
              </h1>
              <p className="mt-[.6rem] max-w-[24rem] text-[15px] leading-7 text-white/90">
                Busca comercios, servicios y negocios de la ciudad. Entra a
                sus perfiles y contacta directamente.
              </p>
            </div>
          </div>
          <div className="relative z-10 -mt-[1.66rem] bg-paper px-[1.1rem] pb-6 text-ink">
            <HeroSearch categories={categories} />
            <div className="mt-4 flex flex-wrap items-center gap-2.5 font-mono text-xs font-bold text-stone-500">
              <Link href="/categorias" className="underline-offset-4 hover:underline">
                {categorySummaries.length} categorias
              </Link>
              <span aria-hidden="true" className="text-stone-300">/</span>
              <Link href="/comercios" className="underline-offset-4 hover:underline">
                {businesses.length} comercios publicados
              </Link>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#1a1210] text-white sm:block">
          <div className="absolute inset-0">
            <Image
              src="/brand/imagen-pereire-hero.png"
              alt="Plaza de Bolivar de Pereira con el Bolivar Desnudo"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(26_18_16/0.9),rgb(168_19_24/0.55)_55%,rgb(26_18_16/0.2))]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fffefb] via-[#fffefb]/25 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-18 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold ring-1 ring-white/18">
                <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
                {SITE_SLOGAN}
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-6xl font-extrabold leading-[1.05]">
                Encuentra donde comprar en Pereira.
              </h1>
              <p className="mt-5 max-w-2xl text-xl leading-8 text-white/90">
                Busca comercios, servicios y negocios de la ciudad. Entra a sus
                perfiles y contacta directamente.
              </p>
            </div>
            <HeroSearch categories={categories} />
            <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-sm font-bold text-white/85">
              <Link href="/categorias" className="underline-offset-4 hover:underline">
                {categorySummaries.length} categorias
              </Link>
              <span aria-hidden="true" className="text-white/40">/</span>
              <Link href="/comercios" className="underline-offset-4 hover:underline">
                {businesses.length} comercios publicados
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-paper py-9 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-brand">
                  Explora rapido
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                  Que estas buscando?
                </h2>
                <p className="mt-1 text-sm text-stone-500 sm:hidden">
                  Desliza para ver todas las categorias
                </p>
              </div>
              <Link
                href="/categorias"
                className="inline-flex min-h-11 items-center text-sm font-black text-brand underline-offset-4 hover:underline"
              >
                Ver todas las categorias
              </Link>
            </div>
            <div className="mt-6 sm:mt-7">
              <CategoryQuickGrid categories={homeCategories} />
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-brand">
                  Por descubrir
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                  Comercios para explorar hoy
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-stone-600">
                  Una seleccion de negocios reconocidos para darle confianza a
                  la red desde el primer vistazo.
                </p>
              </div>
              <Link
                href="/comercios"
                className="inline-flex min-h-11 items-center text-sm font-black text-brand underline-offset-4 hover:underline"
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
        <SubmitCtaSection />
      </main>
      <Footer />
    </>
  );
}
