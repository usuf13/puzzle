# 🧩 Picture Crossword — Learn English Words

A kid-friendly web app that generates picture crosswords for learning English
vocabulary. Look at the pictures, write the words!

https://usuf13.github.io/puzzle/

## Features

- **16 themes**: Fruits, Vegetables, Animals, Food, Kitchen, Home, Clothes,
  Transport, School, My Body, Nature, Toys & Games, Colors, Numbers, Jobs,
  Bugs — over 250 words in total.
- **Pronunciation & Ukrainian** — every word can be listened to (English) and
  translated/spoken in Ukrainian, via the bar above the grid or the buttons in
  the word bank. Uses the browser's built-in speech, no API keys.
- **Two picture styles** — flat Twemoji or detailed Fluent Emoji 3D,
  switchable with the 🖼️ button.
- **Fully regenerated every time** — each puzzle picks a random set of words
  from the theme and lays them out in a new random crossword, so your kid can
  play the same theme again and again.
- **Pictures as clues** — every clue is an image (Twemoji artwork) placed
  directly in the grid next to its word, just like on paper worksheets, so the
  child has to recall the English word from the picture.
- **Word bank** — an alphabetical word list to help, just like classic
  worksheets. Solved words get crossed out automatically.
- **Secret word** — bonus numbered cells in the grid spell out a hidden word,
  like in printed crossword worksheets.
- **Check / Hint** — checks answers (wrong letters shake and turn red) and
  reveals a letter when the child is stuck.
- **Celebration** — emoji confetti when the whole puzzle is solved.
- **Print mode** — the Print button produces a clean paper worksheet.
- Works on phones and tablets, no installation and no backend.

## Run it

It is a fully static app — just open `index.html` in a browser, or serve the
folder:

```bash
npx serve .        # or: python3 -m http.server
```

To put it online for free, enable **GitHub Pages** for this repository
(Settings → Pages → deploy from branch) — no build step is needed.

## Tests

```bash
node test/generate.test.js
```

Generates 300 puzzles across all themes and validates grid consistency,
connectivity, numbering and the secret word mapping.

## Credits

- Pictures: [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0) and
  [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT).
  Images are loaded from a CDN with a fallback chain
  Fluent → Twemoji → the device's native emoji.
- Inspired by classic picture-crossword worksheets for kids.
