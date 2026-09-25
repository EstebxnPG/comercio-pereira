# Sistema visual — Compra en Pereira

Referencia del lenguaje visual que se construyó durante el rediseño mobile-first del sitio publico (`/`, `/comercios`, `/productos`), para que el CMS (`/admin`, `/dashboard`) se sienta parte de la misma aplicacion en vez de una herramienta aparte.

Este documento no reemplaza a `docs/DESIGNER_HANDOFF.md` (que define alcance funcional, roles y flujos). Este cubre solo la parte estetica: que tokens existen, como se usan hoy, y que le falta al CMS para alinearse.

## 1. Lo que ya existe (fuente de verdad: `src/app/globals.css`)

### Paleta

Todo pasa por variables CSS remapeadas a tokens de Tailwind en `@theme inline`. Nunca se debe escribir un hex suelto (`#B3262E`, `#fbfaf7`, etc.) en un componente — si un color no tiene token todavia, se agrega a `globals.css`, no se hardcodea en el JSX.

| Token Tailwind | Uso | Variable origen |
|---|---|---|
| `brand` | Rojo de marca (bandera de Pereira). Acciones primarias, enlaces, acentos. | `--md-primary` (`#e41d23`) |
| `brand-deep` | Rojo oscuro. Texto sobre `brand-soft`, eyebrows. | `--md-primary-deep` (`#a81318`) |
| `brand-hover` | Estado hover de botones rellenos. | `--md-primary-hover` |
| `brand-soft` | Fondo suave rojo (chips, badges, contenedores tonales). | `--md-primary-container` |
| `gold` | Amarillo de marca. Acentos secundarios, foco/seleccion. | `--md-tertiary` (`#ffc107`) |
| `gold-soft` / `gold-ink` | Fondo/texto de chips dorados (ej. contador de productos). | `--md-tertiary-container` / `--md-on-tertiary-container` |
| `ink` / `paper` | Texto principal / fondo de pagina. | `--foreground` / `--background` |
| `stone-*` | Texto secundario y bordes (directo de Tailwind, sin token propio). | — |

Ademas existen `--md-surface`, `--md-surface-container`, `--md-outline`, `--md-outline-variant` para superficies y bordes, usados a traves de las clases de componente de abajo.

### Tipografia

Tres familias cargadas en `layout.tsx`, cada una con un rol fijo — nunca se mezclan:

- **`font-display`** (Bricolage Grotesque): todo titulo (`h1`/`h2`/`h3`). Peso `font-bold` o `font-extrabold`. Es lo que le da personalidad de marca a una pantalla — un titulo sin `font-display` no se siente parte del sitio.
- **`font-sans`** (Public Sans, es el default del body): texto de parrafo, descripciones, labels de formulario.
- **`font-mono`** (Space Mono): solo para "eyebrows" — la etiqueta pequena en mayuscula que antecede a un titulo o categoriza una tarjeta. Patron exacto usado en todo el sitio publico:
  ```
  font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep
  ```

### Componentes base (`@layer components` en `globals.css`)

Estas clases ya existen y estan disponibles en toda la app, CMS incluido — no hay que reinventarlas, solo usarlas:

- `.md-filled-button` / `.md-tonal-button` / `.md-outlined-button`: botones pill (`border-radius: 999px`, `min-height: 44px` para touch target).
- `.md-field`: input/textarea con radio 12px, fondo `surface-container`, foco con anillo de `brand`.
- `.md-surface` / `.md-surface-high`: tarjetas con sombra sutil y borde de baja opacidad.
- `.md-focus`: outline de foco accesible.

### Formas y patrones

- **Radios**: `rounded-full` en botones, badges y avatares/logos; `rounded-2xl` en tarjetas; `rounded-xl` en inputs e imagenes secundarias.
- **Badges de estado**: pill pequeno, `text-xs font-black uppercase`, fondo tonal + texto oscuro del mismo color (ej. `bg-brand-soft text-brand-deep`, o `bg-emerald-100 text-emerald-800` para exito).
- **Mobile-first real**: ningun grid arranca en 2+ columnas por accidente. El patron es `grid` (1 columna implicita) y se agregan columnas solo con `sm:`/`lg:`. Los buscadores usan el patron "pildora": icono + input + boton circular, borde sutil, sombra suave.

## 2. Estado actual del CMS (`/admin`, `/dashboard`)

Evalue las 8 pantallas reales (`postulaciones`, `moderacion`, `productos`, `negocios` y `categorias` en admin; `dashboard` y las subpaginas de negocio) con acceso en vivo. Resumen:

**Lo que ya esta bien:**
- Ya reutiliza `.md-filled-button`, `.md-outlined-button` y `.md-field` — la mecanica de interaccion es consistente con el sitio publico.
- La estructura ya es mobile-first en el sentido estructural: todo se apila en una columna en pantallas angostas, nada se rompe ni se superpone. Lo probe achicando el viewport y funciona.
- El tono "herramienta de trabajo" que pide `DESIGNER_HANDOFF.md` (denso, escaneable, sin heroes) se respeta — y esta bien, **no** hay que convertir el CMS en una landing page.

**Lo que lo desconecta visualmente del resto de la app:**

1. **Cero tokens, puro hex hardcodeado.** Cada pantalla repite `bg-[#fbfaf7]`, `text-[#22211f]`, `text-[#B3262E]`, `bg-[#ffdad8]`/`text-[#410006]` en vez de `bg-paper`, `text-ink`, `text-brand`, `bg-brand-soft`/`text-brand-deep`. Es literalmente el mismo color — solo que si manana se ajusta la paleta de marca, el CMS no se entera y queda desincronizado silenciosamente. Es el mismo problema que tenia `/productos` antes de normalizarlo.
2. **Los titulos no usan `font-display`.** Todo es `text-3xl font-black` con la fuente de body (Public Sans). El resultado: los titulos del CMS no tienen la personalidad tipografica (Bricolage Grotesque) que identifica al resto del sitio.
3. **Sin jerarquia en los badges.** En `/admin/productos`, el estado del producto, el estado de moderacion Y el precio usan el mismo pill rosado (`bg-[#ffdad8]`) sin distincion — visualmente no se puede escanear rapido cual badge es cual tipo de informacion.
4. **No hay vocabulario de color para estados semanticos.** "Pendiente" es amarillo `#fff3bd`/`#5b1b00` en un lado y `#f5c84c`/`#fff8d6` en otro (dashboard); "verificado"/"exito" es `emerald-100`/`800` de Tailwind puro, sin relacion con la paleta de marca. Cada pantalla inventa su propio amarillo/verde.
5. **Sin header/nav compartido.** Cada pagina repite a mano el link "Volver al admin" + su propio `h1`. Funciona, pero es codigo duplicado y una fuente segura de deriva visual (ya hay pequenas diferencias de espaciado entre paginas).
6. **`/login` no tiene marca.** Es un formulario blanco sin logo ni wordmark de Compra en Pereira — el primer contacto de un admin/comercio con la app no se siente parte de ella.

## 3. Recomendaciones (de menor a mayor esfuerzo)

### Nivel 1 — normalizar tokens (mismo trabajo que ya se hizo en `/productos`, cero riesgo visual)

Reemplazar cada hex hardcodeado por su token equivalente en las 8 pantallas de admin/dashboard:

- `bg-[#fbfaf7]` → `bg-paper`, `text-[#22211f]` → `text-ink`
- `text-[#B3262E]` → `text-brand`
- `bg-[#ffdad8]` / `text-[#410006]` → `bg-brand-soft` / `text-brand-deep`
- Titulos `text-3xl font-black` → `font-display text-3xl font-extrabold`
- Eyebrows `text-sm font-black uppercase text-[#B3262E]` → el patron mono establecido (`font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep`)

Esto no cambia como se ve nada (son literalmente los mismos colores) — solo lo hace mantenible y consistente.

### Nivel 2 — vocabulario de estado

Agregar a `globals.css` un par de tokens semanticos que hoy no existen, para que "pendiente/advertencia" y "exito" dejen de improvisarse:

```css
--color-warning: var(--md-tertiary);        /* reusa el gold de marca */
--color-warning-soft: var(--md-tertiary-container);
--color-warning-ink: var(--md-on-tertiary-container);

--color-success: #0f9d58;                   /* o formalizar emerald-600/800 */
--color-success-soft: #d1fae5;
--color-success-ink: #065f46;
```

Con eso, "Pendiente" en postulaciones, "Necesita info" en el dashboard y cualquier futuro badge de advertencia usan el mismo `bg-warning-soft text-warning-ink` en vez de que cada pantalla invente su amarillo.

### Nivel 3 — badges con jerarquia

En vez de un solo `<Badge>` rosado para todo (`/admin/productos`), diferenciar por tipo de informacion: estado de publicacion (`brand-soft`), estado de moderacion (`warning-soft` si es `pending`, `success-soft` si es `approved`), precio (texto simple, sin pill — no es un estado, es un dato).

### Nivel 4 — shell compartido

Un componente `AdminShell`/`DashboardShell` (eyebrow + titulo + nav de vuelta + boton "Cerrar sesion") que cada pagina consuma, en vez de repetir el header a mano. Reduce duplicacion y garantiza que las 8 pantallas evolucionen juntas.

### Nivel 5 — marca en `/login`

Agregar el logo/wordmark que ya usa `Header` en el sitio publico arriba del formulario.

## 4. Que NO hacer

- No traer heroes grandes, carruseles horizontales ni el `BubbleSelect` de `/comercios` al CMS. `DESIGNER_HANDOFF.md` es explicito: esto es una herramienta de trabajo densa y escaneable, no una landing page. La consistencia que buscamos es de **tokens y tipografia**, no de layout.
- No tocar `src/lib/businesses.ts`, `src/lib/products.ts`, `src/lib/supabase.ts` ni las acciones de servidor (`actions.ts`) — esto es puramente visual, la logica de datos/permisos del CMS queda igual.
- No rediseñar `/dashboard` y `/admin` en una sola pasada. El mismo enfoque incremental que se uso en el sitio publico (un archivo, verificar, commit) aplica aqui.
