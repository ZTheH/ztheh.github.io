// ──────────────────────────────────────────────────────────────
// CV CONTENT — the one file to edit for your CV.
// Run `npm run cv` to regenerate public/cv.pdf and public/cv.docx
// (this also happens automatically on `npm run dev` and `npm run build`).
//
// Name, location, email, GitHub and LinkedIn come from src/data/profile.ts.
// Rules for an ATS-friendly CV: plain wording, standard section names, real dates, keywords that
// appear in the job ad, and only true statements. Leave a field out (or set it to undefined)
// and it is skipped. Search "TODO(confirm)" for facts that still need your input.
// ──────────────────────────────────────────────────────────────

export interface CvExperience { role: string; org?: string; period?: string; location?: string; bullets: string[] }
export interface CvProject { name: string; stack: string; link?: string; bullets: string[] }
export interface CvEducation { degree: string; org?: string; period?: string; note?: string }

export const cv = {
  // Shown under your name. Match it to the role you are applying for.
  title: 'Cybersecurity-Focused IT Professional',

  summary:
    "IT professional with about five years of experience in technical support and development-related work, a Cisco CCNA (2024), and a background in networking, Python, PHP, JavaScript, C, Java and SQL. " +
    "Completed the first year of a Master's in Cybersecurity and preparing for the INE eJPT certification. " +
    'Hands-on with network scanning, vulnerability assessment fundamentals and CVE research; built NetMap, an open-source Python network security scanner.',

  // Keyword-rich, plain lists. ATS software matches these words against job ads.
  skills: [
    { group: 'Networking', items: ['TCP/IP', 'Cisco networking', 'CCNA', 'Network discovery', 'Network scanning'] },
    { group: 'Cybersecurity', items: ['Nmap', 'Vulnerability assessment', 'CVE research', 'Penetration testing methodology', 'Security reporting'] },
    { group: 'Programming', items: ['Python', 'PHP', 'JavaScript', 'C', 'Java', 'SQL', 'T-SQL', 'Bash'] },
    { group: 'Systems & Tools', items: ['Linux', 'Windows administration', 'MySQL', 'Git', 'Virtualization', 'Docker (fundamentals)'] },
  ],

  experience: [
    {
      role: 'Technical Education Intern',
      org: 'PIGIER',
      period: '5-month internship', // TODO(confirm): real dates, e.g. "Mar 2023 – Jul 2023"
      bullets: [
        'Taught Java, SQL and T-SQL, and Java Swing to students.',
        'Supervised student projects.',
      ],
    },
    {
      role: 'IT Support & Development', // TODO(confirm): exact job title(s)
      org: undefined, // TODO(confirm): employer name(s)
      period: 'Approx. 5 years', // TODO(confirm): real dates
      bullets: [
        'Provided technical support and worked on networking, programming and database development tasks.',
        // TODO(confirm): add 2–4 concrete achievements, ideally with numbers (users supported, systems managed, time saved).
      ],
    },
  ] as CvExperience[],

  projects: [
    {
      name: 'NetMap — Network Security Scanner',
      stack: 'Python, Tkinter, multithreading, sockets, CVE data',
      link: 'github.com/ZTheH/netmap',
      bullets: [
        'Built an open-source network scanner with a command-line interface and a Tkinter GUI: host discovery, multithreaded port scanning and service/banner detection.',
        'Matched detected services against a CVE database refreshed from external sources (CIRCL, GitHub Security Advisories, NVD) and generated JSON/PDF reports.',
      ],
    },
    {
      name: 'Municipal Finance Management Application',
      stack: 'Python, Flask, SQLite, Jinja, Tailwind CSS',
      bullets: [
        'Developed a bilingual French/Arabic web application for a Moroccan commune covering contributors, dossiers, occupations and quarterly payments.',
        'Implemented role-based access, CSRF protection, unpaid-payment reports, Word payment notices, Excel import/export and database backups.',
      ],
    },
    {
      name: 'Inventory Management System',
      stack: 'PHP, MySQL, Bootstrap, JavaScript',
      bullets: ['Built a database-backed web application for stock operations with barcode workflows, partial-payment tracking and user and record management.'],
    },
    {
      name: 'Offline POS & Inventory Software (in development)',
      stack: 'Electron, local database',
      bullets: ['Designing an installable, offline-first desktop point-of-sale and inventory application for cafés and small shops.'],
    },
  ] as CvProject[],

  education: [
    {
      degree: "Master's in Cybersecurity",
      org: undefined, // TODO(confirm): institution name
      period: 'Year 1 completed · Year 2 expected 2026', // TODO(confirm): current status
    },
  ] as CvEducation[],

  certifications: [
    'Cisco Certified Network Associate (CCNA) — 2024',
    'INE eJPT (Junior Penetration Tester) — in preparation',
  ],

  // Add what applies, e.g. ['Arabic (native)', 'French (professional)', 'English (professional)']. Empty = section skipped.
  languages: [] as string[], // TODO(confirm)

};
