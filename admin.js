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
  document.getElementById('seccionReportes').style.display = nombre === 'reportes' ? 'block' : 'none';
  document.getElementById('seccionAlertas').style.display = nombre === 'alertas' ? 'block' : 'none';

  document.getElementById('tabProductosBtn').classList.toggle('active', nombre === 'productos');
  document.getElementById('tabUsuariosBtn').classList.toggle('active', nombre === 'usuarios');
  document.getElementById('tabPedidosBtn').classList.toggle('active', nombre === 'pedidos');
  document.getElementById('tabReportesBtn').classList.toggle('active', nombre === 'reportes');
  document.getElementById('tabAlertasBtn').classList.toggle('active', nombre === 'alertas');

  if (nombre === 'productos') renderizarProductos();
  if (nombre === 'usuarios') renderizarUsuarios();
  if (nombre === 'pedidos') renderizarPedidos();
  if (nombre === 'reportes') renderizarReportes();
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
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay productos registrados.</td></tr>';
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
      '<td><code>' + (p.codigo || '—') + '</code></td>' +
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
  const codigo = document.getElementById('pCodigo');
  const categoria = document.getElementById('pCategoria');
  const img = document.getElementById('pImg');
  const descripcion = document.getElementById('pDescripcion');
  const precio = document.getElementById('pPrecio');
  const stock = document.getElementById('pStock');
  const stockCritico = document.getElementById('pStockCritico');

  [nombre, codigo, img, descripcion, precio, stock, stockCritico].forEach(limpiarError);

  if (id) {
    const p = leerProductos().find(function (x) { return x.id === id; });
    if (p) {
      nombre.value = p.nombre;
      codigo.value = p.codigo || '';
      categoria.value = p.categoria;
      img.value = p.img;
      descripcion.value = p.descripcion;
      precio.value = p.precio;
      stock.value = p.stock;
      stockCritico.value = p.stockCritico;
    }
  } else {
    nombre.value = '';
    codigo.value = '';
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

function campoValido(input, mensaje) {
  limpiarError(input);
  if (mensaje !== '') {
    mostrarError(input, mensaje);
    return false;
  }
  return true;
}

function mensajeCodigoProducto(valor, exceptoId) {
  const codigo = String(valor || '').trim().toUpperCase();
  if (codigo === '') return '';
  if (!codigoProductoValido(codigo)) return 'Usa el formato BEB-001 (3 letras, guion y 3 números).';
  if (codigoProductoExiste(codigo, leerProductos(), exceptoId)) return 'Ese código ya está en uso por otro producto.';
  return '';
}

function guardarProductoDesdeFormulario() {
  const nombre = document.getElementById('pNombre');
  const codigo = document.getElementById('pCodigo');
  const categoria = document.getElementById('pCategoria');
  const img = document.getElementById('pImg');
  const descripcion = document.getElementById('pDescripcion');
  const precio = document.getElementById('pPrecio');
  const stock = document.getElementById('pStock');
  const stockCritico = document.getElementById('pStockCritico');

  const okNombre = campoValido(nombre, nombre.value.trim() === '' ? 'El nombre es obligatorio.' : '');
  const okCodigo = campoValido(codigo, mensajeCodigoProducto(codigo.value, productoEditandoId));
  const okPrecio = campoValido(precio, precio.value === '' || Number(precio.value) < 0 ? 'Ingresa un precio válido.' : '');
  const okStock = campoValido(stock, stock.value === '' || Number(stock.value) < 0 ? 'Ingresa un stock válido.' : '');
  const okCritico = campoValido(stockCritico, stockCritico.value !== '' && Number(stockCritico.value) < 0 ? 'Ingresa un stock crítico válido.' : '');

  if (!okNombre || !okCodigo || !okPrecio || !okStock || !okCritico) return;

  let productos = leerProductos();
  const codigoFinal = codigo.value.trim().toUpperCase() ||
    generarCodigoProducto(categoria.value, productos, productoEditandoId);

  if (productoEditandoId) {
    const p = productos.find(function (x) { return x.id === productoEditandoId; });
    if (p) {
      p.nombre = nombre.value.trim();
      p.codigo = codigoFinal;
      p.categoria = categoria.value;
      p.img = img.value.trim() || p.img;
      p.descripcion = descripcion.value.trim();
      p.precio = Number(precio.value);
      p.stock = Number(stock.value);
      p.stockCritico = stockCritico.value === '' ? 3 : Number(stockCritico.value);
    }
  } else {
    productos.push({
      id: 'prod-' + Date.now(),
      codigo: codigoFinal,
      nombre: nombre.value.trim(),
      categoria: categoria.value,
      img: img.value.trim() || 'fotos/Espresso.webp',
      descripcion: descripcion.value.trim(),
      precio: Number(precio.value),
      stock: Number(stock.value),
      stockCritico: stockCritico.value === '' ? 3 : Number(stockCritico.value)
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
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay usuarios registrados.</td></tr>';
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
      '<td><code>' + (u.run || '—') + '</code></td>' +
      '<td>' + (nombreCompleto(u) || '—') + '</td>' +
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
  document.getElementById('tituloFormularioUsuario').textContent = 'Nuevo usuario';

  ['uRun', 'uNombre', 'uApellidoPaterno', 'uApellidoMaterno', 'uCorreo', 'uPassword'].forEach(function (id) {
    const input = document.getElementById(id);
    input.value = '';
    limpiarError(input);
  });
  document.getElementById('uRol').value = 'Cliente';
  form.scrollIntoView({ behavior: 'smooth' });
}

function abrirFormularioUsuarioEditar(id) {
  const u = leerUsuarios().find(function (x) { return x.id === id; });
  if (!u) return;
  const form = document.getElementById('formularioUsuario');
  form.style.display = 'block';
  usuarioEditandoId = id;
  document.getElementById('tituloFormularioUsuario').textContent = 'Editar usuario';

  ['uRun', 'uNombre', 'uApellidoPaterno', 'uApellidoMaterno', 'uCorreo', 'uPassword'].forEach(function (id) {
    limpiarError(document.getElementById(id));
  });
  document.getElementById('uRun').value = u.run || '';
  document.getElementById('uNombre').value = u.nombre || '';
  document.getElementById('uApellidoPaterno').value = u.apellidoPaterno || '';
  document.getElementById('uApellidoMaterno').value = u.apellidoMaterno || '';
  document.getElementById('uCorreo').value = u.correo || '';
  document.getElementById('uPassword').value = u.password || '';
  document.getElementById('uRol').value = u.rol || 'Cliente';
  form.scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormularioUsuario() {
  document.getElementById('formularioUsuario').style.display = 'none';
  usuarioEditandoId = null;
}

function runDuplicadoEnAdmin(valor, exceptoId) {
  const normalizado = formatearRun(valor);
  return leerUsuarios().some(function (u) {
    return u.id !== exceptoId && formatearRun(u.run || '') === normalizado;
  });
}

function correoDuplicadoEnAdmin(valor, exceptoId) {
  const buscado = String(valor || '').trim().toLowerCase();
  return leerUsuarios().some(function (u) {
    return u.id !== exceptoId && String(u.correo || '').toLowerCase() === buscado;
  });
}

function mensajeRunAdmin(valor, exceptoId) {
  const limpio = limpiarRun(valor);
  if (limpio === '') return 'El RUN es obligatorio.';
  if (limpio.length < 8) return 'El RUN debe tener 7 u 8 dígitos más el dígito verificador.';
  if (!runValido(limpio)) return 'El RUN no es válido. Revisa el dígito verificador.';
  if (runDuplicadoEnAdmin(limpio, exceptoId)) return 'Ese RUN ya está registrado por otro usuario.';
  return '';
}

function mensajeCorreoAdmin(valor, exceptoId) {
  const formato = errorCorreoFormato(valor);
  if (formato !== '') return formato;
  if (!correoPermitido(valor)) return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  if (correoDuplicadoEnAdmin(valor, exceptoId)) return 'Ese correo ya está registrado por otro usuario.';
  return '';
}

function guardarUsuarioDesdeFormulario() {
  const run = document.getElementById('uRun');
  const nombre = document.getElementById('uNombre');
  const apellidoPaterno = document.getElementById('uApellidoPaterno');
  const apellidoMaterno = document.getElementById('uApellidoMaterno');
  const correo = document.getElementById('uCorreo');
  const password = document.getElementById('uPassword');
  const rol = document.getElementById('uRol');

  const okRun = campoValido(run, mensajeRunAdmin(run.value, usuarioEditandoId));
  const okNombre = campoValido(nombre, errorNombre(nombre.value));
  const okPaterno = campoValido(apellidoPaterno, errorApellido(apellidoPaterno.value, 'El apellido paterno'));
  const okMaterno = campoValido(apellidoMaterno, errorApellido(apellidoMaterno.value, 'El apellido materno'));
  const okCorreo = campoValido(correo, mensajeCorreoAdmin(correo.value, usuarioEditandoId));
  const okPassword = campoValido(password, errorPassword(password.value));

  if (!okRun || !okNombre || !okPaterno || !okMaterno || !okCorreo || !okPassword) return;

  let usuarios = leerUsuarios();
  const correoFinal = correo.value.trim().toLowerCase();

  if (usuarioEditandoId) {
    const u = usuarios.find(function (x) { return x.id === usuarioEditandoId; });
    if (u) {
      u.run = formatearRun(run.value);
      u.nombre = nombre.value.trim();
      u.apellidoPaterno = apellidoPaterno.value.trim();
      u.apellidoMaterno = apellidoMaterno.value.trim();
      u.correo = correoFinal;
      u.password = password.value;
      u.rol = rol.value;
    }
  } else {
    usuarios.push({
      id: 'U-' + Date.now(),
      run: formatearRun(run.value),
      nombre: nombre.value.trim(),
      apellidoPaterno: apellidoPaterno.value.trim(),
      apellidoMaterno: apellidoMaterno.value.trim(),
      fechaNacimiento: '',
      correo: correoFinal,
      password: password.value,
      region: '',
      comuna: '',
      direccion: '',
      rol: rol.value,
      fechaRegistro: new Date().toLocaleString('es-CL')
    });
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

  const totalGeneral = pedidos.reduce(function (suma, pedido) {
    return suma + (Number(pedido.total) || 0);
  }, 0);

  let html = '<p class="text-muted">Pedidos registrados: <strong>' + pedidos.length +
    '</strong> — Venta acumulada: <strong>' + formatearPrecio(totalGeneral) + '</strong></p>';

  pedidos.slice().reverse().forEach(function (pedido) {
    html += '<div class="card card-admin card-body mb-3">' +
      '<div class="d-flex justify-content-between">' +
      '<div><strong>' + pedido.id + '</strong> — ' + pedido.cliente + '</div>' +
      '<div class="text-muted">' + pedido.fecha + '</div>' +
      '</div>' +
      '<table class="table table-sm mt-2 mb-2 admin-tabla"><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>';

    (pedido.items || []).forEach(function (item) {
      html += '<tr><td>' + item.nombre + '</td><td>' + formatearPrecio(item.precio) + '</td><td>' + item.cantidad + '</td><td>' + formatearPrecio(item.precio * item.cantidad) + '</td></tr>';
    });

    html += '</tbody></table>' +
      '<div class="text-end"><strong>Total: ' + formatearPrecio(pedido.total) + '</strong></div>' +
      '</div>';
  });
  contenedor.innerHTML = html;
}

/* ---------- Reporte de ventas ---------- */

function fechaDePedido(pedido) {
  if (pedido.fechaISO) {
    const fecha = new Date(pedido.fechaISO);
    if (!isNaN(fecha.getTime())) return fecha;
  }
  // Pedidos antiguos: la fecha se guardó como "3-11-2026, 15:30:00" (dd-mm-yyyy).
  const partes = String(pedido.fecha || '').match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (partes) {
    return new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1]));
  }
  return null;
}

function pedidosDelPeriodo(periodo) {
  const pedidos = leerPedidos();
  if (!periodo || periodo === 'todo') return pedidos;

  const ahora = new Date();
  const desde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  if (periodo === '7') desde.setDate(desde.getDate() - 6);
  if (periodo === '30') desde.setDate(desde.getDate() - 29);

  return pedidos.filter(function (pedido) {
    const fecha = fechaDePedido(pedido);
    return fecha !== null && fecha >= desde;
  });
}

function calcularReporte(pedidos) {
  const porProducto = {};
  let total = 0;
  let unidades = 0;

  pedidos.forEach(function (pedido) {
    total += Number(pedido.total) || 0;
    (pedido.items || []).forEach(function (item) {
      const clave = item.id || item.nombre;
      if (!porProducto[clave]) {
        porProducto[clave] = { id: item.id, nombre: item.nombre, unidades: 0, ingreso: 0 };
      }
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio) || 0;
      porProducto[clave].unidades += cantidad;
      porProducto[clave].ingreso += cantidad * precio;
      unidades += cantidad;
    });
  });

  const filas = Object.keys(porProducto)
    .map(function (clave) { return porProducto[clave]; })
    .sort(function (a, b) { return b.ingreso - a.ingreso; });

  return {
    pedidos: pedidos.length,
    total: total,
    unidades: unidades,
    ticket: pedidos.length > 0 ? total / pedidos.length : 0,
    filas: filas
  };
}

function codigoDeProducto(id) {
  const producto = leerProductos().find(function (p) { return p.id === id; });
  return producto && producto.codigo ? producto.codigo : '—';
}

function tarjetaReporte(titulo, valor, detalle) {
  return '<div class="col-6 col-lg-3">' +
    '<div class="card card-admin card-body h-100">' +
    '<div class="text-muted small">' + titulo + '</div>' +
    '<div class="fs-4 fw-bold">' + valor + '</div>' +
    '<div class="text-muted small">' + detalle + '</div>' +
    '</div></div>';
}

function renderizarReportes() {
  const selector = document.getElementById('reportePeriodo');
  const periodo = selector ? selector.value : 'todo';
  const datos = calcularReporte(pedidosDelPeriodo(periodo));

  document.getElementById('tarjetasReporte').innerHTML =
    tarjetaReporte('Pedidos', datos.pedidos, 'en el período') +
    tarjetaReporte('Venta total', formatearPrecio(datos.total), 'ingresos') +
    tarjetaReporte('Unidades vendidas', datos.unidades, 'productos') +
    tarjetaReporte('Ticket promedio', formatearPrecio(Math.round(datos.ticket)), 'por pedido');

  const tbody = document.getElementById('tablaReportes');

  if (datos.filas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay ventas en el período seleccionado.</td></tr>';
  } else {
    let html = '';
    datos.filas.forEach(function (fila) {
      const participacion = datos.total > 0 ? (fila.ingreso / datos.total) * 100 : 0;
      html += '<tr>' +
        '<td><code>' + codigoDeProducto(fila.id) + '</code></td>' +
        '<td>' + fila.nombre + '</td>' +
        '<td>' + fila.unidades + '</td>' +
        '<td>' + formatearPrecio(fila.ingreso) + '</td>' +
        '<td>' + participacion.toFixed(1) + '%</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  const nota = document.getElementById('notaReporte');
  if (periodo === 'todo') {
    nota.textContent = 'El reporte incluye todos los pedidos registrados en este navegador.';
  } else {
    nota.textContent = 'Solo se consideran los pedidos cuya fecha se puede ubicar dentro del período seleccionado.';
  }
}

function exportarReporteCSV() {
  const periodo = document.getElementById('reportePeriodo').value;
  const datos = calcularReporte(pedidosDelPeriodo(periodo));

  if (datos.filas.length === 0) {
    alert('No hay ventas en el período seleccionado.');
    return;
  }

  const lineas = ['Codigo;Producto;Unidades;Ingreso'];
  datos.filas.forEach(function (fila) {
    lineas.push([codigoDeProducto(fila.id), fila.nombre, fila.unidades, fila.ingreso].join(';'));
  });
  lineas.push(['TOTAL', '', datos.unidades, datos.total].join(';'));

  const contenido = '\uFEFF' + lineas.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const enlace = document.createElement('a');
  const url = URL.createObjectURL(blob);
  enlace.href = url;
  enlace.download = 'reporte-ventas-' + periodo + '.csv';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
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
    document.getElementById('tabReportesWrap').style.display = 'none';
  }

  actualizarBadgeAlertas();
  renderizarProductos();
});