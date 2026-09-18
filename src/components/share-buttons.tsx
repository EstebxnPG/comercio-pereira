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
        className="md-filled-button justify-between gap-2 px-5 text-sm"
      >
        Compartir perfil
        <ShareIcon className="size-4 shrink-0" />
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-between gap-2 rounded-full bg-[#25d366] px-5 text-sm font-black text-ink shadow-sm transition hover:bg-[#1fb457] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        Compartir por WhatsApp
        <WhatsAppIcon className="size-5 shrink-0" />
      </a>
      <span className="sr-only" aria-live="polite">
        {copied ? "Enlace copiado" : ""}
      </span>
      {copied ? (
        <span className="inline-flex min-h-11 items-center text-sm font-bold text-brand">
          Enlace copiado
        </span>
      ) : null}
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
      <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.73.45 3.42 1.32 4.9L2 22l5.31-1.39a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.83 14.13c-.25.7-1.24 1.28-2.03 1.45-.55.12-1.26.21-3.67-.79-3.08-1.27-5.06-4.39-5.21-4.6-.15-.2-1.25-1.66-1.25-3.17 0-1.5.79-2.24 1.07-2.55.28-.31.61-.38.81-.38.2 0 .41 0 .59.01.19.01.44-.07.69.53.25.6.86 2.08.94 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.66-.08.18-.2.76-.89.97-1.19.2-.3.41-.25.68-.15.28.1 1.75.83 2.05.98.3.15.5.23.58.36.08.13.08.74-.17 1.44Z" />
    </svg>
  );
}
