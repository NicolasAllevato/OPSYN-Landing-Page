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
    formMessage: 'Contanos sobre tu proyecto',
    formSubmit: 'Enviar mensaje',
    formSuccess: '¡Gracias! Te contactaremos pronto.',
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
    formMessage: 'Tell us about your project',
    formSubmit: 'Send message',
    formSuccess: 'Thanks! We\'ll be in touch soon.',
    footerTagline: 'Your full-stack tech partner.',
    footerLinksLabel: 'Sections',
    footerContactLabel: 'Contact',
  }
};

// ========================================
// INICIALIZACIÓN
// ========================================

let currentLang = localStorage.getItem('opsyn-lang') || 'es';

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initScrollReveal();
  initContactForm();
  initLangSwitcher();
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

  // Actualizar texto de elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = TRANSLATIONS[lang][key];
    if (translation) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else if (el.tagName === 'SELECT') {
        el.querySelector('option[value=""]').textContent = translation;
      } else if (el.tagName === 'BUTTON' && el.classList.contains('form-submit')) {
        el.textContent = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  // Actualizar botones de idioma
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-lang="${lang}"]`)?.classList.add('active');

  // Actualizar copyright
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
      const lang = e.target.getAttribute('data-lang');
      applyLanguage(lang);
    });
  });
}

// ========================================
// SCROLL REVEAL (Animaciones)
// ========================================

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ========================================
// FORMULARIO DE CONTACTO
// ========================================

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      nombre: form.querySelector('input[type="text"]').value,
      email: form.querySelector('input[type="email"]').value,
      servicio: form.querySelector('select').value,
      mensaje: form.querySelector('textarea').value,
      fecha: new Date().toLocaleString(),
      idioma: currentLang
    };

    try {
      // Aquí se puede integrar un servicio de email (Formspree, EmailJS, etc.)
      // Por ahora, simulamos el envío
      console.log('Mensaje enviado:', data);

      // Mostrar mensaje de éxito
      const submitBtn = form.querySelector('.form-submit');
      const successMsg = form.querySelector('.form-success');

      submitBtn.style.display = 'none';
      successMsg.classList.remove('hidden');

      // Limpiar formulario
      form.reset();

      // Restaurar estado después de 3 segundos
      setTimeout(() => {
        submitBtn.style.display = 'block';
        successMsg.classList.add('hidden');
      }, 3000);

    } catch (error) {
      console.error('Error al enviar:', error);
      alert(currentLang === 'es'
        ? 'Hubo un error al enviar tu mensaje. Intenta nuevamente.'
        : 'There was an error sending your message. Please try again.');
    }
  });

  // Mejorar inputs
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement?.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      this.parentElement?.classList.remove('focused');
    });
  });
}

// ========================================
// SMOOTH SCROLL PARA ENLACES
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ========================================
// NAV ACTIVA EN SCROLL
// ========================================

window.addEventListener('scroll', () => {
  updateActiveNav();
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      const activeLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  });
}

// ========================================
// PARALLAX EFFECT EN HERO
// ========================================

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');

  if (hero && scrolled < window.innerHeight) {
    const circuitBg = document.querySelector('.circuit-bg');
    if (circuitBg) {
      circuitBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  }
});

// ========================================
// UTILIDADES
// ========================================

// Detectar si el navegador soporta características
function checkBrowserSupport() {
  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const hasLocalStorage = (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  })();

  if (!hasIntersectionObserver) {
    console.warn('IntersectionObserver no soportado. Las animaciones de scroll pueden no funcionar.');
  }

  if (!hasLocalStorage) {
    console.warn('localStorage no disponible. El idioma seleccionado no se guardará.');
  }

  return hasIntersectionObserver && hasLocalStorage;
}

// Iniciar verificación de soporte
checkBrowserSupport();

// ========================================
// ANALYTICS (Opcional)
// ========================================

// Rastrear clics en CTA
document.querySelectorAll('.cta-button').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('CTA clicked:', btn.textContent);
    // Aquí se puede enviar a Google Analytics, Mixpanel, etc.
  });
});

// ========================================
// SERVICE WORKER (Opcional)
// ========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Descomenta la siguiente línea si tienes un archivo sw.js
    // navigator.serviceWorker.register('./sw.js');
  });
}
