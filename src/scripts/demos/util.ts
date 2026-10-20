export const esc = (s: unknown) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const mad = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' MAD';
export const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
export function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
export function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable: demo still works in memory */ } }
export function toast(msg: string) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout((t as any)._h); (t as any)._h = setTimeout(() => t!.classList.remove('show'), 2200);
}
