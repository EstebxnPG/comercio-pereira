import { businesses } from "@/data/businesses";
import { BUSINESS_STATUSES } from "@/types/business";
import type { Business } from "@/types/business";

validateBusinesses(businesses);

export function getPublishedBusinesses() {
  return businesses
    .filter((business) => business.published)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

export function getBusinessBySlug(slug: string) {
  return getPublishedBusinesses().find((business) => business.slug === slug);
}

export function getCategories() {
  return Array.from(
    new Set(getPublishedBusinesses().map((business) => business.category)),
  ).sort((a, b) => a.localeCompare(b, "es-CO"));
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

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid business data: ${message}`);
  }
}
