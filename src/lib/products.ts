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
export type BusinessPromotionType =
  | "coupon_amount"
  | "custom_message"
  | "free_shipping"
  | "store_percentage";
export type BusinessPromotionStatus =
  | "active"
  | "draft"
  | "expired"
  | "paused"
  | "rejected";

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
  discountEndsAt: string | null;
  discountLabel: string | null;
  discountPercentage: number | null;
  discountStartsAt: string | null;
  priceLabel: string | null;
  availability: ProductAvailability;
  primaryImageUrl: string | null;
  images: PublicProductImage[];
  featured: boolean;
  updatedAt: string;
};

export type PublicProductImage = {
  altText: string | null;
  id: string;
  isPrimary: boolean;
  publicUrl: string;
  sortOrder: number;
};

export type PublicBusinessPromotion = {
  id: string;
  businessId: string;
  description: string | null;
  endsAt: string | null;
  minimumOrderAmount: number | null;
  startsAt: string | null;
  title: string;
  type: BusinessPromotionType;
  value: number | null;
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
  discount_ends_at: string | null;
  discount_label: string | null;
  discount_percentage: number | null;
  discount_starts_at: string | null;
  price_label: string | null;
  availability: ProductAvailability;
  primary_image_url: string | null;
  product_images?: ProductImageRow[] | null;
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

type ProductImageRow = {
  alt_text: string | null;
  id: string;
  is_primary: boolean;
  public_url: string;
  sort_order: number;
};

type BusinessPromotionRow = {
  id: string;
  business_id: string;
  description: string | null;
  ends_at: string | null;
  minimum_order_amount: number | null;
  starts_at: string | null;
  title: string;
  type: BusinessPromotionType;
  value: number | null;
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

export const BUSINESS_PROMOTION_TYPE_LABELS: Record<BusinessPromotionType, string> = {
  coupon_amount: "Cupon",
  custom_message: "Promocion",
  free_shipping: "Envio gratis",
  store_percentage: "Descuento tienda",
};

export function formatProductPrice(product: {
  currency: string;
  discountEndsAt?: string | null;
  discountPercentage?: number | null;
  discountStartsAt?: string | null;
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

export function getProductPriceDisplay(product: {
  currency: string;
  discountEndsAt?: string | null;
  discountLabel?: string | null;
  discountPercentage?: number | null;
  discountStartsAt?: string | null;
  priceCents: number | null;
  priceLabel: string | null;
}) {
  const baseLabel = formatProductPrice(product);
  const activeDiscount = getActiveDiscountPercentage(product);

  if (!activeDiscount || product.priceCents === null || product.priceLabel) {
    return {
      badge: null,
      current: baseLabel,
      hasDiscount: false,
      original: null,
    };
  }

  const discountedCents = Math.round(
    product.priceCents * ((100 - activeDiscount) / 100),
  );

  return {
    badge: product.discountLabel || `${activeDiscount}% OFF`,
    current: formatCurrency(discountedCents, product.currency),
    hasDiscount: true,
    original: formatCurrency(product.priceCents, product.currency),
  };
}

export function getActiveDiscountPercentage(product: {
  discountEndsAt?: string | null;
  discountPercentage?: number | null;
  discountStartsAt?: string | null;
}) {
  const percentage = product.discountPercentage ?? null;

  if (!percentage) {
    return null;
  }

  const now = Date.now();
  const startsAt = product.discountStartsAt
    ? Date.parse(product.discountStartsAt)
    : null;
  const endsAt = product.discountEndsAt ? Date.parse(product.discountEndsAt) : null;

  if (startsAt !== null && Number.isFinite(startsAt) && startsAt > now) {
    return null;
  }

  if (endsAt !== null && Number.isFinite(endsAt) && endsAt < now) {
    return null;
  }

  return percentage;
}

export function formatPromotionValue(promotion: {
  minimumOrderAmount: number | null;
  type: BusinessPromotionType;
  value: number | null;
}) {
  if (promotion.type === "free_shipping") {
    return promotion.minimumOrderAmount
      ? `Desde ${formatCurrency(promotion.minimumOrderAmount, "COP")}`
      : "Sin minimo";
  }

  if (promotion.type === "coupon_amount" && promotion.value) {
    return `${formatCurrency(promotion.value, "COP")} OFF`;
  }

  if (promotion.type === "store_percentage" && promotion.value) {
    return `${promotion.value}% OFF`;
  }

  return "Activo";
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
        discount_ends_at,
        discount_label,
        discount_percentage,
        discount_starts_at,
        price_label,
        availability,
        primary_image_url,
        product_images(
          id,
          public_url,
          alt_text,
          sort_order,
          is_primary
        ),
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
        discount_ends_at,
        discount_label,
        discount_percentage,
        discount_starts_at,
        price_label,
        availability,
        primary_image_url,
        product_images(
          id,
          public_url,
          alt_text,
          sort_order,
          is_primary
        ),
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
        discount_ends_at,
        discount_label,
        discount_percentage,
        discount_starts_at,
        price_label,
        availability,
        primary_image_url,
        product_images(
          id,
          public_url,
          alt_text,
          sort_order,
          is_primary
        ),
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

export async function getActiveBusinessPromotions(businessId: string, limit = 6) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_promotions")
    .select(
      `
        id,
        business_id,
        type,
        title,
        description,
        value,
        minimum_order_amount,
        starts_at,
        ends_at
      `,
    )
    .eq("business_id", businessId)
    .eq("status", "active")
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .order("updated_at", { ascending: false })
    .limit(Math.max(1, Math.min(limit, 12)));

  if (error) {
    console.error("Business promotions query failed", error);
    return [];
  }

  return data.map(mapBusinessPromotionRow);
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
    discountEndsAt: row.discount_ends_at,
    discountLabel: row.discount_label,
    discountPercentage: row.discount_percentage,
    discountStartsAt: row.discount_starts_at,
    priceLabel: row.price_label,
    availability: row.availability,
    primaryImageUrl: row.primary_image_url,
    images: mapProductImages(row.product_images, row.primary_image_url),
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

function mapProductImages(
  images: ProductImageRow[] | null | undefined,
  primaryImageUrl: string | null,
) {
  const mapped = (images ?? [])
    .map((image) => ({
      altText: image.alt_text,
      id: image.id,
      isPrimary: image.is_primary,
      publicUrl: image.public_url,
      sortOrder: image.sort_order,
    }))
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      return a.sortOrder - b.sortOrder;
    });

  if (
    primaryImageUrl &&
    !mapped.some((image) => image.publicUrl === primaryImageUrl)
  ) {
    return [
      {
        altText: null,
        id: "primary-image",
        isPrimary: true,
        publicUrl: primaryImageUrl,
        sortOrder: -1,
      },
      ...mapped,
    ];
  }

  return mapped;
}

function mapBusinessPromotionRow(
  row: BusinessPromotionRow,
): PublicBusinessPromotion {
  return {
    businessId: row.business_id,
    description: row.description,
    endsAt: row.ends_at,
    id: row.id,
    minimumOrderAmount: row.minimum_order_amount,
    startsAt: row.starts_at,
    title: row.title,
    type: row.type,
    value: row.value,
  };
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("es-CO", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
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
