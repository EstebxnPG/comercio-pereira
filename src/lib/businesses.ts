import { businesses } from "@/data/businesses";
import { commerceCategories } from "@/data/categories";
import { DEFAULT_BUSINESS_COVER_IMAGE } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase";
import { BUSINESS_STATUSES } from "@/types/business";
import type { Business } from "@/types/business";

validateBusinesses(businesses);

export async function getPublishedBusinesses() {
  const supabaseBusinesses = await getSupabasePublishedBusinesses();

  if (supabaseBusinesses) {
    return supabaseBusinesses;
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "Supabase is not available in production. Returning an empty business list.",
    );
    return [];
  }

  return getLocalPublishedBusinesses();
}

export async function getPublishedBusinessesPage({
  category = "all",
  limit = 24,
  query = "",
  status = "all",
}: {
  category?: string;
  limit?: number;
  query?: string;
  status?: Business["status"] | "all";
}) {
  const normalizedLimit = Math.max(1, Math.min(limit, 96));
  const supabaseBusinesses = await getSupabasePublishedBusinessesPage({
    category,
    limit: normalizedLimit,
    query,
    status,
  });

  if (supabaseBusinesses) {
    return supabaseBusinesses;
  }

  const filteredBusinesses = filterBusinesses(getLocalPublishedBusinesses(), {
    category,
    query,
    status,
  });

  return {
    businesses: filteredBusinesses.slice(0, normalizedLimit),
    total: filteredBusinesses.length,
  };
}

export async function getBusinessesToDiscover(limit = 9, date = new Date()) {
  const hourlyBucket = Math.floor(date.getTime() / 3_600_000);

  return [...(await getPublishedBusinesses())]
    .sort(
      (a, b) =>
        getRotationScore(a.id, hourlyBucket) -
        getRotationScore(b.id, hourlyBucket),
    )
    .slice(0, limit);
}

export async function getTrustedBusinessesToDiscover() {
  const trustedNames = [
    "fantasias new york",
    "crediconfiemos",
    "flamingo",
    "fucsia",
    "vicenza",
    "la viña",
    "el punto de la belleza",
    "katherine-mayo",
    "las gafas",
  ];
  const publishedBusinesses = await getPublishedBusinesses();
  const selectedBusinessIds = new Set<string>();

  return trustedNames
    .map((trustedName) => {
      const trustedNormalizedName = normalizeBusinessName(trustedName);
      const business = publishedBusinesses.find((candidate) => {
        const candidateNormalizedName = normalizeBusinessName(candidate.name);

        return (
          !selectedBusinessIds.has(candidate.id) &&
          (candidate.slug === trustedNormalizedName ||
            candidateNormalizedName === trustedNormalizedName ||
            candidateNormalizedName.includes(trustedNormalizedName) ||
            trustedNormalizedName.includes(candidateNormalizedName))
        );
      });

      if (business) {
        selectedBusinessIds.add(business.id);
      }

      return business;
    })
    .filter((business) => business !== undefined);
}

export async function getBusinessBySlug(slug: string) {
  const supabaseBusiness = await getSupabasePublishedBusinessBySlug(slug);

  if (supabaseBusiness) {
    return supabaseBusiness;
  }

  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return getLocalPublishedBusinesses().find((business) => business.slug === slug);
}

export function getCategories() {
  return commerceCategories.map((category) => category.name);
}

export async function getCategorySummaries() {
  const publishedBusinesses = await getPublishedBusinesses();

  return commerceCategories.map((category) => ({
    ...category,
    count: publishedBusinesses.filter(
      (business) => business.category === category.name,
    ).length,
  }));
}

function getLocalPublishedBusinesses() {
  return businesses
    .filter((business) => business.published)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

async function getSupabasePublishedBusinesses() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        name,
        short_description,
        full_description,
        logo_url,
        cover_image_url,
        status,
        phone,
        whatsapp,
        address,
        maps_url,
        schedule,
        published,
        featured,
        last_updated_at,
        categories(name),
        business_social_links(platform, url)
      `,
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase businesses query failed", error);
    return null;
  }

  return data.map(mapSupabaseBusiness);
}

async function getSupabasePublishedBusinessesPage({
  category,
  limit,
  query,
  status,
}: {
  category: string;
  limit: number;
  query: string;
  status: Business["status"] | "all";
}) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  let request = supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        name,
        short_description,
        full_description,
        logo_url,
        cover_image_url,
        status,
        phone,
        whatsapp,
        address,
        maps_url,
        schedule,
        published,
        featured,
        last_updated_at,
        categories!inner(name),
        business_social_links(platform, url)
      `,
      { count: "exact" },
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true })
    .range(0, limit - 1);

  if (category !== "all") {
    request = request.eq("categories.name", category);
  }

  if (status !== "all") {
    request = request.eq("status", status);
  }

  const search = normalizeSearchQuery(query);

  if (search) {
    const pattern = `*${search}*`;

    request = request.or(
      [
        `name.ilike.${pattern}`,
        `slug.ilike.${pattern}`,
        `short_description.ilike.${pattern}`,
        `full_description.ilike.${pattern}`,
        `address.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
        `whatsapp.ilike.${pattern}`,
      ].join(","),
    );
  }

  const { count, data, error } = await request;

  if (error) {
    console.error("Supabase businesses page query failed", error);
    return null;
  }

  return {
    businesses: data.map(mapSupabaseBusiness),
    total: count ?? 0,
  };
}

async function getSupabasePublishedBusinessBySlug(slug: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        name,
        short_description,
        full_description,
        logo_url,
        cover_image_url,
        status,
        phone,
        whatsapp,
        address,
        maps_url,
        schedule,
        published,
        featured,
        last_updated_at,
        categories(name),
        business_social_links(platform, url)
      `,
    )
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Supabase business query failed for slug "${slug}"`, error);
    return null;
  }

  return data ? mapSupabaseBusiness(data) : null;
}

type SupabaseBusinessRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string | null;
  logo_url: string;
  cover_image_url: string | null;
  status: Business["status"];
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  maps_url: string | null;
  schedule: string | null;
  published: boolean;
  featured: boolean;
  last_updated_at: string;
  categories: { name: string } | Array<{ name: string }> | null;
  business_social_links: Array<{ platform: string; url: string }>;
};

function mapSupabaseBusiness(row: SupabaseBusinessRow): Business {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;
  const instagramUrl = row.business_social_links.find(
    (link) => link.platform === "instagram",
  )?.url;
  const facebookUrl = row.business_social_links.find(
    (link) => link.platform === "facebook",
  )?.url;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.name ?? "Otros Comercios y Servicios",
    shortDescription: row.short_description,
    fullDescription: row.full_description ?? undefined,
    logo: row.logo_url,
    coverImage: normalizeCoverImage(row.cover_image_url),
    status: row.status,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    instagramUrl,
    facebookUrl,
    address: row.address ?? undefined,
    mapsUrl: row.maps_url ?? undefined,
    schedule: row.schedule ?? undefined,
    lastUpdated: row.last_updated_at,
    featured: row.featured,
    published: row.published,
  };
}

function normalizeCoverImage(value: string | null) {
  const coverImage = value?.trim();

  if (!coverImage) {
    return DEFAULT_BUSINESS_COVER_IMAGE;
  }

  if (coverImage.startsWith("/")) {
    return coverImage;
  }

  if (isHttpsUrl(coverImage)) {
    return coverImage;
  }

  console.warn(
    `Invalid business cover image "${coverImage}". Using the default cover.`,
  );

  return DEFAULT_BUSINESS_COVER_IMAGE;
}

function validateBusinesses(items: Business[]) {
  const slugs = new Set<string>();
  const validStatuses = new Set<string>(BUSINESS_STATUSES);

  for (const business of items) {
    assert(business.id.trim().length > 0, "Business id is required");
    assert(business.name.trim().length > 0, `${business.id}: name is required`);
    assert(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(business.slug),
      `${business.id}: slug must be lowercase kebab-case`,
    );
    assert(!slugs.has(business.slug), `${business.slug}: duplicate slug`);
    assert(
      validStatuses.has(business.status),
      `${business.slug}: invalid status`,
    );
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(business.lastUpdated),
      `${business.slug}: lastUpdated must use YYYY-MM-DD`,
    );
    assert(
      business.logo.startsWith("/"),
      `${business.slug}: logo must be a local public path`,
    );
    assert(
      business.coverImage.startsWith("/"),
      `${business.slug}: coverImage must be a local public path`,
    );

    if (business.whatsapp) {
      assert(
        /^\d{10,15}$/.test(business.whatsapp),
        `${business.slug}: whatsapp must contain country code and digits only`,
      );
    }

    for (const field of [
      "instagramUrl",
      "facebookUrl",
      "mapsUrl",
    ] as const) {
      const value = business[field];

      if (value) {
        assert(
          isHttpsUrl(value),
          `${business.slug}: ${field} must be a valid https URL`,
        );
      }
    }

    slugs.add(business.slug);
  }
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function getRotationScore(value: string, bucket: number) {
  let hash = 0;
  const input = `${value}:${bucket}`;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeBusinessName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function filterBusinesses(
  items: Business[],
  {
    category,
    query,
    status,
  }: {
    category: string;
    query: string;
    status: Business["status"] | "all";
  },
) {
  const search = normalizeSearchQuery(query);

  return items.filter((business) => {
    const matchesCategory = category === "all" || business.category === category;
    const matchesStatus = status === "all" || business.status === status;
    const matchesSearch =
      !search || getBusinessSearchText(business).includes(search);

    return matchesCategory && matchesStatus && matchesSearch;
  });
}

function getBusinessSearchText(business: Business) {
  return normalizeSearchQuery(
    [
      business.name,
      business.slug,
      business.category,
      business.shortDescription,
      business.fullDescription,
      business.status,
      business.phone,
      business.whatsapp,
      business.address,
      business.schedule,
      business.instagramUrl,
      business.facebookUrl,
      business.mapsUrl,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function normalizeSearchQuery(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[,%]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .slice(0, 80);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid business data: ${message}`);
  }
}
