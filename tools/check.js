// Browser check for built talks: node tools/check.js DOCS_DIR SLUG...
// For each talk: no script errors; patient fields start blank; Clear ink returns the page to how it loaded and
// Undo brings the visit back; Print blank empties the page and restores it afterwards; Edit mode leaves live text
// alone and lists every model number; nothing scrolls sideways at phone width.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');

const snap = () => {
  const b = document.querySelector('#board');
  const fields = [...b.querySelectorAll('input, textarea')].filter(el => !el.closest('.dr') && el.id !== 'visitDate')
    .map(el => (el.id || el.name || el.type) + '=' + (el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value));
  const pressed = [...b.querySelectorAll('[aria-pressed="true"]')].map(el => el.textContent.trim().slice(0, 30));
  return JSON.stringify({ fields, pressed });
};

(async () => {
  const [docs, ...slugs] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let failed = 0;
  for (const slug of slugs) {
    const problems = [], notes = [];
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    page.on('pageerror', e => problems.push('script error: ' + e.message));
    await page.goto('file://' + path.resolve(docs, 'talks', slug + '.html'));
    await page.waitForTimeout(300);
    await page.evaluate(() => { window.print = () => {}; });

    const fresh = await page.evaluate(snap);
    const typed = await page.evaluate(() => [...document.querySelectorAll('#board input:not([type=checkbox]):not([type=radio]), #board textarea')]
      .filter(el => !el.closest('.dr') && el.id !== 'visitDate' && el.value.trim() && el.value !== el.defaultValue).map(el => el.id));
    if (typed.length) problems.push('fields not blank on load: ' + typed.join(', '));

    // Fill in a visit: type in every field, tick every box, pick the first chip in each group.
    await page.evaluate(() => {
      const b = document.querySelector('#board');
      [...b.querySelectorAll('input, textarea')].filter(el => !el.closest('.dr') && el.id !== 'visitDate').forEach(el => {
        if (el.type === 'checkbox') el.checked = true; else if (el.type === 'radio') return; else el.value = el.type === 'number' ? '3' : 'test';
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const groups = new Set([...b.querySelectorAll('.chip')].map(c => c.parentElement));
      groups.forEach(g => { const c = g.querySelector('.chip'); if (c && c.getAttribute('aria-pressed') !== 'true') c.click(); });
    });
    const filled = await page.evaluate(snap);
    if (filled === fresh) notes.push('filling in changed nothing');

    await page.click('#clearBtn');
    if (await page.evaluate(snap) !== fresh) problems.push('Clear ink did not return the page to how it loaded');
    await page.click('#undoBtn');
    if (await page.evaluate(snap) !== filled) problems.push('Undo after Clear ink did not restore the visit');

    if (await page.isVisible('#printBlankBtn')) {
      await page.click('#printBlankBtn');
      const blank = await page.evaluate(snap), cls = await page.evaluate(() => document.body.className);
      if (blank !== fresh) problems.push('Print blank left patient details on the page');
      if (!/blankprint/.test(cls)) problems.push('Print blank did not switch to the blank layout');
      await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
      if (await page.evaluate(snap) !== filled) problems.push('details were not restored after Print blank');
    } else problems.push('Print blank button hidden');

    if (await page.isVisible('#editBtn')) {
      await page.click('#editBtn');
      const ed = await page.evaluate(() => ({
        n: document.querySelectorAll('.ek').length,
        live: [...document.querySelectorAll('[data-live].ek, #say.ek, #verdict.ek')].map(e => e.id || e.className),
        cfg: document.querySelectorAll('.cfgrow').length,
      }));
      if (!ed.n) problems.push('Edit mode found no editable text');
      if (ed.live.length) problems.push('Edit mode offers live text: ' + ed.live.join(', '));
      if (!ed.cfg) notes.push('no model numbers in Edit mode');
      notes.push(`${ed.n} editable pieces, ${ed.cfg} model numbers`);
      await page.click('#cancelBtn');
    } else problems.push('Edit button hidden');

    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(150);
    const wide = await page.evaluate(() => document.scrollingElement.scrollWidth);
    if (wide > 390) problems.push(`page scrolls sideways at phone width (${wide}px)`);

    await page.close();
    if (problems.length) failed++;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${slug}  ${notes.join('; ')}`);
    problems.forEach(p => console.log('     - ' + p));
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
