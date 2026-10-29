const SESION = sesionActual();
const ES_ADMIN = SESION && SESION.rol === 'Administrador';
const ES_VENDEDOR = SESION && SESION.rol === 'Vendedor';
const TIENE_ACCESO = ES_ADMIN || ES_VENDEDOR;

let productoEditandoId = null;
let usuarioEditandoId = null;

function leerProductos() {
  return obtenerProductosPersistidos();
}

function escribirProductos(lista) {
  guardarProductosPersistidos(lista);
}

function leerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem('chasonneUsuarios')) || [];
  } catch (e) {
    return [];
  }
}

function escribirUsuarios(lista) {
  localStorage.setItem('chasonneUsuarios', JSON.stringify(lista));
}

function leerPedidos() {
  try {
    return JSON.parse(localStorage.getItem('chasonnePedidos')) || [];
  } catch (e) {
    return [];
  }
}

function formatearPrecio(valor) {
  return '$' + Number(valor).toLocaleString('es-CL');
}

function mostrarSeccion(nombre) {
  document.getElementById('seccionProductos').style.display = nombre === 'productos' ? 'block' : 'none';
  document.getElementById('seccionUsuarios').style.display = nombre === 'usuarios' ? 'block' : 'none';
  document.getElementById('seccionPedidos').style.display = nombre === 'pedidos' ? 'block' : 'none';
  document.getElementById('seccionAlertas').style.display = nombre === 'alertas' ? 'block' : 'none';

  document.getElementById('tabProductosBtn').classList.toggle('active', nombre === 'productos');
  document.getElementById('tabUsuariosBtn').classList.toggle('active', nombre === 'usuarios');
  document.getElementById('tabPedidosBtn').classList.toggle('active', nombre === 'pedidos');
  document.getElementById('tabAlertasBtn').classList.toggle('active', nombre === 'alertas');

  if (nombre === 'productos') renderizarProductos();
  if (nombre === 'usuarios') renderizarUsuarios();
  if (nombre === 'pedidos') renderizarPedidos();
  if (nombre === 'alertas') renderizarAlertas();
}

const ALERTAS_KEY = 'chasonneAlertas';

function leerAlertas() {
  try {
    return JSON.parse(localStorage.getItem(ALERTAS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function guardarAlertas(lista) {
  localStorage.setItem(ALERTAS_KEY, JSON.stringify(lista));
}

function avisarFaltaStock(id) {
  const p = leerProductos().find(function (x) { return x.id === id; });
  if (!p) return;

  if (Number(p.stock) > Number(p.stockCritico)) {
    alert('El producto "' + p.nombre + '" aún tiene stock suficiente (stock: ' + p.stock + ', crítico: ' + p.stockCritico + '). No se envió la alerta.');
    return;
  }

  const sesion = sesionActual();
  const alertas = leerAlertas();
  alertas.push({
    id: 'AL-' + Date.now(),
    fecha: new Date().toLocaleString('es-CL'),
    producto: p.nombre,
    stock: p.stock,
    stockCritico: p.stockCritico,
    vendedor: sesion ? sesion.nombre : 'Desconocido',
    estado: 'pendiente'
  });
  guardarAlertas(alertas);
  actualizarBadgeAlertas();
  alert('Alerta de falta de stock enviada al administrador para "' + p.nombre + '".');
}

function actualizarBadgeAlertas() {
  const badge = document.getElementById('badgeAlertas');
  if (!badge) return;
  const cantidad = leerAlertas().filter(function (a) { return a.estado === 'pendiente'; }).length;
  badge.textContent = cantidad;
  badge.style.display = cantidad > 0 ? 'inline-block' : 'none';
}

function renderizarAlertas() {
  const contenedor = document.getElementById('listaAlertas');
  const alertas = leerAlertas();

  if (alertas.length === 0) {
    contenedor.innerHTML = '<p class="text-muted">No hay alertas de stock registradas.</p>';
    return;
  }

  let html = '';
  alertas.reverse().forEach(function (a) {
    const estado = a.estado === 'pendiente'
      ? '<span class="badge bg-danger">Pendiente</span>'
      : '<span class="badge bg-secondary">Revisada</span>';
    const accion = a.estado === 'pendiente'
      ? '<button class="btn btn-sm btn-outline-success" onclick="marcarAlertaRevisada(\'' + a.id + '\')">Marcar como revisada</button>'
      : '';

    html += '<div class="card card-admin card-body mb-3">' +
      '<div class="d-flex justify-content-between align-items-center">' +
      '<div>' +
      '<strong>' + a.producto + '</strong> — ' + estado + '<br>' +
      '<span class="text-muted">Stock actual: ' + a.stock + ' | Stock crítico: ' + a.stockCritico + '</span>' +
      '</div>' +
      '<div class="text-end">' +
      '<div class="text-muted small">' + a.fecha + '</div>' +
      '<div class="text-muted small">Reportada por: ' + a.vendedor + '</div>' +
      '<div class="mt-1">' + accion + '</div>' +
      '</div></div></div>';
  });
  contenedor.innerHTML = html;
}

function marcarAlertaRevisada(id) {
  const alertas = leerAlertas();
  const a = alertas.find(function (x) { return x.id === id; });
  if (a) {
    a.estado = 'revisada';
    guardarAlertas(alertas);
  }
  actualizarBadgeAlertas();
  renderizarAlertas();
}

function renderizarProductos() {
  const tbody = document.getElementById('tablaProductos');
  const productos = leerProductos();

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay productos registrados.</td></tr>';
    return;
  }

  let html = '';
  productos.forEach(function (p) {
    const esCritico = Number(p.stock) <= Number(p.stockCritico);
    const alerta = esCritico
      ? '<span class="badge bg-danger">Stock crítico</span>'
      : '<span class="badge bg-success">OK</span>';
    const filaCritica = esCritico ? ' class="table-danger"' : '';

    let acciones = '<button class="btn btn-sm btn-outline-primary me-1" onclick="abrirFormularioProducto(\'' + p.id + '\')">Editar</button>';
    if (ES_ADMIN) {
      acciones += '<button class="btn btn-sm btn-outline-danger me-1" onclick="eliminarProducto(\'' + p.id + '\')">Eliminar</button>';
    }
    acciones += '<button class="btn btn-sm btn-outline-warning" onclick="avisarFaltaStock(\'' + p.id + '\')">Avisar falta de stock</button>';

    html += '<tr' + filaCritica + '>' +
      '<td><img src="' + p.img + '" alt="' + p.nombre + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"></td>' +
      '<td>' + p.nombre + '</td>' +
      '<td>' + p.categoria + '</td>' +
      '<td>' + formatearPrecio(p.precio) + '</td>' +
      '<td>' + p.stock + '</td>' +
      '<td>' + p.stockCritico + '</td>' +
      '<td>' + alerta + '</td>' +
      '<td>' + acciones + '</td></tr>';
  });
  tbody.innerHTML = html;
}

function abrirFormularioProducto(id) {
  const form = document.getElementById('formularioProducto');
  form.style.display = 'block';
  productoEditandoId = id;
  document.getElementById('tituloFormularioProducto').textContent = id ? 'Editar producto' : 'Nuevo producto';

  const nombre = document.getElementById('pNombre');
  const categoria = document.getElementById('pCategoria');
  const img = document.getElementById('pImg');
  const descripcion = document.getElementById('pDescripcion');
  const precio = document.getElementById('pPrecio');
  const stock = document.getElementById('pStock');
  const stockCritico = document.getElementById('pStockCritico');

  if (id) {
    const p = leerProductos().find(function (x) { return x.id === id; });
    if (p) {
      nombre.value = p.nombre;
      categoria.value = p.categoria;
      img.value = p.img;
      descripcion.value = p.descripcion;
      precio.value = p.precio;
      stock.value = p.stock;
      stockCritico.value = p.stockCritico;
    }
  } else {
    nombre.value = '';
    categoria.value = 'Bebidas';
    img.value = '';
    descripcion.value = '';
    precio.value = '';
    stock.value = '';
    stockCritico.value = '';
  }
  form.scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormularioProducto() {
  document.getElementById('formularioProducto').style.display = 'none';
  productoEditandoId = null;
}

function guardarProductoDesdeFormulario() {
  const nombre = document.getElementById('pNombre').value.trim();
  const categoria = document.getElementById('pCategoria').value;
  const img = document.getElementById('pImg').value.trim();
  const descripcion = document.getElementById('pDescripcion').value.trim();
  const precio = document.getElementById('pPrecio').value;
  const stock = document.getElementById('pStock').value;
  const stockCritico = document.getElementById('pStockCritico').value;

  if (!nombre || precio === '' || stock === '') {
    alert('Completa al menos nombre, precio y stock.');
    return;
  }

  let productos = leerProductos();

  if (productoEditandoId) {
    const p = productos.find(function (x) { return x.id === productoEditandoId; });
    if (p) {
      p.nombre = nombre;
      p.categoria = categoria;
      p.img = img || p.img;
      p.descripcion = descripcion;
      p.precio = Number(precio);
      p.stock = Number(stock);
      p.stockCritico = stockCritico === '' ? 3 : Number(stockCritico);
    }
  } else {
    productos.push({
      id: 'prod-' + Date.now(),
      nombre: nombre,
      categoria: categoria,
      img: img || 'fotos/Espresso.webp',
      descripcion: descripcion,
      precio: Number(precio),
      stock: Number(stock),
      stockCritico: stockCritico === '' ? 3 : Number(stockCritico)
    });
  }

  escribirProductos(productos);
  cerrarFormularioProducto();
  renderizarProductos();
}

function eliminarProducto(id) {
  if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
  let productos = leerProductos();
  productos = productos.filter(function (p) { return p.id !== id; });
  escribirProductos(productos);
  renderizarProductos();
}

function renderizarUsuarios() {
  const tbody = document.getElementById('tablaUsuarios');
  const usuarios = leerUsuarios();

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios registrados.</td></tr>';
    return;
  }

  let html = '';
  usuarios.forEach(function (u) {
    const rolSelect =
      '<select class="form-select form-select-sm" onchange="cambiarRol(\'' + u.id + '\', this.value)">' +
      '<option' + (u.rol === 'Cliente' ? ' selected' : '') + '>Cliente</option>' +
      '<option' + (u.rol === 'Vendedor' ? ' selected' : '') + '>Vendedor</option>' +
      '<option' + (u.rol === 'Administrador' ? ' selected' : '') + '>Administrador</option>' +
      '</select>';

    html += '<tr>' +
      '<td>' + u.nombre + '</td>' +
      '<td>' + u.correo + '</td>' +
      '<td>' + rolSelect + '</td>' +
      '<td>' +
      '<button class="btn btn-sm btn-outline-primary me-1" onclick="abrirFormularioUsuarioEditar(\'' + u.id + '\')">Editar</button>' +
      '<button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(\'' + u.id + '\')">Eliminar</button>' +
      '</td></tr>';
  });
  tbody.innerHTML = html;
}

function cambiarRol(id, rol) {
  const usuarios = leerUsuarios();
  const u = usuarios.find(function (x) { return x.id === id; });
  if (u) {
    u.rol = rol;
    escribirUsuarios(usuarios);
  }
}

function abrirFormularioUsuario() {
  const form = document.getElementById('formularioUsuario');
  form.style.display = 'block';
  usuarioEditandoId = null;
  document.getElementById('uNombre').value = '';
  document.getElementById('uCorreo').value = '';
  document.getElementById('uPassword').value = '';
  document.getElementById('uRol').value = 'Cliente';
  form.scrollIntoView({ behavior: 'smooth' });
}

function abrirFormularioUsuarioEditar(id) {
  const u = leerUsuarios().find(function (x) { return x.id === id; });
  if (!u) return;
  const form = document.getElementById('formularioUsuario');
  form.style.display = 'block';
  usuarioEditandoId = id;
  document.getElementById('uNombre').value = u.nombre;
  document.getElementById('uCorreo').value = u.correo;
  document.getElementById('uPassword').value = u.password;
  document.getElementById('uRol').value = u.rol;
  form.scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormularioUsuario() {
  document.getElementById('formularioUsuario').style.display = 'none';
  usuarioEditandoId = null;
}

function guardarUsuarioDesdeFormulario() {
  const nombre = document.getElementById('uNombre').value.trim();
  const correo = document.getElementById('uCorreo').value.trim().toLowerCase();
  const password = document.getElementById('uPassword').value;
  const rol = document.getElementById('uRol').value;

  if (!nombre || !correo || !password) {
    alert('Completa nombre, correo y contraseña.');
    return;
  }

  let usuarios = leerUsuarios();
  const correoExiste = usuarios.some(function (u) {
    return u.correo.toLowerCase() === correo && u.id !== usuarioEditandoId;
  });
  if (correoExiste) {
    alert('Ese correo ya está registrado.');
    return;
  }

  if (usuarioEditandoId) {
    const u = usuarios.find(function (x) { return x.id === usuarioEditandoId; });
    if (u) {
      u.nombre = nombre;
      u.correo = correo;
      u.password = password;
      u.rol = rol;
    }
  } else {
    usuarios.push({ id: 'U-' + Date.now(), nombre: nombre, correo: correo, password: password, rol: rol });
  }

  escribirUsuarios(usuarios);
  cerrarFormularioUsuario();
  renderizarUsuarios();
}

function eliminarUsuario(id) {
  const sesion = sesionActual();
  if (sesion && sesion.id === id) {
    alert('No puedes eliminar el usuario con el que iniciaste sesión.');
    return;
  }
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
  let usuarios = leerUsuarios();
  usuarios = usuarios.filter(function (u) { return u.id !== id; });
  escribirUsuarios(usuarios);
  renderizarUsuarios();
}

function renderizarPedidos() {
  const contenedor = document.getElementById('listaPedidos');
  const pedidos = leerPedidos();

  if (pedidos.length === 0) {
    contenedor.innerHTML = '<p class="text-muted">No hay pedidos registrados todavía.</p>';
    return;
  }

  let html = '';
  pedidos.forEach(function (pedido) {
    html += '<div class="card card-admin card-body mb-3">' +
      '<div class="d-flex justify-content-between">' +
      '<div><strong>' + pedido.id + '</strong> — ' + pedido.cliente + '</div>' +
      '<div class="text-muted">' + pedido.fecha + '</div>' +
      '</div>' +
      '<table class="table table-sm mt-2 mb-2 admin-tabla"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>';

    pedido.items.forEach(function (item) {
      html += '<tr><td>' + item.nombre + '</td><td>' + formatearPrecio(item.precio) + '</td><td>' + item.cantidad + '</td><td>' + formatearPrecio(item.precio * item.cantidad) + '</td></tr>';
    });

    html += '</tbody></table>' +
      '<div class="text-end"><strong>Total: ' + formatearPrecio(pedido.total) + '</strong></div>' +
      '</div>';
  });
  contenedor.innerHTML = html;
}

document.getElementById('formProducto').addEventListener('submit', function (event) {
  event.preventDefault();
  guardarProductoDesdeFormulario();
});

document.getElementById('formUsuario').addEventListener('submit', function (event) {
  event.preventDefault();
  guardarUsuarioDesdeFormulario();
});

document.addEventListener('DOMContentLoaded', function () {
  if (!TIENE_ACCESO) {
    document.getElementById('accesoDenegado').style.display = 'block';
    document.getElementById('panelAdmin').style.display = 'none';
    return;
  }
  document.getElementById('accesoDenegado').style.display = 'none';
  document.getElementById('panelAdmin').style.display = 'block';

  if (!ES_ADMIN) {
    document.getElementById('tabUsuariosWrap').style.display = 'none';
    document.getElementById('tabAlertasWrap').style.display = 'none';
  }

  actualizarBadgeAlertas();
  renderizarProductos();
});