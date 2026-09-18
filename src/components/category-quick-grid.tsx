"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/icons/category-icons";

export function CategoryQuickGrid({
  categories,
}: {
  categories: Array<{
    name: string;
    icon: string;
    description: string;
    count: number;
  }>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || !("IntersectionObserver" in window)) {
      return;
    }

    const cards = cardRefs.current.filter((card): card is HTMLAnchorElement => card !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = cards.indexOf(entry.target as HTMLAnchorElement);

            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        }
      },
      { root: scroller, threshold: 0.6 },
    );

    for (const card of cards) {
      observer.observe(card);
    }

    return () => observer.disconnect();
  }, [categories]);

  return (
    <div>
      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {categories.map((category, index) => (
          <Link
            key={category.name}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
            className="md-focus flex w-[12.5rem] shrink-0 snap-start flex-col gap-2 rounded-2xl border border-[var(--md-outline-variant)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md active:translate-y-0 sm:w-auto sm:p-4"
          >
            <span
              aria-hidden="true"
              className="grid size-[3.35rem] shrink-0 place-items-center rounded-xl bg-[var(--md-surface-container)] ring-1 ring-black/5"
            >
              <CategoryIcon name={category.name} className="size-7" />
            </span>
            <h3 className="font-display text-base font-bold leading-5 text-ink">
              {category.name}
            </h3>
            <p className="inline-flex w-fit items-center rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-bold text-gold-ink">
              {category.count} comercio{category.count === 1 ? "" : "s"}
            </p>
            <p className="line-clamp-3 flex-1 text-sm leading-5 text-stone-500">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
        {categories.map((category, index) => (
          <span
            key={category.name}
            aria-hidden="true"
            className={`h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-4 bg-brand" : "w-1.5 bg-[var(--md-outline-variant)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
