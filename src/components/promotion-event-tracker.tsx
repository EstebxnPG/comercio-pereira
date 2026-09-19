"use client";

import { useEffect } from "react";

type PromotionEventType = "promotion_click" | "promotion_view";

export function PromotionViewTracker({
  businessId,
  promotionIds,
}: {
  businessId: string;
  promotionIds: string[];
}) {
  useEffect(() => {
    for (const promotionId of promotionIds) {
      void trackPromotionEvent({
        businessId,
        eventType: "promotion_view",
        promotionId,
      });
    }
  }, [businessId, promotionIds]);

  return null;
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

async function trackPromotionEvent({
  businessId,
  eventType,
  promotionId,
}: {
  businessId: string;
  eventType: PromotionEventType;
  promotionId: string;
}) {
  try {
    await fetch("/api/promotion-events", {
      body: JSON.stringify({
        anonymousSessionId: getSessionId(),
        businessId,
        eventType,
        path: window.location.pathname,
        promotionId,
        referrer: document.referrer || null,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
  } catch {
    // Analytics should never block the public promotion flow.
  }
}
