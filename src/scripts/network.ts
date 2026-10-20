// Hero visual: an abstract network of hosts. A "probe" (cursor, or an idle radar sweep) lights nearby
// hosts and reveals the service they expose. Purely decorative; nothing here reads or sends data.
const SERVICES = [':22 ssh', ':80 http', ':443 https', ':53 dns', ':445 smb', ':3306 mysql', ':3389 rdp', ':25 smtp', ':21 ftp', ':8080 http-alt'];

interface Node { x: number; y: number; vx: number; vy: number; r: number; svc: string; ping: number; glow: number }

export function startNetwork(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const C = {
    accent: css.getPropertyValue('--accent').trim() || '#3be8bd',
    cyan: css.getPropertyValue('--cyan').trim() || '#62c8ff',
    line: '98,200,255',
  };

  let w = 0, h = 0, dpr = 1;
  let nodes: Node[] = [];
  let pointer: { x: number; y: number } | null = null;
  let angle = -0.6;
  let running = false;
  let raf = 0;

  // deterministic pseudo-random so layout is stable between loads
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 7;
    const count = Math.max(26, Math.min(74, Math.round((w * h) / 15000)));
    nodes = Array.from({ length: count }, () => ({
      x: rnd() * w, y: rnd() * h,
      vx: (rnd() - 0.5) * 0.16, vy: (rnd() - 0.5) * 0.16,
      r: 1.6 + rnd() * 2.2,
      svc: SERVICES[Math.floor(rnd() * SERVICES.length)],
      ping: 0, glow: 0,
    }));
    if (reduce) draw(0);
  }

  const center = () => ({ x: w * 0.72, y: h * 0.5 });

  function draw(dt: number) {
    const c = ctx!;
    c.clearRect(0, 0, w, h);
    const LINK = Math.min(170, Math.max(110, w / 9));
    const probeR = 150;
    const origin = center();

    if (!reduce) {
      angle += dt * 0.00045;
      for (const n of nodes) {
        n.x += n.vx * dt * 0.06; n.y += n.vy * dt * 0.06;
        if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
      }
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK) continue;
        const near = Math.max(a.glow, b.glow);
        const al = (1 - d / LINK) * (0.16 + near * 0.55);
        c.strokeStyle = near > 0.2 ? `rgba(59,232,189,${al})` : `rgba(${C.line},${al})`;
        c.lineWidth = near > 0.2 ? 1.1 : 0.7;
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      }
    }

    // radar sweep when idle
    const sweepOn = !pointer || reduce;
    if (sweepOn && !reduce) {
      const len = Math.max(w, h);
      const g = c.createConicGradient ? c.createConicGradient(angle - 0.5, origin.x, origin.y) : null;
      if (g) {
        g.addColorStop(0, 'rgba(59,232,189,0)');
        g.addColorStop(0.08, 'rgba(59,232,189,0.07)');
        g.addColorStop(0.0833, 'rgba(59,232,189,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      }
      c.strokeStyle = 'rgba(59,232,189,0.22)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(origin.x, origin.y);
      c.lineTo(origin.x + Math.cos(angle) * len, origin.y + Math.sin(angle) * len); c.stroke();
      for (let k = 1; k <= 3; k++) {
        c.strokeStyle = `rgba(${C.line},0.07)`; c.beginPath(); c.arc(origin.x, origin.y, k * Math.min(w, h) * 0.22, 0, Math.PI * 2); c.stroke();
      }
    }

    // nodes
    c.font = '11px "JetBrains Mono Variable", ui-monospace, monospace';
    c.textBaseline = 'middle';
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      let target = 0;
      if (pointer) {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        if (d < probeR) target = 1 - d / probeR;
      } else if (!reduce) {
        let da = Math.atan2(n.y - origin.y, n.x - origin.x) - angle;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (da > -0.05 && da < 0.18) { n.ping = 1; }
      }
      if (reduce && i % 7 === 0) target = 0.9;
      n.ping = Math.max(0, n.ping - dt * 0.0011);
      n.glow += (Math.max(target, n.ping) - n.glow) * 0.12;

      if (n.glow > 0.04) {
        c.fillStyle = `rgba(59,232,189,${0.1 * n.glow})`;
        c.beginPath(); c.arc(n.x, n.y, n.r + 10 * n.glow, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = n.glow > 0.2 ? C.accent : `rgba(${C.line},0.7)`;
      c.beginPath(); c.arc(n.x, n.y, n.r + n.glow * 1.5, 0, Math.PI * 2); c.fill();

      if (n.glow > 0.35) {
        c.fillStyle = `rgba(232,239,242,${Math.min(1, n.glow * 1.25)})`;
        c.fillText(n.svc, n.x + n.r + 9, n.y - 9);
        c.strokeStyle = `rgba(59,232,189,${n.glow * 0.5})`;
        c.beginPath(); c.arc(n.x, n.y, n.r + 5 + (1 - n.glow) * 10, 0, Math.PI * 2); c.stroke();
      }
    }

    // probe ring + tethers
    if (pointer && !reduce) {
      c.strokeStyle = 'rgba(59,232,189,0.35)'; c.lineWidth = 1;
      c.setLineDash([3, 5]); c.beginPath(); c.arc(pointer.x, pointer.y, probeR, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.accent; c.beginPath(); c.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2); c.fill();
      const near = nodes.filter((n) => n.glow > 0.3).sort((a, b) => Math.hypot(a.x - pointer!.x, a.y - pointer!.y) - Math.hypot(b.x - pointer!.x, b.y - pointer!.y)).slice(0, 4);
      c.strokeStyle = 'rgba(59,232,189,0.4)';
      for (const n of near) { c.beginPath(); c.moveTo(pointer.x, pointer.y); c.lineTo(n.x, n.y); c.stroke(); }
    }
  }

  let last = 0;
  function loop(t: number) {
    if (!running) return;
    const dt = Math.min(48, t - (last || t));
    last = t;
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const host = canvas.parentElement!.parentElement!;
  host.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  host.addEventListener('pointerleave', () => { pointer = null; });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((es) => (es[0].isIntersecting && !document.hidden ? start() : stop())).observe(host);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
  if (!reduce) start();
}
