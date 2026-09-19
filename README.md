# Compra en Pereira

Directorio local de comercios aliados de Pereira. El producto actual ya supero el MVP estatico inicial: usa Next.js, Supabase, formulario publico de postulaciones, panel admin basico, storage de imagenes y tracking simple de eventos.

La siguiente evolucion del proyecto es convertirlo en una plataforma CMS/catalogo local donde las empresas puedan administrar su perfil, publicar productos y consultar estadisticas.

## Estado actual

- Directorio publico de comercios.
- Paginas individuales por comercio.
- Busqueda y filtros basicos.
- Formulario publico para postular comercios.
- Panel admin privado con Supabase Auth y rol en `admin_users` para revisar, editar, aprobar o rechazar postulaciones.
- Supabase como base de datos y storage.
- RLS activado en tablas publicas.
- Eventos basicos para vistas y clics.

El sistema actual es suficiente para operar un directorio curado. No esta listo todavia para un CMS multiempresa porque falta completar ownership por comercio, productos estructurados, dashboard de empresa y analitica confiable por empresa.

## Stack

- Next.js App Router
- React
- TypeScript estricto
- Tailwind CSS
- Supabase Database
- Supabase Storage
- Supabase Auth, pendiente para la fase CMS

## Documentacion de producto

- [Plan CMS backend](./docs/CMS_BACKEND_README.md)
- [Handoff para diseno CMS](./docs/DESIGNER_HANDOFF.md)
- [Handoff tecnico del MVP original](./CENTRO_VIVO_HANDOFF.md)

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Copiar `.env.example` a `.env.local` y definir las variables necesarias.

Regla importante: no incluir secretos en variables `NEXT_PUBLIC_*`. Todo lo que use ese prefijo queda disponible para el navegador.

## Admin local

El acceso a `/admin` usa Supabase Auth. Para habilitar el primer admin:

1. Crear el usuario en Supabase Auth.
2. Insertar su `id` en `public.admin_users` con rol `admin`.
3. Iniciar sesion en `/login`.

No usar `raw_user_meta_data` ni variables de entorno como fuente de autorizacion.

## Validacion antes de commit

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Direccion tecnica

Antes de agregar productos al sistema se debe implementar la base SaaS:

1. Supabase Auth.
2. Perfiles de usuario.
3. Roles globales.
4. Relacion usuario-negocio mediante `business_members`.
5. RLS real por ownership.
6. Estados de moderacion.
7. Modelo de productos.
8. Eventos y agregados para estadisticas.

No agregar productos como texto libre ni como tabla aislada sin ownership. Ese seria el camino rapido, pero tambien el camino a una arquitectura fragil.
