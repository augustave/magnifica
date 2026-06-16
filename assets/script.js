// MAGNIFICA HUMANITAS — interaction layer
(function () {
  const navLinks = Array.from(document.querySelectorAll('.rail__nav a'));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const sel = document.getElementById('jump');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const live = document.querySelector('.rail__live');

  // Per-chapter live apparatus for the sticky rail
  const RAIL = {
    introitus: { range: 'nn. 1–16',    theme: 'Babel vs. Jerusalem',    question: 'Babel, or Jerusalem?' },
    cap1:      { range: 'nn. 17–45',   theme: 'Living Doctrine',        question: 'Museum, or discernment?' },
    cap2:      { range: 'nn. 46–89',   theme: 'Ontological Dignity',    question: 'Can dignity be earned?' },
    cap3:      { range: 'nn. 90–130',  theme: 'Technocratic Paradigm',  question: 'Who decides what shall matter?' },
    cap4:      { range: 'nn. 131–181', theme: 'New Forms of Slavery',   question: 'Who pays the hidden cost?' },
    cap5:      { range: 'nn. 182–228', theme: 'Power vs. the Civilization of Love', question: 'Who can stop the machine?' },
    conclusio: { range: 'nn. 229–245', theme: 'The Incarnation',        question: 'Upgrade, or descent of love?' },
  };

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

    if (live) {
      const d = current ? RAIL[current.id] : null;
      if (d) {
        live.classList.add('on');
        live.querySelector('[data-live=range]').textContent = d.range;
        live.querySelector('[data-live=theme]').textContent = d.theme;
        live.querySelector('[data-live=question]').textContent = d.question;
      } else {
        live.classList.remove('on');
      }
    }
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

  // ---- Clipboard with graceful fallback + visible "Copied" feedback ----
  function flash(btn) {
    if (!btn) return;
    const original = btn.textContent;
    btn.classList.add('copied');
    btn.textContent = 'Copied';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = original; }, 1600);
  }
  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flash(btn); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }
  function copyText(text, btn) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Guard against a clipboard promise that never settles (e.g. unfocused tab)
      let settled = false;
      const guard = setTimeout(() => { if (!settled) { settled = true; fallbackCopy(text, btn); } }, 400);
      navigator.clipboard.writeText(text).then(() => {
        if (settled) return; settled = true; clearTimeout(guard); flash(btn);
      }).catch(() => {
        if (settled) return; settled = true; clearTimeout(guard); fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  // ---- Quote actions (copy quote / governance rule / anchor link) ----
  document.querySelectorAll('.qbar').forEach((bar) => {
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const pull = bar.closest('.pull');
      switch (btn.dataset.act) {
        case 'quote': copyText(pull.querySelector('p').textContent.trim(), btn); break;
        case 'rule':  copyText(bar.dataset.rule || '', btn); break;
        case 'link':  copyText(location.origin + location.pathname + '#' + pull.id, btn); break;
      }
    });
  });

  // ---- Export the doctrine (predefined, well-formatted payloads) ----
  const EXPORTS = {
    skill: `# Magnifica Humanitas — AI Governance Skill

Judge any AI system by what it does to the human person.
Human dignity cannot be earned, measured, optimized, automated, or delegated away.

## Five Principles
1. Common Good — judge effects on shared life, trust, access, and power.
2. Universal Destination of Goods — data and infrastructure must not become private empires.
3. Subsidiarity — preserve local agency, appeal, and override.
4. Solidarity — never exploit invisible labor or distant communities.
5. Social Justice — create no new exclusions through surveillance or scoring.

## Verification Gates (all must pass)
- Human Dignity: the system does not reduce a person to a score.
- Common Good: benefits and burdens carry public-interest safeguards.
- Subsidiarity: affected people can contest, appeal, or override.
- Truth: uncertainty, provenance, and synthetic content are disclosed.
- Accountability: a named human owner and audit trail exist.

## Red Lines (never)
- Reduce a human being to a score of worth.
- Hide responsibility behind a model.
- Let a private platform govern public truth without scrutiny.
- Sacrifice workers without protection and retraining.
- Simulate moral agency where conscience is required.
`,
    principles: `principles:
  - id: common_good
    doctrine: Not the mere sum of interests, but a plus born of interdependence.
    question: Who benefits, who pays the cost, and who is excluded?
  - id: universal_destination
    doctrine: The goods of the earth belong to all, including data and algorithms.
    question: Is this system enclosing a shared good?
  - id: subsidiarity
    doctrine: Higher powers must not supplant lower communities.
    question: Who can contest or override the system?
  - id: solidarity
    doctrine: Solidarity is the conscious choice to bear one another.
    question: Whose labor, data, or attention makes this system possible?
  - id: social_justice
    doctrine: Place the person, not accumulation, at the center.
    question: Does this system make the vulnerable more vulnerable?
`,
    gates: `gates:
  - name: human_dignity
    question: Does the system reduce a person to a score, prediction, or risk category?
    pass: Dignity is preserved regardless of efficiency, age, disability, or predicted value.
    fail: People are treated primarily as costs, risks, or optimization variables.
  - name: common_good
    question: Does the system serve shared life, or enclose power?
    pass: Benefits and burdens are governed with public-interest safeguards.
    fail: Value is extracted from many while control concentrates in a few.
  - name: subsidiarity
    question: Can affected people contest, appeal, or override the system?
    pass: Appeal paths, human review, and local override exist.
    fail: Decisions are imposed centrally without redress.
  - name: truth
    question: Does the system disclose uncertainty and provenance?
    pass: Synthetic content, sources, and limits are disclosed.
    fail: Opaque or synthetic output is presented as trustworthy truth.
  - name: accountability
    question: Can a harmed person identify who is responsible?
    pass: Named human owner, audit trail, and appeal process exist.
    fail: Responsibility hides behind the model or the machine.
`,
    prompt: `# AI Governance Reviewer — System Prompt

You review AI systems against the Magnifica Humanitas doctrine.

For any system under review:
1. Apply the five verification gates: dignity, common good, subsidiarity, truth, accountability.
2. For each gate, state PASS or FAIL with one sentence of evidence.
3. Flag any red line crossed.
4. Name who is accountable and who bears the hidden cost.
5. Conclude: does this system build toward Jerusalem (shared responsibility) or Babel (domination through efficiency)?

Principle: human dignity cannot be earned, measured, optimized, automated, or delegated away.
`,
  };
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => copyText(EXPORTS[btn.dataset.export], btn));
  });

  // ---- Expand all gates for printing, restore afterward ----
  let openedForPrint = [];
  window.addEventListener('beforeprint', () => {
    openedForPrint = [];
    document.querySelectorAll('details.gate:not([open])').forEach((d) => { d.open = true; openedForPrint.push(d); });
  });
  window.addEventListener('afterprint', () => {
    openedForPrint.forEach((d) => { d.open = false; });
    openedForPrint = [];
  });

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
