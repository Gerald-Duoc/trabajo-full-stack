/* Almacenamiento de los mensajes enviados desde el formulario de contacto. */

const MENSAJES_KEY = 'chasonneMensajes';
const MENSAJES_ESTADOS = ['Nuevo', 'Leído'];

function leerMensajes() {
  try {
    const datos = JSON.parse(localStorage.getItem(MENSAJES_KEY));
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
}

function guardarMensajes(lista) {
  localStorage.setItem(MENSAJES_KEY, JSON.stringify(lista));
}

function agregarMensajeContacto(datos) {
  const mensajes = leerMensajes();
  const nuevo = {
    id: 'MSG-' + Date.now(),
    nombre: String(datos.nombre || '').trim(),
    correo: String(datos.correo || '').trim().toLowerCase(),
    mensaje: String(datos.mensaje || '').trim(),
    fecha: new Date().toLocaleString('es-CL'),
    fechaISO: new Date().toISOString(),
    estado: 'Nuevo',
    usuario: String(datos.usuario || '')
  };
  mensajes.push(nuevo);
  guardarMensajes(mensajes);
  return nuevo;
}

function cantidadMensajesNuevos() {
  return leerMensajes().filter(function (m) {
    return m.estado === 'Nuevo';
  }).length;
}

function cambiarEstadoMensaje(id, estado) {
  if (MENSAJES_ESTADOS.indexOf(estado) === -1) return false;
  const mensajes = leerMensajes();
  const mensaje = mensajes.find(function (m) { return m.id === id; });
  if (!mensaje) return false;
  mensaje.estado = estado;
  guardarMensajes(mensajes);
  return true;
}

function eliminarMensajeContacto(id) {
  const mensajes = leerMensajes().filter(function (m) { return m.id !== id; });
  guardarMensajes(mensajes);
}

function escaparHtml(valor) {
  return String(valor === undefined || valor === null ? '' : valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
