# Handoff para diseno - Compra en Pereira CMS

## Objetivo

Disenar la experiencia del CMS/catalogo local de Compra en Pereira sin esperar a que todo el backend de productos y analytics este completo.

El producto no es e-commerce todavia. Es una vitrina/catalogo para que empresas locales administren perfil, productos, canales de contacto y estadisticas basicas.

## Superficies

### Publico

```text
/
/comercios
/comercios/[slug]
/productos
/productos/[slug]
/registrar-comercio
/categorias
/como-funciona
/iniciativa
```

### Empresa

```text
/login
/dashboard
/dashboard/negocios
/dashboard/negocios/[businessId]
/dashboard/negocios/[businessId]/productos
/dashboard/negocios/[businessId]/productos/nuevo
/dashboard/negocios/[businessId]/productos/[productId]
/dashboard/negocios/[businessId]/estadisticas
/dashboard/negocios/[businessId]/equipo
```

### Admin

```text
/admin
/admin/postulaciones
/admin/negocios
/admin/productos
/admin/moderacion
/admin/categorias
```

## Estado actual

### Funcional real

- Login con Supabase Auth.
- Admin protegido por rol en `admin_users`.
- Dashboard protegido.
- Listado de negocios asignados al usuario.
- Invitaciones pendientes por email.
- Edicion basica de perfil del negocio.
- Subida de logo y portada.
- Gestion de links sociales.
- Auditoria basica de cambios.
- Admin de postulaciones.

### Placeholder navegable

- Productos de empresa.
- Nuevo producto.
- Editar producto.
- Estadisticas.
- Equipo.
- Admin negocios.
- Admin productos.
- Admin moderacion.
- Admin categorias.
- Catalogo publico de productos.
- Detalle publico de producto.

## Roles

```text
visitor
business_owner
business_manager
business_editor
business_viewer
admin
moderator
support
```

## Restricciones de permisos

Una empresa puede editar:

- Nombre comercial.
- Descripcion corta.
- Descripcion completa.
- Estado operativo.
- WhatsApp.
- Telefono.
- Direccion.
- Google Maps.
- Horario.
- Redes sociales.
- Logo.
- Portada.

Una empresa no puede editar:

- Publicado/no publicado.
- Destacado.
- Verificado.
- Suspendido.
- Owner real.
- Estados de moderacion.

Esos campos son admin-only.

## Flujos principales a disenar

### Empresa

1. Login.
2. Dashboard sin negocios.
3. Dashboard con invitaciones pendientes.
4. Dashboard con negocios.
5. Edicion de perfil.
6. Subida/reemplazo de logo.
7. Subida/reemplazo de portada.
8. Productos vacios.
9. Crear producto.
10. Lista de productos.
11. Estadisticas vacias/con datos.
12. Equipo e invitaciones.

### Admin

1. Login.
2. Postulaciones.
3. Revision de postulacion.
4. Aprobar/rechazar/necesita info.
5. Negocios.
6. Productos.
7. Moderacion.
8. Categorias.

### Publico

1. Directorio de comercios.
2. Perfil de comercio.
3. Catalogo de productos.
4. Detalle de producto.
5. Contacto por WhatsApp, telefono, Maps, web y redes.

## Estados que deben existir en UI

- Cargando.
- Vacio.
- Error.
- Guardado exitoso.
- Pendiente de revision.
- Publicado.
- Oculto.
- Rechazado.
- Invitado.
- Sin permiso.

## Notas visuales

El CMS debe sentirse como una herramienta de trabajo, no como landing page:

- Informacion escaneable.
- Navegacion clara.
- Formularios densos pero ordenados.
- Estados y badges visibles.
- Acciones primarias evidentes.
- Evitar secciones hero grandes dentro del dashboard.

## Pendiente de backend

- Modelo real de productos.
- Imagenes de productos.
- Moderacion real de productos.
- Analytics reales.
- Gestion completa de equipo.
- Asociar comercios reales existentes a cuentas.
