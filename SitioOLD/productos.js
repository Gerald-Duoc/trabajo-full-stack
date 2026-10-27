const PRODUCTOS_KEY = 'chasonneProductos';

const PRODUCTOS_BASE = [
  { id: 'espresso', nombre: 'Espresso', categoria: 'Bebidas', descripcion: 'Café corto e intenso, base de todos los demás', precio: 1500, stock: 100, stockCritico: 10, img: 'fotos/Espresso.webp' },
  { id: 'cafe-americano', nombre: 'Café Americano', categoria: 'Bebidas', descripcion: 'Espresso diluido en agua caliente, más suave y largo', precio: 1800, stock: 100, stockCritico: 10, img: 'fotos/Cafe americano.jpg' },
  { id: 'cafe-con-leche', nombre: 'Café con Leche', categoria: 'Bebidas', descripcion: 'Espresso con leche caliente al vapor', precio: 2200, stock: 100, stockCritico: 10, img: 'fotos/Café con Leche.jpg' },
  { id: 'cappuccino', nombre: 'Cappuccino', categoria: 'Bebidas', descripcion: 'Espresso con leche vaporizada y espuma, espolvoreado con canela/cacao', precio: 2500, stock: 100, stockCritico: 10, img: 'fotos/Cappuccino.jpg' },
  { id: 'cortado', nombre: 'Cortado', categoria: 'Bebidas', descripcion: 'Espresso con una pequeña cantidad de leche tibia', precio: 2000, stock: 100, stockCritico: 10, img: 'fotos/Cortado.jpg' },
  { id: 'prensa-francesa', nombre: 'Prensa Francesa 500 ml', categoria: 'Utensilios', descripcion: 'Infusión de café de inmersión con émbolo, para 3 a 4 tazas', precio: 9990, stock: 15, stockCritico: 3, img: 'fotos/Prensa Francesa 500 ml.webp' },
  { id: 'cafetera-moka', nombre: 'Cafetera Moka 6 tazas', categoria: 'Utensilios', descripcion: 'Cafetera de acero inoxidable para café al estilo italiano', precio: 14990, stock: 15, stockCritico: 3, img: 'fotos/Cafetera Moka 6 tazas.webp' },
  { id: 'cafetera-goteo', nombre: 'Cafetera de Goteo/Verter', categoria: 'Utensilios', descripcion: 'Set para preparar café por vertido manual (soporte + goteo)', precio: 12990, stock: 15, stockCritico: 3, img: 'fotos/Cafetera de Goteo.webp' },
  { id: 'molinillo', nombre: 'Molinillo de Café Manual', categoria: 'Utensilios', descripcion: 'Molino de manivela con muelas de acero', precio: 19990, stock: 15, stockCritico: 3, img: 'fotos/Molinillo de Café Manual.jpg' },
  { id: 'jarra-leche', nombre: 'Jarra de Leche (vaporera)', categoria: 'Utensilios', descripcion: 'Jarra de acero inoxidable 600 ml para espumar leche', precio: 7990, stock: 15, stockCritico: 3, img: 'fotos/Jarra de Leche (vaporera).jpg' },
  { id: 'tetera-ganso', nombre: 'Tetera de Cuello de Ganso', categoria: 'Utensilios', descripcion: 'Tetera con pico preciso para vertido controlado', precio: 15990, stock: 15, stockCritico: 3, img: 'fotos/Tetera de Cuello de Ganso.webp' },
  { id: 'termometro', nombre: 'Termómetro de Cocina', categoria: 'Utensilios', descripcion: 'Para controlar la temperatura del agua y la leche', precio: 4990, stock: 15, stockCritico: 3, img: 'fotos/Termómetro de Cocina.jpg' },
  { id: 'balanza', nombre: 'Balanza de Café', categoria: 'Utensilios', descripcion: 'Balanza de precisión con temporizador para dosificar', precio: 13990, stock: 15, stockCritico: 3, img: 'fotos/Balanza de Café.jpg' },
  { id: 'filtros-v60', nombre: 'Filtros de Papel V60 (40 uds)', categoria: 'Utensilios', descripcion: 'Filtros cónicos para método de vertido', precio: 3490, stock: 15, stockCritico: 3, img: 'fotos/Filtros de Papel V60 (40 uds).jpg' },
  { id: 'taza-ceramica', nombre: 'Taza de Cerámica 250 ml', categoria: 'Accesorios', descripcion: 'Taza clásica para espresso y filtrado', precio: 4990, stock: 15, stockCritico: 3, img: 'fotos/Taza de Cerámica 250 ml.webp' }
];

function obtenerProductosPersistidos() {
  try {
    const datos = JSON.parse(localStorage.getItem(PRODUCTOS_KEY));
    if (Array.isArray(datos)) return datos;
  } catch (e) {
  }
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(PRODUCTOS_BASE));
  return PRODUCTOS_BASE.slice();
}

function guardarProductosPersistidos(lista) {
  localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(lista));
}

const PRODUCTOS = obtenerProductosPersistidos();