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
  initAdaptiveWellness();
  initNeedsSelector();
  initQuickToolModals();
  initWeeklyStats();
  initWellnessJournal();
  initSleepAndEnergy();
  initWellnessHabits();
  initWellnessLibrary();
  initWellnessChallenges();
  initHelpAndPrivacyModals();
});

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
}

function openToolModal(toolKey) {
  closeAllToolModals();
  const modal = document.getElementById(`modalTool_${toolKey}`);
  if (modal) {
    modal.classList.add('open');
    if (toolKey === 'respiracion') startModalBreathing();
    if (toolKey === 'visual') startVisualRestTimer();
    if (toolKey === 'concentracion') startFocusTimer();
  }
}

function closeAllToolModals() {
  const modals = document.querySelectorAll('.wellness-tool-modal');
  modals.forEach(m => m.classList.remove('open'));
  if (activeToolTimer) clearInterval(activeToolTimer);
}

// 1. Respiración 4-4-4
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
    } else if (phase === 1) {
      prompt.textContent = "Sostén el aire suavemente...";
      circle.className = "modal-breath-circle hold";
    } else {
      prompt.textContent = "Exhala lento por la boca...";
      circle.className = "modal-breath-circle exhale";
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
    }
  }, 1000);
}

// 2. Descanso Visual 20-20-20
function startVisualRestTimer() {
  const timerEl = document.getElementById('visualRestTimer');
  if (!timerEl) return;
  let sec = 20;
  if (activeToolTimer) clearInterval(activeToolTimer);
  activeToolTimer = setInterval(() => {
    sec--;
    timerEl.textContent = `00:${sec < 10 ? '0' + sec : sec}`;
    if (sec <= 0) {
      clearInterval(activeToolTimer);
      timerEl.textContent = "¡Descanso visual completado! Parpadea suavemente.";
    }
  }, 1000);
}

// 3. Temporizador de Concentración
function startFocusTimer() {
  const timerEl = document.getElementById('focusCountdown');
  if (!timerEl) return;
  let totalSec = 180; // 3 minutos
  if (activeToolTimer) clearInterval(activeToolTimer);
  activeToolTimer = setInterval(() => {
    totalSec--;
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    timerEl.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    if (totalSec <= 0) {
      clearInterval(activeToolTimer);
      timerEl.textContent = "¡Tiempo cumplido! Tómate una pausa.";
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
  const habits = localStorage.getItem('creser-wellness-habits-count') || '4';

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

/* ==========================================================================
   5. Diario Emocional y Gratitud con Historial
   ========================================================================== */
function initWellnessJournal() {
  const form = document.getElementById('formWellnessJournal');
  const list = document.getElementById('wellnessJournalList');
  const btnPatterns = document.getElementById('btnViewJournalPatterns');

  function renderJournalList() {
    if (!list) return;
    const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
    if (entries.length === 0) {
      list.innerHTML = '<p class="small text-muted">Aún no tienes reflexiones guardadas. Escribe lo que sientes hoy.</p>';
      return;
    }

    list.innerHTML = entries.map((e, idx) => `
      <div class="journal-entry-card" style="background:var(--surface-2); border:1px solid var(--line); border-radius:var(--radius-md); padding:1rem; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <span style="font-size:0.8rem; font-weight:700; color:var(--primary);">${escapeHtml(e.type || 'Reflexión')}</span>
          <span style="font-size:0.78rem; color:var(--ink-muted);">${escapeHtml(e.date || '')}</span>
        </div>
        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.3rem;">${escapeHtml(e.title || 'Nota personal')}</h4>
        <p style="font-size:0.88rem; color:var(--ink-secondary); margin:0; line-height:1.4;">${escapeHtml(e.text || '')}</p>
      </div>
    `).join('');
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('journalEntryType')?.value || 'Lo que siento';
      const title = document.getElementById('journalEntryTitle')?.value || '';
      const text = document.getElementById('journalEntryText')?.value || '';

      if (!text.trim()) return;

      const entry = {
        type,
        title: title.trim() || type,
        text: text.trim(),
        date: new Date().toLocaleDateString('es-NI', { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: new Date().toISOString()
      };

      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      entries.unshift(entry);
      localStorage.setItem('creser-journal-entries', JSON.stringify(entries));

      if (window.CreSerDB) {
        window.CreSerDB.saveJournalEntry(entry);
      }

      form.reset();
      renderJournalList();
      initWeeklyStats();
      alert("✅ Tu reflexión ha sido guardada de forma segura y privada.");
    });
  }

  if (btnPatterns) {
    btnPatterns.addEventListener('click', () => {
      const entries = JSON.parse(localStorage.getItem('creser-journal-entries') || '[]');
      alert(`📊 Patrones de Autocuidado:\n\n• Total de reflexiones registradas: ${entries.length}\n• Prácticas frecuentes: Gratitud y desahogo de pensamientos.\n• Recuerda que escribir con regularidad fortalece tu claridad mental.`);
    });
  }

  renderJournalList();
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
      alert(`🌙 Registro de descanso guardado: ${sleepHours} horas (${sleepQuality}). Nivel de energía: ${selectedEnergy}.`);
    });
  }
}

/* ==========================================================================
   7. Seguimiento de Hábitos Diarios
   ========================================================================== */
function initWellnessHabits() {
  const checkboxes = document.querySelectorAll('.habit-check-input');
  checkboxes.forEach(cb => {
    const saved = localStorage.getItem(`creser-habit-${cb.id}`);
    if (saved === '1') cb.checked = true;

    cb.addEventListener('change', () => {
      localStorage.setItem(`creser-habit-${cb.id}`, cb.checked ? '1' : '0');
      const totalChecked = document.querySelectorAll('.habit-check-input:checked').length;
      localStorage.setItem('creser-wellness-habits-count', totalChecked.toString());
      initWeeklyStats();
    });
  });
}

/* ==========================================================================
   8. Biblioteca de Bienestar (Búsqueda y Filtros de 11 Categorías)
   ========================================================================== */
const WELLNESS_ARTICLES = [
  { id: 1, title: "Técnicas de Organización ante Exámenes", cat: "academico", time: "5 min", desc: "Cómo priorizar temas de estudio sin caer en agotamiento cognitivo." },
  { id: 2, title: "Límites Saludables y Desconexión Laboral", cat: "laboral", time: "6 min", desc: "Pautas prácticas para desconectarte del trabajo después de tu jornada." },
  { id: 3, title: "Comunicación Asertiva y Escucha Familiar", cat: "familia", time: "7 min", desc: "Herramientas para resolver desacuerdos en el hogar con empatía." },
  { id: 4, title: "Higiene del Sueño y Descanso Profundo", cat: "sueno", time: "4 min", desc: "Rutinas nocturnas basadas en evidencia para conciliar el sueño con calma." },
  { id: 5, title: "Entendiendo y Nombrando la Ansiedad", cat: "ansiedad", time: "8 min", desc: "Comprender la función biológica de la alerta y cómo autorregularla." },
  { id: 6, title: "El Poder de la Gratitud Diaria", cat: "emociones", time: "4 min", desc: "Pequeños ejercicios que reentrenan tu atención hacia lo constructivo." }
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
      container.innerHTML = '<p class="small text-muted">No se encontraron artículos con ese filtro.</p>';
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="library-resource-card">
        <div>
          <span class="badge badge-purple" style="font-size:0.75rem; text-transform:uppercase; margin-bottom:0.5rem; display:inline-block;">${item.cat} • ${item.time}</span>
          <h4 style="font-size:1.02rem; font-weight:700; margin-bottom:0.4rem; color:var(--ink-primary);">${escapeHtml(item.title)}</h4>
          <p class="small text-muted" style="line-height:1.45; margin-bottom:1rem;">${escapeHtml(item.desc)}</p>
        </div>
        <button onclick="readArticleModal('${item.id}')" class="btn ghost btn-sm">Leer Guía ↗</button>
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
    const art = WELLNESS_ARTICLES.find(a => a.id == id);
    if (art) {
      alert(`📖 ${art.title}\n\n${art.desc}\n\n[Contenido educativo completo disponible en la Biblioteca de CreSer]`);
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
