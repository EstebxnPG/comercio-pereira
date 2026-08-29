import type { BusinessStatus } from "@/types/business";

export const SITE_NAME = "Compra en Pereira";
export const SITE_DESCRIPTOR = "Red de comercios aliados de Pereira";
export const SITE_SLOGAN = "Encuentra comercios de Pereira en un solo lugar";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://compra-en-pereira.local";
export const DEFAULT_BUSINESS_COVER_IMAGE = "/brand/default-business-cover.svg";

export const STATUS_LABELS: Record<BusinessStatus, string> = {
  open: "Abierto",
  partial_service: "Atencion parcial",
  remote_attention: "Atencion remota",
  relocated: "Nueva ubicacion",
  delivery_only: "Solo domicilios",
  temporarily_closed: "Temporalmente cerrado",
};

export const STATUS_DESCRIPTIONS: Record<BusinessStatus, string> = {
  open: "Atiende al publico",
  partial_service: "Opera con servicios limitados",
  remote_attention: "Atiende por canales digitales o llamada",
  relocated: "Atiende desde otro punto",
  delivery_only: "Recibe pedidos por canales digitales",
  temporarily_closed: "Sin atencion por ahora",
};

export const FOOTER_TEXT =
  'Compra en Pereira es una iniciativa ciudadana para dar visibilidad a los comercios aliados de Pereira. Tecnologia desarrollada por el equipo de DPG Consultora, con el respaldo de Fenalco y de Fabian Sanchez "El Chinito".';

export const INCLUSION_WHATSAPP = process.env.NEXT_PUBLIC_INCLUSION_WHATSAPP ?? "";
export const INCLUSION_WHATSAPP_MESSAGE =
  "Hola, quiero sumar un comercio aliado a Compra en Pereira.";
