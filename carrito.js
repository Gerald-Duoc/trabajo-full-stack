const CARRITO_KEY = 'chasonneCarrito';
const PEDIDOS_KEY = 'chasonnePedidos';

function obtenerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function formatearPrecio(valor) {
  return '$' + valor.toLocaleString('es-CL');
}

function agregarAlCarrito(id) {
  const producto = PRODUCTOS.find(function (p) { return p.id === id; });
  if (!producto) return;
  const carrito = obtenerCarrito();
  const item = carrito.find(function (i) { return i.id === id; });
  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }
  guardarCarrito(carrito);
  actualizarBadge();
  alert(producto.nombre + ' agregado al carrito.');
}

function cambiarCantidad(id, delta) {
  const carrito = obtenerCarrito();
  const item = carrito.find(function (i) { return i.id === id; });
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  guardarCarrito(carrito);
  actualizarBadge();
  renderizarCarritoCompleto();
}

function eliminarDelCarrito(id) {
  let carrito = obtenerCarrito();
  carrito = carrito.filter(function (i) { return i.id !== id; });
  guardarCarrito(carrito);
  actualizarBadge();
  renderizarCarritoCompleto();
}

function contarItems() {
  return obtenerCarrito().reduce(function (total, i) { return total + i.cantidad; }, 0);
}

function actualizarBadge() {
  const badge = document.getElementById('badgeCarrito');
  if (!badge) return;
  const total = contarItems();
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function renderizarCarritoCompleto() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById('contenidoCarrito');
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML =
      '<div class="text-center py-5"><h4>Tu carrito está vacío</h4>' +
      '<p class="text-muted">Agrega productos desde el catálogo para comenzar.</p>' +
      '<a href="productos.html" class="btn btn-primary">Ir a productos</a></div>';
    document.getElementById('totalCarrito').textContent = formatearPrecio(0);
    document.getElementById('btnFinalizar').disabled = true;
    return;
  }

  let html = '<div class="table-responsive"><table class="table table-hover align-middle">' +
    '<thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead><tbody>';

  let total = 0;
  carrito.forEach(function (item) {
    const producto = PRODUCTOS.find(function (p) { return p.id === item.id; });
    if (!producto) return;
    const subtotal = producto.precio * item.cantidad;
    total += subtotal;
    html += '<tr>' +
      '<td><div class="d-flex align-items-center gap-2"><img src="' + producto.img + '" alt="' + producto.nombre + '" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">' + producto.nombre + '</div></td>' +
      '<td>' + formatearPrecio(producto.precio) + '</td>' +
      '<td><div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(\'' + item.id + '\', -1)">-</button>' +
      '<span>' + item.cantidad + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(\'' + item.id + '\', 1)">+</button>' +
      '</div></td>' +
      '<td><strong>' + formatearPrecio(subtotal) + '</strong></td>' +
      '<td><button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(\'' + item.id + '\')">Eliminar</button></td>' +
      '</tr>';
  });

  html += '</tbody></table></div>';
  contenedor.innerHTML = html;
  document.getElementById('totalCarrito').textContent = formatearPrecio(total);
  document.getElementById('btnFinalizar').disabled = false;
}

function finalizarPedido() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  let usuarioActual = null;
  try {
    usuarioActual = JSON.parse(localStorage.getItem('chasonneSesion'));
  } catch (e) {
    usuarioActual = null;
  }
  const items = carrito.map(function (item) {
    const producto = PRODUCTOS.find(function (p) { return p.id === item.id; });
    return { id: item.id, nombre: producto.nombre, precio: producto.precio, cantidad: item.cantidad };
  });
  const total = items.reduce(function (suma, i) { return suma + i.precio * i.cantidad; }, 0);

  const pedidos = obtenerPedidos();
  pedidos.push({
    id: 'PED-' + Date.now(),
    fecha: new Date().toLocaleString('es-CL'),
    cliente: usuarioActual ? usuarioActual.nombre : 'Invitado',
    items: items,
    total: total
  });
  localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));

  localStorage.removeItem(CARRITO_KEY);
  actualizarBadge();
  renderizarCarritoCompleto();
  alert('Pedido ' + pedidos[pedidos.length - 1].id + ' registrado. Total: ' + formatearPrecio(total));
}

function obtenerPedidos() {
  try {
    return JSON.parse(localStorage.getItem(PEDIDOS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

document.addEventListener('DOMContentLoaded', function () {
  actualizarBadge();
  if (document.getElementById('contenidoCarrito')) {
    renderizarCarritoCompleto();
  }
});