// Small progressive-enhancement script: mobile menu, active section, scroll progress, reveal-on-scroll.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Mobile menu ──
const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
const menu = document.getElementById('nav-links');
const setMenu = (open: boolean) => {
  if (!btn || !menu) return;
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('open', open);
};
btn?.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && btn?.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
});

// ── Scroll progress ──
const bar = document.querySelector<HTMLElement>('.progress');
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar?.style.setProperty('--p', h > 0 ? String(Math.min(1, scrollY / h)) : '0');
    ticking = false;
  });
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Active section (home page only) ──
const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav-links a[data-section]')];
const sections = links
  .map((a) => document.getElementById(a.dataset.section!))
  .filter((s): s is HTMLElement => !!s);
if (sections.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((a) => {
          const on = a.dataset.section === en.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

// ── Reveal ──
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
// above-the-fold hero text never waits on the observer
requestAnimationFrame(() => document.querySelectorAll<HTMLElement>('.hero .reveal').forEach((el) => el.classList.add('in')));
if (reduce || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const rio = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  reveals.forEach((el) => rio.observe(el));
}

// ── Project page: table-of-contents highlight ──
const toc = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')];
if (toc.length) {
  const secs = toc.map((a) => document.querySelector(a.getAttribute('href')!)).filter(Boolean) as Element[];
  const tio = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) toc.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }),
    { rootMargin: '-30% 0px -60% 0px' },
  );
  secs.forEach((s) => tio.observe(s));
}
