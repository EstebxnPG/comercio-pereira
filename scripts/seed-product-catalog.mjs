#!/usr/bin/env node
// One-off / rerunnable seed for the product subcategory taxonomy plus a
// small set of draft demo products (Comida y Restaurantes, Moda y Ropa)
// so /categorias and /productos can be previewed with real-shaped data
// before real businesses start publishing their own products.
//
// Products are inserted as status="draft" / moderation_status="draft" so
// they never appear on the public site until someone reviews and
// publishes them for real.
//
// Usage: node scripts/seed-product-catalog.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
for (const line of envText.split("\n")) {
  const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) process.env[match[1]] ??= match[2];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const SUBCATEGORIES_BY_CATEGORY = {
  "Comida y Restaurantes": ["Carnes", "Comida rapida", "Sopas y caldos", "Postres y dulces", "Bebidas y cafe", "Comida saludable"],
  "Moda y Ropa": ["Camisas y camisetas", "Pantalones y jeans", "Vestidos", "Ropa deportiva", "Ropa infantil", "Ropa interior"],
  "Calzado y Marroquineria": ["Tenis y zapatillas", "Zapatos formales", "Sandalias", "Botas", "Bolsos y carteras", "Accesorios en cuero"],
  "Belleza y Cuidado Personal": ["Maquillaje", "Cuidado facial", "Cuidado capilar", "Perfumeria", "Manicure y pedicure", "Cuidado corporal"],
  "Tecnologia y Electronica": ["Celulares y accesorios", "Computadores", "Audio y video", "Electrodomesticos", "Videojuegos", "Accesorios tecnologicos"],
  "Hogar y Decoracion": ["Muebles", "Decoracion", "Textiles para el hogar", "Iluminacion", "Cocina y menaje", "Organizacion"],
  "Ferreteria y Construccion": ["Herramientas", "Materiales de construccion", "Pinturas", "Plomeria", "Electricidad", "Cerrajeria"],
  "Vehiculos y Repuestos": ["Repuestos", "Llantas", "Accesorios para carro", "Motos y repuestos", "Lubricantes", "Servicio tecnico"],
  "Mercados y Alimentos": ["Frutas y verduras", "Carnes y embutidos", "Abarrotes", "Panaderia", "Lacteos", "Productos organicos"],
  "Salud y Bienestar": ["Medicamentos", "Suplementos", "Ortopedia", "Optica", "Cuidado del adulto mayor", "Bienestar y terapias"],
  Mascotas: ["Alimento para mascotas", "Accesorios para mascotas", "Juguetes para mascotas", "Cuidado e higiene", "Veterinaria", "Ropa para mascotas"],
  "Papeleria y Educacion": ["Utiles escolares", "Libros", "Material didactico", "Oficina", "Arte y manualidades", "Tecnologia educativa"],
  "Regalos y Variedades": ["Detalles y sorpresas", "Flores", "Decoracion para eventos", "Peluches", "Articulos personalizados", "Bisuteria economica"],
  "Joyeria y Accesorios": ["Anillos", "Collares y cadenas", "Aretes", "Relojes", "Pulseras", "Joyeria en oro y plata"],
  "Hoteles y Turismo": ["Hospedaje", "Tours y excursiones", "Alquiler de fincas", "Transporte turistico", "Agencias de viaje", "Eventos y recreacion"],
  "Servicios Profesionales": ["Contabilidad", "Abogados", "Consultoria", "Arquitectura e ingenieria", "Servicios de aseo", "Reparaciones y mantenimiento"],
  "Publicidad e Impresion": ["Impresion digital", "Diseno grafico", "Publicidad exterior", "Papeleria comercial", "Marketing digital", "Serigrafia"],
  "Deporte y Recreacion": ["Ropa deportiva y accesorios", "Implementos deportivos", "Bicicletas", "Gimnasios", "Suplementos deportivos", "Articulos para camping"],
  "Inmobiliarias y Propiedad Raiz": ["Venta de vivienda", "Arriendo de vivienda", "Locales comerciales", "Lotes y terrenos", "Administracion de propiedades", "Avaluos"],
  "Otros Comercios y Servicios": ["Variedades", "Servicios generales", "Reparaciones varias", "Otros productos", "Servicios a domicilio", "Miscelaneos"],
};

// businessSlug must be a real, published business already in that category.
// Two products per subcategory; the first is the seeded "winner" for the
// most-viewed ranking (more analytics_events rows inserted for it below).
const DEMO_PRODUCTS_BY_SUBCATEGORY = {
  Carnes: [
    { businessSlug: "chuzos-grajales", name: "Chuzo mixto de res y pollo", shortDescription: "Chuzo a la parrilla con res, pollo y papa criolla.", priceCents: 1200000 },
    { businessSlug: "chuzos-grajales", name: "Costillas BBQ ahumadas", shortDescription: "Costillas de cerdo ahumadas banadas en salsa BBQ.", priceCents: 1800000 },
  ],
  "Comida rapida": [
    { businessSlug: "broaster-del-chef-pereira-centro", name: "Combo broaster 2 presas", shortDescription: "Dos presas de pollo apanado con papas y gaseosa.", priceCents: 1500000 },
    { businessSlug: "broaster-del-chef-pereira-centro", name: "Alitas picantes x8", shortDescription: "Ocho alitas de pollo banadas en salsa picante.", priceCents: 1600000 },
  ],
  "Sopas y caldos": [
    { businessSlug: "ajiza-picantes", name: "Sancocho de gallina", shortDescription: "Sancocho tradicional con gallina criolla y verduras.", priceCents: 1400000 },
    { businessSlug: "ajiza-picantes", name: "Ajiaco santafereno", shortDescription: "Ajiaco con tres tipos de papa, pollo y mazorca.", priceCents: 1600000 },
  ],
  "Postres y dulces": [
    { businessSlug: "chachara-cafe", name: "Torta de chocolate", shortDescription: "Porcion de torta humeda de chocolate con ganache.", priceCents: 800000 },
    { businessSlug: "chachara-cafe", name: "Brownie con helado", shortDescription: "Brownie tibio acompanado de helado de vainilla.", priceCents: 900000 },
  ],
  "Bebidas y cafe": [
    { businessSlug: "be-coffee", name: "Cafe de origen Pereira", shortDescription: "Cafe filtrado de finca local, tueste medio.", priceCents: 600000 },
    { businessSlug: "be-coffee", name: "Frappe de caramelo", shortDescription: "Bebida fria de cafe con caramelo y crema batida.", priceCents: 900000 },
  ],
  "Comida saludable": [
    { businessSlug: "cafe-al-paso-banco-de-caldas", name: "Bowl de quinoa y pollo", shortDescription: "Quinoa, pollo a la plancha, aguacate y vegetales.", priceCents: 1700000 },
    { businessSlug: "cafe-al-paso-banco-de-caldas", name: "Wrap vegetariano", shortDescription: "Wrap integral con vegetales frescos y hummus.", priceCents: 1300000 },
  ],
  "Camisas y camisetas": [
    { businessSlug: "a-e-bordartex", name: "Camiseta bordada de algodon", shortDescription: "Camiseta 100% algodon con bordado personalizado.", priceCents: 3500000 },
    { businessSlug: "a-e-bordartex", name: "Camisa de lino manga larga", shortDescription: "Camisa de lino fresco, ideal para clima calido.", priceCents: 6800000 },
  ],
  "Pantalones y jeans": [
    { businessSlug: "103-jeans", name: "Jean recto azul clasico", shortDescription: "Jean recto en denim azul, tallas 28 a 40.", priceCents: 8900000 },
    { businessSlug: "103-jeans", name: "Jean skinny negro", shortDescription: "Jean skinny elastizado color negro.", priceCents: 9500000 },
  ],
  Vestidos: [
    { businessSlug: "amy-beltran", name: "Vestido casual floreado", shortDescription: "Vestido corto estampado, tela fresca.", priceCents: 7500000 },
    { businessSlug: "amy-beltran", name: "Vestido de fiesta corto", shortDescription: "Vestido elegante para ocasiones especiales.", priceCents: 12000000 },
  ],
  "Ropa deportiva": [
    { businessSlug: "4-lives", name: "Camiseta deportiva dry-fit", shortDescription: "Camiseta transpirable para entrenar.", priceCents: 4500000 },
    { businessSlug: "4-lives", name: "Conjunto deportivo mujer", shortDescription: "Top y leggins en tela compresiva.", priceCents: 9800000 },
  ],
  "Ropa infantil": [
    { businessSlug: "almacen-el-punto-de-la-moda", name: "Conjunto nino 2 piezas", shortDescription: "Camiseta y pantaloneta para nino, tallas 2 a 10.", priceCents: 5500000 },
    { businessSlug: "almacen-el-punto-de-la-moda", name: "Vestido nina estampado", shortDescription: "Vestido infantil con estampado floral.", priceCents: 4800000 },
  ],
  "Ropa interior": [
    { businessSlug: "almacen-ganemas", name: "Set ropa interior algodon", shortDescription: "Set de tres piezas en algodon suave.", priceCents: 3200000 },
    { businessSlug: "almacen-ganemas", name: "Boxer pack x3", shortDescription: "Pack de tres boxers en algodon.", priceCents: 4000000 },
  ],

  // -- Calzado y Marroquineria --
  "Tenis y zapatillas": [
    { businessSlug: "district-tennis", name: "Tenis urbanos unisex", shortDescription: "Tenis casuales comodos para uso diario.", priceCents: 15000000 },
    { businessSlug: "district-tennis", name: "Tenis running amortiguados", shortDescription: "Tenis deportivos con amortiguacion para correr.", priceCents: 18000000 },
  ],
  "Zapatos formales": [
    { businessSlug: "diego-giraldo", name: "Zapato formal cuero negro", shortDescription: "Zapato de cuero para vestir, corte clasico.", priceCents: 22000000 },
    { businessSlug: "diego-giraldo", name: "Mocasin clasico cafe", shortDescription: "Mocasin de cuero cafe, suela comoda.", priceCents: 19500000 },
  ],
  Sandalias: [
    { businessSlug: "calzado-yudy", name: "Sandalia plana verano", shortDescription: "Sandalia comoda para el dia a dia.", priceCents: 6500000 },
    { businessSlug: "calzado-yudy", name: "Sandalia tacon bajo", shortDescription: "Sandalia elegante con tacon bajo.", priceCents: 8500000 },
  ],
  Botas: [
    { businessSlug: "bezu-estilo", name: "Bota casual mujer", shortDescription: "Bota comoda para uso casual.", priceCents: 14500000 },
    { businessSlug: "bezu-estilo", name: "Botin cuero unisex", shortDescription: "Botin de cuero resistente.", priceCents: 16000000 },
  ],
  "Bolsos y carteras": [
    { businessSlug: "marroquineria-la-guaca", name: "Bolso de cuero artesanal", shortDescription: "Bolso hecho a mano en cuero genuino.", priceCents: 12000000 },
    { businessSlug: "marroquineria-la-guaca", name: "Cartera cruzada mujer", shortDescription: "Cartera pequena cruzada, varios compartimentos.", priceCents: 9500000 },
  ],
  "Accesorios en cuero": [
    { businessSlug: "calzado-springstep", name: "Cinturon de cuero genuino", shortDescription: "Cinturon resistente en cuero natural.", priceCents: 5500000 },
    { businessSlug: "calzado-springstep", name: "Billetera de cuero hombre", shortDescription: "Billetera compacta en cuero.", priceCents: 4800000 },
  ],

  // -- Belleza y Cuidado Personal --
  Maquillaje: [
    { businessSlug: "dh-variedad-y-estilo", name: "Base liquida cobertura total", shortDescription: "Base de maquillaje larga duracion.", priceCents: 4500000 },
    { businessSlug: "dh-variedad-y-estilo", name: "Paleta de sombras 12 tonos", shortDescription: "Paleta de sombras pigmentadas.", priceCents: 5800000 },
  ],
  "Cuidado facial": [
    { businessSlug: "by-angelica-gomez", name: "Limpieza facial profunda", shortDescription: "Tratamiento de limpieza facial completa.", priceCents: 6000000 },
    { businessSlug: "by-angelica-gomez", name: "Tratamiento hidratante facial", shortDescription: "Hidratacion profunda para todo tipo de piel.", priceCents: 7500000 },
  ],
  "Cuidado capilar": [
    { businessSlug: "cabellos-con-estilo-peluqueria-barberia-y-spa", name: "Corte y tratamiento capilar", shortDescription: "Corte profesional mas tratamiento nutritivo.", priceCents: 4500000 },
    { businessSlug: "cabellos-con-estilo-peluqueria-barberia-y-spa", name: "Keratina alisado", shortDescription: "Tratamiento de keratina para alisado.", priceCents: 15000000 },
  ],
  Perfumeria: [
    { businessSlug: "ariel-y-sus-fantasias", name: "Perfume mujer 100ml", shortDescription: "Fragancia femenina de larga duracion.", priceCents: 8500000 },
    { businessSlug: "ariel-y-sus-fantasias", name: "Perfume hombre 100ml", shortDescription: "Fragancia masculina fresca.", priceCents: 8500000 },
  ],
  "Manicure y pedicure": [
    { businessSlug: "capibaya", name: "Manicure semipermanente", shortDescription: "Esmaltado semipermanente para unas.", priceCents: 3500000 },
    { businessSlug: "capibaya", name: "Pedicure spa completo", shortDescription: "Pedicure con exfoliacion e hidratacion.", priceCents: 4500000 },
  ],
  "Cuidado corporal": [
    { businessSlug: "barber-s-house", name: "Exfoliacion corporal", shortDescription: "Exfoliacion completa para renovar la piel.", priceCents: 5000000 },
    { businessSlug: "barber-s-house", name: "Masaje relajante 60 min", shortDescription: "Masaje corporal relajante de una hora.", priceCents: 8000000 },
  ],

  // -- Tecnologia y Electronica --
  "Celulares y accesorios": [
    { businessSlug: "celulares-vip-local-29", name: "Funda protectora celular", shortDescription: "Funda resistente para varios modelos.", priceCents: 2500000 },
    { businessSlug: "celulares-vip-local-29", name: "Vidrio templado premium", shortDescription: "Protector de pantalla vidrio templado.", priceCents: 1500000 },
  ],
  Computadores: [
    { businessSlug: "compudemano", name: "Portatil core i5 8GB RAM", shortDescription: "Portatil para trabajo y estudio.", priceCents: 180000000 },
    { businessSlug: "compudemano", name: "Mouse inalambrico", shortDescription: "Mouse inalambrico ergonomico.", priceCents: 3500000 },
  ],
  "Audio y video": [
    { businessSlug: "bodega-electronica-pereira", name: "Parlante bluetooth portatil", shortDescription: "Parlante inalambrico resistente al agua.", priceCents: 9000000 },
    { businessSlug: "bodega-electronica-pereira", name: "Audifonos inalambricos", shortDescription: "Audifonos bluetooth con estuche de carga.", priceCents: 6500000 },
  ],
  Electrodomesticos: [
    { businessSlug: "almacen-edicat", name: "Licuadora industrial", shortDescription: "Licuadora de alta potencia.", priceCents: 18000000 },
    { businessSlug: "almacen-edicat", name: "Plancha a vapor", shortDescription: "Plancha con sistema de vapor continuo.", priceCents: 7500000 },
  ],
  Videojuegos: [
    { businessSlug: "celulab-pereira", name: "Control inalambrico PS4", shortDescription: "Control compatible con PlayStation 4.", priceCents: 9500000 },
    { businessSlug: "celulab-pereira", name: "Memoria para consola 64GB", shortDescription: "Tarjeta de memoria para consolas.", priceCents: 6000000 },
  ],
  "Accesorios tecnologicos": [
    { businessSlug: "apple-store", name: "Cargador rapido USB-C", shortDescription: "Cargador de carga rapida USB-C.", priceCents: 4000000 },
    { businessSlug: "apple-store", name: "Cable Lightning original", shortDescription: "Cable de datos y carga Lightning.", priceCents: 3500000 },
  ],

  // -- Hogar y Decoracion --
  Muebles: [
    { businessSlug: "mobel-muebles-y-decoracion", name: "Mesa de centro moderna", shortDescription: "Mesa de centro en madera y vidrio.", priceCents: 32000000 },
    { businessSlug: "mobel-muebles-y-decoracion", name: "Silla comedor tapizada", shortDescription: "Silla comoda tapizada en tela.", priceCents: 18000000 },
  ],
  Decoracion: [
    { businessSlug: "fantasias-new-york", name: "Set de cuadros decorativos", shortDescription: "Set de tres cuadros para pared.", priceCents: 8500000 },
    { businessSlug: "fantasias-new-york", name: "Espejo decorativo redondo", shortDescription: "Espejo decorativo con marco dorado.", priceCents: 12000000 },
  ],
  "Textiles para el hogar": [
    { businessSlug: "india-moda-boutique", name: "Juego de sabanas queen", shortDescription: "Juego de sabanas 100% algodon.", priceCents: 9500000 },
    { businessSlug: "india-moda-boutique", name: "Cojines decorativos x2", shortDescription: "Par de cojines decorativos para sala.", priceCents: 4500000 },
  ],
  Iluminacion: [
    { businessSlug: "juanpadecoracion", name: "Lampara de mesa moderna", shortDescription: "Lampara decorativa para mesa o buro.", priceCents: 6500000 },
    { businessSlug: "juanpadecoracion", name: "Tira LED decorativa", shortDescription: "Tira LED para decoracion de ambientes.", priceCents: 4000000 },
  ],
  "Cocina y menaje": [
    { businessSlug: "cocinas-pereira", name: "Set de ollas antiadherentes", shortDescription: "Juego de ollas antiadherentes x5.", priceCents: 25000000 },
    { businessSlug: "cocinas-pereira", name: "Vajilla 16 piezas", shortDescription: "Vajilla completa para 4 personas.", priceCents: 18000000 },
  ],
  Organizacion: [
    { businessSlug: "galeria-maderarte", name: "Organizador de madera multiusos", shortDescription: "Organizador artesanal en madera.", priceCents: 7000000 },
    { businessSlug: "galeria-maderarte", name: "Repisa flotante decorativa", shortDescription: "Repisa de pared para decoracion y orden.", priceCents: 5500000 },
  ],

  // -- Ferreteria y Construccion --
  Herramientas: [
    { businessSlug: "cacharreria-otun", name: "Taladro percutor 600W", shortDescription: "Taladro percutor para uso domestico e industrial.", priceCents: 18000000 },
    { businessSlug: "cacharreria-otun", name: "Set de destornilladores x12", shortDescription: "Juego completo de destornilladores.", priceCents: 4500000 },
  ],
  "Materiales de construccion": [
    { businessSlug: "disenos-cubiertas-del-eje", name: "Lamina de cubierta traslucida", shortDescription: "Lamina traslucida para techos.", priceCents: 6500000 },
    { businessSlug: "disenos-cubiertas-del-eje", name: "Perfil metalico galvanizado", shortDescription: "Perfil metalico para estructuras.", priceCents: 3500000 },
  ],
  Pinturas: [
    { businessSlug: "cartechos", name: "Pintura vinilo tipo 1 galon", shortDescription: "Pintura vinilo interior/exterior.", priceCents: 9500000 },
    { businessSlug: "cartechos", name: "Esmalte sintetico 1/4", shortDescription: "Esmalte sintetico para madera y metal.", priceCents: 2800000 },
  ],
  Plomeria: [
    { businessSlug: "ferreteria-don-justo-sas", name: "Llave de paso media pulgada", shortDescription: "Llave de paso para instalaciones hidraulicas.", priceCents: 2200000 },
    { businessSlug: "ferreteria-don-justo-sas", name: "Kit de tuberia PVC", shortDescription: "Kit basico de tuberia PVC.", priceCents: 4000000 },
  ],
  Electricidad: [
    { businessSlug: "fabrica-de-lamparas-e-iluminacion", name: "Bombillo LED 12W", shortDescription: "Bombillo LED de bajo consumo.", priceCents: 800000 },
    { businessSlug: "fabrica-de-lamparas-e-iluminacion", name: "Cable electrico calibre 12 x metro", shortDescription: "Cable electrico calibre 12, precio por metro.", priceCents: 250000 },
  ],
  Cerrajeria: [
    { businessSlug: "espejos-piramide", name: "Cerradura de seguridad", shortDescription: "Cerradura resistente para puertas.", priceCents: 8500000 },
    { businessSlug: "espejos-piramide", name: "Candado alta seguridad", shortDescription: "Candado reforzado antirrobo.", priceCents: 4500000 },
  ],

  // -- Vehiculos y Repuestos --
  Repuestos: [
    { businessSlug: "tu-tienda-eje", name: "Filtro de aceite universal", shortDescription: "Filtro de aceite compatible con varios modelos.", priceCents: 2500000 },
    { businessSlug: "tu-tienda-eje", name: "Pastillas de freno delanteras", shortDescription: "Juego de pastillas de freno delanteras.", priceCents: 8500000 },
  ],
  Llantas: [
    { businessSlug: "vipusados", name: "Llanta 175/65 R14", shortDescription: "Llanta para carro, medida 175/65 R14.", priceCents: 22000000 },
    { businessSlug: "vipusados", name: "Llanta moto 90/90", shortDescription: "Llanta para moto medida 90/90.", priceCents: 15000000 },
  ],
  "Accesorios para carro": [
    { businessSlug: "lukas-accesorios-pereira", name: "Forro de asiento universal", shortDescription: "Forro de asientos para varios modelos.", priceCents: 12000000 },
    { businessSlug: "lukas-accesorios-pereira", name: "Tapetes para carro x4", shortDescription: "Juego de tapetes antideslizantes.", priceCents: 6500000 },
  ],
  "Motos y repuestos": [
    { businessSlug: "cascos-shop-colombia", name: "Casco integral certificado", shortDescription: "Casco de moto con certificacion de seguridad.", priceCents: 18000000 },
    { businessSlug: "cascos-shop-colombia", name: "Guantes para motociclista", shortDescription: "Guantes resistentes para conduccion.", priceCents: 4500000 },
  ],
  Lubricantes: [
    { businessSlug: "luminexcol", name: "Aceite de motor sintetico 4L", shortDescription: "Aceite sintetico para motor, galon x4 litros.", priceCents: 9500000 },
    { businessSlug: "luminexcol", name: "Grasa multiproposito", shortDescription: "Grasa lubricante multiproposito.", priceCents: 1800000 },
  ],
  "Servicio tecnico": [
    { businessSlug: "tu-tienda-eje", name: "Cambio de aceite y filtro", shortDescription: "Servicio de cambio de aceite y filtro.", priceCents: 4500000 },
    { businessSlug: "tu-tienda-eje", name: "Revision general de frenos", shortDescription: "Revision y ajuste del sistema de frenos.", priceCents: 6000000 },
  ],

  // -- Mercados y Alimentos --
  "Frutas y verduras": [
    { businessSlug: "cultivo-salvaje", name: "Canasta de vegetales organicos", shortDescription: "Canasta surtida de vegetales organicos.", priceCents: 4000000 },
    { businessSlug: "cultivo-salvaje", name: "Frutas de temporada x kilo", shortDescription: "Frutas frescas de temporada.", priceCents: 1000000 },
  ],
  "Carnes y embutidos": [
    { businessSlug: "la-granja-de-tatha", name: "Chorizo artesanal x libra", shortDescription: "Chorizo artesanal preparado en casa.", priceCents: 1500000 },
    { businessSlug: "la-granja-de-tatha", name: "Carne molida x libra", shortDescription: "Carne molida fresca de res.", priceCents: 1400000 },
  ],
  Abarrotes: [
    { businessSlug: "la-granja-de-tatha", name: "Panela organica x libra", shortDescription: "Panela organica artesanal.", priceCents: 600000 },
    { businessSlug: "la-granja-de-tatha", name: "Arroz x libra", shortDescription: "Arroz blanco de primera calidad.", priceCents: 350000 },
  ],
  Panaderia: [
    { businessSlug: "cultivo-salvaje", name: "Pan artesanal integral", shortDescription: "Pan integral horneado artesanalmente.", priceCents: 900000 },
    { businessSlug: "cultivo-salvaje", name: "Pan de queso x6", shortDescription: "Pan de queso tradicional, paquete x6.", priceCents: 1200000 },
  ],
  Lacteos: [
    { businessSlug: "la-granja-de-tatha", name: "Queso campesino x libra", shortDescription: "Queso campesino fresco.", priceCents: 1600000 },
    { businessSlug: "la-granja-de-tatha", name: "Yogurt natural 1L", shortDescription: "Yogurt natural sin azucar anadida.", priceCents: 1200000 },
  ],
  "Productos organicos": [
    { businessSlug: "cultivo-salvaje", name: "Miel organica 500ml", shortDescription: "Miel de abejas 100% organica.", priceCents: 2500000 },
    { businessSlug: "cultivo-salvaje", name: "Huevos criollos x30", shortDescription: "Huevos criollos frescos, carton x30.", priceCents: 1800000 },
  ],

  // -- Salud y Bienestar --
  Medicamentos: [
    { businessSlug: "centro-botanico-jose-celestino-mutis-2", name: "Suplemento natural multivitaminico", shortDescription: "Suplemento multivitaminico de origen natural.", priceCents: 4500000 },
    { businessSlug: "centro-botanico-jose-celestino-mutis-2", name: "Te medicinal x20 sobres", shortDescription: "Te medicinal para bienestar general.", priceCents: 1800000 },
  ],
  Suplementos: [
    { businessSlug: "centro-botanico-jose-celestino-mutis-2", name: "Proteina vegetal 500g", shortDescription: "Proteina en polvo de origen vegetal.", priceCents: 8500000 },
    { businessSlug: "centro-botanico-jose-celestino-mutis-2", name: "Omega 3 x60 capsulas", shortDescription: "Suplemento de omega 3.", priceCents: 5500000 },
  ],
  Ortopedia: [
    { businessSlug: "copesvision", name: "Plantillas ortopedicas", shortDescription: "Plantillas de soporte para el pie.", priceCents: 4500000 },
    { businessSlug: "copesvision", name: "Faja lumbar", shortDescription: "Faja de soporte lumbar ajustable.", priceCents: 6000000 },
  ],
  Optica: [
    { businessSlug: "focalia-optica", name: "Montura de gafas formuladas", shortDescription: "Montura completa para gafas formuladas.", priceCents: 15000000 },
    { businessSlug: "focalia-optica", name: "Lentes de contacto mensuales", shortDescription: "Caja de lentes de contacto de uso mensual.", priceCents: 7000000 },
  ],
  "Cuidado del adulto mayor": [
    { businessSlug: "glamour", name: "Silla de ruedas plegable", shortDescription: "Silla de ruedas ligera y plegable.", priceCents: 35000000 },
    { businessSlug: "glamour", name: "Baston ajustable", shortDescription: "Baston con altura ajustable.", priceCents: 3500000 },
  ],
  "Bienestar y terapias": [
    { businessSlug: "dabar-psicologia", name: "Sesion de terapia psicologica", shortDescription: "Sesion individual de acompanamiento psicologico.", priceCents: 8000000 },
    { businessSlug: "dabar-psicologia", name: "Consulta de bienestar emocional", shortDescription: "Consulta enfocada en bienestar emocional.", priceCents: 7000000 },
  ],

  // -- Mascotas --
  "Alimento para mascotas": [
    { businessSlug: "alconcentrados", name: "Concentrado para perro x10kg", shortDescription: "Concentrado balanceado para perro adulto.", priceCents: 9500000 },
    { businessSlug: "alconcentrados", name: "Concentrado para gato x3kg", shortDescription: "Concentrado balanceado para gato.", priceCents: 4500000 },
  ],
  "Accesorios para mascotas": [
    { businessSlug: "patita-s-market-online", name: "Correa ajustable para perro", shortDescription: "Correa resistente y ajustable.", priceCents: 3500000 },
    { businessSlug: "patita-s-market-online", name: "Cama para mascota mediana", shortDescription: "Cama comoda para mascotas medianas.", priceCents: 6500000 },
  ],
  "Juguetes para mascotas": [
    { businessSlug: "alconcentrados", name: "Pelota interactiva para perro", shortDescription: "Pelota resistente para jugar con tu perro.", priceCents: 1800000 },
    { businessSlug: "alconcentrados", name: "Raton de juguete para gato", shortDescription: "Juguete interactivo para gatos.", priceCents: 1200000 },
  ],
  "Cuidado e higiene": [
    { businessSlug: "patita-s-market-online", name: "Shampoo para mascotas", shortDescription: "Shampoo suave para el bano de mascotas.", priceCents: 2800000 },
    { businessSlug: "patita-s-market-online", name: "Cepillo removedor de pelo", shortDescription: "Cepillo para el cuidado del pelaje.", priceCents: 2200000 },
  ],
  Veterinaria: [
    { businessSlug: "alconcentrados", name: "Consulta veterinaria general", shortDescription: "Consulta general para tu mascota.", priceCents: 6000000 },
    { businessSlug: "alconcentrados", name: "Vacuna antirrabica", shortDescription: "Aplicacion de vacuna antirrabica.", priceCents: 4500000 },
  ],
  "Ropa para mascotas": [
    { businessSlug: "patita-s-market-online", name: "Chaqueta impermeable para perro", shortDescription: "Chaqueta impermeable para dias de lluvia.", priceCents: 4000000 },
    { businessSlug: "patita-s-market-online", name: "Disfraz para mascota", shortDescription: "Disfraz divertido para tu mascota.", priceCents: 3500000 },
  ],

  // -- Papeleria y Educacion --
  "Utiles escolares": [
    { businessSlug: "distribuidor-de-papeleria-los-mayoristas", name: "Kit escolar completo", shortDescription: "Kit completo de utiles para el colegio.", priceCents: 6500000 },
    { businessSlug: "distribuidor-de-papeleria-los-mayoristas", name: "Cuaderno cuadriculado x5", shortDescription: "Paquete de cinco cuadernos cuadriculados.", priceCents: 2500000 },
  ],
  Libros: [
    { businessSlug: "ideas-magicas", name: "Libro infantil ilustrado", shortDescription: "Libro ilustrado para primeros lectores.", priceCents: 3500000 },
    { businessSlug: "ideas-magicas", name: "Novela juvenil", shortDescription: "Novela juvenil de ficcion.", priceCents: 4200000 },
  ],
  "Material didactico": [
    { businessSlug: "cempac-s-a", name: "Set de rompecabezas educativo", shortDescription: "Rompecabezas para desarrollo cognitivo.", priceCents: 2800000 },
    { businessSlug: "cempac-s-a", name: "Material didactico matematicas", shortDescription: "Set didactico para aprender matematicas.", priceCents: 3200000 },
  ],
  Oficina: [
    { businessSlug: "distribuidor-de-papeleria-los-mayoristas", name: "Resma de papel carta", shortDescription: "Resma de papel tamano carta x500 hojas.", priceCents: 1600000 },
    { businessSlug: "distribuidor-de-papeleria-los-mayoristas", name: "Organizador de escritorio", shortDescription: "Organizador para utiles de oficina.", priceCents: 3000000 },
  ],
  "Arte y manualidades": [
    { businessSlug: "ideas-magicas", name: "Set de pinturas acrilicas", shortDescription: "Set de pinturas acrilicas para manualidades.", priceCents: 3800000 },
    { businessSlug: "ideas-magicas", name: "Kit de manualidades infantil", shortDescription: "Kit completo para manualidades de ninos.", priceCents: 2500000 },
  ],
  "Tecnologia educativa": [
    { businessSlug: "cempac-s-a", name: "Calculadora cientifica", shortDescription: "Calculadora cientifica para estudiantes.", priceCents: 5500000 },
    { businessSlug: "cempac-s-a", name: "Tablero digital educativo", shortDescription: "Tablero digital para apoyo educativo.", priceCents: 18000000 },
  ],

  // -- Regalos y Variedades --
  "Detalles y sorpresas": [
    { businessSlug: "imports-party", name: "Caja sorpresa personalizada", shortDescription: "Caja sorpresa armada a la medida.", priceCents: 4500000 },
    { businessSlug: "imports-party", name: "Detalle para cumpleanos", shortDescription: "Detalle especial para celebraciones.", priceCents: 3000000 },
  ],
  Flores: [
    { businessSlug: "la-rosee-floristeria", name: "Ramo de rosas x12", shortDescription: "Ramo de doce rosas frescas.", priceCents: 6500000 },
    { businessSlug: "la-rosee-floristeria", name: "Arreglo floral mixto", shortDescription: "Arreglo floral variado para toda ocasion.", priceCents: 8500000 },
  ],
  "Decoracion para eventos": [
    { businessSlug: "imports-party", name: "Kit de globos decorativos", shortDescription: "Kit de globos para decoracion de eventos.", priceCents: 3500000 },
    { businessSlug: "imports-party", name: "Centro de mesa para eventos", shortDescription: "Centro de mesa decorativo.", priceCents: 5500000 },
  ],
  Peluches: [
    { businessSlug: "el-mundo-de-la-fantasia-mym", name: "Peluche oso grande", shortDescription: "Peluche de oso tamano grande.", priceCents: 4500000 },
    { businessSlug: "el-mundo-de-la-fantasia-mym", name: "Peluche personalizado", shortDescription: "Peluche con personalizacion especial.", priceCents: 6000000 },
  ],
  "Articulos personalizados": [
    { businessSlug: "artesanias-a-pulso", name: "Taza personalizada", shortDescription: "Taza con diseno personalizado.", priceCents: 2500000 },
    { businessSlug: "artesanias-a-pulso", name: "Llavero artesanal", shortDescription: "Llavero hecho a mano.", priceCents: 1200000 },
  ],
  "Bisuteria economica": [
    { businessSlug: "coqueteos-pereira", name: "Set de aretes bisuteria", shortDescription: "Set de aretes de bisuteria variados.", priceCents: 1500000 },
    { businessSlug: "coqueteos-pereira", name: "Collar bisuteria moderno", shortDescription: "Collar de bisuteria con diseno moderno.", priceCents: 1800000 },
  ],

  // -- Joyeria y Accesorios --
  Anillos: [
    { businessSlug: "alahas-joyeria", name: "Anillo de plata 925", shortDescription: "Anillo en plata ley 925.", priceCents: 8500000 },
    { businessSlug: "alahas-joyeria", name: "Anillo compromiso oro laminado", shortDescription: "Anillo de compromiso en oro laminado.", priceCents: 15000000 },
  ],
  "Collares y cadenas": [
    { businessSlug: "alex-rivera-joyeria", name: "Cadena de plata fina", shortDescription: "Cadena delgada en plata.", priceCents: 9500000 },
    { businessSlug: "alex-rivera-joyeria", name: "Collar con dije corazon", shortDescription: "Collar con dije en forma de corazon.", priceCents: 6500000 },
  ],
  Aretes: [
    { businessSlug: "arte-y-joyas", name: "Aretes de perla", shortDescription: "Aretes clasicos con perla.", priceCents: 4500000 },
    { businessSlug: "arte-y-joyas", name: "Aretes argolla oro laminado", shortDescription: "Aretes tipo argolla en oro laminado.", priceCents: 5500000 },
  ],
  Relojes: [
    { businessSlug: "centro-joyas", name: "Reloj analogo hombre", shortDescription: "Reloj clasico analogo para hombre.", priceCents: 12000000 },
    { businessSlug: "centro-joyas", name: "Reloj digital deportivo", shortDescription: "Reloj digital resistente para deporte.", priceCents: 8500000 },
  ],
  Pulseras: [
    { businessSlug: "azul-dorado-accesorios", name: "Pulsera de plata ajustable", shortDescription: "Pulsera en plata con cierre ajustable.", priceCents: 4000000 },
    { businessSlug: "azul-dorado-accesorios", name: "Pulsera trenzada cuero", shortDescription: "Pulsera trenzada en cuero.", priceCents: 2500000 },
  ],
  "Joyeria en oro y plata": [
    { businessSlug: "andres-salazar-joyas-con-historia", name: "Cadena en oro 18k", shortDescription: "Cadena fina en oro de 18 kilates.", priceCents: 85000000 },
    { businessSlug: "andres-salazar-joyas-con-historia", name: "Anillo en plata con piedra", shortDescription: "Anillo en plata con piedra semipreciosa.", priceCents: 18000000 },
  ],

  // -- Hoteles y Turismo --
  Hospedaje: [
    { businessSlug: "hotel-golden-suite", name: "Noche habitacion doble", shortDescription: "Una noche en habitacion doble estandar.", priceCents: 15000000 },
    { businessSlug: "hotel-golden-suite", name: "Suite ejecutiva", shortDescription: "Noche en suite ejecutiva con amenidades.", priceCents: 22000000 },
  ],
  "Tours y excursiones": [
    { businessSlug: "nomada-horizonte-tour", name: "Tour al Nevado del Ruiz", shortDescription: "Tour guiado de un dia al Nevado del Ruiz.", priceCents: 18000000 },
    { businessSlug: "nomada-horizonte-tour", name: "Caminata ecologica guiada", shortDescription: "Caminata guiada por senderos ecologicos.", priceCents: 6500000 },
  ],
  "Alquiler de fincas": [
    { businessSlug: "agencia-de-viajes-la-perla", name: "Finca campestre fin de semana", shortDescription: "Alquiler de finca para fin de semana.", priceCents: 45000000 },
    { businessSlug: "agencia-de-viajes-la-perla", name: "Cabana para 6 personas", shortDescription: "Cabana campestre con capacidad para 6.", priceCents: 28000000 },
  ],
  "Transporte turistico": [
    { businessSlug: "nomada-horizonte-tour", name: "Transporte a termales", shortDescription: "Transporte ida y vuelta a termales.", priceCents: 3500000 },
    { businessSlug: "nomada-horizonte-tour", name: "Transfer aeropuerto", shortDescription: "Servicio de transporte al aeropuerto.", priceCents: 6000000 },
  ],
  "Agencias de viaje": [
    { businessSlug: "agencia-de-viajes-la-perla", name: "Paquete turistico Eje Cafetero", shortDescription: "Paquete completo por el Eje Cafetero.", priceCents: 65000000 },
    { businessSlug: "agencia-de-viajes-la-perla", name: "Tiquete aereo nacional", shortDescription: "Tiquete aereo para vuelos nacionales.", priceCents: 28000000 },
  ],
  "Eventos y recreacion": [
    { businessSlug: "hotel-golden-suite", name: "Salon para eventos", shortDescription: "Alquiler de salon para eventos y reuniones.", priceCents: 50000000 },
    { businessSlug: "hotel-golden-suite", name: "Paquete recreativo grupal", shortDescription: "Paquete de actividades recreativas grupales.", priceCents: 12000000 },
  ],

  // -- Servicios Profesionales --
  Contabilidad: [
    { businessSlug: "crediconfiemos-pereira", name: "Asesoria contable mensual", shortDescription: "Asesoria contable para pequenas empresas.", priceCents: 15000000 },
    { businessSlug: "crediconfiemos-pereira", name: "Declaracion de renta", shortDescription: "Elaboracion de declaracion de renta.", priceCents: 12000000 },
  ],
  Abogados: [
    { businessSlug: "building-services", name: "Consulta juridica", shortDescription: "Consulta legal general.", priceCents: 8000000 },
    { businessSlug: "building-services", name: "Tramite legal basico", shortDescription: "Acompanamiento en tramite legal basico.", priceCents: 15000000 },
  ],
  Consultoria: [
    { businessSlug: "asoinges-de-colombia", name: "Consultoria empresarial", shortDescription: "Consultoria para procesos empresariales.", priceCents: 20000000 },
    { businessSlug: "asoinges-de-colombia", name: "Asesoria en procesos", shortDescription: "Asesoria enfocada en mejora de procesos.", priceCents: 18000000 },
  ],
  "Arquitectura e ingenieria": [
    { businessSlug: "ensambles-e-instalaciones-armin", name: "Diseno arquitectonico basico", shortDescription: "Diseno arquitectonico para proyectos pequenos.", priceCents: 50000000 },
    { businessSlug: "ensambles-e-instalaciones-armin", name: "Estudio de suelos", shortDescription: "Estudio tecnico de suelos para construccion.", priceCents: 35000000 },
  ],
  "Servicios de aseo": [
    { businessSlug: "la-viejoteca-de-charly", name: "Servicio de limpieza para hogar", shortDescription: "Limpieza completa para el hogar.", priceCents: 8000000 },
    { businessSlug: "la-viejoteca-de-charly", name: "Limpieza de oficinas", shortDescription: "Servicio de limpieza para oficinas.", priceCents: 15000000 },
  ],
  "Reparaciones y mantenimiento": [
    { businessSlug: "building-services", name: "Mantenimiento locativo", shortDescription: "Mantenimiento general de espacios.", priceCents: 12000000 },
    { businessSlug: "building-services", name: "Reparacion electrica", shortDescription: "Servicio de reparacion electrica basica.", priceCents: 6000000 },
  ],

  // -- Publicidad e Impresion --
  "Impresion digital": [
    { businessSlug: "copy-maxi", name: "Impresion de folletos x100", shortDescription: "Impresion de folletos publicitarios.", priceCents: 4500000 },
    { businessSlug: "copy-maxi", name: "Impresion gran formato", shortDescription: "Impresion en gran formato para publicidad.", priceCents: 8000000 },
  ],
  "Diseno grafico": [
    { businessSlug: "grupo-creativo-gallego-y-cardona", name: "Diseno de logo", shortDescription: "Diseno de logo profesional para marca.", priceCents: 15000000 },
    { businessSlug: "grupo-creativo-gallego-y-cardona", name: "Diseno de tarjetas de presentacion", shortDescription: "Diseno de tarjetas de presentacion.", priceCents: 6000000 },
  ],
  "Publicidad exterior": [
    { businessSlug: "mat-digital", name: "Valla publicitaria pequena", shortDescription: "Valla publicitaria para exteriores.", priceCents: 25000000 },
    { businessSlug: "mat-digital", name: "Pendon publicitario", shortDescription: "Pendon publicitario para eventos.", priceCents: 6500000 },
  ],
  "Papeleria comercial": [
    { businessSlug: "copy-maxi", name: "Facturas talonario x3", shortDescription: "Talonarios de facturas, paquete x3.", priceCents: 3500000 },
    { businessSlug: "copy-maxi", name: "Sobres membretados x100", shortDescription: "Sobres membretados personalizados.", priceCents: 5000000 },
  ],
  "Marketing digital": [
    { businessSlug: "grupo-empresarial-armo", name: "Gestion de redes sociales mensual", shortDescription: "Gestion mensual de redes sociales.", priceCents: 20000000 },
    { businessSlug: "grupo-empresarial-armo", name: "Campana publicitaria digital", shortDescription: "Campana publicitaria en medios digitales.", priceCents: 30000000 },
  ],
  Serigrafia: [
    { businessSlug: "grupo-creativo-gallego-y-cardona", name: "Estampado de camisetas x10", shortDescription: "Estampado serigrafico para camisetas.", priceCents: 12000000 },
    { businessSlug: "grupo-creativo-gallego-y-cardona", name: "Serigrafia en textiles", shortDescription: "Servicio de serigrafia sobre textiles.", priceCents: 9000000 },
  ],

  // -- Deporte y Recreacion --
  "Ropa deportiva y accesorios": [
    { businessSlug: "importa-jk", name: "Camiseta deportiva", shortDescription: "Camiseta deportiva transpirable.", priceCents: 4500000 },
    { businessSlug: "importa-jk", name: "Short deportivo", shortDescription: "Short comodo para entrenar.", priceCents: 3500000 },
  ],
  "Implementos deportivos": [
    { businessSlug: "templo-del-deporte", name: "Balon de futbol profesional", shortDescription: "Balon de futbol de competencia.", priceCents: 8000000 },
    { businessSlug: "templo-del-deporte", name: "Guantes de portero", shortDescription: "Guantes de portero profesionales.", priceCents: 6500000 },
  ],
  Bicicletas: [
    { businessSlug: "templo-del-deporte", name: "Bicicleta montanera", shortDescription: "Bicicleta todo terreno.", priceCents: 85000000 },
    { businessSlug: "templo-del-deporte", name: "Casco para ciclismo", shortDescription: "Casco de seguridad para ciclismo.", priceCents: 9500000 },
  ],
  Gimnasios: [
    { businessSlug: "marcas-y-trofeos", name: "Mensualidad gimnasio", shortDescription: "Membresia mensual de gimnasio.", priceCents: 8000000 },
    { businessSlug: "marcas-y-trofeos", name: "Clase personalizada", shortDescription: "Clase de entrenamiento personalizado.", priceCents: 4000000 },
  ],
  "Suplementos deportivos": [
    { businessSlug: "importa-jk", name: "Proteina whey 1kg", shortDescription: "Proteina en polvo sabor variado.", priceCents: 12000000 },
    { businessSlug: "importa-jk", name: "Creatina monohidratada", shortDescription: "Suplemento de creatina para rendimiento.", priceCents: 6500000 },
  ],
  "Articulos para camping": [
    { businessSlug: "templo-del-deporte", name: "Carpa para 4 personas", shortDescription: "Carpa resistente para camping.", priceCents: 22000000 },
    { businessSlug: "templo-del-deporte", name: "Sleeping bag", shortDescription: "Bolsa de dormir para clima frio.", priceCents: 8500000 },
  ],

  // -- Otros Comercios y Servicios --
  Variedades: [
    { businessSlug: "almacen-fabio-jimenez-r-sucs", name: "Articulo variado para el hogar", shortDescription: "Producto variado de uso domestico.", priceCents: 2500000 },
    { businessSlug: "almacen-fabio-jimenez-r-sucs", name: "Producto de variedades", shortDescription: "Articulo variado de uso general.", priceCents: 1800000 },
  ],
  "Servicios generales": [
    { businessSlug: "centro-orient-2", name: "Servicio general a domicilio", shortDescription: "Servicio general prestado a domicilio.", priceCents: 5000000 },
    { businessSlug: "centro-orient-2", name: "Mantenimiento general", shortDescription: "Servicio de mantenimiento general.", priceCents: 7000000 },
  ],
  "Reparaciones varias": [
    { businessSlug: "comercializadora-cem", name: "Reparacion de electrodomesticos", shortDescription: "Reparacion de electrodomesticos varios.", priceCents: 6000000 },
    { businessSlug: "comercializadora-cem", name: "Servicio tecnico general", shortDescription: "Servicio tecnico para reparaciones varias.", priceCents: 8000000 },
  ],
  "Otros productos": [
    { businessSlug: "corseteria-nata", name: "Faja moldeadora", shortDescription: "Faja moldeadora de uso diario.", priceCents: 6500000 },
    { businessSlug: "corseteria-nata", name: "Corse reductor", shortDescription: "Corse reductor post evento.", priceCents: 7500000 },
  ],
  "Servicios a domicilio": [
    { businessSlug: "angela-presiado-dream-day", name: "Servicio de eventos a domicilio", shortDescription: "Organizacion de eventos a domicilio.", priceCents: 15000000 },
    { businessSlug: "angela-presiado-dream-day", name: "Decoracion a domicilio", shortDescription: "Servicio de decoracion a domicilio.", priceCents: 12000000 },
  ],
  Miscelaneos: [
    { businessSlug: "centro-botanico-jose-celestino-mutis", name: "Producto misceláneo natural", shortDescription: "Producto natural de uso variado.", priceCents: 2000000 },
    { businessSlug: "centro-botanico-jose-celestino-mutis", name: "Articulo herbal variado", shortDescription: "Articulo herbal de uso general.", priceCents: 1500000 },
  ],
};

async function main() {
  console.log("1/4 Upserting product_categories (subcategories)...");
  const categoryRows = [];
  let sortOrder = 0;

  for (const [businessCategory, subcats] of Object.entries(SUBCATEGORIES_BY_CATEGORY)) {
    for (const name of subcats) {
      sortOrder += 1;
      categoryRows.push({
        slug: slugify(`${businessCategory}-${name}`),
        name,
        description: `Subcategoria de productos dentro de ${businessCategory}.`,
        sort_order: sortOrder,
        active: true,
      });
    }
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("product_categories")
    .upsert(categoryRows, { onConflict: "slug" })
    .select("id, slug, name");

  if (categoriesError) {
    throw new Error(`product_categories upsert failed: ${categoriesError.message}`);
  }

  console.log(`   OK: ${categories.length} subcategories.`);

  const categoryIdByName = new Map();
  for (const row of categories) {
    // last-write-wins is fine: names are unique per our draft list
    categoryIdByName.set(row.name, row.id);
  }

  console.log("2/4 Looking up demo businesses...");
  const businessSlugs = [
    ...new Set(
      Object.values(DEMO_PRODUCTS_BY_SUBCATEGORY).flatMap((items) =>
        items.map((item) => item.businessSlug),
      ),
    ),
  ];

  const { data: businesses, error: businessesError } = await supabase
    .from("businesses")
    .select("id, slug, name, published")
    .in("slug", businessSlugs);

  if (businessesError) {
    throw new Error(`businesses lookup failed: ${businessesError.message}`);
  }

  const businessBySlug = new Map(businesses.map((b) => [b.slug, b]));
  const missing = businessSlugs.filter((slug) => !businessBySlug.has(slug));

  if (missing.length > 0) {
    console.warn(`   WARNING: businesses not found, skipping their products: ${missing.join(", ")}`);
  }

  console.log("3/4 Inserting demo products (status=draft)...");
  let insertedCount = 0;
  const productRankByBusinessCategoryLink = []; // { productId, isWinner }

  for (const [subcategoryName, items] of Object.entries(DEMO_PRODUCTS_BY_SUBCATEGORY)) {
    const categoryId = categoryIdByName.get(subcategoryName);

    if (!categoryId) {
      console.warn(`   WARNING: no product_categories row for "${subcategoryName}", skipping.`);
      continue;
    }

    for (const [index, item] of items.entries()) {
      const business = businessBySlug.get(item.businessSlug);

      if (!business) {
        continue;
      }

      const slug = slugify(`${item.name}-${item.businessSlug}`);

      const { data: product, error: productError } = await supabase
        .from("products")
        .upsert(
          {
            business_id: business.id,
            slug,
            name: item.name,
            short_description: item.shortDescription,
            description: item.shortDescription,
            price_cents: item.priceCents,
            currency: "COP",
            status: "draft",
            moderation_status: "draft",
            availability: "available",
            primary_image_url: null,
            featured: false,
          },
          { onConflict: "slug" },
        )
        .select("id")
        .single();

      if (productError) {
        console.warn(`   WARNING: could not insert product "${item.name}": ${productError.message}`);
        continue;
      }

      insertedCount += 1;

      const { error: linkError } = await supabase
        .from("product_category_links")
        .upsert(
          { product_id: product.id, category_id: categoryId },
          { onConflict: "product_id,category_id" },
        );

      if (linkError) {
        console.warn(`   WARNING: could not link product "${item.name}" to subcategory: ${linkError.message}`);
      }

      productRankByBusinessCategoryLink.push({
        productId: product.id,
        businessId: business.id,
        isWinner: index === 0,
      });
    }
  }

  console.log(`   OK: ${insertedCount} demo products.`);

  console.log("4/4 Seeding view-count analytics (real rollup path, via analytics_events)...");
  const events = [];

  for (const { productId, businessId, isWinner } of productRankByBusinessCategoryLink) {
    const viewCount = isWinner ? 14 : 5;

    for (let i = 0; i < viewCount; i += 1) {
      events.push({
        product_id: productId,
        business_id: businessId,
        event_type: "product_view",
        anonymous_session_id: `seed-${productId}-${i}`,
        path: "/productos/demo-seed",
      });
    }
  }

  const { error: eventsError } = await supabase.from("analytics_events").insert(events);

  if (eventsError) {
    throw new Error(`analytics_events insert failed: ${eventsError.message}`);
  }

  console.log(`   OK: ${events.length} view events inserted (trigger rolls them up into analytics_daily_product).`);
  console.log("Done.");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
