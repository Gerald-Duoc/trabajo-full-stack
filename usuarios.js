const USUARIOS_KEY = 'chasonneUsuarios';
const SESION_KEY = 'chasonneSesion';

const DOMINIOS_PERMITIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

function obtenerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(USUARIOS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

function semillarUsuarios() {
  const usuarios = obtenerUsuarios();
  if (usuarios.length === 0) {
    usuarios.push({
      id: 'U-ADMIN',
      nombre: 'Administrador',
      correo: 'admin@duoc.cl',
      password: 'admin123',
      rol: 'Administrador'
    });
    guardarUsuarios(usuarios);
  }
}

function correoPermitido(correo) {
  const dominio = '@' + correo.split('@').slice(1).join('@');
  return DOMINIOS_PERMITIDOS.indexOf(dominio) !== -1;
}

function correoRegistrado(correo) {
  return obtenerUsuarios().some(function (u) {
    return u.correo.toLowerCase() === correo.toLowerCase();
  });
}

function registrarUsuario(nombre, correo, password) {
  const usuarios = obtenerUsuarios();
  const nuevo = {
    id: 'U-' + Date.now(),
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    password: password,
    rol: 'Cliente'
  };
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  return nuevo;
}

function iniciarSesion(correo, password) {
  const usuario = obtenerUsuarios().find(function (u) {
    return u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password;
  });
  if (!usuario) return null;
  localStorage.setItem(SESION_KEY, JSON.stringify({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  }));
  return usuario;
}

function cerrarSesion() {
  localStorage.removeItem(SESION_KEY);
}

function sesionActual() {
  try {
    return JSON.parse(localStorage.getItem(SESION_KEY));
  } catch (e) {
    return null;
  }
}

function actualizarMenu() {
  const contenedor = document.getElementById('menuSesion');
  if (!contenedor) return;
  const sesion = sesionActual();
  if (sesion) {
    let linkPanel = '';
    if (sesion.rol === 'Administrador' || sesion.rol === 'Vendedor') {
      linkPanel = '<a class="nav-link" href="admin.html">Panel</a>';
    }
    contenedor.innerHTML =
      linkPanel +
      '<a class="nav-link" href="#" onclick="event.preventDefault(); cerrarSesion(); location.reload();">Salir (' + sesion.nombre + ')</a>';
  } else {
    contenedor.innerHTML = '<a class="nav-link" href="login.html">Ingresar</a>';
  }
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

document.addEventListener('DOMContentLoaded', function () {
  semillarUsuarios();
  actualizarMenu();
});