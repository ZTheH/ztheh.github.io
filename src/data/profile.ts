// ──────────────────────────────────────────────────────────────
// Personal info + contact. Edit here; the whole site updates.
// Search for "TODO(confirm)" across src/ to find every unverified detail.
// ──────────────────────────────────────────────────────────────
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const profile = {
  name: 'Zakariyae Bouhout',
  initials: 'ZB',
  location: 'Morocco',
  headline: ['Securing Systems.', 'Building Solutions.'],
  statusLine: ['Cybersecurity', 'Networking', 'Software Engineering'],
  intro:
    "I'm an IT professional and Cybersecurity Master's student with a background in networking, software development, and infrastructure. I build practical applications, explore offensive security, and continuously develop my ability to understand, test, and secure systems.",
  siteDescription:
    'Portfolio of Zakariyae Bouhout — IT professional and Cybersecurity Master’s student in Morocco. Networking, offensive security fundamentals, and practical software for real business workflows.',
};

export const links = {
  github: 'https://github.com/ZTheH',
  linkedin: 'https://www.linkedin.com/in/zakariyae-bouhout-a4040b218',
  email: 'zakariyaebouhout@gmail.com',
};

// CV: generated from src/data/cv.ts by `npm run cv` (runs automatically on dev/build).
// The "Download CV" links appear only when the generated file exists.
const base = 'Zakariyae_Bouhout_CV';
export const cv = {
  base,
  file: `/${base}.pdf`,
  docx: `/${base}.docx`,
  available: existsSync(join(process.cwd(), 'public', `${base}.pdf`)),
  docxAvailable: existsSync(join(process.cwd(), 'public', `${base}.docx`)),
};

// Open-to line shown in the contact section
export const contact = {
  heading: "Let's Build Something Secure and Useful.",
  text: "I'm open to relevant cybersecurity and IT opportunities, as well as conversations about software projects that solve real business problems.",
};
