// ========================================
// PANEL ADMIN — CONTACTO Y REDES
// Edita data/site-config.json (email, WhatsApp, redes) vía
// /api/admin/site-config. Reusa showStatus/autoTranslateField
// de admin.js (window.opsynAdmin).
// ========================================

(function () {
  const API_URL = '/api/admin/site-config';

  const NETWORKS = [
    { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/opsyn' },
    { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/opsyn' },
    { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/opsyn' },
    { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@opsyn' },
    { id: 'x', label: 'X (Twitter)', placeholder: 'https://x.com/opsyn' },
    { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@opsyn' },
  ];

  const { showStatus, autoTranslateField } = window.opsynAdmin;

  const viewButtons = document.querySelectorAll('.view-btn');
  const views = {
    services: document.getElementById('view-services'),
    contact: document.getElementById('view-contact'),
  };
  const form = document.getElementById('contact-form');
  const emailField = document.getElementById('cfg-email');
  const waNumberField = document.getElementById('cfg-wa-number');
  const waMsgEs = document.getElementById('cfg-wa-msg-es');
  const waMsgEn = document.getElementById('cfg-wa-msg-en');
  const waRetranslateBtn = document.getElementById('cfg-wa-retranslate');
  const waPreview = document.getElementById('cfg-wa-preview');
  const socialGrid = document.getElementById('social-grid');
  const saveBtn = document.getElementById('cfg-save-btn');

  let loaded = false;

  // ---- Cambio de vista (Servicios / Contacto y redes) ----
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.view;
      viewButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      Object.entries(views).forEach(([name, el]) => { el.hidden = name !== target; });
      if (target === 'contact' && !loaded) loadConfig();
    });
  });

  // ---- Campos de redes (generados desde NETWORKS) ----
  NETWORKS.forEach((network) => {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.className = 'field-label';
    span.textContent = network.label;
    const input = document.createElement('input');
    input.type = 'url';
    input.id = 'cfg-social-' + network.id;
    input.placeholder = network.placeholder;
    input.autocomplete = 'off';
    label.append(span, input);
    socialGrid.appendChild(label);
  });

  const socialField = (id) => document.getElementById('cfg-social-' + id);

  // "instagram.com/opsyn" → "https://instagram.com/opsyn" (comodidad al pegar)
  function normalizeUrl(value) {
    const text = value.trim();
    if (!text) return '';
    return /^https?:\/\//i.test(text) ? text.replace(/^http:\/\//i, 'https://') : 'https://' + text;
  }

  function waDigits() {
    return waNumberField.value.replace(/\D/g, '');
  }

  function updateWaPreview() {
    const digits = waDigits();
    waPreview.textContent = '';
    if (!digits) return;
    if (digits.length < 10 || digits.length > 15) {
      waPreview.textContent = ' ⚠ Tiene ' + digits.length + ' dígitos: revisá el código de país.';
      waPreview.className = 'wa-preview is-error';
      return;
    }
    waPreview.className = 'wa-preview';
    waPreview.append(' Link: ');
    const link = document.createElement('a');
    link.href = 'https://wa.me/' + digits;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'wa.me/' + digits + ' (probar)';
    waPreview.appendChild(link);
  }

  waNumberField.addEventListener('input', updateWaPreview);
  waMsgEs.addEventListener('blur', () => autoTranslateField(waMsgEs, waMsgEn));
  waRetranslateBtn.addEventListener('click', () => autoTranslateField(waMsgEs, waMsgEn, { force: true }));

  function fillForm(config) {
    emailField.value = config.contact?.email || '';
    waNumberField.value = config.contact?.whatsapp?.number || '';
    waMsgEs.value = config.contact?.whatsapp?.message?.es || '';
    waMsgEn.value = config.contact?.whatsapp?.message?.en || '';
    NETWORKS.forEach((n) => { socialField(n.id).value = config.social?.[n.id] || ''; });
    updateWaPreview();
  }

  async function loadConfig() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      fillForm(await response.json());
      loaded = true;
    } catch (error) {
      showStatus('No se pudo leer data/site-config.json. ¿Corriste "npm run admin"? (' + error.message + ')', 'error');
    }
  }

  function collectConfig() {
    const social = {};
    NETWORKS.forEach((n) => {
      const field = socialField(n.id);
      field.value = normalizeUrl(field.value);
      social[n.id] = field.value;
    });
    return {
      contact: {
        email: emailField.value.trim(),
        whatsapp: {
          number: waDigits(),
          message: { es: waMsgEs.value.trim(), en: waMsgEn.value.trim() },
        },
      },
      social,
    };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!emailField.value.trim()) {
      showStatus('Completá el email de contacto.', 'error');
      emailField.focus();
      return;
    }

    saveBtn.disabled = true;
    const originalLabel = saveBtn.textContent;
    saveBtn.textContent = 'Guardando…';
    try {
      // Si el mensaje en inglés quedó vacío, se traduce antes de guardar.
      if (waMsgEs.value.trim() && !waMsgEn.value.trim()) await autoTranslateField(waMsgEs, waMsgEn);

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectConfig()),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'HTTP ' + response.status);

      fillForm(data.config);
      if (data.published) {
        showStatus('Guardado y publicado en la web ✓ (Vercel deploya en ~1 min)', 'success');
      } else if (data.reason === 'sin cambios') {
        showStatus('Guardado (sin cambios para publicar) ✓', 'success');
      } else {
        showStatus('Guardado localmente, pero no se publicó automáticamente. ' + (data.error || ''), 'warning');
      }
    } catch (error) {
      // Errores de validación del servidor llegan con mensaje claro para el usuario.
      showStatus(error.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalLabel;
    }
  });
})();
