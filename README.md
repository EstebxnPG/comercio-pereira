# Compra en Pereira

Vitrina digital publica para visibilizar comercios aliados de Pereira. El MVP no usa base de datos, autenticacion, panel administrativo, pagos ni endpoints de escritura.

## Stack

- Next.js App Router
- TypeScript estricto
- Tailwind CSS
- Datos versionados en `src/data/businesses.ts`

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y definir:

```bash
NEXT_PUBLIC_SITE_URL=https://dominio-final.example
```

No incluir secretos en variables `NEXT_PUBLIC_*`. Todo lo que use ese prefijo queda disponible para el navegador.

## Validacion antes de commit

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Datos de comercios

Los comercios se editan en `src/data/businesses.ts`. Las reglas principales son:

- `slug` unico, estable y en kebab-case.
- Solo se publica cuando `published: true`.
- WhatsApp debe incluir indicativo de pais y solo numeros.
- URLs externas deben usar `https`.
- No afirmar seguridad estructural de inmuebles.
- Logos, portadas y datos deben tener autorizacion del comercio.

La aplicacion valida los datos durante build para detectar errores antes de desplegar.

## Despliegue

Pendiente. No modificar VPS, firewall, SSH, Nginx ni HTTPS sin revisar primero el contexto de infraestructura.
