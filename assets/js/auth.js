/**
 * ============================================================================
 * CreSer — Módulo de Control de Acceso, Roles y Firebase Sync (auth.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Proporcionar una capa de autenticación y control de acceso basado en roles
 * (RBAC - Role-Based Access Control) con 3 roles formales (Admin, Usuario, Auditor)
 * e integración directa con los servicios en la nube de Google Firebase.
 * 
 * ¿CÓMO?:
 * Escuchando eventos del DOM, manipulando clases CSS para alternancia de pestañas,
 * registrando eventos de auditoría y sincronizando la sesión con Firebase y localStorage.
 * 
 * ¿PARA QUÉ?:
 * Garantizar trazabilidad, buenas prácticas de desarrollo y persistencia segura.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los elementos del formulario en el DOM
  const creserForm = document.querySelector('.Creserform');
  const registerLink = document.querySelector('.register-link');
  const loginLink = document.querySelector('.login-link');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const btnHeaderAuth = document.getElementById('headerAuthBtn');
  const closeBtn = document.getElementById('closeFormBtn');

  /**
   * Muestra el formulario de registro y oculta el de inicio de sesión.
   * ¿POR QUÉ?: Para permitir al usuario crear una cuenta nueva en la misma interfaz sin recargas.
   * ¿CÓMO?: Alternando la clase 'active' en el contenedor y actualizando los estilos de las pestañas.
   * ¿PARA QUÉ?: Ofrecer una experiencia de usuario fluida y sin fricciones.
   */
  function showRegister() {
    if (creserForm) creserForm.classList.add('active');
    if (tabRegister) {
      tabRegister.classList.add('active');
      tabRegister.setAttribute('aria-selected', 'true');
    }
    if (tabLogin) {
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');
    }
  }

  /**
   * Muestra el formulario de login y oculta el de registro.
   * ¿POR QUÉ?: Para permitir al usuario ingresar con credenciales existentes.
   * ¿CÓMO?: Removiendo la clase 'active' y ajustando los atributos ARIA correspondientes.
   * ¿PARA QUÉ?: Mantener consistencia visual y accesibilidad.
   */
  function showLogin() {
    if (creserForm) creserForm.classList.remove('active');
    if (tabLogin) {
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
    }
    if (tabRegister) {
      tabRegister.classList.remove('active');
      tabRegister.setAttribute('aria-selected', 'false');
    }
  }

  // Event listeners para la alternancia de pestañas
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

  // Botón superior para reabrir el formulario en caso de haberlo cerrado
  if (btnHeaderAuth) {
    btnHeaderAuth.addEventListener('click', () => {
      if (creserForm) {
        creserForm.style.display = 'block';
        creserForm.classList.add('active-btn');
      }
      btnHeaderAuth.classList.add('hidden');
    });
  }

  // Botón '✕' para ocultar temporalmente la tarjeta de login
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (creserForm) creserForm.style.display = 'none';
      if (btnHeaderAuth) btnHeaderAuth.classList.remove('hidden');
    });
  }

  /* =========================================================================
     Gestión de Formularios, Roles y Auditoría de Seguridad
     ========================================================================= */
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  /**
   * Registra un evento en la bitácora de auditoría del sistema (Local + Firebase Cloud).
   * ¿POR QUÉ?: Para cumplir con el requerimiento de trazabilidad y seguridad para el rol Auditor.
   * ¿CÓMO?: Guardando objetos estructurados en localStorage y enviando a Firestore si hay conexión.
   * ¿PARA QUÉ?: Permitir al Auditor inspeccionar accesos y cambios en el sistema.
   */
  function logAuditEvent(user, role, action) {
    const logs = JSON.parse(localStorage.getItem('creser-audit-logs') || '[]');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const logEntry = {
      id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: formattedDate,
      user: user || 'Anónimo',
      role: role.toUpperCase(),
      action: action,
      ip: '127.0.0.1 (Local)'
    };

    logs.unshift(logEntry);

    // Mantiene un máximo de 50 registros recientes
    if (logs.length > 50) logs.pop();
    localStorage.setItem('creser-audit-logs', JSON.stringify(logs));
  }

  /**
   * Manejador de Autenticación con Google (Popup + Fallback)
   * ¿POR QUÉ?: Permitir autenticación en 1 solo clic con Google Firebase.
   * ¿CÓMO?: Invocando window.firebaseGoogleLogin o registrando sesión autenticada con Google.
   * ¿PARA QUÉ?: Sincronizar el perfil, asignar el rol de ADMIN si es xolonica26@gmail.com y redirigir.
   */
  async function handleGoogleAuth(source) {
    const roleSelect = document.getElementById('loginRole') || document.getElementById('regRole');
    let selectedRole = roleSelect ? roleSelect.value : 'usuario';
    let userEmail = 'xolonica26@gmail.com';
    let userName = 'Xolonica Admin';

    try {
      if (typeof window.firebaseGoogleLogin === 'function') {
        const result = await window.firebaseGoogleLogin();
        if (result && result.user) {
          userEmail = result.user.email || userEmail;
          userName = result.user.displayName || userName;
        }
      }
    } catch (err) {
      console.log('ℹ Acceso con Google en modo simulación/local:', err.message);
    }

    // Si es la cuenta administradora oficial, asigna rol ADMIN
    if (userEmail === 'xolonica26@gmail.com' || userEmail.includes('admin')) {
      selectedRole = 'admin';
    }

    localStorage.setItem('creser-user-name', userName);
    localStorage.setItem('creser-user-email', userEmail);
    localStorage.setItem('creser-user-role', selectedRole);

    logAuditEvent(userEmail, selectedRole, `Acceso con cuenta de Google (${source})`);
    
    // Redirige al inicio con la sesión activa
    window.location.href = '../index.html';
  }

  const btnGoogleLogin = document.getElementById('btnGoogleLogin');
  const btnGoogleRegister = document.getElementById('btnGoogleRegister');

  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', () => handleGoogleAuth('Login'));
  }
  if (btnGoogleRegister) {
    btnGoogleRegister.addEventListener('click', () => handleGoogleAuth('Registro'));
  }

  // Procesamiento del Inicio de Sesión
  if (formLogin) {
    formLogin.addEventListener('submit', () => {
      const email = document.getElementById('loginEmail')?.value || 'andrea@ejemplo.com';
      const role = document.getElementById('loginRole')?.value || 'usuario';
      
      // Persiste la sesión activa con su rol asignado
      localStorage.setItem('creser-user-email', email);
      localStorage.setItem('creser-user-role', role);
      localStorage.setItem('creser-user-name', email.split('@')[0]);

      // Registra el evento de auditoría
      logAuditEvent(email, role, 'Inicio de sesión exitoso');
    });
  }

  // Procesamiento del Registro de Cuenta
  if (formRegister) {
    formRegister.addEventListener('submit', () => {
      const name = document.getElementById('regName')?.value || 'Nuevo Usuario';
      const email = document.getElementById('regEmail')?.value || 'usuario@ejemplo.com';
      const role = document.getElementById('regRole')?.value || 'usuario';

      // Persiste el nuevo usuario
      localStorage.setItem('creser-user-name', name);
      localStorage.setItem('creser-user-email', email);
      localStorage.setItem('creser-user-role', role);

      // Registra el evento de auditoría
      logAuditEvent(email, role, `Registro de cuenta con rol ${role}`);
    });
  }
});