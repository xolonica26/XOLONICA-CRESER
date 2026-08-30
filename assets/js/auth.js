/**
 * ============================================================================
 * CreSer — Lógica de Interacción del Módulo de Acceso y Registro (auth.js)
 * ============================================================================
 * Este archivo gestiona la interacción del formulario glassmorphic:
 * 1. Alternancia dinámica entre las pestañas "Iniciar Sesión" y "Crear Cuenta".
 * 2. Cierre y apertura interactiva de la tarjeta de autenticación.
 * 3. Captura y almacenamiento demostrativo del usuario en localStorage.
 * ============================================================================
 */

// Se ejecuta al cargar el contenido del DOM
document.addEventListener('DOMContentLoaded', () => {
  // Referencia al contenedor principal del formulario
  const creserForm = document.querySelector('.Creserform');
  // Enlace dentro del formulario para cambiar a registro
  const registerLink = document.querySelector('.register-link');
  // Enlace dentro del formulario para cambiar a inicio de sesión
  const loginLink = document.querySelector('.login-link');
  // Botón de pestaña "Iniciar Sesión"
  const tabLogin = document.getElementById('tabLogin');
  // Botón de pestaña "Crear Cuenta"
  const tabRegister = document.getElementById('tabRegister');
  // Botón en la cabecera superior para reabrir el formulario
  const btnHeaderAuth = document.getElementById('headerAuthBtn');
  // Botón con ícono '✕' para cerrar la tarjeta de acceso
  const closeBtn = document.getElementById('closeFormBtn');

  // Función para activar la vista de Registro
  function showRegister() {
    if (creserForm) {
      // Agrega la clase 'active' que muestra la caja de registro y oculta la de login
      creserForm.classList.add('active');
    }
    // Marca la pestaña de registro como activa
    if (tabRegister) tabRegister.classList.add('active');
    // Desmarca la pestaña de inicio de sesión
    if (tabLogin) tabLogin.classList.remove('active');
  }

  // Función para activar la vista de Inicio de Sesión
  function showLogin() {
    if (creserForm) {
      // Remueve la clase 'active' para volver a la vista de login
      creserForm.classList.remove('active');
    }
    // Marca la pestaña de login como activa
    if (tabLogin) tabLogin.classList.add('active');
    // Desmarca la pestaña de registro
    if (tabRegister) tabRegister.classList.remove('active');
  }

  // Asigna el evento al enlace de registro
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault(); // Evita navegación por defecto
      showRegister();
    });
  }

  // Asigna el evento al enlace de inicio de sesión
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault(); // Evita navegación por defecto
      showLogin();
    });
  }

  // Asigna el evento a la pestaña de registro
  if (tabRegister) {
    tabRegister.addEventListener('click', () => {
      showRegister();
    });
  }

  // Asigna el evento a la pestaña de login
  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      showLogin();
    });
  }

  // Botón de cabecera para abrir el formulario
  if (btnHeaderAuth) {
    btnHeaderAuth.addEventListener('click', () => {
      if (creserForm) {
        creserForm.style.display = 'block';
        creserForm.classList.add('active-btn');
      }
      btnHeaderAuth.classList.add('hidden');
    });
  }

  // Botón de cierre '✕'
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (creserForm) {
        creserForm.style.display = 'none';
      }
      if (btnHeaderAuth) {
        btnHeaderAuth.classList.remove('hidden');
      }
    });
  }

  // Validación y captura demostrativa de datos al enviar los formularios
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  // Al enviar el formulario de login
  if (formLogin) {
    formLogin.addEventListener('submit', () => {
      const email = document.getElementById('loginEmail')?.value;
      if (email) {
        // Almacena el correo para personalizar la sesión local
        localStorage.setItem('creser-user-email', email);
      }
    });
  }

  // Al enviar el formulario de registro
  if (formRegister) {
    formRegister.addEventListener('submit', () => {
      const name = document.getElementById('regName')?.value;
      if (name) {
        // Almacena el nombre para personalizar la bienvenida
        localStorage.setItem('creser-user-name', name);
      }
    });
  }
});