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
        className="md-filled-button px-5 text-sm"
      >
        Compartir perfil
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25d366] px-5 text-sm font-black text-[#22211f] shadow-sm transition hover:bg-[#1fb457] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B3262E] focus:ring-offset-2"
      >
        Compartir por WhatsApp
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
      {copied ? (
        <span className="inline-flex min-h-11 items-center text-sm font-bold text-[#B3262E]">
          Enlace copiado
        </span>
      ) : null}
    </div>
  );
}
