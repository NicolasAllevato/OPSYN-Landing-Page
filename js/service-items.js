// ========================================
// TARJETAS DE SERVICIOS DESPLEGABLES
// Carga data/service-items.json y agrega un
// desplegable (acordeón) a las tarjetas que
// tengan ítems configurados desde /admin.
// ========================================

(function () {
  const DATA_URL = './data/service-items.json';
  const registrations = [];

  function getLang() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function pickText(field, lang) {
    if (!field) return '';
    return field[lang] || field.es || '';
  }

  function renderItemMedia(item) {
    if (!item.image) return '';
    // img-slot: si el asset todavía no existe (Fase 3), el <img> dispara
    // `error` y el listener de más abajo oculta el slot sin romper el layout.
    return `
      <div class="service-item-media img-slot">
        <img src="${escapeHtml(item.image)}" alt="" width="48" height="48" loading="lazy" decoding="async">
      </div>
    `;
  }

  function renderItems(itemsEl, items, lang) {
    itemsEl.innerHTML = items
      .map((item) => `
        <div class="service-item">
          ${renderItemMedia(item)}
          <div class="service-item-text">
            <h4 class="service-item-title">${escapeHtml(pickText(item.title, lang))}</h4>
            <p class="service-item-desc">${escapeHtml(pickText(item.desc, lang))}</p>
          </div>
        </div>
      `)
      .join('');

    itemsEl.querySelectorAll('.service-item-media img').forEach((img) => {
      img.addEventListener('error', () => {
        img.closest('.service-item-media').classList.add('img-slot--broken');
      });
    });
  }

  function toggleCard(card, toggleBtn, itemsEl) {
    const isOpen = card.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    itemsEl.hidden = !isOpen;
  }

  // El control accesible es un <button> real (el chevron), no la tarjeta:
  // la tarjeta contiene el link "Consultar por esto", y un role="button"
  // con controles adentro rompe lectores de pantalla y el Enter de ese link.
  function setupCard(card, items) {
    const itemsEl = card.querySelector('.service-items');
    if (!itemsEl || !Array.isArray(items) || items.length === 0) return;

    const serviceId = card.getAttribute('data-service-id');
    itemsEl.id = serviceId + '-items';
    renderItems(itemsEl, items, getLang());
    registrations.push({ itemsEl, items });

    card.classList.add('has-items');

    const title = card.querySelector('h3');
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'service-toggle-icon';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', itemsEl.id);
    if (title) {
      title.id = title.id || serviceId + '-title';
      // Nombre accesible = título de la tarjeta; se actualiza solo con el i18n.
      toggleBtn.setAttribute('aria-labelledby', title.id);
    }
    card.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => toggleCard(card, toggleBtn, itemsEl));

    // Atajo con mouse: clic en cualquier parte "vacía" de la tarjeta.
    card.addEventListener('click', (event) => {
      if (event.target.closest('.service-items, a, button')) return;
      toggleCard(card, toggleBtn, itemsEl);
    });
  }

  function init(data) {
    document.querySelectorAll('.service-card[data-service-id]').forEach((card) => {
      setupCard(card, data[card.getAttribute('data-service-id')]);
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = getLang();
        registrations.forEach(({ itemsEl, items }) => renderItems(itemsEl, items, lang));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetch(DATA_URL)
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => init(data || {}))
      .catch(() => {
        // Si falla la carga (offline, archivo ausente), las tarjetas
        // se muestran igual que antes, sin desplegable.
      });
  });
})();
