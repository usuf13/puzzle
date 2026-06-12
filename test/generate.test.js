/* Sanity tests for the crossword generator. Run: node test/generate.test.js */

const assert = require('node:assert');
const { THEMES } = require('../js/data.js');
const { generate } = require('../js/crossword.js');

function renderAscii(p) {
  let out = '';
  for (let r = 0; r < p.height; r++) {
    let line = '';
    for (let c = 0; c < p.width; c++) {
      line += (p.cells[r * p.width + c].letter || '·') + ' ';
    }
    out += line + '\n';
  }
  return out;
}

// every word must have an emoji and a Ukrainian translation
for (const theme of THEMES) {
  for (const entry of theme.words) {
    assert.ok(entry.e, `${theme.id}/${entry.w}: missing emoji`);
    assert.ok(entry.u && entry.u.length > 0, `${theme.id}/${entry.w}: missing translation`);
    assert.match(entry.w, /^[a-z]+$/, `${theme.id}/${entry.w}: word must be a-z only`);
  }
}

let total = 0;
for (const theme of THEMES) {
  for (let i = 0; i < 25; i++) {
    const p = generate(theme.words, { wordCount: 10 });
    total++;

    assert.ok(p.placements.length >= 6,
      `${theme.id}: only ${p.placements.length} words placed`);
    assert.ok(p.width <= 13 && p.height <= 13,
      `${theme.id}: grid too big ${p.width}x${p.height}`);

    // every placement's letters must match the grid cells
    for (const pl of p.placements) {
      assert.strictEqual(pl.cells.length, pl.word.length);
      pl.cells.forEach((idx, j) => {
        assert.strictEqual(p.cells[idx].letter, pl.word[j],
          `${theme.id}: letter mismatch in ${pl.word}`);
      });
      assert.ok(pl.number >= 1, `${theme.id}: missing clue number for ${pl.word}`);
    }

    // clue numbers are unique — one number always means one word
    const nums = p.placements.map(pl => pl.number);
    assert.strictEqual(new Set(nums).size, nums.length,
      `${theme.id}: duplicate clue numbers`);
    assert.ok(p.placements.every(pl => pl.ua),
      `${theme.id}: placement missing translation`);

    // every word after the first must cross at least one other word
    const counts = new Map();
    for (const pl of p.placements) {
      for (const idx of pl.cells) counts.set(idx, (counts.get(idx) || 0) + 1);
    }
    if (p.placements.length > 1) {
      for (const pl of p.placements) {
        assert.ok(pl.cells.some(idx => counts.get(idx) > 1),
          `${theme.id}: ${pl.word} is not connected`);
      }
    }

    // secret word must map to real grid cells with the right letters
    if (p.secret) {
      assert.ok(p.secret.ua, `${theme.id}: secret word missing translation`);
      const seen = new Set();
      p.secret.cells.forEach((idx, j) => {
        assert.ok(!seen.has(idx), 'secret reuses a cell');
        seen.add(idx);
        assert.strictEqual(p.cells[idx].letter, p.secret.word[j],
          `${theme.id}: secret letter mismatch`);
        assert.strictEqual(p.cells[idx].secretIndex, j);
      });
    }
  }
}

const sample = generate(THEMES[0].words, { wordCount: 10 });
console.log(`Sample "${THEMES[0].name}" puzzle (${sample.placements.length} words, ` +
  `${sample.width}x${sample.height}, secret: ${sample.secret ? sample.secret.word : 'none'}):\n`);
console.log(renderAscii(sample));
console.log(`All ${total} generated puzzles passed.`);
