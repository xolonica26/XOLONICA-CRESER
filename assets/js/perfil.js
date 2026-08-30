/**
 * ============================================================================
 * CreSer — Controlador del Portal de Perfil de Usuario (perfil.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Gestionar la sesión personal, preferencias de accesibilidad, métricas de actividad
 * y control de acceso al panel administrativo de forma privada y modular.
 * 
 * ¿CÓMO?:
 * Utilizando Web Storage API (localStorage), manipulación del DOM y registro de
 * auditoría para eventos de seguridad.
 * 
 * ¿PARA QUÉ?:
 * Brindar al usuario control total sobre sus datos personales y preferencias visuales.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initUserProfile();
  initProfilePreferences();
  initProfileDataManagement();
});

/**
 * ¿POR QUÉ?: Cargar y presentar la identidad, rol y acceso administrativo del usuario.
 * ¿CÓMO?: Leyendo 'creser-user-name', 'creser-user-email' y 'creser-user-role' desde localStorage.
 * ¿PARA QUÉ?: Adaptar la interfaz dinámicamente mostrando el banner de administrador solo si corresponde.
 */
function initUserProfile() {
  const nameEl = document.getElementById('profileUserName');
  const emailEl = document.getElementById('profileUserEmail');
  const roleBadgeEl = document.getElementById('profileRoleBadge');
  const avatarBox = document.getElementById('profileAvatarBox');
  const adminBanner = document.getElementById('profileAdminBanner');
  const joinDateEl = document.getElementById('profileJoinDate');
  const btnLogout = document.getElementById('profileLogoutBtn');

  const storedEmail = localStorage.getItem('creser-user-email') || 'invitado@creser.org';
  const storedName = localStorage.getItem('creser-user-name') || (storedEmail ? storedEmail.split('@')[0] : 'Usuario');
  const storedRole = (localStorage.getItem('creser-user-role') || 'usuario').toLowerCase();

  const formattedName = storedName.charAt(0).toUpperCase() + storedName.slice(1);
  const initial = formattedName.charAt(0).toUpperCase();

  // Actualizar textos e iniciales
  if (nameEl) nameEl.textContent = formattedName;
  if (emailEl) emailEl.textContent = storedEmail;
  if (avatarBox) avatarBox.textContent = initial || '👤';
  if (joinDateEl) joinDateEl.textContent = 'Miembro activo desde 2026';

  // Configurar badge de rol con estilos acordes
  if (roleBadgeEl) {
    roleBadgeEl.className = `role-badge ${storedRole}`;
    const roleIcon = storedRole === 'admin' ? '👑' : storedRole === 'auditor' ? '🛡️' : '🌱';
    roleBadgeEl.innerHTML = `${roleIcon} ${storedRole.toUpperCase()}`;
  }

  // Mostrar el banner de acceso administrativo ÚNICAMENTE a Admin y Auditor
  if (adminBanner) {
    if (storedRole === 'admin' || storedRole === 'auditor') {
      adminBanner.style.display = 'flex';
      const infoText = adminBanner.querySelector('.admin-banner-info p');
      if (infoText) {
        infoText.textContent = storedRole === 'admin' 
          ? 'Tienes permisos completos de edición CMS, gestión de usuarios y configuración.'
          : 'Tienes permisos de supervisión, bitácora de auditoría y trazabilidad de seguridad.';
      }
    } else {
      adminBanner.style.display = 'none';
    }
  }

  // Cargar métricas personales de actividad
  loadUserActivityMetrics();

  // Cerrar Sesión
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm(`¿Estás seguro/a de que deseas cerrar la sesión de ${formattedName}?`)) {
        localStorage.removeItem('creser-user-email');
        localStorage.removeItem('creser-user-name');
        localStorage.setItem('creser-user-role', 'usuario');
        if (typeof recordAuditLog === 'function') {
          recordAuditLog(`Cierre de sesión de ${formattedName} (${storedEmail})`);
        }
        window.location.href = 'login.html';
      }
    });
  }
}

/**
 * ¿POR QUÉ?: Calcular y mostrar métricas de autocuidado registradas en el dispositivo.
 * ¿CÓMO?: Contando reflexiones en 'creser-journal-entries' y pausas en 'creser-weekly-pauses'.
 * ¿PARA QUÉ?: Motivar al usuario mostrando su progreso y constancia en la plataforma.
 */
function loadUserActivityMetrics() {
  const kpiReflections = document.getElementById('userKpiReflections');
  const kpiPauses = document.getElementById('userKpiPauses');
  const kpiStreak = document.getElementById('userKpiStreak');

  const journalEntries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
  const pausesCount = localStorage.getItem('creser-weekly-pauses') || '12';

  if (kpiReflections) kpiReflections.textContent = journalEntries.length;
  if (kpiPauses) kpiPauses.textContent = pausesCount;
  if (kpiStreak) kpiStreak.textContent = '5 días';
}

/**
 * ¿POR QUÉ?: Gestionar los alternadores de Modo Oscuro y Texto Aumentado.
 * ¿CÓMO?: Sincronizando clases en el documento y guardando los estados en localStorage.
 * ¿PARA QUÉ?: Ofrecer una experiencia de lectura personalizada y accesible.
 */
function initProfilePreferences() {
  const darkSwitch = document.getElementById('profileDarkSwitch');
  const textSwitch = document.getElementById('profileTextSwitch');

  // 1. Modo Oscuro
  if (darkSwitch) {
    const isDark = localStorage.getItem('creser-dark') === '1' || document.body.classList.contains('dark');
    darkSwitch.classList.toggle('on', isDark);
    darkSwitch.setAttribute('aria-checked', isDark ? 'true' : 'false');

    darkSwitch.addEventListener('click', () => {
      const active = document.body.classList.toggle('dark');
      darkSwitch.classList.toggle('on', active);
      darkSwitch.setAttribute('aria-checked', active ? 'true' : 'false');
      localStorage.setItem('creser-dark', active ? '1' : '0');
    });
  }

  // 2. Texto Aumentado
  if (textSwitch) {
    const isLarge = localStorage.getItem('creser-large-text') === '1';
    textSwitch.classList.toggle('on', isLarge);
    textSwitch.setAttribute('aria-checked', isLarge ? 'true' : 'false');

    textSwitch.addEventListener('click', () => {
      const isCurrentlyLarge = document.documentElement.style.fontSize === '112.5%';
      if (isCurrentlyLarge) {
        document.documentElement.style.fontSize = '100%';
        textSwitch.classList.remove('on');
        textSwitch.setAttribute('aria-checked', 'false');
        localStorage.setItem('creser-large-text', '0');
      } else {
        document.documentElement.style.fontSize = '112.5%';
        textSwitch.classList.add('on');
        textSwitch.setAttribute('aria-checked', 'true');
        localStorage.setItem('creser-large-text', '1');
      }
    });
  }
}

/**
 * ¿POR QUÉ?: Permitir la descarga y borrado selectivo de datos personales.
 * ¿CÓMO?: Extrayendo todas las llaves de CreSer del localStorage o reiniciándolas.
 * ¿PARA QUÉ?: Cumplir con los derechos de privacidad y soberanía de datos del usuario.
 */
function initProfileDataManagement() {
  const btnExportData = document.getElementById('profileExportDataBtn');
  const btnClearData = document.getElementById('profileClearDataBtn');

  // Exportar todos los datos personales en archivo JSON
  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      const userPayload = {
        plataforma: "CreSer Nicaragua",
        usuario: localStorage.getItem('creser-user-name') || "Usuario",
        email: localStorage.getItem('creser-user-email') || "invitado@creser.org",
        rol: localStorage.getItem('creser-user-role') || "usuario",
        fechaExportacion: new Date().toISOString(),
        diarioEmocional: JSON.parse(localStorage.getItem('creser-journal-entries') || '[]'),
        ultimoSueno: JSON.parse(localStorage.getItem('creser-last-sleep-log') || '{}'),
        habitos: JSON.parse(localStorage.getItem('creser-wellness-habits') || '{}'),
        pausasCompletadas: localStorage.getItem('creser-weekly-pauses') || '0'
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Mis_Datos_CreSer_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      alert("📥 Copia de seguridad de tus datos descargada con éxito.");
    });
  }

  // Borrado de registros locales
  if (btnClearData) {
    btnClearData.addEventListener('click', () => {
      if (confirm("⚠️ ¿Estás seguro/a de que deseas borrar tus registros locales (diario, métricas de pausas y hábitos)? Esta acción es irreversible.")) {
        localStorage.removeItem('creser-journal-entries');
        localStorage.removeItem('creser-weekly-pauses');
        localStorage.removeItem('creser-last-sleep-log');
        localStorage.removeItem('creser-wellness-habits');
        
        loadUserActivityMetrics();
        alert("✨ Tus registros locales han sido eliminados de este navegador.");
      }
    });
  }
}
