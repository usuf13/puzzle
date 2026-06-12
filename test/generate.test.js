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

let total = 0;
for (const theme of THEMES) {
  for (let i = 0; i < 25; i++) {
    const p = generate(theme.words, { wordCount: 10 });
    total++;

    assert.ok(p.placements.length >= 6,
      `${theme.id}: only ${p.placements.length} words placed`);
    assert.ok(p.width <= 15 && p.height <= 15,
      `${theme.id}: grid too big ${p.width}x${p.height}`);

    // the outer ring is reserved for pictures — no letters there
    for (let r = 0; r < p.height; r++) {
      for (let c = 0; c < p.width; c++) {
        if (r === 0 || c === 0 || r === p.height - 1 || c === p.width - 1) {
          assert.ok(!p.cells[r * p.width + c].letter,
            `${theme.id}: letter on the border ring`);
        }
      }
    }

    // nearly every clue picture must sit in the grid, touching its word
    const unplaced = p.placements.filter(pl => pl.picIdx == null);
    assert.ok(unplaced.length <= 2,
      `${theme.id}: ${unplaced.length} clue pictures did not fit`);
    const picCells = new Set();
    for (const pl of p.placements) {
      if (pl.picIdx == null) continue;
      assert.ok(!picCells.has(pl.picIdx), `${theme.id}: two pictures share a cell`);
      picCells.add(pl.picIdx);
      const cell = p.cells[pl.picIdx];
      assert.ok(cell.pic && !cell.letter, `${theme.id}: picture on a letter cell`);
      assert.strictEqual(cell.pic.number, pl.number);
      const pr = Math.floor(pl.picIdx / p.width);
      const pc = pl.picIdx % p.width;
      const near = pl.cells.some(idx => {
        const r = Math.floor(idx / p.width);
        const c = idx % p.width;
        return Math.abs(r - pr) <= 1 && Math.abs(c - pc) <= 1;
      });
      assert.ok(near, `${theme.id}: picture for ${pl.word} is not next to the word`);
    }

    // decorations must not touch letters or clue pictures
    p.cells.forEach((cell, idx) => {
      if (!cell.decor) return;
      const r = Math.floor(idx / p.width);
      const c = idx % p.width;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= p.height || cc >= p.width) continue;
          const n = p.cells[rr * p.width + cc];
          assert.ok(!n.letter && !n.pic, `${theme.id}: decoration touches the puzzle`);
        }
      }
    });

    // every placement's letters must match the grid cells
    for (const pl of p.placements) {
      assert.strictEqual(pl.cells.length, pl.word.length);
      pl.cells.forEach((idx, j) => {
        assert.strictEqual(p.cells[idx].letter, pl.word[j],
          `${theme.id}: letter mismatch in ${pl.word}`);
      });
      assert.ok(pl.number >= 1, `${theme.id}: missing clue number for ${pl.word}`);
    }

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
