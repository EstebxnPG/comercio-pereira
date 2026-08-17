import { FOOTER_TEXT, SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-stone-600 sm:px-6 lg:px-8">
        <p className="font-bold text-stone-950">{SITE_NAME}</p>
        <p className="mt-3 max-w-3xl leading-6">{FOOTER_TEXT}</p>
      </div>
    </footer>
  );
}
