// Hero: an interactive network you can poke at.
//  • Six hub nodes are the site's sections — hover to probe them, click to jump there.
//  • Any node can be dragged; the rest of the graph reacts.
//  • Click empty space (or wait) and a ping wave travels through the network.
// Decorative + navigation only; it never reads or sends data.
const SERVICES = [':22 ssh', ':80 http', ':443 https', ':53 dns', ':445 smb', ':3306 mysql', ':3389 rdp', ':25 smtp', ':21 ftp', ':8080 http-alt'];

export interface Hub { label: string; desc: string; href: string }
interface Node {
  x: number; y: number; vx: number; vy: number; bvx: number; bvy: number;
  r: number; svc: string; glow: number; hub?: Hub; hx: number; hy: number; hover: number;
}
interface Wave { x: number; y: number; t: number }

export function startNetwork(canvas: HTMLCanvasElement, hubs: Hub[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const css = getComputedStyle(document.documentElement);
  const ACCENT = css.getPropertyValue('--accent').trim() || '#3be8bd';
  const CYAN = '98,200,255';

  let w = 0, h = 0, dpr = 1;
  let nodes: Node[] = [];
  let waves: Wave[] = [];
  let pointer: { x: number; y: number } | null = null;
  let hoverHub: Node | null = null;
  let drag: { n: Node; sx: number; sy: number; moved: boolean } | null = null;
  let running = false, raf = 0, last = 0, clock = 0, nextIdle = 1800;

  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // hub home positions (fractions of the canvas); phones get a bottom-weighted layout
  const layout = (narrow: boolean) => narrow
    ? [[0.2, 0.12], [0.76, 0.1], [0.5, 0.3], [0.2, 0.5], [0.78, 0.55], [0.5, 0.84]]
    : [[0.58, 0.26], [0.8, 0.2], [0.9, 0.44], [0.72, 0.6], [0.56, 0.78], [0.86, 0.82]];

  function build() {
    seed = 11;
    const narrow = w < 760;
    const pos = layout(narrow);
    const count = Math.max(24, Math.min(64, Math.round((w * h) / 17000)));
    const amb: Node[] = Array.from({ length: count }, () => {
      const bvx = (rnd() - 0.5) * 0.14, bvy = (rnd() - 0.5) * 0.14;
      const x = rnd() * w, y = rnd() * h;
      return { x, y, vx: bvx, vy: bvy, bvx, bvy, r: 1.5 + rnd() * 2, svc: SERVICES[Math.floor(rnd() * SERVICES.length)], glow: 0, hx: x, hy: y, hover: 0 };
    });
    const hn: Node[] = hubs.map((hub, i) => {
      const x = pos[i][0] * w, y = pos[i][1] * h;
      return { x, y, vx: 0, vy: 0, bvx: 0, bvy: 0, r: 6, svc: '', glow: 0.4, hub, hx: x, hy: y, hover: 0 };
    });
    nodes = [...hn, ...amb];
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduce) draw();
  }

  const ping = (x: number, y: number) => { waves.push({ x, y, t: 0 }); if (waves.length > 6) waves.shift(); if (reduce) draw(); };

  function step(dt: number) {
    const k = dt / 16;
    clock += dt;
    const probeR = 140;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (drag && drag.n === n) { n.vx = n.vy = 0; continue; }
      if (n.hub) {
        // spring home + slow float
        n.vx += ((n.hx + Math.sin(clock / 1700 + i) * 6 - n.x) * 0.012) * k;
        n.vy += ((n.hy + Math.cos(clock / 2100 + i * 2) * 6 - n.y) * 0.012) * k;
        n.vx *= 0.9; n.vy *= 0.9;
      } else {
        n.vx += (n.bvx - n.vx) * 0.02 * k; n.vy += (n.bvy - n.vy) * 0.02 * k;
        if (pointer && !coarse) {
          const dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < probeR && d > 0.1) { const f = (1 - d / probeR) * 0.35 * k; n.vx += (dx / d) * f; n.vy += (dy / d) * f; }
        }
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      n.x += n.vx * k; n.y += n.vy * k;
    }
    // soft repulsion so dragged nodes shove neighbours aside
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      const min = a.hub || b.hub ? 70 : 38;
      if (d < min && d > 0.1) {
        const f = ((min - d) / min) * 0.25 * k, fx = (dx / d) * f, fy = (dy / d) * f;
        if (!(drag && drag.n === a) && !a.hub) { a.vx -= fx; a.vy -= fy; }
        if (!(drag && drag.n === b) && !b.hub) { b.vx += fx; b.vy += fy; }
      }
    }
    // waves
    const maxR = Math.max(w, h);
    for (const wv of waves) wv.t += dt;
    waves = waves.filter((wv) => wv.t * 0.5 < maxR);
    nextIdle -= dt;
    if (nextIdle <= 0 && !drag) {
      const hn = nodes.filter((n) => n.hub); const pick = hn[Math.floor(Math.random() * hn.length)];
      ping(pick.x, pick.y); nextIdle = 3800 + Math.random() * 2500;
    }
  }

  function draw() {
    const c = ctx!;
    c.clearRect(0, 0, w, h);
    const probeR = 140;
    const LINK = Math.min(165, Math.max(105, w / 9));

    // update glow from waves / pointer / hover
    for (const n of nodes) {
      let target = n.hub ? 0.35 : 0;
      if (pointer && !coarse) { const d = Math.hypot(n.x - pointer.x, n.y - pointer.y); if (d < probeR) target = Math.max(target, 1 - d / probeR); }
      for (const wv of waves) { const d = Math.abs(Math.hypot(n.x - wv.x, n.y - wv.y) - wv.t * 0.5); if (d < 34) target = Math.max(target, 1 - d / 34); }
      if (reduce && !n.hub && Math.abs(n.x * 7 + n.y) % 9 < 1) target = Math.max(target, 0.8);
      n.glow += (target - n.glow) * 0.18;
      n.hover += ((n === hoverHub ? 1 : 0) - n.hover) * 0.2;
    }

    // edges
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const lim = a.hub && b.hub ? LINK * 3.4 : a.hub || b.hub ? LINK * 1.5 : LINK;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > lim) continue;
      const near = Math.max(a.glow * (a.hub ? 0.5 : 1), b.glow * (b.hub ? 0.5 : 1));
      const al = (1 - d / lim) * (0.13 + near * 0.6);
      const lit = near > 0.25;
      c.strokeStyle = lit ? `rgba(59,232,189,${al})` : `rgba(${CYAN},${al})`;
      c.lineWidth = lit ? 1.1 : 0.7;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }

    // wave rings
    for (const wv of waves) {
      const r = wv.t * 0.5, a = Math.max(0, 0.28 * (1 - r / (Math.max(w, h) * 0.9)));
      c.strokeStyle = `rgba(59,232,189,${a})`; c.lineWidth = 1;
      c.beginPath(); c.arc(wv.x, wv.y, r, 0, Math.PI * 2); c.stroke();
    }

    // nodes
    c.textBaseline = 'middle';
    for (const n of nodes) {
      if (n.hub) continue;
      if (n.glow > 0.05) { c.fillStyle = `rgba(59,232,189,${0.1 * n.glow})`; c.beginPath(); c.arc(n.x, n.y, n.r + 9 * n.glow, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = n.glow > 0.25 ? ACCENT : `rgba(${CYAN},0.65)`;
      c.beginPath(); c.arc(n.x, n.y, n.r + n.glow * 1.4, 0, Math.PI * 2); c.fill();
      if (n.glow > 0.4) {
        c.font = '11px "JetBrains Mono Variable", ui-monospace, monospace';
        c.fillStyle = `rgba(232,239,242,${Math.min(1, n.glow * 1.2)})`;
        c.fillText(n.svc, n.x + n.r + 9, n.y - 9);
      }
    }
    // hubs on top
    hubs.forEach((hub, i) => {
      const n = nodes[i];
      const ph = n.hover;
      c.strokeStyle = `rgba(59,232,189,${0.35 + ph * 0.5})`; c.lineWidth = 1; c.setLineDash([3, 4]);
      c.beginPath(); c.arc(n.x, n.y, 15 + ph * 7, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.fillStyle = `rgba(59,232,189,${0.1 + ph * 0.12})`; c.beginPath(); c.arc(n.x, n.y, 15 + ph * 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = ACCENT; c.beginPath(); c.arc(n.x, n.y, 5 + ph * 2, 0, Math.PI * 2); c.fill();
      const left = n.x > w - 200;
      c.textAlign = left ? 'right' : 'left';
      const tx = n.x + (left ? -24 : 24);
      c.font = '600 13px "JetBrains Mono Variable", ui-monospace, monospace';
      c.fillStyle = ph > 0.1 ? '#e8eff2' : 'rgba(232,239,242,0.82)';
      c.fillText(`${String(i + 1).padStart(2, '0')}  ${hub.label.toUpperCase()}`, tx, n.y - (ph > 0.1 ? 7 : 0));
      if (ph > 0.05) {
        c.font = '11.5px "JetBrains Mono Variable", ui-monospace, monospace';
        c.fillStyle = `rgba(143,160,169,${Math.min(1, ph * 1.4)})`;
        c.fillText(hub.desc, tx, n.y + 11);
      }
      c.textAlign = 'left';
    });

    // probe ring
    if (pointer && !coarse && !drag) {
      c.strokeStyle = 'rgba(59,232,189,0.28)'; c.lineWidth = 1; c.setLineDash([3, 5]);
      c.beginPath(); c.arc(pointer.x, pointer.y, probeR, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.fillStyle = ACCENT; c.beginPath(); c.arc(pointer.x, pointer.y, 2.2, 0, Math.PI * 2); c.fill();
    }
  }

  function loop(t: number) {
    if (!running) return;
    const dt = Math.min(40, t - (last || t)); last = t;
    step(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  // ───── input ─────
  const host = canvas.closest('section') as HTMLElement;
  const local = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const hit = (p: { x: number; y: number }) => {
    let best: Node | null = null, bd = 1e9;
    for (const n of nodes) {
      const lim = n.hub ? 30 : 15, d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < lim && d < bd) { best = n; bd = d; }
    }
    return best;
  };
  const isUi = (e: Event) => !!(e.target as HTMLElement).closest('a,button');
  const go = (href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', href);
  };

  host.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const p = local(e);
    pointer = p;
    if (drag) {
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 5) drag.moved = true;
      if (drag.moved) { drag.n.x = p.x; drag.n.y = p.y; if (!drag.n.hub) { drag.n.bvx = drag.n.bvy = 0; } }
    } else {
      const n = hit(p);
      const hh = n && n.hub ? n : null;
      if (hh !== hoverHub) { hoverHub = hh; if (hh) ping(hh.x, hh.y); }
      host.style.cursor = n ? (n.hub ? 'pointer' : 'grab') : '';
    }
    if (reduce) draw();
  });
  host.addEventListener('pointerleave', () => { pointer = null; hoverHub = null; if (!drag) host.style.cursor = ''; if (reduce) draw(); });
  host.addEventListener('pointerdown', (e) => {
    if (isUi(e) || e.button > 0) return;
    const p = local(e);
    const n = hit(p);
    if (n) { drag = { n, sx: p.x, sy: p.y, moved: false }; host.style.cursor = n.hub ? 'pointer' : 'grabbing'; if (e.pointerType !== 'touch') e.preventDefault(); host.setPointerCapture(e.pointerId); }
    else if (e.pointerType !== 'touch' || p.y > 0) ping(p.x, p.y);
  });
  const release = (e: PointerEvent) => {
    if (!drag) return;
    const d = drag; drag = null;
    host.style.cursor = '';
    if (!d.moved) {
      if (d.n.hub) { ping(d.n.x, d.n.y); go(d.n.hub.href); } else ping(d.n.x, d.n.y);
    } else if (!d.n.hub) {
      d.n.bvx = (Math.random() - 0.5) * 0.14; d.n.bvy = (Math.random() - 0.5) * 0.14;
    }
    try { host.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((es) => (es[0].isIntersecting && !document.hidden ? start() : stop())).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
  ping(w * 0.7, h * 0.4);
  if (!reduce) start();
}
