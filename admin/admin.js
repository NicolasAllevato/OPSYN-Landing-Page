// ========================================
// PANEL DE ADMINISTRACIÓN LOCAL (OPSYN)
// Edita data/service-items.json a través de
// scripts/admin-server.js (solo localhost).
// ========================================

(function () {
  const API_URL = '/api/admin/service-items';

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

  const tabsEl = document.getElementById('tabs');
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

  function showStatus(message, type) {
    statusBannerEl.textContent = message;
    statusBannerEl.className = 'status-banner ' + type;
    statusBannerEl.hidden = false;
    window.clearTimeout(showStatus._t);
    showStatus._t = window.setTimeout(() => {
      statusBannerEl.hidden = true;
    }, 4000);
  }

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
        <span class="item-lang-label">ES</span>
        <h3></h3>
        <p></p>
        <span class="item-lang-label">EN</span>
        <p class="item-en-title" style="color:#fff;font-weight:600;margin:0"></p>
        <p></p>
      `;
      const [esTitle, esDesc, , enTitle, enDesc] = card.querySelectorAll('h3, p');
      esTitle.textContent = item.title?.es || '';
      esDesc.textContent = item.desc?.es || '';
      enTitle.textContent = item.title?.en || '';
      enDesc.textContent = item.desc?.en || '';

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
      if (!response.ok) throw new Error('HTTP ' + response.status);
      showStatus('Guardado en data/service-items.json ✓', 'success');
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

  itemFormEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const titleEs = fieldTitleEs.value.trim();
    const titleEn = fieldTitleEn.value.trim();
    const descEs = fieldDescEs.value.trim();
    const descEn = fieldDescEn.value.trim();

    if (!titleEs || !titleEn || !descEs || !descEn) {
      showStatus('Completá los 4 campos (ES y EN) antes de guardar.', 'error');
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
