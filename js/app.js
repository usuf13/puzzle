/* Picture Crossword app: theme picker, grid interaction, checking,
   hints, secret word and the win celebration. */

(function () {
  'use strict';

  const { ACROSS, DOWN } = Crossword;

  const els = {
    themes: document.getElementById('themes'),
    themeTitle: document.getElementById('themeTitle'),
    grid: document.getElementById('grid'),
    secret: document.getElementById('secret'),
    wordbank: document.getElementById('wordbank'),
    extraClues: document.getElementById('extraClues'),
    overlay: document.getElementById('overlay'),
    confetti: document.getElementById('confetti'),
    winText: document.getElementById('winText'),
  };

  const state = {
    themeId: THEMES[0].id,
    puzzle: null,
    inputs: [],     // idx -> <input> | null
    at: [],         // idx -> { [ACROSS]: placement, [DOWN]: placement }
    activeIdx: null,
    dir: ACROSS,
    won: false,
  };

  /* Twemoji picture for an emoji, with the native glyph as fallback. */
  function emojiImg(emoji, cls) {
    const code = [...emoji]
      .map(ch => ch.codePointAt(0))
      .filter(cp => cp !== 0xfe0f)
      .map(cp => cp.toString(16))
      .join('-');
    const img = document.createElement('img');
    img.className = cls;
    img.alt = '';
    img.draggable = false;
    img.src = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${code}.svg`;
    img.addEventListener('error', () => {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = emoji;
      img.replaceWith(span);
    });
    return img;
  }

  function currentTheme() {
    return THEMES.find(t => t.id === state.themeId);
  }

  /* ---------- rendering ---------- */

  function renderThemeChips() {
    els.themes.innerHTML = '';
    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.className = 'chip' + (theme.id === state.themeId ? ' active' : '');
      btn.style.setProperty('--chip', theme.color);
      const icon = document.createElement('span');
      icon.className = 'chip-icon';
      icon.textContent = theme.icon;
      btn.append(icon, document.createTextNode(theme.name));
      btn.addEventListener('click', () => {
        state.themeId = theme.id;
        renderThemeChips();
        newPuzzle();
      });
      els.themes.appendChild(btn);
    }
  }

  function applyThemeColor() {
    const theme = currentTheme();
    document.documentElement.style.setProperty('--theme', theme.color);
    document.documentElement.style.setProperty(
      '--theme-soft', `color-mix(in srgb, ${theme.color} 14%, white)`);
    els.themeTitle.textContent = `${theme.icon} ${theme.name}`;
  }

  function renderGrid() {
    const p = state.puzzle;
    els.grid.innerHTML = '';
    els.grid.style.setProperty('--cols', p.width);
    state.inputs = new Array(p.cells.length).fill(null);

    const byPic = new Map(
      p.placements.filter(pl => pl.picIdx != null).map(pl => [pl.picIdx, pl]));

    p.cells.forEach((cell, idx) => {
      const div = document.createElement('div');
      if (!cell.letter) {
        if (cell.pic) {
          const pl = byPic.get(idx);
          div.className = 'cell pic';
          div.title = 'Click to jump to this word';
          const num = document.createElement('span');
          num.className = 'pic-num';
          num.textContent = cell.pic.number;
          div.append(emojiImg(cell.pic.emoji, 'pic-img'), num);
          div.addEventListener('click', () => selectCell(pl.cells[0], pl.dir));
          pl.picEl = div;
        } else if (cell.decor) {
          div.className = 'cell decor';
          div.style.setProperty('--rot', (Math.random() * 26 - 13).toFixed(0) + 'deg');
          div.appendChild(emojiImg(cell.decor, 'decor-img'));
        } else {
          div.className = 'cell block';
        }
        els.grid.appendChild(div);
        return;
      }
      div.className = 'cell';
      if (cell.number) {
        const num = document.createElement('span');
        num.className = 'num';
        num.textContent = cell.number;
        div.appendChild(num);
      }
      if (cell.secretIndex != null) {
        const badge = document.createElement('span');
        badge.className = 'secret-badge';
        badge.textContent = cell.secretIndex + 1;
        div.appendChild(badge);
      }
      const input = document.createElement('input');
      input.type = 'text';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('autocapitalize', 'characters');
      input.setAttribute('aria-label', `Row ${Math.floor(idx / p.width) + 1}, column ${idx % p.width + 1}`);
      input.addEventListener('focus', () => handleCellFocus(idx));
      input.addEventListener('pointerdown', () => handleCellPointer(idx));
      input.addEventListener('input', () => handleInput(idx));
      input.addEventListener('keydown', e => handleKeydown(e, idx));
      div.appendChild(input);
      state.inputs[idx] = input;
      els.grid.appendChild(div);
    });

    state.at = p.cells.map(() => ({}));
    for (const pl of p.placements) {
      for (const idx of pl.cells) state.at[idx][pl.dir] = pl;
    }
  }

  /* Clues whose picture did not fit next to the word in the grid
     (rare) are listed in a strip under the grid instead. */
  function renderExtraClues() {
    const leftovers = state.puzzle.placements.filter(pl => pl.picIdx == null);
    els.extraClues.innerHTML = '';
    els.extraClues.hidden = leftovers.length === 0;
    for (const pl of leftovers) {
      const li = document.createElement('li');
      const num = document.createElement('span');
      num.className = 'clue-num';
      num.textContent = pl.number + (pl.dir === ACROSS ? ' →' : ' ↓');
      li.append(num, emojiImg(pl.emoji, 'clue-img'));
      li.title = 'Click to jump to this word';
      li.addEventListener('click', () => selectCell(pl.cells[0], pl.dir));
      els.extraClues.appendChild(li);
      pl.clueEl = li;
    }
  }

  function renderWordbank() {
    els.wordbank.innerHTML = '';
    const words = state.puzzle.placements
      .map(pl => pl.word.toLowerCase())
      .sort();
    for (const word of words) {
      const li = document.createElement('li');
      li.textContent = word;
      li.dataset.word = word.toUpperCase();
      els.wordbank.appendChild(li);
    }
  }

  function renderSecret() {
    const p = state.puzzle;
    els.secret.innerHTML = '';
    els.secret.classList.remove('solved');
    if (!p.secret) return;
    const title = document.createElement('div');
    title.className = 'secret-title';
    title.textContent = '🔎 Find the secret word!';
    const boxes = document.createElement('div');
    boxes.className = 'boxes';
    p.secret.cells.forEach((cellIdx, i) => {
      const box = document.createElement('div');
      box.className = 'sbox';
      const label = document.createElement('span');
      label.className = 'slabel';
      label.textContent = i + 1;
      const letter = document.createElement('span');
      letter.className = 'sletter';
      letter.dataset.cell = cellIdx;
      box.append(label, letter);
      boxes.appendChild(box);
    });
    els.secret.append(title, boxes);
  }

  /* ---------- selection & highlighting ---------- */

  function selectCell(idx, dirPref) {
    const here = state.at[idx];
    let dir = dirPref;
    if (!here[dir]) dir = dir === ACROSS ? DOWN : ACROSS;
    if (!here[dir]) return;
    state.activeIdx = idx;
    state.dir = dir;
    updateHighlights();
    const input = state.inputs[idx];
    if (input && document.activeElement !== input) input.focus({ preventScroll: false });
  }

  function activePlacement() {
    if (state.activeIdx == null) return null;
    return state.at[state.activeIdx][state.dir] || null;
  }

  function updateHighlights() {
    const pl = activePlacement();
    state.inputs.forEach((input, idx) => {
      if (!input) return;
      const cellEl = input.parentElement;
      cellEl.classList.toggle('active', !!pl && pl.cells.includes(idx));
      cellEl.classList.toggle('focus', idx === state.activeIdx);
    });
    for (const placement of state.puzzle.placements) {
      const el = placement.picEl || placement.clueEl;
      if (el) el.classList.toggle('active', placement === pl);
    }
  }

  /* ---------- input handling ---------- */

  function handleCellPointer(idx) {
    // toggle direction when tapping the already-selected cell
    if (idx === state.activeIdx) {
      const here = state.at[idx];
      const other = state.dir === ACROSS ? DOWN : ACROSS;
      if (here[other]) state.dir = other;
      updateHighlights();
    }
  }

  function handleCellFocus(idx) {
    if (idx !== state.activeIdx) selectCell(idx, state.dir);
  }

  function handleInput(idx) {
    const input = state.inputs[idx];
    const match = input.value.toUpperCase().match(/[A-Z]/g);
    input.value = match ? match[match.length - 1] : '';
    input.parentElement.classList.remove('wrong', 'right', 'revealed');
    if (input.value) {
      const pl = activePlacement();
      if (pl) {
        const pos = pl.cells.indexOf(idx);
        if (pos > -1 && pos < pl.cells.length - 1) {
          selectCell(pl.cells[pos + 1], state.dir);
        }
      }
    }
    afterChange();
  }

  function handleKeydown(e, idx) {
    const p = state.puzzle;
    const input = state.inputs[idx];

    if (e.key === 'Backspace' && !input.value) {
      const pl = activePlacement();
      if (pl) {
        const pos = pl.cells.indexOf(idx);
        if (pos > 0) {
          const prev = pl.cells[pos - 1];
          state.inputs[prev].value = '';
          state.inputs[prev].parentElement.classList.remove('wrong', 'right', 'revealed');
          selectCell(prev, state.dir);
          afterChange();
        }
      }
      e.preventDefault();
      return;
    }

    const moves = {
      ArrowLeft: [0, -1], ArrowRight: [0, 1],
      ArrowUp: [-1, 0], ArrowDown: [1, 0],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const [dr, dc] = move;
    let r = Math.floor(idx / p.width);
    let c = idx % p.width;
    while (true) {
      r += dr;
      c += dc;
      if (r < 0 || c < 0 || r >= p.height || c >= p.width) return;
      const next = r * p.width + c;
      if (state.inputs[next]) {
        const wantDir = dr !== 0 ? DOWN : ACROSS;
        selectCell(next, state.at[next][wantDir] ? wantDir : state.dir);
        return;
      }
    }
  }

  /* ---------- progress ---------- */

  function afterChange() {
    updateSecret();
    updateWordbank();
    checkWin();
  }

  function updateSecret() {
    const p = state.puzzle;
    if (!p.secret) return;
    let allRight = true;
    els.secret.querySelectorAll('.sletter').forEach(slot => {
      const cellIdx = Number(slot.dataset.cell);
      const value = state.inputs[cellIdx].value;
      slot.textContent = value;
      if (value !== p.cells[cellIdx].letter) allRight = false;
    });
    els.secret.classList.toggle('solved', allRight);
    const old = els.secret.querySelector('.sreveal');
    if (allRight && !old) {
      els.secret.querySelector('.boxes').appendChild(emojiImg(p.secret.emoji, 'sreveal'));
    } else if (!allRight && old) {
      old.remove();
    }
  }

  function wordSolved(pl) {
    return pl.cells.every(idx => state.inputs[idx].value === state.puzzle.cells[idx].letter);
  }

  function updateWordbank() {
    const solved = new Set(
      state.puzzle.placements.filter(wordSolved).map(pl => pl.word));
    els.wordbank.querySelectorAll('li').forEach(li => {
      li.classList.toggle('done', solved.has(li.dataset.word));
    });
    for (const pl of state.puzzle.placements) {
      const el = pl.picEl || pl.clueEl;
      if (el) el.classList.toggle('done', solved.has(pl.word));
    }
  }

  function checkWin() {
    if (state.won) return;
    const done = state.puzzle.cells.every((cell, idx) =>
      !cell.letter || state.inputs[idx].value === cell.letter);
    if (!done) return;
    state.won = true;
    celebrate();
  }

  function celebrate() {
    const theme = currentTheme();
    els.winText.textContent = state.puzzle.secret
      ? `You found all the words — and the secret word ${state.puzzle.secret.word} ${state.puzzle.secret.emoji}!`
      : 'You found all the words!';
    els.confetti.innerHTML = '';
    const pool = theme.words.map(w => w.e).concat(['🎉', '⭐', '🎊']);
    for (let i = 0; i < 36; i++) {
      const span = document.createElement('span');
      span.textContent = pool[Math.floor(Math.random() * pool.length)];
      span.style.left = Math.random() * 100 + '%';
      span.style.animationDuration = 2.5 + Math.random() * 3 + 's';
      span.style.animationDelay = -Math.random() * 4 + 's';
      els.confetti.appendChild(span);
    }
    els.overlay.classList.remove('hidden');
  }

  /* ---------- buttons ---------- */

  function checkAnswers() {
    state.inputs.forEach((input, idx) => {
      if (!input || !input.value) return;
      const ok = input.value === state.puzzle.cells[idx].letter;
      input.parentElement.classList.toggle('wrong', !ok);
      input.parentElement.classList.toggle('right', ok);
    });
  }

  function giveHint() {
    let idx = state.activeIdx;
    const isEmptyOrWrong = i =>
      state.inputs[i] && state.inputs[i].value !== state.puzzle.cells[i].letter;
    if (idx == null || !isEmptyOrWrong(idx)) {
      idx = state.puzzle.cells.findIndex((cell, i) => cell.letter && isEmptyOrWrong(i));
      if (idx === -1) return;
    }
    const input = state.inputs[idx];
    input.value = state.puzzle.cells[idx].letter;
    input.parentElement.classList.remove('wrong', 'right');
    input.parentElement.classList.add('revealed');
    selectCell(idx, state.dir);
    afterChange();
  }

  function newPuzzle() {
    const theme = currentTheme();
    state.puzzle = Crossword.generate(theme.words, { wordCount: 10 });
    state.activeIdx = null;
    state.dir = ACROSS;
    state.won = false;
    els.overlay.classList.add('hidden');
    applyThemeColor();
    renderGrid();
    renderExtraClues();
    renderWordbank();
    renderSecret();
    updateHighlights();
  }

  document.getElementById('btnNew').addEventListener('click', newPuzzle);
  document.getElementById('btnCheck').addEventListener('click', checkAnswers);
  document.getElementById('btnHint').addEventListener('click', giveHint);
  document.getElementById('btnPrint').addEventListener('click', () => window.print());
  document.getElementById('btnAgain').addEventListener('click', newPuzzle);

  renderThemeChips();
  newPuzzle();
})();
