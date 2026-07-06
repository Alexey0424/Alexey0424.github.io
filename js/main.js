/* Alexey Velásquez · portfolio interactions
   signal field · cursor aura · magnetic buttons · spotlight · reveals · counters */

(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ------------------------------------------------------------------
     Signal field — a mesh of waveform lines rendered as glowing dots.
     The cursor is a disturbance: it bends the lines and heats them up.
     ------------------------------------------------------------------ */
  const canvas = document.getElementById('signal');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1;
    let running = false, heroVisible = true;
    let rafId = 0;
    let t = 0;

    const mouse = { x: -9999, y: -9999, lastMove: -Infinity };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // virtual cursor drifts when the real one is idle or absent
      const idle = performance.now() - mouse.lastMove > 2600;
      let mx = mouse.x, my = mouse.y;
      if (idle || !finePointer) {
        mx = w * (0.5 + 0.36 * Math.sin(t * 0.42));
        my = h * (0.48 + 0.30 * Math.sin(t * 0.31 + 1.7));
      }

      const rows = Math.max(16, Math.min(26, Math.round(h / 34)));
      const gapY = h / (rows + 1);
      const stepX = Math.max(12, w / 90);

      for (let r = 1; r <= rows; r++) {
        const baseY = r * gapY;
        for (let x = 0; x <= w; x += stepX) {
          const wave =
            Math.sin(x * 0.006 + t * 1.05 + r * 0.65) * 9 +
            Math.sin(x * 0.014 - t * 0.7 + r * 1.4) * 5;

          const dx = x - mx;
          const dyb = baseY - my;
          const d2 = dx * dx + dyb * dyb;
          const f = Math.exp(-d2 / 42000); // ~205px falloff

          const y = baseY + wave * (1 + 2.6 * f) + (dyb / Math.sqrt(d2 + 40)) * f * 52;
          const alpha = 0.11 + 0.75 * f;
          const size = 1.25 + 1.75 * f;

          // cool ember far away, hot amber near the cursor
          const g = Math.round(112 + 68 * f);
          const b = Math.round(38 + 62 * f);
          ctx.fillStyle = 'rgba(255,' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
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

    if (reducedMotion) {
      // a single calm frame, no animation
      draw();
      window.addEventListener('resize', () => { resize(); draw(); });
    } else {
      window.addEventListener('resize', () => { resize(); });
      window.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.lastMove = performance.now();
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
    let ax = -600, ay = -600, tx = ax, ty = ay, auraRaf = 0, active = false;

    const follow = () => {
      ax += (tx - ax) * 0.12;
      ay += (ty - ay) * 0.12;
      aura.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)';
      auraRaf = requestAnimationFrame(follow);
    };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        document.body.classList.add('aura-on');
        ax = tx; ay = ty;
        auraRaf = requestAnimationFrame(follow);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.body.classList.remove('aura-on');
    });
    document.addEventListener('mouseenter', () => {
      if (active) document.body.classList.add('aura-on');
    });
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
     Scroll reveals + metric counters
     ------------------------------------------------------------------ */
  const reveals = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-count]');

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

    // counters that live outside .reveal containers
    counters.forEach((el) => {
      if (!el.closest('.reveal')) {
        const cio = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) { runCounter(el); cio.disconnect(); }
        }, { threshold: 0.4 });
        cio.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------
     Nav state
     ------------------------------------------------------------------ */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  console.log(
    '%csignal detected.%c\nReading the source? Good instinct. The rest is at https://github.com/Alexey0424',
    'color:#ff7a33;font-weight:bold;font-size:14px', 'color:inherit'
  );
})();
