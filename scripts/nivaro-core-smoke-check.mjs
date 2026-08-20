import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const form = read('components/admin/CasinoForm.tsx');
const adminActions = read('lib/actions/admin.ts');
const compliance = read('lib/nivaro-core/compliance-engine.ts');
const data = read('lib/data.ts');
const route = read('app/api/admin/casino-ai-import/route.ts');
const vercel = JSON.parse(read('vercel.json'));

const checks = [
  ['Casino save forces global visibility off before compliance', /name="visible" value="false"/.test(form) && /visible:\s*false/.test(adminActions)],
  ['Hidden existing casino id can be updated', /name="id" value=\{casino\.id\}/.test(form) && /\.update\(payload\)[\s\S]*?\.eq\("id", id\)/.test(adminActions)],
  ['Global visibility derives from approved market gates', /const anyApproved = results\.some/.test(compliance) && /visible: anyApproved/.test(compliance)],
  ['Unknown visitor markets return no casinos', /if \(!ownerPreview && !market\) return \[\]/.test(data)],
  ['Affiliate resolver preserves blocked destination identity', /resolveAffiliateDestination/.test(route) && /accessLimited/.test(route)],
  ['Private candidate fallback exists for temporary access blocks', /nivaro-private-candidate-v2/.test(route)],
  ['Hourly Nivaro Core cron is configured', vercel.crons?.some((c) => c.path === '/api/nivaro-core/run' && c.schedule === '0 * * * *')],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
