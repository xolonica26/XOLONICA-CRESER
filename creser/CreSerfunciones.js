/**
 * CreSer — Lógica de Interacción del Módulo de Acceso y Registro
 */

document.addEventListener('DOMContentLoaded', () => {
  const creserForm = document.querySelector('.Creserform');
  const loginLink = document.querySelector('.login-link');
  const registerLink = document.querySelector('.register-link');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const btnHeaderAuth = document.getElementById('headerAuthBtn');
  const closeBtn = document.getElementById('closeFormBtn');

  function showRegister() {
    if (creserForm) {
      creserForm.classList.add('active');
    }
    if (tabRegister) tabRegister.classList.add('active');
    if (tabLogin) tabLogin.classList.remove('active');
  }

  function showLogin() {
    if (creserForm) {
      creserForm.classList.remove('active');
    }
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  }

  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegister();
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLogin();
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', () => {
      showRegister();
    });
  }

  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      showLogin();
    });
  }

  if (btnHeaderAuth) {
    btnHeaderAuth.addEventListener('click', () => {
      if (creserForm) {
        creserForm.style.display = 'block';
        creserForm.classList.add('active-btn');
      }
      btnHeaderAuth.classList.add('hidden');
    });
  }

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

  // Validaciones y feedback amigable en submit
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      const email = document.getElementById('loginEmail')?.value;
      if (email) {
        localStorage.setItem('creser-user-email', email);
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      const name = document.getElementById('regName')?.value;
      if (name) {
        localStorage.setItem('creser-user-name', name);
      }
    });
  }
});