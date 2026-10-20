// Offline POS demo: sales, cash change, receipt and daily totals, all stored locally in this browser.
// "Offline" mode here just illustrates the design goal: nothing ever needs a server.
import { $, esc, mad, load, save, toast } from './util';

interface Item { id: number; name: string; price: number; cat: string }
interface Sale { id: number; at: string; lines: { name: string; qty: number; price: number }[]; total: number; cash: number; change: number }
const KEY = 'demo-pos-v1';
const ITEMS: Item[] = [
  { id: 1, name: 'Espresso', price: 10, cat: 'Coffee' }, { id: 2, name: 'Café crème', price: 14, cat: 'Coffee' },
  { id: 3, name: 'Mint tea', price: 12, cat: 'Tea' }, { id: 4, name: 'Orange juice', price: 16, cat: 'Juice' },
  { id: 5, name: 'Croissant', price: 8, cat: 'Pastry' }, { id: 6, name: 'Msemen', price: 6, cat: 'Pastry' },
  { id: 7, name: 'Sandwich', price: 25, cat: 'Food' }, { id: 8, name: 'Water 50 cl', price: 4, cat: 'Drinks' },
];
let sales: Sale[] = load(KEY, []);
let cart = new Map<number, number>();
let filter = 'All';

const total = () => [...cart].reduce((n, [id, q]) => n + ITEMS.find((i) => i.id === id)!.price * q, 0);

function renderTiles() {
  const cats = ['All', ...new Set(ITEMS.map((i) => i.cat))];
  $('cats').innerHTML = cats.map((c) => `<button class="dbtn sm ${c === filter ? 'primary' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  $('tiles').innerHTML = ITEMS.filter((i) => filter === 'All' || i.cat === filter).map((i) =>
    `<button class="tile" data-add="${i.id}"><span>${esc(i.name)}</span><b>${mad(i.price)}</b></button>`).join('');
}
function renderCart() {
  $('lines').innerHTML = [...cart].map(([id, q]) => { const it = ITEMS.find((i) => i.id === id)!;
    return `<tr><td>${esc(it.name)}</td><td class="num"><button class="dbtn sm" data-dec="${id}" aria-label="Fewer ${esc(it.name)}">−</button> ${q} <button class="dbtn sm" data-add="${id}" aria-label="More ${esc(it.name)}">+</button></td><td class="num">${mad(it.price * q)}</td></tr>`; }).join('')
    || '<tr><td colspan="3" class="empty">Tap an item to start a sale</td></tr>';
  $('total').textContent = mad(total());
  const cash = Number($<HTMLInputElement>('cash').value || 0), t = total();
  $('change').textContent = cash >= t && t > 0 ? `Change: ${mad(cash - t)}` : t > 0 ? `Short by ${mad(Math.max(0, t - cash))}` : '';
}
function renderDay() {
  const sum = sales.reduce((n, s) => n + s.total, 0);
  $('dayTotal').textContent = mad(sum); $('dayCount').textContent = String(sales.length);
  $('dayBody').innerHTML = [...sales].reverse().slice(0, 8).map((s) => `<tr><td class="mono">#${s.id}</td><td>${esc(s.at)}</td><td>${s.lines.reduce((n, l) => n + l.qty, 0)} items</td><td class="num">${mad(s.total)}</td></tr>`).join('')
    || '<tr><td colspan="4" class="empty">No sales yet today</td></tr>';
}
function receipt(s: Sale) {
  $('receipt').innerHTML = `<pre>${esc(
`    CAFÉ DEMO
  (sample receipt)
--------------------------
#${s.id}   ${s.at}
--------------------------
${s.lines.map((l) => `${(l.qty + 'x ' + l.name).padEnd(16)}${(l.qty * l.price).toFixed(2).padStart(9)}`).join('\n')}
--------------------------
${'TOTAL'.padEnd(16)}${s.total.toFixed(2).padStart(9)}
${'CASH'.padEnd(16)}${s.cash.toFixed(2).padStart(9)}
${'CHANGE'.padEnd(16)}${s.change.toFixed(2).padStart(9)}
--------------------------
  Stored locally. No server.`)}</pre>`;
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>('[data-add]'), dec = t.closest<HTMLElement>('[data-dec]'), cat = t.closest<HTMLElement>('[data-cat]');
  if (add) { const id = Number(add.dataset.add); cart.set(id, (cart.get(id) ?? 0) + 1); renderCart(); }
  else if (dec) { const id = Number(dec.dataset.dec); const q = (cart.get(id) ?? 0) - 1; if (q <= 0) cart.delete(id); else cart.set(id, q); renderCart(); }
  else if (cat) { filter = cat.dataset.cat!; renderTiles(); }
});
$('cash').addEventListener('input', renderCart);
$('exact').addEventListener('click', () => { $<HTMLInputElement>('cash').value = total().toFixed(2); renderCart(); });
$('pay').addEventListener('click', () => {
  const t = total(); if (!t) return toast('Cart is empty');
  const cash = Number($<HTMLInputElement>('cash').value || 0);
  if (cash < t) return toast('Cash received is less than the total');
  const s: Sale = { id: sales.length + 1, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lines: [...cart].map(([id, q]) => { const it = ITEMS.find((i) => i.id === id)!; return { name: it.name, qty: q, price: it.price }; }), total: t, cash, change: +(cash - t).toFixed(2) };
  sales.push(s); save(KEY, sales); cart = new Map(); $<HTMLInputElement>('cash').value = ''; receipt(s); renderCart(); renderDay(); toast('Sale saved locally');
});
$('closeDay').addEventListener('click', () => { if (!sales.length) return toast('Nothing to close'); sales = []; save(KEY, sales); renderDay(); $('receipt').innerHTML = '<div class="empty">Day closed. Totals reset.</div>'; toast('Day closed'); });

// Offline illustration
const net = $<HTMLInputElement>('offline'), badge = $('netBadge');
const paintNet = () => { const off = net.checked || !navigator.onLine; badge.textContent = off ? '● Offline — selling normally' : '● Online — nothing depends on it'; badge.className = 'sev ' + (off ? 'medium' : 'ok'); };
net.addEventListener('change', paintNet); addEventListener('online', paintNet); addEventListener('offline', paintNet);

renderTiles(); renderCart(); renderDay(); paintNet();
$('receipt').innerHTML = '<div class="empty">Receipt appears here after a sale.</div>';
