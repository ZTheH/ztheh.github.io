// ──────────────────────────────────────────────────────────────
// Projects. Add a project = add an object to `projects` (a page is generated at /projects/<slug>).
// Rules used here: only verified facts, planned work is labelled as planned,
// links appear only when the URL is real. Search "TODO(confirm)" for things to verify.
// ──────────────────────────────────────────────────────────────

export type Status = 'public' | 'built' | 'in-development';
export type VisualKind = 'netmap' | 'inventory' | 'pos' | 'municipal';

export const statusLabel: Record<Status, string> = {
  public: 'Open source',
  built: 'Built',
  'in-development': 'In development',
};

export interface Project {
  slug: string;
  index: string; // "01".. for display
  name: string;
  tagline: string;
  category: string;
  status: Status;
  statusNote?: string;
  summary: string; // card text
  stack: string[];
  visual: VisualKind;
  flagship?: boolean;
  links: { repo?: string; demo?: string }; // demo starting with '/' = in-site interactive demo (sample data)
  repoNote?: string; // shown when there is no public link
  overview: string[];
  problem: { text: string[]; objectives: string[] };
  architecture: { intro: string; parts: { name: string; role: string }[] };
  workflow?: { title: string; steps: string[] };
  tech: { name: string; why: string }[];
  implementation: string[];
  featureStatus?: { name: string; state: 'implemented' | 'planned' }[];
  visualsNote: string;
  lessons: string[];
  limitations: string[];
  future: string[];
}

export const projects: Project[] = [
  // ────────────────────────────────────────────────── NETMAP
  {
    slug: 'netmap',
    index: '01',
    name: 'NetMap',
    tagline: 'Network security scanner',
    category: 'Cybersecurity / Python',
    status: 'public',
    statusNote: 'Public repository',
    summary:
      'A Python network security scanner with a command-line mode and a Tkinter GUI. It discovers hosts, scans ports with multiple threads, fingerprints services, and matches what it finds against CVE data to produce a report.',
    stack: ['Python', 'Tkinter', 'threading', 'sockets', 'CVE / NVD data', 'JSON'],
    visual: 'netmap',
    flagship: true,
    links: { repo: 'https://github.com/ZTheH/netmap', demo: '/demos/netmap' },
    overview: [
      'NetMap is a network reconnaissance and vulnerability-assessment tool I built in Python as a cybersecurity project. You point it at a single host or a CIDR range; it finds live hosts, scans their ports, identifies the services behind them, and flags known CVEs that match what it saw.',
      'It ships with two front ends over the same scanning logic: a command-line interface and a Tkinter desktop GUI with live progress and exportable results.',
    ],
    problem: {
      text: [
        'Learning security tooling by only using other people’s tools teaches you how to run them, not how they work. I wanted to understand the whole path from “which hosts are up” to “which known weaknesses might apply”.',
        'The goal was a tool that makes that path visible and produces a readable report, while staying honest about what a lightweight scanner can and cannot know.',
      ],
      objectives: [
        'Discover live hosts on a network range.',
        'Scan ports quickly without freezing the interface.',
        'Identify services and versions through banners and fingerprints.',
        'Associate discovered services with known CVEs.',
        'Keep vulnerability data updatable from external sources.',
        'Export results as a report.',
      ],
    },
    architecture: {
      intro:
        'The repository separates the scanning engine, the two front ends and the vulnerability data pipeline, so each can change without breaking the others.',
      parts: [
        { name: 'launcher.py', role: 'Entry point that lets the user choose the CLI or the GUI.' },
        { name: 'script.py', role: 'Command-line scanner: host discovery, port scanning, service detection, CVE matching.' },
        { name: 'script_gui.py', role: 'GUI-compatible backend of the scanner (kept separate so it behaves correctly when run from a worker thread).' },
        { name: 'scanner_gui.py', role: 'Tkinter front end: target input, scan options, live progress, expandable results, export.' },
        { name: 'vuln_updater.py', role: 'Fetches vulnerability data from external sources and refreshes the local database.' },
        { name: 'enhanced_cve_database.json', role: 'Local CVE database queried during scans.' },
      ],
    },
    workflow: {
      title: 'Scanning workflow',
      steps: [
        'Parse the target: single host or CIDR range.',
        'Host discovery: find which addresses answer.',
        'Port scan: connect to the configured port list across a pool of worker threads, with a configurable timeout.',
        'Service detection: grab banners and fingerprint what is listening.',
        'Vulnerability matching: look up detected services and versions in the local CVE database.',
        'Report: group results per host, highlight critical findings, export to JSON (and PDF from the GUI).',
      ],
    },
    tech: [
      { name: 'Python standard library', why: 'Sockets and threading cover scanning with no dependencies, which keeps the tool easy to run and read. Only the vulnerability updater needs the requests package.' },
      { name: 'Tkinter', why: 'Ships with Python, so the GUI works without extra installs on Windows, Linux and macOS.' },
      { name: 'threading', why: 'Port scanning is network-bound; a worker pool turns minutes into seconds and keeps the GUI responsive.' },
      { name: 'JSON database', why: 'Simple, inspectable, and easy to extend with custom entries.' },
    ],
    implementation: [
      'Multithreaded port scanning with a configurable thread count and timeout, so users can trade speed against stability and network noise.',
      'Banner grabbing and service fingerprinting feed a service-specific CVE lookup rather than one global list.',
      'A separate updater pulls fresh vulnerability data from external sources (CIRCL Vulnerability-Lookup, GitHub Security Advisories, NVD) and merges it with the bundled database.',
      'Scans can be cancelled, and the GUI runs the scanner on a worker thread with progress reporting.',
      'Logging to a file helps with debugging failed scans.',
    ],
    visualsNote:
      'The diagram on this page is an original conceptual illustration of the architecture, not a screenshot. Real GUI screenshots will be added once captured from a lab scan.',
    lessons: [
      'Threads and GUIs need discipline: running scan logic inside a worker thread broke assumptions made for a console program (for example, signal handling only works in the main thread), which is why the GUI backend is a separate module.',
      'Matching a version string to a CVE is a lookup, not a verdict. Building it made the difference between “potentially affected” and “confirmed vulnerable” concrete.',
      'Data pipelines matter as much as scanning code: a scanner is only as current as its vulnerability data.',
    ],
    limitations: [
      'NetMap is a learning project, not a replacement for professional tools such as Nmap, Nessus or OpenVAS.',
      'It does not detect every vulnerability. Findings come from banner and version matching and can include false positives and false negatives; they require manual validation.',
      'Accuracy has not been independently verified or benchmarked.',
      'Intended only for networks you own or have explicit permission to test.',
    ],
    future: [
      'Add automated tests with a controlled lab target.',
      'Improve version-range matching and confidence labelling on each finding.',
      'Add richer fingerprinting and optional UDP checks.',
      'Package it for pip and add a proper CLI with argument flags.',
      'Add real screenshots and a sample report to the repository.',
    ],
  },

  // ────────────────────────────────────────────────── INVENTORY
  {
    slug: 'inventory-management',
    index: '02',
    name: 'Inventory Management System',
    tagline: 'Stock operations for small businesses',
    category: 'Software Engineering / Business Applications',
    status: 'built',
    statusNote: 'Private repository',
    summary:
      'A database-backed web application that simplifies day-to-day stock operations: products and inventory, barcode workflows, partial payment tracking, and user and record management.',
    stack: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript'], // TODO(confirm): against the actual implementation
    visual: 'inventory',
    links: { demo: '/demos/inventory' },
    repoNote: 'The source code is in a private repository. Available to discuss or demonstrate on request.',
    overview: [
      'An inventory application for businesses that still track stock in notebooks and spreadsheets. It gives them one place to manage products, quantities and customer payments.',
      'It was built as a practical business tool, with attention to the daily workflow rather than to feature count.',
    ],
    problem: {
      text: [
        'Small shops lose time and money when stock counts, prices and customer balances live in different places. Customers often pay in instalments, which paper records handle badly.',
      ],
      objectives: [
        'Manage products and stock levels in one database.',
        'Speed up item lookup and entry with barcodes.',
        'Track partial payments and outstanding balances.',
        'Manage users and records safely.',
      ],
    },
    architecture: {
      intro: 'A classic server-rendered web application with a relational database.',
      parts: [
        { name: 'Web UI', role: 'Bootstrap-based pages with JavaScript for interactive parts such as barcode input.' },
        { name: 'Application layer', role: 'PHP handling forms, validation, authentication and business rules.' },
        { name: 'Database', role: 'MySQL tables for products, stock movements, users and payments.' },
      ],
    },
    tech: [
      { name: 'PHP + MySQL', why: 'Widely available, inexpensive to host, and well suited to form-driven business software.' },
      { name: 'Bootstrap', why: 'Fast, consistent, responsive interfaces that work on the small screens many shops use.' },
      { name: 'JavaScript', why: 'Barcode-friendly input and smoother data entry without a heavy front-end framework.' },
    ],
    implementation: [
      'Product and inventory management backed by a relational schema.',
      'Barcode workflows for faster product lookup and entry.',
      'Partial payment tracking against customer or sale records.',
      'User and record management.',
    ],
    visualsNote:
      'No screenshots are published yet. The illustration is an original conceptual graphic. Genuine screenshots (with demo data only) will be added.',
    lessons: [
      'Business software succeeds on workflow details such as scanning, quick corrections and clear balances, rather than on feature lists.',
      'A clean database structure early on saved a lot of rework when requirements changed.',
    ],
    limitations: [
      'Not presented as a commercially deployed product, and no customer claims are made.',
      'The implementation details above are summarised at a high level; a fuller case study will follow.',
    ],
    future: [
      'Reports for low stock and profit by period.',
      'Automated backups and an audit log.',
      'Role-based permissions in finer detail.',
      'Publish a demo with sample data.',
    ],
  },

  // ────────────────────────────────────────────────── POS
  {
    slug: 'offline-pos',
    index: '03',
    name: 'Offline POS & Inventory',
    tagline: 'Desktop point-of-sale that works without internet',
    category: 'Desktop Development / Business Software',
    status: 'in-development',
    statusNote: 'Project in development',
    summary:
      'An installable, offline-first desktop application for cafés, supermarkets and small businesses that need dependable sales and inventory on a single business computer.',
    stack: ['Electron', 'Local database', 'JavaScript'], // TODO(confirm): final stack decisions
    visual: 'pos',
    links: { demo: '/demos/pos' },
    repoNote: 'Work in progress. Repository not public.',
    overview: [
      'A point-of-sale and inventory application designed to keep working when the internet does not. Data lives on the business’s own computer, and the app is installed like any other desktop program.',
      'This is an ongoing project. This page separates what is a design goal from what is already implemented.',
    ],
    problem: {
      text: [
        'Many cafés and small shops run on unreliable connections, and cloud-only POS systems stop working when the line drops. They also come with monthly fees that small businesses feel.',
      ],
      objectives: [
        'Keep selling and managing stock with no connection at all.',
        'Store data locally in a form that is easy to back up and restore.',
        'Install and update on an ordinary business PC.',
        'Stay maintainable as requirements grow.',
      ],
    },
    architecture: {
      intro: 'Offline-first by design: the app never needs a server to function.',
      parts: [
        { name: 'Desktop shell', role: 'Electron packages the interface as an installable Windows application.' },
        { name: 'Local data store', role: 'An embedded database on the machine, chosen for reliability and easy backup.' },
        { name: 'Sales and inventory modules', role: 'Selling, receipts, stock movements and basic reporting sharing one data model.' },
      ],
    },
    tech: [
      { name: 'Electron', why: 'Lets me ship an installable desktop app using web skills, with access to printers and the local file system.' },
      { name: 'Embedded local database', why: 'No server to install or maintain; one file to back up. Final engine choice is part of the ongoing design work.' },
    ],
    implementation: [
      'Design focus: offline-first architecture, local database decisions, deployment, maintainability and everyday usability for cashiers.',
    ],
    featureStatus: [
      // TODO(confirm): move items to 'implemented' as they are actually done
      { name: 'Offline operation with local storage', state: 'planned' },
      { name: 'Sales workflow and receipts', state: 'planned' },
      { name: 'Inventory and stock movements', state: 'planned' },
      { name: 'Installer and update path', state: 'planned' },
      { name: 'Backup and restore', state: 'planned' },
    ],
    visualsNote: 'Conceptual illustration only. No product screenshots exist to show yet.',
    lessons: [
      'Offline-first changes the questions you ask: backups, data migrations and recovery become your responsibility instead of a cloud provider’s.',
    ],
    limitations: [
      'Not released. Nothing on this page should be read as a finished product.',
    ],
    future: [
      'Complete the sales and stock core.',
      'Add an installer, automatic backups and a migration strategy.',
      'Pilot with a real café or shop before any claims are made.',
    ],
  },

  // ────────────────────────────────────────────────── MUNICIPAL
  {
    slug: 'municipal-finance',
    index: '04',
    name: 'Municipal Finance Management',
    tagline: 'Bilingual Arabic / French administrative software',
    category: 'Web Development / Administrative Software',
    status: 'in-development',
    statusNote: 'Private repository',
    summary:
      'A bilingual Arabic/French web application that organises a Moroccan commune’s occupation-fee workflow: contributors, dossiers, occupations, quarterly payments, unpaid reports and printable payment notices.',
    stack: ['Python', 'Flask', 'SQLite', 'Jinja', 'Tailwind CSS'],
    visual: 'municipal',
    links: {},
    repoNote: 'The code is in a private repository. Real records are never published.',
    overview: [
      'A local web application that replaces repetitive manual work in tracking municipal occupation fees. It follows the real administrative chain: a contributor (individual or company) has dossiers; a dossier has authorised occupations; each occupation generates quarterly payments.',
      'The interface works in French and Arabic, including right-to-left layout.',
    ],
    problem: {
      text: [
        'The existing process lives in spreadsheets and Word templates. Finding who has not paid, recalculating amounts and preparing payment notices by hand is slow and error-prone.',
      ],
      objectives: [
        'Model contributors, dossiers, occupations and payments in one database.',
        'Calculate fees automatically from tariffs and measurements.',
        'Produce an unpaid report and printable Arabic payment notices.',
        'Import existing Excel data and export results back to Excel.',
        'Keep editing rights separate from read-only access.',
      ],
    },
    architecture: {
      intro: 'A small Flask application with plain SQL and no ORM, organised by feature.',
      parts: [
        { name: 'Auth & roles', role: 'Login with administrator and viewer roles, CSRF protection and user administration.' },
        { name: 'Dossiers & contributors', role: 'Searchable lists, detail pages, occupations and payment recording.' },
        { name: 'Calculations & quarters', role: 'Fee formulas and automatic quarterly rows.' },
        { name: 'Reports & documents', role: 'Unpaid report, Excel exports and payment notices generated from a Word template.' },
        { name: 'Import & backup', role: 'One-time Excel import with a review report, and timestamped database backups.' },
        { name: 'Presentation', role: 'Jinja templates with a French/Arabic switch and RTL support.' },
      ],
    },
    tech: [
      { name: 'Flask', why: 'Small, readable and enough for a local administrative tool without framework overhead.' },
      { name: 'SQLite', why: 'Zero-maintenance, single-file storage that suits a single-office installation and simple backups.' },
      { name: 'Word + Excel integration', why: 'The administration already works in these formats, so the app produces and imports them rather than replacing them.' },
    ],
    implementation: [
      'Role-based access (editors and read-only viewers) and CSRF protection on forms.',
      'Quarterly payment rows created automatically; payments are recorded as single transactions.',
      'Search tolerant of Arabic spelling variants, with pagination and sortable lists.',
      'Automated tests use dummy data only.',
    ],
    visualsNote:
      'No screenshots are shown, because the real application contains confidential administrative records. The illustration is original and uses no real data.',
    lessons: [
      'Software for administration is mostly about respecting the existing process: formats, vocabulary and legal wording matter as much as code.',
      'Bilingual and right-to-left interfaces need to be designed in from the start, not added afterwards.',
    ],
    limitations: [
      'Still under development; some reports and workflows are unfinished.',
      'Designed for a single local installation rather than multi-site hosting.',
      'No real records, personal data or financial documents are shown anywhere on this site.',
    ],
    future: [
      'Finish the remaining reports and review screens.',
      'Add a sanitised demo dataset so it can be shown publicly.',
      'Harden deployment and backup procedures.',
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
