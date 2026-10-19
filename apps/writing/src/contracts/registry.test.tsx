import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const registryPath = resolve(process.cwd(), 'apps/writing/contracts/components.json');

describe('component registry', () => {
  it('marks the three pilot components implemented and leaves the rest planned', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      status: string;
      components: { id: string; status: string; runtimeEvidence: string | null }[];
    };
    const byId = Object.fromEntries(registry.components.map((component) => [component.id, component]));
    expect(registry.status).toBe('pilot-in-review');
    for (const id of ['BA-UI-001', 'BA-UI-006', 'BA-WR-001']) {
      expect(byId[id]?.status).toBe('implemented');
      expect(byId[id]?.runtimeEvidence).toBe('apps/writing/docs/PILOT_RUNTIME.md');
    }
    expect(byId['BA-UI-001']?.status).not.toBe('approved');
    expect(byId['BA-WR-001']?.status).not.toBe('validated');
    for (const component of registry.components) {
      if (!['BA-UI-001', 'BA-UI-006', 'BA-WR-001'].includes(component.id)) {
        expect(component.status).toBe('planned');
      }
    }
  });
});
