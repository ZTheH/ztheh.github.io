// Timeline entries, education, certifications. Newest first.
// TODO(confirm): items marked `confirm: true` show a small "to confirm" note until you verify them.

export interface TimelineItem {
  kind: 'education' | 'cert' | 'work';
  title: string;
  org?: string;
  period: string;
  status?: 'completed' | 'in-progress' | 'in-preparation';
  points?: string[];
  confirm?: boolean;
  link?: { label: string; href: string };
}

export const timeline: TimelineItem[] = [
  {
    kind: 'education',
    title: "Master's in Cybersecurity",
    org: 'Morocco', // TODO(confirm): institution name
    period: 'Year 1 completed · Year 2 expected 2026',
    status: 'in-progress',
    points: [
      'Structured study of network, system and application security, now paired with hands-on lab practice.',
    ],
    confirm: true, // TODO(confirm): exact enrollment + graduation status
  },
  {
    kind: 'cert',
    title: 'INE eJPT — Junior Penetration Tester',
    org: 'INE Security',
    period: 'In preparation',
    status: 'in-preparation',
    points: ['Not yet passed. Preparing through lab practice and methodology study.'],
  },
  {
    kind: 'cert',
    title: 'Cisco CCNA',
    org: 'Cisco',
    period: '2024',
    status: 'completed',
    points: ['Routing, switching and IP networking fundamentals.'],
    // link: { label: 'Verify credential', href: '' }, // TODO: add Credly/Cisco verification URL
  },
  {
    kind: 'work',
    title: 'Technical Education Intern',
    org: 'PIGIER',
    period: '5-month internship',
    status: 'completed',
    points: [
      'Taught Java, SQL and T-SQL, and Java Swing.',
      'Supervised student projects.',
    ],
    confirm: true, // TODO(confirm): dates + exact title
  },
  {
    kind: 'work',
    title: 'IT support & development-related work',
    org: 'Employers and roles to be added',
    period: '≈ 5 years in total',
    status: 'completed',
    points: [
      'Technical support, networking, programming and database development — the base that my security work is built on.',
    ],
    confirm: true, // TODO(confirm): employers, job titles, dates
  },
];
