// Inventory demo: sample data, stored only in this browser (localStorage). Mirrors the real app's workflows:
// products & stock, barcode lookup, partial-payment tracking.
import { $, esc, mad, load, save, toast } from './util';

interface Product { sku: string; name: string; price: number; stock: number; min: number }
interface Customer { id: number; name: string; balance: number }
interface Line { sku: string; qty: number }
interface State { products: Product[]; customers: Customer[]; nextCust: number }
const KEY = 'demo-inventory-v1';
const seed = (): State => ({
  products: [
    { sku: '6111000000011', name: 'Sugar 1 kg', price: 8.5, stock: 40, min: 10 },
    { sku: '6111000000028', name: 'Olive oil 1 L', price: 62, stock: 12, min: 8 },
    { sku: '6111000000035', name: 'Mint tea 100 g', price: 14, stock: 5, min: 10 },
    { sku: '6111000000042', name: 'Flour 5 kg', price: 38, stock: 22, min: 6 },
    { sku: '6111000000059', name: 'Detergent 2 L', price: 29.9, stock: 3, min: 5 },
    { sku: '6111000000066', name: 'Bottled water 1.5 L', price: 5, stock: 96, min: 24 },
  ],
  customers: [{ id: 1, name: 'Walk-in customer', balance: 0 }, { id: 2, name: 'Amina B.', balance: 120 }, { id: 3, name: 'Youssef K.', balance: 0 }],
  nextCust: 4,
});
let S: State = load(KEY, seed());
let cart: Line[] = [];
const persist = () => save(KEY, S);
const find = (sku: string) => S.products.find((p) => p.sku === sku);
const cartTotal = () => cart.reduce((n, l) => n + (find(l.sku)?.price ?? 0) * l.qty, 0);

function renderProducts() {
  const q = $<HTMLInputElement>('search').value.trim().toLowerCase();
  const rows = S.products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.includes(q));
  $('prodBody').innerHTML = rows.map((p) => `<tr class="${p.stock <= p.min ? 'low' : ''}">
    <td><b>${esc(p.name)}</b><br><span class="mono" style="color:var(--faint);font-size:.75rem">${esc(p.sku)}</span></td>
    <td class="num">${mad(p.price)}</td>
    <td class="num">${p.stock} ${p.stock <= p.min ? '<span class="sev medium">low</span>' : ''}</td>
    <td class="num"><button class="dbtn sm" data-act="dec" data-sku="${esc(p.sku)}" aria-label="Remove one ${esc(p.name)} from stock">−</button>
      <button class="dbtn sm" data-act="inc" data-sku="${esc(p.sku)}" aria-label="Add one ${esc(p.name)} to stock">+</button>
      <button class="dbtn sm" data-act="add" data-sku="${esc(p.sku)}">Sell</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">No matching product</td></tr>';
}
function renderCart() {
  $('cartBody').innerHTML = cart.map((l) => { const p = find(l.sku)!; return `<tr><td>${esc(p.name)}</td><td class="num">${l.qty}</td><td class="num">${mad(p.price * l.qty)}</td><td class="num"><button class="dbtn sm" data-act="rm" data-sku="${esc(l.sku)}" aria-label="Remove ${esc(p.name)}">✕</button></td></tr>`; }).join('') || '<tr><td colspan="4" class="empty">Scan or tap “Sell” to add items</td></tr>';
  $('cartTotal').textContent = mad(cartTotal());
  const paid = $<HTMLInputElement>('paid'); if (document.activeElement !== paid) paid.value = cartTotal().toFixed(2);
  updateBalanceHint();
}
function updateBalanceHint() {
  const due = Math.max(0, cartTotal() - Number($<HTMLInputElement>('paid').value || 0));
  $('dueHint').textContent = due > 0 ? `Unpaid ${mad(due)} will be added to the customer's balance` : 'Paid in full';
}
function renderCustomers() {
  $<HTMLSelectElement>('cust').innerHTML = S.customers.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  $('custBody').innerHTML = S.customers.filter((c) => c.id !== 1).map((c) => `<tr><td>${esc(c.name)}</td><td class="num">${c.balance > 0 ? `<span class="sev medium">${mad(c.balance)}</span>` : '<span class="sev ok">settled</span>'}</td>
    <td class="num">${c.balance > 0 ? `<button class="dbtn sm" data-act="pay" data-id="${c.id}">Record payment</button>` : ''}</td></tr>`).join('');
  const owed = S.customers.reduce((n, c) => n + c.balance, 0), low = S.products.filter((p) => p.stock <= p.min).length;
  $('kOwed').textContent = mad(owed); $('kLow').textContent = String(low); $('kItems').textContent = String(S.products.length);
}
const renderAll = () => { renderProducts(); renderCart(); renderCustomers(); };

function addToCart(sku: string) {
  const p = find(sku); if (!p) return toast('Unknown barcode: ' + sku);
  const l = cart.find((x) => x.sku === sku);
  if ((l?.qty ?? 0) + 1 > p.stock) return toast(`Only ${p.stock} in stock`);
  if (l) l.qty++; else cart.push({ sku, qty: 1 });
  renderCart(); toast(`Added: ${p.name}`);
}

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-act]'); if (!b) return;
  const sku = b.dataset.sku!, act = b.dataset.act;
  if (act === 'inc') { find(sku)!.stock++; persist(); renderAll(); }
  else if (act === 'dec') { const p = find(sku)!; if (p.stock > 0) p.stock--; persist(); renderAll(); }
  else if (act === 'add') addToCart(sku);
  else if (act === 'rm') { cart = cart.filter((l) => l.sku !== sku); renderCart(); }
  else if (act === 'pay') {
    const c = S.customers.find((x) => x.id === Number(b.dataset.id))!;
    const v = Number(prompt(`Payment received from ${c.name} (balance ${c.balance.toFixed(2)} MAD):`, String(c.balance)));
    if (v > 0) { c.balance = Math.max(0, +(c.balance - v).toFixed(2)); persist(); renderAll(); toast('Payment recorded'); }
  }
});
$<HTMLInputElement>('search').addEventListener('input', renderProducts);
$<HTMLInputElement>('paid').addEventListener('input', updateBalanceHint);
$<HTMLFormElement>('scanForm').addEventListener('submit', (e) => { e.preventDefault(); const i = $<HTMLInputElement>('barcode'); const v = i.value.trim(); if (v) addToCart(v); i.value = ''; i.focus(); });
$('simScan').addEventListener('click', () => { const p = S.products[Math.floor(Math.random() * S.products.length)]; $<HTMLInputElement>('barcode').value = p.sku; addToCart(p.sku); $<HTMLInputElement>('barcode').value = ''; });
$('checkout').addEventListener('click', () => {
  if (!cart.length) return toast('Cart is empty');
  const total = cartTotal(), paid = Math.min(total, Math.max(0, Number($<HTMLInputElement>('paid').value || 0)));
  const c = S.customers.find((x) => x.id === Number($<HTMLSelectElement>('cust').value))!;
  const due = +(total - paid).toFixed(2);
  if (due > 0 && c.id === 1) return toast('Choose a named customer to leave a balance');
  for (const l of cart) find(l.sku)!.stock -= l.qty;
  c.balance = +(c.balance + due).toFixed(2);
  cart = []; persist(); renderAll(); toast(due > 0 ? `Sale saved · ${mad(due)} added to ${c.name}` : 'Sale completed');
});
$<HTMLFormElement>('addForm').addEventListener('submit', (e) => {
  e.preventDefault(); const f = new FormData(e.target as HTMLFormElement);
  const sku = String(f.get('sku')).trim(), name = String(f.get('name')).trim();
  if (!sku || !name) return;
  if (find(sku)) return toast('That barcode already exists');
  S.products.push({ sku, name, price: Math.max(0, Number(f.get('price'))), stock: Math.max(0, Math.floor(Number(f.get('stock')))), min: 5 });
  persist(); (e.target as HTMLFormElement).reset(); renderAll(); toast('Product added');
});
$<HTMLFormElement>('custForm').addEventListener('submit', (e) => {
  e.preventDefault(); const i = $<HTMLInputElement>('custName'); const n = i.value.trim(); if (!n) return;
  S.customers.push({ id: S.nextCust++, name: n, balance: 0 }); i.value = ''; persist(); renderAll(); toast('Customer added');
});
$('reset').addEventListener('click', () => { S = seed(); cart = []; persist(); renderAll(); toast('Sample data restored'); });
renderAll();
