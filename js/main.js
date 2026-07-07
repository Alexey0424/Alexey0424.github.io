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

  let basePath, litPath, headDot, headHalo, epochText, epochLabel, epochNum;
  let anchors = [];      // flow-graph stages: {el, x, y, s, edge, packet, zone}
  let zones = [];        // content that ignites as the reading line passes
  let caseZones = [];
  let totalLen = 0;
  let spineW = 0;
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
    document.querySelectorAll('.ml-row').forEach((row) => {
      const r = row.getBoundingClientRect();
      add(row, 'spine-glow', r.top + sy + r.height / 2);
    });
    return out;
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
    spineW = docW;
    cAttr(svg, { width: docW, height: docH, viewBox: '0 0 ' + docW + ' ' + docH });
    svg.style.height = docH + 'px';

    const contact = document.querySelector('.contact');
    const endY = contact
      ? contact.getBoundingClientRect().top + sy - 50
      : docH - 80;

    // corridor: fall down the page's center, dive into each pipeline,
    // walk its stages, then drift on to the next one
    const cx = rail ? 26 : docW * 0.5;
    const pts = [{ x: cx, y: 0 }];
    if (rail) {
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

    // the epoch tag lives inside the spine svg, so it can never
    // paint over the page — it rides beside the lamp, beneath it all
    epochText = document.createElementNS(NS, 'text');
    epochText.setAttribute('class', 'spine-epoch');
    epochLabel = document.createElementNS(NS, 'tspan');
    epochLabel.textContent = 'epoch ';
    epochNum = document.createElementNS(NS, 'tspan');
    epochNum.setAttribute('class', 'ep-n');
    epochNum.textContent = '00/' + anchors.length;
    epochText.appendChild(epochLabel);
    epochText.appendChild(epochNum);
    svg.appendChild(epochText);
  };

  let epLast = '';

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

    // content ignites as the reading line reaches it
    if (!reducedMotion) {
      const focusY = window.scrollY + window.innerHeight * 0.45;
      for (const z of zones) z.el.classList.toggle(z.cls, z.y <= focusY + 2);
    }

    if (epochText) {
      const done = s / totalLen >= 0.99;
      const line = done
        ? 'converged |✓'
        : 'epoch |' + String(passed).padStart(2, '0') + '/' + anchors.length;
      if (line !== epLast) {
        const parts = line.split('|');
        epochLabel.textContent = parts[0];
        epochNum.textContent = parts[1];
        epLast = line;
      }
      let ex = p.x + 16;
      if (ex + 112 > spineW) ex = p.x - 118;
      cAttr(epochText, { x: Math.round(Math.max(8, ex)), y: Math.round(Math.max(16, p.y - 13)) });
      epochText.classList.toggle('done', done);
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

  // the head glides toward the scroll target instead of jumping to it,
  // with a speed limit so the graph zigzags read as travel, not teleport
  let curS = 0, tgtS = 0, glideRaf = 0;
  const glide = () => {
    const diff = tgtS - curS;
    const step = Math.sign(diff) * Math.min(Math.abs(diff) * 0.085, 42);
    curS += step;
    if (Math.abs(tgtS - curS) < 0.4) curS = tgtS;
    lightAt(curS);
    glideRaf = curS === tgtS ? 0 : requestAnimationFrame(glide);
  };
  const onSpineScroll = () => {
    if (!totalLen) return;
    tgtS = sForScroll();
    if (!glideRaf) glideRaf = requestAnimationFrame(glide);
  };

  const settleReduced = () => {
    if (!totalLen) return;
    lightAt(totalLen);
    zones.forEach((z) => z.el.classList.add(z.cls));
    if (headDot) { headDot.style.display = 'none'; headHalo.style.display = 'none'; }
    if (epochText) epochText.style.display = 'none';
    lumen.style.display = 'none';
  };

  let rbTimer = 0;
  const rebuild = () => {
    clearTimeout(rbTimer);
    rbTimer = setTimeout(() => {
      buildSpine();
      if (reducedMotion) {
        settleReduced();
      } else if (totalLen) {
        curS = tgtS = sForScroll();
        lightAt(curS);
      }
    }, 180);
  };

  buildSpine();
  if (reducedMotion) {
    settleReduced();
    window.addEventListener('resize', rebuild);
    window.addEventListener('load', rebuild);
  } else {
    if (totalLen) {
      curS = tgtS = sForScroll();
      lightAt(curS);
    }
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
