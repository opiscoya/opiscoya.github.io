(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const year = document.querySelector('#year');
  const progress = document.querySelector('.scroll-progress span');
  if (year) year.textContent = new Date().getFullYear();

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      nav.classList.remove('open');
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        nav.classList.remove('open');
        toggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        nav.classList.remove('open');
      }
    }, { passive: true });
  }

  const revealTargets = [
    ...document.querySelectorAll('.section-kicker, .intro-grid, .projects-heading, .capability, .approach-grid > div, .contact-copy'),
    ...document.querySelectorAll('.project-card')
  ];
  revealTargets.forEach((item) => item.classList.add('reveal'));

  const animateCount = (element) => {
    const end = Number(element.dataset.count);
    if (!Number.isFinite(end)) return;
    if (reduceMotion) { element.textContent = String(end).padStart(Number(element.dataset.pad || 0), '0'); return; }
    const duration = 950;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      element.textContent = String(Math.round(end * eased)).padStart(Number(element.dataset.pad || 0), '0');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.querySelectorAll('.hero-visual [data-count]').forEach(animateCount);

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item, index) => {
      if (item.classList.contains('project-card')) item.style.transitionDelay = ((index % 2) * 90) + 'ms';
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', (event.clientX - bounds.left) + 'px');
        card.style.setProperty('--spot-y', (event.clientY - bounds.top) + 'px');
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--spot-x');
        card.style.removeProperty('--spot-y');
      });
    });
    const hero = document.querySelector('.hero-visual');
    const panel = document.querySelector('.dashboard-card');
    if (hero && panel) {
      hero.addEventListener('pointermove', (event) => {
        const r = hero.getBoundingClientRect();
        const x = (event.clientX - r.left) / r.width - .5;
        const y = (event.clientY - r.top) / r.height - .5;
        panel.style.transform = 'translate3d(' + (x * 9) + 'px,' + (y * 8) + 'px,0) rotate(-2.5deg)';
      });
      hero.addEventListener('pointerleave', () => { panel.style.transform = ''; });
    }
  }
})();
