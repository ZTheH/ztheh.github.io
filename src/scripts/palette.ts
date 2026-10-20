// Command palette: Ctrl/Cmd+K or "/" opens it. Pure navigation; no data leaves the page.
interface Item { g: string; t: string; h?: string; ext?: boolean; a?: string }
const dlg = document.getElementById('palette') as HTMLDialogElement | null;
if (dlg) {
  const input = document.getElementById('pal-input') as HTMLInputElement;
  const list = document.getElementById('pal-list')!;
  const all: Item[] = JSON.parse(dlg.dataset.items || '[]');
  let shown: Item[] = all, sel = 0;
  const render = () => {
    list.innerHTML = '';
    shown.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === sel));
      const t = document.createElement('span'); t.textContent = it.t;
      const g = document.createElement('span'); g.className = 'g'; g.textContent = it.g;
      li.append(t, g);
      li.addEventListener('click', () => run(it));
      li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; mark(); } });
      list.append(li);
    });
    if (!shown.length) list.innerHTML = '<li aria-selected="false"><span>No matches</span></li>';
  };
  const mark = () => [...list.children].forEach((c, i) => { c.setAttribute('aria-selected', String(i === sel)); if (i === sel) (c as HTMLElement).scrollIntoView({ block: 'nearest' }); });
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    shown = q ? all.filter((i) => (i.t + ' ' + i.g).toLowerCase().includes(q)) : all; sel = 0; render();
  };
  const open = () => { if (dlg.open) return; dlg.showModal(); input.value = ''; filter(); input.focus(); };
  const run = async (it: Item) => {
    dlg.close();
    if (it.a === 'copy-email') { try { await navigator.clipboard.writeText(dlg.dataset.email || ''); } catch { /* clipboard blocked */ } return; }
    if (!it.h) return;
    if (it.ext) window.open(it.h, '_blank', 'noopener,noreferrer'); else location.href = it.h;
  };
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); run(shown[sel]); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName);
    if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
  });
  document.getElementById('open-palette')?.addEventListener('click', open);
}
