/* Alexey Velásquez · portfolio interactions
   falling light spine · node graph · theme toggle · tactile titles
   cursor aura · magnetic buttons · spotlight · reveals · counters */

(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const isLight = () => root.getAttribute('data-theme') === 'light';

  /* ------------------------------------------------------------------
     Theme toggle — night terra by default, clear terra on demand
     ------------------------------------------------------------------ */
  const themeBtn = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const applyThemeExtras = () => {
    const light = isLight();
    if (themeMeta) themeMeta.setAttribute('content', light ? '#f2e7dd' : '#1b120d');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(light));
      themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    }
  };

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      root.classList.add('theming');
      if (isLight()) {
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      applyThemeExtras();
      setTimeout(() => root.classList.remove('theming'), 450);
    });
  }
  applyThemeExtras();

  /* ------------------------------------------------------------------
     The falling light — one luminous thread runs the whole page,
     passing through every node: the name, each job, each project,
     each section. Scrolling makes the light fall along it, igniting
     nodes as it passes.
     ------------------------------------------------------------------ */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'spine';
  svg.setAttribute('aria-hidden', 'true');
  document.body.prepend(svg);

  let basePath, litPath, headDot, headHalo;
  let anchors = [];      // {el, x, y, s, node, kind}
  let totalLen = 0;
  let samples = [];      // [{s, y}] for scroll → length lookup

  const cAttr = (el, attrs) => { for (const k in attrs) el.setAttribute(k, attrs[k]); };

  const collectAnchors = () => {
    const sy = window.scrollY;
    const rail = window.innerWidth <= 900;
    const out = [];
    const push = (el, x, y, kind) => out.push({ el, x: Math.max(20, x), y, kind });

    const hero = document.querySelector('.hero-name');
    if (hero) {
      const r = hero.getBoundingClientRect();
      push(hero, rail ? 26 : r.left + Math.min(400, r.width * 0.28), r.top + sy + r.height / 2, 'title');
    }
    document.querySelectorAll('section').forEach((sec) => {
      if (sec.classList.contains('contact')) return;
      const h2 = sec.querySelector('.section-head h2, .about-inner h2');
      if (h2) {
        const r = h2.getBoundingClientRect();
        push(h2, rail ? 26 : r.left + 140, r.top + sy + r.height / 2, 'title');
      }
      if (sec.classList.contains('experience')) {
        const tl = sec.querySelector('.timeline');
        const tr = tl.getBoundingClientRect();
        const cx = rail ? 26 : tr.left + tr.width / 2;
        tl.querySelectorAll('.entry').forEach((en) => {
          const r = en.getBoundingClientRect();
          push(en, cx, r.top + sy + Math.min(56, r.height / 2), 'entry');
        });
      }
      if (sec.classList.contains('work')) {
        sec.querySelectorAll('.case h3').forEach((h3) => {
          const r = h3.getBoundingClientRect();
          push(h3, rail ? 26 : r.left + r.width / 2, r.top + sy + r.height / 2, 'title');
        });
        sec.querySelectorAll('.ml-row').forEach((row, i) => {
          const r = row.getBoundingClientRect();
          push(row, rail ? 26 : r.left + r.width * (i % 2 ? 0.68 : 0.3), r.top + sy + r.height / 2, 'row');
        });
      }
    });
    out.sort((a, b) => a.y - b.y);
    return out;
  };

  const buildSpine = () => {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    anchors = collectAnchors();
    if (!anchors.length) return;

    const docW = document.documentElement.clientWidth;
    const docH = document.documentElement.scrollHeight;
    cAttr(svg, { width: docW, height: docH, viewBox: '0 0 ' + docW + ' ' + docH });
    svg.style.height = docH + 'px';

    const contact = document.querySelector('.contact');
    const endY = contact
      ? contact.getBoundingClientRect().top + window.scrollY - 50
      : docH - 80;
    const pts = [
      { x: anchors[0].x, y: 0 },
      ...anchors.map((a) => ({ x: a.x, y: a.y })),
      { x: Math.max(26, docW * 0.5), y: endY }
    ];

    // Catmull-Rom through the nodes → smooth falling thread
    let d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
      const p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2.x + ' ' + p2.y;
    }

    basePath = document.createElementNS(NS, 'path');
    cAttr(basePath, { d, class: 'spine-base' });
    svg.appendChild(basePath);

    litPath = document.createElementNS(NS, 'path');
    cAttr(litPath, { d, class: 'spine-lit' });
    svg.appendChild(litPath);

    totalLen = basePath.getTotalLength();
    litPath.style.strokeDasharray = '0 ' + (totalLen + 10);

    // sample the path so scroll position maps to length quickly
    samples = [];
    const N = 600;
    for (let i = 0; i <= N; i++) {
      const s = (totalLen * i) / N;
      samples.push({ s, y: basePath.getPointAtLength(s).y });
    }
    // assign each anchor its position along the thread
    for (const a of anchors) {
      let best = 0, bd = 1e12;
      for (const sm of samples) {
        const dd = Math.abs(sm.y - a.y);
        if (dd < bd) { bd = dd; best = sm.s; }
      }
      a.s = best;
    }

    // nodes
    for (const a of anchors) {
      const n = document.createElementNS(NS, 'circle');
      cAttr(n, { cx: a.x, cy: a.y, r: a.kind === 'entry' ? 6 : 5, class: 'spine-node' });
      svg.appendChild(n);
      a.node = n;
    }

    headHalo = document.createElementNS(NS, 'circle');
    cAttr(headHalo, { r: 17, class: 'spine-halo' });
    svg.appendChild(headHalo);
    headDot = document.createElementNS(NS, 'circle');
    cAttr(headDot, { r: 5, class: 'spine-head' });
    svg.appendChild(headDot);
  };

  const lightAt = (s) => {
    litPath.style.strokeDasharray = s + ' ' + (totalLen + 10);
    const p = basePath.getPointAtLength(s);
    cAttr(headDot, { cx: p.x, cy: p.y });
    cAttr(headHalo, { cx: p.x, cy: p.y });
    for (const a of anchors) {
      const on = a.s <= s + 2;
      a.node.classList.toggle('on', on);
      if (a.kind === 'entry') a.el.classList.toggle('lit', on);
      else a.el.classList.toggle('spine-glow', on);
    }
  };

  const sForScroll = () => {
    const focusY = window.scrollY + window.innerHeight * 0.45;
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].y < focusY) lo = mid + 1; else hi = mid;
    }
    return samples[lo].s;
  };

  let spineTick = false;
  const onSpineScroll = () => {
    if (spineTick) return;
    spineTick = true;
    requestAnimationFrame(() => {
      spineTick = false;
      if (totalLen) lightAt(sForScroll());
    });
  };

  let rbTimer = 0;
  const rebuild = () => {
    clearTimeout(rbTimer);
    rbTimer = setTimeout(() => {
      buildSpine();
      if (reducedMotion) {
        lightAt(totalLen);
        if (headDot) { headDot.style.display = 'none'; headHalo.style.display = 'none'; }
      } else {
        lightAt(sForScroll());
      }
    }, 180);
  };

  buildSpine();
  if (reducedMotion) {
    lightAt(totalLen);
    if (headDot) { headDot.style.display = 'none'; headHalo.style.display = 'none'; }
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', rebuild);
  } else {
    lightAt(sForScroll());
    window.addEventListener('scroll', onSpineScroll, { passive: true });
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', rebuild);
  }

  /* ------------------------------------------------------------------
     Tactile titles — letters rise and warm under the cursor
     ------------------------------------------------------------------ */
  if (finePointer && !reducedMotion) {
    const titles = document.querySelectorAll(
      '.hero-name .line, .section-head h2, .case h3, .entry h3, .ml-info h3, .about-inner h2, .contact-inner h2'
    );
    titles.forEach((el) => {
      if (el.closest('.hero-name')) {
        const h1 = el.closest('.hero-name');
        if (!h1.hasAttribute('aria-label')) h1.setAttribute('aria-label', h1.textContent.trim());
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.setAttribute('aria-label', el.textContent.trim());
      }

      const wrap = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((tok) => {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
              const word = document.createElement('span');
              word.className = 'word';
              for (const chr of tok) {
                const c = document.createElement('span');
                c.className = 'ch';
                c.textContent = chr;
                word.appendChild(c);
              }
              frag.appendChild(word);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) {
            wrap(n);
          }
        });
      };
      wrap(el);

      const chs = [...el.querySelectorAll('.ch')];
      if (!chs.length) return;
      const cur = new Array(chs.length).fill(0);
      let tgt = new Array(chs.length).fill(0);
      let raf = 0;

      const step = () => {
        let settled = true;
        for (let i = 0; i < chs.length; i++) {
          cur[i] += (tgt[i] - cur[i]) * 0.2;
          const f = cur[i];
          if (Math.abs(tgt[i] - f) > 0.004 || f > 0.004) settled = false;
          if (f > 0.004) {
            chs[i].style.transform = 'translateY(' + (-f * 0.14).toFixed(3) + 'em)';
            chs[i].style.color = 'color-mix(in oklab, var(--terra) ' + Math.round(f * 100) + '%, currentColor)';
          } else {
            chs[i].style.transform = '';
            chs[i].style.color = '';
          }
        }
        raf = settled ? 0 : requestAnimationFrame(step);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

      el.addEventListener('pointermove', (e) => {
        const R = 110;
        for (let i = 0; i < chs.length; i++) {
          const r = chs[i].getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          tgt[i] = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
        }
        kick();
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        tgt = new Array(chs.length).fill(0);
        kick();
      });
    });
  }

  /* ------------------------------------------------------------------
     Cursor aura
     ------------------------------------------------------------------ */
  const aura = document.querySelector('.cursor-aura');
  if (aura && finePointer && !reducedMotion) {
    let ax = -600, ay = -600, tx = ax, ty = ay, active = false;

    const follow = () => {
      ax += (tx - ax) * 0.12;
      ay += (ty - ay) * 0.12;
      aura.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)';
      requestAnimationFrame(follow);
    };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        document.body.classList.add('aura-on');
        ax = tx; ay = ty;
        requestAnimationFrame(follow);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.remove('aura-on'));
    document.addEventListener('mouseenter', () => { if (active) document.body.classList.add('aura-on'); });
  }

  /* ------------------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------------------ */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.28, max = 10;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        let ox = (e.clientX - (r.left + r.width / 2)) * strength;
        let oy = (e.clientY - (r.top + r.height / 2)) * strength;
        ox = Math.max(-max, Math.min(max, ox));
        oy = Math.max(-max, Math.min(max, oy));
        el.style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------
     Spotlight position on media frames and rows
     ------------------------------------------------------------------ */
  if (finePointer) {
    document.querySelectorAll('[data-spotlight]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------
     Tech stack readout — hover a tile, see where it earned its place
     ------------------------------------------------------------------ */
  const readout = document.querySelector('.stack-readout');
  if (readout) {
    const show = (tile) => {
      document.querySelectorAll('.tile.active').forEach((x) => x.classList.remove('active'));
      tile.classList.add('active');
      readout.textContent = '◆ ' + tile.textContent.trim() + ' · ' + tile.dataset.where;
    };
    document.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('mouseenter', () => show(tile));
      tile.addEventListener('focus', () => show(tile));
      tile.addEventListener('click', () => show(tile));
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals + metric counters
     ------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window) || reducedMotion) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('[data-count]').forEach(runCounter);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     Nav state
     ------------------------------------------------------------------ */
  const nav = document.querySelector('.nav');
  const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ------------------------------------------------------------------ */
  console.log(
    '%csignal detected.%c\nReading the source? Good instinct. The rest is at https://github.com/Alexey0424',
    'color:#d96f47;font-weight:bold;font-size:14px', 'color:inherit'
  );
})();
