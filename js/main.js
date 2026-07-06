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
     Terra water — a full-page water surface of flowing contour lines.
     It ripples with the cursor, and as key content scrolls into view
     the water parts around it, compressing into dense rows at the
     edges of the space it leaves behind.
     ------------------------------------------------------------------ */
  const canvas = document.getElementById('water');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1;
    let running = false;
    let rafId = 0;
    let t = 0;

    const mouse = { x: -9999, y: -9999 };
    const ripples = [];
    let lastRipple = 0, lastRx = 0, lastRy = 0;

    const landmarks = [...document.querySelectorAll(
      '.hero-name, .section-head h2, .case h3, .about-inner h2'
    )];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const activeRects = () => {
      const out = [];
      for (const el of landmarks) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.bottom > -140 && r.top < h + 140) out.push(r);
      }
      return out;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const light = isLight();
      const rects = activeRects();
      const spacing = 34;
      const rows = Math.ceil(h / spacing) + 2;
      const step = Math.max(14, w / 110);
      const baseA = light ? 0.17 : 0.13;

      // the landmark closest to the focal line is the one being read:
      // the water will ping it
      let focus = null, focusDist = 1e9;
      const focal = h * 0.42;
      for (const rc of rects) {
        const d = Math.abs(rc.top + rc.height / 2 - focal);
        if (d < focusDist) { focusDist = d; focus = rc; }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        if (t - ripples[i].t0 > 2.2) ripples.splice(i, 1);
      }

      const hi = []; // highlighted segments: parted edges + cursor wake

      for (let r = 0; r < rows; r++) {
        const baseY = r * spacing;
        const k = r / rows;
        const col = light
          ? (150 - 20 * k) + ',' + (76 - 14 * k) + ',' + (50 - 8 * k)
          : (224 - 58 * k) + ',' + (140 - 52 * k) + ',' + (96 - 38 * k);

        ctx.beginPath();
        let prevX = 0, prevY = 0, prevBoost = 0;

        for (let x = 0; x <= w + step; x += step) {
          const wave =
            Math.sin(x * 0.0042 + t * 0.32 + r * 0.9) * 6.5 +
            Math.sin(x * 0.011 + t * 0.62 + r * 0.55) * 4.5 +
            Math.sin(x * 0.023 - t * 0.5 + r * 1.3) * 2.2;
          let y = baseY + wave;
          let boost = 0;

          // the water makes space for what matters
          for (const rc of rects) {
            const cx0 = rc.left - 110, cx1 = rc.right + 110;
            if (x < cx0 || x > cx1) continue;
            const fe = Math.min(1, Math.min(x - cx0, cx1 - x) / 110);
            const fx = fe * fe * (3 - 2 * fe); // smoothstep: liquid ends, no facets
            const cy = rc.top + rc.height / 2;
            const H = rc.height / 2 + 46;
            const dy = baseY - cy;
            const ady = Math.abs(dy);
            if (ady < H) {
              const push = (1 - (ady / H) * (ady / H)) * H * 0.94 * fx;
              y += (dy >= 0 ? 1 : -1) * push;
              boost = Math.max(boost, Math.min(0.3, (push / H) * 0.34));
            }
          }

          // cursor presses a soft hollow into the surface
          const dxm = x - mouse.x, dym = y - mouse.y;
          const dm2 = dxm * dxm + dym * dym;
          if (dm2 < 90000) {
            const fm = Math.exp(-dm2 / 16000);
            const dm = Math.sqrt(dm2) + 0.001;
            y += (dym / dm) * fm * 34;
            boost = Math.max(boost, fm * 0.4);
          }

          // expanding ripple rings from movement
          for (const rp of ripples) {
            const age = t - rp.t0;
            const rad = age * 230;
            const dxr = x - rp.x, dyr = y - rp.y;
            const dr = Math.sqrt(dxr * dxr + dyr * dyr) + 0.001;
            const band = Math.exp(-((dr - rad) * (dr - rad)) / 1800);
            const s = 20 * Math.exp(-age * 1.6) * band;
            if (s > 0.3) {
              y += (dyr / dr) * s;
              boost = Math.max(boost, s * 0.012);
            }
          }

          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          if (boost > 0.05 && prevBoost > 0.02) {
            hi.push({ x1: prevX, y1: prevY, x2: x, y2: y, a: boost });
          }
          prevX = x; prevY = y; prevBoost = boost;
        }

        ctx.strokeStyle = 'rgba(' + col + ',' + baseA + ')';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      if (hi.length) {
        const hcol = light ? '150,74,48' : '238,170,122';
        const buckets = [[0.05, 0.14, 0.2], [0.14, 0.26, 0.32], [0.26, 1.01, 0.5]];
        for (const [lo, up, a] of buckets) {
          ctx.beginPath();
          let any = false;
          for (const s of hi) {
            if (s.a >= lo && s.a < up) {
              ctx.moveTo(s.x1, s.y1);
              ctx.lineTo(s.x2, s.y2);
              any = true;
            }
          }
          if (any) {
            ctx.strokeStyle = 'rgba(' + hcol + ',' + a + ')';
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
      }

      // sonar — the water pings whatever you are reading:
      // rings ripple outward from the focused landmark and fade
      if (focus) {
        const fade = 1 - Math.min(1, focusDist / (h * 0.5));
        if (fade > 0.03) {
          const rcol = light ? '150,74,48' : '238,170,122';
          const ring = (x0, y0, ww, hh, rad) => {
            if (ctx.roundRect) { ctx.roundRect(x0, y0, ww, hh, rad); return; }
            ctx.moveTo(x0 + rad, y0);
            ctx.arcTo(x0 + ww, y0, x0 + ww, y0 + hh, rad);
            ctx.arcTo(x0 + ww, y0 + hh, x0, y0 + hh, rad);
            ctx.arcTo(x0, y0 + hh, x0, y0, rad);
            ctx.arcTo(x0, y0, x0 + ww, y0, rad);
            ctx.closePath();
          };
          for (let i = 0; i < 3; i++) {
            const ph = (t / 2.6 + i / 3) % 1;
            const pad = 18 + ph * 74;
            const a = (1 - ph) * (1 - ph) * 0.5 * fade;
            if (a < 0.02) continue;
            ctx.beginPath();
            ring(
              focus.left - pad, focus.top - pad,
              focus.width + pad * 2, focus.height + pad * 2,
              Math.min(26 + ph * 30, (focus.height + pad * 2) / 2)
            );
            ctx.strokeStyle = 'rgba(' + rcol + ',' + a.toFixed(3) + ')';
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
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
      draw();
      const redraw = () => { resize(); draw(); };
      window.addEventListener('resize', redraw);
      window.addEventListener('scroll', () => draw(), { passive: true });
      window.addEventListener('themechange', () => draw());
    } else {
      draw(); // first frame immediately, even if the tab starts hidden
      window.addEventListener('resize', resize);
      window.addEventListener('themechange', () => { if (!running) draw(); });
      window.addEventListener('pointermove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        const dx = mouse.x - lastRx, dy = mouse.y - lastRy;
        if (t - lastRipple > 0.14 && dx * dx + dy * dy > 700 && ripples.length < 10) {
          ripples.push({ x: mouse.x, y: mouse.y, t0: t });
          lastRipple = t; lastRx = mouse.x; lastRy = mouse.y;
        }
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        setRunning(!document.hidden);
      });

      setRunning(!document.hidden);
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
