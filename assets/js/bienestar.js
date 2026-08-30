/**
 * ============================================================================
 * CreSer — Controlador del Centro Integral de Bienestar Emocional (bienestar.js)
 * ============================================================================
 * 
 * ¿POR QUÉ?:
 * Proporcionar una experiencia adaptativa, interactiva, accesible y privada para
 * el autocuidado emocional sin emitir diagnósticos clínicos.
 * 
 * ¿CÓMO?:
 * Detectando el estado emocional y necesidades actuales del usuario para reorganizar
 * de forma reactiva las micro-herramientas, hábitos, reflexiones y recursos recomendados.
 * 
 * ¿PARA QUÉ?:
 * Acompañar al usuario bajo el ciclo:
 * "Detectar → Comprender → Actuar → Registrar → Dar seguimiento → Buscar ayuda".
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroGreeting();
  initAdaptiveWellness();
  initNeedsSelector();
  initQuickToolModals();
  initQuickToolsCarousel();
  initWeeklyStats();
  initWellnessJournal();
  initExportReportCenter();
  initSleepAndEnergy();
  initWellnessHabits();
  initWellnessLibrary();
  initWellnessChallenges();
  initHelpAndPrivacyModals();
});

/* ==========================================================================
   0. Saludo Contextual Personalizado (Hero)
   ========================================================================== */

/**
 * Detecta si el usuario ha iniciado sesión (via localStorage) y personaliza
 * el saludo del Hero con su nombre y un saludo apropiado según la hora del día.
 * Si no hay sesión activa, mantiene el saludo genérico.
 */
function initHeroGreeting() {
  const greetingEl = document.getElementById('heroGreetingLine');
  if (!greetingEl) return;

  function applyGreeting() {
    const storedName = localStorage.getItem('creser-user-name');
    const storedEmail = localStorage.getItem('creser-user-email');

    if (!storedName && !storedEmail) {
      // No hay sesión → saludo genérico
      greetingEl.innerHTML = 'Hola 👋';
      return;
    }

    // Extraer el primer nombre del usuario (capitalizado)
    const rawName = storedName || (storedEmail ? storedEmail.split('@')[0] : '');
    const firstName = rawName.split(/[\s_.-]+/)[0];
    const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // Saludo contextual según la hora del día
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Buenos días';
    } else if (hour >= 12 && hour < 19) {
      timeGreeting = 'Buenas tardes';
    } else {
      timeGreeting = 'Buenas noches';
    }

    greetingEl.innerHTML = `${timeGreeting}, <span class="hero-user-name">${displayName}</span> 👋`;
  }

  applyGreeting();

  // Escuchar cambios de sesión desde otras pestañas (login/logout en login.html)
  window.addEventListener('storage', (e) => {
    if (e.key === 'creser-user-name' || e.key === 'creser-user-email') {
      applyGreeting();
    }
  });
}

/* ==========================================================================
   1. Motor Adaptativo de Estado Emocional & Factores de Influencia
   ========================================================================== */
let currentSelectedMood = 'tranquilo';
let selectedInfluences = new Set(['Estudios']);

const ADAPTIVE_RECOMMENDATIONS = {
  excelente: {
    tag: "Aprovecha tu energía",
    title: "Momento ideal para consolidar hábitos positivos",
    desc: "Estás experimentando un estado de plenitud. Te sugerimos registrar en tu diario qué prácticas te ayudaron hoy o completar un reto personal de bienestar.",
    tool: "escritura",
    toolName: "Escritura Emocional y Gratitud"
  },
  bien: {
    tag: "Equilibrio y Calma",
    title: "Continúa cultivando tu bienestar diario",
    desc: "Un estado sereno es el mejor momento para una pausa consciente de 3 minutos y mantener la hidratación y el descanso activo.",
    tool: "pausa",
    toolName: "Pausa Consciente"
  },
  neutral: {
    tag: "Chequeo y Pausa",
    title: "Conecta con tu cuerpo y mente",
    desc: "Un día neutral es una gran oportunidad para realizar un escaneo corporal suave y registrar qué cosas te darían un impulso de bienestar.",
    tool: "pausa",
    toolName: "Pausa Consciente"
  },
  preocupado: {
    tag: "Regulación de Pensamientos",
    title: "Desacelera y ordena tus prioridades con calma",
    desc: "Cuando la preocupación se hace presente, la técnica de Grounding 5-4-3-2-1 o una pausa de respiración ayudan a anclar tu atención en el momento presente.",
    tool: "grounding",
    toolName: "Técnica de Grounding 5-4-3-2-1"
  },
  triste: {
    tag: "Autocompasión y Acompañamiento",
    title: "Permítete sentir sin juzgarte",
    desc: "Todas las emociones tienen un propósito. Prueba escuchar un paisaje sonoro reconfortante o escribir libremente en tu diario privado.",
    tool: "sonidos",
    toolName: "Sonidos Ambientales Relajantes"
  },
  abrumado: {
    tag: "Alivio y Espacio Mental",
    title: "Pausa inmediata: reduce la sobrecarga sensorial",
    desc: "La sensación de sobrecarga se alivia soltando momentáneamente las tareas. Te recomendamos iniciar la Respiración Cuadrada 4-4-4 durante 2 minutos.",
    tool: "respiracion",
    toolName: "Pausa de Respiración 4-4-4"
  },
  frustrado: {
    tag: "Liberación de Tensión",
    title: "Canaliza y relaja la tensión muscular",
    desc: "La frustración suele acumularse en los hombros y mandíbula. Una sesión de relajación muscular progresiva te devolverá la serenidad.",
    tool: "muscular",
    toolName: "Relajación Muscular Progresiva"
  },
  cansado: {
    tag: "Restauración y Descanso",
    title: "Tu cuerpo te pide una pausa regenerativa",
    desc: "Prioriza una desconexión breve, descanso visual o una guía práctica para mejorar la calidad de tu sueño esta noche.",
    tool: "visual",
    toolName: "Descanso Visual 20-20-20"
  }
};

function initAdaptiveWellness() {
  const moodBtns = document.querySelectorAll('.mood-card-btn');
  const influenceChips = document.querySelectorAll('.influence-chip');
  const registerMoodBtn = document.getElementById('btnRegisterWellnessMood');
  const moodNotice = document.getElementById('wellnessMoodNotice');

  // Selección de Emoción (Única)
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSelectedMood = btn.dataset.mood || 'neutral';
      updateAdaptiveCard(currentSelectedMood);
    });
  });

  // Selección de Factores de Influencia (Múltiple)
  influenceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.influence;
      if (selectedInfluences.has(val)) {
        selectedInfluences.delete(val);
        chip.classList.remove('active');
      } else {
        selectedInfluences.add(val);
        chip.classList.add('active');
      }
    });
  });

  // Botón Registrar Estado Emocional
  if (registerMoodBtn) {
    registerMoodBtn.addEventListener('click', () => {
      const influencesArr = Array.from(selectedInfluences);
      const moodData = {
        animo: currentSelectedMood,
        factores: influencesArr,
        fecha: new Date().toLocaleDateString('es-NI'),
        timestamp: new Date().toISOString()
      };

      // Guardar en CreSerDB / Firestore / RTDB / localStorage
      if (window.CreSerDB) {
        window.CreSerDB.saveMoodLog(moodData);
      } else {
        const history = JSON.parse(localStorage.getItem('creser-mood-history') || '[]');
        history.unshift(moodData);
        localStorage.setItem('creser-mood-history', JSON.stringify(history));
      }

      // Actualizar métricas semanales
      incrementWeeklyStreak();

      // Feedback visual
      if (moodNotice) {
        moodNotice.innerHTML = `<span>✓</span> <div><strong>Estado guardado exitosamente:</strong> Se han adaptado tus recomendaciones de hoy.</div>`;
        moodNotice.style.display = 'flex';
        setTimeout(() => { moodNotice.style.display = 'none'; }, 4000);
      }
    });
  }
}

function updateAdaptiveCard(moodKey) {
  const rec = ADAPTIVE_RECOMMENDATIONS[moodKey] || ADAPTIVE_RECOMMENDATIONS.neutral;
  const tagEl = document.getElementById('adaptiveRecTag');
  const titleEl = document.getElementById('adaptiveRecTitle');
  const descEl = document.getElementById('adaptiveRecDesc');
  const actionBtn = document.getElementById('adaptiveRecActionBtn');

  if (tagEl) tagEl.textContent = rec.tag;
  if (titleEl) titleEl.textContent = rec.title;
  if (descEl) descEl.textContent = rec.desc;
  if (actionBtn) {
    actionBtn.textContent = `Probar: ${rec.toolName}`;
    actionBtn.onclick = () => openToolModal(rec.tool);
  }
}

/* ==========================================================================
   2. ¿Qué necesitas ahora? (Pills Interactivas de Necesidades)
   ========================================================================== */
function initNeedsSelector() {
  const needCards = document.querySelectorAll('.need-card');
  needCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      needCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const targetTool = card.dataset.targetTool;
      if (targetTool) {
        openToolModal(targetTool);
      } else {
        const sectionTarget = card.getAttribute('href');
        if (sectionTarget && sectionTarget.startsWith('#')) {
          const el = document.querySelector(sectionTarget);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* ==========================================================================
   3. Modales Funcionales de Herramientas Rápidas (8 Herramientas)
   ========================================================================== */
let activeToolTimer = null;
let focusTimeRemaining = 180;
let isFocusTimerRunning = false;
let audioCtxInstance = null;

/**
 * Función auxiliar para emitir un tono armónico puro relajante mediante Web Audio API
 * 
 * ¿POR QUÉ?: Acompañar los ejercicios de respiración y descanso con señales auditivas suaves.
 * ¿CÓMO?: Creando un oscilador senoidal a 432 Hz / 528 Hz y aplicando caída exponencial en la ganancia.
 * ¿PARA QUÉ?: Ofrecer una experiencia inmersiva de relajación sin requerir archivos de audio pesados.
 */
function playHarmonicChime(freq = 432, duration = 1.8) {
  try {
    const soundToggle = document.getElementById('toggleBreathingSound');
    if (soundToggle && !soundToggle.checked) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtxInstance) {
      audioCtxInstance = new AudioContextClass();
    }
    if (audioCtxInstance.state === 'suspended') {
      audioCtxInstance.resume();
    }

    const now = audioCtxInstance.currentTime;
    const osc = audioCtxInstance.createOscillator();
    const gain = audioCtxInstance.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Ataque suave y decaimiento exponencial natural tipo campana tibetana
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtxInstance.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  } catch (err) {
    console.warn("Web Audio API no disponible o bloqueada:", err);
  }
}

/**
 * Función para mostrar notificaciones Toast flotantes
 * 
 * ¿POR QUÉ?: Reemplazar alertas nativas intrusivas por mensajes visuales fluidos.
 * ¿CÓMO?: Inyectando el texto y manipulando la clase 'show' con temporizador de remoción.
 * ¿PARA QUÉ?: Confirmar acciones como guardar, copiar o exportar datos de forma elegante.
 */
function showCreSerToast(message, icon = '🌿') {
  const toast = document.getElementById('creserToast');
  if (!toast) return;

  toast.innerHTML = `<span style="font-size:1.1rem;">${icon}</span> <span>${escapeHtml(message)}</span>`;
  toast.classList.add('show');

  if (toast._timer) clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   4. Galería en Movimiento Continuo de Herramientas Rápidas (Carrusel Premium)
   ========================================================================== */

/* ¿POR QUÉ?: Crear un bucle verdaderamente infinito sin cortes, saltos bruscos ni bloqueos.
   ¿CÓMO?: Duplicando el conjunto de tarjetas en el track, midiendo el ancho base (singleSetWidth) y reiniciando scrollLeft de forma invisible cuando se alcanza el punto medio.
   ¿PARA QUÉ?: Garantizar un flujo continuo ininterrumpido (Infinite Marquee) que nunca se detenga ni se quede pegado. */
function initQuickToolsCarousel() {
  const container = document.getElementById('quickToolsCarouselContainer');
  const viewport = document.getElementById('quickToolsCarouselViewport');
  const track = document.getElementById('quickToolsCarouselTrack');
  const btnPrev = document.getElementById('btnQuickToolsPrev');
  const btnNext = document.getElementById('btnQuickToolsNext');
  const btnPlayPause = document.getElementById('btnQuickToolsPlayPause');
  const iconPlayPause = document.getElementById('playPauseIcon');
  const progressFill = document.getElementById('quickToolsProgressFill');

  if (!viewport || !track) return;

  // Duplicar tarjetas para bucle infinito continuo
  const initialCards = Array.from(track.children);
  if (initialCards.length > 0 && track.children.length === 8) {
    initialCards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  // Re-vincular eventos de apertura de modales a todas las tarjetas (originales y clones)
  const allToolBtns = track.querySelectorAll('[data-open-tool]');
  allToolBtns.forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const toolId = btn.dataset.openTool;
      openToolModal(toolId);
    };
  });

  let isAutoScrolling = true;
  let isUserInteracting = false;
  let resumeTimer = null;
  let scrollSpeed = 0.75; // Velocidad suave en píxeles por frame
  let animationFrameId = null;

  // Calcular el punto medio del track duplicado
  function getSingleSetWidth() {
    return track.scrollWidth / 2;
  }

  // Actualizar barra de progreso del carrusel
  function updateProgressBar() {
    if (!progressFill) return;
    const singleWidth = getSingleSetWidth();
    if (singleWidth <= 0) return;
    const currentOffset = viewport.scrollLeft % singleWidth;
    const percent = (currentOffset / singleWidth) * 100;
    progressFill.style.width = `${Math.min(100, Math.max(12, percent))}%`;
  }

  // Bucle de movimiento continuo verdaderamente infinito
  function autoScrollLoop() {
    if (isAutoScrolling && !isUserInteracting) {
      viewport.scrollLeft += scrollSpeed;
      const singleWidth = getSingleSetWidth();
      // Si superamos el primer set completo, saltamos al inicio de manera imperceptible
      if (viewport.scrollLeft >= singleWidth) {
        viewport.scrollLeft -= singleWidth;
      }
      updateProgressBar();
    }
    animationFrameId = requestAnimationFrame(autoScrollLoop);
  }

  animationFrameId = requestAnimationFrame(autoScrollLoop);

  // Pausa temporal al pasar el cursor o interactuar
  function markInteraction() {
    isUserInteracting = true;
    if (resumeTimer) clearTimeout(resumeTimer);
    // Auto-reanudar tras 3 segundos de inactividad para que nunca quede pegado
    resumeTimer = setTimeout(() => {
      isUserInteracting = false;
    }, 3000);
  }

  viewport.addEventListener('mouseenter', () => {
    isUserInteracting = true;
  });

  viewport.addEventListener('mouseleave', () => {
    isUserInteracting = false;
  });

  // Pausa / Reanudación manual desde el botón
  if (btnPlayPause && iconPlayPause) {
    btnPlayPause.addEventListener('click', () => {
      isAutoScrolling = !isAutoScrolling;
      iconPlayPause.textContent = isAutoScrolling ? '⏸️' : '▶️';
      showCreSerToast(isAutoScrolling ? 'Galería en movimiento reanudada' : 'Galería pausada', '✨');
    });
  }

  // Botón Anterior (Desplazar 330px a la izquierda con salto infinito seguro)
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      markInteraction();
      const singleWidth = getSingleSetWidth();
      if (viewport.scrollLeft <= 10) {
        viewport.scrollLeft += singleWidth;
      }
      viewport.scrollBy({ left: -330, behavior: 'smooth' });
      setTimeout(updateProgressBar, 350);
    });
  }

  // Botón Siguiente (Desplazar 330px a la derecha con salto infinito seguro)
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      markInteraction();
      const singleWidth = getSingleSetWidth();
      if (viewport.scrollLeft >= singleWidth) {
        viewport.scrollLeft -= singleWidth;
      }
      viewport.scrollBy({ left: 330, behavior: 'smooth' });
      setTimeout(updateProgressBar, 350);
    });
  }

  // Soporte de Arrastre con Mouse (Drag to scroll)
  let isDown = false;
  let startX = 0;
  let scrollLeftPos = 0;

  viewport.addEventListener('mousedown', (e) => {
    isDown = true;
    markInteraction();
    startX = e.pageX - viewport.offsetLeft;
    scrollLeftPos = viewport.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      markInteraction();
    }
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - viewport.offsetLeft;
    const walk = (x - startX) * 1.5;
    viewport.scrollLeft = scrollLeftPos - walk;
    
    // Control de límites infinitos durante el arrastre
    const singleWidth = getSingleSetWidth();
    if (viewport.scrollLeft >= singleWidth * 1.5) {
      viewport.scrollLeft -= singleWidth;
    } else if (viewport.scrollLeft <= 0) {
      viewport.scrollLeft += singleWidth;
    }
    
    updateProgressBar();
  });

  // Soporte de interacción táctil en móviles
  viewport.addEventListener('touchstart', () => {
    markInteraction();
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    markInteraction();
  });

  viewport.addEventListener('scroll', updateProgressBar, { passive: true });
}

function initQuickToolModals() {
  const toolBtns = document.querySelectorAll('[data-open-tool]');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const toolId = btn.dataset.openTool;
      openToolModal(toolId);
    });
  });

  const closeBtns = document.querySelectorAll('.wellness-tool-close-btn');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeAllToolModals);
  });

  // Modal Escritura Libre: Guardado directo al diario
  const btnSaveModalWriting = document.getElementById('btnSaveModalWriting');
  const modalWritingInput = document.getElementById('modalWritingInput');
  if (btnSaveModalWriting && modalWritingInput) {
    btnSaveModalWriting.addEventListener('click', () => {
      const text = modalWritingInput.value.trim();
      if (!text) {
        showCreSerToast("Por favor escribe tu reflexión antes de guardar.", "✍️");
        return;
      }
      const entry = {
        type: "Pensamientos",
        emotion: "😌 En calma",
        title: "Escritura Libre",
        text: text,
        date: new Date().toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: new Date().toISOString()
      };
      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      entries.unshift(entry);
      localStorage.setItem('creser-journal-entries', JSON.stringify(entries));

      if (window.CreSerDB) {
        window.CreSerDB.saveJournalEntry(entry);
      }

      modalWritingInput.value = '';
      closeAllToolModals();
      initWellnessJournal();
      initWeeklyStats();
      showCreSerToast("Reflexión guardada en tu diario personal.", "✅");
    });
  }

  // Modal Concentración: Controles de inicio, pausa y reinicio
  const btnToggleFocus = document.getElementById('btnToggleFocusTimer');
  const btnResetFocus = document.getElementById('btnResetFocusTimer');
  if (btnToggleFocus && btnResetFocus) {
    btnToggleFocus.addEventListener('click', () => {
      if (isFocusTimerRunning) {
        clearInterval(activeToolTimer);
        isFocusTimerRunning = false;
        btnToggleFocus.textContent = "Continuar";
      } else {
        startFocusTimer();
        btnToggleFocus.textContent = "Pausar";
      }
    });

    btnResetFocus.addEventListener('click', () => {
      clearInterval(activeToolTimer);
      isFocusTimerRunning = false;
      focusTimeRemaining = 180;
      const timerEl = document.getElementById('focusCountdown');
      if (timerEl) timerEl.textContent = "03:00";
      btnToggleFocus.textContent = "Iniciar";
    });
  }
}

function openToolModal(toolKey) {
  closeAllToolModals();
  const modal = document.getElementById(`modalTool_${toolKey}`);
  if (modal) {
    modal.classList.add('open');
    if (toolKey === 'respiracion') startModalBreathing();
    if (toolKey === 'visual') startVisualRestTimer();
    if (toolKey === 'concentracion') {
      focusTimeRemaining = 180;
      isFocusTimerRunning = false;
      const timerEl = document.getElementById('focusCountdown');
      const btnToggle = document.getElementById('btnToggleFocusTimer');
      if (timerEl) timerEl.textContent = "03:00";
      if (btnToggle) btnToggle.textContent = "Iniciar";
    }
  }
}

function closeAllToolModals() {
  const modals = document.querySelectorAll('.wellness-tool-modal');
  modals.forEach(m => m.classList.remove('open'));
  if (activeToolTimer) clearInterval(activeToolTimer);
  isFocusTimerRunning = false;
}

// 1. Respiración 4-4-4 con sonido armónico adaptativo
function startModalBreathing() {
  const circle = document.getElementById('modalBreathCircle');
  const prompt = document.getElementById('modalBreathPrompt');
  const counter = document.getElementById('modalBreathCounter');
  if (!circle || !prompt) return;

  let seconds = 36;
  let phase = 0; // 0=inhalar (4s), 1=sostener (4s), 2=exhalar (4s)

  function stepPhase() {
    if (phase === 0) {
      prompt.textContent = "Inhala profundamente por la nariz...";
      circle.className = "modal-breath-circle inhale";
      playHarmonicChime(432, 2.5); // Tono de inhalación en 432 Hz
    } else if (phase === 1) {
      prompt.textContent = "Sostén el aire suavemente...";
      circle.className = "modal-breath-circle hold";
    } else {
      prompt.textContent = "Exhala lento por la boca...";
      circle.className = "modal-breath-circle exhale";
      playHarmonicChime(324, 2.5); // Tono de exhalación más grave
    }
    phase = (phase + 1) % 3;
  }

  stepPhase();
  if (activeToolTimer) clearInterval(activeToolTimer);
  activeToolTimer = setInterval(() => {
    seconds--;
    if (counter) counter.textContent = `${seconds}s restantes`;
    if (seconds % 4 === 0) stepPhase();
    if (seconds <= 0) {
      clearInterval(activeToolTimer);
      prompt.textContent = "¡Excelente sesión de respiración completada!";
      circle.className = "modal-breath-circle";
      playHarmonicChime(528, 3.0); // Tono final armónico de cierre
      incrementWeeklyPauses();
      showCreSerToast("Pausa de respiración registrada con éxito.", "🫁");
    }
  }, 1000);
}

// 2. Descanso Visual 20-20-20
function startVisualRestTimer() {
  const timerEl = document.getElementById('visualRestTimer');
  if (!timerEl) return;
  let sec = 20;
  if (activeToolTimer) clearInterval(activeToolTimer);
  playHarmonicChime(432, 1.0);
  activeToolTimer = setInterval(() => {
    sec--;
    timerEl.textContent = `00:${sec < 10 ? '0' + sec : sec}`;
    if (sec <= 0) {
      clearInterval(activeToolTimer);
      timerEl.textContent = "¡Descanso visual completado! Parpadea suavemente.";
      playHarmonicChime(528, 2.0);
      incrementWeeklyPauses();
      showCreSerToast("Descanso visual completado.", "👁️");
    }
  }, 1000);
}

// 3. Temporizador de Concentración
function startFocusTimer() {
  const timerEl = document.getElementById('focusCountdown');
  if (!timerEl) return;
  isFocusTimerRunning = true;
  if (activeToolTimer) clearInterval(activeToolTimer);
  playHarmonicChime(432, 1.0);

  activeToolTimer = setInterval(() => {
    focusTimeRemaining--;
    const m = Math.floor(focusTimeRemaining / 60);
    const s = focusTimeRemaining % 60;
    timerEl.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    if (focusTimeRemaining <= 0) {
      clearInterval(activeToolTimer);
      isFocusTimerRunning = false;
      timerEl.textContent = "¡Tiempo cumplido! Tómate una pausa.";
      playHarmonicChime(528, 2.5);
      showCreSerToast("Intervalo de foco mental finalizado.", "🎯");
    }
  }, 1000);
}

/* ==========================================================================
   4. Métricas Semanales de Bienestar (Sin diagnósticos)
   ========================================================================== */
function initWeeklyStats() {
  const streakEl = document.getElementById('statStreakDays');
  const pausesEl = document.getElementById('statTotalPauses');
  const reflectionsEl = document.getElementById('statTotalReflections');
  const habitsEl = document.getElementById('statTotalHabits');

  const streak = localStorage.getItem('creser-wellness-streak') || '5';
  const pauses = localStorage.getItem('creser-wellness-pauses') || '12';
  const journal = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
  const habits = localStorage.getItem('creser-wellness-habits-count') || '3';

  if (streakEl) streakEl.textContent = `${streak} días`;
  if (pausesEl) pausesEl.textContent = `${pauses}`;
  if (reflectionsEl) reflectionsEl.textContent = `${journal.length || 5}`;
  if (habitsEl) habitsEl.textContent = `${habits} cumplidos`;
}

function incrementWeeklyStreak() {
  const cur = parseInt(localStorage.getItem('creser-wellness-streak') || '5', 10) + 1;
  localStorage.setItem('creser-wellness-streak', cur.toString());
  initWeeklyStats();
}

function incrementWeeklyPauses() {
  const cur = parseInt(localStorage.getItem('creser-wellness-pauses') || '12', 10) + 1;
  localStorage.setItem('creser-wellness-pauses', cur.toString());
  initWeeklyStats();
}

/* ==========================================================================
   5. Diario Emocional y Gratitud con Historial, Búsqueda, Filtros y Exportación
   ========================================================================== */
function initWellnessJournal() {
  const form = document.getElementById('formWellnessJournal');
  const list = document.getElementById('wellnessJournalList');
  const btnPatterns = document.getElementById('btnViewJournalPatterns');
  const btnReset = document.getElementById('btnResetJournalForm');
  const btnExport = document.getElementById('btnExportJournal');
  const searchInput = document.getElementById('journalSearchInput');
  const categoryFilter = document.getElementById('journalCategoryFilter');
  const countEl = document.getElementById('journalEntriesCount');
  const textarea = document.getElementById('journalEntryText');
  const wordCounterEl = document.getElementById('journalWordCounter');
  const charCounterEl = document.getElementById('journalCharCounter');
  const emotionChips = document.querySelectorAll('.journal-emotion-chip');

  let selectedJournalEmotion = '😌 En calma';

  // Manejo de chips de emoción
  emotionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      emotionChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedJournalEmotion = chip.dataset.emotion || '😌 En calma';
    });
  });

  // Contador en tiempo real de palabras y caracteres
  if (textarea && wordCounterEl && charCounterEl) {
    textarea.addEventListener('input', () => {
      const text = textarea.value.trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = textarea.value.length;
      const readMin = Math.ceil(words / 150) || 1;

      wordCounterEl.textContent = `${words} palabra${words === 1 ? '' : 's'} | ~${words > 0 ? readMin : 0} min de lectura`;
      charCounterEl.textContent = `${chars} caracter${chars === 1 ? '' : 'es'}`;
    });
  }

  // Renderizado dinámico del listado de reflexiones
  function renderJournalList() {
    if (!list) return;
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    const query = (searchInput?.value || '').toLowerCase().trim();
    const cat = categoryFilter?.value || 'todos';

    let filtered = entries.filter(e => {
      const matchCat = (cat === 'todos') || (e.type === cat);
      const matchQuery = !query || 
        (e.title && e.title.toLowerCase().includes(query)) ||
        (e.text && e.text.toLowerCase().includes(query)) ||
        (e.emotion && e.emotion.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });

    if (countEl) countEl.textContent = `${filtered.length}`;

    if (filtered.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:1.5rem; color:var(--ink-muted);">
          <span style="font-size:1.8rem; display:block; margin-bottom:0.4rem;">📖</span>
          <p class="small">No se encontraron reflexiones con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map((e, idx) => {
      const originalIndex = entries.findIndex(item => item.timestamp === e.timestamp);
      return `
        <div class="journal-entry-card" data-index="${originalIndex}">
          <div class="journal-entry-header">
            <div class="journal-entry-badges">
              <span class="journal-entry-type-badge">${escapeHtml(e.type || 'Reflexión')}</span>
              ${e.emotion ? `<span class="journal-entry-emotion-badge">${escapeHtml(e.emotion)}</span>` : ''}
            </div>
            <span style="font-size:0.78rem; color:var(--ink-muted);">${escapeHtml(e.date || '')}</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:700; margin:0.3rem 0; color:var(--ink-primary);">${escapeHtml(e.title || 'Nota personal')}</h4>
          <p style="font-size:0.88rem; color:var(--ink-secondary); margin:0; line-height:1.45; white-space:pre-wrap;">${escapeHtml(e.text || '')}</p>
          <div class="journal-entry-actions">
            <button type="button" class="journal-action-btn" onclick="copyJournalEntryText(${originalIndex})">📋 Copiar</button>
            <button type="button" class="journal-action-btn btn-delete" onclick="deleteJournalEntry(${originalIndex})">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Eventos de búsqueda y filtrado
  if (searchInput) searchInput.addEventListener('input', renderJournalList);
  if (categoryFilter) categoryFilter.addEventListener('change', renderJournalList);

  // Limpiar formulario
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (form) form.reset();
      if (wordCounterEl) wordCounterEl.textContent = '0 palabras | ~0 min de lectura';
      if (charCounterEl) charCounterEl.textContent = '0 caracteres';
      emotionChips.forEach(c => c.classList.remove('active'));
      if (emotionChips[0]) emotionChips[0].classList.add('active');
      selectedJournalEmotion = '😌 En calma';
    });
  }

  // Abrir Centro de Exportación y Reporte Institucional CreSer
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      openExportReportModal();
    });
  }

  // Envío del formulario de diario
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('journalEntryType')?.value || 'Lo que siento';
      const title = document.getElementById('journalEntryTitle')?.value || '';
      const text = textarea?.value || '';

      if (!text.trim()) {
        showCreSerToast("Por favor escribe tu reflexión.", "✍️");
        return;
      }

      const entry = {
        type,
        emotion: selectedJournalEmotion,
        title: title.trim() || type,
        text: text.trim(),
        date: new Date().toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: new Date().toISOString()
      };

      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      entries.unshift(entry);
      localStorage.setItem('creser-journal-entries', JSON.stringify(entries));

      if (window.CreSerDB) {
        window.CreSerDB.saveJournalEntry(entry);
      }

      form.reset();
      if (wordCounterEl) wordCounterEl.textContent = '0 palabras | ~0 min de lectura';
      if (charCounterEl) charCounterEl.textContent = '0 caracteres';
      renderJournalList();
      initWeeklyStats();
      showCreSerToast("Tu reflexión ha sido guardada de forma segura y privada.", "✅");
    });
  }

  // Modal de análisis de patrones
  if (btnPatterns) {
    btnPatterns.addEventListener('click', () => {
      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      const modalPatterns = document.getElementById('modalJournalPatterns');
      const contentEl = document.getElementById('journalPatternsContent');

      if (!modalPatterns || !contentEl) return;

      if (entries.length === 0) {
        contentEl.innerHTML = `
          <div style="background:var(--surface-2); border-radius:var(--radius-md); padding:1.25rem; text-align:center;">
            <p class="small text-muted" style="margin:0;">Aún no has registrado reflexiones. Al escribir tus primeras notas, aquí podrás visualizar tus estadísticas emocionales y hábitos de gratitud.</p>
          </div>
        `;
      } else {
        // Cálculo de métricas
        const typeCounts = {};
        const emotionCounts = {};
        let totalWords = 0;

        entries.forEach(e => {
          typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
          if (e.emotion) emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
          totalWords += (e.text ? e.text.split(/\s+/).length : 0);
        });

        const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

        contentEl.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
            <div style="background:var(--surface-2); padding:0.9rem; border-radius:var(--radius-sm); text-align:center;">
              <span style="font-size:1.5rem; font-weight:800; color:var(--primary);">${entries.length}</span>
              <p class="small text-muted" style="margin:0.2rem 0 0;">Total reflexiones</p>
            </div>
            <div style="background:var(--surface-2); padding:0.9rem; border-radius:var(--radius-sm); text-align:center;">
              <span style="font-size:1.5rem; font-weight:800; color:var(--secondary);">${totalWords}</span>
              <p class="small text-muted" style="margin:0.2rem 0 0;">Palabras escritas</p>
            </div>
          </div>
          <div style="background:var(--surface-2); border-left:4px solid var(--primary); padding:0.9rem 1rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.88rem; line-height:1.5;">
            <strong>🌟 Práctica más recurrente:</strong> ${topType ? topType[0] : 'Gratitud diaria'} (${topType ? topType[1] : 0} entradas).<br>
            <strong>🌿 Emoción predominante:</strong> ${topEmotion ? topEmotion[0] : '😌 En calma'}.<br>
            <em>Escribir regularmente estimula la autorregulación y la claridad mental.</em>
          </div>
        `;
      }

      modalPatterns.classList.add('open');
    });
  }

  // Hacer accesibles globalmente las funciones de copia y borrado
  window.copyJournalEntryText = (index) => {
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    const entry = entries[index];
    if (entry && entry.text) {
      navigator.clipboard.writeText(`[${entry.type}] ${entry.title}\n\n${entry.text}`).then(() => {
        showCreSerToast("Reflexión copiada al portapapeles.", "📋");
      }).catch(() => {
        showCreSerToast("No se pudo copiar el texto.", "⚠️");
      });
    }
  };

  window.deleteJournalEntry = (index) => {
    if (confirm("¿Estás seguro/a de que deseas eliminar esta reflexión de tu diario privado?")) {
      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      entries.splice(index, 1);
      localStorage.setItem('creser-journal-entries', JSON.stringify(entries));
      renderJournalList();
      initWeeklyStats();
      showCreSerToast("Reflexión eliminada de tu diario.", "🗑️");
    }
  };

  renderJournalList();
}

/* ==========================================================================
   5.1. Centro de Exportación y Reporte Institucional CreSer (Generador Oficial)
   ========================================================================== */

/**
 * ¿POR QUÉ?: Abrir el modal de exportación personalizada cuando el usuario solicita descargar sus registros.
 * ¿CÓMO?: Añadiendo la clase 'open' al modal #modalExportReport y actualizando estados de selección.
 * ¿PARA QUÉ?: Permitir al usuario configurar el reporte a su medida antes de generar el archivo.
 */
function openExportReportModal() {
  closeAllToolModals();
  const modal = document.getElementById('modalExportReport');
  if (modal) {
    modal.classList.add('open');
  }
}

/**
 * ¿POR QUÉ?: Gestionar los eventos de selección de formato, vista previa y descarga del reporte oficial.
 * ¿CÓMO?: Escuchando cambios en los radio buttons, checkboxes y botones de acción del modal.
 * ¿PARA QUÉ?: Ofrecer una experiencia de descarga editorial fluida, configurable y prémium.
 */
function initExportReportCenter() {
  const modal = document.getElementById('modalExportReport');
  const btnPreview = document.getElementById('btnPreviewReport');
  const btnDownload = document.getElementById('btnConfirmGenerateReport');
  const formatCards = document.querySelectorAll('.export-format-card');
  const radioFormats = document.querySelectorAll('input[name="exportFormat"]');

  if (!modal) return;

  // Sincronizar estilo visual de la tarjeta de formato seleccionada
  radioFormats.forEach(radio => {
    radio.addEventListener('change', () => {
      formatCards.forEach(card => card.classList.remove('active'));
      const activeCard = radio.closest('.export-format-card');
      if (activeCard) activeCard.classList.add('active');
    });
  });

  formatCards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        formatCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      }
    });
  });

  // Botón Vista Previa del Reporte
  if (btnPreview) {
    btnPreview.addEventListener('click', () => {
      const options = getExportOptions();
      const reportHtml = buildCreSerReportHTML(options);
      
      const previewWindow = window.open('', '_blank', 'width=950,height=800,scrollbars=yes');
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(reportHtml);
        previewWindow.document.close();
      } else {
        showCreSerToast("Por favor permite las ventanas emergentes para ver la vista previa.", "⚠️");
      }
    });
  }

  // Botón Generar y Descargar Reporte
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const options = getExportOptions();

      if (options.format === 'json') {
        // Descarga de archivo estructurado JSON
        downloadJsonReport(options);
      } else {
        // Generar y descargar documento oficial HTML/PDF
        downloadPdfOfficialReport(options);
      }
    });
  }
}

/**
 * ¿POR QUÉ?: Recopilar las opciones seleccionadas en el formulario del modal de exportación.
 * ¿CÓMO?: Leyendo los valores de los checkboxes, select de fecha y radio buttons.
 * ¿PARA QUÉ?: Pasar un objeto de configuración limpio al generador de reportes.
 */
function getExportOptions() {
  const incJournal = document.getElementById('exportIncludeJournal')?.checked ?? true;
  const incStats = document.getElementById('exportIncludeStats')?.checked ?? true;
  const incSleep = document.getElementById('exportIncludeSleep')?.checked ?? true;
  const incHabits = document.getElementById('exportIncludeHabits')?.checked ?? true;
  const dateRange = document.getElementById('exportDateRange')?.value || 'all';
  const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';

  return {
    includeJournal: incJournal,
    includeStats: incStats,
    includeSleep: incSleep,
    includeHabits: incHabits,
    dateRange: dateRange,
    format: format
  };
}

/**
 * ¿POR QUÉ?: Descargar los datos seleccionados en formato técnico JSON.
 * ¿CÓMO?: Construyendo un Blob y disparando la descarga con un anchor temporal.
 * ¿PARA QUÉ?: Permitir respaldo crudo de datos a usuarios avanzados.
 */
function downloadJsonReport(options) {
  const exportPayload = {
    institucion: "CreSer — Centro de Bienestar Emocional",
    pais: "Nicaragua",
    fechaExportacion: new Date().toISOString(),
    fechaFormateada: new Date().toLocaleString('es-NI'),
    usuario: localStorage.getItem('creser-user-name') || localStorage.getItem('creser-user-email') || "Usuario Confidencial",
    configuracion: options,
    datos: {}
  };

  if (options.includeJournal) {
    exportPayload.datos.diario = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
  }
  if (options.includeStats) {
    exportPayload.datos.estadisticas = {
      pausasRealizadas: localStorage.getItem('creser-weekly-pauses') || '0',
      diasConstancia: '5'
    };
  }
  if (options.includeSleep) {
    exportPayload.datos.sueno = JSON.parse(localStorage.getItem('creser-last-sleep-log') || '{}');
  }
  if (options.includeHabits) {
    exportPayload.datos.habitos = JSON.parse(localStorage.getItem('creser-wellness-habits') || '{}');
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Reporte_Datos_CreSer_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  closeAllToolModals();
  showCreSerToast("Respaldo JSON generado y descargado con éxito.", "📥");
}

/**
 * ¿POR QUÉ?: Descargar o imprimir el Reporte Institucional CreSer con formato editorial prémium.
 * ¿CÓMO?: Creando una ventana emergente con el HTML maquetado y ejecutando window.print().
 * ¿PARA QUÉ?: Entregar un documento con diseño oficial, membrete y sellos institucionales.
 */
function downloadPdfOfficialReport(options) {
  const reportHtml = buildCreSerReportHTML(options);
  const printWindow = window.open('', '_blank', 'width=950,height=800,scrollbars=yes');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    
    // Auto-disparar diálogo de impresión a PDF tras cargar estilos
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    });

    closeAllToolModals();
    showCreSerToast("Reporte Institucional preparado para descarga/impresión en PDF.", "📄");
  } else {
    // Si el navegador bloquea popups, descargar como archivo HTML imprimible
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `Reporte_Bienestar_CreSer_${new Date().toISOString().slice(0, 10)}.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    closeAllToolModals();
    showCreSerToast("Reporte Institucional descargado en formato imprimible.", "📥");
  }
}

/**
 * ¿POR QUÉ?: Construir el documento HTML completo del Reporte Institucional con maquetación de alto nivel.
 * ¿CÓMO?: Generando un template HTML estructurado con estilos inline y reglas @media print optimizadas.
 * ¿PARA QUÉ?: Garantizar que el documento impreso o en PDF luzca impecable y transmita la identidad visual de CreSer.
 */
function buildCreSerReportHTML(options) {
  const userName = localStorage.getItem('creser-user-name') || localStorage.getItem('creser-user-email') || "Usuario Registrado";
  const now = new Date();
  const emissionCode = 'CR-BN-' + Math.floor(100000 + Math.random() * 900000);
  const emissionDate = now.toLocaleDateString('es-NI', { dateStyle: 'full' });
  const emissionTime = now.toLocaleTimeString('es-NI', { timeStyle: 'short' });

  // 1. Filtrado de entradas de diario
  let allEntries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
  let filteredEntries = allEntries;
  
  if (options.dateRange === '7days') {
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    filteredEntries = allEntries.filter(e => e.timestamp && new Date(e.timestamp) >= sevenDaysAgo);
  } else if (options.dateRange === '30days') {
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    filteredEntries = allEntries.filter(e => e.timestamp && new Date(e.timestamp) >= thirtyDaysAgo);
  }

  // 2. Cálculo de métricas
  const streakDays = "5 días";
  const totalPauses = localStorage.getItem('creser-weekly-pauses') || "12";
  const totalReflections = filteredEntries.length;
  const sleepLog = JSON.parse(localStorage.getItem('creser-last-sleep-log') || '{"horas":"7.5","calidad":"Buena","energia":"Normal"}');

  // 3. Frecuencia emocional
  const emotionCounts = {};
  filteredEntries.forEach(e => {
    if (e.emotion) {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    }
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Reporte Oficial de Autocuidado y Bienestar — CreSer Nicaragua</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      line-height: 1.6;
      padding: 2.5rem 1rem;
      -webkit-font-smoothing: antialiased;
    }

    .report-wrapper {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.07);
      padding: 3.5rem;
      border: 1px solid #e2e8f0;
      position: relative;
    }

    /* Barra Superior con Marca y Metadatos de Emisión */
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 2rem;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 2.25rem;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-logo-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #2563eb 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
    }

    .brand-text h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .brand-text p {
      font-size: 0.88rem;
      color: #64748b;
      margin-top: 2px;
      font-weight: 500;
    }

    .emission-meta {
      text-align: right;
      font-size: 0.82rem;
      color: #64748b;
    }

    .emission-code {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 3px 10px;
      border-radius: 8px;
      margin-bottom: 4px;
    }

    /* Insignia de Confidencialidad */
    .seal-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #ecfdf5;
      color: #059669;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 5px 12px;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
      margin-bottom: 1.8rem;
    }

    /* Secciones del Documento */
    .doc-section {
      margin-bottom: 2.5rem;
    }

    .doc-section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin-bottom: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-left: 4px solid #2563eb;
      padding-left: 0.85rem;
    }

    /* Cuadrícula de KPIs */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.15rem 1rem;
      text-align: center;
    }

    .kpi-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      color: #2563eb;
      margin-bottom: 0.15rem;
    }

    .kpi-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }

    /* Frecuencia Emocional */
    .emotion-freq-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.75rem;
    }

    .emotion-freq-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .emotion-freq-chip strong {
      color: #2563eb;
      font-weight: 700;
    }

    /* Tarjetas de Diario */
    .journal-entry-item {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1.35rem 1.5rem;
      margin-bottom: 1rem;
      page-break-inside: avoid;
    }

    .entry-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .entry-tags {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .tag-category {
      font-size: 0.75rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 9px;
      border-radius: 9999px;
    }

    .tag-emotion {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 9px;
      border-radius: 9999px;
    }

    .entry-date {
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .entry-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.4rem;
    }

    .entry-text {
      font-size: 0.92rem;
      color: #334155;
      line-height: 1.65;
      white-space: pre-wrap;
    }

    /* Bloque de Hábitos y Sueño */
    .summary-info-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-label {
      color: #64748b;
      font-weight: 500;
    }

    .summary-val {
      font-weight: 700;
      color: #0f172a;
    }

    /* Pie Institucional */
    .report-footer {
      margin-top: 3.5rem;
      padding-top: 2rem;
      border-top: 1.5px dashed #cbd5e1;
      text-align: center;
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.6;
    }

    .helpline-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin: 1.25rem 0 1rem;
      font-size: 0.82rem;
      color: #991b1b;
    }

    /* Botón flotante de impresión */
    .floating-print-bar {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      display: flex;
      gap: 0.75rem;
      z-index: 1000;
    }

    .btn-print-doc {
      background: linear-gradient(135deg, #2563eb 0%, #059669 100%);
      color: #ffffff;
      border: none;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s ease;
    }

    .btn-print-doc:hover {
      transform: translateY(-2px);
    }

    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .report-wrapper {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      .floating-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="floating-print-bar">
    <button class="btn-print-doc" onclick="window.print()">
      <span>🖨️ Imprimir / Guardar en PDF</span>
    </button>
  </div>

  <div class="report-wrapper">
    
    <!-- Encabezado Institucional CreSer -->
    <header class="report-header">
      <div class="brand-box">
        <div class="brand-logo-icon">🌿</div>
        <div class="brand-text">
          <h1>CreSer Nicaragua</h1>
          <p>Centro Integral de Bienestar Emocional & Autocuidado</p>
        </div>
      </div>
      <div class="emission-meta">
        <span class="emission-code">${emissionCode}</span>
        <div><strong>Emisión:</strong> ${emissionDate}</div>
        <div><strong>Hora:</strong> ${emissionTime}</div>
        <div><strong>Titular:</strong> ${escapeHtml(userName)}</div>
      </div>
    </header>

    <div class="seal-pill">
      <span>🛡️</span> Documento Confidencial de Autocuidado & Bienestar
    </div>

    <!-- 1. Resumen Ejecutivo de Métricas -->
    ${options.includeStats ? `
    <section class="doc-section">
      <h2 class="doc-section-title">📊 Resumen Ejecutivo de Métricas</h2>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${streakDays}</div>
          <div class="kpi-label">Constancia Activa</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${totalPauses}</div>
          <div class="kpi-label">Pausas Realizadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${totalReflections}</div>
          <div class="kpi-label">Reflexiones en Diario</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${sleepLog.horas || '7.5'}h</div>
          <div class="kpi-label">Promedio de Sueño</div>
        </div>
      </div>

      ${Object.keys(emotionCounts).length > 0 ? `
      <div style="margin-top:1.25rem;">
        <strong style="font-size:0.88rem; color:#475569;">Distribución de Emociones Registradas:</strong>
        <div class="emotion-freq-wrap">
          ${Object.entries(emotionCounts).map(([emotion, count]) => `
            <span class="emotion-freq-chip">
              <span>${escapeHtml(emotion)}</span>
              <strong>(${count})</strong>
            </span>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </section>
    ` : ''}

    <!-- 2. Diario Emocional y Reflexiones -->
    ${options.includeJournal ? `
    <section class="doc-section">
      <h2 class="doc-section-title">📖 Diario Emocional y Reflexiones (${filteredEntries.length})</h2>
      
      ${filteredEntries.length === 0 ? `
        <div style="padding:1.5rem; text-align:center; background:#f8fafc; border-radius:14px; color:#64748b; font-size:0.9rem;">
          No hay reflexiones registradas en el rango de fechas seleccionado.
        </div>
      ` : filteredEntries.map(e => `
        <div class="journal-entry-item">
          <div class="entry-head">
            <div class="entry-tags">
              <span class="tag-category">${escapeHtml(e.type || 'Reflexión')}</span>
              ${e.emotion ? `<span class="tag-emotion">${escapeHtml(e.emotion)}</span>` : ''}
            </div>
            <span class="entry-date">${escapeHtml(e.date || '')}</span>
          </div>
          <h3 class="entry-title">${escapeHtml(e.title || 'Reflexión Personal')}</h3>
          <p class="entry-text">${escapeHtml(e.text || '')}</p>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- 3. Sueño, Energía y Hábitos -->
    ${(options.includeSleep || options.includeHabits) ? `
    <section class="doc-section">
      <h2 class="doc-section-title">🌙 Hábitos, Descanso y Nivel de Energía</h2>
      <div class="summary-info-box">
        ${options.includeSleep ? `
        <div class="summary-row">
          <span class="summary-label">Último registro de sueño:</span>
          <span class="summary-val">${escapeHtml(sleepLog.horas || '7.5')} horas (Calidad: ${escapeHtml(sleepLog.calidad || 'Buena')})</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Nivel de energía matutino:</span>
          <span class="summary-val">${escapeHtml(sleepLog.energia || 'Normal')}</span>
        </div>
        ` : ''}
        ${options.includeHabits ? `
        <div class="summary-row">
          <span class="summary-label">Compromisos de autocuidado:</span>
          <span class="summary-val">Hidratación consciente, Pausas activas y Desconexión nocturna</span>
        </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <!-- Pie de Página Institucional y Avisos Legales -->
    <footer class="report-footer">
      <div class="helpline-box">
        ⚠️ <strong>Aviso Importante:</strong> Este documento es un reporte personal de autorregulación y autocuidado. 
        <strong>No constituye un diagnóstico clínico ni sustituye la atención médica o psiquiátrica especializada.</strong>
        En caso de emergencia o crisis en Nicaragua, comunícate con la <strong>Línea de Emergencias (118 / 102)</strong> o <strong>Cruz Roja (+505 2265-2081)</strong>.
      </div>
      <p>© ${now.getFullYear()} CreSer — Plataforma de Bienestar Emocional en Nicaragua. Documento estrictamente confidencial.</p>
    </footer>

  </div>

</body>
</html>`;
}

/* ==========================================================================
   6. Sueño, Descanso y Nivel de Energía
   ========================================================================== */
function initSleepAndEnergy() {
  const formSleep = document.getElementById('formSleepTracker');
  const energyBtns = document.querySelectorAll('.energy-battery-btn');
  let selectedEnergy = 'Normal';

  energyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      energyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEnergy = btn.dataset.energy || 'Normal';
      showCreSerToast(`Nivel de energía seleccionado: ${selectedEnergy}`, '🔋');
    });
  });

  if (formSleep) {
    formSleep.addEventListener('submit', (e) => {
      e.preventDefault();
      const sleepHours = document.getElementById('sleepHoursInput')?.value || '7.5';
      const sleepQuality = document.getElementById('sleepQualityInput')?.value || 'Buena';

      const sleepLog = {
        horas: sleepHours,
        calidad: sleepQuality,
        energia: selectedEnergy,
        fecha: new Date().toLocaleDateString('es-NI')
      };

      localStorage.setItem('creser-last-sleep-log', JSON.stringify(sleepLog));
      showCreSerToast(`Descanso guardado: ${sleepHours}h (${sleepQuality}).`, "🌙");
    });
  }
}

/* ==========================================================================
   7. Seguimiento de Hábitos Diarios con Barra de Progreso Dinámica
   ========================================================================== */
function initWellnessHabits() {
  const checkboxes = document.querySelectorAll('.habit-check-input');
  const fillEl = document.getElementById('habitProgressFill');
  const percentEl = document.getElementById('habitProgressPercent');

  function updateHabitsProgressBar() {
    const total = checkboxes.length || 5;
    const completed = document.querySelectorAll('.habit-check-input:checked').length;
    const pct = Math.round((completed / total) * 100);

    if (fillEl) fillEl.style.width = `${pct}%`;
    if (percentEl) percentEl.textContent = `${pct}% (${completed}/${total})`;
    localStorage.setItem('creser-wellness-habits-count', completed.toString());
    initWeeklyStats();
  }

  checkboxes.forEach(cb => {
    const saved = localStorage.getItem(`creser-habit-${cb.id}`);
    if (saved === '1') cb.checked = true;

    cb.addEventListener('change', () => {
      localStorage.setItem(`creser-habit-${cb.id}`, cb.checked ? '1' : '0');
      updateHabitsProgressBar();
      if (cb.checked) {
        showCreSerToast("¡Hábito saludable completado!", "🌟");
      }
    });
  });

  updateHabitsProgressBar();
}

/* ==========================================================================
   8. Biblioteca de Bienestar (Catálogo Completo y Lector Funcional)
   ========================================================================== */
const WELLNESS_ARTICLES = [
  // 1. Estrés
  {
    id: "estres-1",
    cat: "estres",
    title: "El Ciclo Biológico del Estrés y Cómo Cerrarlo",
    time: "5 min de lectura",
    desc: "Aprende por qué el cuerpo se mantiene en alerta y cómo desactivar la sobrecarga fisiológica mediante micro-descargas.",
    takeaway: "El estrés no solo se procesa mentalmente; tu cuerpo necesita señales físicas concretas (respiración profunda o movimiento) para entender que el peligro ha pasado.",
    body: `
      <h4>¿Por qué el estrés se acumula?</h4>
      <p>Cuando percibes una alta exigencia, tu sistema nervioso simpático secreta cortisol y adrenalina. Si no realizas una actividad que 'cierre el ciclo', esa energía queda atrapada en forma de tensión muscular y fatiga.</p>
      <h4>Pasos Prácticos para Cerrar el Ciclo:</h4>
      <ol class="reader-steps-list">
        <li><strong>Exhalación prolongada:</strong> Haz 3 respiraciones profundas donde la exhalación sea el doble de larga que la inhalación.</li>
        <li><strong>Movimiento liberador:</strong> Camina 5 minutos, estira tus brazos o sacude suavemente las manos.</li>
        <li><strong>Pausa sensorial:</strong> Bebe un vaso de agua fresca prestando atención a cada sorbo.</li>
      </ol>
    `,
    suggestedTool: "respiracion",
    suggestedToolName: "Probar Pausa de Respiración 4-4-4"
  },
  {
    id: "estres-2",
    cat: "estres",
    title: "Manejo de Cargas Múltiples sin Agotamiento",
    time: "6 min de lectura",
    desc: "Estrategias de priorización cognitiva para ordenar tareas abrumadoras sin perder la calma.",
    takeaway: "No tienes que resolver todo hoy. Dividir los problemas en micro-bloques reduce la reactividad del cerebro.",
    body: `
      <h4>La regla de los 3 focos diarios</h4>
      <p>Al comenzar el día, selecciona únicamente 3 objetivos esenciales. Todo lo demás es secundario. Esto evita la parálisis por saturación mental.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Anota todos tus pendientes en papel para vaciar la memoria de trabajo.</li>
        <li>Elige una sola tarea y dedícale 15 minutos continuos sin revisar notificaciones.</li>
        <li>Haz una pausa de 2 minutos antes de pasar a la siguiente tarea.</li>
      </ol>
    `,
    suggestedTool: "concentracion",
    suggestedToolName: "Probar Intervalo de Foco Mental"
  },

  // 2. Ansiedad
  {
    id: "ansiedad-1",
    cat: "ansiedad",
    title: "Entendiendo la Respuesta de Lucha o Huida",
    time: "6 min de lectura",
    desc: "Cómo funciona la amígdala cerebral y técnicas para recuperar la sensación de seguridad interior.",
    takeaway: "La ansiedad es un mecanismo de protección descalibrado, no un defecto personal. Nombrarla ayuda a desactivar la amígdala.",
    body: `
      <h4>De la alarma a la calma</h4>
      <p>Cuando sientes palpitaciones o agitación, tu cerebro cree que hay una amenaza inminente. El lenguaje y los sentidos son el puente más rápido para indicarle a tu sistema que estás a salvo.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Di mentalmente: 'Estoy sintiendo activación, pero en este momento estoy en un espacio seguro'.</li>
        <li>Siente la firmeza del suelo bajo tus pies (técnica de anclaje).</li>
        <li>Realiza una secuencia de Grounding 5-4-3-2-1.</li>
      </ol>
    `,
    suggestedTool: "grounding",
    suggestedToolName: "Probar Grounding 5-4-3-2-1"
  },
  {
    id: "ansiedad-2",
    cat: "ansiedad",
    title: "Cómo Gestionar Pensamientos Catastróficos",
    time: "5 min de lectura",
    desc: "Técnicas de reestructuración cognitiva para cuestionar escenarios hipotéticos exagerados.",
    takeaway: "Tener un pensamiento no significa que sea un hecho real. Aprende a observarlo como una nube que pasa.",
    body: `
      <h4>El filtro del realismo</h4>
      <p>Nuestra mente tiende a anticipar el peor escenario posible. Pregúntate: ¿Qué evidencia real tengo de esto? ¿Qué es lo más probable que suceda en realidad?</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Escribe el pensamiento que te inquieta en una hoja o en tu diario.</li>
        <li>Escribe al lado una respuesta constructiva y compasiva.</li>
        <li>Suelta la necesidad de controlar lo impredecible.</li>
      </ol>
    `,
    suggestedTool: "escritura",
    suggestedToolName: "Escribir en el Diario Emocional"
  },

  // 3. Emociones
  {
    id: "emociones-1",
    cat: "emociones",
    title: "Nombrar para Calmar: Alfabetización Emocional",
    time: "4 min de lectura",
    desc: "Diferenciar entre molestia, frustración, tristeza y cansancio permite canalizar mejor cada vivencia.",
    takeaway: "Nombrar con precisión lo que sientes reduce en segundos la reactividad emocional en el cerebro.",
    body: `
      <h4>El poder del vocabulario emocional</h4>
      <p>A menudo decimos 'estoy mal', pero hay una gran diferencia entre sentirse decepcionado, abrumado o simplemente fatigado físicamente. Al precisar la emoción, la solución se vuelve evidente.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Consulta la rueda de emociones o el selector de bienestar.</li>
        <li>Ubica la emoción y valida su derecho a existir: 'Es natural que me sienta así'.</li>
        <li>Decide qué acción de autocuidado corresponde hoy.</li>
      </ol>
    `,
    suggestedTool: "pausa",
    suggestedToolName: "Hacer una Pausa Consciente"
  },
  {
    id: "emociones-2",
    cat: "emociones",
    title: "El Poder Científico de la Gratitud Diaria",
    time: "4 min de lectura",
    desc: "Cómo el entrenamiento intencional en gratitud reconfigura los circuitos de recompensa y serenidad.",
    takeaway: "La gratitud no niega las dificultades; expande tu campo de visión para reconocer también lo bueno.",
    body: `
      <h4>Neuroplasticidad y aprecio</h4>
      <p>Anotar 3 cosas sencillas por las que estás agradecido cada día reentrena tu atención, disminuyendo la rumiación negativa y fortaleciendo tu resiliencia.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Identifica un detalle pequeño de hoy (el sabor de una bebida, una conversación amable).</li>
        <li>Dedica 30 segundos a sentir el bienestar de ese recuerdo.</li>
        <li>Regístralo en tu diario de CreSer.</li>
      </ol>
    `,
    suggestedTool: "escritura",
    suggestedToolName: "Registrar Gratitud en mi Diario"
  },

  // 4. Sueño
  {
    id: "sueno-1",
    cat: "sueno",
    title: "Higiene del Sueño y Ritmos Circadianos",
    time: "5 min de lectura",
    desc: "Pautas basadas en evidencia para conciliar el descanso nocturno profundo y reparador.",
    takeaway: "La calidad de tu sueño comienza con los hábitos que realizas en las últimas dos horas del día.",
    body: `
      <h4>La química de la noche</h4>
      <p>La luz azul de los teléfonos y computadoras suprime la melatonina. Reducir la iluminación ambiental y la estimulación visual le avisa al cerebro que es hora de regenerarse.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Activa el modo nocturno o apaga pantallas 30 minutos antes de acostarte.</li>
        <li>Mantén tu habitación fresca, oscura y ventilada.</li>
        <li>Escucha un sonido ambiental de lluvia o bosque para inducir relajación.</li>
      </ol>
    `,
    suggestedTool: "sonidos",
    suggestedToolName: "Reproducir Sonidos Ambientales"
  },
  {
    id: "sueno-2",
    cat: "sueno",
    title: "¿Qué hacer si te despiertas a medianoche?",
    time: "4 min de lectura",
    desc: "Protocolo para no caer en la frustración cuando el insomnio interrumpe tu noche.",
    takeaway: "No mires el reloj constantemente. Quedarte frustrado en la cama refuerza la asociación de estrés con el sueño.",
    body: `
      <h4>Rompiendo el bucle del insomnio</h4>
      <p>Si pasan 20 minutos y no puedes dormir, levántate con luz tenue y realiza una actividad tranquila y no digital hasta que regrese la somnolencia.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Evita mirar la hora para no activar cálculos de estrés ('solo me quedan 4 horas').</li>
        <li>Lee unas páginas de un libro en papel o haz respiración diafragmática.</li>
        <li>Vuelve a la cama solo cuando sientas pesadez en los párpados.</li>
      </ol>
    `,
    suggestedTool: "respiracion",
    suggestedToolName: "Iniciar Respiración Suave"
  },

  // 5. Relaciones
  {
    id: "relaciones-1",
    cat: "relaciones",
    title: "Asertividad y Límites sin Culpa",
    time: "6 min de lectura",
    desc: "Aprende a decir 'no' de manera respetuosa y firme protegiendo tu salud mental.",
    takeaway: "Poner un límite no es un acto de egoísmo; es la condición indispensable para mantener relaciones sanas y honestas.",
    body: `
      <h4>El arte del límite empático</h4>
      <p>Decir que sí a todo por complacer genera resentimiento silencioso. Un límite claro protege tu energía y enseña a los demás cómo tratarte.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Usa la fórmula: 'Aprecio tu invitación/solicitud, pero en este momento no puedo comprometerme'.</li>
        <li>No des explicaciones excesivas que abran debate sobre tu decisión.</li>
        <li>Acepta que la incomodidad inicial es temporal.</li>
      </ol>
    `,
    suggestedTool: "escritura",
    suggestedToolName: "Reflexionar en el Diario"
  },
  {
    id: "relaciones-2",
    cat: "relaciones",
    title: "Empatía Activa y Validación Emocional",
    time: "5 min de lectura",
    desc: "Cómo acompañar a un ser querido que atraviesa un momento difícil sin darle consejos no pedidos.",
    takeaway: "A veces las personas no buscan soluciones inmediatas, sino sentirse escuchadas y comprendidas.",
    body: `
      <h4>La frase que calma</h4>
      <p>Decir 'todo va a estar bien' puede invalidar la emoción del otro. En su lugar, prueba: 'Veo que esto es muy difícil para ti, estoy aquí contigo'.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Escucha sin interrumpir ni pensar en qué responder de inmediato.</li>
        <li>Haz preguntas abiertas: '¿Cómo te estás sintiendo con eso?'.</li>
        <li>Ofrece apoyo concreto en lugar de consejos automáticos.</li>
      </ol>
    `,
    suggestedTool: "pausa",
    suggestedToolName: "Hacer una Pausa Consciente"
  },

  // 6. Hábitos
  {
    id: "habitos-1",
    cat: "habitos",
    title: "La Ciencia de los Microhábitos de 2 Minutos",
    time: "5 min de lectura",
    desc: "Cómo construir constancia sin depender de la motivación pasajera.",
    takeaway: "Un hábito debe ser tan pequeño al inicio que sea imposible decir que no.",
    body: `
      <h4>La regla de los dos minutos</h4>
      <p>Si quieres meditar, empieza por 1 minuto de respiración consciente. Si quieres leer, empieza por 1 página. La clave es la consistencia de la identidad, no la magnitud inicial.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Ancla el nuevo hábito a uno ya existente (ej. 'después de lavarme los dientes, haré 3 respiraciones').</li>
        <li>Marca tu cumplimiento en el checklist diario de CreSer.</li>
        <li>Celebra cada pequeño logro.</li>
      </ol>
    `,
    suggestedTool: "pausa",
    suggestedToolName: "Probar Pausa Consciente"
  },
  {
    id: "habitos-2",
    cat: "habitos",
    title: "Cómo Retomar tus Hábitos tras una Interrupción",
    time: "4 min de lectura",
    desc: "Estrategias de autocompasión para no abandonar tus metas cuando fallas un día.",
    takeaway: "Fallar una vez es un accidente; fallar dos veces seguidas es el inicio de un nuevo patrón.",
    body: `
      <h4>La regla del 'nunca dos veces'</h4>
      <p>La vida tiene imprevistos. Lo importante no es la perfección, sino la velocidad con la que retomas tu rutina con cariño y sin reproches.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>No te castigues ni juzgues por los días perdidos.</li>
        <li>Retoma hoy con la versión más reducida del hábito.</li>
        <li>Registra tu avance en tus retos de bienestar.</li>
      </ol>
    `,
    suggestedTool: "grounding",
    suggestedToolName: "Probar Anclaje Sensorial"
  },

  // 7. Concentración
  {
    id: "concentracion-1",
    cat: "concentracion",
    title: "Estado de Flujo y Eliminación de la Multitarea",
    time: "6 min de lectura",
    desc: "Cómo proteger tu atención en un mundo lleno de notificaciones e interrupciones constantes.",
    takeaway: "La multitarea es una ilusión cognitiva: el cerebro no hace dos cosas a la vez, cambia de foco perdiendo hasta el 40% de energía.",
    body: `
      <h4>Monotarea y bloques de tiempo</h4>
      <p>Dedicar 25 minutos continuos a una sola actividad te permite entrar en estado de flujo, donde el trabajo rinde más y genera menor fatiga mental.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Pon tu teléfono en modo 'No molestar' y fuera de tu campo visual.</li>
        <li>Activa el temporizador de foco mental de CreSer.</li>
        <li>Trabaja hasta que suene la campana y toma un descanso obligatorio.</li>
      </ol>
    `,
    suggestedTool: "concentracion",
    suggestedToolName: "Iniciar Foco de 3 Minutos"
  },
  {
    id: "concentracion-2",
    cat: "concentracion",
    title: "Descanso Visual y Alivio de la Fatiga de Pantallas",
    time: "3 min de lectura",
    desc: "La regla 20-20-20 explicada por oftalmólogos y neurocientíficos.",
    takeaway: "Mirar fijamente pantallas reseca la córnea y mantiene activo el sistema de alerta. La vista lejana relaja el cerebro.",
    body: `
      <h4>La regla 20-20-20</h4>
      <p>Cada 20 minutos de trabajo frente a un monitor, mira a una distancia de 20 pies (6 metros) durante 20 segundos. Tus ojos y tu nivel de energía te lo agradecerán.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Levanta la vista hacia una ventana o pasillo lejano.</li>
        <li>Parpadea suavemente varias veces.</li>
        <li>Inicia el temporizador de descanso visual en CreSer.</li>
      </ol>
    `,
    suggestedTool: "visual",
    suggestedToolName: "Iniciar Descanso Visual 20-20-20"
  },

  // 8. Autocuidado
  {
    id: "autocuidado-1",
    cat: "autocuidado",
    title: "Autocompasión Frente a la Autoexigencia Desmedida",
    time: "5 min de lectura",
    desc: "Aprende a hablarte a ti mismo como le hablarías a un buen amigo en momentos de error.",
    takeaway: "Tratarte con dureza no aumenta tu rendimiento; solo eleva el cortisol y la frustración.",
    body: `
      <h4>El diálogo interno consciente</h4>
      <p>La autocompasión consta de tres pilares: bondad hacia uno mismo, reconocimiento de la humanidad compartida y atención plena (mindfulness).</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Cuando notes un pensamiento autocrítico, haz una pausa.</li>
        <li>Pregúntate: '¿Le diría esto a alguien a quien quiero?'.</li>
        <li>Escribe una frase de apoyo en tu diario de bienestar.</li>
      </ol>
    `,
    suggestedTool: "escritura",
    suggestedToolName: "Escribir en el Diario"
  },
  {
    id: "autocuidado-2",
    cat: "autocuidado",
    title: "Los 7 Tipos de Descanso que Necesita el Ser Humano",
    time: "7 min de lectura",
    desc: "El descanso no es solo dormir: físico, mental, sensorial, creativo, emocional, social y espiritual.",
    takeaway: "Si duermes 8 horas y te levantas agotado/a, quizás te falta descanso sensorial, mental o emocional.",
    body: `
      <h4>Identificando tu déficit de descanso</h4>
      <p>El descanso sensorial requiere silencio y oscuridad; el descanso creativo requiere conectar con la naturaleza o el arte; el descanso emocional requiere ser auténtico sin fingir fortaleza.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Evalúa qué tipo de sobrecarga tuviste hoy.</li>
        <li>Elige una micro-pausa acorde a esa necesidad.</li>
        <li>Registra tu nivel de energía en el panel de bienestar.</li>
      </ol>
    `,
    suggestedTool: "pausa",
    suggestedToolName: "Realizar Pausa Consciente"
  },

  // 9. Familia
  {
    id: "familia-1",
    cat: "familia",
    title: "Conversaciones Difíciles sin Dañar los Vínculos",
    time: "6 min de lectura",
    desc: "Estructura de comunicación no violenta para dialogar en familia sobre temas sensibles.",
    takeaway: "Habla desde tus sentimientos y necesidades, no desde el juicio hacia las intenciones de los demás.",
    body: `
      <h4>Los 4 pasos de la comunicación empática</h4>
      <p>1. Observación objetiva de los hechos. 2. Expresar cómo te sientes. 3. Identificar tu necesidad insatisfecha. 4. Formular una petición concreta y negociable.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Elige un momento de calma, nunca en medio de una discusión acalorada.</li>
        <li>Usa frases con 'Yo siento...' en lugar de 'Tú siempre...'.</li>
        <li>Escucha activamente el punto de vista de la otra persona.</li>
      </ol>
    `,
    suggestedTool: "muscular",
    suggestedToolName: "Relajar la Tensión Corporal"
  },
  {
    id: "familia-2",
    cat: "familia",
    title: "Uso Saludable de la Tecnología en el Hogar",
    time: "5 min de lectura",
    desc: "Pautas para establecer momentos libres de pantallas y fortalecer la presencia compartida.",
    takeaway: "La presencia física sin atención compartida genera desconexión emocional en el entorno familiar.",
    body: `
      <h4>Zonas y horarios libres de dispositivos</h4>
      <p>Designar la mesa del comedor y la última hora de la noche como espacios sin pantallas estimula el diálogo y mejora la convivencia en el hogar.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Acuerden reglas claras y compartidas para todos los miembros.</li>
        <li>Fomenten juegos de mesa, charlas o caminatas juntos.</li>
        <li>Completa el reto de desconexión digital de 7 días.</li>
      </ol>
    `,
    suggestedTool: "pausa",
    suggestedToolName: "Pausa Consciente"
  },

  // 10. Académico
  {
    id: "academico-1",
    cat: "academico",
    title: "Técnicas de Organización ante Exámenes y Evaluaciones",
    time: "5 min de lectura",
    desc: "Cómo priorizar temas de estudio mediante repaso espaciado sin caer en agotamiento cognitivo.",
    takeaway: "Estudiar 30 minutos al día durante una semana es mucho más efectivo que 6 horas seguidas la noche anterior.",
    body: `
      <h4>Repaso activo y espaciado</h4>
      <p>Tu cerebro consolida la información durante el sueño. Explicar el tema con tus propias palabras genera conexiones neuronales duraderas y reduce la ansiedad previa al examen.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Haz mapas conceptuales y resúmenes con tus propios términos.</li>
        <li>Haz pausas de respiración cada 45 minutos de estudio.</li>
        <li>Duerme al menos 7 horas antes del día de la prueba.</li>
      </ol>
    `,
    suggestedTool: "concentracion",
    suggestedToolName: "Iniciar Foco de Concentración"
  },
  {
    id: "academico-2",
    cat: "academico",
    title: "Superando el Síndrome del Impostor en los Estudios",
    time: "6 min de lectura",
    desc: "Aprende a reconocer tus méritos legítimos y a no compararte destructivamente con otros.",
    takeaway: "Tener dudas es parte del proceso de aprendizaje, no una prueba de incapacidad.",
    body: `
      <h4>El valor del progreso personal</h4>
      <p>Cada estudiante tiene un ritmo único de maduración académica. Comparar tu detrás de escena con el resultado visible de los demás distorsiona tu autoimagen.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Lleva una lista de temas que antes no entendías y hoy dominas.</li>
        <li>Pide ayuda a docentes o compañeros sin sentir vergüenza.</li>
        <li>Registra tus logros semanales en el diario de CreSer.</li>
      </ol>
    `,
    suggestedTool: "escritura",
    suggestedToolName: "Registrar Logros en mi Diario"
  },

  // 11. Laboral
  {
    id: "laboral-1",
    cat: "laboral",
    title: "Prevención del Agotamiento Laboral (Burnout)",
    time: "6 min de lectura",
    desc: "Cómo identificar los síntomas tempranos de desgaste y establecer barreras de protección.",
    takeaway: "El agotamiento crónico no se cura con un fin de semana; requiere reajustar los límites diarios.",
    body: `
      <h4>Las señales de alarma</h4>
      <p>Cinismo, fatiga constante y sensación de ineficacia son las tres señales del burnout. Reconocerlas a tiempo te permite pedir apoyo y redistribuir cargas antes del colapso.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Identifica las tareas que drenan excesiva energía sin aportar valor.</li>
        <li>Comunica tus límites de carga con tu equipo de forma profesional.</li>
        <li>Realiza pausas activas cada 2 horas durante la jornada.</li>
      </ol>
    `,
    suggestedTool: "muscular",
    suggestedToolName: "Relajación Muscular Progresiva"
  },
  {
    id: "laboral-2",
    cat: "laboral",
    title: "Desconexión Digital Efectiva tras la Jornada",
    time: "5 min de lectura",
    desc: "Rituales de transición para dejar el trabajo en el trabajo y disfrutar tu vida personal.",
    takeaway: "Tu cerebro necesita un ritual de cierre claro para desconectar el modo de producción.",
    body: `
      <h4>El ritual de cierre de jornada</h4>
      <p>Cierra todas las pestañas de trabajo, anota en 2 minutos lo primero que harás mañana y sal de tu espacio de trabajo. Esto envía una señal clara de cierre mental.</p>
      <h4>Pasos Prácticos:</h4>
      <ol class="reader-steps-list">
        <li>Desactiva las notificaciones de correo y mensajería laboral al finalizar tu horario.</li>
        <li>Cámbiate de ropa o sal a dar una caminata breve de transición.</li>
        <li>Conecta con una actividad placentera o un paisaje sonoro de CreSer.</li>
      </ol>
    `,
    suggestedTool: "sonidos",
    suggestedToolName: "Escuchar Sonidos de la Naturaleza"
  }
];

function initWellnessLibrary() {
  const searchInp = document.getElementById('librarySearchInp');
  const pillBtns = document.querySelectorAll('.library-pill-btn');
  const container = document.getElementById('libraryCardsContainer');

  let activeCategory = 'todos';
  let searchTerm = '';

  function renderCards() {
    if (!container) return;
    const filtered = WELLNESS_ARTICLES.filter(a => {
      const matchCat = (activeCategory === 'todos' || a.cat === activeCategory);
      const matchSearch = a.title.toLowerCase().includes(searchTerm) || a.desc.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<p class="small text-muted" style="grid-column: 1/-1; padding: 1.5rem 0;">No se encontraron artículos con ese filtro en la Biblioteca.</p>';
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="library-resource-card">
        <div>
          <span class="badge badge-purple" style="font-size:0.75rem; text-transform:uppercase; margin-bottom:0.5rem; display:inline-block;">${item.cat} • ${item.time}</span>
          <h4 style="font-size:1.02rem; font-weight:700; margin-bottom:0.4rem; color:var(--ink-primary); line-height:1.35;">${escapeHtml(item.title)}</h4>
          <p class="small text-muted" style="line-height:1.45; margin-bottom:1.1rem;">${escapeHtml(item.desc)}</p>
        </div>
        <button onclick="readArticleModal('${item.id}')" class="btn ghost btn-sm" style="width:100%; text-align:center;">Leer Guía Completa ↗</button>
      </div>
    `).join('');
  }

  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderCards();
    });
  }

  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat || 'todos';
      renderCards();
    });
  });

  window.readArticleModal = function(id) {
    const art = WELLNESS_ARTICLES.find(a => a.id === id);
    const readerModal = document.getElementById('modalArticleReader');
    const readerContent = document.getElementById('readerArticleContent');

    if (art && readerModal && readerContent) {
      readerContent.innerHTML = `
        <span class="reader-header-badge">📚 Categoría: ${escapeHtml(art.cat.toUpperCase())}</span>
        <h2 class="reader-title">${escapeHtml(art.title)}</h2>
        <span class="reader-time">⏱️ ${escapeHtml(art.time)} • Guía de Autocuidado CreSer</span>
        
        <div class="reader-takeaway-box">
          💡 <strong>Idea Clave:</strong> ${escapeHtml(art.takeaway)}
        </div>

        <div class="reader-body">
          ${art.body}
        </div>

        <div class="reader-tool-link-box">
          <div>
            <strong style="display:block; font-size:0.92rem; color:var(--ink-primary); margin-bottom:0.2rem;">Herramienta Práctica Sugerida:</strong>
            <span class="small text-muted">Aplica lo aprendido inmediatamente con una micro-pausa:</span>
          </div>
          <button class="primary btn-sm" onclick="closeAllToolModals(); openToolModal('${art.suggestedTool}');">
            ${escapeHtml(art.suggestedToolName)} ↗
          </button>
        </div>
      `;

      closeAllToolModals();
      readerModal.classList.add('open');
    }
  };

  renderCards();
}

/* ==========================================================================
   9. Retos Personales de Autocuidado
   ========================================================================== */
function initWellnessChallenges() {
  const challengeBtns = document.querySelectorAll('.btn-advance-challenge');
  challengeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const challengeKey = btn.dataset.challenge;
      let count = parseInt(localStorage.getItem(`creser-challenge-${challengeKey}`) || '0', 10) + 1;
      if (count > 7) count = 7;
      localStorage.setItem(`creser-challenge-${challengeKey}`, count.toString());

      const fillEl = document.getElementById(`challengeFill_${challengeKey}`);
      const textEl = document.getElementById(`challengeText_${challengeKey}`);
      if (fillEl) fillEl.style.width = `${(count / 7) * 100}%`;
      if (textEl) textEl.textContent = `Día ${count} de 7 completado`;

      if (count === 7) {
        alert("🎉 ¡Felicidades! Has completado tu reto personal de 7 días.");
      }
    });
  });
}

/* ==========================================================================
   10. Modales de Ayuda Oficial y Privacidad
   ========================================================================== */
function initHelpAndPrivacyModals() {
  const btnPrivacyInfo = document.getElementById('btnWellnessPrivacyInfo');
  if (btnPrivacyInfo) {
    btnPrivacyInfo.addEventListener('click', () => {
      alert("🔒 Tu Privacidad en CreSer:\n\n• Tus registros emocionales y notas de diario se almacenan de forma privada.\n• Ningún otro usuario, docente o administrador tiene acceso a tus reflexiones personales.\n• Puedes eliminar tus registros en cualquier momento desde tu Perfil.");
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
