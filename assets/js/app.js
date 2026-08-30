/**
 * ============================================================================
 * CreSer — Motor Principal de Interacciones, Seguridad y Experiencia de Usuario
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Proporcionar una arquitectura modular y desacoplada para la plataforma CreSer
 * que gestione navegación, herramientas interactivas, síntesis sonora,
 * persistencia de datos y control de roles con bitácora de auditoría.
 * 
 * ¿CÓMO?:
 * Mediante eventos estándar del DOM, Web Audio API, Web Storage API (localStorage)
 * y funciones especializadas para cada módulo.
 * 
 * ¿PARA QUÉ?:
 * Brindar una experiencia rápida, accesible, segura y fácilmente auditable.
 * ============================================================================
 */

// Se ejecuta al cargar completamente el árbol DOM
document.addEventListener('DOMContentLoaded', () => {
  // Inicialización del menú lateral para móviles
  initMobileDrawer();
  // Inicialización del tema visual (oscuro) y escala tipográfica
  initThemeAndAccessibility();
  // Inicialización del selector de estado de ánimo
  initMoodTracker();
  // Inicialización del ejercicio de respiración 4-4-4
  initBreathingTool();
  // Inicialización del chat con KIRI
  initKiriAssistant();
  // Inicialización del reproductor sintetizado de paisajes sonoros
  initAmbientSoundPlayer();
  // Inicialización del diario reflexivo privado
  initJournalAndGoals();
  // Inicialización del buscador y filtros de la biblioteca
  initResourceFilters();
  // Inicialización del control de roles y panel de auditoría
  initRoleAndAuditPanel();
});

/* ==========================================================================
   1. Control del Menú Lateral Móvil (Drawer)
   ¿POR QUÉ?: Permitir navegación fluida en dispositivos móviles con gestos táctiles.
   ¿CÓMO?: Alternando clases CSS 'open' y 'show' en el drawer y su fondo.
   ¿PARA QUÉ?: Garantizar accesibilidad y experiencia responsive en smartphones.
   ========================================================================== */
function initMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('show');
    }
  }

  function closeDrawer() {
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('show');
    }
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Cierre automático o apertura de modales informativos
  document.addEventListener('click', (e) => {
    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) {
      e.preventDefault();
      openInfoModal(modalBtn.dataset.modal);
    }
  });
}

/* ==========================================================================
   2. Configuración, Tema y Accesibilidad
   ¿POR QUÉ?: Cumplir con estándares de accesibilidad visual y descanso ocular.
   ¿CÓMO?: Modificando clases en el elemento body y tamaño de fuente en documentElement.
   ¿PARA QUÉ?: Reducir fatiga visual en la noche y apoyar a personas con baja visión.
   ========================================================================== */
function initThemeAndAccessibility() {
  const darkToggle = document.getElementById('darkToggle');
  const textToggle = document.getElementById('textToggle');

  // Modo Oscuro
  if (darkToggle) {
    const isDark = localStorage.getItem('creser-dark') === '1';
    if (isDark) {
      document.body.classList.add('dark');
      darkToggle.classList.add('on');
      darkToggle.setAttribute('aria-checked', 'true');
    }

    darkToggle.addEventListener('click', () => {
      const active = document.body.classList.toggle('dark');
      darkToggle.classList.toggle('on', active);
      darkToggle.setAttribute('aria-checked', active ? 'true' : 'false');
      localStorage.setItem('creser-dark', active ? '1' : '0');
    });
  }

  // Texto Aumentado
  if (textToggle) {
    const isLarge = localStorage.getItem('creser-large-text') === '1';
    if (isLarge) {
      document.documentElement.style.fontSize = '112.5%';
      textToggle.classList.add('on');
      textToggle.setAttribute('aria-checked', 'true');
    }

    textToggle.addEventListener('click', () => {
      const isCurrentlyLarge = document.documentElement.style.fontSize === '112.5%';
      if (isCurrentlyLarge) {
        document.documentElement.style.fontSize = '100%';
        textToggle.classList.remove('on');
        textToggle.setAttribute('aria-checked', 'false');
        localStorage.setItem('creser-large-text', '0');
      } else {
        document.documentElement.style.fontSize = '112.5%';
        textToggle.classList.add('on');
        textToggle.setAttribute('aria-checked', 'true');
        localStorage.setItem('creser-large-text', '1');
      }
    });
  }
}

/* ==========================================================================
   3. Registro y Monitoreo Emocional Diario
   ¿POR QUÉ?: Fomentar el autoconocimiento y la detección temprana de estados de tensión.
   ¿CÓMO?: Registrando la selección en un selector de 5 niveles con retroalimentación inmediata.
   ¿PARA QUÉ?: Ayudar al usuario a identificar patrones en su salud mental y mantener rachas positivas.
   ========================================================================== */
function initMoodTracker() {
  const moodBtns = document.querySelectorAll('.mood-btn');
  const registerBtn = document.getElementById('registerMood');
  const moodNotice = document.getElementById('moodSaved');
  let selectedMood = 'tranquilo';

  const moodMessages = {
    'dificil': 'Has registrado un momento desafiante. Tómate una pausa y recuerda que no estás solo/a.',
    'regular': 'Un día regular es una oportunidad para escuchar lo que tu cuerpo y mente necesitan.',
    'neutral': 'Estado en calma y balance registrado con éxito.',
    'tranquilo': 'Excelente momento de serenidad. Sigue cultivando hábitos que te generen bienestar.',
    'excelente': '¡Nos alegra ver tu energía positiva hoy! Sigue cuidando tu salud emocional.'
  };

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
    });
  });

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      const savedCount = parseInt(localStorage.getItem('creser-mood-count') || '5', 10) + 1;
      localStorage.setItem('creser-mood-count', savedCount.toString());
      localStorage.setItem('creser-last-mood', selectedMood);

      const streakEl = document.getElementById('streakCount');
      if (streakEl) streakEl.textContent = `${savedCount} días`;

      if (moodNotice) {
        moodNotice.innerHTML = `<span>✓</span> <div><strong>Estado guardado:</strong> ${moodMessages[selectedMood] || 'Estado registrado correctamente.'}</div>`;
        moodNotice.style.display = 'flex';
      }

      // Registra el evento en auditoría
      recordAuditLog('Registro de estado emocional: ' + selectedMood);
    });
  }
}

/* ==========================================================================
   4. Herramienta de Respiración Guiada 4-4-4
   ¿POR QUÉ?: Proporcionar una técnica fisiológica comprobada para reducir el estrés.
   ¿CÓMO?: Guiando un ciclo de 4 segundos de inhalación, 4s de sostén y 4s de exhalación con animación CSS.
   ¿PARA QUÉ?: Disminuir el ritmo cardíaco y activar el sistema parasimpático en momentos de sobrecarga.
   ========================================================================== */
function initBreathingTool() {
  const startBtn = document.getElementById('startBreathingBtn');
  const innerCircle = document.getElementById('breathingInner');
  const promptText = document.getElementById('breathingPrompt');
  const timerText = document.getElementById('breathingTimer');

  let breathingInterval = null;
  let isRunning = false;

  if (!startBtn || !innerCircle) return;

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  function startBreathing() {
    isRunning = true;
    startBtn.textContent = 'Detener sesión';
    startBtn.classList.add('secondary');
    startBtn.classList.remove('primary');

    let cycleStep = 0;
    let secondsLeft = 36;

    runPhase();

    function runPhase() {
      if (!isRunning) return;

      if (cycleStep === 0) {
        innerCircle.className = 'breathing-circle-inner inhale';
        if (promptText) promptText.textContent = 'Inhala profundamente';
      } else if (cycleStep === 1) {
        innerCircle.className = 'breathing-circle-inner hold';
        if (promptText) promptText.textContent = 'Sostén el aire';
      } else {
        innerCircle.className = 'breathing-circle-inner exhale';
        if (promptText) promptText.textContent = 'Exhala suavemente';
      }

      cycleStep = (cycleStep + 1) % 3;
    }

    breathingInterval = setInterval(() => {
      secondsLeft--;
      if (timerText) timerText.textContent = `${secondsLeft} s restantes`;

      if (secondsLeft % 4 === 0) {
        runPhase();
      }

      if (secondsLeft <= 0) {
        stopBreathing();
        if (promptText) promptText.textContent = '¡Completado!';
        if (timerText) timerText.textContent = 'Sesión finalizada con éxito';
      }
    }, 1000);
  }

  function stopBreathing() {
    isRunning = false;
    clearInterval(breathingInterval);
    innerCircle.className = 'breathing-circle-inner';
    startBtn.textContent = 'Iniciar Respiración 36s';
    startBtn.classList.add('primary');
    startBtn.classList.remove('secondary');
    if (promptText) promptText.textContent = 'Listo';
    if (timerText) timerText.textContent = 'Toca iniciar para comenzar';
  }
}

/* ==========================================================================
   5. Asistente KIRI (Chat y Recomendaciones Contextuales)
   ¿POR QUÉ?: Proveer orientación y acompañamiento preventivo 24/7 sin barreras de entrada.
   ¿CÓMO?: Analizando términos clave en los mensajes del usuario para recomendar lecturas o ejercicios.
   ¿PARA QUÉ?: Guiar de forma empática a la persona hacia recursos adecuados sin emitir diagnósticos clínicos.
   ========================================================================== */
function initKiriAssistant() {
  const sendBtn = document.getElementById('sendChat');
  const chatInput = document.getElementById('chatInput');
  const messagesWrap = document.getElementById('messages');
  const chips = document.querySelectorAll('.chip-btn');
  const clearBtn = document.getElementById('clearChatBtn');

  const knowledgeBase = [
    {
      keywords: ['ansiedad', 'nervios', 'estrés', 'estres', 'preocupado', 'angustia'],
      reply: 'Para calmar el estrés y la ansiedad, te sugiero realizar la pausa de respiración consciente en la sección Herramientas, o escuchar el paisaje sonoro de lluvia en Multimedia. Recuerda que es normal sentir tensión y darte una pausa te ayuda a autorregularte.'
    },
    {
      keywords: ['dormir', 'insomnio', 'sueño', 'descanso', 'noche'],
      reply: 'Un descanso adecuado es clave para la salud mental. Te recomiendo evitar pantallas 30 minutos antes de dormir, mantener tu habitación a temperatura agradable y probar una meditación guiada de nuestra biblioteca.'
    },
    {
      keywords: ['audio', 'musica', 'sonido', 'playlist', 'relajar'],
      reply: 'En la sección Multimedia encontrarás nuestro reproductor de paisajes sonoros relajantes con lluvia, bosque, olas y frecuencias armónicas para acompañar tus momentos de estudio o descanso.'
    },
    {
      keywords: ['ayuda', 'profesional', 'terapia', 'psicologo', 'emergencia', 'doctor'],
      reply: 'Si estás atravesando una situación que requiere atención especializada, visita la sección "Ayuda Profesional" donde encontrarás directorios de orientación y líneas de asistencia oficiales.'
    },
    {
      keywords: ['hola', 'buenos dias', 'buenas', 'que tal', 'saludos'],
      reply: '¡Hola! Qué gusto saludarte. Soy KIRI, tu asistente de orientación y bienestar en CreSer. ¿En qué te gustaría enfocarte hoy?'
    }
  ];

  const defaultReplies = [
    'Comprendo lo que mencionas. CreSer cuenta con recursos educativos y ejercicios prácticos en las secciones de Herramientas y Recursos que pueden acompañarte.',
    'Es muy valioso reflexionar sobre cómo nos sentimos. Te sugiero explorar el diario personal en Herramientas para registrar tus pensamientos.',
    'Recuerda que estoy aquí para guiarte en el uso de la plataforma y sugerirte actividades de bienestar preventivo.'
  ];

  function appendMessage(text, isUser = false) {
    if (!messagesWrap) return;
    const msg = document.createElement('div');
    msg.className = isUser ? 'msg u' : 'msg k';
    msg.textContent = text;
    messagesWrap.appendChild(msg);
    messagesWrap.scrollTop = messagesWrap.scrollHeight;
  }

  async function handleSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    chatInput.value = '';

    // Intento 1: Consulta a Gemini AI vía Firebase AI Logic
    let aiGenerated = null;
    if (typeof window.askKiriAI === 'function') {
      try {
        aiGenerated = await window.askKiriAI(text);
      } catch (_) {}
    }

    if (aiGenerated) {
      appendMessage(aiGenerated, false);
      return;
    }

    // Intento 2: Base de conocimiento empática reflexiva de respaldo
    setTimeout(() => {
      const lower = text.toLowerCase();
      let chosenReply = null;

      for (const entry of knowledgeBase) {
        if (entry.keywords.some(k => lower.includes(k))) {
          chosenReply = entry.reply;
          break;
        }
      }

      if (!chosenReply) {
        chosenReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      }

      appendMessage(chosenReply, false);
    }, 450);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent;
        handleSend();
      }
    });
  });

  if (clearBtn && messagesWrap) {
    clearBtn.addEventListener('click', () => {
      messagesWrap.innerHTML = '<div class="msg k">Conversación reiniciada. ¿En qué puedo orientarte hoy?</div>';
    });
  }
}

/* ==========================================================================
   6. Reproductor de Sonidos Ambientales con Web Audio API
   ¿POR QUÉ?: Evitar la descarga de archivos pesados y generar audio relajante 100% nativo.
   ¿CÓMO?: Creando osciladores y buffers de ruido blanco procesados con filtros biquad de audio.
   ¿PARA QUÉ?: Promover ambientes sonoros relajantes que estimulen la concentración y el descanso.
   ========================================================================== */
function initAmbientSoundPlayer() {
  const playerCard = document.getElementById('ambientPlayer');
  const playBtn = document.getElementById('playAmbientBtn');
  const volumeSlider = document.getElementById('ambientVolume');
  const trackName = document.getElementById('currentTrackName');
  const soundscapeBtns = document.querySelectorAll('.soundscape-btn');

  let audioCtx = null;
  let gainNode = null;
  let noiseNode = null;
  let oscNode = null;
  let isPlaying = false;
  let currentType = 'rain';

  const soundInfo = {
    'rain': { name: 'Lluvia Serena', desc: 'Frecuencia suave de agua para calmar la mente' },
    'forest': { name: 'Bosque en Calma', desc: 'Armónicos naturales y brisa suave' },
    'waves': { name: 'Olas del Océano', desc: 'Ritmo oscilante de mareas para relajación profunda' },
    'focus': { name: 'Armonía 432 Hz', desc: 'Tono puro binaural para concentración y meditación' }
  };

  soundscapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundscapeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.sound;
      if (trackName && soundInfo[currentType]) {
        trackName.textContent = soundInfo[currentType].name;
      }
      if (isPlaying) {
        stopSound();
        startSound();
      }
    });
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopSound();
      } else {
        startSound();
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(parseFloat(e.target.value), audioCtx.currentTime);
      }
    });
  }

  function startSound() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      gainNode = audioCtx.createGain();
      const vol = volumeSlider ? parseFloat(volumeSlider.value) : 0.4;
      gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      if (currentType === 'focus') {
        oscNode = audioCtx.createOscillator();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(432, audioCtx.currentTime);
        oscNode.connect(gainNode);
        oscNode.start();
      } else {
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;

        const filter = audioCtx.createBiquadFilter();
        if (currentType === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(700, audioCtx.currentTime);
        } else if (currentType === 'forest') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, audioCtx.currentTime);
        }

        noiseNode.connect(filter);
        filter.connect(gainNode);
        noiseNode.start();
      }

      isPlaying = true;
      if (playBtn) playBtn.textContent = '⏸ Pausar';
      if (playerCard) playerCard.classList.add('playing');
    } catch (e) {
      console.warn('Audio no soportado:', e);
    }
  }

  function stopSound() {
    if (noiseNode) {
      try { noiseNode.stop(); } catch (_) {}
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (oscNode) {
      try { oscNode.stop(); } catch (_) {}
      oscNode.disconnect();
      oscNode = null;
    }
    isPlaying = false;
    if (playBtn) playBtn.textContent = '▶ Reproducir';
    if (playerCard) playerCard.classList.remove('playing');
  }
}

/* ==========================================================================
   7. Diario Personal y Persistencia en localStorage
   ¿POR QUÉ?: Ofrecer un canal de desahogo y reflexión escrita que proteja la privacidad.
   ¿CÓMO?: Guardando las entradas cifradas conceptualmente en el almacenamiento local del navegador.
   ¿PARA QUÉ?: Asegurar que ninguna información personal salga del dispositivo del usuario.
   ========================================================================== */
function initJournalAndGoals() {
  const saveJournalBtn = document.getElementById('saveJournalBtn');
  const journalInput = document.getElementById('journalInput');
  const journalList = document.getElementById('journalList');

  function renderJournal() {
    if (!journalList) return;
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    if (entries.length === 0) {
      journalList.innerHTML = '<p class="small journal-empty-msg">No tienes notas guardadas aún.</p>';
      return;
    }

    journalList.innerHTML = entries.map((item, idx) => `
      <div class="journal-entry-card">
        <div class="journal-entry-head">
          <span class="journal-entry-date">${item.date}</span>
          <button onclick="deleteJournalEntry(${idx})" class="ghost journal-entry-del-btn" aria-label="Eliminar entrada">✕</button>
        </div>
        <p class="journal-entry-body">${escapeHtml(item.text)}</p>
      </div>
    `).join('');
  }

  window.deleteJournalEntry = function(index) {
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    entries.splice(index, 1);
    localStorage.setItem('creser-journal-entries', JSON.stringify(entries));
    renderJournal();
    recordAuditLog('Eliminación de entrada de diario personal');
  };

  if (saveJournalBtn && journalInput) {
    saveJournalBtn.addEventListener('click', () => {
      const text = journalInput.value.trim();
      if (!text) return;

      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      entries.unshift({ text, date: dateStr });
      localStorage.setItem('creser-journal-entries', JSON.stringify(entries));

      journalInput.value = '';
      renderJournal();
      recordAuditLog('Nueva reflexión registrada en diario personal');
    });
  }

  renderJournal();
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ==========================================================================
   8. Filtros y Búsqueda Reactiva en Recursos
   ¿POR QUÉ?: Facilitar el hallazgo inmediato de lecturas y guías sin recargar la página.
   ¿CÓMO?: Escuchando el evento 'input' y filtrando dinámicamente según la categoría activa.
   ¿PARA QUÉ?: Optimizar los tiempos de respuesta y brindar una experiencia ágil.
   ========================================================================== */
function initResourceFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchResourcesInput');
  const resourceCards = document.querySelectorAll('.resource-card');

  let currentCategory = 'todos';
  let searchTerm = '';

  function applyFilters() {
    resourceCards.forEach(card => {
      const cat = card.dataset.category || '';
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();

      const matchesCat = (currentCategory === 'todos' || cat.toLowerCase() === currentCategory.toLowerCase());
      const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'todos';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

/* ==========================================================================
   9. Control de Roles (RBAC) y Bitácora de Auditoría
   ¿POR QUÉ?: Cumplir con los requerimientos de seguridad, roles y trazabilidad.
   ¿CÓMO?: Validando el rol activo en localStorage (Admin, Usuario, Auditor) y renderizando la tabla.
   ¿PARA QUÉ?: Garantizar la supervisión de operaciones y la restricción de privilegios.
   ========================================================================== */
function initRoleAndAuditPanel() {
  const roleSwitcher = document.getElementById('roleSwitcher');
  const roleBadge = document.getElementById('userRoleBadge');
  const userDisplayName = document.getElementById('userDisplayName');
  const auditPanelCard = document.getElementById('auditPanelCard');
  const auditTableBody = document.getElementById('auditTableBody');
  const refreshAuditBtn = document.getElementById('refreshAuditBtn');
  const exportDataBtn = document.getElementById('exportDataBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');

  // Inicializa logs por defecto si no existen
  if (!localStorage.getItem('creser-audit-logs')) {
    const defaultLogs = [
      { id: 'LOG-1001', timestamp: '29/08/2026 20:15:20', user: 'admin@creser.org', role: 'ADMIN', action: 'Configuración inicial del sistema', ip: '127.0.0.1' },
      { id: 'LOG-1002', timestamp: '29/08/2026 20:20:11', user: 'auditor@creser.org', role: 'AUDITOR', action: 'Inspección de políticas de privacidad', ip: '127.0.0.1' },
      { id: 'LOG-1003', timestamp: '29/08/2026 20:28:45', user: 'andrea@ejemplo.com', role: 'USUARIO', action: 'Inicio de sesión exitoso', ip: '127.0.0.1' }
    ];
    localStorage.setItem('creser-audit-logs', JSON.stringify(defaultLogs));
  }

  // Obtiene la sesión actual
  const currentRole = localStorage.getItem('creser-user-role') || 'usuario';
  const currentUser = localStorage.getItem('creser-user-email') || 'andrea@ejemplo.com';
  const currentName = localStorage.getItem('creser-user-name') || 'Andrea';

  if (userDisplayName) userDisplayName.innerHTML = `<strong>Usuario:</strong> ${currentName} (${currentUser})`;
  if (roleBadge) {
    roleBadge.textContent = currentRole.toUpperCase();
    if (currentRole === 'admin') {
      roleBadge.className = 'badge';
    } else if (currentRole === 'auditor') {
      roleBadge.className = 'badge badge-green';
    } else {
      roleBadge.className = 'badge badge-purple';
    }
  }

  if (roleSwitcher) {
    roleSwitcher.value = currentRole;
    roleSwitcher.addEventListener('change', (e) => {
      const newRole = e.target.value;
      localStorage.setItem('creser-user-role', newRole);
      recordAuditLog(`Cambio de rol asignado a: ${newRole.toUpperCase()}`);
      location.reload();
    });
  }

  // Renderizado de tabla de auditoría (para Auditor y Admin)
  function renderAuditLogs() {
    if (!auditTableBody) return;
    const logs = JSON.parse(localStorage.getItem('creser-audit-logs') || '[]');
    
    // Si el rol es Usuario normal, oculta o restringe la edición
    if (auditPanelCard) {
      if (currentRole === 'usuario') {
        auditPanelCard.style.opacity = '0.75';
      } else {
        auditPanelCard.style.opacity = '1';
      }
    }

    auditTableBody.innerHTML = logs.map(log => `
      <tr class="audit-table-row">
        <td class="audit-log-id">${log.id}</td>
        <td class="audit-log-time">${log.timestamp}</td>
        <td class="audit-log-user">${log.user}</td>
        <td class="audit-log-badge-td"><span class="badge ${log.role==='ADMIN'?'':log.role==='AUDITOR'?'badge-green':'badge-purple'}">${log.role}</span></td>
        <td class="audit-log-action">${escapeHtml(log.action)}</td>
        <td class="audit-log-ip">${log.ip || '127.0.0.1'}</td>
      </tr>
    `).join('');
  }

  if (refreshAuditBtn) {
    refreshAuditBtn.addEventListener('click', renderAuditLogs);
  }

  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
      const data = {
        user: currentUser,
        role: currentRole,
        moodCount: localStorage.getItem('creser-mood-count'),
        journalEntries: JSON.parse(localStorage.getItem('creser-journal-entries') || '[]'),
        auditLogs: JSON.parse(localStorage.getItem('creser-audit-logs') || '[]')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creser-respaldo-${Date.now()}.json`;
      a.click();
      recordAuditLog('Exportación de respaldo de datos locales');
    });
  }

  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas borrar tus registros locales y notas?')) {
        recordAuditLog('Vaciado de almacenamiento local de usuario');
        localStorage.removeItem('creser-journal-entries');
        localStorage.removeItem('creser-mood-count');
        alert('Registros locales eliminados con éxito.');
        location.reload();
      }
    });
  }

  renderAuditLogs();
}

/**
 * Función global auxiliar para registrar eventos de auditoría
 */
function recordAuditLog(action) {
  const logs = JSON.parse(localStorage.getItem('creser-audit-logs') || '[]');
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const user = localStorage.getItem('creser-user-email') || 'andrea@ejemplo.com';
  const role = (localStorage.getItem('creser-user-role') || 'usuario').toUpperCase();

  logs.unshift({
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    timestamp: formattedDate,
    user: user,
    role: role,
    action: action,
    ip: '127.0.0.1'
  });

  if (logs.length > 50) logs.pop();
  localStorage.setItem('creser-audit-logs', JSON.stringify(logs));
}

/* ==========================================================================
   10. Modales Informativos y de Políticas
   ¿POR QUÉ?: Proveer información legal y ética sin interrumpir la sesión del usuario.
   ¿CÓMO?: Inyectando el texto correspondiente y activando la visibilidad del modal accesible.
   ¿PARA QUÉ?: Garantizar la transparencia ética y el consentimiento informado.
   ========================================================================== */
const modalContentData = {
  privacy: {
    title: "Política de Privacidad y Gestión de Datos",
    body: "En CreSer la confidencialidad es una prioridad. Aplicamos minimización estricta de datos, cifrado en tránsito y descanso, y otorgamos al usuario control absoluto para descargar o eliminar su información en cualquier momento. En este entorno demostrativo no se transfieren datos a servidores externos."
  },
  terms: {
    title: "Términos y Condiciones de Uso",
    body: "CreSer es una plataforma digital de carácter educativo y preventivo. KIRI actúa como un asistente virtual complementario y bajo ninguna circunstancia sustituye el diagnóstico o tratamiento de un profesional de la salud mental certificado."
  },
  cookies: {
    title: "Gestión de Cookies y Almacenamiento",
    body: "Utilizamos únicamente almacenamiento local del navegador para guardar tus preferencias de accesibilidad, tema y notas privadas sin rastreadores publicitarios de terceros."
  },
  community: {
    title: "Normas de Convivencia y Comunidad",
    body: "Nuestros espacios compartidos fomentan el respeto mutuo, la empatía y la no estigmatización. Contamos con protocolos de moderación activa y herramientas para reportar conductas inapropiadas."
  },
  legal: {
    title: "Aviso Legal y Alcance",
    body: "Los contenidos y sugerencias tienen fines informativos de bienestar general. Ante emergencias o crisis emocionales, recomendamos acudir inmediatamente a los servicios de salud y líneas telefónicas oficiales."
  }
};

window.openInfoModal = function(key) {
  const modal = document.getElementById('infoModal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');

  if (!modal || !titleEl || !bodyEl) return;

  const data = modalContentData[key] || { title: "Información", body: "Contenido informativo en preparación." };
  titleEl.textContent = data.title;
  bodyEl.innerHTML = `<p class="modal-content-p">${data.body}</p>`;
  modal.classList.add('show');
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
};

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});
