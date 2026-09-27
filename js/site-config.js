// ========================================
// DATOS DE CONTACTO Y REDES (editables desde /admin)
// Lee data/site-config.json y actualiza el email, los links a
// redes sociales y los accesos a WhatsApp en todas las páginas.
// El HTML trae los valores actuales como respaldo (sin JS, o si
// el archivo falla, se ve igual que antes).
// ========================================

(function () {
  const CONFIG_URL = './data/site-config.json';

  // Misma tabla que scripts/admin-server.js (validación del lado del panel).
  const NETWORKS = [
    { id: 'instagram', label: 'Instagram', hosts: ['instagram.com'] },
    { id: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com'] },
    { id: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
    { id: 'tiktok', label: 'TikTok', hosts: ['tiktok.com'] },
    { id: 'x', label: 'X', hosts: ['x.com', 'twitter.com'] },
    { id: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  ];

  const EMAIL_RE = /^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i;

  const LABELS = {
    es: { wa: 'WhatsApp', waFloat: 'Escribinos por WhatsApp', waContact: '¿Preferís WhatsApp?', waContactCta: 'Escribinos directo' },
    en: { wa: 'WhatsApp', waFloat: 'Message us on WhatsApp', waContact: 'Prefer WhatsApp?', waContactCta: 'Message us directly' },
  };

  const WA_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/>' +
    '<path d="M9 8.6c0 3 2.4 5.9 5.6 6.4l1.1-1.3-1.7-1-1 .8a4.5 4.5 0 0 1-2.4-2.4l.8-1-1-1.7z"/></svg>';

  function getLang() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
  }

  function safeEmail(value) {
    return typeof value === 'string' && EMAIL_RE.test(value.trim()) ? value.trim() : null;
  }

  // Solo https y solo el dominio de esa red: una URL mal cargada (o
  // manipulada) en el JSON nunca termina como link en el sitio.
  function safeSocialUrl(network, value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') return null;
      const host = url.hostname.replace(/^www\./, '');
      return network.hosts.some((h) => host === h || host.endsWith('.' + h)) ? url.href : null;
    } catch {
      return null;
    }
  }

  function whatsappUrl(config) {
    const wa = config.contact && config.contact.whatsapp;
    const digits = String((wa && wa.number) || '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return null;
    const message = (wa.message && typeof wa.message[getLang()] === 'string') ? wa.message[getLang()].trim() : '';
    return 'https://wa.me/' + digits + (message ? '?text=' + encodeURIComponent(message) : '');
  }

  function applyEmail(email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      link.href = 'mailto:' + email;
      if (link.textContent.includes('@')) link.textContent = email;
    });
  }

  function externalLink(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;
    return a;
  }

  // Footer: la lista de contacto conserva el email y regenera redes/WhatsApp.
  function renderContactLists(config, waUrl) {
    document.querySelectorAll('ul[data-contact-links]').forEach((list) => {
      list.querySelectorAll('li[data-social]').forEach((li) => li.remove());
      const items = [];
      if (waUrl) items.push({ id: 'whatsapp', href: waUrl, label: LABELS[getLang()].wa });
      NETWORKS.forEach((network) => {
        const href = safeSocialUrl(network, config.social && config.social[network.id]);
        if (href) items.push({ id: network.id, href, label: network.label });
      });
      items.forEach((item) => {
        const li = document.createElement('li');
        li.setAttribute('data-social', item.id);
        li.appendChild(externalLink(item.href, item.label));
        list.appendChild(li);
      });
    });
  }

  function renderWhatsappFloat(waUrl) {
    let button = document.querySelector('.wa-float');
    if (!waUrl) {
      if (button) button.remove();
      return;
    }
    if (!button) {
      button = document.createElement('a');
      button.className = 'wa-float';
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.innerHTML = WA_ICON;
      document.body.appendChild(button);
    }
    button.href = waUrl;
    button.setAttribute('aria-label', LABELS[getLang()].waFloat);
    button.title = LABELS[getLang()].waFloat;
  }

  // Canal alternativo junto al formulario de contacto (solo index).
  function renderContactWhatsapp(waUrl) {
    const box = document.querySelector('[data-contact-whatsapp]');
    if (!box) return;
    box.hidden = !waUrl;
    if (!waUrl) return;
    const labels = LABELS[getLang()];
    box.textContent = labels.waContact + ' ';
    const link = externalLink(waUrl, labels.waContactCta + ' →');
    box.appendChild(link);
  }

  function render(config) {
    const email = safeEmail(config.contact && config.contact.email);
    if (email) applyEmail(email);
    const waUrl = whatsappUrl(config);
    renderContactLists(config, waUrl);
    renderWhatsappFloat(waUrl);
    renderContactWhatsapp(waUrl);
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetch(CONFIG_URL)
      .then((response) => (response.ok ? response.json() : null))
      .then((config) => {
        if (!config || typeof config !== 'object') return;
        render(config);
        // Textos y mensaje de WhatsApp acompañan el cambio de idioma.
        document.querySelectorAll('.lang-btn').forEach((btn) => {
          btn.addEventListener('click', () => render(config));
        });
      })
      .catch(() => {
        // Sin conexión o archivo ausente: quedan los valores del HTML.
      });
  });
})();
