import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase";

export type ProductStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "hidden"
  | "rejected"
  | "archived";

export type ProductModerationStatus = "draft" | "pending" | "approved" | "rejected";
export type ProductAvailability =
  | "available"
  | "out_of_stock"
  | "on_request"
  | "discontinued";

export type PublicProduct = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessWhatsapp: string | null;
  slug: string;
  name: string;
  shortDescription: string;
  description: string | null;
  priceCents: number | null;
  currency: string;
  priceLabel: string | null;
  availability: ProductAvailability;
  primaryImageUrl: string | null;
  featured: boolean;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string | null;
  price_cents: number | null;
  currency: string;
  price_label: string | null;
  availability: ProductAvailability;
  primary_image_url: string | null;
  featured: boolean;
  updated_at: string;
  businesses:
    | {
        name: string;
        slug: string;
        whatsapp: string | null;
      }
    | Array<{
        name: string;
        slug: string;
        whatsapp: string | null;
      }>
    | null;
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  archived: "Archivado",
  draft: "Borrador",
  hidden: "Oculto",
  pending_review: "En revision",
  published: "Publicado",
  rejected: "Rechazado",
};

export const PRODUCT_AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  available: "Disponible",
  discontinued: "Descontinuado",
  on_request: "Bajo pedido",
  out_of_stock: "Agotado",
};

export function formatProductPrice(product: {
  currency: string;
  priceCents: number | null;
  priceLabel: string | null;
}) {
  if (product.priceLabel) {
    return product.priceLabel;
  }

  if (product.priceCents === null) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat("es-CO", {
    currency: product.currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(product.priceCents / 100);
}

export async function getPublishedProducts({
  limit = 36,
  query = "",
}: {
  limit?: number;
  query?: string;
} = {}) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const normalizedLimit = Math.max(1, Math.min(limit, 96));
  let request = supabase
    .from("products")
    .select(
      `
        id,
        business_id,
        slug,
        name,
        short_description,
        description,
        price_cents,
        currency,
        price_label,
        availability,
        primary_image_url,
        featured,
        updated_at,
        businesses!inner(name, slug, whatsapp)
      `,
    )
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .eq("businesses.published", true)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(normalizedLimit);

  const search = normalizeProductSearch(query);

  if (search) {
    const pattern = `*${search}*`;

    request = request.or(
      [
        `name.ilike.${pattern}`,
        `short_description.ilike.${pattern}`,
        `description.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { data, error } = await request;

  if (error) {
    console.error("Published products query failed", error);
    return [];
  }

  return data.map(mapProductRow);
}

export async function getPublishedProductBySlug(slug: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        business_id,
        slug,
        name,
        short_description,
        description,
        price_cents,
        currency,
        price_label,
        availability,
        primary_image_url,
        featured,
        updated_at,
        businesses!inner(name, slug, whatsapp)
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .eq("businesses.published", true)
    .maybeSingle();

  if (error) {
    console.error(`Published product query failed for slug "${slug}"`, error);
    return null;
  }

  return data ? mapProductRow(data) : null;
}

export async function getPublishedProductsForBusiness(businessId: string, limit = 12) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        business_id,
        slug,
        name,
        short_description,
        description,
        price_cents,
        currency,
        price_label,
        availability,
        primary_image_url,
        featured,
        updated_at,
        businesses!inner(name, slug, whatsapp)
      `,
    )
    .eq("business_id", businessId)
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 36)));

  if (error) {
    console.error("Business products query failed", error);
    return [];
  }

  return data.map(mapProductRow);
}

export function slugifyProduct(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function mapProductRow(row: ProductRow): PublicProduct {
  const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;

  return {
    id: row.id,
    businessId: row.business_id,
    businessName: business?.name ?? "Comercio local",
    businessSlug: business?.slug ?? "",
    businessWhatsapp: business?.whatsapp ?? null,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    priceLabel: row.price_label,
    availability: row.availability,
    primaryImageUrl: row.primary_image_url,
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

function normalizeProductSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[,%]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .slice(0, 80);
}
