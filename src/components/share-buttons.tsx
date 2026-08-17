"use client";

import { useState } from "react";

export function ShareButtons({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${text}\n${url}`,
  )}`;

  async function handleShare() {
    setCopied(false);

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // If sharing is cancelled or unavailable, copying still gives a usable fallback.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-[#176b5b] focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2"
      >
        Compartir perfil
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25d366] px-5 text-sm font-black text-stone-950 transition hover:bg-[#1fb457] focus:outline-none focus:ring-2 focus:ring-[#176b5b] focus:ring-offset-2"
      >
        Compartir por WhatsApp
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
      {copied ? (
        <span className="inline-flex min-h-11 items-center text-sm font-bold text-[#176b5b]">
          Enlace copiado
        </span>
      ) : null}
    </div>
  );
}
