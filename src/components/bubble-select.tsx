"use client";

import { useState } from "react";

export function BubbleSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="md-field flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-stone-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 z-20 mt-2 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-[var(--md-outline-variant)] bg-white p-3 shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`rounded-full px-3 py-2 text-center text-xs font-bold transition ${
                  option.value === value
                    ? "bg-brand text-white"
                    : "bg-[var(--md-surface-container)] text-stone-600 hover:bg-brand-soft hover:text-brand-deep"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
