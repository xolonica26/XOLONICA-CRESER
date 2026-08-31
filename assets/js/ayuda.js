/**
 * ============================================================================
 * CreSer — Directorio de Profesionales y Centros de Salud Mental
 * Lógica interactiva: Filtros, Búsqueda en tiempo real, Citas y Mapas GPS
 * ============================================================================
 */

(function() {
  'use strict';

  // Base de datos de Especialistas y Centros Clínicos Verificados
  const DIRECTORY_DATA = [
    {
      id: 'pro-1',
      type: 'profesional',
      category: 'psicologia',
      name: 'Dra. Sofía Mendoza Barillas',
      title: 'Psicóloga Clínica & Psicoterapeuta',
      specialty: 'Terapia Cognitivo-Conductual y Manejo del Estrés / Ansiedad',
      colNumber: 'Col. Psicólogos #PS-4821',
      experience: '12 años de experiencia',
      rating: 4.9,
      reviewsCount: 84,
      phone: '+505 8892-4112',
      rawPhone: '50588924112',
      address: 'Los Robles, del Hotel Colón 2c al Sur, Edificio Prisma Mod. 4B',
      city: 'Managua',
      schedule: 'Lun - Vie: 8:00 AM - 6:00 PM | Sáb: 8:30 AM - 1:00 PM',
      modalities: ['Presencial', 'Online'],
      tags: ['Ansiedad', 'Depresión', 'Ataques de Pánico', 'Autoestima', 'Adultos'],
      photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'Los Robles, Managua, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Los+Robles,+Managua,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $35 - $45 USD (Aplica escala solidaria)',
      freeConsult: true,
      freeDetails: 'Primera consulta orientativa gratuita (30 min)',
      lowResourceFriendly: true,
      solidarity: true,
      solidarityDetails: 'Escala solidaria: ajuste de tarifa según situación económica',
      bio: 'Especialista en trastornos del estado de ánimo, fobias y reprocesamiento emocional. Atención cálida y basada en evidencia.'
    },
    {
      id: 'pro-2',
      type: 'profesional',
      category: 'psiquiatria',
      name: 'Dr. Alejandro Vivas Toruño',
      title: 'Médico Especialista en Psiquiatría y Neurociencias',
      specialty: 'Salud Mental Integral, Farmacoterapia y Psiquiatría del Adulto',
      colNumber: 'MINSA Reg. Méd. #8920',
      experience: '15 años de experiencia',
      rating: 5.0,
      reviewsCount: 112,
      phone: '+505 8455-7890',
      rawPhone: '50584557890',
      address: 'Plaza España, Costado Oeste de Mansión Teodolinda, Consultorio 3',
      city: 'Managua',
      schedule: 'Mar - Sáb: 9:00 AM - 5:00 PM',
      modalities: ['Presencial', 'Online'],
      tags: ['Trastornos Afectivos', 'Insomnio', 'TDAH Adultos', 'Evaluación Diagnóstica'],
      photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'Plaza España, Managua, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Plaza+Espana,+Managua,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $50 - $65 USD',
      freeConsult: false,
      freeDetails: null,
      lowResourceFriendly: false,
      solidarity: false,
      solidarityDetails: null,
      bio: 'Enfoque neurobiológico y humano para el tratamiento médico de trastornos complejos del ánimo y del sueño.'
    },
    {
      id: 'pro-3',
      type: 'centro',
      category: 'centro',
      name: 'Centro de Bienestar Psicológico CreSer Central',
      title: 'Clínica Integral de Salud Mental y Terapias',
      specialty: 'Atención Psicológica Multidisciplinar, Grupos de Apoyo y Evaluación',
      colNumber: 'Habilitación Sanitaria #CS-1044',
      experience: '8 años de servicio comunitario',
      rating: 4.9,
      reviewsCount: 230,
      phone: '+505 2270-3344',
      rawPhone: '50522703344',
      address: 'Villa Fontana, Semáforos Club Terraza 1c al Este, Edificio CreSer',
      city: 'Managua',
      schedule: 'Lun - Sáb: 7:30 AM - 7:00 PM',
      modalities: ['Presencial', 'Online'],
      tags: ['Psicoterapia Infantil', 'Terapia Familiar', 'Duelo', 'Orientación Vocacional'],
      photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'Villa Fontana, Managua, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Villa+Fontana,+Managua,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $25 - $40 USD / Programas comunitarios accesibles',
      freeConsult: true,
      freeDetails: 'Primera sesión de orientación grupal completamente gratuita',
      lowResourceFriendly: true,
      solidarity: true,
      solidarityDetails: 'Programas comunitarios subvencionados para personas sin recursos',
      bio: 'Sede clínica principal con equipo interdisciplinario de terapeutas infantiles, juveniles y de adultos.'
    },
    {
      id: 'pro-4',
      type: 'profesional',
      category: 'psicologia',
      name: 'Lic. Mariana Gómez Zeledón',
      title: 'Terapeuta de Pareja y Familia',
      specialty: 'Resolución de Conflictos, Comunicación Asertiva y Crianza Consciente',
      colNumber: 'Col. Psicólogos #PS-5390',
      experience: '9 años de experiencia',
      rating: 4.8,
      reviewsCount: 76,
      phone: '+505 8733-1920',
      rawPhone: '50587331920',
      address: 'León, de la Catedral 3c al Norte, Casa CreSer León',
      city: 'León',
      schedule: 'Lun - Vie: 8:00 AM - 5:00 PM',
      modalities: ['Presencial', 'Online'],
      tags: ['Terapia de Pareja', 'Familia', 'Separación Saludable', 'Vínculos Afectivos'],
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'León, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Leon,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $30 - $40 USD',
      freeConsult: false,
      freeDetails: null,
      lowResourceFriendly: true,
      solidarity: true,
      solidarityDetails: 'Escala solidaria disponible: consultar al reservar',
      bio: 'Acompañamiento sistémico y relacional orientado a fortalecer los lazos afectivos y la salud en el hogar.'
    },
    {
      id: 'pro-5',
      type: 'profesional',
      category: 'psicologia',
      name: 'Msc. Roberto Dávila Orozco',
      title: 'Psicólogo Clínico & Especialista en Duelo y Trauma',
      specialty: 'Terapia EMDR, Superación de Pérdidas y Resiliencia Emocional',
      colNumber: 'Col. Psicólogos #PS-3912',
      experience: '14 años de experiencia',
      rating: 4.9,
      reviewsCount: 95,
      phone: '+505 8611-9440',
      rawPhone: '50586119440',
      address: 'Matagalpa, Parque Darío 1c al Este, Clínica Mente Sana',
      city: 'Matagalpa',
      schedule: 'Lun - Vie: 8:30 AM - 5:30 PM | Sáb: Mañana',
      modalities: ['Presencial', 'Online'],
      tags: ['Duelo', 'Trauma', 'EMDR', 'Crisis Vitales', 'Mindfulness'],
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'Matagalpa, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Matagalpa,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $30 - $45 USD',
      freeConsult: true,
      freeDetails: 'Primera consulta diagnóstica gratuita de 20 minutos',
      lowResourceFriendly: false,
      solidarity: false,
      solidarityDetails: null,
      bio: 'Enfoque compasivo y riguroso para procesar vivencias difíciles, duelos significativos y experiencias traumáticas.'
    },
    {
      id: 'pro-6',
      type: 'centro',
      category: 'centro',
      name: 'Clínica Psicológica del Norte — Estelí',
      title: 'Centro Terapéutico y Neurodesarrollo',
      specialty: 'Psicología Infantil, Psicopedagogía y Evaluación Neuropsicológica',
      colNumber: 'Habilitación Sanitaria #CS-2088',
      experience: '10 años de trayectoria',
      rating: 4.9,
      reviewsCount: 140,
      phone: '+505 2713-4411',
      rawPhone: '50527134411',
      address: 'Estelí, Frente al Parque Central 1/2c al Sur, Módulo 2',
      city: 'Estelí',
      schedule: 'Lun - Sáb: 8:00 AM - 6:00 PM',
      modalities: ['Presencial', 'Online'],
      tags: ['Niños', 'Adolescentes', 'Dificultades de Aprendizaje', 'TDAH Infantil'],
      photo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
      mapQuery: 'Estelí, Nicaragua',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Esteli,+Nicaragua&t=&z=15&ie=UTF8&iwloc=&output=embed',
      fee: 'Tarifa: $25 - $35 USD',
      freeConsult: true,
      freeDetails: 'Evaluación inicial gratuita para niños y adolescentes',
      lowResourceFriendly: true,
      solidarity: true,
      solidarityDetails: 'Becas parciales disponibles para familias de bajos recursos en el norte del país',
      bio: 'Espacio adaptado e interactivo para niños, adolescentes y orientación a padres de familia en el norte de Nicaragua.'
    }
  ];

  // Estado del Directorio
  let currentFilterCategory = 'todos';
  let currentSearchQuery = '';
  let currentCityFilter = 'todas';
  let currentSelectedTarget = null;
  let selectedAppointmentModality = 'Presencial';
  let selectedTimeSlot = '09:00 AM';
  let showOnlyFree = false;
  let showOnlyLowResource = false;

  // Inicialización cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initAyudaModule);

  function initAyudaModule() {
    renderDirectoryCards();
    setupEventListeners();
    setupFaqAccordion();
    setupQuickDirectoryScroll();
  }

  /**
   * Conecta los eventos de la interfaz
   */
  function setupEventListeners() {
    // Buscador
    const searchInput = document.getElementById('dirSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        renderDirectoryCards();
      });
    }

    // Filtro por Ciudad
    const citySelect = document.getElementById('dirCitySelect');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        currentCityFilter = e.target.value;
        renderDirectoryCards();
      });
    }

    // Píldoras de Categoría
    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(pill => {
      pill.addEventListener('click', () => {
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat') || 'todos';
        if (cat === 'gratuito') {
          currentFilterCategory = 'todos';
          showOnlyFree = true;
          showOnlyLowResource = false;
          const toggleFree = document.getElementById('toggleFreeConsult');
          if (toggleFree) toggleFree.checked = true;
          const toggleLow = document.getElementById('toggleLowResource');
          if (toggleLow) toggleLow.checked = false;
        } else if (cat === 'bajos-recursos') {
          currentFilterCategory = 'todos';
          showOnlyLowResource = true;
          showOnlyFree = false;
          const toggleLow = document.getElementById('toggleLowResource');
          if (toggleLow) toggleLow.checked = true;
          const toggleFree = document.getElementById('toggleFreeConsult');
          if (toggleFree) toggleFree.checked = false;
        } else {
          currentFilterCategory = cat;
          showOnlyFree = false;
          showOnlyLowResource = false;
          const toggleFree = document.getElementById('toggleFreeConsult');
          if (toggleFree) toggleFree.checked = false;
          const toggleLow = document.getElementById('toggleLowResource');
          if (toggleLow) toggleLow.checked = false;
        }
        renderDirectoryCards();
      });
    });

    // Toggles de accesibilidad económica
    const toggleFree = document.getElementById('toggleFreeConsult');
    if (toggleFree) {
      toggleFree.addEventListener('change', () => {
        showOnlyFree = toggleFree.checked;
        renderDirectoryCards();
      });
    }

    const toggleLow = document.getElementById('toggleLowResource');
    if (toggleLow) {
      toggleLow.addEventListener('change', () => {
        showOnlyLowResource = toggleLow.checked;
        renderDirectoryCards();
      });
    }

    // Delegación de eventos para botones en tarjetas (Cita y Mapa)
    const cardsGrid = document.getElementById('directoryCardsGrid');
    if (cardsGrid) {
      cardsGrid.addEventListener('click', (e) => {
        const bookBtn = e.target.closest('[data-action="book-appointment"]');
        if (bookBtn) {
          const id = bookBtn.getAttribute('data-id');
          openAppointmentModal(id);
          return;
        }

        const mapBtn = e.target.closest('[data-action="view-map"]');
        if (mapBtn) {
          const id = mapBtn.getAttribute('data-id');
          openMapModal(id);
          return;
        }
      });
    }

    // Modal de Citas: Botones de modalidad
    const modalityBtns = document.querySelectorAll('.modality-opt-btn');
    modalityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modalityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAppointmentModality = btn.getAttribute('data-modality') || 'Presencial';
      });
    });

    // Modal de Citas: Píldoras de horario
    const slotPills = document.querySelectorAll('.time-slot-pill');
    slotPills.forEach(slot => {
      slot.addEventListener('click', () => {
        slotPills.forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
        selectedTimeSlot = slot.getAttribute('data-time') || '09:00 AM';
      });
    });

    // Formulario de Solicitud de Cita
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
      appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Triaje Rápido Orientativo
    const triageForm = document.getElementById('triageQuizForm');
    if (triageForm) {
      triageForm.addEventListener('submit', handleTriageSubmit);
    }
  }

  /**
   * Desplazamiento suave y enfoque al pulsar "Consultar Directorio"
   */
  function setupQuickDirectoryScroll() {
    const triggerBtns = document.querySelectorAll('[data-action="scroll-directory"]');
    triggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById('directorioSection');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const searchInput = document.getElementById('dirSearchInput');
          if (searchInput) {
            setTimeout(() => {
              searchInput.focus();
              searchInput.parentElement.classList.add('pulse-highlight');
              setTimeout(() => searchInput.parentElement.classList.remove('pulse-highlight'), 1200);
            }, 600);
          }
        }
      });
    });
  }

  /**
   * Renderizado de las tarjetas del directorio con filtros activos
   */
  function renderDirectoryCards() {
    const grid = document.getElementById('directoryCardsGrid');
    const countBadge = document.getElementById('dirResultsCount');
    if (!grid) return;

    // Filtrar elementos
    const filtered = DIRECTORY_DATA.filter(item => {
      // Filtro de categoría
      if (currentFilterCategory !== 'todos') {
        if (currentFilterCategory === 'online') {
          if (!item.modalities.includes('Online')) return false;
        } else if (currentFilterCategory === 'presencial') {
          if (!item.modalities.includes('Presencial')) return false;
        } else if (item.category !== currentFilterCategory && item.type !== currentFilterCategory) {
          return false;
        }
      }

      // Filtro de ciudad
      if (currentCityFilter !== 'todas') {
        if (item.city.toLowerCase() !== currentCityFilter.toLowerCase()) return false;
      }

      // Búsqueda por texto
      if (currentSearchQuery) {
        const query = currentSearchQuery;
        const inName = item.name.toLowerCase().includes(query);
        const inSpec = item.specialty.toLowerCase().includes(query);
        const inTitle = item.title.toLowerCase().includes(query);
        const inTags = item.tags.some(t => t.toLowerCase().includes(query));
        const inAddress = item.address.toLowerCase().includes(query);
        const inCity = item.city.toLowerCase().includes(query);
        if (!inName && !inSpec && !inTitle && !inTags && !inAddress && !inCity) {
          return false;
        }
      }

      // Filtro de consultas gratuitas
      if (showOnlyFree && !item.freeConsult) return false;

      // Filtro de bajos recursos
      if (showOnlyLowResource && !item.lowResourceFriendly) return false;

      return true;
    });

    // Ordenamiento: primero gratuito + bajos recursos, luego solo gratuito, luego solo bajos recursos, luego solidarios
    filtered.sort((a, b) => {
      const scoreA = (a.freeConsult ? 4 : 0) + (a.lowResourceFriendly ? 2 : 0) + (a.solidarity ? 1 : 0);
      const scoreB = (b.freeConsult ? 4 : 0) + (b.lowResourceFriendly ? 2 : 0) + (b.solidarity ? 1 : 0);
      return scoreB - scoreA;
    });

    // Actualizar contador
    if (countBadge) {
      countBadge.textContent = `${filtered.length} disponible${filtered.length === 1 ? '' : 's'}`;
    }

    // Si no hay resultados
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="directory-empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No encontramos profesionales con esos criterios</h3>
          <p>Prueba ajustando la búsqueda, seleccionando otra ciudad o restableciendo los filtros de categoría.</p>
          <button class="primary mt-3" onclick="window.resetDirectoryFilters()">Restablecer Filtros</button>
        </div>
      `;
      return;
    }

    // Renderizar tarjetas
    grid.innerHTML = filtered.map(item => {
      const isCenter = item.type === 'centro';
      const typeLabel = isCenter ? '🏥 Centro de Salud / Local' : '🧑‍⚕️ Profesional Verificado';
      const badgeClass = isCenter ? 'badge-type is-center-badge' : 'badge-type';
      const isFree = !!item.freeConsult;
      const isLowResource = !!item.lowResourceFriendly;
      const isSolidarity = !!item.solidarity;

      // Determinar ribbon superior
      let ribbonHtml = '';
      if (isFree && isLowResource) {
        ribbonHtml = `<div class="pro-card-ribbon ribbon-free">✨ Consulta Gratuita &nbsp;·&nbsp; 💛 Apoyo a Bajos Recursos</div>`;
      } else if (isFree) {
        ribbonHtml = `<div class="pro-card-ribbon ribbon-free">🎁 Primera Consulta Gratuita</div>`;
      } else if (isLowResource) {
        ribbonHtml = `<div class="pro-card-ribbon ribbon-low-resource">💛 Accesible — Bajos Recursos</div>`;
      }

      // Panel de acceso económico
      let accessPanelHtml = '';
      if (isFree || isLowResource || isSolidarity) {
        const items = [];
        if (isFree && item.freeDetails) {
          items.push(`<span><span class="pro-access-panel-icon">🎁</span> ${escapeHtml(item.freeDetails)}</span>`);
        }
        if (isSolidarity && item.solidarityDetails) {
          items.push(`<span><span class="pro-access-panel-icon">🤝</span> ${escapeHtml(item.solidarityDetails)}</span>`);
        }
        if (items.length > 0) {
          accessPanelHtml = `<div class="pro-access-panel">${items.join('<span style="color:var(--line)">|</span>')}</div>`;
        }
      }

      // Clases dinámicas de la tarjeta
      const cardClasses = [
        'pro-card',
        isCenter ? 'is-center' : '',
        isFree ? 'is-free-consult' : '',
        isLowResource ? 'is-low-resource' : '',
        ribbonHtml ? 'has-ribbon' : ''
      ].filter(Boolean).join(' ');

      // Badges de accesibilidad
      const accessBadges = [
        isFree ? '<span class="badge-free-consult">🎁 Consulta Gratis</span>' : '',
        isLowResource ? '<span class="badge-low-resource">💛 Bajos Recursos</span>' : '',
        isSolidarity && !isFree && !isLowResource ? '<span class="badge-solidarity">🤝 Escala Solidaria</span>' : ''
      ].filter(Boolean).join('');

      // Mensaje de WhatsApp prellenado
      const waMessage = encodeURIComponent(`Hola ${item.name}, te contacto a través de la plataforma CreSer para consultar disponibilidad de citas.`);
      const waUrl = `https://wa.me/${item.rawPhone}?text=${waMessage}`;

      return `
        <article class="${cardClasses}" id="${item.id}">
          ${ribbonHtml}
          <div>
            <div class="pro-card-header">
              <div class="pro-avatar-wrap">
                <img src="${item.photo}" alt="${escapeHtml(item.name)}" class="pro-avatar-img" loading="lazy">
                <span class="pro-status-dot" title="Disponible para consultas"></span>
              </div>
              <div class="pro-info-top">
                <div class="pro-badges-row">
                  <span class="badge-verified">✓ Verificado</span>
                  <span class="${badgeClass}">${typeLabel}</span>
                  ${accessBadges}
                </div>
                <h3 class="pro-name">${escapeHtml(item.name)}</h3>
                <div class="pro-specialty">${escapeHtml(item.title)}</div>
                <div class="pro-rating-row">
                  <span class="rating-stars">★ ${item.rating}</span>
                  <span>(${item.reviewsCount} opiniones)</span>
                  <span>•</span>
                  <span>${item.experience}</span>
                </div>
              </div>
            </div>

            <p style="font-size: 0.88rem; color: var(--ink-secondary); margin-bottom: 0.85rem; line-height: 1.5;">
              ${escapeHtml(item.specialty)}
            </p>

            <div class="pro-card-details">
              <div class="pro-detail-item">
                <span class="pro-detail-icon">📍</span>
                <div class="pro-detail-text">
                  <strong>${escapeHtml(item.city)}:</strong> ${escapeHtml(item.address)}
                </div>
              </div>

              <div class="pro-detail-item">
                <span class="pro-detail-icon">🕒</span>
                <div class="pro-detail-text">
                  <strong>Horario:</strong> ${escapeHtml(item.schedule)}
                </div>
              </div>

              <div class="pro-detail-item">
                <span class="pro-detail-icon">🏷️</span>
                <div class="pro-detail-text">
                  <strong>Modalidad:</strong> ${item.modalities.join(' & ')} • ${escapeHtml(item.fee)}
                </div>
              </div>

              <div class="pro-tags-row">
                ${item.tags.map(t => `<span class="pro-tag-pill">#${escapeHtml(t)}</span>`).join('')}
              </div>
              ${accessPanelHtml}
            </div>
          </div>

          <div>
            <div class="pro-card-actions">
              <button class="btn-book-appointment" data-action="book-appointment" data-id="${item.id}">
                <span>📅</span> Solicitar Cita
              </button>
              <button class="btn-view-map" data-action="view-map" data-id="${item.id}">
                <span>🗺️</span> Ver Mapa
              </button>
            </div>

            <div class="pro-card-quick-links">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="link-whatsapp-direct">
                <span>💬 WhatsApp Directo</span>
              </a>
              <a href="tel:${item.rawPhone}" class="link-phone-direct">
                <span>📞 ${escapeHtml(item.phone)}</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Abre el Modal de Solicitud de Cita
   */
  function openAppointmentModal(id) {
    const target = DIRECTORY_DATA.find(d => d.id === id);
    if (!target) return;
    currentSelectedTarget = target;

    const modal = document.getElementById('appointmentModal');
    const summaryBox = document.getElementById('modalAppointmentTargetSummary');
    const dateInput = document.getElementById('appointmentDate');

    if (summaryBox) {
      summaryBox.innerHTML = `
        <img src="${target.photo}" alt="${escapeHtml(target.name)}" class="modal-target-avatar">
        <div>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--ink-primary);">${escapeHtml(target.name)}</h4>
          <p style="font-size: 0.84rem; color: var(--primary); font-weight: 600;">${escapeHtml(target.title)}</p>
          <p style="font-size: 0.8rem; color: var(--ink-muted);">📍 ${escapeHtml(target.address)}</p>
        </div>
      `;
    }

    // Configurar fecha mínima de hoy
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      if (!dateInput.value) dateInput.value = today;
    }

    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Abre el Modal de Ubicación y Mapa Interactivo
   */
  function openMapModal(id) {
    const target = DIRECTORY_DATA.find(d => d.id === id);
    if (!target) return;

    const modal = document.getElementById('mapModal');
    const titleEl = document.getElementById('mapModalTitle');
    const addressEl = document.getElementById('mapModalAddress');
    const phoneEl = document.getElementById('mapModalPhone');
    const iframeEl = document.getElementById('mapModalIframe');
    const gmapsLink = document.getElementById('mapGmapsLink');
    const wazeLink = document.getElementById('mapWazeLink');

    if (titleEl) titleEl.textContent = target.name;
    if (addressEl) addressEl.textContent = `📍 ${target.address} (${target.city}, Nicaragua)`;
    if (phoneEl) phoneEl.textContent = `📞 ${target.phone} | Horario: ${target.schedule}`;
    if (iframeEl) iframeEl.src = target.mapEmbedUrl;

    const encodedQuery = encodeURIComponent(`${target.name} ${target.address} ${target.city} Nicaragua`);
    if (gmapsLink) gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    if (wazeLink) wazeLink.href = `https://waze.com/ul?q=${encodedQuery}&navigate=yes`;

    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Manejo de Envío de Cita
   */
  function handleAppointmentSubmit(e) {
    e.preventDefault();
    if (!currentSelectedTarget) return;

    const name = document.getElementById('patientName').value.trim();
    const phone = document.getElementById('patientPhone').value.trim();
    const email = document.getElementById('patientEmail').value.trim();
    const date = document.getElementById('appointmentDate').value;
    const reason = document.getElementById('appointmentReason').value.trim();

    if (!name || !phone || !date) {
      showToast('Por favor completa tu nombre, teléfono y fecha deseada.', 'warning');
      return;
    }

    // Objeto de la Cita
    const appointmentRecord = {
      id: 'cita-' + Date.now(),
      targetId: currentSelectedTarget.id,
      targetName: currentSelectedTarget.name,
      patientName: name,
      patientPhone: phone,
      patientEmail: email,
      modality: selectedAppointmentModality,
      date: date,
      timeSlot: selectedTimeSlot,
      reason: reason || 'Consulta general de orientación psicológica',
      createdAt: new Date().toISOString(),
      status: 'Pendiente de Confirmación'
    };

    // Guardar en LocalStorage
    const saved = JSON.parse(localStorage.getItem('creser-patient-appointments') || '[]');
    saved.push(appointmentRecord);
    localStorage.setItem('creser-patient-appointments', JSON.stringify(saved));

    // Cerrar modal
    closeAyudaModal('appointmentModal');

    // Mensaje enriquecido con opción de WhatsApp directo
    const waText = encodeURIComponent(
      `*Solicitud de Cita CreSer*\n` +
      `👤 *Paciente:* ${name}\n` +
      `📅 *Fecha:* ${date} a las ${selectedTimeSlot}\n` +
      `🏷️ *Modalidad:* ${selectedAppointmentModality}\n` +
      `🩺 *Profesional / Centro:* ${currentSelectedTarget.name}\n` +
      `📞 *Teléfono:* ${phone}\n` +
      `💬 *Motivo:* ${reason || 'Orientación y valoración'}`
    );

    const directWaUrl = `https://wa.me/${currentSelectedTarget.rawPhone}?text=${waText}`;

    showToast(`✅ ¡Solicitud registrada con éxito para ${currentSelectedTarget.name}!`, 'success');

    // Abrir WhatsApp con los datos listos
    setTimeout(() => {
      const askWa = confirm(`¿Deseas enviar un WhatsApp directo a ${currentSelectedTarget.name} con los datos de tu reserva para confirmación inmediata?`);
      if (askWa) {
        window.open(directWaUrl, '_blank');
      }
    }, 600);

    // Resetear formulario
    e.target.reset();
  }

  /**
   * Triaje Rápido Guiado
   */
  function handleTriageSubmit(e) {
    e.preventDefault();
    const reason = document.querySelector('input[name="triageReason"]:checked')?.value || 'general';
    const age = document.querySelector('input[name="triageAge"]:checked')?.value || 'adulto';

    closeAyudaModal('triageModal');

    let recommendedCat = 'todos';
    if (reason === 'ansiedad' || reason === 'depresion') recommendedCat = 'psicologia';
    else if (reason === 'medico' || reason === 'farmacos') recommendedCat = 'psiquiatria';
    else if (age === 'infantil') recommendedCat = 'infantil';
    else if (reason === 'pareja') recommendedCat = 'pareja';

    // Aplicar filtro
    currentFilterCategory = recommendedCat;
    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(p => {
      if (p.getAttribute('data-cat') === recommendedCat) p.classList.add('active');
      else p.classList.remove('active');
    });

    renderDirectoryCards();

    // Desplazar al directorio
    const section = document.getElementById('directorioSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast(`💡 Te mostramos especialistas recomendados según tus respuestas`, 'success');
  }

  /**
   * Acordeón de Preguntas Frecuentes
   */
  function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item-premium');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) item.classList.add('open');
        });
      }
    });
  }

  /**
   * Toast flotante para notificaciones
   */
  function showToast(message, type = 'success') {
    let toast = document.getElementById('ayudaToastNotification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ayudaToastNotification';
      toast.className = 'ayuda-toast';
      document.body.appendChild(toast);
    }
    toast.className = `ayuda-toast ayuda-toast-${type} show`;
    toast.textContent = message;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // Funciones globales expuestas en window
  window.closeAyudaModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

  window.openAyudaModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  };

  window.resetDirectoryFilters = function() {
    currentFilterCategory = 'todos';
    currentSearchQuery = '';
    currentCityFilter = 'todas';

    const searchInput = document.getElementById('dirSearchInput');
    if (searchInput) searchInput.value = '';

    const citySelect = document.getElementById('dirCitySelect');
    if (citySelect) citySelect.value = 'todas';

    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(p => {
      if (p.getAttribute('data-cat') === 'todos') p.classList.add('active');
      else p.classList.remove('active');
    });

    renderDirectoryCards();
  };

  window.copyAddressToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Dirección copiada al portapapeles', 'success');
    }).catch(() => {
      showToast('Dirección: ' + text, 'info');
    });
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
