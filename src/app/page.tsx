import { BusinessDirectory } from "@/components/business-directory";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getCategories, getPublishedBusinesses } from "@/lib/businesses";
import { SITE_SLOGAN } from "@/lib/constants";

export default function Home() {
  const businesses = getPublishedBusinesses();
  const categories = getCategories();

  return (
    <>
      <Header />
      <main>
        <section className="bg-[#fbfaf7]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-wide text-[#176b5b]">
                Compra local, mueve a Pereira
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-stone-950 sm:text-5xl">
                {SITE_SLOGAN}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
                Descubre comercios aliados de Pereira que continuan atendiendo
                desde sus establecimientos, nuevas ubicaciones o canales
                digitales.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#comercios"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f5c84c] px-5 text-sm font-black text-stone-950 transition hover:bg-[#e6b937] focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2"
                >
                  Conocer comercios
                </a>
                <span className="inline-flex min-h-11 items-center text-sm font-bold text-stone-600">
                  {businesses.length} comercios publicados
                </span>
              </div>
            </div>
            <div className="grid content-end gap-4">
              <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-[#176b5b]">
                  Aqui seguimos
                </p>
                <p className="mt-3 text-2xl font-black leading-tight text-stone-950">
                  Encuentra donde y como comprarles hoy.
                </p>
                <p className="mt-4 leading-7 text-stone-600">
                  Compra en Pereira reune comercios aliados para que puedas
                  encontrarlos, contactarlos y compartirlos facilmente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-[#176b5b] p-4 text-white">
                  <p className="text-3xl font-black">{categories.length}</p>
                  <p className="mt-1 text-sm font-semibold">Categorias</p>
                </div>
                <div className="rounded-lg bg-stone-950 p-4 text-white">
                  <p className="text-3xl font-black">24/7</p>
                  <p className="mt-1 text-sm font-semibold">
                    Perfiles compartibles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <BusinessDirectory businesses={businesses} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
