// UI regression tests for crossword cell input behaviour.
// Requires the app served at http://127.0.0.1:8123 (e.g. `npx http-server -p 8123`).
//   node test/input.test.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import assert from 'node:assert';

const base = process.env.BASE || 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
const type = async ch => { await page.keyboard.type(ch); await page.waitForTimeout(40); };

// 1. A wrong letter can be replaced by typing over it, no manual clearing.
const idx = await page.evaluate(() => {
  const { state, ACROSS } = window.__cw;
  const i = state.puzzle.cells.findIndex((c, j) => c.letter && state.inputs[j]);
  window.__cw.selectCell(i, ACROSS);
  return i;
});
await type('Q');
await page.click('#btnCheck');
await page.evaluate(i => window.__cw.selectCell(i, window.__cw.ACROSS), idx);
await type('Z');
assert.strictEqual(
  await page.evaluate(i => window.__cw.state.inputs[i].value, idx), 'Z',
  'typing over a wrong letter should replace it');

// 2. Auto-advance skips cells already filled by a crossing word, and starting
//    a word from its clue lands on the first empty cell (not the shared one).
const cross = await page.evaluate(() => {
  const { state } = window.__cw;
  const owner = new Map();
  for (const pl of state.puzzle.placements)
    for (const c of pl.cells) (owner.get(c) || owner.set(c, []).get(c)).push(pl);
  let shared = -1, B = null;
  for (const [c, pls] of owner) if (pls.length === 2) { shared = c; B = pls[1]; break; }
  if (shared < 0) return null;
  state.inputs.forEach(inp => { if (inp) { inp.value = ''; inp.dataset.prev = ''; } });
  state.inputs[shared].value = state.puzzle.cells[shared].letter;
  state.inputs[shared].dataset.prev = state.inputs[shared].value;
  window.__cw.selectWord(B);
  return { shared, len: B.cells.length, start: state.activeIdx,
           letter: state.puzzle.cells[shared].letter };
});
assert.ok(cross, 'puzzle should contain at least one crossing');
assert.notStrictEqual(cross.start, cross.shared,
  'selectWord should skip the already-filled crossing cell');

let stoppedOnShared = false;
for (let n = 0; n < cross.len; n++) {
  const active = await page.evaluate(() => window.__cw.state.activeIdx);
  if (active === cross.shared && n > 0) stoppedOnShared = true;
  await type('A');
}
assert.ok(!stoppedOnShared, 'auto-advance should skip the filled crossing cell');
assert.strictEqual(
  await page.evaluate(i => window.__cw.state.inputs[i].value, cross.shared), cross.letter,
  'the crossing letter must stay intact while typing the second word');

assert.strictEqual(errors.length, 0, 'page errors: ' + errors.join('; '));
await browser.close();
console.log('Input behaviour tests passed.');
