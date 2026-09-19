# Compra en Pereira CMS - Arquitectura y tareas backend

## 1. Vision del producto

Compra en Pereira debe evolucionar de directorio local curado a plataforma CMS/catalogo local para empresas.

La promesa del producto:

```text
En pocos minutos una empresa local puede tener perfil, productos publicados y estadisticas basicas dentro de una vitrina digital de Pereira.
```

El directorio no desaparece. Se convierte en la capa publica de descubrimiento. El CMS es la capa privada que permite a las empresas mantener viva su informacion.

## 2. Diagnostico actual

El proyecto actual esta bien encaminado para un directorio:

- Next.js App Router.
- TypeScript.
- Supabase Database.
- Supabase Storage.
- Migraciones SQL.
- RLS activado.
- Formulario publico de postulaciones.
- Panel admin basico con Supabase Auth.
- Tracking de eventos de negocio.
- Validacion backend para formularios e imagenes.

Pero todavia no es un CMS multiempresa.

Limitaciones principales:

- Supabase Auth ya protege el admin, pero todavia no esta integrado al flujo de empresas.
- Ya existe tabla base de perfiles, pero falta integrarla al onboarding de empresas.
- Ya existe base de roles admin y miembros, pero falta completar flujos de negocio.
- No hay ownership entre usuario y comercio.
- El admin ya no usa token compartido; falta ampliar permisos y auditoria.
- No existe modelo de productos.
- No existe dashboard privado para empresas.
- Los eventos sirven para metricas basicas, pero no para analitica robusta.
- La busqueda es suficiente para directorio pequeno, no para catalogo de productos.
- La documentacion anterior describe una etapa que ya fue superada.

Conclusion tecnica: el stack sirve, pero el dominio debe redisenarse antes de montar productos.

## 3. Principios de arquitectura

### 3.1 Seguridad primero

Toda tabla expuesta en `public` debe tener RLS activado. Las politicas deben responder a ownership real, no solo a `authenticated`.

Regla:

```text
Autenticado no significa autorizado.
```

Un usuario autenticado solo puede editar un negocio si existe una relacion valida en `business_members`.

### 3.2 Ownership desde el dia uno

El CMS gira alrededor de esta pregunta:

```text
Quien puede editar que?
```

La respuesta debe vivir en base de datos, no solo en codigo de Next.js.

### 3.3 Moderacion sin bloquear el crecimiento

El sistema debe permitir que una empresa gestione contenido, pero el contenido publico debe pasar por reglas claras:

- Empresas nuevas requieren aprobacion.
- Productos nuevos pueden requerir aprobacion.
- Empresas verificadas podrian publicar directamente en una fase posterior.

### 3.4 Separar directorio, CMS y admin

El producto debe tener tres superficies:

- Publico: visitantes descubren negocios y productos.
- Empresa: usuarios gestionan su negocio y productos.
- Admin: equipo interno revisa, modera y opera la plataforma.

### 3.5 No construir e-commerce todavia

El objetivo inicial es catalogo y contacto, no carrito, pagos ni pedidos.

Fuera de alcance inicial:

- Checkout.
- Pasarela de pagos.
- Inventario avanzado.
- Facturacion.
- Pedidos.
- Chat interno.

## 4. Roles del sistema

Roles minimos:

```text
visitor
business_owner
business_member
admin
```

Roles futuros:

```text
moderator
analyst
support
```

Definiciones:

- `visitor`: usuario publico sin sesion.
- `business_owner`: administra configuracion del negocio, miembros y productos.
- `business_member`: administra productos y datos permitidos del negocio.
- `admin`: gestiona toda la plataforma.

## 5. Modelo de datos objetivo

### 5.1 Auth y perfiles

Supabase Auth maneja usuarios reales. La tabla `profiles` extiende la informacion publica/interna del usuario.

Tablas:

```text
profiles
admin_users
```

Campos sugeridos para `profiles`:

```text
id uuid primary key references auth.users(id)
full_name text
phone text
avatar_url text
created_at timestamptz
updated_at timestamptz
```

Campos sugeridos para `admin_users`:

```text
user_id uuid primary key references auth.users(id)
role text check in ('admin', 'moderator', 'support')
created_at timestamptz
```

Nota: no usar `user_metadata` para autorizacion. Si se usan claims, deben venir de `app_metadata` o de tablas verificadas.

### 5.2 Empresas y miembros

Tablas:

```text
businesses
business_members
business_social_links
business_submissions
```

`businesses` debe conservar lo actual, pero agregar campos operativos:

```text
owner_user_id uuid nullable
publication_status text
verification_status text
onboarding_status text
plan_id uuid nullable
published_at timestamptz nullable
created_by uuid nullable
updated_by uuid nullable
```

Estados sugeridos:

```text
draft
pending_review
published
hidden
rejected
suspended
```

`business_members`:

```text
id uuid primary key
business_id uuid references businesses(id)
user_id uuid references auth.users(id)
role text check in ('owner', 'manager', 'editor', 'viewer')
invited_email text nullable
status text check in ('active', 'invited', 'removed')
created_at timestamptz
updated_at timestamptz
unique (business_id, user_id)
```

Esta tabla es la columna vertebral del CMS.

### 5.3 Productos

Tablas:

```text
products
product_images
product_categories
product_category_links
product_events
```

Campos sugeridos para `products`:

```text
id uuid primary key
business_id uuid references businesses(id)
slug text
name text
short_description text
description text
price_cents integer nullable
currency text default 'COP'
price_label text nullable
status text
moderation_status text
availability text
primary_image_url text nullable
featured boolean default false
published_at timestamptz nullable
created_by uuid references auth.users(id)
updated_by uuid references auth.users(id)
created_at timestamptz
updated_at timestamptz
unique (business_id, slug)
```

Estados sugeridos:

```text
draft
pending_review
published
hidden
rejected
archived
```

Disponibilidad sugerida:

```text
available
out_of_stock
on_request
discontinued
```

Campos que NO se deben agregar todavia salvo necesidad validada:

- SKU avanzado.
- Inventario con cantidades.
- Variantes complejas.
- Impuestos.
- Ordenes.
- Pagos.

### 5.4 Imagenes

Buckets sugeridos:

```text
business-logos
business-covers
product-images
```

Reglas:

- Validar MIME y firma binaria.
- Limitar tamano.
- Guardar ruta y bucket en base de datos.
- Separar imagen principal de galeria.
- Definir politicas de storage por ownership.

### 5.5 Analytics

La tabla actual `business_events` sirve como punto de partida, pero debe evolucionar.

Modelo sugerido:

```text
analytics_events
analytics_daily_business
analytics_daily_product
```

`analytics_events`:

```text
id uuid primary key
business_id uuid nullable
product_id uuid nullable
event_type text
anonymous_session_id text nullable
ip_hash text nullable
user_agent_hash text nullable
utm_source text nullable
utm_medium text nullable
utm_campaign text nullable
referrer text nullable
path text nullable
created_at timestamptz
```

Eventos iniciales:

```text
business_profile_view
product_view
discounted_product_view
click_whatsapp
click_phone
click_maps
click_website
click_social
share_business
share_product
search_result_view
promotion_view
promotion_click
```

Para dashboard no consultar eventos crudos en cada request. Crear agregados diarios.

Metricas MVP:

- Vistas del perfil.
- Vistas de productos.
- Vistas de productos con descuento.
- Vistas y clics de promociones.
- Clics a WhatsApp.
- Clics a telefono.
- Productos mas vistos.
- Tendencia ultimos 7/30 dias.

## 6. Politicas RLS esperadas

### 6.1 Lectura publica

Visitantes pueden leer:

- Categorias activas.
- Negocios publicados.
- Productos publicados de negocios publicados.
- Links sociales de negocios publicados.

### 6.2 Empresa autenticada

Un usuario puede leer y editar negocios si:

```sql
exists (
  select 1
  from public.business_members bm
  where bm.business_id = businesses.id
    and bm.user_id = auth.uid()
    and bm.status = 'active'
)
```

Para updates se requiere `USING` y `WITH CHECK`.

### 6.3 Productos

Un usuario puede crear/editar productos solo para negocios donde tiene rol:

```text
owner
manager
editor
```

No debe poder cambiar `business_id` para mover un producto a otra empresa.

### 6.4 Admin

Los admins pueden operar todo, pero la autorizacion debe ser explicita.

Opciones:

- Tabla `admin_users`.
- Claims en `app_metadata`.

Evitar depender de `raw_user_meta_data`.

## 7. Rutas backend/API objetivo

Preferir Server Actions para formularios internos del dashboard y Route Handlers para eventos publicos o integraciones.

Rutas publicas:

```text
GET /comercios
GET /comercios/[slug]
GET /productos
GET /productos/[slug]
POST /api/business-events
POST /api/product-events
POST /api/business-submissions
```

Rutas privadas empresa:

```text
/dashboard
/dashboard/negocios
/dashboard/negocios/[businessId]
/dashboard/negocios/[businessId]/productos
/dashboard/negocios/[businessId]/productos/nuevo
/dashboard/negocios/[businessId]/productos/[productId]
/dashboard/negocios/[businessId]/promociones
/dashboard/estadisticas
```

Rutas admin:

```text
/admin
/admin/postulaciones
/admin/negocios
/admin/productos
/admin/moderacion
/admin/categorias
```

## 8. Requerimientos funcionales

### 8.1 Autenticacion

- Login con Supabase Auth.
- Logout.
- Recuperacion de acceso.
- Proteccion de rutas privadas.
- Creacion automatica o controlada de `profiles`.
- Admin sin token compartido.

### 8.2 Onboarding de empresa

- Usuario solicita crear o reclamar negocio.
- Admin revisa.
- Al aprobar, se crea relacion `business_members` con rol `owner`.
- El negocio puede quedar en `pending_review` o `published`.

### 8.3 Perfil de empresa

Empresa puede editar:

- Nombre comercial.
- Descripcion corta.
- Descripcion completa.
- Logo.
- Portada.
- Categoria principal.
- Direccion.
- Barrio/zona.
- WhatsApp.
- Telefono.
- Horarios.
- Redes sociales.
- Web.
- Metodos de pago.
- Opciones de entrega.

Campos sensibles como `published`, `featured`, `verified` o `suspended` deben quedar bajo control admin.

### 8.4 Productos

Empresa puede:

- Crear producto.
- Editar producto.
- Marcar producto con descuento porcentual.
- Subir imagen principal.
- Agregar galeria.
- Cambiar disponibilidad.
- Ocultar producto.
- Enviar producto a revision.

Admin puede:

- Aprobar producto.
- Rechazar producto.
- Ocultar producto.
- Destacar producto.
- Ver historial basico.

### 8.5 Catalogo publico

Visitantes pueden:

- Buscar productos.
- Filtrar por categoria.
- Ver productos por negocio.
- Abrir ficha de producto.
- Contactar por WhatsApp.
- Compartir producto.

### 8.6 Estadisticas

Empresa puede ver:

- Vistas del negocio.
- Vistas por producto.
- Vistas de productos con descuento.
- Vistas y clics de promociones.
- Clics a WhatsApp.
- Clics por canal.
- Productos con mejor rendimiento.
- Comparacion ultimos 7/30 dias.

### 8.7 Promociones

Empresa puede crear beneficios simples para simular dinamicas tipo marketplace sin
convertir el producto en e-commerce:

- Envio gratis.
- Cupon en pesos.
- Descuento general de tienda.
- Mensaje promocional.

Estas promociones viven en `business_promotions`, separadas de `businesses`,
porque tienen ciclo de vida propio: estado, ventana de vigencia, valor,
auditoria y metricas. En produccion esto permite pausar, medir y evolucionar
campanas sin contaminar el perfil base del comercio.

## 9. Requerimientos no funcionales

- TypeScript estricto.
- Validacion server-side en toda mutacion.
- RLS en todas las tablas publicas.
- No exponer `service_role` al cliente.
- Evitar HTML suministrado por usuarios.
- Sanitizar y normalizar URLs.
- Limitar tamano y tipo de uploads.
- Indices para queries principales.
- Auditoria minima de cambios importantes.
- Logs sin datos sensibles.
- SEO para paginas publicas.
- Build, lint y typecheck obligatorios antes de merge.

## 10. Fases de implementacion

### Fase 0 - Alinear documentacion y deuda actual

Tareas:

- Actualizar README principal.
- Mantener este documento como fuente de verdad del CMS.
- Revisar variables de entorno.
- Revisar migraciones existentes.
- Definir convenciones de nombres para estados y roles.

Criterio de salida:

- Documentacion refleja el estado real del proyecto.

### Fase 1 - Base SaaS: auth, profiles y roles

Tareas:

- Instalar/configurar helpers actuales de Supabase Auth para Next.js si hacen falta.
- Crear tabla `profiles`.
- Crear tabla `admin_users`.
- Crear tabla `business_members`.
- Crear RLS para perfiles y miembros.
- Crear helpers server-side para usuario actual.
- Proteger `/dashboard`.
- Migrar admin desde token compartido a usuario admin.

Criterio de salida:

- Un usuario puede iniciar sesion.
- Un admin real puede entrar al panel.
- Un usuario solo ve negocios donde es miembro.

### Fase 2 - Ownership de negocios

Tareas:

- Agregar campos operativos a `businesses`.
- [ ] Asociar negocios existentes a miembros.
- [x] Crear flujo de reclamar/asignar negocio.
- Crear dashboard basico de negocios.
- Mover edicion de negocio a acciones protegidas por RLS.

Criterio de salida:

- Una empresa puede editar su perfil sin acceso a otros negocios.

### Fase 3 - Productos MVP

Tareas:

- Crear `products`.
- Crear `product_images`.
- Crear categorias de producto o adaptar categorias existentes.
- Crear politicas RLS de productos.
- Crear CRUD privado de productos.
- Crear storage `product-images`.
- Crear moderacion admin de productos.
- Crear pagina publica de producto.
- Mostrar productos dentro del perfil de comercio.

Criterio de salida:

- Una empresa puede crear productos.
- Un admin puede aprobarlos.
- Productos publicados aparecen en el sitio publico.

### Fase 4 - Analytics empresarial

Tareas:

- Evolucionar eventos hacia negocio y producto.
- Agregar deduplicacion basica por sesion anonima.
- Agregar rate limit para eventos publicos.
- Crear agregados diarios.
- Crear dashboard con metricas basicas.

Criterio de salida:

- Empresa ve metricas utiles sin consultar eventos crudos en tiempo real.

### Fase 5 - Busqueda y SEO de catalogo

Tareas:

- Agregar busqueda por productos.
- Agregar indices necesarios.
- Evaluar `tsvector` y GIN.
- Crear sitemap de productos.
- Crear metadata dinamica de producto.
- Crear filtros por categoria, precio y disponibilidad.

Criterio de salida:

- El usuario puede descubrir productos, no solo comercios.

### Fase 6 - Monetizacion

Tareas:

- Crear `plans`.
- Crear `subscriptions`.
- Definir limites por plan.
- Limitar numero de productos por plan.
- Preparar destacados pagos sin romper relevancia.

Criterio de salida:

- El sistema puede diferenciar planes sin reescribir el dominio.

## 11. Backlog tecnico detallado

### Base de datos

- [x] Crear migracion `profiles`.
- [x] Crear migracion `admin_users`.
- [x] Crear migracion `business_members`.
- [x] Agregar estados operativos a `businesses`.
- [x] Crear migracion `products`.
- [x] Crear migracion `product_images`.
- [x] Crear migracion `product_categories`.
- [x] Crear migracion `analytics_events`.
- [x] Crear agregados diarios para analytics.
- [x] Agregar indices para busqueda y dashboards.
- [x] Revisar advisors de Supabase antes de merge.

### Auth y permisos

- [x] Integrar Supabase Auth en Next.js.
- [x] Crear cliente server-side con sesion.
- [x] Crear helpers `requireUser`, `requireAdmin`, `requireBusinessRole`.
- [x] Reemplazar admin token por usuarios admin.
- [x] Proteger rutas `/dashboard`.
- [x] Proteger rutas `/admin`.
- [x] Probar RLS con usuarios distintos.

### CMS empresa

- [x] Crear layout de dashboard.
- [x] Listar negocios del usuario.
- [x] Editar perfil de negocio.
- [x] Subir logo.
- [x] Subir portada.
- [x] Gestionar links sociales.
- [x] Validar URLs y telefonos.
- [x] Guardar auditoria basica.

### Productos

- [x] Crear producto.
- [x] Editar producto.
- [x] Marcar producto con descuento.
- [x] Ocultar producto.
- [x] Enviar producto a revision.
- [x] Subir imagen principal.
- [ ] Administrar galeria.
- [x] Aprobar/rechazar producto desde admin.
- [x] Publicar pagina `/productos/[slug]`.
- [x] Mostrar productos en `/comercios/[slug]`.

### Analytics

- [x] Crear eventos para producto.
- [x] Crear eventos para promociones.
- [ ] Agregar rate limit a eventos.
- [x] Crear session anonima.
- [x] Guardar `ip_hash` y `user_agent_hash` sin datos crudos.
- [x] Crear query de metricas por negocio.
- [x] Crear query de metricas por producto.
- [x] Crear agregados diarios.

### Promociones

- [x] Crear tabla `business_promotions`.
- [x] Crear RLS para lectura publica solo de promociones activas.
- [x] Permitir gestion privada a `owner` y `manager`.
- [x] Mostrar promociones en perfil publico del comercio.
- [x] Medir `promotion_view` y `promotion_click`.
- [x] Agregar metricas base en dashboard.

### Calidad

- [x] Actualizar README cuando cambie arquitectura.
- [x] Ejecutar `npm run lint`.
- [x] Ejecutar `npm run typecheck`.
- [x] Ejecutar `npm run build`.
- [x] Probar politicas RLS.
- [ ] Probar subida de imagenes.
- [x] Probar usuario A vs usuario B para evitar IDOR/BOLA.

## 12. Decisiones que quedan abiertas

- [x] Los productos usan URL global `/productos/[slug]` con slug compuesto por comercio y producto.
- Si el primer login de empresas sera por invitacion o registro publico.
- Si empresas verificadas podran publicar productos sin revision.
- Si categorias de negocio y categorias de producto seran la misma entidad.
- Si se usara busqueda Postgres full-text o proveedor externo mas adelante.
- Si los precios seran obligatorios, opcionales o texto libre para servicios.
- Si las promociones tendran reglas avanzadas por producto, categoria, horario
  o cupos. Por ahora se mantiene simple a nivel comercio.

## 13. Criterios de exito del CMS MVP

El CMS MVP esta listo cuando:

- [x] Hay login real.
- [x] Hay usuarios admin reales.
- [x] Hay ownership entre usuario y negocio.
- [x] RLS impide que una empresa lea o edite datos de otra.
- [x] Empresa puede editar su perfil.
- [x] Empresa puede crear productos.
- [x] Admin puede aprobar productos.
- [x] Productos aprobados aparecen publicamente.
- [x] Empresa ve metricas basicas.
- [x] El directorio publico sigue funcionando.
- [ ] `lint`, `typecheck` y `build` pasan.

## 14. Advertencia de arquitectura

No construir la tabla `products` antes de resolver auth, roles y ownership.

La secuencia correcta es:

```text
auth -> profiles -> business_members -> RLS -> dashboard -> products -> analytics
```

La secuencia incorrecta es:

```text
products -> formularios -> service_role -> arreglar permisos despues
```

Esa segunda ruta parece rapida, pero deja un CMS fragil y dificil de asegurar.
