// ========================================
// PANEL DE ADMINISTRACIÓN LOCAL (OPSYN)
// Edita data/service-items.json a través de
// scripts/admin-server.js (solo localhost).
// ========================================

(function () {
  const API_URL = '/api/admin/service-items';
  const TRANSLATE_URL = '/api/admin/translate';
  const ENHANCE_URL = '/api/admin/enhance-description';

  const SERVICES = [
    { id: 'service1', label: 'Desarrollo de software' },
    { id: 'service2', label: 'Agentes de IA y automatización' },
    { id: 'service3', label: 'Consultoría tecnológica' },
    { id: 'service4', label: 'Marketing digital' },
  ];

  const state = {
    data: { service1: [], service2: [], service3: [], service4: [] },
    activeService: SERVICES[0].id,
    editingItemId: null,
  };

  const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

  const tabsEl = document.getElementById('tabs');
  const statsGridEl = document.getElementById('stats-grid');
  const boardTitleEl = document.getElementById('board-title');
  const itemsGridEl = document.getElementById('items-grid');
  const emptyStateEl = document.getElementById('empty-state');
  const statusBannerEl = document.getElementById('status-banner');
  const addItemBtn = document.getElementById('add-item-btn');
  const dialogEl = document.getElementById('item-dialog');
  const dialogTitleEl = document.getElementById('dialog-title');
  const itemFormEl = document.getElementById('item-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const fieldTitleEs = document.getElementById('field-title-es');
  const fieldTitleEn = document.getElementById('field-title-en');
  const fieldDescEs = document.getElementById('field-desc-es');
  const fieldDescEn = document.getElementById('field-desc-en');
  const saveBtn = document.getElementById('save-btn');
  const retranslateTitleBtn = document.getElementById('retranslate-title-btn');
  const retranslateDescBtn = document.getElementById('retranslate-desc-btn');
  const enhanceDescBtn = document.getElementById('enhance-desc-btn');

  function showStatus(message, type) {
    statusBannerEl.textContent = message;
    statusBannerEl.className = 'status-banner ' + type;
    statusBannerEl.hidden = false;
    window.clearTimeout(showStatus._t);
    showStatus._t = window.setTimeout(() => {
      statusBannerEl.hidden = true;
    }, 4000);
  }

  async function translate(text) {
    const response = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || 'HTTP ' + response.status);
    }
    return data.translated;
  }

  // Traduce esField -> enField (ES -> EN). Por defecto no pisa una traducción
  // ya cargada a mano (force:true la reemplaza igual, para el botón "↻ Traducir").
  async function autoTranslateField(esField, enField, { force = false } = {}) {
    const text = esField.value.trim();
    if (!text) return;
    if (!force && enField.value.trim()) return;

    enField.classList.add('is-translating');
    const previousPlaceholder = enField.placeholder;
    enField.placeholder = 'Traduciendo…';
    try {
      enField.value = await translate(text);
    } catch (error) {
      showStatus(
        'No se pudo traducir automáticamente. Completá el inglés a mano. (' + error.message + ')',
        'error'
      );
    } finally {
      enField.classList.remove('is-translating');
      enField.placeholder = previousPlaceholder;
    }
  }

  // Compartido con admin-contact.js (vista "Contacto y redes").
  window.opsynAdmin = { showStatus, autoTranslateField };

  fieldTitleEs.addEventListener('blur', () => autoTranslateField(fieldTitleEs, fieldTitleEn));
  fieldDescEs.addEventListener('blur', () => autoTranslateField(fieldDescEs, fieldDescEn));
  retranslateTitleBtn.addEventListener('click', () =>
    autoTranslateField(fieldTitleEs, fieldTitleEn, { force: true })
  );
  retranslateDescBtn.addEventListener('click', () =>
    autoTranslateField(fieldDescEs, fieldDescEn, { force: true })
  );

  // "✨ Mejorar": reescribe con IA (Gemini) el borrador que el usuario puso
  // en Descripción (Español), en un tono más profesional. El resultado
  // reemplaza el campo ES y queda editable como cualquier otro texto — y
  // como cambió el contenido, se re-traduce el inglés para mantenerlo
  // sincronizado (el usuario también puede editar el inglés a mano después).
  async function enhanceDescription() {
    const text = fieldDescEs.value.trim();
    if (!text) {
      showStatus('Escribí algo en la Descripción (Español) primero.', 'error');
      return;
    }

    enhanceDescBtn.disabled = true;
    const originalLabel = enhanceDescBtn.textContent;
    enhanceDescBtn.textContent = 'Mejorando…';
    fieldDescEs.classList.add('is-translating');

    try {
      const response = await fetch(ENHANCE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'HTTP ' + response.status);

      fieldDescEs.value = data.enhanced;
      await autoTranslateField(fieldDescEs, fieldDescEn, { force: true });
    } catch (error) {
      showStatus('No se pudo mejorar el texto. (' + error.message + ')', 'error');
    } finally {
      enhanceDescBtn.disabled = false;
      enhanceDescBtn.textContent = originalLabel;
      fieldDescEs.classList.remove('is-translating');
    }
  }

  enhanceDescBtn.addEventListener('click', enhanceDescription);

  function slugify(text) {
    return (text || 'item')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'item';
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    SERVICES.forEach((service) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-btn' + (service.id === state.activeService ? ' active' : '');
      const count = (state.data[service.id] || []).length;
      btn.textContent = `${service.label} (${count})`;
      btn.addEventListener('click', () => {
        state.activeService = service.id;
        renderTabs();
        renderBoard();
      });
      tabsEl.appendChild(btn);
    });
    renderStats();
  }

  function renderStats() {
    if (!statsGridEl) return;

    const counts = SERVICES.map((service) => (state.data[service.id] || []).length);
    const maxCount = Math.max(1, ...counts);

    statsGridEl.innerHTML = '';

    SERVICES.forEach((service, index) => {
      const count = counts[index];
      const percent = Math.round((count / maxCount) * 100);
      const color = CHART_COLORS[index % CHART_COLORS.length];

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'stat-card' + (service.id === state.activeService ? ' is-active' : '');
      card.style.setProperty('--chart-color', color);
      card.setAttribute('aria-label', `${service.label}: ${count} ítem(s). Ver este servicio.`);
      card.innerHTML = `
        <div class="stat-card-top">
          <span class="stat-card-label">${service.label}</span>
          <span class="stat-card-dot" aria-hidden="true"></span>
        </div>
        <p class="stat-card-count">${count}<small>ítem${count === 1 ? '' : 's'}</small></p>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width: ${count === 0 ? 0 : Math.max(percent, 6)}%"></div>
        </div>
      `;
      card.addEventListener('click', () => {
        state.activeService = service.id;
        renderTabs();
        renderBoard();
      });
      statsGridEl.appendChild(card);
    });
  }

  function renderBoard() {
    const service = SERVICES.find((s) => s.id === state.activeService);
    boardTitleEl.textContent = service ? service.label : '';

    const items = state.data[state.activeService] || [];
    itemsGridEl.innerHTML = '';
    emptyStateEl.hidden = items.length > 0;

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-card-lang">
          <span class="item-lang-label">ES</span>
          <h3 data-field="es-title"></h3>
          <p data-field="es-desc"></p>
        </div>
        <div class="item-card-lang">
          <span class="item-lang-label">EN</span>
          <h3 data-field="en-title"></h3>
          <p data-field="en-desc"></p>
        </div>
      `;
      card.querySelector('[data-field="es-title"]').textContent = item.title?.es || '';
      card.querySelector('[data-field="es-desc"]').textContent = item.desc?.es || '';
      card.querySelector('[data-field="en-title"]').textContent = item.title?.en || '';
      card.querySelector('[data-field="en-desc"]').textContent = item.desc?.en || '';

      const actions = document.createElement('div');
      actions.className = 'item-card-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => openDialog(item));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger';
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.addEventListener('click', () => deleteItem(item.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);
      itemsGridEl.appendChild(card);
    });
  }

  function openDialog(item) {
    state.editingItemId = item ? item.id : null;
    dialogTitleEl.textContent = item ? 'Editar ítem' : 'Nuevo ítem';
    fieldTitleEs.value = item?.title?.es || '';
    fieldTitleEn.value = item?.title?.en || '';
    fieldDescEs.value = item?.desc?.es || '';
    fieldDescEn.value = item?.desc?.en || '';
    dialogEl.showModal();
    fieldTitleEs.focus();
  }

  function closeDialog() {
    dialogEl.close();
    itemFormEl.reset();
    state.editingItemId = null;
  }

  async function persist() {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'HTTP ' + response.status);

      if (data?.published) {
        showStatus('Guardado y publicado en la web ✓ (Vercel deploya en ~1 min)', 'success');
      } else if (data?.reason === 'sin cambios') {
        showStatus('Guardado (sin cambios para publicar) ✓', 'success');
      } else {
        showStatus(
          'Guardado localmente, pero no se publicó automáticamente. ' +
            (data?.error || 'Revisá la terminal donde corre "npm run admin".'),
          'warning'
        );
      }
    } catch (error) {
      showStatus(
        'No se pudo guardar. ¿Está corriendo "npm run admin"? (' + error.message + ')',
        'error'
      );
    }
  }

  function deleteItem(itemId) {
    const items = state.data[state.activeService] || [];
    const item = items.find((i) => i.id === itemId);
    const label = item?.title?.es || itemId;
    if (!window.confirm(`¿Eliminar "${label}"?`)) return;

    state.data[state.activeService] = items.filter((i) => i.id !== itemId);
    renderTabs();
    renderBoard();
    persist();
  }

  itemFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const titleEs = fieldTitleEs.value.trim();
    const descEs = fieldDescEs.value.trim();

    if (!titleEs || !descEs) {
      showStatus('Completá título y descripción en Español.', 'error');
      return;
    }

    // Si el blur no llegó a disparar la traducción (ej. Enter para guardar
    // apenas se completó el Español), la hacemos ahora antes de guardar.
    if (!fieldTitleEn.value.trim() || !fieldDescEn.value.trim()) {
      saveBtn.disabled = true;
      const originalLabel = saveBtn.textContent;
      saveBtn.textContent = 'Traduciendo…';
      await Promise.all([
        autoTranslateField(fieldTitleEs, fieldTitleEn),
        autoTranslateField(fieldDescEs, fieldDescEn),
      ]);
      saveBtn.textContent = originalLabel;
      saveBtn.disabled = false;
    }

    const titleEn = fieldTitleEn.value.trim();
    const descEn = fieldDescEn.value.trim();

    if (!titleEn || !descEn) {
      showStatus('No se pudo traducir automáticamente. Completá el inglés a mano y guardá de nuevo.', 'error');
      return;
    }

    const items = state.data[state.activeService] || (state.data[state.activeService] = []);

    if (state.editingItemId) {
      const existing = items.find((i) => i.id === state.editingItemId);
      if (existing) {
        existing.title = { es: titleEs, en: titleEn };
        existing.desc = { es: descEs, en: descEn };
      }
    } else {
      const baseId = slugify(titleEs);
      let id = baseId;
      let suffix = 2;
      while (items.some((i) => i.id === id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      items.push({ id, title: { es: titleEs, en: titleEn }, desc: { es: descEs, en: descEn } });
    }

    closeDialog();
    renderTabs();
    renderBoard();
    persist();
  });

  addItemBtn.addEventListener('click', () => openDialog(null));
  cancelBtn.addEventListener('click', closeDialog);

  async function loadData() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      state.data = Object.assign(
        { service1: [], service2: [], service3: [], service4: [] },
        data
      );
    } catch (error) {
      showStatus(
        'No se pudo leer data/service-items.json. ¿Corriste "npm run admin"? (' + error.message + ')',
        'error'
      );
    }
    renderTabs();
    renderBoard();
  }

  loadData();
})();
