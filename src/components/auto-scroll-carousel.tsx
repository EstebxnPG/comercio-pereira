"use client";

import { ReactNode, useEffect, useRef } from "react";

export function AutoScrollCarousel({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      if (isPausedRef.current || window.innerWidth >= 640) {
        return;
      }

      const firstItem = scroller.firstElementChild as HTMLElement | null;
      const step = firstItem
        ? firstItem.offsetWidth + parseFloat(getComputedStyle(scroller).columnGap || "0")
        : scroller.clientWidth * 0.86;
      const isAtEnd =
        scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - step * 0.5;

      scroller.scrollTo({
        left: isAtEnd ? 0 : scroller.scrollLeft + step,
        behavior: "smooth",
      });
    }, 8500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={className}
        onPointerDown={() => {
          isPausedRef.current = true;
        }}
        onPointerUp={() => {
          isPausedRef.current = false;
        }}
        onPointerCancel={() => {
          isPausedRef.current = false;
        }}
        onFocus={() => {
          isPausedRef.current = true;
        }}
        onBlur={() => {
          isPausedRef.current = false;
        }}
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
    </div>
  );
}
