import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'path';
import { ConfigLoader } from '../src/engine/config-loader';

describe('ConfigLoader', () => {
  it('loads harm-prevention, support-pathways, and lucricity manifests', () => {
    const repoRoot = path.resolve(__dirname, '..');
    const loader = new ConfigLoader(repoRoot);
    const manifests = loader.loadAll();

    assert.ok(manifests.harmPrevention, 'harm-prevention.json should load');
    assert.ok(manifests.supportPathways, 'support-pathways.json should load');
    assert.ok(manifests.lucricity, 'lucricity.json should load');
  });
});
