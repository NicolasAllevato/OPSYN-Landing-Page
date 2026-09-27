// ========================================
// FORMULARIO DE CONTACTO
// Validación en vivo (blur + submit), contador de caracteres,
// indicador de progreso de completitud, envío a /api/contact
// (contrato sin cambios) y panel de éxito con gestión de foco.
// Traducciones: TRANSLATIONS/currentLang, definidas en js/main.js
// (prefijo form*), cargado antes que este script.
// ========================================

(function () {
  const LIMITES = {
    nombre: { max: 100 },
    email: { max: 254 },
    mensaje: { min: 10, max: 5000 }
  };

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Traducciones activas. Devuelve un objeto vacío si TRANSLATIONS
   * o currentLang todavía no existen (defensa por orden de carga).
   */
  function obtenerTraducciones() {
    if (typeof TRANSLATIONS === 'undefined' || typeof currentLang === 'undefined') return {};
    return TRANSLATIONS[currentLang] || {};
  }

  /**
   * Valida un campo por nombre y devuelve el mensaje de error
   * (string vacío si es válido).
   */
  function validarCampo(nombreCampo, valorCrudo) {
    const t = obtenerTraducciones();
    const valor = (valorCrudo || '').trim();

    if (nombreCampo === 'nombre') {
      if (!valor) return t.formErrorNameRequired || 'Ingresá tu nombre.';
      if (valor.length > LIMITES.nombre.max) return t.formErrorNameMax || 'El nombre no puede superar los 100 caracteres.';
      return '';
    }

    if (nombreCampo === 'email') {
      if (!valor) return t.formErrorEmailRequired || 'Ingresá tu email.';
      if (valor.length > LIMITES.email.max) return t.formErrorEmailMax || 'El email no puede superar los 254 caracteres.';
      if (!REGEX_EMAIL.test(valor)) return t.formErrorEmailInvalid || 'Ingresá un email válido.';
      return '';
    }

    if (nombreCampo === 'servicio') {
      if (!valor) return t.formErrorServiceRequired || 'Elegí un tipo de servicio.';
      return '';
    }

    if (nombreCampo === 'mensaje') {
      if (!valor) return t.formErrorMessageRequired || 'Contanos brevemente tu proyecto.';
      if (valor.length < LIMITES.mensaje.min) return t.formErrorMessageMin || 'El mensaje debe tener al menos 10 caracteres.';
      if (valor.length > LIMITES.mensaje.max) return t.formErrorMessageMax || 'El mensaje no puede superar los 5000 caracteres.';
      return '';
    }

    return '';
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const wrap = form.closest('.contact-form-wrap');
    const successPanel = wrap ? wrap.querySelector('#formSuccess') : null;
    const submitBtn = form.querySelector('.form-submit');
    const feedback = form.querySelector('.form-feedback');
    const progressBar = form.querySelector('#formProgressBar');
    const mensajeInput = form.querySelector('#f-mensaje');
    const countCurrent = form.querySelector('.form-count-current');
    const campos = ['nombre', 'email', 'servicio', 'mensaje']
      .map((nombre) => form.querySelector(`[name="${nombre}"]`))
      .filter(Boolean);

    const setFeedback = (mensaje, estado) => {
      if (!feedback) return;
      feedback.textContent = mensaje;
      feedback.dataset.state = estado || '';
    };

    /** Aplica (o limpia) el mensaje de error y los estados visuales/ARIA de un campo. */
    const mostrarError = (input, mensajeError) => {
      const errorEl = document.getElementById(`${input.id}-error`);
      if (errorEl) errorEl.textContent = mensajeError;
      input.setAttribute('aria-invalid', mensajeError ? 'true' : 'false');
      input.classList.toggle('is-invalid', Boolean(mensajeError));
      input.classList.toggle('is-valid', !mensajeError && input.value.trim().length > 0);
    };

    const validarYMostrar = (input) => {
      const mensajeError = validarCampo(input.name, input.value);
      mostrarError(input, mensajeError);
      return !mensajeError;
    };

    /** Actualiza la barra de progreso según cuántos campos son válidos ahora mismo. */
    const actualizarProgreso = () => {
      if (!progressBar) return;
      const completos = campos.filter((c) => !validarCampo(c.name, c.value)).length;
      const porcentaje = Math.round((completos / campos.length) * 100);
      progressBar.style.width = `${porcentaje}%`;
    };

    const actualizarContador = () => {
      if (!mensajeInput || !countCurrent) return;
      countCurrent.textContent = String(mensajeInput.value.length);
    };

    campos.forEach((input) => {
      input.addEventListener('blur', () => {
        validarYMostrar(input);
        actualizarProgreso();
      });

      input.addEventListener('input', () => {
        // Si el campo ya estaba marcado inválido, revalidamos en vivo
        // para dar el alta apenas el usuario lo corrige.
        if (input.getAttribute('aria-invalid') === 'true') {
          validarYMostrar(input);
        }
        if (input === mensajeInput) actualizarContador();
        actualizarProgreso();
      });
    });

    actualizarContador();
    actualizarProgreso();

    // Preselección de servicio disparada desde las cards de Servicios (agente C).
    document.addEventListener('opsyn:select-service', (evento) => {
      const valor = evento?.detail?.value;
      const select = form.querySelector('#f-servicio');
      if (!valor || !select) return;

      const opcionExiste = Array.from(select.options).some((opcion) => opcion.value === valor);
      if (!opcionExiste) return;

      select.value = valor;
      validarYMostrar(select);
      actualizarProgreso();
      form.querySelector('#f-nombre')?.focus();
    });

    const mostrarPanelExito = () => {
      if (!successPanel) return;
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.focus();
    };

    const reiniciarFormulario = () => {
      if (!successPanel) return;
      successPanel.hidden = true;
      form.hidden = false;
      form.reset();
      campos.forEach((input) => mostrarError(input, ''));
      setFeedback('', '');
      actualizarContador();
      actualizarProgreso();
      form.querySelector('#f-nombre')?.focus();
    };

    successPanel?.querySelector('.form-success-reset')
      ?.addEventListener('click', reiniciarFormulario);

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      if (submitBtn?.hasAttribute('disabled')) return;

      let primerCampoInvalido = null;
      let formularioValido = true;

      campos.forEach((input) => {
        const esValido = validarYMostrar(input);
        if (!esValido) {
          formularioValido = false;
          if (!primerCampoInvalido) primerCampoInvalido = input;
        }
      });
      actualizarProgreso();

      const t = obtenerTraducciones();

      if (!formularioValido) {
        primerCampoInvalido?.focus();
        setFeedback(t.formErrorValidation || 'Revisá los datos del formulario e intentá de nuevo.', 'error');
        return;
      }

      const payload = {
        nombre: form.querySelector('#f-nombre')?.value.trim() || '',
        email: form.querySelector('#f-email')?.value.trim() || '',
        servicio: form.querySelector('#f-servicio')?.value || '',
        mensaje: form.querySelector('#f-mensaje')?.value.trim() || '',
        _gotcha: form.querySelector('#f-gotcha')?.value || ''
      };

      submitBtn?.classList.add('is-loading');
      submitBtn?.setAttribute('disabled', 'true');
      setFeedback('', '');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const resultado = await response.json().catch(() => ({}));

        if (response.ok && resultado.success) {
          submitBtn?.classList.add('is-success');
          setFeedback(t.formSuccess || '', 'success');
          window.setTimeout(mostrarPanelExito, 400);
        } else if (response.status === 429) {
          setFeedback(t.formErrorRateLimit || '', 'error');
        } else if (response.status === 400) {
          setFeedback(t.formErrorValidation || '', 'error');
        } else {
          setFeedback(t.formErrorGeneric || '', 'error');
        }
        // En error NO se vacía el formulario: los datos del usuario quedan intactos.
      } catch {
        setFeedback(t.formErrorGeneric || '', 'error');
      } finally {
        submitBtn?.classList.remove('is-loading');
        submitBtn?.removeAttribute('disabled');
        window.setTimeout(() => submitBtn?.classList.remove('is-success'), 1500);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initContactForm);
})();
