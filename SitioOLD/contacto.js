const formContacto = document.getElementById('formContacto');
const nombre = document.getElementById('nombre');
const email = document.getElementById('email');
const mensaje = document.getElementById('mensaje');

const erroresValidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

function correoPermitido(correo) {
  const dominio = correo.substring(correo.lastIndexOf('@'));
  return erroresValidos.includes(dominio);
}

function mostrarError(input, mensaje) {
  let feedback = input.parentElement.querySelector('.invalid-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    input.parentElement.appendChild(feedback);
  }
  feedback.textContent = mensaje;
  input.classList.add('is-invalid');
}

function limpiarError(input) {
  input.classList.remove('is-invalid');
  const feedback = input.parentElement.querySelector('.invalid-feedback');
  if (feedback) {
    feedback.remove();
  }
}

function validarNombre() {
  limpiarError(nombre);
  if (nombre.value.trim() === '') {
    mostrarError(nombre, 'El nombre es obligatorio.');
    return false;
  }
  return true;
}

function validarEmail() {
  limpiarError(email);
  const valor = email.value.trim();
  if (valor === '') {
    mostrarError(email, 'El correo electrónico es obligatorio.');
    return false;
  }
  if (!correoPermitido(valor)) {
    mostrarError(email, 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
    return false;
  }
  return true;
}

function validarMensaje() {
  limpiarError(mensaje);
  if (mensaje.value.trim() === '') {
    mostrarError(mensaje, 'El mensaje es obligatorio.');
    return false;
  }
  return true;
}

nombre.addEventListener('input', validarNombre);
email.addEventListener('input', validarEmail);
mensaje.addEventListener('input', validarMensaje);

formContacto.addEventListener('submit', function (event) {
  event.preventDefault();
  const okNombre = validarNombre();
  const okEmail = validarEmail();
  const okMensaje = validarMensaje();

  if (okNombre && okEmail && okMensaje) {
    formContacto.reset();
    alert('Mensaje enviado correctamente.');
  }
});