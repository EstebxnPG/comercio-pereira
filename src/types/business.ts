export const BUSINESS_STATUSES = [
  "open",
  "partial_service",
  "relocated",
  "delivery_only",
  "temporarily_closed",
] as const;

export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription?: string;
  logo: string;
  coverImage: string;
  status: BusinessStatus;
  phone?: string;
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  address?: string;
  mapsUrl?: string;
  schedule?: string;
  lastUpdated: string;
  featured?: boolean;
  published: boolean;
}
