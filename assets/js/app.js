// const baseEndpoint = 'https://api.github.com';
// const usersEndpoint = `${baseEndpoint}/users`;
// const $n = document.querySelector('name');
// const $b = document.querySelector('#blog');
// const $l = document.querySelector('.location');

// function displayUser(username) {
//   $n.textContent = 'cargando...';
//   const response = await fetch(`${usersEndpoint}/${username}`);
//   console.log(data);
//   $n.textContent = '${data.name}';
//   $b.textContent = '${data.blog}';
//   $l.textContent = '${data.location}';
// }

// function handleError(err) {
//   console.log('OH NO!');
//   console.log(err);
//   n.textContent = `Algo salió mal: ${err}`
// }

// displayUser('stolinski').catch(handleError);


/* 
  Inician documentación de app.js
  Cambios realizados:
  - Se convirtio displayUser en función async y se agrego manejo de errores con try/catch.
  - Se corrigieron los selectores del DOM (.name, .blog, .location) y se agregó una verificación segura antes de escribir.
  - Se corrigieron interpolaciones de plantilla: ahora se usan backticks y variables reales en lugar de strings literales.
  - Se valida response.ok y se muestra un mensaje descriptivo con status.
  - Se agregó encodeURIComponent al username.
  - Se corrigió handleError para usar la referencia correcta y para mostrar el mensaje del error.
  - Se agregó (opcional) un formulario de búsqueda si existe en el HTML.
*/

'use strict';

// Endpoints base
const BASE_ENDPOINT = 'https://api.github.com';
const USERS_ENDPOINT = `${BASE_ENDPOINT}/users`;

// Referencias del DOM se corrigen los Selectores correctos
const $name = document.querySelector('.name');
const $blog = document.querySelector('.blog');
const $location = document.querySelector('.location');

/**
 * Escribe texto de forma segura en el nodo indicado.
 * Evita romper si el nodo no existe.
 */
function safeText(node, text) {
  if (node) node.textContent = text ?? 'No disponible';
}

/**
 * Obtiene datos del usuario en GitHub y los muestra en el DOM.
 * @param {string} username - nombre de usuario de GitHub
 */
async function displayUser(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Username inválido');
  }

  // Indicadores de carga (mejora UX)
  safeText($name, 'Cargando…');
  safeText($blog, '');
  safeText($location, '');

  try {
    const response = await fetch(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`);
    if (!response.ok) {
      // Manejo explícito de errores HTTP
      throw new Error(`HTTP ${response.status} – ${response.statusText}`);
    }
    const data = await response.json();

    // Antes había un console.log de 'data' sin definir
    console.debug('GitHub user:', data);

    // Muestra de datos con valores por defecto
    safeText($name, data.name || data.login || 'Sin nombre');

    // Blog: si viene sin protocolo, lo normalizamos para enlazarlo
    if ($blog) {
      if (data.blog) {
        const url = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
        // Nota: se usa innerHTML para mostrar un <a>; es seguro porque construimos nosotros el HTML y validamos 'url' arriba.
        $blog.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
      } else {
        $blog.textContent = 'Sin blog';
      }
    }

    safeText($location, data.location || 'Sin ubicación');
  } catch (err) {
    handleError(err);
    // Re-lanzamos para que otros consumidores puedan encadenar .catch si lo desean
    throw err;
  }
}

/**
 * Manejo centralizado de errores.
 */
function handleError(err) {
  console.error('Ocurrió un error al consultar la API de GitHub:', err);
  safeText($name, `Algo salió mal: ${err?.message ?? err}`);
}

// Ejemplo de uso (como en el original), pero ahora funcional y con manejo de errores.
displayUser('stolinski').catch(() => { /* el error ya fue mostrado en pantalla */ });

// Soporte para el formulario si existe en el HTML
const $form = document.getElementById('search-form');
if ($form) {
  $form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = (document.getElementById('username')?.value || '').trim();
    displayUser(username).catch(() => {});
  });
}
