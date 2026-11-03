const USUARIOS_KEY = 'chasonneUsuarios';
const SESION_KEY = 'chasonneSesion';

const DOMINIOS_PERMITIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 20;

const REGIONES_COMUNAS = {
  'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Camiña', 'Colchane'],
  'Antofagasta': ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Tocopilla', 'María Elena', 'Ollagüe', 'San Pedro de Atacama'],
  'Atacama': ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Huasco', 'Freirina', 'Alto del Carmen'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Andacollo', 'Vicuña', 'Paihuano', 'Ovalle', 'Monte Patria', 'Illapel', 'Salamanca', 'Los Vilos', 'Canela'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Quillota', 'La Calera', 'Los Andes', 'San Felipe', 'Casablanca', 'Quintero', 'Puchuncaví'],
  'Metropolitana de Santiago': ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'San Bernardo', 'Buin', 'Colina', 'Lampa', 'Melipilla', 'Talagante', 'Peñaflor'],
  "Libertador General Bernardo O'Higgins": ['Rancagua', 'Machalí', 'Graneros', 'Doñihue', 'San Fernando', 'Santa Cruz', 'Pichilemu', 'Chimbarongo', 'Rengo'],
  'Maule': ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes', 'San Javier', 'Molina', 'Parral', 'San Clemente'],
  'Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Quirihue', 'Coelemu', 'Pinto', 'Yungay'],
  'Biobío': ['Concepción', 'Talcahuano', 'Hualpén', 'Chiguayante', 'San Pedro de la Paz', 'Coronel', 'Lota', 'Arauco', 'Los Ángeles', 'Tomé', 'Penco', 'Curanilahue', 'Lebu'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol', 'Victoria', 'Lautaro', 'Nueva Imperial'],
  'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Los Lagos', 'Paillaco'],
  'Los Lagos': ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud', 'Calbuco', 'Frutillar', 'Chonchi', 'Quellón'],
  'Aysén del General Carlos Ibáñez del Campo': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane', 'Puerto Cisnes'],
  'Magallanes y de la Antártica Chilena': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Puerto Williams']
};

/* ---------- Persistencia ---------- */

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

function nombreCompleto(usuario) {
  if (!usuario) return '';
  const partes = [usuario.nombre, usuario.apellidoPaterno, usuario.apellidoMaterno]
    .filter(function (parte) { return parte && String(parte).trim() !== ''; });
  return partes.join(' ').trim();
}

function semillarUsuarios() {
  const usuarios = obtenerUsuarios();

  if (usuarios.length === 0) {
    usuarios.push({
      id: 'U-ADMIN',
      run: '11.111.111-1',
      nombre: 'Administrador',
      apellidoPaterno: 'Chascone',
      apellidoMaterno: 'Café',
      fechaNacimiento: '1990-01-01',
      correo: 'admin@duoc.cl',
      password: 'admin123',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
      direccion: 'Av. Siempre Viva 742',
      rol: 'Administrador',
      fechaRegistro: new Date().toLocaleString('es-CL')
    });
    guardarUsuarios(usuarios);
    return;
  }

  // Completa los campos nuevos en usuarios creados antes de este módulo.
  let cambios = false;
  usuarios.forEach(function (u) {
    ['run', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'region', 'comuna', 'direccion']
      .forEach(function (campo) {
        if (u[campo] === undefined) {
          u[campo] = '';
          cambios = true;
        }
      });
  });
  if (cambios) guardarUsuarios(usuarios);
}

/* ---------- RUN chileno ---------- */

function limpiarRun(valor) {
  return String(valor == null ? '' : valor).replace(/[^0-9kK]/g, '').toUpperCase();
}

function calcularDv(cuerpo) {
  let suma = 0;
  let factor = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo.charAt(i)) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

function runValido(valor) {
  const limpio = limpiarRun(valor);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  if (cuerpo.length > 8) return false;
  return calcularDv(cuerpo) === dv;
}

function formatearRun(valor) {
  const limpio = limpiarRun(valor);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

function runRegistrado(valor) {
  const normalizado = formatearRun(valor);
  if (!normalizado) return false;
  return obtenerUsuarios().some(function (u) {
    return formatearRun(u.run || '') === normalizado;
  });
}

/* ---------- Correo ---------- */

function dominioDe(correo) {
  const partes = String(correo || '').trim().toLowerCase().split('@');
  return partes.length === 2 ? '@' + partes[1] : '';
}

function correoPermitido(correo) {
  return DOMINIOS_PERMITIDOS.indexOf(dominioDe(correo)) !== -1;
}

function correoRegistrado(correo) {
  const buscado = String(correo || '').trim().toLowerCase();
  return obtenerUsuarios().some(function (u) {
    return String(u.correo || '').toLowerCase() === buscado;
  });
}

/* ---------- Regiones y comunas ---------- */

function obtenerRegiones() {
  return Object.keys(REGIONES_COMUNAS);
}

function obtenerComunas(region) {
  return REGIONES_COMUNAS[region] || [];
}

/* ---------- Validaciones (devuelven '' si el dato está correcto) ---------- */

function errorNombre(valor) {
  const v = String(valor || '').trim();
  if (v === '') return 'El nombre es obligatorio.';
  if (v.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v)) return 'El nombre solo puede contener letras.';
  return '';
}

function errorApellido(valor, etiqueta) {
  const v = String(valor || '').trim();
  const campo = etiqueta || 'El apellido';
  if (v === '') return campo + ' es obligatorio.';
  if (v.length < 2) return campo + ' debe tener al menos 2 caracteres.';
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/.test(v)) return campo + ' solo puede contener letras.';
  return '';
}

function errorRun(valor) {
  const limpio = limpiarRun(valor);
  if (limpio === '') return 'El RUN es obligatorio.';
  if (limpio.length < 8) return 'El RUN debe tener 7 u 8 dígitos más el dígito verificador.';
  if (!runValido(limpio)) return 'El RUN no es válido. Revisa el dígito verificador.';
  if (runRegistrado(limpio)) return 'Este RUN ya está registrado.';
  return '';
}

function errorFechaNacimiento(valor) {
  if (!valor) return 'La fecha de nacimiento es obligatoria.';

  const partes = String(valor).split('-');
  if (partes.length !== 3) return 'Ingresa una fecha válida.';

  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  const fecha = new Date(anio, mes - 1, dia);

  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return 'Ingresa una fecha válida.';
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha > hoy) return 'La fecha de nacimiento no puede ser futura.';

  let edad = hoy.getFullYear() - anio;
  const yaCumplio = (hoy.getMonth() > mes - 1) || (hoy.getMonth() === mes - 1 && hoy.getDate() >= dia);
  if (!yaCumplio) edad -= 1;

  if (edad < 18) return 'Debes tener al menos 18 años para registrarte.';
  if (edad > 110) return 'Revisa la fecha ingresada.';
  return '';
}

function errorCorreoFormato(valor) {
  const v = String(valor || '').trim();
  if (v === '') return 'El correo es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return 'Ingresa un correo válido (ejemplo: nombre@duoc.cl).';
  return '';
}

function errorCorreoRegistro(valor) {
  const formato = errorCorreoFormato(valor);
  if (formato !== '') return formato;
  const v = String(valor).trim().toLowerCase();
  if (!correoPermitido(v)) {
    return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  }
  if (correoRegistrado(v)) return 'Este correo ya está registrado.';
  return '';
}

function errorCorreoLogin(valor) {
  const formato = errorCorreoFormato(valor);
  if (formato !== '') return formato;
  if (!correoPermitido(valor)) {
    return 'Debes ingresar con un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  }
  return '';
}

function errorRegion(valor) {
  if (!valor) return 'Selecciona una región.';
  if (obtenerComunas(valor).length === 0) return 'Selecciona una región válida.';
  return '';
}

function errorComuna(valor, region) {
  if (!region) return 'Primero selecciona una región.';
  if (!valor) return 'Selecciona una comuna.';
  if (obtenerComunas(region).indexOf(valor) === -1) return 'Selecciona una comuna de la región elegida.';
  return '';
}

function errorDireccion(valor) {
  const v = String(valor || '').trim();
  if (v === '') return 'La dirección es obligatoria.';
  if (v.length < 5) return 'La dirección debe tener al menos 5 caracteres.';
  if (v.length > 100) return 'La dirección no puede superar los 100 caracteres.';
  return '';
}

function errorPassword(valor) {
  const v = String(valor || '');
  if (v === '') return 'La contraseña es obligatoria.';
  if (v.length < PASSWORD_MIN) return 'La contraseña debe tener al menos ' + PASSWORD_MIN + ' caracteres.';
  if (v.length > PASSWORD_MAX) return 'La contraseña no puede superar los ' + PASSWORD_MAX + ' caracteres.';
  if (/\s/.test(v)) return 'La contraseña no puede contener espacios.';
  return '';
}

function errorConfirmacion(password, confirmar) {
  if (!confirmar) return 'Debes confirmar la contraseña.';
  if (password !== confirmar) return 'Las contraseñas no coinciden.';
  return '';
}

/* ---------- Registro, sesión y roles ---------- */

function registrarUsuario(datos) {
  const usuarios = obtenerUsuarios();
  const nuevo = {
    id: 'U-' + Date.now(),
    run: formatearRun(datos.run),
    nombre: String(datos.nombre || '').trim(),
    apellidoPaterno: String(datos.apellidoPaterno || '').trim(),
    apellidoMaterno: String(datos.apellidoMaterno || '').trim(),
    fechaNacimiento: datos.fechaNacimiento,
    correo: String(datos.correo || '').trim().toLowerCase(),
    password: datos.password,
    region: datos.region,
    comuna: datos.comuna,
    direccion: String(datos.direccion || '').trim(),
    rol: 'Cliente',
    fechaRegistro: new Date().toLocaleString('es-CL')
  };
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  return nuevo;
}

function iniciarSesion(correo, password) {
  const correoBuscado = String(correo || '').trim().toLowerCase();
  const usuario = obtenerUsuarios().find(function (u) {
    return String(u.correo || '').toLowerCase() === correoBuscado && u.password === password;
  });
  if (!usuario) return null;

  localStorage.setItem(SESION_KEY, JSON.stringify({
    id: usuario.id,
    run: usuario.run || '',
    nombre: nombreCompleto(usuario),
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

function esAdministrador() {
  const sesion = sesionActual();
  return !!sesion && sesion.rol === 'Administrador';
}

function puedeAdministrar() {
  const sesion = sesionActual();
  return !!sesion && (sesion.rol === 'Administrador' || sesion.rol === 'Vendedor');
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

/* ---------- Mensajes en formularios ---------- */

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

function validarCampo(input, mensaje) {
  limpiarError(input);
  if (mensaje !== '') {
    mostrarError(input, mensaje);
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  semillarUsuarios();
  actualizarMenu();
});
