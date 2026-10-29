# Chascone Café

Tienda de café desarrollada como proyecto de **Desarrollo FullStack II — Sección 001D**.

- **Integrantes:** Elias San Martin · Gerald Cortes
- **Docente:** Javier Alejandro Concha Ahumada

Sitio web estático construido con **HTML5, CSS3 y JavaScript Vanilla** (sin frameworks
ni librerías). Incluye catálogo, detalle de producto, carrito, registro/login con roles,
blog, contacto y panel administrativo. La persistencia se realiza en **LocalStorage**,
por lo que no requiere servidor ni base de datos para ejecutarse.

## Cómo ejecutar

1. Abrir `index.html` en **Chrome o Edge**.
2. Navegar con el menú superior.

> En Chrome y Edge todas las páginas comparten el LocalStorage al abrirse con `file://`.
> En Firefox el almacenamiento puede quedar separado por archivo y la sesión no se comparte.

## Estructura

```
index.html            Portada y productos destacados
productos.html        Catálogo completo
detalle.html          Detalle del producto (detalle.html?id=...)
carrito.html          Carrito y finalización del pedido
registro.html         Registro de clientes
login.html            Inicio de sesión
contacto.html         Formulario de contacto
blog.html             Artículos del blog
sobre-nosotros.html   Información del negocio
admin.html            Panel administrativo (según rol)

productos.js          Catálogo y render de productos
carrito.js            Carrito: agregar, cantidades, total y pedido
usuarios.js           Registro, login, sesión y roles
contacto.js           Validaciones del formulario de contacto
blog.js               Artículos del blog
admin.js              Panel: productos, usuarios, pedidos y alertas

estilos/estilos.css   Hoja de estilos única y responsiva
fotos/                Imágenes de productos
imagenes/             Imágenes generales
```

## Datos en LocalStorage

| Clave | Contenido |
|---|---|
| `chasonneProductos` | Catálogo de productos |
| `chasonneCarrito` | Items del carrito |
| `chasonnePedidos` | Pedidos finalizados |
| `chasonneUsuarios` | Usuarios registrados |
| `chasonneSesion` | Sesión activa (nombre, correo, rol) |
| `chasonneAlertas` | Alertas de stock crítico |

Usuario inicial: `admin@duoc.cl` / `admin123` (rol Administrador, creado por código).

## Roles

- **Administrador:** panel completo (productos, usuarios, pedidos y alertas).
- **Vendedor:** productos (sin eliminar) y pedidos.
- **Cliente:** tienda pública, carrito, contacto y blog.

## Ramas

| Rama | Alcance |
|---|---|
| `main` | Versión estable / entrega |
| `feat/catalogo-productos` | Portada, catálogo y detalle |
| `feat/carrito-pedidos` | Carrito, totales y pedidos |
| `feat/usuarios-roles` | Registro, login, sesión y permisos |
| `feat/panel-admin` | Panel, CRUD y alertas de stock |
| `feat/blog-contacto` | Blog, contacto e informativas |
| `feat/ui-responsive` | Estilos, navegación y adaptación a móvil |

Convención: `feat/` funcionalidad nueva, `fix/` corrección, `refactor/` reordenamiento,
`docs/` documentación, `chore/` configuración.

### Flujo de trabajo

```bash
git checkout feat/carrito-pedidos     # trabajar en la rama del modulo
git status                            # revisar cambios
git add .
git commit -m "carrito: valida stock antes de agregar"
git push                              # subir la rama

git checkout main                     # volver a la version estable
git merge feat/carrito-pedidos        # integrar el modulo terminado
git push
```
