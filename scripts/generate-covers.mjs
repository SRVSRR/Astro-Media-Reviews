import sharp from 'sharp';
import { join } from 'node:path';

const covers = [
  { slug: 'operating-systems-foundations-and-perspectives', kicker: 'Operating Systems · Study Note', lines: ['Operating Systems', 'Foundations'] },
  { slug: 'selecting-software-process-models-waterfall-to-agile', kicker: 'Software Engineering · Study Note', lines: ['Selecting a Software', 'Process Model'] },
  { slug: 'software-crisis-quality-attributes-and-ethics', kicker: 'Software Engineering · Study Note', lines: ['The Software Crisis:', 'Quality & Ethics'] },
  { slug: 'software-definition-product-types-cost-and-evolution', kicker: 'Software Engineering · Study Note', lines: ['What Is Software?', 'Cost & Evolution'] },
  { slug: 'software-project-planning-scope-feasibility-and-scheduling', kicker: 'Project Management · Study Note', lines: ['Software Project', 'Planning'] },
  { slug: 'reconciling-software-estimates-loc-fp-ucp-agile', kicker: 'Estimation · Study Note', lines: ['Reconciling Software', 'Estimates'] },
  { slug: 'computer-system-operation-interrupts-io-storage', kicker: 'Operating Systems · Study Note', lines: ['Computer System', 'Operation'] },
  { slug: 'agile-development-methodologies', kicker: 'Agile · Study Note', lines: ['Agile Development', 'Methodologies'] },
  { slug: 'risk-management-identification-projection-and-exposure', kicker: 'Risk Management · Study Note', lines: ['Risk Management', 'in Software'] },
  { slug: 'sdlc-principles-guide', kicker: 'Software Engineering · Study Note', lines: ['SDLC Principles'] },
  { slug: 'sdlc-framework-umbrella-activities-and-principles', kicker: 'Software Engineering · Study Note', lines: ['The SDLC Framework'] },
  { slug: 'prototype-development-maintenance-guide', kicker: 'Prototyping · Study Note', lines: ['Prototyping &', 'Software Maintenance'] },
  { slug: 'trustworthy-finance-api', kicker: 'Expense Tracker · Part 1', lines: ['Trustworthy', 'Finance API'] },
  { slug: 'supabase-auth-migration', kicker: 'Expense Tracker · Part 2', lines: ['Supabase', 'Auth Migration'] },
  { slug: 'ml-transaction-categorization', kicker: 'Expense Tracker · Part 3', lines: ['ML Transaction', 'Categorization'] },
  { slug: 'ml-cash-flow-forecasting', kicker: 'Expense Tracker · Part 4', lines: ['Cash-Flow', 'Forecasting'] },
  { slug: 'production-analytics-platform', kicker: 'Expense Tracker · Part 5', lines: ['Production Analytics', 'Platform'] },
  { slug: 'understanding-calibration-curves', kicker: 'Machine Learning · Study Note', lines: ['Calibration Curves'] },
];

function svg({ kicker, lines }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const longest = Math.max(...lines.map((l) => l.length));
  const fontSize = longest > 20 ? 60 : 72;
  const step = Math.round(fontSize * 1.22);
  const startY = 360 - ((lines.length - 1) * step) / 2;
  const titleText = lines
    .map(
      (line, idx) =>
        `<text x="600" y="${startY + idx * step}" font-family="sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(line)}</text>`
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c1728"/>
      <stop offset="1" stop-color="#1b2a44"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g stroke="rgba(255,255,255,0.045)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>
  <rect x="0" y="0" width="1200" height="10" fill="#f97316"/>
  <text x="600" y="250" font-family="sans-serif" font-size="28" font-weight="600" fill="#f97316" letter-spacing="8" text-anchor="middle">${esc(kicker)}</text>
  ${titleText}
  <text x="60" y="580" font-family="sans-serif" font-size="30" font-weight="700" fill="#a7b4c8" letter-spacing="4">SRVSRR</text>
  <text x="1140" y="580" font-family="sans-serif" font-size="24" fill="#a7b4c8" text-anchor="end">srvsrr.dev</text>
</svg>`;
}

for (const cover of covers) {
  const out = join(process.cwd(), 'public', 'images', `cover-${cover.slug}.webp`);
  await sharp(Buffer.from(svg(cover))).resize(1200, 630).webp({ quality: 82 }).toFile(out);
  console.log(`generated ${cover.slug}`);
}