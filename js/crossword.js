/* Crossword layout generator.
   Takes a theme word list and returns a fresh random puzzle:
   a cropped grid, numbered word placements (across/down) and a
   bonus "secret word" mapped onto cells of the grid. */

(function (global) {
  'use strict';

  const ACROSS = 0;
  const DOWN = 1;
  const MAX_SPAN = 13; // soft cap on grid width/height (before the picture ring)

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const key = (r, c) => r + ',' + c;

  /* Returns the number of crossings for a valid placement, or -1. */
  function canPlace(grid, word, r, c, dir) {
    const dr = dir === DOWN ? 1 : 0;
    const dc = dir === ACROSS ? 1 : 0;
    if (grid.has(key(r - dr, c - dc))) return -1;
    if (grid.has(key(r + dr * word.length, c + dc * word.length))) return -1;
    let crosses = 0;
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const existing = grid.get(key(rr, cc));
      if (existing !== undefined) {
        if (existing !== word[i]) return -1;
        crosses++;
      } else if (grid.has(key(rr + dc, cc + dr)) || grid.has(key(rr - dc, cc - dr))) {
        return -1; // would touch a parallel word
      }
    }
    if (crosses === 0 || crosses === word.length) return -1;
    return crosses;
  }

  function bounds(grid) {
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    for (const k of grid.keys()) {
      const [r, c] = k.split(',').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }
    return { minR, maxR, minC, maxC };
  }

  function spanAfter(grid, word, r, c, dir) {
    const b = bounds(grid);
    const endR = dir === DOWN ? r + word.length - 1 : r;
    const endC = dir === ACROSS ? c + word.length - 1 : c;
    const h = Math.max(b.maxR, endR) - Math.min(b.minR, r) + 1;
    const w = Math.max(b.maxC, endC) - Math.min(b.minC, c) + 1;
    return Math.max(h, w);
  }

  function findPlacements(grid, word) {
    const options = [];
    const seen = new Set();
    for (const [k, letter] of grid) {
      const [r, c] = k.split(',').map(Number);
      for (let i = 0; i < word.length; i++) {
        if (word[i] !== letter) continue;
        for (const dir of [ACROSS, DOWN]) {
          const r0 = dir === DOWN ? r - i : r;
          const c0 = dir === ACROSS ? c - i : c;
          const id = r0 + ',' + c0 + ',' + dir;
          if (seen.has(id)) continue;
          seen.add(id);
          const crosses = canPlace(grid, word, r0, c0, dir);
          if (crosses > 0 && spanAfter(grid, word, r0, c0, dir) <= MAX_SPAN) {
            options.push({ r: r0, c: c0, dir, crosses });
          }
        }
      }
    }
    return options;
  }

  function build(pool, wordCount) {
    const grid = new Map();
    const placements = [];
    for (const entry of pool) {
      if (placements.length >= wordCount) break;
      const word = entry.w.toUpperCase();
      let spot = null;
      if (placements.length === 0) {
        spot = { r: 0, c: 0, dir: Math.random() < 0.5 ? ACROSS : DOWN, crosses: 0 };
      } else {
        const options = findPlacements(grid, word);
        if (options.length === 0) continue;
        const best = Math.max(...options.map(o => o.crosses));
        const top = options.filter(o => o.crosses === best);
        spot = top[Math.floor(Math.random() * top.length)];
      }
      const dr = spot.dir === DOWN ? 1 : 0;
      const dc = spot.dir === ACROSS ? 1 : 0;
      for (let i = 0; i < word.length; i++) {
        grid.set(key(spot.r + dr * i, spot.c + dc * i), word[i]);
      }
      placements.push({ word, emoji: entry.e, row: spot.r, col: spot.c, dir: spot.dir });
    }
    return { grid, placements };
  }

  function score(layout) {
    const { grid, placements } = layout;
    const letters = placements.reduce((n, p) => n + p.word.length, 0);
    const crossings = letters - grid.size;
    const b = bounds(grid);
    const h = b.maxR - b.minR + 1;
    const w = b.maxC - b.minC + 1;
    return placements.length * 1000 + crossings * 10 - Math.max(w, h) * 5 - Math.abs(w - h) * 3;
  }

  function pickSecret(entries, placements, cells, width) {
    const placed = new Set(placements.map(p => p.word));
    const candidates = shuffle(
      entries.filter(e => !placed.has(e.w.toUpperCase()) && e.w.length >= 3 && e.w.length <= 8)
    );
    for (const entry of candidates) {
      const word = entry.w.toUpperCase();
      const used = new Set();
      const picked = [];
      let ok = true;
      for (const letter of word) {
        const matches = [];
        cells.forEach((cell, idx) => {
          if (cell.letter === letter && !used.has(idx)) matches.push(idx);
        });
        if (matches.length === 0) { ok = false; break; }
        const idx = matches[Math.floor(Math.random() * matches.length)];
        used.add(idx);
        picked.push(idx);
      }
      if (ok) {
        picked.forEach((idx, i) => { cells[idx].secretIndex = i; });
        return { word, emoji: entry.e, cells: picked };
      }
    }
    return null;
  }

  /* Puts each clue picture into an empty cell touching its word —
     the cell just before the word is guaranteed empty, the ring of
     padding around the grid guarantees it is in bounds. */
  function assignClueImages(placements, cells, width, height) {
    const used = new Set();
    const isFree = (r, c) =>
      r >= 0 && c >= 0 && r < height && c < width &&
      !cells[r * width + c].letter && !used.has(r * width + c);
    for (const p of placements) {
      const len = p.word.length;
      const cands = p.dir === ACROSS
        ? [[p.row, p.col - 1], [p.row, p.col + len],
           [p.row - 1, p.col - 1], [p.row + 1, p.col - 1]]
        : [[p.row - 1, p.col], [p.row + len, p.col],
           [p.row - 1, p.col - 1], [p.row - 1, p.col + 1]];
      const spot = cands.find(([r, c]) => isFree(r, c));
      if (spot) {
        const idx = spot[0] * width + spot[1];
        used.add(idx);
        cells[idx].pic = { emoji: p.emoji, number: p.number, dir: p.dir };
        p.picIdx = idx;
      } else {
        p.picIdx = null;
      }
    }
  }

  /* Sprinkles a few decorative theme pictures into empty corners,
     away from letters and clue pictures so they can't be mistaken
     for clues. */
  function assignDecorations(entries, placements, cells, width, height, count) {
    const placed = new Set(placements.map(p => p.word));
    let pool = entries.filter(e => !placed.has(e.w.toUpperCase()));
    if (pool.length === 0) pool = entries;
    const free = [];
    cells.forEach((cell, idx) => {
      if (cell.letter || cell.pic) return;
      const r = Math.floor(idx / width);
      const c = idx % width;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= height || cc >= width) continue;
          const n = cells[rr * width + cc];
          if (n.letter || n.pic) return;
        }
      }
      free.push(idx);
    });
    shuffle(free);
    const picked = [];
    for (const idx of free) {
      if (picked.length >= count) break;
      const r = Math.floor(idx / width);
      const c = idx % width;
      const tooClose = picked.some(p2 =>
        Math.abs(Math.floor(p2 / width) - r) < 2 && Math.abs(p2 % width - c) < 2);
      if (tooClose) continue;
      picked.push(idx);
      cells[idx].decor = pool[Math.floor(Math.random() * pool.length)].e;
    }
  }

  function finalize(layout, entries) {
    const { grid, placements } = layout;
    const b = bounds(grid);
    // one empty ring around the letters leaves room for clue pictures
    const offR = b.minR - 1;
    const offC = b.minC - 1;
    const width = b.maxC - b.minC + 3;
    const height = b.maxR - b.minR + 3;
    const cells = Array.from({ length: width * height }, () => ({ letter: null }));
    for (const [k, letter] of grid) {
      const [r, c] = k.split(',').map(Number);
      cells[(r - offR) * width + (c - offC)].letter = letter;
    }

    const starts = new Map();
    for (const p of placements) {
      p.row -= offR;
      p.col -= offC;
      const dr = p.dir === DOWN ? 1 : 0;
      const dc = p.dir === ACROSS ? 1 : 0;
      p.cells = Array.from({ length: p.word.length },
        (_, i) => (p.row + dr * i) * width + (p.col + dc * i));
      const k = key(p.row, p.col);
      if (!starts.has(k)) starts.set(k, []);
      starts.get(k).push(p);
    }

    let num = 0;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const ps = starts.get(key(r, c));
        if (ps) {
          num++;
          cells[r * width + c].number = num;
          ps.forEach(p => { p.number = num; });
        }
      }
    }

    placements.sort((a, b2) => a.number - b2.number || a.dir - b2.dir);
    assignClueImages(placements, cells, width, height);
    assignDecorations(entries, placements, cells, width, height, 4);
    const secret = pickSecret(entries, placements, cells, width);
    return { width, height, cells, placements, secret };
  }

  /* entries: [{w: 'apple', e: '🍎'}, ...]  */
  function generate(entries, opts = {}) {
    const wordCount = opts.wordCount || 10;
    const tries = opts.tries || 30;
    let best = null;
    let bestScore = -Infinity;
    for (let t = 0; t < tries; t++) {
      const layout = build(shuffle(entries.slice()), wordCount);
      const s = score(layout);
      if (s > bestScore) { bestScore = s; best = layout; }
    }
    return finalize(best, entries);
  }

  const api = { generate, ACROSS, DOWN };
  if (typeof module !== 'undefined') module.exports = api;
  global.Crossword = api;
})(typeof window !== 'undefined' ? window : globalThis);
