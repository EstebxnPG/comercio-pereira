export interface CommerceCategory {
  name: string;
  icon: string;
  description: string;
}

export const commerceCategories: CommerceCategory[] = [
  {
    name: "Comida y Restaurantes",
    icon: "🍽️",
    description:
      "Restaurantes, comidas rapidas, cafeterias, panaderias, reposterias y heladerias.",
  },
  {
    name: "Moda y Ropa",
    icon: "👕",
    description:
      "Ropa, boutiques, ropa deportiva, ropa infantil y ropa interior.",
  },
  {
    name: "Calzado y Marroquineria",
    icon: "👟",
    description: "Zapatos, tenis, bolsos, maletas y articulos de cuero.",
  },
  {
    name: "Belleza y Cuidado Personal",
    icon: "💄",
    description:
      "Peluquerias, barberias, unas, maquillaje, cosmeticos y estetica.",
  },
  {
    name: "Tecnologia y Electronica",
    icon: "💻",
    description:
      "Celulares, computadores, accesorios, reparacion y electronica.",
  },
  {
    name: "Hogar y Decoracion",
    icon: "🏠",
    description:
      "Muebles, colchones, decoracion, cortinas y articulos para el hogar.",
  },
  {
    name: "Ferreteria y Construccion",
    icon: "🔨",
    description:
      "Ferreterias, herramientas, pinturas, materiales y electricos.",
  },
  {
    name: "Vehiculos y Repuestos",
    icon: "🚗",
    description: "Repuestos, accesorios, talleres, motos y llantas.",
  },
  {
    name: "Mercados y Alimentos",
    icon: "🛒",
    description:
      "Supermercados, minimercados, fruver, carnicerias y productos alimenticios.",
  },
  {
    name: "Salud y Bienestar",
    icon: "💊",
    description:
      "Droguerias, opticas, productos medicos y centros de bienestar.",
  },
  {
    name: "Mascotas",
    icon: "🐶",
    description:
      "Veterinarias, alimentos, accesorios y peluquerias para mascotas.",
  },
  {
    name: "Papeleria y Educacion",
    icon: "📚",
    description: "Papelerias, librerias, utiles, impresion y academias.",
  },
  {
    name: "Regalos y Variedades",
    icon: "🎁",
    description:
      "Detalles, regalos, pinaterias, variedades y artesanias.",
  },
  {
    name: "Joyeria y Accesorios",
    icon: "💍",
    description: "Joyerias, relojerias, bisuteria y accesorios.",
  },
  {
    name: "Hoteles y Turismo",
    icon: "🏨",
    description: "Hoteles, hostales, agencias y servicios turisticos.",
  },
  {
    name: "Servicios Profesionales",
    icon: "🧑‍🔧",
    description:
      "Contadores, abogados, disenadores, tecnologia, consultoria y otros servicios.",
  },
  {
    name: "Publicidad e Impresion",
    icon: "🖨️",
    description:
      "Litografias, estampados, avisos, publicidad e impresion.",
  },
  {
    name: "Deporte y Recreacion",
    icon: "🏋️",
    description:
      "Gimnasios, articulos deportivos, academias y entretenimiento.",
  },
  {
    name: "Inmobiliarias y Propiedad Raiz",
    icon: "🏢",
    description: "Inmobiliarias, arrendamientos y servicios relacionados.",
  },
  {
    name: "Otros Comercios y Servicios",
    icon: "🧰",
    description: "Para lo que no encaje claramente en las anteriores.",
  },
];
