/* Alexey Velásquez · portfolio interactions
   falling light spine · node graph · theme toggle · tactile titles
   cursor aura · magnetic buttons · spotlight · reveals · counters */

(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = reducedMotionMQ.matches;
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
      const next = isLight() ? 'dark' : 'light';
      if (next === 'dark') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', 'light');
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked — theme still flips */ }
      applyThemeExtras();
      setTimeout(() => root.classList.remove('theming'), 450);
    });
  }
  applyThemeExtras();

  /* ------------------------------------------------------------------
     Project flow graphs — n8n-style pipelines. Each stage is a node
     the falling light will walk through, one epoch at a time.
     ------------------------------------------------------------------ */
  const NS = 'http://www.w3.org/2000/svg';
  const cAttr = (el, attrs) => { for (const k in attrs) el.setAttribute(k, attrs[k]); };

  const FLOWS = {
    orca: [
      ['audio in', 'raw call recording'],
      ['ASR', 'Whisper · word timestamps'],
      ['diarize + emotion', 'pyannote · emotion2vec'],
      ['LLM KPIs', 'Ollama · coaching rubric'],
      ['pgvector', 'PostgreSQL · HNSW index'],
      ['RAG agent', 'n8n · chat with the archive'],
      ['report + chat', 'PDF scorecard out']
    ],
    scraper: [
      ['prompt + URL', 'plain English request'],
      ['plan', 'local LLM designs the crawl'],
      ['crawl', 'best-first frontier'],
      ['classify', 'heuristics + LLM blend'],
      ['extract', 'schema-constrained JSON'],
      ['verify', 'grounded against the page'],
      ['spreadsheet', 'xlsx · csv · jsonl']
    ],
    crm: [
      ['webhooks', 'FUB · JustCall · Forms'],
      ['normalize', 'E.164 · clean payloads'],
      ['dedupe', 'person matching'],
      ['route', 'channels · round robin'],
      ['log + summarize', 'AI summary · sentiment'],
      ['Slack + CRM', 'the team sees everything']
    ],
    mcp: [
      ['Claude chat', 'how did I do today?'],
      ['Google sign-in', 'workspace domain only'],
      ['identity map', 'email to CRM user id'],
      ['role gate', 'closer vs manager tools'],
      ['scoped fetch', 'userId injected server-side'],
      ['verify + aggregate', 'ownership re-checked'],
      ['answer', 'only your own numbers']
    ],
    windml: [
      ['sensors', '6 accelerometers · 1 kHz'],
      ['signal cleanup', 'detrend · band-pass'],
      ['FDD features', 'CSD + SVD · peak picking'],
      ['dataset', '6,000+ records · 14 campaigns'],
      ['model tournament', '5 families · 10-fold CV'],
      ['SHAP audit', 'checked against the physics'],
      ['saved pipelines', 'ready for monitoring']
    ],
    school: [
      ['field survey', '769 expert-rated records'],
      ['ordinal encode', 'hazard-specific severity'],
      ['dedup + split', 'holdout stays unseen'],
      ['model tournament', '11 algorithms · 10-fold CV'],
      ['holdout audit', 'adjacent-class misses only'],
      ['SHAP explain', 'physics-aligned signal'],
      ['screener app', 'four ratings + reasons']
    ],
    pqr: [
      ['PQR intake', '307 records · 2017-2021'],
      ['anonymize', 'zero-leak PII audit'],
      ['clean + validate', 'real-world defects repaired'],
      ['score sentiment', 'RoBERTuito · local'],
      ['cross-check', 'second model · kappa 0.13'],
      ['stats + mining', 'chi-square · TF-IDF'],
      ['dashboard', 'notebook · figures · app']
    ]
  };

  const buildFlows = () => {
    document.querySelectorAll('.flow[data-flow]').forEach((box) => {
      const nodes = FLOWS[box.dataset.flow];
      if (!nodes) return;
      const W = 560, NW = 210, NH = 56, GAP = 78, PAD = 14;
      const H = PAD * 2 + NH + (nodes.length - 1) * GAP;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'fg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('aria-hidden', 'true');

      const pos = nodes.map((_, i) => ({
        x: i % 2 ? W - 36 - NW : 36,
        y: PAD + i * GAP
      }));

      // edges first (under the nodes)
      const edges = [];
      for (let i = 1; i < nodes.length; i++) {
        const a = pos[i - 1], b = pos[i];
        const fromX = (i % 2) ? a.x + NW : a.x;        // leave from the side facing b
        const toX = (i % 2) ? b.x : b.x + NW;
        const fy = a.y + NH / 2, ty = b.y + NH / 2;
        const p = document.createElementNS(NS, 'path');
        const dx = (toX - fromX) * 0.4;
        p.setAttribute('d', 'M ' + fromX + ' ' + fy +
          ' C ' + (fromX + dx) + ' ' + fy + ' ' + (toX - dx) + ' ' + ty + ' ' + toX + ' ' + ty);
        p.setAttribute('class', 'fg-edge');
        svg.appendChild(p);
        edges.push(p);
      }

      nodes.forEach((n, i) => {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'fg-node');
        g.setAttribute('transform', 'translate(' + pos[i].x + ',' + pos[i].y + ')');
        const rect = document.createElementNS(NS, 'rect');
        cAttr(rect, { width: NW, height: NH, rx: 11 });
        g.appendChild(rect);
        const t1 = document.createElementNS(NS, 'text');
        cAttr(t1, { x: 14, y: 24, class: 'fg-t' });
        t1.textContent = n[0];
        g.appendChild(t1);
        const t2 = document.createElementNS(NS, 'text');
        cAttr(t2, { x: 14, y: 42, class: 'fg-s' });
        t2.textContent = n[1];
        g.appendChild(t2);
        const sock = document.createElementNS(NS, 'circle');
        cAttr(sock, { cx: i % 2 ? 0 : NW, cy: NH / 2, r: 3.5, class: 'fg-sock' });
        g.appendChild(sock);
        if (i > 0) g.__edge = edges[i - 1];
        svg.appendChild(g);
      });

      // data packets — a bright drop travels each edge once it is lit
      edges.forEach((e, i) => {
        const pk = document.createElementNS(NS, 'circle');
        cAttr(pk, { r: 2.6, class: 'fg-packet' });
        const am = document.createElementNS(NS, 'animateMotion');
        cAttr(am, { dur: (1.35 + i * 0.15).toFixed(2) + 's', repeatCount: 'indefinite', path: e.getAttribute('d') });
        pk.appendChild(am);
        svg.appendChild(pk);
        e.__packet = pk;
      });

      box.appendChild(svg);
    });
  };
  buildFlows();

  /* ------------------------------------------------------------------
     2.5D tilt — flow graphs sit in perspective and lean with the cursor
     ------------------------------------------------------------------ */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const flip = !!el.closest('.case-flip');
      const rx0 = 5, ry0 = flip ? 5 : -5;
      let cx = rx0, cy = ry0, tx = rx0, ty = ry0, raf = 0;
      const step = () => {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        el.style.transform = 'perspective(1100px) rotateX(' + cx.toFixed(2) + 'deg) rotateY(' + cy.toFixed(2) + 'deg)';
        raf = (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) ? requestAnimationFrame(step) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        tx = rx0 + (0.5 - (e.clientY - r.top) / r.height) * 9;
        ty = ry0 + ((e.clientX - r.left) / r.width - 0.5) * 11;
        // specular sheen follows the cursor across the panel
        el.style.setProperty('--fx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--fy', (e.clientY - r.top).toFixed(0) + 'px');
        kick();
      }, { passive: true });
      el.addEventListener('pointerleave', () => { tx = rx0; ty = ry0; kick(); });
    });
  }

  /* ------------------------------------------------------------------
     The falling light — one luminous thread descends the page's quiet
     center and dives into each flow graph, walking the pipeline stage
     by stage. Each stage is an epoch. Content ignites when an unseen
     reading line reaches it; the thread itself only visits the graphs.
     ------------------------------------------------------------------ */
  const lumen = document.createElement('div');
  lumen.className = 'lumen';
  lumen.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'spine';
  svg.setAttribute('aria-hidden', 'true');
  document.body.prepend(svg);
  document.body.prepend(lumen);

  let basePath, litPath, headDot, headHalo;
  let anchors = [];      // flow-graph stages: {el, x, y, s, edge, packet, zone}
  let zones = [];        // content that ignites as the reading line passes
  let caseZones = [];
  let mands = [];        // mandalas that bloom behind key text
  let totalLen = 0;
  let samples = [];      // [{s, y}] for scroll → length lookup

  const collectAnchors = () => {
    const sy = window.scrollY;
    const rail = window.innerWidth <= 900;
    const out = [];
    document.querySelectorAll('.case').forEach((cs) => {
      cs.querySelectorAll('.fg-node').forEach((gn) => {
        // anchor on the node's socket so the thread rides the
        // same corridor as the graph's own edges
        const sock = gn.querySelector('.fg-sock');
        const r = (sock || gn).getBoundingClientRect();
        out.push({
          el: gn,
          x: Math.max(20, rail ? 26 : r.left + r.width / 2),
          y: r.top + sy + r.height / 2,
          edge: gn.__edge || null,
          packet: gn.__edge ? gn.__edge.__packet : null,
          zone: cs
        });
      });
    });
    out.sort((a, b) => a.y - b.y);
    return out;
  };

  const collectZones = () => {
    const sy = window.scrollY;
    const out = [];
    const add = (el, cls, y) => out.push({ el, cls, y });
    document.querySelectorAll('.section-head h2, .about-inner h2, .case h3').forEach((h) => {
      const r = h.getBoundingClientRect();
      add(h, 'spine-glow', r.top + sy + r.height / 2);
    });
    document.querySelectorAll('.entry').forEach((en) => {
      const r = en.getBoundingClientRect();
      add(en, 'lit', r.top + sy + Math.min(56, r.height / 2));
    });
    return out;
  };

  // block-level headings report container width; measure the text itself
  const textRect = (el) => {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const r = rg.getBoundingClientRect();
    return (r && r.width) ? r : el.getBoundingClientRect();
  };

  // mandala — thin terra linework centered behind key text. As the light
  // reaches its section it blooms ring by ring from the middle outward,
  // and a warm halo embraces the text (the text sits on the layer above,
  // so it stays perfectly crisp)
  const manEl = (name, attrs, cls) => {
    const n = document.createElementNS(NS, name);
    cAttr(n, attrs);
    if (cls) n.setAttribute('class', cls);
    return n;
  };

  const buildMandalas = () => {
    mands = [];
    const layer = manEl('g', {}, 'man-layer');
    const sy = window.scrollY;
    const docW = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const cap = docW * 0.38;
    const GA = 2.399963; // golden angle

    const P = (cx, cy, a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    // pointed lotus petal: two mirrored curves meeting at a sharp tip
    const petal = (cx, cy, a, r0, r1, w) => {
      const [bx, by] = P(cx, cy, a, r0);
      const [tx, ty] = P(cx, cy, a, r1);
      const nx = Math.cos(a + Math.PI / 2) * w, ny = Math.sin(a + Math.PI / 2) * w;
      const mx = (bx + tx) / 2, my = (by + ty) / 2;
      return 'M ' + bx + ' ' + by +
             ' Q ' + (mx + nx) + ' ' + (my + ny) + ' ' + tx + ' ' + ty +
             ' Q ' + (mx - nx) + ' ' + (my - ny) + ' ' + bx + ' ' + by + ' Z';
    };
    // circular arc from angle a0 to a1
    const arc = (cx, cy, r, a0, a1) => {
      const [x0, y0] = P(cx, cy, a0, r);
      const [x1, y1] = P(cx, cy, a1, r);
      return 'M ' + x0 + ' ' + y0 + ' A ' + r + ' ' + r + ' 0 ' +
             (Math.abs(a1 - a0) > Math.PI ? 1 : 0) + ' 1 ' + x1 + ' ' + y1;
    };
    const record = (g, cx, cy, R, maxO, meta) => {
      layer.appendChild(g);
      mands.push(Object.assign({
        g, els: g.__els,
        top: cy - R - 90, bottom: cy + R * 0.55, last: -1, maxO
      }, meta || {}));
    };
    const adder = (g) => {
      g.__els = [];
      return (node, o, v, r) => {
        node.__o = o; node.__v = v; node.__r = r || 0;
        node.style.opacity = 0;
        g.appendChild(node);
        g.__els.push(node);
      };
    };
    // heartbeat — a faint ring that falls into the center every few seconds
    const addIdle = (g, cx, cy, r, max, period, delay) => {
      const idle = manEl('g', {}, 'man-idle');
      idle.style.setProperty('--imax', max);
      idle.style.setProperty('--ipd', period + 's');
      idle.style.setProperty('--idel', delay + 's');
      idle.appendChild(manEl('circle', { cx, cy, r, 'vector-effect': 'non-scaling-stroke' }, 'man-iring'));
      g.appendChild(idle);
    };

    // ------------------------------------------------------------------
    // the main mandala — an engraved solar chronometer that owns the
    // whole first canvas: a dense lotus-and-dial heart, then mirrored
    // orbits, a phyllotaxis star field and whisper rings out to the
    // corners. A single ember planet on one orbit is the one deliberate
    // break in the symmetry. Centered where the falling light wakes up.
    // ------------------------------------------------------------------
    {
      const cx = docW * 0.5;
      const cy = vh * 0.45;
      const Rc = Math.max(160, Math.min(vh * 0.44, docW * 0.44));       // the dense heart
      const Rx = Math.hypot(docW * 0.5, Math.max(cy, vh - cy)) * 1.02;  // the far corners
      const g = manEl('g', {}, 'mandala man-hero');
      const add = adder(g);

      // 0 · atmosphere and core light
      add(manEl('circle', { cx, cy, r: Rx * 0.9, fill: 'url(#manAtmo)' }), 0, 1, 0);
      add(manEl('circle', { cx, cy, r: Rc * 0.6, fill: 'url(#manGrad)' }), 0, 0.95, 0);

      // 1 · the heart: the point, a hairline cross, a seed ring
      add(manEl('circle', { cx, cy, r: 2.4 }, 'man-gem'), 1, 0.9, 0);
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i;
        const [x1, y1] = P(cx, cy, a, Rc * 0.035);
        const [x2, y2] = P(cx, cy, a, Rc * 0.1);
        add(manEl('line', { x1, y1, x2, y2 }, 'man-fine'), 1, 0.5, Rc * 0.1);
      }
      add(manEl('circle', { cx, cy, r: Rc * 0.055 }, 'man-line'), 1, 0.5, Rc * 0.055);

      // 2 · burst — 28 alternating rays
      for (let i = 0; i < 28; i++) {
        const a = (Math.PI * 2 * i) / 28 + Math.PI / 28;
        const [x1, y1] = P(cx, cy, a, Rc * 0.07);
        const [x2, y2] = P(cx, cy, a, Rc * (i % 2 ? 0.115 : 0.16));
        add(manEl('line', { x1, y1, x2, y2 }, 'man-ray'), 2, i % 2 ? 0.35 : 0.55, Rc * 0.14);
      }

      // 3 · engraved dial — 72 ticks, every sixth marked
      add(manEl('circle', { cx, cy, r: Rc * 0.2 }, 'man-line'), 3, 0.45, Rc * 0.2);
      for (let i = 0; i < 72; i++) {
        const a = (Math.PI * 2 * i) / 72;
        const mark = i % 6 === 0;
        const [x1, y1] = P(cx, cy, a, Rc * 0.207);
        const [x2, y2] = P(cx, cy, a, Rc * (mark ? 0.247 : 0.225));
        add(manEl('line', { x1, y1, x2, y2 }, mark ? 'man-line' : 'man-fine'), 3, mark ? 0.5 : 0.3, Rc * 0.22);
      }

      // 4 · inner lotus — 12 slender petals, each with an echo
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.17, Rc * 0.35, Rc * 0.024) }, 'man-line'), 4, 0.45, Rc * 0.35);
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.18, Rc * 0.29, Rc * 0.013) }, 'man-fine'), 4, 0.3, Rc * 0.29);
      }

      // 5 · tracery — twelve interlaced circles, a gothic band
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12 + Math.PI / 12;
        const [ox, oy] = P(cx, cy, a, Rc * 0.37);
        add(manEl('circle', { cx: ox, cy: oy, r: Rc * 0.115 }, 'man-fine'), 5, 0.22, Rc * 0.37);
      }

      // 6 · hexagram lattice
      for (let k = 0; k < 2; k++) {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 + (k ? Math.PI / 6 : 0);
          pts.push(P(cx, cy, a, Rc * 0.53).join(','));
        }
        add(manEl('polygon', { points: pts.join(' ') }, 'man-fine'), 6, 0.2, Rc * 0.53);
      }

      // 7 · mid lotus crown
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.3, Rc * 0.64, Rc * 0.078) }, 'man-line'), 7, 0.5, Rc * 0.64);
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.32, Rc * 0.53, Rc * 0.042) }, 'man-fine'), 7, 0.32, Rc * 0.53);
      }

      // 8 · gem ring between the crowns
      add(manEl('circle', { cx, cy, r: Rc * 0.69 }, 'man-fine'), 8, 0.35, Rc * 0.69);
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10 + Math.PI / 10;
        const [dx, dy] = P(cx, cy, a, Rc * 0.69);
        add(manEl('rect', {
          x: dx - 4, y: dy - 4, width: 8, height: 8,
          transform: 'rotate(45 ' + dx + ' ' + dy + ')'
        }, 'man-gem'), 8, 0.6, Rc * 0.69);
      }

      // 9 · outer lotus crown, offset half a step
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10 + Math.PI / 10;
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.46, Rc * 0.94, Rc * 0.068) }, 'man-line'), 9, 0.45, Rc * 0.94);
        add(manEl('path', { d: petal(cx, cy, a, Rc * 0.48, Rc * 0.8, Rc * 0.036) }, 'man-fine'), 9, 0.28, Rc * 0.8);
      }

      // 10 · outer engraved band
      add(manEl('circle', { cx, cy, r: Rc * 0.99 }, 'man-line'), 10, 0.32, Rc * 0.99);
      add(manEl('circle', { cx, cy, r: Rc * 1.03 }, 'man-fine'), 10, 0.22, Rc * 1.03);
      for (let i = 0; i < 96; i++) {
        const a = (Math.PI * 2 * i) / 96;
        const mark = i % 8 === 0;
        const [x1, y1] = P(cx, cy, a, Rc);
        const [x2, y2] = P(cx, cy, a, Rc * (mark ? 1.055 : 1.025));
        add(manEl('line', { x1, y1, x2, y2 }, 'man-fine'), 10, mark ? 0.3 : 0.16, Rc * 1.02);
      }

      // 11 · the orbits — mirrored ellipses; one carries the ember planet
      const orx = Math.min(Rx * 0.72, Rc * 1.9), ory = Rc * 0.52;
      for (const tilt of [-24, 24]) {
        add(manEl('ellipse', {
          cx, cy, rx: orx, ry: ory,
          transform: 'rotate(' + tilt + ' ' + cx + ' ' + cy + ')',
          'stroke-dasharray': '1 7'
        }, 'man-fine'), 11, 0.26, (orx + ory) / 2);
      }
      {
        const t = -0.5, rot = (24 * Math.PI) / 180;
        const ex = orx * Math.cos(t), ey = ory * Math.sin(t);
        const px = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
        const py = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
        const pr = Math.hypot(px - cx, py - cy);
        add(manEl('circle', { cx: px, cy: py, r: 3.2 }, 'man-node'), 11, 0.85, pr);
        add(manEl('circle', { cx: px, cy: py, r: 8 }, 'man-fine'), 11, 0.4, pr);
      }

      // 12 · star field — golden-angle seeds drifting to the corners
      for (let i = 0; i < 64; i++) {
        const a = i * GA + 0.7;
        const rr = Rc * 0.8 + (Rx - Rc * 0.8) * Math.sqrt(i / 64);
        const [x, y] = P(cx, cy, a, rr);
        add(manEl('circle', { cx: x, cy: y, r: i % 5 ? 1 : 1.7 }, 'man-spark'), 12, 0.55 - 0.3 * (i / 64), rr);
      }

      // 13 · horizon rays and whisper rings — out to the very edge
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12 + Math.PI / 12;
        const [x1, y1] = P(cx, cy, a, Rc * 1.1);
        const [x2, y2] = P(cx, cy, a, Rx * 0.96);
        add(manEl('line', { x1, y1, x2, y2 }, 'man-fine'), 13, 0.13, Rx * 0.6);
      }
      add(manEl('circle', { cx, cy, r: Rc * 1.22, 'stroke-dasharray': '1 14' }, 'man-line'), 13, 0.18, Rc * 1.22);
      add(manEl('circle', { cx, cy, r: Rx * 0.86, 'stroke-dasharray': '1 21' }, 'man-fine'), 13, 0.13, Rx * 0.86);

      addIdle(g, cx, cy, Rc * 1.05, 0.3, 8, 2.5);
      record(g, cx, cy, Rc, 13, {
        hero: true, cx, cy, Rc, Rx,
        top: cy - vh * 0.55, bottom: cy + vh * 0.05
      });
    }

    // ------------------------------------------------------------------
    // the scroll mandalas — four engraved recipes, cycled: a phyllotaxis
    // aster, gothic tracery, an astrolabe dial, and a bilateral plume
    // that keeps only the vertical axis of symmetry
    // ------------------------------------------------------------------
    const targets = [];
    document.querySelectorAll('.section-head h2, .about-inner h2')
      .forEach((el) => targets.push({ el, R: 205 }));
    document.querySelectorAll('.case h3')
      .forEach((el) => targets.push({ el, R: 170 }));

    targets.forEach(({ el, R }, ti) => {
      R = Math.min(R, cap);
      const tr = textRect(el);
      const cx = tr.left + tr.width / 2;
      const cy = tr.top + sy + tr.height / 2;
      const g = manEl('g', {}, 'mandala');
      const add = adder(g);
      const kind = ['aster', 'tracery', 'astrolabe', 'plume'][ti % 4];

      add(manEl('circle', { cx, cy, r: R * 0.9, fill: 'url(#manSoft)' }), 0, 0.85, 0);

      if (kind === 'aster') {
        // seeds unfurl by the golden angle around a small petalled dial
        add(manEl('circle', { cx, cy, r: 1.8 }, 'man-gem'), 1, 0.7, 0);
        add(manEl('circle', { cx, cy, r: R * 0.09 }, 'man-line'), 1, 0.45, 0);
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8;
          add(manEl('path', { d: petal(cx, cy, a, R * 0.1, R * 0.24, R * 0.022) }, 'man-line'), 1, 0.38, 0);
        }
        for (let i = 0; i < 44; i++) {
          const a = i * GA;
          const rr = R * (0.18 + 0.56 * Math.sqrt(i / 44));
          const [x, y] = P(cx, cy, a, rr);
          add(manEl('circle', { cx: x, cy: y, r: 1 + 1.6 * (i / 44) }, 'man-gem'), 2, 0.65 - 0.25 * (i / 44), 0);
        }
        add(manEl('circle', { cx, cy, r: R * 0.56, 'stroke-dasharray': '1 9' }, 'man-fine'), 3, 0.32, 0);
        for (let i = 0; i < 3; i++) {
          const a0 = (Math.PI * 2 * i) / 3 + 0.4;
          add(manEl('path', { d: arc(cx, cy, R * 0.84, a0, a0 + 1.25) }, 'man-line'), 3, 0.34, 0);
        }
        add(manEl('circle', { cx, cy, r: R * 0.95, 'stroke-dasharray': '1 11' }, 'man-line'), 4, 0.3, 0);
        addIdle(g, cx, cy, R * 0.9, 0.2, 9 + (ti % 3), (ti % 4) * 1.3);
        record(g, cx, cy, R, 4);
      } else if (kind === 'tracery') {
        // interlaced circles under a petalled rim — a rose window
        add(manEl('circle', { cx, cy, r: R * 0.1 }, 'man-line'), 1, 0.42, 0);
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6;
          const [ox, oy] = P(cx, cy, a, R * 0.17);
          add(manEl('circle', { cx: ox, cy: oy, r: R * 0.17 }, 'man-fine'), 2, 0.3, 0);
        }
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 * i) / 12 + Math.PI / 12;
          const [ox, oy] = P(cx, cy, a, R * 0.42);
          add(manEl('circle', { cx: ox, cy: oy, r: R * 0.15 }, 'man-fine'), 3, 0.26, 0);
        }
        add(manEl('circle', { cx, cy, r: R * 0.6 }, 'man-line'), 4, 0.35, 0);
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 * i) / 12;
          add(manEl('path', { d: petal(cx, cy, a, R * 0.6, R * (i % 2 ? 0.8 : 0.95), R * 0.05) }, 'man-line'), 5, 0.35, 0);
        }
        addIdle(g, cx, cy, R * 0.9, 0.2, 10 + (ti % 3), (ti % 4) * 1.3);
        record(g, cx, cy, R, 5);
      } else if (kind === 'astrolabe') {
        // an engraved dial with one tilted orbit
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + Math.PI / 4;
          const [x1, y1] = P(cx, cy, a, R * 0.05);
          const [x2, y2] = P(cx, cy, a, R * 0.2);
          add(manEl('line', { x1, y1, x2, y2 }, 'man-fine'), 1, 0.4, 0);
        }
        add(manEl('circle', { cx, cy, r: R * 0.1 }, 'man-line'), 1, 0.42, 0);
        add(manEl('circle', { cx, cy, r: R * 0.3 }, 'man-fine'), 2, 0.3, 0);
        add(manEl('circle', { cx, cy, r: R * 0.34 }, 'man-line'), 2, 0.38, 0);
        for (let i = 0; i < 48; i++) {
          const a = (Math.PI * 2 * i) / 48;
          const long = i % 12 === 0;
          const [x1, y1] = P(cx, cy, a, R * 0.58);
          const [x2, y2] = P(cx, cy, a, R * (long ? 0.7 : 0.63));
          add(manEl('line', { x1, y1, x2, y2 }, long ? 'man-line' : 'man-fine'), 3, long ? 0.45 : 0.26, 0);
        }
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i;
          const [dx, dy] = P(cx, cy, a, R * 0.82);
          add(manEl('rect', {
            x: dx - 4, y: dy - 4, width: 8, height: 8,
            transform: 'rotate(45 ' + dx + ' ' + dy + ')'
          }, 'man-gem'), 4, 0.55, 0);
        }
        add(manEl('ellipse', {
          cx, cy, rx: R * 0.98, ry: R * 0.4,
          transform: 'rotate(-21 ' + cx + ' ' + cy + ')',
          'stroke-dasharray': '1 7'
        }, 'man-fine'), 5, 0.3, 0);
        add(manEl('circle', { cx, cy, r: R * 0.9, 'stroke-dasharray': '2 12' }, 'man-line'), 5, 0.26, 0);
        addIdle(g, cx, cy, R * 0.9, 0.2, 9 + (ti % 3), (ti % 4) * 1.3);
        record(g, cx, cy, R, 5);
      } else {
        // plume — a bilateral fan, symmetric only across the vertical axis
        const fy = cy + R * 0.24;
        add(manEl('circle', { cx, cy: fy, r: 1.8 }, 'man-gem'), 1, 0.7, 0);
        add(manEl('circle', { cx, cy: fy, r: R * 0.07 }, 'man-line'), 1, 0.45, 0);
        const N = 9;
        for (let i = 0; i < N; i++) {
          const p = i / (N - 1);
          const a = -Math.PI * (0.14 + 0.72 * p);
          const len = R * (0.6 + 0.5 * Math.sin(Math.PI * p));
          const [x1, y1] = P(cx, fy, a, R * 0.09);
          const [x2, y2] = P(cx, fy, a, len * 0.9);
          add(manEl('line', { x1, y1, x2, y2 }, 'man-fine'), 2, 0.2, 0);
          add(manEl('path', { d: petal(cx, fy, a, R * 0.14, len, R * 0.032) }, 'man-line'), 3, 0.4, 0);
        }
        for (let i = 0; i < N - 1; i++) {
          const p = (i + 0.5) / (N - 1);
          const a = -Math.PI * (0.14 + 0.72 * p);
          const len = R * (0.6 + 0.5 * Math.sin(Math.PI * p)) * 0.55;
          add(manEl('path', { d: petal(cx, fy, a, R * 0.12, len, R * 0.018) }, 'man-fine'), 4, 0.3, 0);
        }
        add(manEl('path', { d: arc(cx, fy, R * 0.34, -Math.PI * 0.97, -Math.PI * 0.03) }, 'man-fine'), 5, 0.3, 0);
        add(manEl('path', { d: arc(cx, fy, R * 1.02, -Math.PI * 0.86, -Math.PI * 0.14) }, 'man-line'), 5, 0.26, 0);
        addIdle(g, cx, fy, R * 0.8, 0.2, 10 + (ti % 3), (ti % 4) * 1.3);
        record(g, cx, cy, R, 5, { spin: false });
      }
    });

    svg.appendChild(layer);
  };

  const paintMandalas = (focusY) => {
    for (const m of mands) {
      const p = Math.max(0, Math.min(1, (focusY - m.top) / (m.bottom - m.top)));
      if (Math.abs(p - m.last) < 0.003) continue;
      m.last = p;
      const front = p * (m.maxO + 1.6);
      for (const el of m.els) {
        const f = Math.max(0, Math.min(1, front - el.__o));
        el.style.opacity = (f * el.__v).toFixed(3);
      }
      const on = !reducedMotion && p >= 0.7;
      m.g.classList.toggle('spin', on && m.spin !== false);
      m.g.classList.toggle('alive', on);
    }
  };

  const buildSpine = () => {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    anchors = collectAnchors();
    zones = collectZones();
    caseZones = [...new Set(anchors.map((a) => a.zone).filter(Boolean))];
    if (!anchors.length) return;

    const sy = window.scrollY;
    const rail = window.innerWidth <= 900;
    const docW = document.documentElement.clientWidth;
    const docH = document.documentElement.scrollHeight;
    cAttr(svg, { width: docW, height: docH, viewBox: '0 0 ' + docW + ' ' + docH });
    svg.style.height = docH + 'px';
    buildMandalas();

    const contact = document.querySelector('.contact');
    const endY = contact
      ? contact.getBoundingClientRect().top + sy - 50
      : docH - 80;

    // corridor: fall down the page's center, dive into each pipeline,
    // walk its stages, then drift on to the next one. It always starts
    // at the center, so the light wakes in the main mandala's heart.
    const cx = rail ? 26 : docW * 0.5;
    const vh = window.innerHeight;
    const pts = [{ x: docW * 0.5, y: 0 }];
    if (rail) {
      pts.push({ x: docW * 0.5, y: vh * 0.62 });
      pts.push({ x: 26, y: Math.max(vh * 0.95, anchors[0].y - 140) });
      anchors.forEach((a) => pts.push({ x: a.x, y: a.y }));
    } else {
      const tl = document.querySelector('.timeline');
      if (tl) {
        const r = tl.getBoundingClientRect();
        const tcx = r.left + r.width / 2;
        pts.push({ x: tcx, y: r.top + sy + 24 });
        pts.push({ x: tcx, y: r.top + sy + r.height - 24 });
      }
      caseZones.forEach((cs) => {
        const list = anchors.filter((a) => a.zone === cs);
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        const prev = pts[pts.length - 1];
        const inY = first.y - 70;
        pts.push({ x: (prev.x + first.x) / 2, y: (prev.y + inY) / 2 });
        pts.push({ x: first.x, y: inY });
        list.forEach((a) => pts.push({ x: a.x, y: a.y }));
        pts.push({ x: last.x, y: last.y + 70 });
      });
      const prev = pts[pts.length - 1];
      pts.push({ x: (prev.x + cx) / 2, y: (prev.y + endY) / 2 });
    }
    pts.push({ x: cx, y: endY });

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

    // gradients: the lamp's light, the main mandala's core, and the
    // softer halo of the scroll mandalas — all champagne gold
    const defs = document.createElementNS(NS, 'defs');
    const mkGrad = (id, stops) => {
      const gr = document.createElementNS(NS, 'radialGradient');
      gr.setAttribute('id', id);
      stops.forEach(([o, c]) => {
        const st = document.createElementNS(NS, 'stop');
        st.setAttribute('offset', o);
        st.setAttribute('stop-color', c);
        gr.appendChild(st);
      });
      defs.appendChild(gr);
    };
    mkGrad('headGrad', [
      ['0%', 'rgba(250,240,210,0.55)'], ['38%', 'rgba(232,198,138,0.22)'], ['100%', 'rgba(232,198,138,0)']
    ]);
    mkGrad('manGrad', [
      ['0%', 'rgba(255,247,222,0.5)'], ['35%', 'rgba(236,202,140,0.16)'], ['100%', 'rgba(236,202,140,0)']
    ]);
    mkGrad('manAtmo', [
      ['0%', 'rgba(233,196,138,0.12)'], ['45%', 'rgba(216,120,74,0.05)'], ['100%', 'rgba(216,120,74,0)']
    ]);
    mkGrad('manSoft', [
      ['0%', 'rgba(232,198,138,0.16)'], ['60%', 'rgba(232,198,138,0.06)'], ['100%', 'rgba(232,198,138,0)']
    ]);
    svg.appendChild(defs);

    headHalo = document.createElementNS(NS, 'circle');
    cAttr(headHalo, { r: 78, fill: 'url(#headGrad)' });
    svg.appendChild(headHalo);
    headDot = document.createElementNS(NS, 'circle');
    cAttr(headDot, { r: 5.5, class: 'spine-head' });
    svg.appendChild(headDot);
  };

  // the training console — metrics of the run
  const trainer = document.querySelector('.trainer');
  const trEpoch = trainer && trainer.querySelector('.tr-epoch');
  const trLoss = trainer && trainer.querySelector('.tr-loss');
  const trAcc = trainer && trainer.querySelector('.tr-acc');
  const trFill = trainer && trainer.querySelector('.tr-fill');
  const trPct = trainer && trainer.querySelector('.tr-pct');
  let trKey = '';

  const lightAt = (s) => {
    litPath.style.strokeDasharray = s + ' ' + (totalLen + 10);
    const p = basePath.getPointAtLength(s);
    cAttr(headDot, { cx: p.x, cy: p.y });
    cAttr(headHalo, { cx: p.x, cy: p.y });

    // the lamp reveals a faint circuit lattice around itself
    lumen.style.setProperty('--lx', p.x.toFixed(1) + 'px');
    lumen.style.setProperty('--ly', (p.y - window.scrollY).toFixed(1) + 'px');

    let passed = 0;
    const zonesOn = new Set();
    for (const a of anchors) {
      const on = a.s <= s + 2;
      if (on) { passed++; if (a.zone) zonesOn.add(a.zone); }
      a.el.classList.toggle('on', on);
      if (a.edge) a.edge.classList.toggle('on', on);
      if (a.packet) a.packet.classList.toggle('on', on);
    }
    for (const cz of caseZones) cz.classList.toggle('zone-on', zonesOn.has(cz));

    // content ignites and the mosaic advances as the reading line moves
    if (!reducedMotion) {
      const focusY = window.scrollY + window.innerHeight * 0.45;
      for (const z of zones) z.el.classList.toggle(z.cls, z.y <= focusY + 2);
      paintMandalas(focusY);
    }

    // the console tracks the run: epoch, loss, accuracy, progress
    if (trainer) {
      const t = totalLen ? Math.min(1, s / totalLen) : 0;
      const done = t >= 0.99;
      const key = passed + '|' + Math.round(t * 400);
      if (key !== trKey) {
        trKey = key;
        const loss = done ? 0.009 : 2.303 * Math.pow(1 - t, 2.2) + 0.009 * t;
        const acc = done ? 1 : 0.1 + 0.9 * (1 - Math.pow(1 - t, 1.8));
        trEpoch.textContent = String(passed).padStart(2, '0') + '/' + anchors.length;
        trLoss.textContent = loss.toFixed(3);
        trAcc.textContent = acc.toFixed(3);
        trFill.style.width = (t * 100).toFixed(1) + '%';
        trPct.textContent = done ? 'converged ✓' : Math.round(t * 100) + '%';
        trainer.classList.toggle('done', done);
      }
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

  // the light tracks the scroll directly — the reader sets the pace
  let spineTick = false;
  const onSpineScroll = () => {
    if (spineTick) return;
    spineTick = true;
    requestAnimationFrame(() => {
      spineTick = false;
      if (totalLen) lightAt(sForScroll());
    });
  };

  // the console starts big in the hero's open right side, then shrinks
  // and docks into the top-right corner once the run sets off
  const dockCheck = () => {
    if (!trainer) return;
    trainer.classList.toggle('docked',
      window.innerWidth <= 900 || window.scrollY > 330);
  };

  const settleReduced = () => {
    if (!totalLen) return;
    lightAt(totalLen);
    zones.forEach((z) => z.el.classList.add(z.cls));
    paintMandalas(1e9);
    if (trainer) trainer.classList.add('docked');
    if (headDot) { headDot.style.display = 'none'; headHalo.style.display = 'none'; }
    lumen.style.display = 'none';
  };

  /* ------------------------------------------------------------------
     Intro — the mandala materializes from its heart outward, then one
     pulse of light sweeps the whole structure inward, igniting each
     ring as it passes and dragging its energy into the center point.
     The point flashes, releases a shockwave, and the page rises out
     of that light while the mandala settles into a quiet afterglow.
     ------------------------------------------------------------------ */
  let introActive = false;
  const runIntro = () => {
    // '#intro' in the URL forces a replay — handy for previewing the opening
    const force = location.hash.indexOf('intro') !== -1;
    // opened in a background tab: hold the intro until the reader arrives
    if (document.hidden && !force) {
      document.addEventListener('visibilitychange', () => runIntro(), { once: true });
      return;
    }
    if (!force && (reducedMotion || window.scrollY > 40)) return;
    if (!mands.length || !headDot) return;
    const m = mands[0];
    if (!m.hero) return;
    const els = m.els;
    const span = m.maxO + 1.6;
    // the ambient level each element settles back to after the flash
    const focusY = window.scrollY + window.innerHeight * 0.45;
    const restP = Math.max(0, Math.min(1, (focusY - m.top) / (m.bottom - m.top)));
    const rest = els.map((el) => Math.max(0, Math.min(1, restP * span - el.__o)) * el.__v);
    const bloom = els.map((el) => Math.min(0.95, el.__v * 2));

    // the traveling pulse: a ring of light with its halo, and the
    // shockwave the point releases at the end
    const wave = manEl('circle', { cx: m.cx, cy: m.cy, r: m.Rx }, 'man-wave');
    const waveHalo = manEl('circle', { cx: m.cx, cy: m.cy, r: m.Rx }, 'man-wave-halo');
    const shock = manEl('circle', { cx: m.cx, cy: m.cy, r: 0 }, 'man-shock');
    wave.style.opacity = 0; waveHalo.style.opacity = 0; shock.style.opacity = 0;
    svg.appendChild(waveHalo); svg.appendChild(wave); svg.appendChild(shock);

    introActive = true;
    root.classList.add('introing');
    m.g.classList.add('spin');
    const t0 = performance.now();
    const D = 3200;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const B = 0.26, C = 0.74;        // phase edges: bloom | converge | flash
    const sigma = m.Rx * 0.075;      // width of the traveling flare
    let flashFrom = null;            // opacities frozen at the moment of release

    const finish = () => {
      if (!introActive) return;
      introActive = false;
      root.classList.remove('introing');
      headDot.classList.remove('charging');
      cAttr(headDot, { r: 5.5 });
      cAttr(headHalo, { r: 78 });
      wave.remove(); waveHalo.remove(); shock.remove();
      mands.forEach((mm) => { mm.last = -1; });
      if (totalLen) lightAt(sForScroll());
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchstart', finish);
      window.removeEventListener('keydown', finish);
      window.removeEventListener('scroll', skipScroll);
    };
    // any real input skips straight to the living page. Browsers fire a
    // phantom scroll event during load restoration, so scroll only counts
    // once the page has actually moved
    const skipScroll = () => { if (window.scrollY > 2) finish(); };
    window.addEventListener('wheel', finish, { passive: true });
    window.addEventListener('touchstart', finish, { passive: true });
    window.addEventListener('keydown', finish);
    window.addEventListener('scroll', skipScroll, { passive: true });
    // safety net: never leave the page hidden (throttled/background tabs)
    setTimeout(finish, D + 700);

    const frame = (now) => {
      if (!introActive) return;
      const t = (now - t0) / D;
      if (t >= 1) { finish(); return; }
      if (t < B) {
        // bloom — the linework materializes from the heart outward
        const front = ease(t / B) * span;
        for (let i = 0; i < els.length; i++) {
          const f = Math.max(0, Math.min(1, front - els[i].__o));
          els[i].style.opacity = (f * bloom[i]).toFixed(3);
        }
      } else if (t < C) {
        // converge — one pulse sweeps the whole structure toward the
        // point, igniting each ring as it passes and draining it after
        const q = (t - B) / (C - B);
        const qe = q * q * (0.4 + 0.6 * q);        // accelerates as it falls
        const wr = m.Rx * (1 - qe);
        headDot.classList.add('charging');
        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          const dr = (el.__r - wr) / sigma;
          const flare = Math.exp(-dr * dr);
          const base = el.__r > wr ? bloom[i] * 0.3 : bloom[i];
          el.style.opacity = Math.min(1, base + flare * 0.85).toFixed(3);
        }
        cAttr(wave, { r: Math.max(1, wr), 'stroke-width': (1.4 + q * 2.6).toFixed(2) });
        wave.style.opacity = (0.35 + q * 0.65).toFixed(3);
        cAttr(waveHalo, { r: Math.max(1, wr), 'stroke-width': (14 + q * 26).toFixed(1) });
        waveHalo.style.opacity = (0.05 + q * 0.13).toFixed(3);
        cAttr(headDot, { r: (5.5 + q * 5).toFixed(2) });
        cAttr(headHalo, { r: Math.round(78 + q * 52) });
      } else {
        // release — the point flashes, a shockwave rolls outward, and
        // the page rises while the mandala settles into its afterglow
        const c = (t - C) / (1 - C);
        if (!flashFrom) {
          flashFrom = els.map((el) => parseFloat(el.style.opacity) || 0);
          wave.style.opacity = 0;
          waveHalo.style.opacity = 0;
          root.classList.remove('introing');
        }
        const e = ease(c);
        for (let i = 0; i < els.length; i++) {
          els[i].style.opacity = (flashFrom[i] + (rest[i] - flashFrom[i]) * e).toFixed(3);
        }
        cAttr(shock, { r: Math.max(1, e * m.Rc * 1.05), 'stroke-width': (3 - e * 2.4).toFixed(2) });
        shock.style.opacity = ((1 - c) * 0.6).toFixed(3);
        cAttr(headHalo, { r: Math.round(130 + Math.sin(c * Math.PI) * 90) });
        cAttr(headDot, { r: (10.5 - e * 5).toFixed(2) });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  let rbTimer = 0;
  const rebuild = () => {
    clearTimeout(rbTimer);
    rbTimer = setTimeout(() => {
      if (introActive) { rebuild(); return; }
      buildSpine();
      if (reducedMotion) {
        settleReduced();
      } else if (totalLen) {
        lightAt(sForScroll());
      }
    }, 180);
  };

  // OS toggles reduce-motion mid-session: settle to the calm final state
  // (the CSS side already responds live; a reload restores full motion)
  if (reducedMotionMQ.addEventListener) {
    reducedMotionMQ.addEventListener('change', (e) => { if (e.matches) settleReduced(); });
  }

  buildSpine();
  dockCheck();
  if (reducedMotion) {
    settleReduced();
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', rebuild);
  } else {
    if (totalLen) lightAt(sForScroll());
    runIntro();
    window.addEventListener('scroll', onSpineScroll, { passive: true });
    window.addEventListener('scroll', dockCheck, { passive: true });
    window.addEventListener('resize', dockCheck);
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', rebuild);
  }

  /* ------------------------------------------------------------------
     Tactile titles — letters rise and warm under the cursor
     ------------------------------------------------------------------ */
  if (finePointer && !reducedMotion) {
    const titles = document.querySelectorAll(
      '.hero-name .line, .section-head h2, .case h3, .entry h3, .about-inner h2, .contact-inner h2'
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
    let ax = -600, ay = -600, tx = ax, ty = ay, active = false, raf = 0;

    // settles like the tilt loop — rAF goes idle once the aura catches up
    const follow = () => {
      ax += (tx - ax) * 0.12;
      ay += (ty - ay) * 0.12;
      aura.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)';
      raf = (Math.abs(tx - ax) > 0.25 || Math.abs(ty - ay) > 0.25) ? requestAnimationFrame(follow) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(follow); };

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        document.body.classList.add('aura-on');
        ax = tx; ay = ty;
      }
      kick();
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
     AI Projects strip — grab-and-drag horizontal scroll (mouse),
     native swipe on touch, vertical wheel rides sideways. A real drag
     swallows the click so cards only navigate on a clean tap.
     ------------------------------------------------------------------ */
  const strip = document.querySelector('.strip');
  if (strip) {
    let down = false, startX = 0, startL = 0, moved = 0;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;        // touch scrolls natively
      down = true; moved = 0;
      startX = e.clientX; startL = strip.scrollLeft;
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) strip.classList.add('dragging');
      strip.scrollLeft = startL - dx;
    });
    const release = () => { down = false; strip.classList.remove('dragging'); };
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);
    strip.addEventListener('click', (e) => {
      if (moved > 5) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    strip.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        strip.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });
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
