# Centro Vivo — Handoff técnico del MVP

**Estado:** listo para implementación  
**Prioridad:** publicar hoy  
**Stack decidido:** Next.js + TypeScript + Tailwind CSS + VPS propia  
**Enfoque:** plataforma pública, sin cuentas ni panel administrativo en el MVP

---

## 1. Resumen del producto

Centro Vivo es una iniciativa digital neutral que da visibilidad a una selección privada de comercios aliados del centro de Pereira que continúan atendiendo después del terremoto, ya sea desde su sede habitual, una ubicación alternativa o sus canales digitales.

La plataforma no procesa ventas, pagos ni domicilios. Su función es permitir que las personas descubran, contacten y compartan los comercios.

### Identidad base

- **Nombre:** Centro Vivo
- **Descriptor:** Red de comercios aliados de Pereira
- **Eslogan:** El centro sigue latiendo
- **Personalidad:** cercana, confiable, esperanzadora y comercial; no asistencialista
- **Marca pública:** neutral
- **Reconocimiento institucional:** la consultora y Fabián Sánchez “El Chinito” aparecen discretamente en el footer

Texto sugerido para el footer:

> Centro Vivo es una iniciativa ciudadana para dar visibilidad a los comercios aliados de Pereira. Tecnología desarrollada por el equipo de [MARCA DE LA CONSULTORA]. Con el respaldo de Fabián Sánchez “El Chinito”.

No presentar todavía a la consultora como sociedad o empresa legalmente constituida.

---

## 2. Objetivo del MVP

Publicar hoy una aplicación rápida, segura, responsive y compartible que permita:

1. Ver los comercios aliados.
2. Buscar comercios por nombre.
3. Filtrar por categoría y estado de atención.
4. Abrir el perfil individual de cada comercio.
5. Contactarlo por WhatsApp o teléfono.
6. Visitar sus redes sociales.
7. Abrir Google Maps cuando el comercio tenga ubicación disponible.
8. Compartir el perfil individual mediante el menú nativo o WhatsApp.

### Métrica principal

Cantidad de veces que los perfiles son visitados y compartidos. En el MVP no es obligatorio implementar analítica personalizada; puede incorporarse analítica básica posteriormente.

---

## 3. Fuera del alcance de hoy

No implementar:

- Base de datos.
- Panel administrativo.
- Autenticación o usuarios.
- Registro público de comercios.
- Catálogos de productos.
- Comercio electrónico.
- Pagos.
- Gestión de pedidos o domicilios.
- Comentarios, calificaciones o favoritos.
- API pública.
- Geolocalización automática.
- Sistema de donaciones.
- Diseño visual complejo o animaciones pesadas.

Estas funciones no deben añadirse aunque parezcan útiles, salvo instrucción expresa del propietario.

---

## 4. Decisión de datos y seguridad

Para el MVP, los comercios se administran mediante un archivo TypeScript tipado y versionado en Git. Esta es una decisión intencional, no un prototipo accidental.

Razones:

- Solo el propietario cargará comercios conocidos.
- Evita construir autenticación y panel hoy.
- Reduce la superficie de ataque.
- No expone base de datos ni endpoints de escritura.
- Permite validar cambios mediante TypeScript y despliegue.

Ruta sugerida:

```text
src/data/businesses.ts
```

La migración a PostgreSQL se evaluará cuando existan más de 30–50 comercios, varias personas editando o cambios frecuentes de información.

---

## 5. Modelo de datos

```ts
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
  lastUpdated: string; // ISO: YYYY-MM-DD
  featured?: boolean;
  published: boolean;
}
```

### Etiquetas públicas para estados

| Valor interno | Etiqueta visible |
|---|---|
| `open` | Abierto |
| `partial_service` | Atención parcial |
| `relocated` | Nueva ubicación |
| `delivery_only` | Solo domicilios |
| `temporarily_closed` | Temporalmente cerrado |

### Reglas de datos

- `slug` debe ser único, minúsculo y estable.
- Solo mostrar registros con `published: true`.
- No renderizar secciones vacías para campos opcionales.
- `mapsUrl` solo aparece cuando haya una ubicación confirmada.
- WhatsApp debe guardarse con indicativo de país, solo números. Ejemplo: `573001234567`.
- Todos los datos y medios deben contar con autorización del comercio.
- No afirmar que un inmueble es estructuralmente seguro.

---

## 6. Datos de ejemplo

```ts
export const businesses: Business[] = [
  {
    id: "business-001",
    slug: "comercio-ejemplo",
    name: "Comercio Ejemplo",
    category: "Moda",
    shortDescription: "Comercio pereirano que continúa atendiendo a sus clientes.",
    fullDescription:
      "Conoce nuestros canales actuales de atención y comunícate directamente con nosotros.",
    logo: "/businesses/comercio-ejemplo/logo.webp",
    coverImage: "/businesses/comercio-ejemplo/cover.webp",
    status: "relocated",
    phone: "+57 300 123 4567",
    whatsapp: "573001234567",
    instagramUrl: "https://instagram.com/comercioejemplo",
    address: "Dirección temporal confirmada, Pereira",
    mapsUrl: "https://maps.google.com/?q=Pereira",
    schedule: "Lunes a sábado, 9:00 a. m. – 6:00 p. m.",
    lastUpdated: "2026-08-17",
    featured: true,
    published: true,
  },
];
```

---

## 7. Arquitectura y rutas

Usar Next.js con App Router, TypeScript estricto y Tailwind CSS.

```text
src/
├── app/
│   ├── comercios/
│   │   └── [slug]/
│   │       ├── not-found.tsx
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── business-card.tsx
│   ├── business-directory.tsx
│   ├── business-status.tsx
│   ├── footer.tsx
│   ├── header.tsx
│   ├── share-buttons.tsx
│   └── social-links.tsx
├── data/
│   └── businesses.ts
├── lib/
│   ├── businesses.ts
│   ├── constants.ts
│   └── utils.ts
└── types/
    └── business.ts

public/
├── brand/
│   ├── centro-vivo-logo.svg
│   └── default-og.webp
└── businesses/
    └── [slug]/
        ├── logo.webp
        └── cover.webp
```

### Rutas públicas

| Ruta | Propósito |
|---|---|
| `/` | Inicio, explicación y directorio de comercios |
| `/comercios/[slug]` | Perfil compartible de un comercio |

No crear más páginas si el contenido puede resolverse dentro del inicio o el footer.

---

## 8. Requerimientos de interfaz

### Página de inicio

Debe incluir, en este orden:

1. Header compacto con marca Centro Vivo.
2. Hero con “El centro sigue latiendo”.
3. Texto corto que explique la iniciativa.
4. Directorio de comercios.
5. Buscador por nombre, descripción o categoría.
6. Filtro por categoría.
7. Filtro por estado.
8. Estado vacío cuando no existan coincidencias.
9. Footer institucional.

### Tarjeta de comercio

Debe mostrar:

- Imagen de portada.
- Logo.
- Nombre.
- Categoría.
- Descripción corta.
- Estado visible.
- Dirección resumida, solo si existe.
- Enlace claro: “Conocer comercio”.

Toda la tarjeta debe poder abrir el perfil, sin anidar elementos interactivos incorrectamente.

### Perfil individual

Debe mostrar:

- Portada y logo.
- Nombre y categoría.
- Estado actual.
- Descripción.
- Dirección, si existe.
- Horario, si existe.
- Fecha de última actualización.
- WhatsApp, teléfono y redes disponibles.
- Google Maps únicamente si existe `mapsUrl`.
- Acción de compartir.
- Enlace para volver al directorio.
- Aviso informativo.

Aviso sugerido:

> La información de contacto y atención fue suministrada por el establecimiento. Las compras, pagos, entregas y garantías se acuerdan directamente con cada comercio.

### Responsive y accesibilidad

- Diseñar primero para móviles.
- Debe funcionar desde 320 px de ancho.
- Objetivos táctiles de al menos 44 × 44 px.
- Contraste legible.
- Navegación por teclado.
- Foco visible.
- Texto alternativo útil en imágenes.
- No depender solo del color para mostrar estados.
- Respetar `prefers-reduced-motion`.

---

## 9. Compartir y metadatos

Esta es una función central del producto.

Cada perfil debe generar metadatos propios mediante `generateMetadata`:

- `title`: `[Nombre] | Centro Vivo`
- `description`: descripción corta y estado actual
- URL canónica
- imagen Open Graph usando la portada del comercio
- Twitter card de imagen grande

Variables requeridas:

```env
NEXT_PUBLIC_SITE_URL=https://DOMINIO_FINAL
```

El componente de compartir debe ser cliente y seguir este orden:

1. Intentar `navigator.share`.
2. Si no está disponible, copiar la URL al portapapeles.
3. Mostrar confirmación accesible: “Enlace copiado”.
4. Incluir botón explícito para compartir por WhatsApp.

Mensaje sugerido:

```text
El centro sigue latiendo 💛

Conoce a [NOMBRE], comercio aliado de Centro Vivo:
[URL]
```

El sitio debe funcionar aunque JavaScript falle parcialmente: la navegación y los enlaces externos deben seguir disponibles.

---

## 10. Contenido inicial

### Hero

**Título:** El centro sigue latiendo.

**Texto:** Descubre comercios aliados de Pereira que continúan atendiendo desde sus establecimientos, nuevas ubicaciones o canales digitales.

**CTA:** Conocer comercios

### Explicación breve

> Centro Vivo reúne comercios aliados para que puedas encontrarlos, contactarlos y compartirlos fácilmente. Cuando apoyas al comercio local, Pereira avanza.

### Mensajes permitidos

- Aquí seguimos.
- Compra local, mueve a Pereira.
- Nuestros comerciantes continúan atendiendo.
- Encuentra dónde y cómo comprarles hoy.
- Cuando apoyas al centro, Pereira avanza.

### Mensajes que deben evitarse

- Lenguaje que presente a los comerciantes como víctimas.
- Imágenes sensacionalistas del terremoto.
- Afirmaciones de seguridad estructural.
- Mensajes partidistas en el contenido principal.
- Promesas de ayuda económica o institucional no confirmadas.

---

## 11. Seguridad mínima del MVP

### Aplicación

- No incluir secretos en variables `NEXT_PUBLIC_*`.
- No exponer endpoints de escritura.
- Validar que URLs externas usen `https:`.
- Usar `rel="noopener noreferrer"` en enlaces externos que abran nueva pestaña.
- No insertar HTML suministrado por comercios.
- Tratar descripciones como texto plano.
- Generar solo rutas de comercios publicados.
- Devolver 404 para slugs desconocidos o no publicados.
- No instalar dependencias sin necesidad.
- Ejecutar lint, revisión de tipos y build antes de desplegar.

### VPS

- Aplicación ejecutándose como usuario sin privilegios.
- Exponer públicamente únicamente 80 y 443.
- No exponer directamente el puerto interno de Next.js.
- Nginx como reverse proxy.
- HTTPS obligatorio.
- Firewall activo.
- SSH protegido y actualizado.
- No guardar llaves privadas ni credenciales dentro del repositorio.
- Configurar reinicio de la aplicación mediante Docker o un process manager existente.

No modificar firewall, SSH ni servicios existentes sin inspeccionar primero la VPS y confirmar que el cambio no bloqueará el acceso.

---

## 12. Requisitos de SEO técnico

- Metadata global de Centro Vivo.
- Metadata individual por comercio.
- URL canónica.
- `sitemap.ts` con inicio y comercios publicados.
- `robots.ts` permitiendo páginas públicas.
- HTML semántico.
- Un solo `h1` por página.
- Slugs estables.
- Imágenes optimizadas.
- No bloquear el lanzamiento por SEO avanzado.

---

## 13. Criterios de aceptación

El MVP está terminado cuando:

- [ ] La aplicación compila y el build de producción termina sin errores.
- [ ] La página de inicio lista únicamente comercios publicados.
- [ ] El buscador encuentra por nombre, categoría o descripción.
- [ ] Los filtros funcionan en móvil y escritorio.
- [ ] Cada comercio tiene URL individual estable.
- [ ] Los campos opcionales no dejan espacios ni botones rotos.
- [ ] WhatsApp abre una conversación con el número correcto.
- [ ] Las redes sociales apuntan al perfil correcto.
- [ ] Maps solo aparece donde hay ubicación confirmada.
- [ ] Compartir usa el menú nativo o copia el enlace como alternativa.
- [ ] Existe botón de compartir por WhatsApp.
- [ ] Cada comercio tiene título, descripción e imagen social propios.
- [ ] Slugs inexistentes devuelven 404.
- [ ] La interfaz funciona correctamente desde 320 px.
- [ ] No hay secretos, base de datos, panel ni endpoints de escritura.
- [ ] El sitio funciona bajo HTTPS en el dominio final.
- [ ] Los enlaces se prueban desde al menos un celular real.

---

## 14. Orden obligatorio de implementación

### Bloque 1 — Base funcional

1. Crear o inspeccionar el proyecto Next.js.
2. Configurar TypeScript estricto y Tailwind.
3. Crear tipos, estados y datos de ejemplo.
4. Implementar utilidades para buscar por slug y listar publicados.
5. Crear inicio y tarjetas.
6. Crear perfil dinámico y 404.

### Bloque 2 — Conversión y viralidad

7. Añadir WhatsApp, teléfono, redes y Maps condicional.
8. Implementar compartir nativo, copiar y WhatsApp.
9. Implementar metadatos dinámicos, sitemap y robots.

### Bloque 3 — Carga y lanzamiento

10. Sustituir los datos de ejemplo por comercios reales.
11. Optimizar logos y portadas.
12. Ejecutar lint, typecheck y build.
13. Desplegar en VPS detrás de HTTPS.
14. Probar enlaces y previews sociales desde celular.

No dedicar tiempo a perfeccionamiento visual antes de terminar los bloques 1 y 2.

---

## 15. Backlog posterior al MVP

En orden orientativo:

1. Analítica de visitas, clics y compartidos.
2. Panel administrativo privado.
3. PostgreSQL y ORM.
4. Carga de imágenes administrada.
5. Productos o servicios destacados.
6. Roles para colaboradores.
7. Formularios privados para actualizar información.
8. Páginas por categoría o sector.
9. PWA y caché offline.

No comenzar este backlog antes de publicar y validar el MVP.

---

## 16. Prompt maestro para Codex

Copiar desde aquí:

```text
Quiero que implementes el MVP de “Centro Vivo” siguiendo estrictamente el archivo CENTRO_VIVO_HANDOFF.md de este repositorio.

Objetivo: publicar hoy una plataforma rápida, segura, responsive y compartible para visibilizar comercios aliados del centro de Pereira. Usa Next.js App Router, TypeScript estricto y Tailwind CSS. Los datos deben vivir temporalmente en un archivo TypeScript tipado; no construyas base de datos, autenticación, panel administrativo, endpoints de escritura ni catálogo de productos.

Antes de editar:
1. Inspecciona el repositorio y cualquier AGENTS.md aplicable.
2. Identifica la versión actual de Next.js y la estructura existente.
3. Resume en pocas líneas lo que vas a conservar y lo que necesitas crear.
4. Si hay cambios del usuario no relacionados, consérvalos.

Durante la implementación:
- Trabaja por bloques según el orden definido en CENTRO_VIVO_HANDOFF.md.
- Prioriza primero funcionalidad, responsive y compartir; evita diseño excesivo.
- Crea componentes pequeños y código legible.
- No instales dependencias si la plataforma nativa resuelve la necesidad.
- Trata los campos opcionales correctamente.
- Genera metadata individual para cada comercio.
- Implementa Web Share API con fallback para copiar y un enlace directo de WhatsApp.
- Mantén la marca neutral; la consultora y Fabián Sánchez “El Chinito” solo aparecen discretamente en el footer.
- Si falta un nombre, dominio, logo o comercio real, usa placeholders evidentes y centralizados sin bloquear el desarrollo.

Antes de terminar:
- Ejecuta lint, typecheck y build de producción.
- Corrige los errores encontrados.
- Revisa los criterios de aceptación uno por uno.
- Entrégame un resumen breve de lo implementado, archivos importantes, pruebas realizadas y placeholders que debo sustituir.

No despliegues ni modifiques la VPS hasta que te entregue acceso/contexto específico o te pida expresamente hacer el despliegue.
```

---

## 17. Información que el propietario debe entregar a Codex

No bloquea el inicio, pero debe sustituirse antes del lanzamiento:

- `[MARCA DE LA CONSULTORA]` o texto provisional acordado.
- Dominio definitivo.
- Comercios reales en el formato del modelo.
- Logos y portadas autorizados.
- Redes, números, horarios y ubicaciones verificados.
- Logo provisional de Centro Vivo, o autorización para usar una marca tipográfica simple.
- Contexto actual de la VPS cuando se vaya a desplegar.

Si alguno falta, Codex debe dejarlo centralizado como placeholder y continuar con la implementación.
