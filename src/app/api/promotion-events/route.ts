import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const EVENT_TYPES = new Set(["promotion_click", "promotion_view"]);

export async function POST(request: Request) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!isEventPayload(payload)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: promotion, error: promotionError } = await supabase
    .from("business_promotions")
    .select(
      `
        business_id,
        ends_at,
        starts_at,
        status,
        businesses!inner(published)
      `,
    )
    .eq("id", payload.promotionId)
    .eq("business_id", payload.businessId)
    .maybeSingle();

  if (promotionError || !promotion || !isPublicPromotion(promotion)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const headers = request.headers;
  const ipSeed =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown";
  const userAgent = headers.get("user-agent") ?? "unknown";
  const secret = process.env.ANALYTICS_HASH_SECRET ?? "local-dev-secret";

  const { error } = await supabase.from("analytics_events").insert({
    anonymous_session_id: cleanOptional(payload.anonymousSessionId, 120),
    business_id: payload.businessId,
    event_type: payload.eventType,
    ip_hash: hashValue(`${secret}:${ipSeed}`),
    path: cleanOptional(payload.path, 260),
    promotion_id: payload.promotionId,
    referrer: cleanOptional(payload.referrer, 500),
    user_agent_hash: hashValue(`${secret}:${userAgent}`),
  });

  if (error) {
    console.error("Promotion analytics insert failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function isEventPayload(value: unknown): value is {
  anonymousSessionId?: string | null;
  businessId: string;
  eventType: string;
  path?: string | null;
  promotionId: string;
  referrer?: string | null;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.businessId === "string" &&
    isUuid(candidate.businessId) &&
    typeof candidate.promotionId === "string" &&
    isUuid(candidate.promotionId) &&
    typeof candidate.eventType === "string" &&
    EVENT_TYPES.has(candidate.eventType)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function cleanOptional(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) || null : null;
}

function isPublicPromotion(promotion: {
  businesses: { published: boolean } | { published: boolean }[] | null;
  ends_at: string | null;
  starts_at: string | null;
  status: string;
}) {
  const business = Array.isArray(promotion.businesses)
    ? promotion.businesses[0]
    : promotion.businesses;

  if (promotion.status !== "active" || !business?.published) {
    return false;
  }

  const now = Date.now();
  const startsAt = promotion.starts_at ? Date.parse(promotion.starts_at) : null;
  const endsAt = promotion.ends_at ? Date.parse(promotion.ends_at) : null;

  return (
    (startsAt === null || !Number.isFinite(startsAt) || startsAt <= now) &&
    (endsAt === null || !Number.isFinite(endsAt) || endsAt >= now)
  );
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
