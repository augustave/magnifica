// MAGNIFICA HUMANITAS — interaction layer
(function () {
  const navLinks = Array.from(document.querySelectorAll('.rail__nav a'));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const sel = document.getElementById('jump');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- Scroll progress (drives the gold fill via --progress) ----
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    h.style.setProperty('--progress', pct.toFixed(2) + '%');
  }

  // ---- Active section highlight (position-based; survives jumps) ----
  function updateActive() {
    const threshold = window.innerHeight * 0.4;
    let current = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= threshold) current = s;
    }
    const href = current ? '#' + current.id : '#top';
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === href));
    if (sel && sel.value !== href) sel.value = href;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateActive();
      ticking = false;
    });
  }

  // ---- Reveal on scroll ----
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.04 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

  // Instantly reveal anything already in view (deep links, restored scroll)
  function revealInView() {
    const vh = window.innerHeight;
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
      if (el.getBoundingClientRect().top < vh) { el.classList.add('in'); revealer.unobserve(el); }
    });
  }
  revealInView();

  // ---- Mobile jump select ----
  if (sel) {
    sel.addEventListener('change', () => {
      const t = document.querySelector(sel.value);
      if (t) t.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  // ---- Re-anchor hash after web fonts settle (layout shifts) ----
  if (document.fonts && location.hash) {
    document.fonts.ready.then(() => {
      const t = document.querySelector(location.hash);
      if (t) t.scrollIntoView({ behavior: 'instant' });
      revealInView();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateProgress();
  updateActive();
})();
