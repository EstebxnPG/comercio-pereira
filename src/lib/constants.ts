import type { BusinessStatus } from "@/types/business";

export const SITE_NAME = "Compra en Pereira";
export const SITE_DESCRIPTOR = "Red de comercios aliados de Pereira";
export const SITE_SLOGAN = "El centro sigue latiendo.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://compra-en-pereira.local";

export const STATUS_LABELS: Record<BusinessStatus, string> = {
  open: "Abierto",
  partial_service: "Atencion parcial",
  relocated: "Nueva ubicacion",
  delivery_only: "Solo domicilios",
  temporarily_closed: "Temporalmente cerrado",
};

export const STATUS_DESCRIPTIONS: Record<BusinessStatus, string> = {
  open: "Atiende al publico",
  partial_service: "Opera con servicios limitados",
  relocated: "Atiende desde otro punto",
  delivery_only: "Recibe pedidos por canales digitales",
  temporarily_closed: "Sin atencion por ahora",
};

export const FOOTER_TEXT =
  'Compra en Pereira es una iniciativa ciudadana para dar visibilidad a los comercios aliados de Pereira. Tecnologia desarrollada por el equipo de DPG Consultora. Con el respaldo de Fabian Sanchez "El Chinito".';
