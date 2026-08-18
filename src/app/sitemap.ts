import type { MetadataRoute } from "next";
import { getPublishedBusinesses } from "@/lib/businesses";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/comercios", "/categorias", "/como-funciona", "/iniciativa"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
    }),
  );
  const businesses = (await getPublishedBusinesses()).map((business) => ({
    url: `${SITE_URL}/comercios/${business.slug}`,
    lastModified: business.lastUpdated,
  }));

  return [...staticRoutes, ...businesses];
}
