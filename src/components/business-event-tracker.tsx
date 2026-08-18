"use client";

import { ReactNode, useEffect } from "react";

export type BusinessEventType =
  | "profile_view"
  | "click_whatsapp"
  | "click_phone"
  | "click_instagram"
  | "click_facebook"
  | "click_maps"
  | "click_website"
  | "share_profile";

export function BusinessProfileViewTracker({
  businessId,
}: {
  businessId: string;
}) {
  useEffect(() => {
    trackBusinessEvent(businessId, "profile_view");
  }, [businessId]);

  return null;
}

export function TrackedBusinessLink({
  businessId,
  eventType,
  href,
  className,
  children,
  target,
  rel,
}: {
  businessId: string;
  eventType: BusinessEventType;
  href: string;
  className: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={() => trackBusinessEvent(businessId, eventType)}
    >
      {children}
    </a>
  );
}

export function trackBusinessEvent(
  businessId: string,
  eventType: BusinessEventType,
) {
  const url = new URL(window.location.href);
  const payload = {
    businessId,
    eventType,
    utmSource: url.searchParams.get("utm_source") ?? undefined,
    utmMedium: url.searchParams.get("utm_medium") ?? undefined,
    utmCampaign: url.searchParams.get("utm_campaign") ?? undefined,
    referrer: document.referrer || undefined,
    path: `${url.pathname}${url.search}`,
  };
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/business-events",
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  fetch("/api/business-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking must never block navigation or contact actions.
  });
}
