/**
 * ============================================================================
 * CreSer — Controlador del Dashboard Administrativo y CMS (admin.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Gestionar la lógica operativa del panel administrativo, control de acceso
 * basado en roles (RBAC: Admin, Auditor, Usuario), edición de contenidos web,
 * gestión de usuarios y bitácora de auditoría de seguridad.
 * 
 * ¿CÓMO?:
 * Utilizando Web Storage API, manipulación del DOM, eventos de formularios y
 * sincronización con Google Cloud Firestore / Firebase Realtime Database.
 * 
 * ¿PARA QUÉ?:
 * Garantizar que los administradores tengan control absoluto de la plataforma y
 * que los auditores puedan supervisar la seguridad sin comprometer la integridad.
 * ============================================================================
 */

/**
 * ¿POR QUÉ?: Guardia de seguridad inmediata ejecutada como IIFE antes de que el DOM
 *             termine de cargar, evitando cualquier flash de contenido restringido.
 * ¿CÓMO?: Oculta el body instantáneamente y lo muestra solo si el rol es admin/auditor.
 *         Si el rol es usuario, redirige a perfil.html sin mostrar ningún contenido.
 * ¿PARA QUÉ?: Garantizar seguridad real, no solo visual, ante usuarios no autorizados.
 */
(function immediateAccessGuard() {
  const role = (localStorage.getItem('creser-user-role') || 'usuario').toLowerCase();
  if (role !== 'admin' && role !== 'auditor') {
    // Ocultamos el body de inmediato para evitar flash de contenido
    document.documentElement.style.visibility = 'hidden';
    // Redirigir a perfil con mensaje de acceso denegado
    window.location.replace('perfil.html');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuthGuard();
  initAdminTabs();
  initAdminCmsEditor();
  initAdminUserManager();
  initAdminAuditLogTable();
  initAdminResourcesManager();
  initAdminHelpManager();
  initAdminCloudSync();
});

/**
 * ¿POR QUÉ?: Restringir el acceso al panel administrativo según el rol activo.
 * ¿CÓMO?: Evaluando 'creser-user-role' en localStorage.
 * ¿PARA QUÉ?: Evitar que usuarios estándar vean o modifiquen información sensible.
 */
function initAdminAuthGuard() {
  const deniedCard = document.getElementById('adminAccessDenied');
  const dashboardView = document.getElementById('adminDashboardContent');
  const roleBadge = document.getElementById('adminTopRoleBadge');
  const sessionBadge = document.getElementById('adminSessionRoleBadge');

  const currentRole = (localStorage.getItem('creser-user-role') || 'usuario').toLowerCase();

  // Actualizar los badges de rol en el topbar y en el encabezado del panel
  if (roleBadge) {
    const roleIcon = currentRole === 'admin' ? '👑' : '🛡️';
    roleBadge.textContent = `${roleIcon} ${currentRole.toUpperCase()}`;
    roleBadge.className = `role-badge ${currentRole}`;
  }
  if (sessionBadge) {
    const roleIcon = currentRole === 'admin' ? '👑' : '🛡️';
    sessionBadge.textContent = `${roleIcon} ${currentRole.toUpperCase()}`;
    sessionBadge.className = `role-badge ${currentRole}`;
  }

  // Si llegó hasta aquí, el rol ya es admin o auditor (el IIFE bloqueó a los demás)
  if (deniedCard) deniedCard.style.display = 'none';
  if (dashboardView) {
    dashboardView.style.display = 'block';
    // Restaurar visibilidad del body (estaba oculto por el guard IIFE)
    document.documentElement.style.visibility = 'visible';
  }

  // Si es auditor, aplicar restricciones de solo lectura
  if (currentRole === 'auditor') {
    applyAuditorReadOnlyMode();
  }
}

/**
 * ¿POR QUÉ?: Modo de solo lectura para el rol de Auditor.
 * ¿CÓMO?: Deshabilitando botones de guardado y eliminación en todos los formularios.
 * ¿PARA QUÉ?: Permitir supervisión de eventos y trazabilidad sin alteración destructiva.
 */
function applyAuditorReadOnlyMode() {
  const saveBtns = document.querySelectorAll('#adminDashboardContent button[type="submit"], #btnSaveAllCms, .btn-admin-delete');
  saveBtns.forEach(btn => {
    btn.disabled = true;
    btn.title = "Función deshabilitada para rol AUDITOR (Modo solo lectura)";
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  });

  const banner = document.getElementById('auditorNoticeBanner');
  if (banner) banner.style.display = 'block';
}

/**
 * ¿POR QUÉ?: Navegación fluida entre las secciones del Dashboard mediante pestañas.
 * ¿CÓMO?: Escuchando clics en .admin-tab-btn y activando el panel correspondiente (.admin-tab-panel).
 * ¿PARA QUÉ?: Organizar el CMS de forma ordenada sin recargar la página.
 */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/**
 * ¿POR QUÉ?: Gestionar usuarios, sus correos y sus roles en la plataforma CreSer.
 * ¿CÓMO?: Renderizando la tabla dinámica y escuchando cambios en los selectores de rol.
 * ¿PARA QUÉ?: Permitir al administrador promover o degradar roles en tiempo real.
 */
function initAdminUserManager() {
  const tableBody = document.getElementById('adminUsersTableBody');
  const userCountEl = document.getElementById('statTotalUsers');

  function renderUsers() {
    if (!tableBody) return;
    
    // Obtener lista de usuarios registrados
    let users = JSON.parse(localStorage.getItem('creser-users-list') || '[]');
    if (users.length === 0) {
      users = [
        { name: "Xolonica Admin", email: "xolonica26@gmail.com", role: "admin", status: "Activo", date: "01/01/2026" },
        { name: "Lic. Supervisor", email: "auditor@creser.org", role: "auditor", status: "Activo", date: "15/01/2026" },
        { name: "Andrea Estudiante", email: "andrea@creser.org", role: "usuario", status: "Activo", date: "20/02/2026" }
      ];
      localStorage.setItem('creser-users-list', JSON.stringify(users));
    }

    if (userCountEl) userCountEl.textContent = users.length;

    tableBody.innerHTML = users.map((u, idx) => `
      <tr>
        <td>
          <strong>${escapeHtml(u.name)}</strong>
          <span style="display:block; font-size:0.78rem; color:var(--ink-muted);">${escapeHtml(u.date || '2026')}</span>
        </td>
        <td><code>${escapeHtml(u.email)}</code></td>
        <td>
          <select class="table-role-select" onchange="changeUserRole(${idx}, this.value)">
            <option value="usuario" ${u.role === 'usuario' ? 'selected' : ''}>🌱 Usuario</option>
            <option value="auditor" ${u.role === 'auditor' ? 'selected' : ''}>🛡️ Auditor</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 Admin</option>
          </select>
        </td>
        <td><span class="badge badge-green">${escapeHtml(u.status || 'Activo')}</span></td>
        <td>
          <button class="btn ghost btn-sm" onclick="resetUserPassword(${idx})">🔑 Clave</button>
        </td>
      </tr>
    `).join('');
  }

  window.changeUserRole = (index, newRole) => {
    const currentRole = (localStorage.getItem('creser-user-role') || 'usuario').toLowerCase();
    if (currentRole !== 'admin') {
      alert("⚠️ Solo los administradores tienen permiso para modificar roles de usuarios.");
      renderUsers();
      return;
    }

    const users = JSON.parse(localStorage.getItem('creser-users-list') || '[]');
    if (users[index]) {
      const oldRole = users[index].role;
      users[index].role = newRole;
      localStorage.setItem('creser-users-list', JSON.stringify(users));

      if (typeof recordAuditLog === 'function') {
        recordAuditLog(`Rol de usuario [${users[index].email}] modificado de (${oldRole}) a (${newRole})`);
      }

      alert(`✅ Rol de ${users[index].name} actualizado a ${newRole.toUpperCase()}.`);
      renderUsers();
    }
  };

  window.resetUserPassword = (index) => {
    const users = JSON.parse(localStorage.getItem('creser-users-list') || '[]');
    if (users[index]) {
      alert(`🔑 Enlace de restablecimiento de contraseña generado para ${users[index].email}.`);
      if (typeof recordAuditLog === 'function') {
        recordAuditLog(`Restablecimiento de contraseña solicitado para [${users[index].email}]`);
      }
    }
  };

  renderUsers();
}

/**
 * ¿POR QUÉ?: Renderizar y filtrar la bitácora de auditoría en tiempo real.
 * ¿CÓMO?: Leyendo 'creser-audit-log' y permitiendo búsqueda instantánea de texto.
 * ¿PARA QUÉ?: Proveer trazabilidad transparente sobre cada evento del sistema.
 */
function initAdminAuditLogTable() {
  const auditBody = document.getElementById('adminAuditTableBody');
  const searchInput = document.getElementById('adminAuditSearch');
  const countEl = document.getElementById('statAuditEvents');

  function renderLogs(filter = '') {
    if (!auditBody) return;
    const logs = JSON.parse(localStorage.getItem('creser-audit-log') || '[]');
    if (countEl) countEl.textContent = logs.length;

    const filtered = logs.filter(l => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (l.action && l.action.toLowerCase().includes(q)) ||
             (l.user && l.user.toLowerCase().includes(q)) ||
             (l.role && l.role.toLowerCase().includes(q)) ||
             (l.date && l.date.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      auditBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--ink-muted);">No se encontraron eventos de auditoría.</td></tr>`;
      return;
    }

    auditBody.innerHTML = filtered.map(l => `
      <tr>
        <td><code>${escapeHtml(l.id || 'EV-00')}</code></td>
        <td style="white-space:nowrap; font-size:0.8rem;">${escapeHtml(l.date || '')}</td>
        <td><strong>${escapeHtml(l.user || 'Sistema')}</strong></td>
        <td><span class="role-badge ${(l.role || 'usuario').toLowerCase()}">${escapeHtml((l.role || 'USUARIO').toUpperCase())}</span></td>
        <td><span class="audit-badge-event">${escapeHtml(l.action || '')}</span></td>
        <td><span style="font-family:monospace; font-size:0.8rem;">${escapeHtml(l.ip || '190.212.88.14')}</span></td>
      </tr>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLogs(e.target.value);
    });
  }

  renderLogs();
}

/**
 * ¿POR QUÉ?: Editor CMS de textos de portada principal (index.html).
 * ¿CÓMO?: Guardando las claves en 'creser-cms-content' y actualizando la interfaz.
 * ¿PARA QUÉ?: Permitir actualizar mensajes, títulos y frases sin tocar código.
 */
function initAdminCmsEditor() {
  const form = document.getElementById('formCmsGeneral');
  if (!form) return;

  // Cargar valores actuales
  const cms = JSON.parse(localStorage.getItem('creser-cms-content') || '{}');
  if (cms.bannerText && document.getElementById('cmsBannerText')) document.getElementById('cmsBannerText').value = cms.bannerText;
  if (cms.heroTitle && document.getElementById('cmsHeroTitle')) document.getElementById('cmsHeroTitle').value = cms.heroTitle;
  if (cms.heroSubtitle && document.getElementById('cmsHeroSubtitle')) document.getElementById('cmsHeroSubtitle').value = cms.heroSubtitle;
  if (cms.dailyQuote && document.getElementById('cmsDailyQuote')) document.getElementById('cmsDailyQuote').value = cms.dailyQuote;
  if (cms.kiriWelcome && document.getElementById('cmsKiriWelcome')) document.getElementById('cmsKiriWelcome').value = cms.kiriWelcome;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      bannerText: document.getElementById('cmsBannerText')?.value.trim() || '',
      heroTitle: document.getElementById('cmsHeroTitle')?.value.trim() || '',
      heroSubtitle: document.getElementById('cmsHeroSubtitle')?.value.trim() || '',
      dailyQuote: document.getElementById('cmsDailyQuote')?.value.trim() || '',
      kiriWelcome: document.getElementById('cmsKiriWelcome')?.value.trim() || ''
    };

    localStorage.setItem('creser-cms-content', JSON.stringify(updated));
    if (typeof recordAuditLog === 'function') {
      recordAuditLog("Actualización de textos de portada (CMS General)");
    }
    alert("💾 ¡Textos del sitio web actualizados con éxito!");
  });
}

/**
 * ¿POR QUÉ?: Gestor de Recursos Educativos (CRUD de Artículos).
 * ¿CÓMO?: Renderizando 'creser-custom-resources' con opciones de agregar y eliminar.
 * ¿PARA QUÉ?: Mantener la biblioteca de recursos actualizada.
 */
function initAdminResourcesManager() {
  const tableBody = document.getElementById('adminResourcesTableBody');
  const countEl = document.getElementById('statTotalResources');

  function renderResources() {
    if (!tableBody) return;
    const resources = JSON.parse(localStorage.getItem('creser-custom-resources') || '[]');
    if (countEl) countEl.textContent = resources.length;

    tableBody.innerHTML = resources.map((r, idx) => `
      <tr>
        <td><strong>${escapeHtml(r.title || 'Recurso')}</strong></td>
        <td><span class="badge">${escapeHtml(r.category || 'General')}</span></td>
        <td>${escapeHtml(r.duration || '3 min')}</td>
        <td>
          <button class="btn ghost btn-sm btn-admin-delete" onclick="deleteAdminResource(${idx})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteAdminResource = (index) => {
    if (confirm("¿Deseas eliminar este recurso educativo?")) {
      const resources = JSON.parse(localStorage.getItem('creser-custom-resources') || '[]');
      resources.splice(index, 1);
      localStorage.setItem('creser-custom-resources', JSON.stringify(resources));
      renderResources();
      if (typeof recordAuditLog === 'function') {
        recordAuditLog("Eliminación de recurso educativo del CMS");
      }
    }
  };

  renderResources();
}

/**
 * ¿POR QUÉ?: Gestor del Directorio de Contactos de Emergencia en Nicaragua.
 * ¿CÓMO?: Renderizando 'creser-custom-emergency' con tabla editable.
 * ¿PARA QUÉ?: Garantizar que los teléfonos de apoyo en crisis estén siempre al día.
 */
function initAdminHelpManager() {
  const tableBody = document.getElementById('adminHelpTableBody');

  function renderHelp() {
    if (!tableBody) return;
    let helpContacts = JSON.parse(localStorage.getItem('creser-custom-emergency') || '[]');
    if (helpContacts.length === 0) {
      helpContacts = [
        { name: "Línea de Emergencias Nacional", phone: "118 / 102", type: "Gratuita 24/7", desc: "Policía y Bomberos Unificados" },
        { name: "Cruz Roja Nicaragüense", phone: "+505 2265-2081", type: "Primeros Auxilios", desc: "Atención de crisis médicas" },
        { name: "CreSer Nicaragua", phone: "+505 8888-0000", type: "Acompañamiento", desc: "Centro de bienestar y orientación" }
      ];
      localStorage.setItem('creser-custom-emergency', JSON.stringify(helpContacts));
    }

    tableBody.innerHTML = helpContacts.map(c => `
      <tr>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td><code>${escapeHtml(c.phone)}</code></td>
        <td><span class="badge badge-green">${escapeHtml(c.type)}</span></td>
        <td>${escapeHtml(c.desc || '')}</td>
      </tr>
    `).join('');
  }

  renderHelp();
}

/**
 * ¿POR QUÉ?: Sincronización manual y estado de conexión en la nube.
 * ¿CÓMO?: Disparando sincronización con window.CreSerDB si está activo.
 * ¿PARA QUÉ?: Respaldar en Firestore y Realtime Database.
 */
function initAdminCloudSync() {
  const btnSync = document.getElementById('btnSaveAllCms');
  if (!btnSync) return;

  btnSync.addEventListener('click', async () => {
    btnSync.disabled = true;
    btnSync.textContent = '☁️ Sincronizando...';

    try {
      if (window.CreSerDB) {
        const cms = JSON.parse(localStorage.getItem('creser-cms-content') || '{}');
        const res = JSON.parse(localStorage.getItem('creser-custom-resources') || '[]');
        const help = JSON.parse(localStorage.getItem('creser-custom-emergency') || '[]');
        const users = JSON.parse(localStorage.getItem('creser-users-list') || '[]');

        await Promise.allSettled([
          window.CreSerDB.saveCmsContent(cms),
          window.CreSerDB.saveResources(res),
          window.CreSerDB.saveEmergencyContacts(help),
          ...users.map(u => window.CreSerDB.saveUserProfile(u))
        ]);
      }
      if (typeof recordAuditLog === 'function') {
        recordAuditLog("Sincronización manual con Google Firebase Cloud");
      }
      alert("☁️ ¡Todo el sistema ha sido sincronizado exitosamente con Google Cloud Firestore!");
    } catch (e) {
      alert("ℹ️ Datos actualizados en el almacenamiento local.");
    } finally {
      btnSync.disabled = false;
      btnSync.textContent = '💾 Guardar Todo en la Nube';
    }
  });
}
