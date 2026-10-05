// Blank handout PDFs: node tools/blank-pdf.js DOCS_DIR SLUG...
// Writes SLUG-blank-handout.pdf to the project's shared folder when it exists, otherwise to pdf/ in the repo.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');

(async () => {
  const [docs, ...slugs] = process.argv.slice(2);
  const shared = '/mnt/project-files/chalk-talks';
  const out = fs.existsSync(shared) ? shared : path.resolve(__dirname, '..', 'pdf');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const slug of slugs) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    await page.goto('file://' + path.resolve(docs, 'talks', slug + '.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => { window.print = () => {}; document.querySelector('#printBlankBtn').click(); });
    await page.emulateMedia({ media: 'print' });
    const file = path.join(out, `${slug}-blank-handout.pdf`);
    await page.pdf({ path: file, format: 'Letter', printBackground: true, margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } });
    console.log('wrote', file);
    await page.close();
  }
  await browser.close();
})();
