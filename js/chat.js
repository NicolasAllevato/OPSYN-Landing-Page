// ========================================
// ASISTENTE VIRTUAL DE OPSYN (widget de chat)
// Lanzador flotante + panel. Conversa con /api/chat (Claude Haiku).
// Memoria básica: el historial vive en localStorage ('opsyn-chat')
// por 7 días y se reenvía en cada mensaje. Si el visitante acepta
// que lo contacten, el servidor deriva el lead al equipo; si esa
// entrega falla, se ofrecen WhatsApp y mail con el resumen ya escrito.
// Todo el texto se inserta con textContent (nunca innerHTML con datos).
// ========================================

(function () {
  'use strict';

  var API_URL = '/api/chat';
  var CONFIG_URL = './data/site-config.json';
  var CLAVE = 'opsyn-chat';
  var VIGENCIA_MS = 7 * 24 * 60 * 60 * 1000;
  var MAX_MENSAJES = 24;
  var MAX_CARACTERES = 1000;
  var EMAIL_RESPALDO = 'opsyn.soluciones@gmail.com';

  var TEXTOS = {
    es: {
      launcher: 'Hablá con nuestro asistente',
      launcherAria: 'Abrir chat con el asistente de IA de OPSYN',
      title: 'Asistente de OPSYN',
      badge: 'IA',
      notice: 'Asistente virtual con IA. Puede equivocarse; si querés, te deriva con una persona del equipo.',
      close: 'Cerrar chat',
      log: 'Conversación',
      welcome: '¡Hola! Soy el asistente de IA de OPSYN. Contame qué querés lograr con tu negocio y te oriento.',
      chips: ['¿Qué servicios ofrecen?', 'Quiero automatizar con IA', 'Necesito una app a medida', 'Hablar con una persona'],
      placeholder: 'Escribí tu consulta…',
      inputLabel: 'Tu mensaje',
      send: 'Enviar mensaje',
      typing: 'El asistente está escribiendo',
      error: 'No pude responder ahora. Probá de nuevo o escribinos directo.',
      rateLimit: 'Demasiados mensajes seguidos. Esperá unos minutos y seguimos.',
      retry: 'Reintentar',
      whatsapp: 'Enviar por WhatsApp',
      mail: 'Enviar por mail',
      clear: 'Borrar conversación',
      privacy: 'Privacidad',
      leadSubject: 'Consulta desde el asistente de OPSYN',
      leadIntro: 'Hola OPSYN, hablé con el asistente del sitio y quiero que me contacten.',
      leadName: 'Nombre',
      leadContact: 'Contacto',
      leadSummary: 'Consulta',
    },
    en: {
      launcher: 'Chat with our assistant',
      launcherAria: "Open chat with OPSYN's AI assistant",
      title: 'OPSYN assistant',
      badge: 'AI',
      notice: 'AI virtual assistant. It can make mistakes; it can hand you over to a person on the team.',
      close: 'Close chat',
      log: 'Conversation',
      welcome: "Hi! I'm OPSYN's AI assistant. Tell me what you want to achieve with your business and I'll point you in the right direction.",
      chips: ['What services do you offer?', 'I want to automate with AI', 'I need a custom app', 'Talk to a person'],
      placeholder: 'Type your question…',
      inputLabel: 'Your message',
      send: 'Send message',
      typing: 'The assistant is typing',
      error: "I couldn't answer right now. Try again or message us directly.",
      rateLimit: 'Too many messages in a row. Wait a few minutes and we can continue.',
      retry: 'Retry',
      whatsapp: 'Send via WhatsApp',
      mail: 'Send by email',
      clear: 'Clear conversation',
      privacy: 'Privacy',
      leadSubject: "Inquiry from OPSYN's assistant",
      leadIntro: "Hi OPSYN, I talked to the website assistant and I'd like to be contacted.",
      leadName: 'Name',
      leadContact: 'Contact',
      leadSummary: 'Inquiry',
    },
  };

  var ICONO_CHAT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h.01M12.5 11h.01M16 11h.01"/></svg>';
  var ICONO_CERRAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICONO_ENVIAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // ---------- Estado ----------
  var estado = { mensajes: [], lead: null, ocupado: false };
  var contacto = { email: EMAIL_RESPALDO, whatsapp: '' };
  var ui = {};

  function idioma() {
    return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'es';
  }

  function t() {
    return TEXTOS[idioma()];
  }

  // ---------- Memoria (localStorage) ----------
  function cargarMemoria() {
    try {
      var guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!guardado || Date.now() - guardado.t > VIGENCIA_MS || !Array.isArray(guardado.mensajes)) return;
      estado.mensajes = guardado.mensajes.filter(function (m) {
        return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
      }).slice(-MAX_MENSAJES);
      estado.lead = guardado.lead || null;
    } catch (e) { /* almacenamiento bloqueado o dañado: se empieza de cero */ }
  }

  function guardarMemoria() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ t: Date.now(), mensajes: estado.mensajes.slice(-MAX_MENSAJES), lead: estado.lead }));
    } catch (e) { /* sin almacenamiento: la charla dura lo que la pestaña */ }
  }

  function borrarMemoria() {
    try {
      localStorage.removeItem(CLAVE);
    } catch (e) { /* nada que borrar */ }
  }

  // ---------- Utilidades de DOM ----------
  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
  }

  function alFinal() {
    ui.log.scrollTop = ui.log.scrollHeight;
  }

  function agregarBurbuja(rol, texto, extra) {
    var burbuja = crear('p', 'chat-msg chat-msg--' + (rol === 'user' ? 'user' : 'bot') + (extra ? ' ' + extra : ''), texto);
    ui.log.appendChild(burbuja);
    alFinal();
    return burbuja;
  }

  function quitar(selector) {
    ui.log.querySelectorAll(selector).forEach(function (el) {
      el.remove();
    });
  }

  function botonAccion(texto, alClic) {
    var boton = crear('button', 'btn btn--ghost btn--sm', texto);
    boton.type = 'button';
    boton.addEventListener('click', alClic);
    return boton;
  }

  function enlaceAccion(texto, href) {
    var enlace = crear('a', 'btn btn--secondary btn--sm', texto);
    enlace.href = href;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    return enlace;
  }

  // ---------- Render ----------
  function mostrarChips() {
    var caja = crear('div', 'chat-actions chat-chips');
    t().chips.forEach(function (texto) {
      caja.appendChild(botonAccion(texto, function () {
        enviar(texto);
      }));
    });
    ui.log.appendChild(caja);
  }

  function textoDelLead(lead) {
    var tx = t();
    return [tx.leadIntro, '', tx.leadName + ': ' + lead.nombre, tx.leadContact + ': ' + lead.contacto, tx.leadSummary + ': ' + lead.resumen].join('\n');
  }

  /** Canales directos con el resumen ya escrito: respaldo si el servidor no pudo entregar el lead. */
  function mostrarCanales(lead) {
    var caja = crear('div', 'chat-actions chat-channels');
    var cuerpo = lead ? textoDelLead(lead) : '';
    if (contacto.whatsapp) {
      caja.appendChild(enlaceAccion(t().whatsapp, 'https://wa.me/' + contacto.whatsapp + (cuerpo ? '?text=' + encodeURIComponent(cuerpo) : '')));
    }
    caja.appendChild(enlaceAccion(
      t().mail,
      'mailto:' + contacto.email + '?subject=' + encodeURIComponent(t().leadSubject) + (cuerpo ? '&body=' + encodeURIComponent(cuerpo) : '')
    ));
    ui.log.appendChild(caja);
    alFinal();
  }

  function renderConversacion() {
    ui.log.textContent = '';
    agregarBurbuja('assistant', t().welcome);
    if (!estado.mensajes.length) {
      mostrarChips();
      return;
    }
    estado.mensajes.forEach(function (m) {
      agregarBurbuja(m.role, m.content);
    });
    if (estado.lead && !estado.lead.entregado) mostrarCanales(estado.lead);
  }

  function aplicarTextos() {
    var tx = t();
    ui.lanzador.setAttribute('aria-label', tx.launcherAria);
    ui.lanzadorTexto.textContent = tx.launcher;
    ui.titulo.textContent = tx.title;
    ui.insignia.textContent = tx.badge;
    ui.aviso.textContent = tx.notice;
    ui.cerrar.setAttribute('aria-label', tx.close);
    ui.log.setAttribute('aria-label', tx.log);
    ui.entrada.placeholder = tx.placeholder;
    ui.entradaLabel.textContent = tx.inputLabel;
    ui.enviarBtn.setAttribute('aria-label', tx.send);
    ui.borrar.textContent = tx.clear;
    ui.privacidad.textContent = tx.privacy;
    renderConversacion();
  }

  // ---------- Conversación ----------
  function marcarOcupado(ocupado) {
    estado.ocupado = ocupado;
    actualizarEnviar();
    quitar('.chat-typing-wrap');
    if (!ocupado) return;
    var burbuja = crear('p', 'chat-msg chat-msg--bot chat-typing-wrap');
    burbuja.setAttribute('role', 'status');
    var puntos = crear('span', 'chat-typing');
    puntos.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i += 1) puntos.appendChild(crear('span'));
    burbuja.appendChild(puntos);
    burbuja.appendChild(crear('span', 'chat-sr', t().typing));
    ui.log.appendChild(burbuja);
    alFinal();
  }

  function mostrarError(mensaje) {
    agregarBurbuja('assistant', mensaje, 'chat-msg--error chat-error');
    var caja = crear('div', 'chat-actions chat-error');
    var reintentar = botonAccion(t().retry, function () {
      quitar('.chat-error');
      pedirRespuesta();
    });
    caja.appendChild(reintentar);
    ui.log.appendChild(caja);
    mostrarCanales(null);
    ui.log.lastElementChild.classList.add('chat-error');
    reintentar.focus();
  }

  function pedirRespuesta() {
    marcarOcupado(true);
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: estado.mensajes.slice(-MAX_MENSAJES), lang: idioma() }),
    })
      .then(function (respuesta) {
        return respuesta.json().catch(function () {
          return null;
        }).then(function (cuerpo) {
          return { estado: respuesta.status, cuerpo: cuerpo };
        });
      })
      .then(function (resultado) {
        marcarOcupado(false);
        var datos = resultado.cuerpo && resultado.cuerpo.success && resultado.cuerpo.data;
        if (!datos || typeof datos.reply !== 'string') {
          mostrarError(resultado.estado === 429 ? t().rateLimit : t().error);
          return;
        }
        estado.mensajes = estado.mensajes.concat([{ role: 'assistant', content: datos.reply }]);
        agregarBurbuja('assistant', datos.reply);
        if (datos.lead) {
          estado.lead = {
            nombre: String(datos.lead.nombre || ''),
            contacto: String(datos.lead.contacto || ''),
            resumen: String(datos.lead.resumen || ''),
            entregado: datos.delivered === true,
          };
          if (!estado.lead.entregado) mostrarCanales(estado.lead);
        }
        guardarMemoria();
      })
      .catch(function () {
        marcarOcupado(false);
        mostrarError(t().error);
      });
  }

  function enviar(textoCrudo) {
    var texto = String(textoCrudo || '').trim().slice(0, MAX_CARACTERES);
    if (!texto || estado.ocupado) return;
    quitar('.chat-chips, .chat-error');
    estado.mensajes = estado.mensajes.concat([{ role: 'user', content: texto }]);
    agregarBurbuja('user', texto);
    guardarMemoria();
    ui.entrada.value = '';
    ajustarAltura();
    pedirRespuesta();
  }

  function actualizarEnviar() {
    var deshabilitado = estado.ocupado || !ui.entrada.value.trim();
    ui.enviarBtn.setAttribute('aria-disabled', String(deshabilitado));
  }

  function ajustarAltura() {
    ui.entrada.style.height = 'auto';
    ui.entrada.style.height = Math.min(ui.entrada.scrollHeight, 120) + 'px';
    actualizarEnviar();
  }

  // ---------- Abrir / cerrar ----------
  function abrir() {
    ui.panel.hidden = false;
    document.documentElement.classList.add('chat-open');
    ui.lanzador.setAttribute('aria-expanded', 'true');
    alFinal();
    ui.entrada.focus();
  }

  function cerrar() {
    ui.panel.hidden = true;
    document.documentElement.classList.remove('chat-open');
    ui.lanzador.setAttribute('aria-expanded', 'false');
    ui.lanzador.focus();
  }

  // ---------- Construcción ----------
  function construir() {
    ui.lanzador = crear('button', 'chat-launcher');
    ui.lanzador.type = 'button';
    ui.lanzador.setAttribute('aria-haspopup', 'dialog');
    ui.lanzador.setAttribute('aria-expanded', 'false');
    ui.lanzador.setAttribute('aria-controls', 'chat-panel');
    ui.lanzador.innerHTML = ICONO_CHAT;
    ui.lanzadorTexto = crear('span', 'chat-launcher-label');
    ui.lanzador.appendChild(ui.lanzadorTexto);

    ui.panel = crear('section', 'chat-panel');
    ui.panel.id = 'chat-panel';
    ui.panel.hidden = true;
    ui.panel.setAttribute('role', 'dialog');
    ui.panel.setAttribute('aria-labelledby', 'chat-title');

    var cabecera = crear('header', 'chat-header');
    var logo = document.createElement('img');
    logo.src = './assets/logo-opsyn-80.png';
    logo.alt = '';
    logo.width = 32;
    logo.height = 28;
    var encabezado = crear('div', 'chat-heading');
    var h2 = crear('h2', 'chat-title');
    h2.id = 'chat-title';
    ui.titulo = crear('span');
    ui.insignia = crear('span', 'chat-badge');
    h2.appendChild(ui.titulo);
    h2.appendChild(ui.insignia);
    ui.aviso = crear('p', 'chat-notice');
    encabezado.appendChild(h2);
    encabezado.appendChild(ui.aviso);
    ui.cerrar = crear('button', 'chat-close');
    ui.cerrar.type = 'button';
    ui.cerrar.innerHTML = ICONO_CERRAR;
    cabecera.appendChild(logo);
    cabecera.appendChild(encabezado);
    cabecera.appendChild(ui.cerrar);

    ui.log = crear('div', 'chat-log');
    ui.log.setAttribute('role', 'log');
    ui.log.setAttribute('aria-live', 'polite');

    var form = crear('form', 'chat-form');
    ui.entradaLabel = crear('label', 'chat-sr');
    ui.entradaLabel.setAttribute('for', 'chat-input');
    ui.entrada = crear('textarea', 'chat-input');
    ui.entrada.id = 'chat-input';
    ui.entrada.rows = 1;
    ui.entrada.maxLength = MAX_CARACTERES;
    ui.enviarBtn = crear('button', 'chat-send');
    ui.enviarBtn.type = 'submit';
    ui.enviarBtn.innerHTML = ICONO_ENVIAR;
    form.appendChild(ui.entradaLabel);
    form.appendChild(ui.entrada);
    form.appendChild(ui.enviarBtn);

    var pie = crear('div', 'chat-foot');
    ui.borrar = crear('button', 'chat-clear');
    ui.borrar.type = 'button';
    ui.privacidad = crear('a');
    ui.privacidad.href = './privacidad.html';
    pie.appendChild(ui.borrar);
    pie.appendChild(ui.privacidad);

    ui.panel.appendChild(cabecera);
    ui.panel.appendChild(ui.log);
    ui.panel.appendChild(form);
    ui.panel.appendChild(pie);
    document.body.appendChild(ui.lanzador);
    document.body.appendChild(ui.panel);
    document.documentElement.classList.add('has-chat');

    // Eventos
    ui.lanzador.addEventListener('click', abrir);
    ui.cerrar.addEventListener('click', cerrar);
    ui.panel.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') cerrar();
    });
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      enviar(ui.entrada.value);
    });
    ui.entrada.addEventListener('input', ajustarAltura);
    ui.entrada.addEventListener('keydown', function (evento) {
      if (evento.key === 'Enter' && !evento.shiftKey && !evento.isComposing) {
        evento.preventDefault();
        enviar(ui.entrada.value);
      }
    });
    ui.borrar.addEventListener('click', function () {
      estado.mensajes = [];
      estado.lead = null;
      borrarMemoria();
      renderConversacion();
      ui.entrada.focus();
    });
    document.querySelectorAll('.lang-btn').forEach(function (boton) {
      boton.addEventListener('click', function () {
        window.setTimeout(aplicarTextos, 0); // después de que main.js cambie el atributo lang
      });
    });
  }

  function cargarContacto() {
    fetch(CONFIG_URL)
      .then(function (respuesta) {
        return respuesta.ok ? respuesta.json() : null;
      })
      .then(function (config) {
        var datos = config && config.contact;
        if (!datos) return;
        if (typeof datos.email === 'string' && /^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i.test(datos.email.trim())) {
          contacto.email = datos.email.trim();
        }
        var digitos = String((datos.whatsapp && datos.whatsapp.number) || '').replace(/\D/g, '');
        if (digitos.length >= 10 && digitos.length <= 15) contacto.whatsapp = digitos;
      })
      .catch(function () { /* quedan los valores de respaldo */ });
  }

  document.addEventListener('DOMContentLoaded', function () {
    cargarMemoria();
    construir();
    aplicarTextos();
    cargarContacto();
  });
})();
