"use client";

import { useEffect } from "react";

type ProductEventType = "product_view" | "click_whatsapp" | "share_product";

export function ProductViewTracker({
  businessId,
  productId,
}: {
  businessId: string;
  productId: string;
}) {
  useEffect(() => {
    void trackProductEvent({ businessId, eventType: "product_view", productId });
  }, [businessId, productId]);

  return null;
}

export function TrackedProductLink({
  businessId,
  children,
  className,
  eventType,
  href,
  productId,
  rel,
  target,
}: {
  businessId: string;
  children: React.ReactNode;
  className?: string;
  eventType: ProductEventType;
  href: string;
  productId: string;
  rel?: string;
  target?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => {
        void trackProductEvent({ businessId, eventType, productId });
      }}
      rel={rel}
      target={target}
    >
      {children}
    </a>
  );
}

function getSessionId() {
  const key = "compra_pereira_anon_session";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(key, next);
  return next;
}

async function trackProductEvent({
  businessId,
  eventType,
  productId,
}: {
  businessId: string;
  eventType: ProductEventType;
  productId: string;
}) {
  try {
    await fetch("/api/product-events", {
      body: JSON.stringify({
        anonymousSessionId: getSessionId(),
        businessId,
        eventType,
        path: window.location.pathname,
        productId,
        referrer: document.referrer || null,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
  } catch {
    // Analytics should never block the public product flow.
  }
}
