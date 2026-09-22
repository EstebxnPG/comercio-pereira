"use client";

import { useState } from "react";

export function CopyToClipboardButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="shrink-0 rounded-full p-1 text-stone-400 transition hover:bg-[var(--md-surface-container)] hover:text-brand"
      onClick={handleClick}
      title="Copiar"
      type="button"
    >
      {copied ? (
        <svg
          aria-hidden="true"
          className="size-4 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect height="13" rx="2" width="13" x="9" y="9" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span className="sr-only">Copiar</span>
    </button>
  );
}
