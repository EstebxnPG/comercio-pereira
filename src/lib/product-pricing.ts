import type { BusinessPromotionType } from "@/lib/products";

export function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("es-CO", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

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
