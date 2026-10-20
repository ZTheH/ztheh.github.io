// Skill groups. Add, remove or re-level anything — the page renders whatever is here.
// Levels (keep this honest, no percentages):
//   'experienced' → "Experienced with"   (used in real work/projects)
//   'working'     → "Working knowledge"  (comfortable, still growing)
//   'learning'    → "Currently learning" (active study / lab practice)
// TODO(confirm): the levels below are best-guess defaults — adjust to your own judgement.

export type Level = 'experienced' | 'working' | 'learning';

export const levelLabel: Record<Level, string> = {
  experienced: 'Experienced with',
  working: 'Working knowledge',
  learning: 'Currently learning',
};

export interface Skill { name: string; level: Level; note?: string }
export interface SkillGroup { id: string; title: string; blurb: string; port: string; skills: Skill[] }

export const skillGroups: SkillGroup[] = [
  {
    id: 'networking',
    title: 'Networking',
    blurb: 'The foundation everything else sits on.',
    port: '01',
    skills: [
      { name: 'TCP/IP & networking fundamentals', level: 'experienced' },
      { name: 'Cisco networking (CCNA, 2024)', level: 'experienced' },
      { name: 'Network discovery & scanning', level: 'working', note: 'NetMap, Nmap' },
    ],
  },
  {
    id: 'security',
    title: 'Cybersecurity',
    blurb: 'Where I am deliberately investing: study, labs, certification.',
    port: '02',
    skills: [
      { name: 'Nmap', level: 'working' },
      { name: 'Vulnerability assessment fundamentals', level: 'working' },
      { name: 'CVE research & vulnerability data', level: 'working', note: 'NVD, CIRCL' },
      { name: 'Penetration-testing methodology & lab practice', level: 'learning', note: 'eJPT in preparation' },
      { name: 'Security reporting', level: 'working' },
    ],
  },
  {
    id: 'dev',
    title: 'Programming & Development',
    blurb: 'Where I build things for real workflows.',
    port: '03',
    skills: [
      { name: 'Python', level: 'experienced' },
      { name: 'Java', level: 'experienced', note: 'taught at PIGIER' },
      { name: 'SQL & T-SQL', level: 'experienced', note: 'taught at PIGIER' },
      { name: 'PHP', level: 'experienced' },
      { name: 'JavaScript', level: 'working' },
      { name: 'Bash', level: 'working' },
    ],
  },
  {
    id: 'systems',
    title: 'Systems & Infrastructure',
    blurb: 'Running, packaging and maintaining what gets built.',
    port: '04',
    skills: [
      { name: 'Linux', level: 'working' },
      { name: 'Windows administration fundamentals', level: 'working' },
      { name: 'MySQL', level: 'experienced' },
      { name: 'Git', level: 'experienced' },
      { name: 'Virtualization & local lab environments', level: 'working' },
      { name: 'Docker fundamentals', level: 'learning' },
    ],
  },
];
