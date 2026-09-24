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
