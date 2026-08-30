/**
 * CreSer — Motor de Interacciones y Experiencia de Usuario
 * Módulo de navegación, asistente KIRI, utilidades de bienestar y síntesis sonora
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeAndAccessibility();
  initMoodTracker();
  initBreathingTool();
  initKiriAssistant();
  initAmbientSoundPlayer();
  initJournalAndGoals();
  initResourceFilters();
});

/* ==========================================================================
   1. Navegación y Control de Vistas
   ========================================================================== */

function initNavigation() {
  const pages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('[data-page]');
  const drawer = document.getElementById('mobileDrawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');

  window.showPage = function(pageId) {
    if (!pageId) return;

    pages.forEach(p => {
      if (p.id === pageId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  document.addEventListener('click', (e) => {
    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn) {
      const page = pageBtn.dataset.page;
      if (page && page !== 'logout') {
        e.preventDefault();
        showPage(page);
      }
    }

    const modalBtn = e.target.closest('[data-modal]');
    if (modalBtn) {
      e.preventDefault();
      openInfoModal(modalBtn.dataset.modal);
    }
  });
}

/* ==========================================================================
   2. Configuración, Tema y Accesibilidad
   ========================================================================== */

function initThemeAndAccessibility() {
  const darkToggle = document.getElementById('darkToggle');
  const textToggle = document.getElementById('textToggle');

  if (darkToggle) {
    const isDark = localStorage.getItem('creser-dark') === '1';
    if (isDark) {
      document.body.classList.add('dark');
      darkToggle.classList.add('on');
    }

    darkToggle.addEventListener('click', () => {
      const active = document.body.classList.toggle('dark');
      darkToggle.classList.toggle('on', active);
      localStorage.setItem('creser-dark', active ? '1' : '0');
    });
  }

  if (textToggle) {
    const isLarge = localStorage.getItem('creser-large-text') === '1';
    if (isLarge) {
      document.documentElement.style.fontSize = '112.5%';
      textToggle.classList.add('on');
    }

    textToggle.addEventListener('click', () => {
      const isCurrentlyLarge = document.documentElement.style.fontSize === '112.5%';
      if (isCurrentlyLarge) {
        document.documentElement.style.fontSize = '100%';
        textToggle.classList.remove('on');
        localStorage.setItem('creser-large-text', '0');
      } else {
        document.documentElement.style.fontSize = '112.5%';
        textToggle.classList.add('on');
        localStorage.setItem('creser-large-text', '1');
      }
    });
  }
}

/* ==========================================================================
   3. Registro y Monitoreo Emocional
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
    });
  }
}

/* ==========================================================================
   4. Herramienta de Respiración Guiada
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

    let cycleStep = 0; // 0: Inhala (4s), 1: Sostén (4s), 2: Exhala (4s)
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
   5. Asistente KIRI (Chat y Recomendaciones)
   ========================================================================== */

function initKiriAssistant() {
  const sendBtn = document.getElementById('sendChat');
  const chatInput = document.getElementById('chatInput');
  const messagesWrap = document.getElementById('messages');
  const chips = document.querySelectorAll('.chip-btn');

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

  function handleSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    chatInput.value = '';

    // Typing delay simulation
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
}

/* ==========================================================================
   6. Reproductor de Sonidos Ambientales con Web Audio API
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
        // Generador de tono armónico 432Hz
        oscNode = audioCtx.createOscillator();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(432, audioCtx.currentTime);
        oscNode.connect(gainNode);
        oscNode.start();
      } else {
        // Generador de ruido ambiental con filtros
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
      console.warn('Audio no soportado o bloqueado por el navegador:', e);
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
   7. Diario Personal y Metas de Bienestar
   ========================================================================== */

function initJournalAndGoals() {
  const saveJournalBtn = document.getElementById('saveJournalBtn');
  const journalInput = document.getElementById('journalInput');
  const journalList = document.getElementById('journalList');

  function renderJournal() {
    if (!journalList) return;
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    if (entries.length === 0) {
      journalList.innerHTML = '<p class="small" style="color:var(--ink-muted);text-align:center;padding:10px 0">No tienes notas guardadas aún.</p>';
      return;
    }

    journalList.innerHTML = entries.map((item, idx) => `
      <div style="background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:12px;margin-bottom:8px;position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:11px;color:var(--primary);font-weight:700">${item.date}</span>
          <button onclick="deleteJournalEntry(${idx})" class="ghost" style="padding:2px 6px;font-size:12px;color:var(--ink-muted)">✕</button>
        </div>
        <p style="font-size:13px;margin:0;color:var(--ink-primary)">${escapeHtml(item.text)}</p>
      </div>
    `).join('');
  }

  window.deleteJournalEntry = function(index) {
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    entries.splice(index, 1);
    localStorage.setItem('creser-journal-entries', JSON.stringify(entries));
    renderJournal();
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
    });
  }

  renderJournal();
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ==========================================================================
   8. Filtros y Búsqueda en Recursos
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
   9. Modales de Información Legal y Apoyo
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
  bodyEl.innerHTML = `<p style="line-height:1.75;color:var(--ink-secondary)">${data.body}</p>`;
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
