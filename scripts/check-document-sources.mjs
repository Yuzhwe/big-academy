#!/usr/bin/env node
// P1-A documentation authority smoke gate. No dependencies.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = [
  'DESIGN.md',
  'apps/writing/PRODUCT.md',
  'apps/writing/contracts/components.json',
  'apps/writing/source/alex-original.html',
  'docs/HANDOFF.md',
];
let errors = [];
for (const f of required) if (!existsSync(resolve(root, f))) errors.push('Missing required source: ' + f);

const apps = resolve(root, 'apps');
for (const dir of readdirSync(apps, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === 'delivery-hub') continue;
  if (existsSync(resolve(apps, dir.name, 'DESIGN.md')))
    errors.push('App-level DESIGN.md duplicates root authority: apps/' + dir.name + '/DESIGN.md');
}
if (existsSync(resolve(root, 'DESIGN.md'))) {
  const design = readFileSync(resolve(root, 'DESIGN.md'), 'utf8');
  if (!design.includes('Iconoir')) errors.push('Global DESIGN.md does not name approved Iconoir family');
  if (!design.includes('Dosis')) errors.push('Global DESIGN.md omits approved font family');
}
if (existsSync(resolve(root, 'apps/writing/PRODUCT.md'))) {
  const product = readFileSync(resolve(root, 'apps/writing/PRODUCT.md'), 'utf8');
  if (!product.includes('E-01 · Staircase')) errors.push('Writing PRODUCT.md lacks combined E-01 Specification');
}
if (existsSync(resolve(root, 'apps/writing/contracts/components.json'))) {
  try {
    const c = JSON.parse(readFileSync(resolve(root, 'apps/writing/contracts/components.json'), 'utf8'));
    if (!Array.isArray(c.components)) errors.push('Component contract list missing');
  } catch (e) { errors.push('Invalid component registry: ' + e.message); }
}
if (errors.length) {
  console.error('P1-A documentation checks failed:\n' + errors.map(e => '- ' + e).join('\n'));
  process.exitCode = 1;
} else {
  console.log('P1-A documentation checks OK: global DESIGN, Writing PRODUCT, Alex source, contracts, HANDOFF, icon/font references');
}
