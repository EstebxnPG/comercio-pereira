insert into public.categories (slug, name, icon, description, sort_order, show_on_home)
values
  ('comida-y-restaurantes', 'Comida y Restaurantes', '🍽️', 'Restaurantes, comidas rapidas, cafeterias, panaderias, reposterias y heladerias.', 8, true),
  ('moda-y-ropa', 'Moda y Ropa', '👕', 'Ropa, boutiques, ropa deportiva, ropa infantil y ropa interior.', 1, true),
  ('calzado-y-marroquineria', 'Calzado y Marroquineria', '👟', 'Zapatos, tenis, bolsos, maletas y articulos de cuero.', 2, true),
  ('belleza-y-cuidado-personal', 'Belleza y Cuidado Personal', '💄', 'Peluquerias, barberias, unas, maquillaje, cosmeticos y estetica.', 3, true),
  ('tecnologia-y-electronica', 'Tecnologia y Electronica', '💻', 'Celulares, computadores, accesorios, reparacion y electronica.', 4, true),
  ('hogar-y-decoracion', 'Hogar y Decoracion', '🏠', 'Muebles, colchones, decoracion, cortinas y articulos para el hogar.', 5, true),
  ('ferreteria-y-construccion', 'Ferreteria y Construccion', '🔨', 'Ferreterias, herramientas, pinturas, materiales y electricos.', 6, true),
  ('servicios-profesionales', 'Servicios Profesionales', '🧑‍🔧', 'Contadores, abogados, disenadores, tecnologia, consultoria y otros servicios.', 7, true),
  ('vehiculos-y-repuestos', 'Vehiculos y Repuestos', '🚗', 'Repuestos, accesorios, talleres, motos y llantas.', 9, false),
  ('mercados-y-alimentos', 'Mercados y Alimentos', '🛒', 'Supermercados, minimercados, fruver, carnicerias y productos alimenticios.', 10, false),
  ('salud-y-bienestar', 'Salud y Bienestar', '💊', 'Droguerias, opticas, productos medicos y centros de bienestar.', 11, false),
  ('mascotas', 'Mascotas', '🐶', 'Veterinarias, alimentos, accesorios y peluquerias para mascotas.', 12, false),
  ('papeleria-y-educacion', 'Papeleria y Educacion', '📚', 'Papelerias, librerias, utiles, impresion y academias.', 13, false),
  ('regalos-y-variedades', 'Regalos y Variedades', '🎁', 'Detalles, regalos, pinaterias, variedades y artesanias.', 14, false),
  ('joyeria-y-accesorios', 'Joyeria y Accesorios', '💍', 'Joyerias, relojerias, bisuteria y accesorios.', 15, false),
  ('hoteles-y-turismo', 'Hoteles y Turismo', '🏨', 'Hoteles, hostales, agencias y servicios turisticos.', 16, false),
  ('publicidad-e-impresion', 'Publicidad e Impresion', '🖨️', 'Litografias, estampados, avisos, publicidad e impresion.', 17, false),
  ('deporte-y-recreacion', 'Deporte y Recreacion', '🏋️', 'Gimnasios, articulos deportivos, academias y entretenimiento.', 18, false),
  ('inmobiliarias-y-propiedad-raiz', 'Inmobiliarias y Propiedad Raiz', '🏢', 'Inmobiliarias, arrendamientos y servicios relacionados.', 19, false),
  ('otros-comercios-y-servicios', 'Otros Comercios y Servicios', '🧰', 'Para lo que no encaje claramente en las anteriores.', 20, false)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order,
  show_on_home = excluded.show_on_home;
