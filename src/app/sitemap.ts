import type { MetadataRoute } from "next";
import { getPublishedBusinesses } from "@/lib/businesses";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const businesses = getPublishedBusinesses().map((business) => ({
    url: `${SITE_URL}/comercios/${business.slug}`,
    lastModified: business.lastUpdated,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    ...businesses,
  ];
}
