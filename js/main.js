// ========================================
// TRADUCCIONES
// ========================================

const TRANSLATIONS = {
  es: {
    tagline: '"somos una idea, somos un proyecto, somos la solución para vos"',
    heroTitle: 'Pensamos tu negocio antes de programar, y te acompañamos de cerca en cada paso.',
    heroSub: 'Somos el partner tecnológico integral que combina visión estratégica y ejecución técnica — sin capas corporativas, con trato directo. Desde digitalizar tu negocio desde cero hasta llevarlo al siguiente nivel con IA.',
    heroCta: 'Hablemos de tu proyecto',
    servicesLabel: 'Servicios',
    servicesTitle: 'Todo bajo un mismo techo',
    service1Title: 'Desarrollo de software',
    service1Desc: 'Apps web y móviles a medida, pensadas para tu operación real, no para una plantilla genérica.',
    service2Title: 'Agentes de IA y automatización',
    service2Desc: 'Bots, agentes y flujos automáticos que te devuelven horas de trabajo manual.',
    service3Title: 'Consultoría tecnológica',
    service3Desc: 'Diagnóstico honesto de dónde estás y hacia dónde conviene moverte con tecnología.',
    service4Title: 'Marketing digital',
    service4Desc: 'Estrategia y gestión de redes y contenido para que tu marca se vea tan bien como funciona.',
    aboutLabel: 'Nosotros',
    aboutTitle: 'Una agencia boutique, con visión de socio',
    aboutBody1: 'OPSYN nació para cerrar la brecha entre las agencias tradicionales, lentas y con capas de gestión, y el freelancer suelto que resuelve tareas puntuales sin mirar el negocio completo.',
    aboutBody2: 'Nosotros pensamos primero tu negocio — cómo funciona, a dónde querés llegar — y recién después programamos. Trabajamos codo a codo con vos, con respuestas rápidas y decisiones compartidas, ya sea tu primer paso digital o tu salto hacia la IA.',
    aboutPoint1Title: 'Visión estratégica',
    aboutPoint1Desc: 'No empezamos por el código, empezamos por tu negocio.',
    aboutPoint2Title: 'Trato cercano',
    aboutPoint2Desc: 'Hablás directo con quien construye, sin intermediarios.',
    aboutPoint3Title: 'Ejecución técnica real',
    aboutPoint3Desc: 'Lo que diseñamos, lo construimos y lo sostenemos.',
    portfolioLabel: 'Portfolio',
    portfolioTitle: 'Casos de éxito',
    blogLabel: 'Recursos',
    blogTitle: 'Blog',
    contactLabel: 'Contacto',
    contactTitle: 'Contanos tu idea',
    contactSub: 'Sin vueltas: contanos qué necesitás y te respondemos con una propuesta a medida.',
    formName: 'Nombre',
    formEmail: 'Email',
    formServiceLabel: 'Tipo de servicio de interés',
    formServicePlaceholder: 'Elegí una opción',
    formMessage: 'Contanos sobre tu proyecto',
    formSubmit: 'Enviar mensaje',
    formSuccess: '¡Gracias! Te contactaremos pronto.',
    formErrorGeneric: 'Hubo un error al enviar tu mensaje. Probá de nuevo en un momento.',
    formErrorValidation: 'Revisá los datos del formulario e intentá de nuevo.',
    formErrorRateLimit: 'Ya enviaste varios mensajes. Esperá unos minutos antes de volver a intentar.',
    footerTagline: 'Tu partner tecnológico integral.',
    footerLinksLabel: 'Secciones',
    footerContactLabel: 'Contacto',
  },
  en: {
    tagline: '"we are an idea, we are a project, we are the solution for you"',
    heroTitle: 'We think through your business before we write a line of code — and stay close every step of the way.',
    heroSub: 'We\'re the full-stack tech partner that blends strategic vision with technical execution — no corporate layers, straight talk. From digitizing your business from scratch to leveling it up with AI.',
    heroCta: "Let's talk about your project",
    servicesLabel: 'Services',
    servicesTitle: 'Everything under one roof',
    service1Title: 'Software development',
    service1Desc: 'Custom web and mobile apps built around how your business actually runs.',
    service2Title: 'AI agents & automation',
    service2Desc: 'Bots, agents, and automated flows that give you back hours of manual work.',
    service3Title: 'Tech consulting',
    service3Desc: 'An honest read on where you stand and where technology should take you next.',
    service4Title: 'Digital marketing',
    service4Desc: 'Social strategy and content management so your brand looks as good as it runs.',
    aboutLabel: 'About us',
    aboutTitle: 'A boutique agency, with a partner\'s mindset',
    aboutBody1: 'OPSYN exists to close the gap between slow traditional agencies buried in management layers, and lone freelancers who solve one-off tasks without seeing the whole business.',
    aboutBody2: 'We think through your business first — how it works, where you want to go — and only then do we build. We work side by side with you, with fast answers and shared decisions, whether it\'s your first digital step or your leap into AI.',
    aboutPoint1Title: 'Strategic vision',
    aboutPoint1Desc: 'We don\'t start with code — we start with your business.',
    aboutPoint2Title: 'Close collaboration',
    aboutPoint2Desc: 'You talk directly with the people building it, no middlemen.',
    aboutPoint3Title: 'Real technical execution',
    aboutPoint3Desc: 'What we design, we build and maintain.',
    portfolioLabel: 'Portfolio',
    portfolioTitle: 'Success stories',
    blogLabel: 'Resources',
    blogTitle: 'Blog',
    contactLabel: 'Contact',
    contactTitle: 'Tell us your idea',
    contactSub: 'No fuss: tell us what you need and we\'ll come back with a tailored proposal.',
    formName: 'Name',
    formEmail: 'Email',
    formServiceLabel: 'Service you\'re interested in',
    formServicePlaceholder: 'Pick an option',
    formMessage: 'Tell us about your project',
    formSubmit: 'Send message',
    formSuccess: 'Thanks! We\'ll be in touch soon.',
    formErrorGeneric: 'Something went wrong sending your message. Please try again shortly.',
    formErrorValidation: 'Please check the form fields and try again.',
    formErrorRateLimit: 'You\'ve sent several messages already. Wait a few minutes before trying again.',
    footerTagline: 'Your full-stack tech partner.',
    footerLinksLabel: 'Sections',
    footerContactLabel: 'Contact',
  }
};

// ========================================
// INICIALIZACIÓN
// ========================================

let currentLang = ['es', 'en'].includes(localStorage.getItem('opsyn-lang'))
  ? localStorage.getItem('opsyn-lang')
  : 'es';

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initScrollReveal();
  initContactForm();
  initLangSwitcher();
  initNavToggle();
  initActiveNavObserver();
  initHeaderScrollState();
  initParallax();
  updateCopyright();
});

// ========================================
// GESTOR DE IDIOMA
// ========================================

function initLanguage() {
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('opsyn-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = TRANSLATIONS[lang][key];
    if (!translation) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else if (el.tagName === 'OPTION') {
      el.textContent = translation;
    } else {
      el.textContent = translation;
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  updateCopyright();
}

function updateCopyright() {
  const copyright = document.getElementById('copyright');
  if (copyright) {
    copyright.textContent = currentLang === 'es'
      ? '© 2026 OPSYN. Todos los derechos reservados.'
      : '© 2026 OPSYN. All rights reserved.';
  }
}

// ========================================
// SELECTOR DE IDIOMA
// ========================================

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });
}

// ========================================
// MENÚ MÓVIL
// ========================================

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ========================================
// FONDO DEL HEADER AL HACER SCROLL
// ========================================

function initHeaderScrollState() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

// ========================================
// SCROLL REVEAL (Animaciones)
// ========================================

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-on-scroll, .fade-in');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

// ========================================
// NAV ACTIVA (IntersectionObserver, sin scroll listener)
// ========================================

function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) setActive(visible.target.id);
  }, {
    rootMargin: '-40% 0px -50% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  sections.forEach(section => observer.observe(section));
}

// ========================================
// PARALLAX EN HERO (rAF-throttled, respeta reduced-motion)
// ========================================

function initParallax() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const circuitBg = document.querySelector('.circuit-bg');
  if (!circuitBg || prefersReducedMotion) return;

  let ticking = false;

  const update = () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      circuitBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit');
  const feedback = form.querySelector('.form-feedback');

  const setFeedback = (message, state) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.state = state || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn?.disabled) return;

    const payload = {
      nombre: form.querySelector('#f-nombre')?.value.trim() || '',
      email: form.querySelector('#f-email')?.value.trim() || '',
      servicio: form.querySelector('#f-servicio')?.value || '',
      mensaje: form.querySelector('#f-mensaje')?.value.trim() || '',
      _gotcha: form.querySelector('#f-gotcha')?.value || ''
    };

    submitBtn?.setAttribute('disabled', 'true');
    setFeedback('', '');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        setFeedback(TRANSLATIONS[currentLang].formSuccess, 'success');
        form.reset();
      } else if (response.status === 429) {
        setFeedback(TRANSLATIONS[currentLang].formErrorRateLimit, 'error');
      } else if (response.status === 400) {
        setFeedback(TRANSLATIONS[currentLang].formErrorValidation, 'error');
      } else {
        setFeedback(TRANSLATIONS[currentLang].formErrorGeneric, 'error');
      }
    } catch {
      setFeedback(TRANSLATIONS[currentLang].formErrorGeneric, 'error');
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}

// ========================================
// SMOOTH SCROLL PARA ENLACES
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
