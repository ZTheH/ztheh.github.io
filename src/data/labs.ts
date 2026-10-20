// Cybersecurity Labs & write-ups.
// To publish a write-up: copy src/content/labs/_template.md to src/content/labs/<your-slug>.md,
// fill in the frontmatter and sections, and rebuild. Files starting with "_" are ignored.
// With no articles, the section shows an honest empty state.

export interface LabMeta {
  title: string;
  summary: string;
  date: string; // YYYY-MM-DD
  tags?: string[];
  environment?: string; // e.g. "Local VM lab / HackTheBox retired machine / DVWA"
  draft?: boolean;
}
export interface Lab { slug: string; meta: LabMeta; Content: any }

const modules = import.meta.glob('../content/labs/*.md', { eager: true }) as Record<string, any>;

export function getLabs(): Lab[] {
  return Object.entries(modules)
    .map(([path, mod]) => ({
      slug: path.split('/').pop()!.replace(/\.md$/, ''),
      meta: mod.frontmatter as LabMeta,
      Content: mod.Content,
    }))
    .filter((l) => !l.slug.startsWith('_') && !l.meta.draft)
    .sort((a, b) => String(b.meta.date).localeCompare(String(a.meta.date)));
}

// Topics I intend to write about. These are plans — NOT completed labs.
export const plannedTopics = [
  'Nmap scanning & service enumeration',
  'Metasploit fundamentals',
  'Linux privilege escalation',
  'Windows security & administration',
  'Web application security',
  'Vulnerability research',
  'Network penetration-testing workflow',
  'Cloud security',
  'AI-agent security',
];

export const articleTemplate = [
  'Objective',
  'Lab environment',
  'Tools & versions',
  'Methodology',
  'Commands & explanations',
  'Findings',
  'Remediation / security implications',
  'Lessons learned',
  'References',
];
