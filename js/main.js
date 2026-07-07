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
        kick();
      }, { passive: true });
      el.addEventListener('pointerleave', () => { tx = rx0; ty = ry0; kick(); });
    });
  }

  /* ------------------------------------------------------------------
     The falling light — one luminous thread runs the whole page,
     passing through every node: the name, each job, each project,
     and every stage of every flow graph. Scrolling makes the light
     fall along it, igniting nodes as it passes.
     ------------------------------------------------------------------ */
  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'spine';
  svg.setAttribute('aria-hidden', 'true');
  document.body.prepend(svg);

  let basePath, litPath, headDot, headHalo;
  let anchors = [];      // {el, x, y, s, node, kind}
  let totalLen = 0;
  let samples = [];      // [{s, y}] for scroll → length lookup

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
        sec.querySelectorAll('.case').forEach((cs) => {
          const h3 = cs.querySelector('h3');
          if (h3) {
            const r = h3.getBoundingClientRect();
            push(h3, rail ? 26 : r.left + r.width / 2, r.top + sy + r.height / 2, 'title');
          }
          cs.querySelectorAll('.fg-node').forEach((gn) => {
            // anchor on the node's socket so the thread rides the
            // same corridor as the graph's own edges
            const sock = gn.querySelector('.fg-sock');
            const r = (sock || gn).getBoundingClientRect();
            const a = {
              el: gn,
              x: Math.max(20, rail ? 26 : r.left + r.width / 2),
              y: r.top + sy + r.height / 2,
              kind: 'gnode'
            };
            a.edge = gn.__edge || null;
            a.zone = cs;
            out.push(a);
          });
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

    // nodes — flow-graph stages draw their own visuals, so no circle there
    for (const a of anchors) {
      if (a.kind === 'gnode') { a.node = null; continue; }
      const n = document.createElementNS(NS, 'circle');
      cAttr(n, { cx: a.x, cy: a.y, r: a.kind === 'entry' ? 6 : 5, class: 'spine-node' });
      svg.appendChild(n);
      a.node = n;
    }

    // the lamp: a soft radial light the head carries as it falls
    const defs = document.createElementNS(NS, 'defs');
    const grad = document.createElementNS(NS, 'radialGradient');
    grad.setAttribute('id', 'headGrad');
    [['0%', 'rgba(238,170,122,0.5)'], ['38%', 'rgba(217,111,71,0.22)'], ['100%', 'rgba(217,111,71,0)']]
      .forEach(([o, c]) => {
        const st = document.createElementNS(NS, 'stop');
        st.setAttribute('offset', o);
        st.setAttribute('stop-color', c);
        grad.appendChild(st);
      });
    defs.appendChild(grad);
    svg.appendChild(defs);

    headHalo = document.createElementNS(NS, 'circle');
    cAttr(headHalo, { r: 78, fill: 'url(#headGrad)' });
    svg.appendChild(headHalo);
    headDot = document.createElementNS(NS, 'circle');
    cAttr(headDot, { r: 5.5, class: 'spine-head' });
    svg.appendChild(headDot);
  };

  const trainer = document.querySelector('.trainer');
  const trTop = trainer && trainer.querySelector('.tr-top');
  let trLast = '';

  const lightAt = (s) => {
    litPath.style.strokeDasharray = s + ' ' + (totalLen + 10);
    const p = basePath.getPointAtLength(s);
    cAttr(headDot, { cx: p.x, cy: p.y });
    cAttr(headHalo, { cx: p.x, cy: p.y });
    let passed = 0;
    for (const a of anchors) {
      const on = a.s <= s + 2;
      if (on) passed++;
      if (a.node) a.node.classList.toggle('on', on);
      if (a.kind === 'gnode') {
        a.el.classList.toggle('on', on);
        if (a.edge) a.edge.classList.toggle('on', on);
        if (a.zone) a.zone.classList.toggle('zone-on', on);
      } else if (a.kind === 'entry') {
        a.el.classList.toggle('lit', on);
      } else {
        a.el.classList.toggle('spine-glow', on);
        const zone = a.el.closest('.case');
        if (zone) zone.classList.toggle('zone-on', on);
      }
    }

    // the epoch tag rides quietly behind the content, next to the lamp
    if (trainer) {
      if (!reducedMotion) {
        trainer.classList.add('float');
        const tw = trainer.offsetWidth || 110;
        const vw = window.innerWidth, vh = window.innerHeight;
        let vx = p.x + 20;
        if (vx + tw > vw - 8) vx = p.x - tw - 20;
        vx = Math.max(8, vx);
        let vy = p.y - window.scrollY - 34;
        vy = Math.max(66, Math.min(vh - 44, vy));
        trainer.style.transform = 'translate3d(' + Math.round(vx) + 'px,' + Math.round(vy) + 'px,0)';
      }
      const done = s / totalLen >= 0.99;
      const line = done
        ? 'converged <b>✓</b>'
        : 'epoch <b>' + String(passed).padStart(2, '0') + '/' + anchors.length + '</b>';
      if (line !== trLast) { trTop.innerHTML = line; trLast = line; }
      trainer.classList.toggle('done', done);
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
