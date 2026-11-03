/* Formulario de contacto: validaciones con límites y guardado en LocalStorage. */

const LIMITE_NOMBRE = 100;
const LIMITE_MENSAJE = 500;
const MINIMO_MENSAJE = 10;
const MINIMO_NOMBRE = 3;

const formContacto = document.getElementById('formContacto');
const nombre = document.getElementById('nombre');
const email = document.getElementById('email');
const mensaje = document.getElementById('mensaje');
const contadorMensaje = document.getElementById('contadorMensaje');
const alertaContacto = document.getElementById('alertaContacto');

/* ---------- Validaciones ---------- */

function errorNombreContacto(valor) {
  const v = String(valor || '').trim();
  if (v === '') return 'El nombre es obligatorio.';
  if (v.length < MINIMO_NOMBRE) return 'El nombre debe tener al menos ' + MINIMO_NOMBRE + ' caracteres.';
  if (v.length > LIMITE_NOMBRE) return 'El nombre no puede superar los ' + LIMITE_NOMBRE + ' caracteres.';
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v)) return 'El nombre solo puede contener letras.';
  return '';
}

function errorCorreoContacto(valor) {
  const formato = errorCorreoFormato(valor);
  if (formato !== '') return formato;
  if (!correoPermitido(valor)) {
    return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  }
  return '';
}

function errorMensajeContacto(valor) {
  const v = String(valor || '').trim();
  if (v === '') return 'El mensaje es obligatorio.';
  if (v.length < MINIMO_MENSAJE) return 'El mensaje debe tener al menos ' + MINIMO_MENSAJE + ' caracteres.';
  if (v.length > LIMITE_MENSAJE) return 'El mensaje no puede superar los ' + LIMITE_MENSAJE + ' caracteres.';
  return '';
}

function validarNombreContacto() {
  return validarCampo(nombre, errorNombreContacto(nombre.value));
}

function validarCorreoContacto() {
  return validarCampo(email, errorCorreoContacto(email.value));
}

function validarMensajeContacto() {
  return validarCampo(mensaje, errorMensajeContacto(mensaje.value));
}

/* ---------- Contador y avisos ---------- */

function actualizarContadorMensaje() {
  if (!contadorMensaje) return;
  const largo = mensaje.value.length;
  contadorMensaje.textContent = largo + ' / ' + LIMITE_MENSAJE + ' caracteres';
  contadorMensaje.classList.toggle('text-danger', largo >= LIMITE_MENSAJE);
}

function mostrarAlertaContacto(texto, tipo) {
  if (!alertaContacto) return;
  alertaContacto.innerHTML =
    '<div class="alert alert-' + (tipo || 'success') + ' alert-dismissible fade show" role="alert">' +
    escaparHtml(texto) +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>' +
    '</div>';
  alertaContacto.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limpiarAlertaContacto() {
  if (alertaContacto) alertaContacto.innerHTML = '';
}

/* ---------- Eventos ---------- */

nombre.addEventListener('input', validarNombreContacto);
email.addEventListener('input', validarCorreoContacto);
mensaje.addEventListener('input', function () {
  validarMensajeContacto();
  actualizarContadorMensaje();
});

formContacto.addEventListener('submit', function (event) {
  event.preventDefault();
  limpiarAlertaContacto();

  const okNombre = validarNombreContacto();
  const okCorreo = validarCorreoContacto();
  const okMensaje = validarMensajeContacto();

  if (!okNombre || !okCorreo || !okMensaje) {
    const primero = formContacto.querySelector('.is-invalid');
    if (primero) primero.focus();
    return;
  }

  const sesion = sesionActual();
  const correoRespuesta = email.value.trim().toLowerCase();

  agregarMensajeContacto({
    nombre: nombre.value,
    correo: correoRespuesta,
    mensaje: mensaje.value,
    usuario: sesion ? sesion.correo : ''
  });

  formContacto.reset();
  [nombre, email, mensaje].forEach(limpiarError);
  actualizarContadorMensaje();
  mostrarAlertaContacto(
    '¡Gracias! Tu mensaje fue guardado. Te responderemos a ' + correoRespuesta + '.',
    'success'
  );
});

document.addEventListener('DOMContentLoaded', function () {
  actualizarContadorMensaje();

  const sesion = sesionActual();
  if (sesion) {
    nombre.value = sesion.nombre || '';
    email.value = sesion.correo || '';
  }
});
