/**
 * ============================================================================
 * CreSer — Motor Principal de Interacciones y Experiencia de Usuario
 * ============================================================================
 * Este archivo centraliza la lógica modular de la plataforma:
 * 1. Control del menú lateral (drawer) y navegación móvil.
 * 2. Gestión de preferencias de accesibilidad y modo oscuro.
 * 3. Selector y persistencia del estado emocional diario.
 * 4. Temporizador y animación del respirador consciente 4-4-4.
 * 5. Asistente conversacional KIRI con respuestas dinámicas.
 * 6. Sintetizador de paisajes sonoros nativo con Web Audio API.
 * 7. Diario personal con marcas de tiempo y almacenamiento local.
 * 8. Buscador y filtrado reactivo de la biblioteca de recursos.
 * 9. Control de modales legales y de privacidad.
 * ============================================================================
 */

// Se ejecuta una vez que el árbol DOM esté completamente parseado
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa el menú lateral y eventos de navegación
  initMobileDrawer();
  // Inicializa la configuración de tema oscuro y tamaño de fuente
  initThemeAndAccessibility();
  // Inicializa el registro emocional si está presente en la vista
  initMoodTracker();
  // Inicializa el temporizador de respiración si está presente
  initBreathingTool();
  // Inicializa el chat inteligente con KIRI
  initKiriAssistant();
  // Inicializa el sintetizador de audio ambiental Web Audio
  initAmbientSoundPlayer();
  // Inicializa el diario reflexivo con persistencia local
  initJournalAndGoals();
  // Inicializa el buscador y las pestañas de recursos
  initResourceFilters();
});

/* ==========================================================================
   1. Control del Menú Lateral Móvil (Drawer)
   ========================================================================== */
function initMobileDrawer() {
  // Obtiene el elemento aside del drawer
  const drawer = document.getElementById('mobileDrawer');
  // Obtiene el fondo oscuro que cubre la pantalla al abrir el drawer
  const backdrop = document.getElementById('drawerBackdrop');
  // Obtiene el botón de menú hamburguesa
  const menuToggle = document.getElementById('menuToggle');
  // Obtiene el botón de cerrar en el interior del drawer
  const drawerClose = document.getElementById('drawerClose');

  // Función para abrir el menú drawer
  function openDrawer() {
    if (drawer && backdrop) {
      // Agrega la clase 'open' para deslizar el menú a la vista
      drawer.classList.add('open');
      // Muestra el fondo oscuro con opacidad suave
      backdrop.classList.add('show');
    }
  }

  // Función para cerrar el menú drawer
  function closeDrawer() {
    if (drawer && backdrop) {
      // Remueve la clase 'open' para ocultar el menú
      drawer.classList.remove('open');
      // Oculta el fondo oscuro
      backdrop.classList.remove('show');
    }
  }

  // Asigna el evento de clic al botón de menú hamburguesa si existe
  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  // Asigna el evento de clic al botón de cierre del drawer si existe
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  // Asigna el evento de clic al fondo para cerrar al tocar fuera
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Escucha clics en botones con atributo data-modal para abrir modales informativos
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
   ========================================================================== */
function initThemeAndAccessibility() {
  // Obtiene el conmutador de Modo Oscuro
  const darkToggle = document.getElementById('darkToggle');
  // Obtiene el conmutador de Texto Aumentado
  const textToggle = document.getElementById('textToggle');

  // Si existe el control de Modo Oscuro en la página actual
  if (darkToggle) {
    // Comprueba si el usuario tenía guardada la preferencia en localStorage
    const isDark = localStorage.getItem('creser-dark') === '1';
    if (isDark) {
      // Aplica la clase .dark al body
      document.body.classList.add('dark');
      // Activa visualmente el toggle
      darkToggle.classList.add('on');
      // Actualiza el atributo ARIA para accesibilidad
      darkToggle.setAttribute('aria-checked', 'true');
    }

    // Escucha el evento de clic para alternar el tema
    darkToggle.addEventListener('click', () => {
      // Alterna la clase en el body
      const active = document.body.classList.toggle('dark');
      // Alterna la clase en el botón toggle
      darkToggle.classList.toggle('on', active);
      // Actualiza el estado ARIA
      darkToggle.setAttribute('aria-checked', active ? 'true' : 'false');
      // Guarda la preferencia en el almacenamiento local del navegador
      localStorage.setItem('creser-dark', active ? '1' : '0');
    });
  }

  // Si existe el control de Texto Aumentado en la página actual
  if (textToggle) {
    // Comprueba la preferencia guardada de accesibilidad
    const isLarge = localStorage.getItem('creser-large-text') === '1';
    if (isLarge) {
      // Aumenta el tamaño base de la fuente al 112.5%
      document.documentElement.style.fontSize = '112.5%';
      textToggle.classList.add('on');
      textToggle.setAttribute('aria-checked', 'true');
    }

    // Escucha el clic para alternar el tamaño de fuente
    textToggle.addEventListener('click', () => {
      const isCurrentlyLarge = document.documentElement.style.fontSize === '112.5%';
      if (isCurrentlyLarge) {
        // Restaura el tamaño normal
        document.documentElement.style.fontSize = '100%';
        textToggle.classList.remove('on');
        textToggle.setAttribute('aria-checked', 'false');
        localStorage.setItem('creser-large-text', '0');
      } else {
        // Aplica el aumento de tamaño
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
   ========================================================================== */
function initMoodTracker() {
  // Obtiene la lista de botones de estado de ánimo
  const moodBtns = document.querySelectorAll('.mood-btn');
  // Obtiene el botón de registro
  const registerBtn = document.getElementById('registerMood');
  // Obtiene el elemento donde se muestra la notificación de éxito
  const moodNotice = document.getElementById('moodSaved');
  // Estado por defecto
  let selectedMood = 'tranquilo';

  // Mensajes de retroalimentación reflexiva por cada emoción seleccionada
  const moodMessages = {
    'dificil': 'Has registrado un momento desafiante. Tómate una pausa y recuerda que no estás solo/a.',
    'regular': 'Un día regular es una oportunidad para escuchar lo que tu cuerpo y mente necesitan.',
    'neutral': 'Estado en calma y balance registrado con éxito.',
    'tranquilo': 'Excelente momento de serenidad. Sigue cultivando hábitos que te generen bienestar.',
    'excelente': '¡Nos alegra ver tu energía positiva hoy! Sigue cuidando tu salud emocional.'
  };

  // Asigna el evento de selección a cada botón de emoción
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remueve la selección de los otros botones
      moodBtns.forEach(b => b.classList.remove('selected'));
      // Marca el botón cliqueado
      btn.classList.add('selected');
      // Almacena el valor de la emoción seleccionada
      selectedMood = btn.dataset.mood;
    });
  });

  // Si existe el botón de registro en la vista
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      // Incrementa el contador de racha acumulada
      const savedCount = parseInt(localStorage.getItem('creser-mood-count') || '5', 10) + 1;
      localStorage.setItem('creser-mood-count', savedCount.toString());
      localStorage.setItem('creser-last-mood', selectedMood);

      // Actualiza el texto visual de la racha
      const streakEl = document.getElementById('streakCount');
      if (streakEl) streakEl.textContent = `${savedCount} días`;

      // Muestra el mensaje de confirmación
      if (moodNotice) {
        moodNotice.innerHTML = `<span>✓</span> <div><strong>Estado guardado:</strong> ${moodMessages[selectedMood] || 'Estado registrado correctamente.'}</div>`;
        moodNotice.style.display = 'flex';
      }
    });
  }
}

/* ==========================================================================
   4. Herramienta de Respiración Guiada 4-4-4
   ========================================================================== */
function initBreathingTool() {
  const startBtn = document.getElementById('startBreathingBtn');
  const innerCircle = document.getElementById('breathingInner');
  const promptText = document.getElementById('breathingPrompt');
  const timerText = document.getElementById('breathingTimer');

  let breathingInterval = null;
  let isRunning = false;

  // Si no está en la página de herramientas, finaliza la ejecución de esta función
  if (!startBtn || !innerCircle) return;

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  // Inicia la sesión de respiración rítmica
  function startBreathing() {
    isRunning = true;
    startBtn.textContent = 'Detener sesión';
    startBtn.classList.add('secondary');
    startBtn.classList.remove('primary');

    let cycleStep = 0; // 0: Inhala (4s), 1: Sostén (4s), 2: Exhala (4s)
    let secondsLeft = 36; // Duración total de la sesión guiada

    runPhase();

    // Ejecuta visualmente cada fase de la respiración
    function runPhase() {
      if (!isRunning) return;

      if (cycleStep === 0) {
        // Fase de Inhalación
        innerCircle.className = 'breathing-circle-inner inhale';
        if (promptText) promptText.textContent = 'Inhala profundamente';
      } else if (cycleStep === 1) {
        // Fase de Retención
        innerCircle.className = 'breathing-circle-inner hold';
        if (promptText) promptText.textContent = 'Sostén el aire';
      } else {
        // Fase de Exhalación
        innerCircle.className = 'breathing-circle-inner exhale';
        if (promptText) promptText.textContent = 'Exhala suavemente';
      }

      cycleStep = (cycleStep + 1) % 3;
    }

    // Temporizador que se ejecuta cada segundo
    breathingInterval = setInterval(() => {
      secondsLeft--;
      if (timerText) timerText.textContent = `${secondsLeft} s restantes`;

      // Cambia de fase cada 4 segundos
      if (secondsLeft % 4 === 0) {
        runPhase();
      }

      // Al completar el tiempo total
      if (secondsLeft <= 0) {
        stopBreathing();
        if (promptText) promptText.textContent = '¡Completado!';
        if (timerText) timerText.textContent = 'Sesión finalizada con éxito';
      }
    }, 1000);
  }

  // Detiene la sesión y restaura el estado inicial
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
   ========================================================================== */
function initKiriAssistant() {
  const sendBtn = document.getElementById('sendChat');
  const chatInput = document.getElementById('chatInput');
  const messagesWrap = document.getElementById('messages');
  const chips = document.querySelectorAll('.chip-btn');
  const clearBtn = document.getElementById('clearChatBtn');

  // Base de conocimientos para responder según las palabras clave del usuario
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

  // Respuestas genéricas de apoyo
  const defaultReplies = [
    'Comprendo lo que mencionas. CreSer cuenta con recursos educativos y ejercicios prácticos en las secciones de Herramientas y Recursos que pueden acompañarte.',
    'Es muy valioso reflexionar sobre cómo nos sentimos. Te sugiero explorar el diario personal en Herramientas para registrar tus pensamientos.',
    'Recuerda que estoy aquí para guiarte en el uso de la plataforma y sugerirte actividades de bienestar preventivo.'
  ];

  // Agrega un mensaje a la conversación
  function appendMessage(text, isUser = false) {
    if (!messagesWrap) return;
    const msg = document.createElement('div');
    msg.className = isUser ? 'msg u' : 'msg k';
    msg.textContent = text;
    messagesWrap.appendChild(msg);
    // Realiza scroll automático hacia el último mensaje
    messagesWrap.scrollTop = messagesWrap.scrollHeight;
  }

  // Maneja el envío del mensaje
  function handleSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Agrega el mensaje del usuario
    appendMessage(text, true);
    chatInput.value = '';

    // Simula una breve pausa de escritura para mayor naturalidad
    setTimeout(() => {
      const lower = text.toLowerCase();
      let chosenReply = null;

      // Busca coincidencia en la base de conocimientos
      for (const entry of knowledgeBase) {
        if (entry.keywords.some(k => lower.includes(k))) {
          chosenReply = entry.reply;
          break;
        }
      }

      // Si no coincide, selecciona una respuesta reflexiva por defecto
      if (!chosenReply) {
        chosenReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      }

      // Agrega la respuesta de KIRI
      appendMessage(chosenReply, false);
    }, 450);
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Píldoras de sugerencias rápidas
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent;
        handleSend();
      }
    });
  });

  // Botón para limpiar el chat
  if (clearBtn && messagesWrap) {
    clearBtn.addEventListener('click', () => {
      messagesWrap.innerHTML = '<div class="msg k">Conversación reiniciada. ¿En qué puedo orientarte hoy?</div>';
    });
  }
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

  // Catálogo de ambientes sonoros
  const soundInfo = {
    'rain': { name: 'Lluvia Serena', desc: 'Frecuencia suave de agua para calmar la mente' },
    'forest': { name: 'Bosque en Calma', desc: 'Armónicos naturales y brisa suave' },
    'waves': { name: 'Olas del Océano', desc: 'Ritmo oscilante de mareas para relajación profunda' },
    'focus': { name: 'Armonía 432 Hz', desc: 'Tono puro binaural para concentración y meditación' }
  };

  // Asigna el evento a los botones de ambiente
  soundscapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundscapeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.sound;
      if (trackName && soundInfo[currentType]) {
        trackName.textContent = soundInfo[currentType].name;
      }
      // Si ya está reproduciendo, reinicia el sonido con el nuevo ambiente
      if (isPlaying) {
        stopSound();
        startSound();
      }
    });
  });

  // Botón principal de reproducir / pausar
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopSound();
      } else {
        startSound();
      }
    });
  }

  // Control deslizante de volumen
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(parseFloat(e.target.value), audioCtx.currentTime);
      }
    });
  }

  // Genera y reproduce el sonido seleccionado mediante Web Audio API
  function startSound() {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Nodo de ganancia (volumen)
      gainNode = audioCtx.createGain();
      const vol = volumeSlider ? parseFloat(volumeSlider.value) : 0.4;
      gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      if (currentType === 'focus') {
        // Tono armónico puro a 432Hz
        oscNode = audioCtx.createOscillator();
        oscNode.type = 'sine';
        oscNode.frequency.setValueAtTime(432, audioCtx.currentTime);
        oscNode.connect(gainNode);
        oscNode.start();
      } else {
        // Generador de ruido blanco filtrado para lluvia, bosque y olas
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

  // Detiene la reproducción de audio
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
   ========================================================================= */
function initJournalAndGoals() {
  const saveJournalBtn = document.getElementById('saveJournalBtn');
  const journalInput = document.getElementById('journalInput');
  const journalList = document.getElementById('journalList');

  // Renderiza las notas guardadas
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
          <button onclick="deleteJournalEntry(${idx})" class="ghost" style="padding:2px 6px;font-size:12px;color:var(--ink-muted)" aria-label="Eliminar entrada">✕</button>
        </div>
        <p style="font-size:13px;margin:0;color:var(--ink-primary)">${escapeHtml(item.text)}</p>
      </div>
    `).join('');
  }

  // Función global para eliminar una entrada del diario
  window.deleteJournalEntry = function(index) {
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    entries.splice(index, 1);
    localStorage.setItem('creser-journal-entries', JSON.stringify(entries));
    renderJournal();
  };

  // Guarda una nueva reflexión
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

// Escapa caracteres especiales para evitar inyecciones HTML
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ==========================================================================
   8. Filtros y Búsqueda Reactiva en Recursos
   ========================================================================= */
function initResourceFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchResourcesInput');
  const resourceCards = document.querySelectorAll('.resource-card');

  let currentCategory = 'todos';
  let searchTerm = '';

  // Aplica el filtro combinado de categoría y texto de búsqueda
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

  // Asigna el evento a los botones de categoría
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || 'todos';
      applyFilters();
    });
  });

  // Filtra en tiempo real conforme el usuario escribe
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

/* ==========================================================================
   9. Modales Informativos y de Políticas
   ========================================================================= */
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

// Abre el modal con la información correspondiente
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

// Cierra el modal especificado
window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
};

// Cierra el modal al hacer clic en el fondo oscuro
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});
