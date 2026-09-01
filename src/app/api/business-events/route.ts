import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const EVENT_TYPES = [
  "profile_view",
  "click_whatsapp",
  "click_phone",
  "click_instagram",
  "click_facebook",
  "click_maps",
  "click_website",
  "share_profile",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

export async function POST(request: NextRequest) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isBusinessEventPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Invalid event payload" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("business_events").insert({
    business_id: body.businessId,
    event_type: body.eventType,
    utm_source: body.utmSource ?? null,
    utm_medium: body.utmMedium ?? null,
    utm_campaign: body.utmCampaign ?? null,
    referrer: body.referrer ?? null,
    path: body.path ?? null,
  });

  if (error) {
    console.error("Supabase event insert failed", error);

    return NextResponse.json(
      { ok: false, error: "Event could not be stored" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function isBusinessEventPayload(value: unknown): value is {
  businessId: string;
  eventType: EventType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  path?: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.businessId === "string" &&
    EVENT_TYPES.includes(payload.eventType as EventType) &&
    optionalString(payload.utmSource) &&
    optionalString(payload.utmMedium) &&
    optionalString(payload.utmCampaign) &&
    optionalString(payload.referrer) &&
    optionalString(payload.path)
  );
}

function optionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}
