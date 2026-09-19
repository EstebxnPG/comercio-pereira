import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

const EVENT_TYPES = new Set([
  "click_whatsapp",
  "discounted_product_view",
  "product_view",
  "share_product",
]);

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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
        business_id,
        discount_ends_at,
        discount_percentage,
        discount_starts_at,
        moderation_status,
        status,
        businesses!inner(published)
      `,
    )
    .eq("id", payload.productId)
    .eq("business_id", payload.businessId)
    .maybeSingle();

  if (
    productError ||
    !product ||
    product.status !== "published" ||
    product.moderation_status !== "approved" ||
    !getRelatedBusiness(product.businesses)?.published ||
    (payload.eventType === "discounted_product_view" && !hasActiveDiscount(product))
  ) {
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
    product_id: payload.productId,
    referrer: cleanOptional(payload.referrer, 500),
    user_agent_hash: hashValue(`${secret}:${userAgent}`),
  });

  if (error) {
    console.error("Product analytics insert failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function isEventPayload(value: unknown): value is {
  anonymousSessionId?: string | null;
  businessId: string;
  eventType: string;
  path?: string | null;
  productId: string;
  referrer?: string | null;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.businessId === "string" &&
    isUuid(candidate.businessId) &&
    typeof candidate.productId === "string" &&
    isUuid(candidate.productId) &&
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

function getRelatedBusiness(
  businesses: { published: boolean } | { published: boolean }[] | null,
) {
  return Array.isArray(businesses) ? businesses[0] : businesses;
}

function hasActiveDiscount(product: {
  discount_ends_at: string | null;
  discount_percentage: number | null;
  discount_starts_at: string | null;
}) {
  if (!product.discount_percentage) {
    return false;
  }

  const now = Date.now();
  const startsAt = product.discount_starts_at
    ? Date.parse(product.discount_starts_at)
    : null;
  const endsAt = product.discount_ends_at
    ? Date.parse(product.discount_ends_at)
    : null;

  return (
    (startsAt === null || !Number.isFinite(startsAt) || startsAt <= now) &&
    (endsAt === null || !Number.isFinite(endsAt) || endsAt >= now)
  );
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
