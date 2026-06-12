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
    cluesTop: document.getElementById('cluesTop'),
    cluesBottom: document.getElementById('cluesBottom'),
    toolsHint: document.getElementById('toolsHint'),
    toolsPic: document.getElementById('toolsPic'),
    btnSay: document.getElementById('btnSay'),
    btnUa: document.getElementById('btnUa'),
    uaWord: document.getElementById('uaWord'),
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
    toolsPl: null,
    secretInBank: false,
    imgStyle: localStorage.getItem('imgStyle') === 'fluent' ? 'fluent' : 'twemoji',
  };

  /* Two picture styles: flat Twemoji and detailed Fluent Emoji 3D.
     Fallback chain: Fluent → Twemoji → native emoji glyph. */
  function twemojiUrl(emoji) {
    let cps = [...emoji].map(ch => ch.codePointAt(0));
    // Twemoji file names drop FE0F except inside ZWJ sequences
    if (!cps.includes(0x200d)) cps = cps.filter(cp => cp !== 0xfe0f);
    const code = cps.map(cp => cp.toString(16)).join('-');
    return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${code}.svg`;
  }

  function fluentUrl(emoji) {
    const meta = typeof FLUENT !== 'undefined' ? FLUENT[emoji] : null;
    if (!meta) return null;
    const name = typeof meta === 'string' ? meta : meta.n;
    const person = typeof meta === 'object' && meta.p;
    const file = name.toLowerCase().replace(/ /g, '_');
    const base = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
    return person
      ? `${base}${encodeURIComponent(name)}/Default/3D/${file}_3d_default.png`
      : `${base}${encodeURIComponent(name)}/3D/${file}_3d.png`;
  }

  function setImgSrc(img) {
    const emoji = img.dataset.emoji;
    const fluent = state.imgStyle === 'fluent' ? fluentUrl(emoji) : null;
    img.dataset.stage = fluent ? 'fluent' : 'twemoji';
    img.src = fluent || twemojiUrl(emoji);
  }

  function emojiImg(emoji, cls) {
    const img = document.createElement('img');
    img.className = cls + ' eimg';
    img.dataset.emoji = emoji;
    img.alt = '';
    img.draggable = false;
    img.addEventListener('error', () => {
      if (img.dataset.stage === 'fluent') {
        img.dataset.stage = 'twemoji';
        img.src = twemojiUrl(emoji);
      } else {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = emoji;
        img.replaceWith(span);
      }
    });
    setImgSrc(img);
    return img;
  }

  function currentTheme() {
    return THEMES.find(t => t.id === state.themeId);
  }

  /* Built-in browser text-to-speech — works offline, no API keys. */
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
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

    p.cells.forEach((cell, idx) => {
      const div = document.createElement('div');
      if (!cell.letter) {
        div.className = 'cell block';
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

  /* Numbered picture cards in two rows framing the grid —
     the number connects the picture to its word in the grid. */
  function renderClueStrips() {
    els.cluesTop.innerHTML = '';
    els.cluesBottom.innerHTML = '';
    const placements = state.puzzle.placements;
    placements.forEach((pl, i) => {
      const li = document.createElement('li');
      li.className = 'pclue';
      li.title = 'Click to jump to this word';
      const num = document.createElement('span');
      num.className = 'pnum';
      num.textContent = pl.number + (pl.dir === ACROSS ? ' →' : ' ↓');
      li.append(emojiImg(pl.emoji, 'pclue-img'), num);
      li.addEventListener('click', () => selectCell(pl.cells[0], pl.dir));
      (i < Math.ceil(placements.length / 2) ? els.cluesTop : els.cluesBottom)
        .appendChild(li);
      pl.clueEl = li;
    });
  }

  function bankRow(entry, isSecret) {
    const word = entry.word.toLowerCase();
    const li = document.createElement('li');
    li.dataset.word = entry.word;
    if (isSecret) li.classList.add('secret-row');
    const say = document.createElement('button');
    say.className = 'bank-say';
    say.type = 'button';
    say.textContent = '🔊';
    say.title = `Listen: ${word}`;
    say.addEventListener('click', () => speak(word, 'en-US'));
    const w = document.createElement('span');
    w.className = 'w';
    w.textContent = (isSecret ? '🔎 ' : '') + word;
    const flag = document.createElement('button');
    flag.className = 'bank-ua';
    flag.type = 'button';
    flag.textContent = '🇺🇦';
    flag.title = `Ukrainian: ${word}`;
    // only one translation is visible at a time
    flag.addEventListener('click', () => {
      const wasOpen = li.classList.contains('ua-show');
      els.wordbank.querySelectorAll('li.ua-show')
        .forEach(row => row.classList.remove('ua-show'));
      if (!wasOpen) {
        li.classList.add('ua-show');
        speak(entry.ua, 'uk-UA');
      }
    });
    const ua = document.createElement('span');
    ua.className = 'ua';
    ua.textContent = entry.ua;
    li.append(say, w, flag, ua);
    return li;
  }

  function renderWordbank() {
    els.wordbank.innerHTML = '';
    state.secretInBank = false;
    const placements = state.puzzle.placements.slice()
      .sort((a, b) => a.word.localeCompare(b.word));
    for (const pl of placements) {
      els.wordbank.appendChild(bankRow(pl, false));
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
      placement.clueEl.classList.toggle('active', placement === pl);
    }
    updateTools(pl);
  }

  /* The Listen / Translate bar follows the selected word. */
  function updateTools(pl) {
    if (pl !== state.toolsPl) {
      state.toolsPl = pl;
      els.uaWord.hidden = true;
      els.uaWord.textContent = '';
    }
    els.btnSay.disabled = !pl;
    els.btnUa.disabled = !pl;
    els.toolsHint.hidden = !!pl;
    els.toolsPic.innerHTML = '';
    if (pl) els.toolsPic.appendChild(emojiImg(pl.emoji, 'tools-img'));
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
    // once found, the secret word joins the word bank for listen/translate
    if (allRight && !state.secretInBank) {
      state.secretInBank = true;
      els.wordbank.appendChild(bankRow(p.secret, true));
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
      pl.clueEl.classList.toggle('done', solved.has(pl.word));
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
    renderClueStrips();
    renderWordbank();
    renderSecret();
    updateHighlights();
  }

  els.btnSay.addEventListener('click', () => {
    const pl = activePlacement();
    if (pl) speak(pl.word.toLowerCase(), 'en-US');
  });

  els.btnUa.addEventListener('click', () => {
    const pl = activePlacement();
    if (!pl) return;
    els.uaWord.textContent = pl.ua;
    els.uaWord.hidden = false;
    speak(pl.ua, 'uk-UA');
  });

  function updateStyleButton() {
    els.btnStyle.textContent =
      state.imgStyle === 'fluent' ? '🖼️ Pictures: 3D' : '🖼️ Pictures: Classic';
  }

  els.btnStyle = document.getElementById('btnStyle');
  els.btnStyle.addEventListener('click', () => {
    state.imgStyle = state.imgStyle === 'fluent' ? 'twemoji' : 'fluent';
    localStorage.setItem('imgStyle', state.imgStyle);
    updateStyleButton();
    document.querySelectorAll('img.eimg').forEach(setImgSrc);
  });
  updateStyleButton();

  document.getElementById('btnClose').addEventListener('click', () => {
    els.overlay.classList.add('hidden');
  });

  document.getElementById('btnNew').addEventListener('click', newPuzzle);
  document.getElementById('btnCheck').addEventListener('click', checkAnswers);
  document.getElementById('btnHint').addEventListener('click', giveHint);
  document.getElementById('btnPrint').addEventListener('click', () => window.print());
  document.getElementById('btnAgain').addEventListener('click', newPuzzle);

  renderThemeChips();
  newPuzzle();
})();
