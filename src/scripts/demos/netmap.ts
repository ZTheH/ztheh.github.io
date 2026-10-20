// NetMap lab simulator — a browser-only SIMULATION of NetMap's workflow against a built-in fictional network.
// No sockets, no requests: it only animates over the sample data below. It cannot scan anything real.

type Sev = 'critical' | 'high' | 'medium' | 'low';
interface Port { p: number; svc: string; banner: string }
interface Host { ip: string; name: string; os: string; ports: Port[] }
interface Rule { id: string; test: (p: Port) => boolean; sev: Sev; title: string; summary: string; fix: string; kind: 'cve' | 'config' }

const PREFIX = '192.168.56.';
const LAB: Host[] = [
  { ip: PREFIX + '1', name: 'gateway', os: 'Linux (router)', ports: [{ p: 22, svc: 'ssh', banner: 'OpenSSH 8.4p1' }, { p: 53, svc: 'dns', banner: 'dnsmasq 2.80' }, { p: 80, svc: 'http', banner: 'lighttpd 1.4.55' }] },
  { ip: PREFIX + '10', name: 'web-01', os: 'Ubuntu 16.04', ports: [{ p: 22, svc: 'ssh', banner: 'OpenSSH 7.2p2' }, { p: 80, svc: 'http', banner: 'Apache/2.4.49 (Unix)' }, { p: 443, svc: 'https', banner: 'Apache/2.4.49 (Unix)' }] },
  { ip: PREFIX + '15', name: 'app-02', os: 'Ubuntu 22.04', ports: [{ p: 22, svc: 'ssh', banner: 'OpenSSH 8.9p1' }, { p: 8080, svc: 'http-alt', banner: 'nginx/1.18.0' }] },
  { ip: PREFIX + '20', name: 'db-01', os: 'Debian 7', ports: [{ p: 22, svc: 'ssh', banner: 'OpenSSH 8.9p1' }, { p: 3306, svc: 'mysql', banner: 'MySQL 5.5.20' }] },
  { ip: PREFIX + '30', name: 'file-srv', os: 'Windows Server 2008 R2', ports: [{ p: 135, svc: 'msrpc', banner: 'Microsoft RPC' }, { p: 445, svc: 'smb', banner: 'SMBv1 enabled (unpatched)' }, { p: 3389, svc: 'rdp', banner: 'Microsoft Terminal Services (unpatched)' }] },
  { ip: PREFIX + '40', name: 'ftp-legacy', os: 'Linux (embedded)', ports: [{ p: 21, svc: 'ftp', banner: 'vsFTPd 2.3.4' }, { p: 23, svc: 'telnet', banner: 'telnetd' }] },
  { ip: PREFIX + '50', name: 'printer-3f', os: 'Printer firmware', ports: [{ p: 80, svc: 'http', banner: 'embedded web server' }, { p: 9100, svc: 'jetdirect', banner: 'JetDirect' }] },
  { ip: PREFIX + '60', name: 'cam-lobby', os: 'IoT camera', ports: [{ p: 23, svc: 'telnet', banner: 'busybox telnetd' }, { p: 554, svc: 'rtsp', banner: 'RTSP/1.0' }] },
];

// Small, illustrative sample of well-known public CVEs. Severities are indicative only.
const RULES: Rule[] = [
  { id: 'CVE-2021-41773', kind: 'cve', sev: 'high', test: (p) => /Apache\/2\.4\.49/.test(p.banner), title: 'Apache 2.4.49 path traversal', summary: 'Path traversal and file disclosure in Apache HTTP Server 2.4.49; remote code execution is possible in some configurations.', fix: 'Upgrade Apache to 2.4.51 or later.' },
  { id: 'CVE-2018-15473', kind: 'cve', sev: 'medium', test: (p) => /OpenSSH 7\.2/.test(p.banner), title: 'OpenSSH username enumeration', summary: 'OpenSSH up to 7.7 can reveal whether a username exists through its handling of malformed authentication requests.', fix: 'Upgrade OpenSSH; restrict SSH exposure and use key-based authentication.' },
  { id: 'CVE-2012-2122', kind: 'cve', sev: 'high', test: (p) => /MySQL 5\.5\.20/.test(p.banner), title: 'MySQL authentication bypass', summary: 'On some platforms MySQL 5.5 before 5.5.24 can accept a wrong password due to how a comparison result is handled.', fix: 'Upgrade MySQL and do not expose port 3306 beyond the application tier.' },
  { id: 'CVE-2017-0144', kind: 'cve', sev: 'critical', test: (p) => p.svc === 'smb' && /SMBv1/.test(p.banner), title: 'SMBv1 remote code execution (EternalBlue)', summary: 'Unpatched SMBv1 on Windows allows remote code execution. Widely exploited in the 2017 WannaCry outbreak.', fix: 'Apply Microsoft update MS17-010 and disable SMBv1.' },
  { id: 'CVE-2019-0708', kind: 'cve', sev: 'critical', test: (p) => p.svc === 'rdp' && /unpatched/.test(p.banner), title: 'RDP remote code execution (BlueKeep)', summary: 'Pre-authentication remote code execution in Remote Desktop Services on older, unpatched Windows versions.', fix: 'Patch the host, enable Network Level Authentication, and never expose RDP directly.' },
  { id: 'CVE-2011-2523', kind: 'cve', sev: 'critical', test: (p) => /vsFTPd 2\.3\.4/.test(p.banner), title: 'vsftpd 2.3.4 backdoor', summary: 'A malicious build of vsftpd 2.3.4 contains a backdoor that opens a command shell.', fix: 'Replace with a verified current build; prefer SFTP over FTP.' },
  { id: 'CVE-2021-23017', kind: 'cve', sev: 'medium', test: (p) => /nginx\/1\.18\.0/.test(p.banner), title: 'nginx resolver off-by-one', summary: 'An off-by-one in nginx’s DNS resolver (versions 0.6.18 to 1.20.0) can allow memory corruption in some configurations.', fix: 'Upgrade nginx to 1.20.1 or later.' },
  { id: 'CONFIG-TELNET', kind: 'config', sev: 'high', test: (p) => p.svc === 'telnet', title: 'Telnet exposed (cleartext protocol)', summary: 'Telnet sends credentials and data unencrypted. Not a CVE: an insecure-by-design service.', fix: 'Disable Telnet; use SSH.' },
  { id: 'CONFIG-FTP', kind: 'config', sev: 'medium', test: (p) => p.svc === 'ftp', title: 'FTP exposed (cleartext protocol)', summary: 'FTP transmits credentials in cleartext.', fix: 'Use SFTP or FTPS.' },
];

const PROFILES: Record<string, { label: string; ports: number[] }> = {
  quick: { label: 'Quick', ports: [22, 80, 443, 8080] },
  standard: { label: 'Standard', ports: [21, 22, 23, 53, 80, 135, 443, 445, 554, 3306, 3389, 8080, 9100] },
};
const SEV_ORDER: Sev[] = ['critical', 'high', 'medium', 'low'];

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const target = $<HTMLInputElement>('target'), profileSel = $<HTMLSelectElement>('profile'), threads = $<HTMLInputElement>('threads');
const threadsOut = $('threadsOut'), errEl = $('err'), startBtn = $<HTMLButtonElement>('start'), cancelBtn = $<HTMLButtonElement>('cancel');
const exportBtn = $<HTMLButtonElement>('export'), logEl = $('log'), bar = $('barfill'), phase = $('phase'), lanes = $('lanes');
const results = $('results'), canvas = $<HTMLCanvasElement>('topo');
const sHosts = $('sHosts'), sPorts = $('sPorts'), sFind = $('sFind'), sCrit = $('sCrit');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Found { host: Host; open: Port[]; findings: { rule: Rule; port: Port }[]; state: 'found' | 'scanning' | 'done' }
let found: Found[] = [];
let running = false, cancelled = false;
let report: object | null = null;

const log = (msg: string, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = msg; logEl.append(d); logEl.scrollTop = logEl.scrollHeight; };
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? Math.min(ms, 4) : ms));
const maxSev = (f: Found) => SEV_ORDER.find((s) => f.findings.some((x) => x.rule.sev === s));

threads.addEventListener('input', () => (threadsOut.textContent = threads.value));
lanes.innerHTML = Array.from({ length: 24 }, () => '<i></i>').join('');

// ── topology canvas ──
const ctx = canvas.getContext('2d')!;
function draw(t = 0) {
  const r = canvas.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = r.width, h = r.height, cx = w / 2, cy = h / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(98,200,255,0.08)'; ctx.setLineDash([2, 6]);
  ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.34, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.font = '11px "JetBrains Mono Variable", monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#5d6e77'; ctx.fillText('192.168.56.0/24', cx, h - 12);
  found.forEach((f, i) => {
    const a = (i / LAB.length) * Math.PI * 2 - Math.PI / 2, R = Math.min(w, h) * 0.34;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const sev = maxSev(f);
    const col = f.state !== 'done' ? '#62c8ff' : sev === 'critical' ? '#ff7a7a' : sev === 'high' ? '#ffa45c' : sev === 'medium' ? '#f2b94b' : '#3be8bd';
    ctx.strokeStyle = 'rgba(98,200,255,0.22)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    const pulse = f.state === 'scanning' ? 5 + Math.sin(t / 120) * 3 : 0;
    ctx.fillStyle = col + '22'; ctx.beginPath(); ctx.arc(x, y, 14 + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8eff2'; ctx.fillText(f.host.name, x, y + 28);
    ctx.fillStyle = '#5d6e77'; ctx.fillText('.' + f.host.ip.split('.')[3], x, y - 20);
  });
  ctx.fillStyle = '#3be8bd'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#04120e'; ctx.fillText('', cx, cy);
  ctx.fillStyle = '#e8eff2'; ctx.fillText('scanner', cx, cy + 26);
}
(function loop(t: number) { draw(t); requestAnimationFrame(loop); })(0);

function stats() {
  sHosts.textContent = String(found.length);
  sFind.textContent = String(found.reduce((n, f) => n + f.findings.length, 0));
  sCrit.textContent = String(found.reduce((n, f) => n + f.findings.filter((x) => x.rule.sev === 'critical').length, 0));
}

function renderResults() {
  if (!found.length) { results.innerHTML = '<div class="empty">No results yet — start a scan.</div>'; return; }
  const sorted = [...found].sort((a, b) => SEV_ORDER.indexOf(maxSev(a) ?? 'low') - SEV_ORDER.indexOf(maxSev(b) ?? 'low') || a.host.ip.localeCompare(b.host.ip, undefined, { numeric: true }));
  results.innerHTML = sorted.map((f) => {
    const s = maxSev(f);
    const fl = f.findings.sort((a, b) => SEV_ORDER.indexOf(a.rule.sev) - SEV_ORDER.indexOf(b.rule.sev));
    return `<details class="hostcard" ${s === 'critical' ? 'open' : ''}>
      <summary><span class="ip">${f.host.ip}</span><span class="nm">${f.host.name} · ${f.host.os}</span>
        <span class="sev ${s ?? 'ok'}">${s ? fl.length + ' finding' + (fl.length > 1 ? 's' : '') + ' · ' + s : 'no findings'}</span>
        <span class="nm" style="margin-left:auto">${f.open.map((p) => p.p).join(', ')}</span></summary>
      <div class="body">
        <table class="dtable"><thead><tr><th>Port</th><th>Service</th><th>Banner</th></tr></thead><tbody>
          ${f.open.map((p) => `<tr><td>${p.p}/tcp</td><td>${p.svc}</td><td>${p.banner}</td></tr>`).join('')}
        </tbody></table>
        ${fl.map((x) => `<div class="finding ${x.rule.sev}"><h4><span class="sev ${x.rule.sev}">${x.rule.sev}</span>${x.rule.title}<span class="nm mono">${x.rule.id} · port ${x.port.p}</span></h4>
          <p>${x.rule.summary}</p><p class="fix"><b>Mitigation:</b> ${x.rule.fix}</p>
          <p style="color:var(--faint)">${x.rule.kind === 'cve' ? 'Potentially affected, based on the service banner. Requires manual validation.' : 'Configuration finding.'}</p></div>`).join('')}
      </div></details>`;
  }).join('');
}

async function scan() {
  const t = target.value.trim();
  errEl.textContent = '';
  if (!/^192\.168\.56\.(0\/24|\d{1,3})$/.test(t)) {
    errEl.textContent = 'This demo only scans its built-in fictional lab network (192.168.56.0/24). The real NetMap runs on your own machine, against networks you own or are authorised to test.';
    return;
  }
  const single = /^192\.168\.56\.\d{1,3}$/.test(t) ? t : null;
  const pool = single ? LAB.filter((h) => h.ip === single) : LAB;
  running = true; cancelled = false; found = []; report = null;
  logEl.innerHTML = ''; results.innerHTML = ''; stats(); sPorts.textContent = '0';
  startBtn.disabled = true; cancelBtn.disabled = false; exportBtn.disabled = true; profileSel.disabled = true; target.disabled = true;
  const prof = PROFILES[profileSel.value]; const nThreads = Number(threads.value);
  const t0 = performance.now();
  log(`NetMap lab simulator · target ${t} · profile ${prof.label} · ${nThreads} threads`, 'dim');

  // 1. host discovery
  phase.textContent = 'Host discovery';
  const total = single ? 1 : 254; let checked = 0;
  const step = Math.max(2, Math.round(nThreads * 1.5));
  while (checked < total && !cancelled) {
    const from = checked + 1; checked = Math.min(total, checked + step);
    for (const h of pool) { const last = Number(h.ip.split('.')[3]); if (single ? true : last >= from && last <= checked) { if (!found.some((f) => f.host === h)) { found.push({ host: h, open: [], findings: [], state: 'found' }); log(`[+] host up ${h.ip}  (${h.name})`, 'ok'); stats(); } } }
    bar.style.width = (checked / total) * 25 + '%';
    await wait(22);
  }

  // 2. port scan with a worker pool
  phase.textContent = 'Port scan';
  let done = 0; const queue: { f: Found; port: number }[] = [];
  for (const f of found) for (const p of prof.ports) queue.push({ f, port: p });
  const totalProbes = queue.length;
  const laneEls = [...lanes.children] as HTMLElement[];
  while (queue.length && !cancelled) {
    const batch = queue.splice(0, nThreads);
    laneEls.forEach((l, i) => l.classList.toggle('on', i < Math.min(nThreads, 24) && i < batch.length));
    for (const job of batch) {
      job.f.state = 'scanning';
      const hit = job.f.host.ports.find((p) => p.p === job.port);
      if (hit) { job.f.open.push(hit); log(`[+] ${job.f.host.ip}:${hit.p}/tcp open  ${hit.svc}`, 'ok'); }
    }
    done += batch.length; sPorts.textContent = String(done);
    bar.style.width = 25 + (done / totalProbes) * 45 + '%';
    await wait(Math.max(10, 90 - nThreads * 1.6));
  }
  laneEls.forEach((l) => l.classList.remove('on'));

  // 3. service detection + CVE matching
  if (!cancelled) {
    phase.textContent = 'Service detection & CVE matching';
    for (const f of found) {
      if (cancelled) break;
      f.open.sort((a, b) => a.p - b.p);
      for (const p of f.open) {
        for (const rule of RULES) if (rule.test(p)) { f.findings.push({ rule, port: p }); log(`[!] ${f.host.ip}:${p.p} ${rule.id} — ${rule.title}`, rule.sev === 'critical' ? 'bad' : 'warn'); }
      }
      f.state = 'done'; stats(); renderResults();
      bar.style.width = 70 + ((found.indexOf(f) + 1) / found.length) * 30 + '%';
      await wait(160);
    }
  }

  // 4. report
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  if (cancelled) { phase.textContent = 'Cancelled'; log('Scan cancelled by user.', 'warn'); }
  else {
    phase.textContent = 'Complete'; bar.style.width = '100%';
    log(`Scan complete: ${found.length} hosts, ${found.reduce((n, f) => n + f.findings.length, 0)} potential findings (simulated time ${secs}s).`, 'ok');
    report = {
      tool: 'NetMap lab simulator (sample data)', note: 'Simulation. Findings are illustrative and based on banners; they require manual validation.',
      target: t, profile: prof.label, hosts: found.map((f) => ({ ip: f.host.ip, name: f.host.name, os: f.host.os, openPorts: f.open.map((p) => ({ port: p.p, service: p.svc, banner: p.banner })), findings: f.findings.map((x) => ({ id: x.rule.id, severity: x.rule.sev, title: x.rule.title, mitigation: x.rule.fix })) })),
    };
    exportBtn.disabled = false;
  }
  renderResults();
  running = false; startBtn.disabled = false; cancelBtn.disabled = true; profileSel.disabled = false; target.disabled = false;
}

startBtn.addEventListener('click', () => { if (!running) scan(); });
cancelBtn.addEventListener('click', () => { cancelled = true; });
exportBtn.addEventListener('click', () => {
  if (!report) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  a.download = 'netmap-demo-report.json'; a.click(); URL.revokeObjectURL(a.href);
});
renderResults();
