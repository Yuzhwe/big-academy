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
// Baseline 01: fail if current entrypoints regress to the obsolete eight-screen lesson.
for (const f of ['AGENTS.md', 'README.md']) {
  const path = resolve(root, f);
  if (!existsSync(path)) { errors.push('Missing project entry: ' + f); continue; }
  const body = readFileSync(path, 'utf8');
  if (!/six (current )?Activity Screens/i.test(body) && !/six Activity Screens/i.test(body)) errors.push(f + ' must state the current six-Activity scope');
  if (/active implementation target is eight Activity Screens|Lesson 1, eight Activity Screens|八屏完整流程/i.test(body)) errors.push(f + ' advertises obsolete eight-screen runtime');
}
const contractPath = resolve(root, 'apps/writing/contracts/components.json');
if (existsSync(contractPath)) {
  try {
    const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
    for (const [k, path] of Object.entries({product: 'apps/writing/PRODUCT.md', design: 'DESIGN.md', tokens: 'packages/design-system/src/tokens.css'})) {
      if (contract.sourceOfTruth?.[k] !== path) errors.push('Contract sourceOfTruth.' + k + ' must be the canonical path');
    }
    const seen = new Set();
    for (const component of contract.components ?? []) {
      if (seen.has(component.id)) errors.push('Duplicate Component ID: ' + component.id);
      seen.add(component.id);
      // Validate unambiguous implementation paths for current implemented components;
      // multi-path legacy commentary and historical composites are reviewed separately.
      if (component.status === 'implemented' && typeof component.implementation === 'string'
          && /^[\\w/.-]+\\.(tsx|ts|css)$/.test(component.implementation)
          && !existsSync(resolve(root, component.implementation))) {
        errors.push('Missing implemented Component path ' + component.id + ': ' + component.implementation);
      }
    }
  } catch (e) { errors.push('Baseline contract references invalid: ' + e.message); }
}

if (errors.length) {
  console.error('P1-A documentation checks failed:\n' + errors.map(e => '- ' + e).join('\n'));
  process.exitCode = 1;
} else {
  console.log('P1-A documentation checks OK: global DESIGN, Writing PRODUCT, Alex source, contracts, HANDOFF, icon/font references');
}
