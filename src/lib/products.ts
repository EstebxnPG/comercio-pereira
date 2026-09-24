import "server-only";

import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase";

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

export {
  PRODUCT_STATUS_LABELS,
  PRODUCT_AVAILABILITY_LABELS,
  BUSINESS_PROMOTION_TYPE_LABELS,
  formatProductPrice,
  getActiveDiscountPercentage,
  getProductPriceDisplay,
  formatPromotionValue,
} from "@/lib/product-pricing";

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

/**
 * Published products with a currently-active discount (percentage set,
 * and within its start/end window when those are set). Used for the
 * home page's "Productos en promocion" section.
 */
export async function getDiscountedProducts({ limit = 12 }: { limit?: number } = {}) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const normalizedLimit = Math.max(1, Math.min(limit, 48));
  const nowIso = new Date().toISOString();

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
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .eq("businesses.published", true)
    .not("discount_percentage", "is", null)
    .or(`discount_starts_at.is.null,discount_starts_at.lte.${nowIso}`)
    .or(`discount_ends_at.is.null,discount_ends_at.gte.${nowIso}`)
    .order("updated_at", { ascending: false })
    .limit(normalizedLimit);

  if (error) {
    console.error("Discounted products query failed", error);
    return [];
  }

  return data.map((row) => mapProductRow(row as ProductRow));
}

export type ProductSort = "recent" | "price_asc" | "price_desc" | "relevance";

export async function getPublishedProductsPage({
  availability = "all",
  category = "all",
  discountedOnly = false,
  limit = 24,
  query = "",
  sort = "relevance",
  status = "all",
}: {
  availability?: string;
  category?: string;
  discountedOnly?: boolean;
  limit?: number;
  query?: string;
  sort?: ProductSort;
  status?: string;
} = {}) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { products: [], total: 0 };
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
        businesses!inner(name, slug, whatsapp, status, categories!inner(name))
      `,
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .eq("businesses.published", true)
    .range(0, normalizedLimit - 1);

  if (sort === "price_asc") {
    request = request.order("price_cents", { ascending: true, nullsFirst: false });
  } else if (sort === "price_desc") {
    request = request.order("price_cents", { ascending: false, nullsFirst: false });
  } else if (sort === "recent") {
    request = request.order("updated_at", { ascending: false });
  } else {
    request = request
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false });
  }

  if (category !== "all") {
    request = request.eq("businesses.categories.name", category);
  }

  if (status !== "all") {
    request = request.eq("businesses.status", status);
  }

  if (availability !== "all") {
    request = request.eq("availability", availability);
  }

  if (discountedOnly) {
    const nowIso = new Date().toISOString();

    request = request
      .not("discount_percentage", "is", null)
      .or(`discount_starts_at.is.null,discount_starts_at.lte.${nowIso}`)
      .or(`discount_ends_at.is.null,discount_ends_at.gte.${nowIso}`);
  }

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

  const { count, data, error } = await request;

  if (error) {
    console.error("Published products page query failed", error);
    return { products: [], total: 0 };
  }

  return {
    products: data.map((row) => mapProductRow(row as ProductRow)),
    total: count ?? 0,
  };
}

export type PublicProductSubcategory = {
  id: string;
  name: string;
  slug: string;
};

type ProductCategoryLinkRow = {
  product_categories:
    | { id: string; name: string; slug: string; sort_order: number }
    | Array<{ id: string; name: string; slug: string; sort_order: number }>
    | null;
};

export async function getProductSubcategoriesForCategory(categoryName: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("product_category_links")
    .select(
      `
        product_categories!inner(id, name, slug, sort_order),
        products!inner(
          status,
          moderation_status,
          businesses!inner(published, categories!inner(name))
        )
      `,
    )
    .eq("products.status", "published")
    .eq("products.moderation_status", "approved")
    .eq("products.businesses.published", true)
    .eq("products.businesses.categories.name", categoryName);

  if (error) {
    console.error("Product subcategories query failed", error);
    return [];
  }

  const bySortOrder = new Map<string, PublicProductSubcategory & { sortOrder: number }>();

  for (const row of data as ProductCategoryLinkRow[]) {
    const category = Array.isArray(row.product_categories)
      ? row.product_categories[0]
      : row.product_categories;

    if (category && !bySortOrder.has(category.id)) {
      bySortOrder.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sort_order,
      });
    }
  }

  return [...bySortOrder.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, slug }) => ({ id, name, slug }));
}

export async function getPublishedProductsForSubcategory({
  category,
  limit = 24,
  query = "",
  status = "all",
  subcategorySlug,
}: {
  category: string;
  limit?: number;
  query?: string;
  status?: string;
  subcategorySlug: string;
}) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return { products: [], total: 0 };
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
        businesses!inner(name, slug, whatsapp, status, categories!inner(name)),
        product_category_links!inner(product_categories!inner(slug))
      `,
      { count: "exact" },
    )
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .eq("businesses.published", true)
    .eq("businesses.categories.name", category)
    .eq("product_category_links.product_categories.slug", subcategorySlug)
    .order("updated_at", { ascending: false })
    .range(0, normalizedLimit - 1);

  if (status !== "all") {
    request = request.eq("businesses.status", status);
  }

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

  const { count, data, error } = await request;

  if (error) {
    console.error("Published products for subcategory query failed", error);
    return { products: [], total: 0 };
  }

  return {
    products: data.map((row) => mapProductRow(row as ProductRow)),
    total: count ?? 0,
  };
}

/**
 * Ranks the given products by total recorded views (analytics_daily_product),
 * using the service-role client since that rollup table isn't publicly
 * readable by design. Returns the top `limit` product ids, most-viewed first.
 */
export async function getMostViewedProductIds(productIds: string[], limit = 2) {
  if (productIds.length === 0) {
    return [];
  }

  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("analytics_daily_product")
    .select("product_id, product_views")
    .in("product_id", productIds);

  if (error) {
    console.error("Most viewed products query failed", error);
    return [];
  }

  const totalsByProductId = new Map<string, number>();

  for (const row of data) {
    totalsByProductId.set(
      row.product_id,
      (totalsByProductId.get(row.product_id) ?? 0) + row.product_views,
    );
  }

  return [...totalsByProductId.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId]) => productId);
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
