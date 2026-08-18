import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black text-[#22211f]">
          Pagina no encontrada
        </h1>
        <p className="mt-3 leading-7 text-stone-600">
          El comercio o la pagina que buscas no esta disponible publicamente.
        </p>
        <Link
          href="/"
          className="md-filled-button mt-6 px-5 text-sm"
        >
          Volver al directorio
        </Link>
      </div>
    </main>
  );
}
