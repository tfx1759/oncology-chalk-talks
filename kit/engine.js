  /* ---------- step-by-step ---------- */
  const steps = $$('section.step');
  let walk = false, cur = 0;
  function showSteps() {
    steps.forEach((s, i) => s.classList.toggle('later', walk && i > cur));
    ['#backBtn', '#nextBtn', '#stepLabel'].forEach(s => $(s).hidden = !walk);
    $('#stepLabel').textContent = `${cur + 1} of ${steps.length}`;
    $('#backBtn').disabled = cur === 0; $('#nextBtn').disabled = cur === steps.length - 1;
    $('footer').hidden = walk && cur < steps.length - 1;
    $('#walkBtn').setAttribute('aria-pressed', walk);
    sizeInk();
  }
  $('#walkBtn').onclick = () => { walk = !walk; cur = 0; showSteps(); if (walk) window.scrollTo({ top: 0 }); };
  $('#nextBtn').onclick = () => {
    cur = Math.min(cur + 1, steps.length - 1); showSteps();
    const s = steps[cur]; s.classList.remove('reveal'); void s.offsetWidth; s.classList.add('reveal');
    s.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  $('#backBtn').onclick = () => { cur = Math.max(cur - 1, 0); showSteps(); steps[cur].scrollIntoView({ block: 'start' }); };

  /* ---------- marker layer ---------- */
  const board = $('#board'), ink = $('#ink'), ctx = ink.getContext('2d');
  let strokes = [], live = null, color = 'blue', W = 1, unclear = null;
  function tok(name) { return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim(); }
  function sizeInk() {
    const dpr = window.devicePixelRatio || 1;
    W = board.clientWidth; const H = board.scrollHeight;
    ink.width = W * dpr; ink.height = H * dpr; ink.style.width = W + 'px'; ink.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw();
  }
  function drawStroke(s) {
    if (s.pts.length < 1) return;
    ctx.strokeStyle = tok(s.c); ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = .9;
    ctx.beginPath();
    s.pts.forEach(([x, y], i) => i ? ctx.lineTo(x * W, y * W) : ctx.moveTo(x * W, y * W));
    if (s.pts.length === 1) ctx.lineTo(s.pts[0][0] * W + .1, s.pts[0][1] * W);
    ctx.stroke();
  }
  function redraw() { ctx.clearRect(0, 0, ink.width, ink.height); strokes.forEach(drawStroke); if (live) drawStroke(live); }
  function pt(e) { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) / W, (e.clientY - r.top) / W]; }
  ink.addEventListener('pointerdown', e => { unclear = null; live = { c: color, pts: [pt(e)] }; ink.setPointerCapture(e.pointerId); e.preventDefault(); });
  ink.addEventListener('pointermove', e => { if (!live) return; live.pts.push(pt(e)); redraw(); });
  const end = () => { if (live) { strokes.push(live); live = null; redraw(); } };
  ink.addEventListener('pointerup', end); ink.addEventListener('pointercancel', end);
  $('#penBtn').onclick = () => {
    const on = !document.body.classList.contains('pen');
    document.body.classList.toggle('pen', on); $('#penBtn').setAttribute('aria-pressed', on);
  };
  $$('.swatch').forEach(s => s.onclick = () => {
    color = s.dataset.c; $$('.swatch').forEach(x => x.setAttribute('aria-pressed', x === s));
    if (!document.body.classList.contains('pen')) $('#penBtn').click();
  });
  new ResizeObserver(sizeInk).observe(board);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('beforeprint', () => { steps.forEach(s => s.classList.remove('later')); $('footer').hidden = false; autosize(); requestAnimationFrame(sizeInk); });
  window.addEventListener('afterprint', showSteps);
  // Printing works when the page is opened directly (the website or a saved copy), not inside the artifact viewer.
  // Everything written on the page: typed fields, ticks, the chosen plan and marker ink.
  // wipe() empties it and returns a function that puts it all back.
  function wipe(keep = []) {
    const els = $$('input, textarea', board).filter(el => !el.closest('.dr') && !keep.includes(el.id));
    const saved = els.map(el => el.type === 'checkbox' ? el.checked : el.value), was = { ...S }, inkWas = strokes;
    els.forEach(el => { if (el.type === 'checkbox') el.checked = false; else if (el.tagName === 'TEXTAREA') el.value = el.defaultValue; else el.value = ''; });
    Object.assign(S, BLANK); strokes = []; render(); redraw();
    return () => {
      els.forEach((el, i) => { if (el.type === 'checkbox') el.checked = saved[i]; else el.value = saved[i]; });
      Object.assign(S, was); strokes = inkWas; render(); redraw();
    };
  }
  // Clear ink starts a fresh page (today's date stays); Undo right after brings it all back.
  $('#clearBtn').onclick = () => { unclear = wipe(['visitDate']); };
  $('#undoBtn').onclick = () => { if (unclear) { unclear(); unclear = null; } else { strokes.pop(); redraw(); } };
  board.addEventListener('input', () => { unclear = null; });
  function printBlank() {
    const restore = wipe(); document.body.classList.add('blankprint'); render();
    window.addEventListener('afterprint', () => { document.body.classList.remove('blankprint'); restore(); }, { once: true });
    window.print();
  }
  if (window.self === window.top) {
    $('#printBtn').hidden = $('#printBlankBtn').hidden = false;
    $('#printBtn').onclick = () => window.print();
    $('#printBlankBtn').onclick = printBlank;
    if (/^https?:/.test(location.protocol)) $('#libLink').hidden = false;
    if (/[?&]print=blank\b/.test(location.search)) document.fonts.ready.then(() => setTimeout(printBlank, 300));
  }

  render();

  /* ---------- edit mode: change wording and model numbers, then save as a new version ---------- */
  (() => {
    const RESET = ':root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}';
    const ED = { btn: $('#editBtn'), save: $('#saveBtn'), cancel: $('#cancelBtn'), msg: $('#editStatus') };
    const say = t => { ED.msg.textContent = t; };
    const SEL = 'h1,h2,h3,p,li,th,td,.how,.eyebrow,.note,.lg span,.checks label > span,.fact > span:first-child';
    let els = $$(SEL, board).filter(el => !el.matches('#say,#verdict,[data-live]') && !el.querySelector('[data-live]') && !el.closest('svg') &&
      !el.querySelector('input,textarea,button,select') && el.textContent.trim());
    els = els.filter(el => !els.some(o => o !== el && o.contains(el)));

    // Each piece of text is keyed by its original wording, so saved edits survive later layout changes.
    const seen = {};
    els.forEach(el => {
      const t = el.tagName + '|' + el.textContent.replace(/\s+/g, ' ').trim();
      seen[t] = (seen[t] || 0) + 1;
      el._ek = t + '|' + seen[t]; el._def = el.innerHTML.trim(); el.classList.add('ek');
      const v = EDITS.text && EDITS.text[el._ek];
      if (typeof v === 'string') el.innerHTML = v;
      el.addEventListener('paste', e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && el.isContentEditable) { e.preventDefault(); el.blur(); } });
    });

    const box = document.createElement('div');
    box.className = 'cfg'; box.hidden = true;
    box.innerHTML = '<div class="eyebrow">Model numbers</div>' + CFG_SPEC.map(s =>
      `<label class="cfgrow"><span>${s.label}</span><input type="number" step="${s.step}" id="cfg-${s.k}" value="${CFG[s.k]}"></label>`).join('');
    $('#drPanel').append(box);
    CFG_SPEC.forEach(s => $('#cfg-' + s.k).addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) { CFG[s.k] = v; onCfg(s.k); }
    }));

    const editing = () => document.body.classList.contains('editing');
    document.addEventListener('click', e => {
      if (!editing() || !e.target.closest || !e.target.closest('.ek')) return;
      if (e.target.closest('label')) e.preventDefault();
      e.stopPropagation();
    }, true);

    function setEditing(on) {
      if (on && document.body.classList.contains('pen')) $('#penBtn').click();
      document.body.classList.toggle('editing', on);
      els.forEach(el => on ? el.setAttribute('contenteditable', 'true') : el.removeAttribute('contenteditable'));
      ED.btn.hidden = on; ED.save.hidden = ED.cancel.hidden = !on; box.hidden = !on;
      if (on) $('#drPanel').hidden = false;
      sizeInk();
    }

    let snap = null, art = null;
    ED.btn.onclick = () => {
      snap = { html: els.map(el => el.innerHTML), cfg: { ...CFG } };
      setEditing(true);
      say('Click any text to change it. Model numbers are in the doctor box.');
    };
    ED.cancel.onclick = () => {
      els.forEach((el, i) => { el.innerHTML = snap.html[i]; });
      Object.assign(CFG, snap.cfg);
      CFG_SPEC.forEach(s => { $('#cfg-' + s.k).value = CFG[s.k]; });
      onCfg(); setEditing(false); say('');
    };
    ED.save.onclick = async () => {
      const text = {}, settings = {};
      els.forEach(el => { const h = el.innerHTML.replace(/(<br>)+$/, '').trim(); if (h !== el._def) text[el._ek] = h; });
      Object.keys(CFG_DEFAULTS).forEach(k => { if (CFG[k] !== CFG_DEFAULTS[k]) settings[k] = CFG[k]; });
      setEditing(false);
      if (!art) { say('Changes stay until you close this page. Edit from the artifact link to save them for good.'); return; }
      say('Saving…');
      try {
        await art.publish(buildDoc({ text, settings }));
        say('Saved');
      } catch (err) {
        const c = err && err.code;
        if (c === 'conflict') say('A newer version was saved elsewhere. Loading it now.');
        else if (c === 'not_writer' || c === 'not_granted') { say('This view is read-only, so changes can’t be saved.'); ED.btn.hidden = true; }
        else { setEditing(true); say('Couldn’t save (' + (c || 'error') + '). Your changes are still here; try Save again.'); }
      }
    };

    function buildDoc(edits) {
      const json = JSON.stringify(edits).replace(/</g, '\\u003c');
      const body = PRISTINE.replace(/(<script type="application\/json" id="edits">)[\s\S]*?(<\/script>)/, (m, a, b) => a + json + b);
      return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' +
        RESET + '<\/style><\/head><body>' + body + '<\/body><\/html>';
    }

    async function connect() {
      if (window.self === window.top) { ED.btn.hidden = false; return; }
      if (!window.claude || !window.claude.use) return;
      const a = await window.claude.use('artifact');
      if (!a) return;
      const u = await window.claude.use('user');
      if (u && !(await u.canEdit())) return;
      art = a; ED.btn.hidden = false;
    }
    if (window.claude && window.claude.use) connect(); else window.addEventListener('load', connect, { once: true });
  })();
  sizeInk();
})();
