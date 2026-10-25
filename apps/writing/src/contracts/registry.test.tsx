import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const registryPath = resolve(process.cwd(), 'apps/writing/contracts/components.json');

describe('component registry', () => {
  it('tracks implemented source-backed components separately from visual approval', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      status: string;
      components: { id: string; status: string; visualStatus?: string; runtimeEvidence: string | null }[];
    };
    const byId = Object.fromEntries(registry.components.map((component) => [component.id, component]));
    expect(registry.status).toBe('pilot-in-review');
    for (const id of ['BA-UI-001', 'BA-UI-006', 'BA-WR-001']) {
      expect(byId[id]?.status).toBe('implemented');
      expect(byId[id]?.runtimeEvidence).toBe(id === 'BA-WR-001' ? 'apps/writing/docs/INTEGRATION_V1.md' : 'apps/writing/docs/PILOT_RUNTIME.md');
    }
    expect(byId['BA-UI-001']?.status).not.toBe('approved');
    expect(byId['BA-WR-001']?.status).not.toBe('validated');
    for (const id of ['BA-WR-002', 'BA-WR-005', 'BA-WR-006']) {
      expect(byId[id]?.status).toBe('implemented');
      expect(byId[id]?.status).not.toBe('validated');
    }
    expect(byId['BA-WR-002']?.visualStatus).toBe('pending-review');
    expect(byId['BA-WR-005']?.visualStatus).toContain('in-review');
    expect(byId['BA-WR-006']?.visualStatus).toContain('in-review');
    expect(byId['BA-UI-003']?.visualStatus).toContain('in-review');
    const implemented = new Set([
      'BA-UI-001', 'BA-UI-002', 'BA-UI-003', 'BA-UI-006', 'BA-UI-008', 'BA-UI-009', 'BA-UI-010', 'BA-UI-011',
      'BA-WR-001', 'BA-WR-002', 'BA-WR-003', 'BA-WR-004', 'BA-WR-005', 'BA-WR-006', 'BA-WR-007', 'BA-WR-009', 'BA-WR-010',
    ]);
    for (const component of registry.components) {
      if (component.id === 'BA-WR-010') expect(component.status).toBe('implemented-interim-scene-and-story-decoration');
      else if (implemented.has(component.id)) expect(component.status).toBe('implemented');
      else expect(['planned', 'specified-not-implemented']).toContain(component.status);
      // Engineering implementation is not final designer visual acceptance.
      expect(component.status).not.toBe('validated');
      expect(component.status).not.toBe('approved');
    }
  });
});
