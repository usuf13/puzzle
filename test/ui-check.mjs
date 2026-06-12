// Manual UI verification: loads the app, fills the puzzle via the solution,
// checks the win overlay appears, and saves screenshots. Not part of CI.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const base = 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(base, { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/shot-initial.png', fullPage: true });

// type a wrong letter, press Check, expect a wrong-marked cell
const firstInput = page.locator('.cell:not(.block) input').first();
await firstInput.click();
const solution = await page.evaluate(() => {
  // expose solution letters in DOM order of inputs
  const cells = [...document.querySelectorAll('.cell')];
  return cells.map(c => c.querySelector('input') ? c.dataset.letter ?? null : null);
});

// grab solution via grid letters from generator state: re-derive from clue check —
// simpler: fill every input using the displayed numbers by brute force of Check+Hint.
// Use the Hint button repeatedly to solve the whole puzzle.
const inputCount = await page.locator('.cell input').count();
for (let i = 0; i < inputCount + 5; i++) {
  const overlayVisible = await page.locator('#overlay:not(.hidden)').count();
  if (overlayVisible) break;
  await page.click('#btnHint');
}

await page.waitForSelector('#overlay:not(.hidden)', { timeout: 3000 });
await page.screenshot({ path: '/tmp/shot-win.png' });

// regenerate and switch theme
await page.click('#btnAgain');
await page.click('.chip >> nth=2'); // Animals
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/shot-animals.png', fullPage: true });

// wrong-answer flow
await page.locator('.cell:not(.block) input').first().click();
await page.keyboard.type('Q');
await page.click('#btnCheck');
const wrongOrRight = await page.locator('.cell.wrong, .cell.right').count();

console.log('inputs:', inputCount, '| wrong/right marks after check:', wrongOrRight);
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
if (errors.length) process.exit(1);
