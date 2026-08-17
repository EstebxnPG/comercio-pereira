import Link from "next/link";
import { SITE_DESCRIPTOR, SITE_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-[#fbfaf7]/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-[#176b5b] text-lg font-black text-white">
            CP
          </span>
          <span className="leading-tight">
            <span className="block text-base font-black text-stone-950">
              {SITE_NAME}
            </span>
            <span className="hidden text-sm text-stone-600 sm:block">
              {SITE_DESCRIPTOR}
            </span>
          </span>
        </Link>
        <Link
          href="/#comercios"
          className="inline-flex min-h-11 items-center rounded-full bg-stone-950 px-4 text-sm font-bold text-white transition hover:bg-[#176b5b] focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2"
        >
          Ver comercios
        </Link>
      </div>
    </header>
  );
}
