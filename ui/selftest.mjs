#!/usr/bin/env node
// UI server smoke check: project discovery, stage derivation, API shape, path-traversal guard and
// create-project validation. No scaffolding (that runs npm install), no agent, no render.
//   node ui/selftest.mjs
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const workspace = mkdtempSync(join(tmpdir(), 'a2e-ui-'));
process.env.A2E_WORKSPACE = workspace;
process.env.A2E_PORT = '0';

const {server, projectState, createProject} = await import('./serve.mjs');

mkdirSync(join(workspace, 'demo', 'src'), {recursive: true});
mkdirSync(join(workspace, 'demo', 'script'), {recursive: true});
writeFileSync(
  join(workspace, 'demo', 'src', 'config.ts'),
  "export const VIDEO = {\n  slug: 'demo',\n  style: 'instrument' as 'paper' | 'instrument' | 'poster',\n  subtitles: true,\n};\n",
);
writeFileSync(join(workspace, 'demo', 'script', 'narration.txt'), '# CHAPTER 1 Intro\nThe future is already here.\n');

const state = projectState('demo');
assert.equal(state.style, 'instrument', 'style read from config');
assert.equal(state.slug, 'demo');
assert.deepEqual(
  Object.entries(state.stages).filter(([, v]) => v).map(([k]) => k),
  ['scaffold', 'narration'],
  'stage derivation from artifacts',
);
assert.equal(state.done, 2);
assert.match(state.prompt, /anythingtoexplainer/, 'prompt mentions the skill');

await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const api = await (await fetch(`${base}/api/state`)).json();
assert.equal(api.projects.length, 1, 'project listed over HTTP');
assert.equal(api.projects[0].name, 'demo');

const page = await fetch(`${base}/`);
assert.equal(page.status, 200);
assert.match(await page.text(), /anythingtoexplainer/, 'page served');

const traversal = await fetch(`${base}/media/demo/%2e%2e%2f%2e%2e%2fetc%2fpasswd`);
assert.equal(traversal.status, 403, 'path traversal blocked');

assert.throws(() => createProject({topic: '', style: 'paper'}), /topic/, 'empty topic rejected');
assert.throws(() => createProject({topic: 'x', style: 'neon'}), /style/, 'unknown style rejected');
assert.throws(() => createProject({topic: 'demo', style: 'paper'}), /exists/, 'duplicate rejected');

server.close();
console.log('ui selftest ok: discovery, stages, API, traversal guard, create validation');
