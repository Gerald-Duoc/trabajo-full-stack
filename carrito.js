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

function obtenerProductoPorId(id) {
  return PRODUCTOS.find(function (p) { return p.id === id; });
}

function stockDisponible(producto) {
  return Number(producto && producto.stock) || 0;
}

function agregarAlCarrito(id) {
  const producto = obtenerProductoPorId(id);
  if (!producto) return;

  const disponible = stockDisponible(producto);
  if (disponible <= 0) {
    alert(producto.nombre + ' no tiene stock disponible.');
    return;
  }

  const carrito = obtenerCarrito();
  const item = carrito.find(function (i) { return i.id === id; });
  const cantidadActual = item ? item.cantidad : 0;

  if (cantidadActual + 1 > disponible) {
    alert('Solo quedan ' + disponible + ' unidades de ' + producto.nombre + ' y ya están en tu carrito.');
    return;
  }

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }
  guardarCarrito(carrito);
  actualizarBadge();
  alert(producto.nombre + ' agregado al carrito.');
}

function vaciarCarrito() {
  if (obtenerCarrito().length === 0) return;
  if (!confirm('¿Vaciar el carrito? Se quitarán todos los productos.')) return;
  localStorage.removeItem(CARRITO_KEY);
  actualizarBadge();
  renderizarCarritoCompleto();
}

function cambiarCantidad(id, delta) {
  const carrito = obtenerCarrito();
  const item = carrito.find(function (i) { return i.id === id; });
  if (!item) return;

  if (delta > 0) {
    const producto = obtenerProductoPorId(id);
    const disponible = stockDisponible(producto);
    if (item.cantidad + delta > disponible) {
      alert('Solo hay ' + disponible + ' unidades disponibles de ' +
        (producto ? producto.nombre : 'este producto') + '.');
      return;
    }
  }

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

  const btnFinalizar = document.getElementById('btnFinalizar');
  const btnVaciar = document.getElementById('btnVaciar');

  if (carrito.length === 0) {
    contenedor.innerHTML =
      '<div class="text-center py-5"><h4>Tu carrito está vacío</h4>' +
      '<p class="text-muted">Agrega productos desde el catálogo para comenzar.</p>' +
      '<a href="productos.html" class="btn btn-primary">Ir a productos</a></div>';
    document.getElementById('totalCarrito').textContent = formatearPrecio(0);
    if (btnFinalizar) btnFinalizar.disabled = true;
    if (btnVaciar) btnVaciar.disabled = true;
    return;
  }

  let html = '<div class="table-responsive"><table class="table table-hover align-middle">' +
    '<thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead><tbody>';

  let total = 0;
  carrito.forEach(function (item) {
    const producto = obtenerProductoPorId(item.id);
    if (!producto) return;
    const subtotal = producto.precio * item.cantidad;
    const stock = stockDisponible(producto);
    const enLimite = item.cantidad >= stock;
    total += subtotal;
    html += '<tr>' +
      '<td><div class="d-flex align-items-center gap-2">' +
      '<img src="' + producto.img + '" alt="' + producto.nombre + '" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">' +
      '<div><div>' + producto.nombre + '</div>' +
      '<small class="text-muted">Stock disponible: ' + stock + '</small></div>' +
      '</div></td>' +
      '<td>' + formatearPrecio(producto.precio) + '</td>' +
      '<td><div class="d-flex align-items-center gap-2">' +
      '<button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(\'' + item.id + '\', -1)">-</button>' +
      '<span>' + item.cantidad + '</span>' +
      '<button class="btn btn-sm btn-outline-secondary" ' + (enLimite ? 'disabled' : '') + ' onclick="cambiarCantidad(\'' + item.id + '\', 1)">+</button>' +
      '</div></td>' +
      '<td><strong>' + formatearPrecio(subtotal) + '</strong></td>' +
      '<td><button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(\'' + item.id + '\')">Eliminar</button></td>' +
      '</tr>';
  });

  html += '</tbody></table></div>';
  contenedor.innerHTML = html;
  document.getElementById('totalCarrito').textContent = formatearPrecio(total);
  if (btnFinalizar) btnFinalizar.disabled = false;
  if (btnVaciar) btnVaciar.disabled = false;
}

function finalizarPedido() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  for (let i = 0; i < carrito.length; i++) {
    const producto = obtenerProductoPorId(carrito[i].id);
    if (!producto) {
      alert('Un producto del carrito ya no está disponible. Elimínalo para continuar.');
      return;
    }
    if (carrito[i].cantidad > stockDisponible(producto)) {
      alert('No hay stock suficiente de ' + producto.nombre + '. Ajusta la cantidad antes de finalizar.');
      renderizarCarritoCompleto();
      return;
    }
  }

  let usuarioActual = null;
  try {
    usuarioActual = JSON.parse(localStorage.getItem('chasonneSesion'));
  } catch (e) {
    usuarioActual = null;
  }

  const items = carrito.map(function (item) {
    const producto = obtenerProductoPorId(item.id);
    return { id: item.id, nombre: producto.nombre, precio: producto.precio, cantidad: item.cantidad };
  });
  const total = items.reduce(function (suma, i) { return suma + i.precio * i.cantidad; }, 0);

  carrito.forEach(function (item) {
    const producto = obtenerProductoPorId(item.id);
    if (producto) producto.stock = stockDisponible(producto) - item.cantidad;
  });
  guardarProductosPersistidos(PRODUCTOS);

  const pedidos = obtenerPedidos();
  const nuevoPedido = {
    id: 'PED-' + Date.now(),
    fecha: new Date().toLocaleString('es-CL'),
    fechaISO: new Date().toISOString(),
    cliente: usuarioActual ? usuarioActual.nombre : 'Invitado',
    items: items,
    total: total
  };
  pedidos.push(nuevoPedido);
  localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));

  localStorage.removeItem(CARRITO_KEY);
  actualizarBadge();
  renderizarCarritoCompleto();
  alert('Pedido ' + nuevoPedido.id + ' registrado. Total: ' + formatearPrecio(total));
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