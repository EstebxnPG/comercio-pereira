export const SHORT_CATEGORY_LABELS: Record<string, string> = {
  "Comida y Restaurantes": "Restaurantes",
  "Moda y Ropa": "Ropa",
  "Calzado y Marroquineria": "Calzado",
  "Belleza y Cuidado Personal": "Belleza",
  "Tecnologia y Electronica": "Tecnologia",
  "Hogar y Decoracion": "Hogar",
  "Ferreteria y Construccion": "Ferreteria",
  "Vehiculos y Repuestos": "Vehiculos",
  "Mercados y Alimentos": "Mercados",
  "Salud y Bienestar": "Salud",
  Mascotas: "Mascotas",
  "Papeleria y Educacion": "Papeleria",
  "Regalos y Variedades": "Regalos",
  "Joyeria y Accesorios": "Joyeria",
  "Hoteles y Turismo": "Hoteles",
  "Servicios Profesionales": "Servicios",
  "Publicidad e Impresion": "Publicidad",
  "Deporte y Recreacion": "Deporte",
  "Inmobiliarias y Propiedad Raiz": "Inmobiliarias",
  "Otros Comercios y Servicios": "Otros",
};

export function getShortCategoryLabel(categoryName: string) {
  return SHORT_CATEGORY_LABELS[categoryName] ?? categoryName;
}
