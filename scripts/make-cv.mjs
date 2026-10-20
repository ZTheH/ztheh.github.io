// Generates an ATS-friendly CV (PDF + DOCX) from src/data/cv.ts and src/data/profile.ts.
// Usage: npm run cv     (also runs automatically before `npm run dev` and `npm run build`)
// ATS-friendly means: single column, real selectable text, standard section names, standard fonts,
// no tables, icons, images or text boxes.
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import PDFDocument from 'pdfkit';
import {
  AlignmentType, Document, ExternalHyperlink, HeadingLevel, LevelFormat, Packer, Paragraph, TabStopType, TextRun,
} from 'docx';
import { cv } from '../src/data/cv.ts';
import { profile, links, cv as files } from '../src/data/profile.ts';

mkdirSync('public', { recursive: true });
const clean = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const contact = [profile.location, links.email, clean(links.github), clean(links.linkedin)];
const href = (u) => (u.startsWith('http') ? u : 'https://' + u);

// Warn about facts still marked TODO(confirm) in the content file
const todo = readFileSync('src/data/cv.ts', 'utf8').split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => l.includes('TODO(confirm)') && !l.includes('Search "TODO'));
if (todo.length) console.warn(`CV: ${todo.length} item(s) still marked TODO(confirm) in src/data/cv.ts (lines ${todo.map(([n]) => n).join(', ')})`);

// ───────────────────────────── PDF ─────────────────────────────
function makePdf() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 46, bottom: 46, left: 50, right: 50 }, info: { Title: `${profile.name} — CV`, Author: profile.name, Subject: 'Curriculum Vitae', Keywords: 'cybersecurity, networking, Python, CCNA' } });
  doc.pipe(createWriteStream(`public/${files.base}.pdf`));
  const W = doc.page.width - 100, X = 50;
  const body = (t, o = {}) => doc.font('Helvetica').fontSize(10).fillColor('#000').text(t, { lineGap: 1.5, ...o });
  const h = (t) => {
    doc.moveDown(0.7).font('Helvetica-Bold').fontSize(11).fillColor('#000').text(t.toUpperCase(), X, doc.y, { characterSpacing: 0.6 });
    const y = doc.y + 1; doc.moveTo(X, y).lineTo(X + W, y).lineWidth(0.6).strokeColor('#444').stroke(); doc.moveDown(0.35);
  };
  const bullet = (t) => {
    const y = doc.y; doc.font('Helvetica').fontSize(10).fillColor('#000').text('•', X + 4, y, { lineBreak: false });
    doc.text(t, X + 18, y, { width: W - 18, lineGap: 1.5 }); doc.x = X;
  };
  const row = (left, right) => {
    const y = doc.y; doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000').text(left, X, y, { width: W - 215, lineBreak: true });
    const bottom = doc.y;
    if (right) { doc.font('Helvetica').fontSize(10).text(right, X + W - 205, y, { width: 205, align: 'right' }); }
    doc.y = Math.max(bottom, doc.y); doc.x = X;
  };

  doc.font('Helvetica-Bold').fontSize(22).fillColor('#000').text(profile.name, X, doc.y, { width: W });
  doc.font('Helvetica').fontSize(11.5).fillColor('#222').text(cv.title, { width: W });
  doc.moveDown(0.3).fontSize(9).fillColor('#000').text(contact.join('  |  '), { width: W });

  if (cv.summary) { h('Professional Summary'); body(cv.summary, { width: W }); }
  if (cv.skills?.length) { h('Skills'); for (const g of cv.skills) { doc.font('Helvetica-Bold').fontSize(10).text(g.group + ': ', X, doc.y, { continued: true, width: W, lineGap: 1.5 }).font('Helvetica').text(g.items.join(', ')); } }
  if (cv.experience?.length) {
    h('Professional Experience');
    for (const e of cv.experience) {
      row(e.org ? `${e.role}, ${e.org}` : e.role, e.period);
      for (const b of e.bullets) bullet(b); doc.moveDown(0.3);
    }
  }
  if (cv.projects?.length) {
    h('Projects');
    for (const p of cv.projects) {
      row(p.name, p.link);
      doc.font('Helvetica-Oblique').fontSize(9.5).fillColor('#333').text(p.stack, X, doc.y, { width: W });
      for (const b of p.bullets) bullet(b); doc.moveDown(0.3);
    }
  }
  if (cv.education?.length) {
    h('Education');
    for (const e of cv.education) { row(e.org ? `${e.degree}, ${e.org}` : e.degree, e.period); if (e.note) body(e.note); }
  }
  if (cv.certifications?.length) { h('Certifications'); for (const c of cv.certifications) bullet(c); }
  if (cv.languages?.length) { h('Languages'); body(cv.languages.join(', '), { width: W }); }
  doc.end();
}

// ───────────────────────────── DOCX ─────────────────────────────
function makeDocx() {
  const F = 'Arial';
  const run = (text, o = {}) => new TextRun({ text, font: F, size: 20, ...o });
  const head = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 }, border: { bottom: { style: 'single', size: 6, color: '444444', space: 1 } }, children: [new TextRun({ text: t.toUpperCase(), font: F, size: 22, bold: true })] });
  const bullet = (t) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 20 }, children: [run(t)] });
  const row = (l, r) => new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9900 }], spacing: { before: 60 }, children: [run(l, { bold: true, size: 21 }), ...(r ? [run('\t' + r)] : [])] });
  const kids = [
    new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 20 }, children: [new TextRun({ text: profile.name, font: F, size: 44, bold: true })] }),
    new Paragraph({ spacing: { after: 20 }, children: [run(cv.title, { size: 23 })] }),
    new Paragraph({ spacing: { after: 60 }, children: [run(contact.join('  |  '), { size: 19 })] }),
  ];
  if (cv.summary) kids.push(head('Professional Summary'), new Paragraph({ children: [run(cv.summary)] }));
  if (cv.skills?.length) { kids.push(head('Skills')); for (const g of cv.skills) kids.push(new Paragraph({ spacing: { after: 20 }, children: [run(g.group + ': ', { bold: true }), run(g.items.join(', '))] })); }
  if (cv.experience?.length) { kids.push(head('Professional Experience')); for (const e of cv.experience) { kids.push(row(e.org ? `${e.role}, ${e.org}` : e.role, e.period)); e.bullets.forEach((b) => kids.push(bullet(b))); } }
  if (cv.projects?.length) {
    kids.push(head('Projects'));
    for (const p of cv.projects) {
      kids.push(new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9900 }], spacing: { before: 60 }, children: [run(p.name, { bold: true, size: 21 }), ...(p.link ? [run('\t'), new ExternalHyperlink({ link: href(p.link), children: [run(p.link, { color: '1155CC' })] })] : [])] }));
      kids.push(new Paragraph({ children: [run(p.stack, { italics: true, size: 19 })] }));
      p.bullets.forEach((b) => kids.push(bullet(b)));
    }
  }
  if (cv.education?.length) { kids.push(head('Education')); for (const e of cv.education) { kids.push(row(e.org ? `${e.degree}, ${e.org}` : e.degree, e.period)); if (e.note) kids.push(new Paragraph({ children: [run(e.note)] })); } }
  if (cv.certifications?.length) { kids.push(head('Certifications')); cv.certifications.forEach((c) => kids.push(bullet(c))); }
  if (cv.languages?.length) kids.push(head('Languages'), new Paragraph({ children: [run(cv.languages.join(', '))] }));

  const doc = new Document({
    creator: profile.name, title: `${profile.name} — CV`,
    styles: { default: { document: { run: { font: F, size: 20 } } } },
    numbering: { config: [{ reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, children: kids }],
  });
  return Packer.toBuffer(doc).then((buf) => import('node:fs').then((fs) => fs.writeFileSync(`public/${files.base}.docx`, buf)));
}

makePdf();
await makeDocx();
console.log(`CV written: public/${files.base}.pdf and public/${files.base}.docx`);
