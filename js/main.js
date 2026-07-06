/* Alexey Velásquez · portfolio interactions
   terra aurora · theme toggle · timeline beam · stack readout
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
    window.dispatchEvent(new CustomEvent('themechange'));
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
     Terra aurora — molten clay gradients that drift and lean
     toward the cursor. No dots. Smooth, warm, alive.
     ------------------------------------------------------------------ */
  const canvas = document.getElementById('aurora');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1;
    let running = false, heroVisible = true;
    let rafId = 0;
    let t = 0;

    const mouse = { x: null, y: null };

    const PALETTES = {
      dark: {
        composite: 'lighter',
        blobs: [
          { c: '217,111,71', a: 0.34 },  // terracotta
          { c: '232,152,92', a: 0.22 },  // warm sand
          { c: '155,78,52',  a: 0.30 }   // deep clay
        ]
      },
      light: {
        composite: 'source-over',
        blobs: [
          { c: '206,102,66', a: 0.26 },
          { c: '226,150,96', a: 0.22 },
          { c: '166,88,58',  a: 0.18 }
        ]
      }
    };

    // per-blob drift parameters (frequency, phase, parallax pull)
    const B = [
      { fx: 0.21, fy: 0.16, px: 0.62, py: 0.30, pull: 0.16, r: 0.62, x: 0, y: 0 },
      { fx: 0.13, fy: 0.24, px: 2.10, py: 4.20, pull: -0.10, r: 0.52, x: 0, y: 0 },
      { fx: 0.17, fy: 0.11, px: 4.60, py: 1.30, pull: 0.07, r: 0.72, x: 0, y: 0 }
    ];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const pal = PALETTES[isLight() ? 'light' : 'dark'];
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = pal.composite;

      const mx = mouse.x === null ? w * 0.62 : mouse.x;
      const my = mouse.y === null ? h * 0.40 : mouse.y;
      const R = Math.min(w, h);

      for (let i = 0; i < B.length; i++) {
        const b = B[i];
        // slow drift anchored to thirds of the hero, plus cursor lean
        const ax = w * (0.30 + 0.40 * Math.sin(t * b.fx + b.px));
        const ay = h * (0.35 + 0.30 * Math.sin(t * b.fy + b.py));
        const tx = ax + (mx - w / 2) * b.pull;
        const ty = ay + (my - h / 2) * b.pull;
        b.x += (tx - b.x) * 0.045;
        b.y += (ty - b.y) * 0.045;

        const rad = R * b.r;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
        const blob = pal.blobs[i];
        g.addColorStop(0, 'rgba(' + blob.c + ',' + blob.a + ')');
        g.addColorStop(0.55, 'rgba(' + blob.c + ',' + (blob.a * 0.35).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + blob.c + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(b.x - rad, b.y - rad, rad * 2, rad * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = () => {
      t += 0.016;
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const setRunning = (on) => {
      if (on && !running) { running = true; rafId = requestAnimationFrame(loop); }
      if (!on && running) { running = false; cancelAnimationFrame(rafId); }
    };

    resize();
    // settle blobs onto their anchors before first paint
    for (let k = 0; k < 60; k++) { t += 0.016; draw(); }

    if (reducedMotion) {
      window.addEventListener('resize', () => { resize(); draw(); });
      window.addEventListener('themechange', () => draw());
    } else {
      window.addEventListener('resize', resize);
      window.addEventListener('themechange', () => { if (!running) draw(); });
      window.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });

      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        setRunning(heroVisible && !document.hidden);
      }, { threshold: 0.02 }).observe(hero);

      document.addEventListener('visibilitychange', () => {
        setRunning(heroVisible && !document.hidden);
      });

      setRunning(true);
    }
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
     Experience timeline — the light that walks the line
     ------------------------------------------------------------------ */
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const entries = [...timeline.querySelectorAll('.entry')];
    if (reducedMotion) {
      entries.forEach((e) => e.classList.add('lit'));
    } else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = timeline.getBoundingClientRect();
        const focus = window.innerHeight * 0.55;
        const p = Math.max(0, Math.min(1, (focus - rect.top) / rect.height));
        timeline.style.setProperty('--tp', p.toFixed(4));
        const tipY = rect.top + p * rect.height;
        entries.forEach((en) => {
          en.classList.toggle('lit', en.getBoundingClientRect().top + 40 <= tipY);
        });
      };
      const onScroll = () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
    }
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
    const io = new IntersectionObserver((entries2) => {
      entries2.forEach((entry) => {
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
