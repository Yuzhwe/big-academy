import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const registryPath = resolve(process.cwd(), 'apps/writing/contracts/components.json');

describe('component registry', () => {
  it('keeps the pilot theme temporary and marks only the slice composites implemented', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      status: string;
      components: { id: string; status: string; visualStatus?: string; runtimeEvidence: string | null }[];
    };
    const byId = Object.fromEntries(registry.components.map((component) => [component.id, component]));
    expect(registry.status).toBe('pilot-in-review');
    for (const id of ['BA-UI-001', 'BA-UI-006', 'BA-WR-001']) {
      expect(byId[id]?.status).toBe('implemented');
      expect(byId[id]?.runtimeEvidence).toBe('apps/writing/docs/PILOT_RUNTIME.md');
    }
    expect(byId['BA-UI-001']?.status).not.toBe('approved');
    expect(byId['BA-WR-001']?.status).not.toBe('validated');
    for (const id of ['BA-WR-002', 'BA-WR-005', 'BA-WR-006']) {
      expect(byId[id]?.status).toBe('implemented');
      expect(byId[id]?.visualStatus).toBe('candidate-warm-frame');
      expect(byId[id]?.status).not.toBe('validated');
    }
    for (const component of registry.components) {
      if (!['BA-UI-001', 'BA-UI-006', 'BA-WR-001', 'BA-WR-002', 'BA-WR-005', 'BA-WR-006'].includes(component.id)) {
        expect(component.status).toBe('planned');
      }
      expect(component.status).not.toBe('validated');
    }
  });
});
