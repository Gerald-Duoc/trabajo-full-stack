const ARTICULOS = [
  {
    id: 'beneficios',
    titulo: '5 beneficios del café para tu día',
    fecha: '12 de septiembre de 2026',
    imagen: 'fotos/Espresso.webp',
    resumen: 'El café no solo te despierta: consumido con moderación aporta varios beneficios reales.',
    contenido: [
      'El café es una de las bebidas más consumidas del mundo, y más allá de despertarte por las mañanas, tiene beneficios respaldados por estudios: mejora la concentración, aporta antioxidantes y puede elevar tu estado de ánimo.',
      'Un consumo moderado (1 a 3 tazas diarias) se asocia a menor riesgo de ciertas enfermedades, mejor rendimiento físico y una digestión más ágil. La clave está en la cantidad y en no agregarle demasiados azúcares.',
      'En Chascone Café preparamos cada taza con granos cuidados y métodos que resaltan el sabor natural del café, para que disfrutes su sabor pleno.'
    ]
  },
  {
    id: 'primer-metodo',
    titulo: 'Cómo elegir tu primer método de preparación',
    fecha: '5 de septiembre de 2026',
    imagen: 'fotos/Prensa Francesa 500 ml.webp',
    resumen: 'Prensa francesa, moka o goteo: te contamos cuál se ajusta mejor a ti y a tu presupuesto.',
    contenido: [
      'Si partes tu camino en el café de especialidad, la pregunta más común es: ¿qué método compro primero?',
      'La prensa francesa es la más accesible y tolerante: solo necesitas café molido grueso y agua caliente. La cafetera moka entrega una taza intensa al estilo italiano sin máquinas caras. El método de goteo (pour over) da el mayor control del sabor, aunque exige más práctica.',
      'Recomendamos empezar por una prensa francesa de 500 ml: es barata, fácil de limpiar y te enseña a apreciar las notas del grano.'
    ]
  },
  {
    id: 'espresso',
    titulo: 'El espresso: la base de todo',
    fecha: '28 de agosto de 2026',
    imagen: 'fotos/Cafetera Moka 6 tazas.webp',
    resumen: 'Capping de leche, americano, cortado: todo nace de una base de espresso bien logrado.',
    contenido: [
      'Un buen espresso es la columna vertebral de la mayoría de las bebidas de una cafetería: cappuccino, café con leche, americano o cortado.',
      'Sus claves son tres: una molienda fina y pareja, una dosis justa de café y una extracción en 25 a 30 segundos con agua a unos 90 °C.',
      'En Chascone Café cuidamos cada base de espresso porque sabemos que de ella depende el resto de tu bebida.'
    ]
  },
  {
    id: 'datos-curiosos',
    titulo: '10 datos curiosos del café que no conocías',
    fecha: '20 de agosto de 2026',
    imagen: 'fotos/Cortado.jpg',
    resumen: 'Del origen del nombre a cuántas tazas se toman al día: datos para sorprender.',
    contenido: [
      'El café es la segunda bebida más consumida del planeta después del agua.',
      'La palabra "café" proviene del árabe "qahwa", que significa "vino del grano".',
      'El árbol de café puede vivir más de 100 años y produce su fruta (la cereza) durante décadas.',
      'Un solo árbol produce, en promedio, menos de 1 kilogramo de café verde al año.',
      'Se estima que en el mundo se consumen más de 2.000 millones de tazas de café cada día.',
      'El espresso no tiene menos cafeína que el café de filtro por taza; de hecho, suele tener solo un poco menos.',
      'La cafeína actúa entre 20 y 30 minutos después de tomarla y su efecto dura entre 3 y 5 horas.',
      'Chile tiene clima apto para el café en Isla de Pascua, pero la mayoría del que consumimos es importado.',
      'El café tostado empieza a perder aroma apenas es molido, por eso recomendamos moler justo antes de preparar.',
      'Una buena taza depende 70% del agua: siempre usa agua filtrada.'
    ]
  }
];

function renderizarBlog() {
  const contenedor = document.getElementById('listaBlog');
  let html = '<div class="row g-4">';
  ARTICULOS.forEach(function (a) {
    html += '<div class="col-md-6 col-lg-4">' +
      '<div class="card h-100">' +
      '<div class="img-placeholder"><img src="' + a.imagen + '" alt="' + a.titulo + '" class="img-fluid"></div>' +
      '<div class="card-body d-flex flex-column">' +
      '<span class="text-muted small mb-1">' + a.fecha + '</span>' +
      '<h5 class="card-title">' + a.titulo + '</h5>' +
      '<p class="card-text text-muted">' + a.resumen + '</p>' +
      '<button class="btn btn-outline-primary mt-auto" onclick="verArticulo(\'' + a.id + '\')">Leer más</button>' +
      '</div></div></div>';
  });
  html += '</div>';
  contenedor.innerHTML = html;
}

function verArticulo(id) {
  const articulo = ARTICULOS.find(function (a) { return a.id === id; });
  if (!articulo) return;

  let htmlParrafos = '';
  articulo.contenido.forEach(function (p) {
    htmlParrafos += '<p>' + p + '</p>';
  });

  document.getElementById('listaBlog').style.display = 'none';
  const contenedor = document.getElementById('articuloBlog');
  contenedor.style.display = 'block';
  contenedor.innerHTML =
    '<button class="btn btn-outline-secondary mb-4" onclick="volverBlog()">← Volver al blog</button>' +
    '<article class="card card-body border-0 shadow-sm">' +
    '<span class="text-muted small mb-1">' + articulo.fecha + '</span>' +
    '<h1 class="mb-3">' + articulo.titulo + '</h1>' +
    '<img src="' + articulo.imagen + '" alt="' + articulo.titulo + '" class="img-fluid rounded-3 mb-3" style="max-height:350px;object-fit:cover;">' +
    htmlParrafos +
    '</article>';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function volverBlog() {
  document.getElementById('articuloBlog').style.display = 'none';
  document.getElementById('listaBlog').style.display = 'block';
  renderizarBlog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
  renderizarBlog();
});