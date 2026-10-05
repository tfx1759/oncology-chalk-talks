  // Ten-year risks without a pill (%), and hazard ratios for each pill in the same and the other breast.
  const CFG_DEFAULTS = { ipsiEx: 10, contra: 6, tamI: 0.68, tamC: 0.50, lowI: 0.68, lowC: 0.50, aiU60: 0.53, ai60: 0.95, aiAll: 0.73 };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 'ipsiEx', step: 1, label: 'Example same-breast 10-year risk, shown until the MSK estimate is entered (%)' },
    { k: 'contra', step: 0.5, label: 'Default other-breast 10-year risk without a pill (%)' },
    { k: 'tamI', step: 0.01, label: 'HR, tamoxifen 20 mg vs none, same breast (B-24 ER-positive)' },
    { k: 'tamC', step: 0.01, label: 'HR, tamoxifen 20 mg vs none, other breast (B-24 ER-positive)' },
    { k: 'lowI', step: 0.01, label: 'HR, tamoxifen 5 mg for 3 years vs none, same breast' },
    { k: 'lowC', step: 0.01, label: 'HR, tamoxifen 5 mg for 3 years vs none, other breast' },
    { k: 'aiU60', step: 0.01, label: 'HR, anastrozole vs tamoxifen, under 60 (B-35)' },
    { k: 'ai60', step: 0.01, label: 'HR, anastrozole vs tamoxifen, 60 or older (B-35)' },
    { k: 'aiAll', step: 0.01, label: 'HR, anastrozole vs tamoxifen, age not entered (B-35 overall)' },
  ];
  const onCfg = k => { if (!k || k === 'contra') S.contra = CFG.contra; render(); };

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'none', short: 'No pill', name: 'No hormone pill',
      how: 'Yearly mammograms and checkups',
      pros: ['No pill side effects', 'Survival is the same with or without a pill'],
      cons: ['Highest chance of another breast cancer'],
      fit: 'ER-negative DCIS, a very low risk, or women who decide the benefit is not worth it to them' },
    { id: 'tam', short: 'Tamoxifen', name: 'Tamoxifen 20 mg, 5 years',
      how: 'One pill a day. Works before and after menopause',
      pros: ['Lowers the chance of another breast cancer, most clearly in the other breast', 'The longest track record after DCIS'],
      cons: ['Hot flashes and vaginal discharge', 'Small added risk of blood clots, and of uterine cancer after 50'],
      fit: 'ER-positive DCIS, at any age' },
    { id: 'low', short: 'Low-dose tamoxifen', name: 'Low-dose tamoxifen 5 mg, 3 years',
      how: 'One small pill a day for 3 years',
      pros: ['In its trial, about 4 in 10 fewer breast cancers, similar to the standard dose', 'Side effects close to a placebo', 'Shorter course'],
      cons: ['One trial of 500 women, so less certain', 'May help less before menopause'],
      fit: 'Women who can’t take the standard dose' },
    { id: 'ai', short: 'Aromatase inhibitor', name: 'Anastrozole, 5 years',
      how: 'One pill a day. Lowers estrogen. Only after menopause',
      pros: ['Works at least as well as tamoxifen, and better under 60 in one large trial', 'No added risk of blood clots or uterine cancer'],
      cons: ['Hot flashes and joint aches', 'Bone loss: needs bone density scans, calcium and vitamin D'],
      fit: 'Women past menopause, especially under 60 or with a higher clot risk' },
  ];

  // Added risk over placebo: tamoxifen from NSABP B-24 and P-1, low dose from TAM-01, anastrozole from IBIS-II.
  const FX = [
    ['How it is taken', ['Nothing to take', 'One pill daily, 5 years', 'One pill daily, 3 years', 'One pill daily, 5 years']],
    ['Hot flashes', [['lo', 'Common at this age'], ['hi', 'Severe in about 17 more in 100 (45 vs 28)'], ['lo', 'Slightly more: 2.1 vs 1.5 a day'], ['md', 'About 8 more in 100 (57 vs 49)']]],
    ['Joint and muscle aches', [['lo', 'Common at this age'], ['lo', 'No added risk'], ['lo', 'No added risk'], ['md', 'About 5 more in 100 (51 vs 46)']]],
    ['Blood clots', [['lo', 'Usual for age'], ['md', 'About 1 more in 100 over 5 years'], ['lo', 'No clear added risk; 1 clot in each group'], ['lo', 'No added risk']]],
    ['Uterine cancer', [['lo', 'Usual for age'], ['md', 'After 50, about 1 more in 100 over 5 years; little or none before 50'], ['lo', '1 case vs none among 500 women'], ['lo', 'No added risk']]],
    ['Bones', [['lo', 'Usual for age'], ['lo', 'Helps bones after menopause'], ['lo', 'Not well studied'], ['md', 'Bone loss; fractures 9 vs 8 in 100']]],
    ['Vaginal changes', [['lo', 'Usual'], ['md', 'Discharge in about 20 more in 100 (55 vs 35)'], ['lo', 'No more dryness than placebo'], ['md', 'Dryness in about 3 more in 100 (19 vs 16)']]],
  ];

  /* ---------- state ---------- */
  const BLANK = { plan: null, family: null, found: null, grade: null, necrosis: null, margin: null, rt: null, er: null, meno: null };
  const S = { sel: 'tam', contra: CFG.contra, ...BLANK };
  const pct = id => { const v = parseFloat($('#' + id).value); return isNaN(v) ? null : Math.min(Math.max(v, 0), 95); };
  function aiVsTam() { const a = parseFloat($('#age').value); return isNaN(a) ? CFG.aiAll : a < 60 ? CFG.aiU60 : CFG.ai60; }
  function hr(id) {
    if (id === 'none' || S.er === 'neg' || (id === 'ai' && S.meno === 'pre')) return [1, 1];
    if (id === 'tam') return [CFG.tamI, CFG.tamC];
    if (id === 'low') return [CFG.lowI, CFG.lowC];
    return [CFG.tamI * aiVsTam(), CFG.tamC * aiVsTam()];
  }
  function outcome(id) {
    const ipsi = pct('ipsi') ?? CFG.ipsiEx, s0i = 1 - ipsi / 100, s0c = 1 - S.contra / 100, [hi, hc] = hr(id);
    const base = Math.round(100 * (1 - s0i * s0c));
    const rec = Math.round(100 * (1 - Math.pow(s0i, hi) * Math.pow(s0c, hc)));
    return { free: 100 - base, ben: base - rec, rec };
  }

  /* ---------- render ---------- */
  const optsEl = $('#opts'), tabsEl = $('#tabs'), cmpEl = $('#compare'), planEl = $('#planPick');
  OPTIONS.forEach(o => {
    const b = document.createElement('div');
    b.className = 'opt'; b.dataset.id = o.id; b.tabIndex = 0; b.setAttribute('role', 'button');
    b.onkeydown = e => { if (e.target === b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(o.id); } };
    b.innerHTML = `${o.id === 'ai' ? '<div class="tag no" id="aiTag" data-live hidden>Only after menopause</div>' : ''}<h3>${o.name}</h3><div class="how">${o.how}</div><ul>${
      o.pros.map(t => `<li class="pro">${t}</li>`).join('')}${
      o.cons.map(t => `<li class="con">${t}</li>`).join('')}<li class="fit">${o.fit}</li></ul>`;
    b.onclick = () => select(o.id);
    optsEl.append(b);

    const t = document.createElement('button');
    t.className = 'btn'; t.dataset.id = o.id; t.textContent = o.short;
    t.onclick = () => select(o.id);
    tabsEl.append(t);

    const row = document.createElement('div');
    row.className = 'crow'; row.dataset.id = o.id;
    row.innerHTML = `<span>${o.name}</span><div class="track"><i class="b"></i></div><span class="v"></span>`;
    cmpEl.append(row);
  });
  ['Tamoxifen 20 mg for 5 years', 'Tamoxifen 5 mg for 3 years', 'Anastrozole for 5 years', 'No hormone pill'].forEach(n => {
    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = n; p.textContent = n; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === n ? null : n; render(); };
    planEl.append(p);
  });
  $$('.mchips').forEach(g => $$('.chip', g).forEach(c => c.onclick = () => {
    const k = g.dataset.k; S[k] = S[k] === c.dataset.v ? null : c.dataset.v; render();
  }));

  const fx = $('#fx');
  fx.innerHTML = `<thead><tr><th></th>${OPTIONS.map(o => `<th data-id="${o.id}">${o.short}</th>`).join('')}</tr></thead><tbody>${
    FX.map(([label, cells]) => `<tr><th>${label}</th>${cells.map((c, i) =>
      `<td data-id="${OPTIONS[i].id}">${Array.isArray(c) ? `<span class="lvl ${c[0]}">${c[1]}</span>` : c}</td>`).join('')}</tr>`).join('')
  }</tbody>`;

  const NS = 'http://www.w3.org/2000/svg', people = $('#people'), figs = [];
  for (let i = 0; i < 100; i++) {
    const x = (i % 10) * 34 + 17, y = Math.floor(i / 10) * 34 + 17;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = '<circle cx="0" cy="-8" r="5"/><path d="M-8 12 L-3 -1 L3 -1 L8 12 Z"/>';
    people.append(g); figs.push(g);
  }

  function select(id) { S.sel = id; render(); }

  function render() {
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $$('.mchips').forEach(g => $$('.chip', g).forEach(c => c.setAttribute('aria-pressed', S[g.dataset.k] === c.dataset.v)));
    $('#contra').value = S.contra; $('#contraOut').textContent = S.contra + '%';

    const pre = S.meno === 'pre';
    $('#aiTag').hidden = !pre; $('.opt[data-id="ai"]', optsEl).classList.toggle('dim', pre);
    $('#erNeg').hidden = S.er !== 'neg';

    const o = outcome(S.sel), ipsi = pct('ipsi');
    figs.forEach((g, i) => g.setAttribute('fill', i < o.free ? 'var(--free)' : i < o.free + o.ben ? 'var(--blue)' : 'var(--red)'));
    $('#nFree').textContent = o.free; $('#nBen').textContent = o.ben; $('#nRec').textContent = o.rec;
    $('#basis').textContent = ipsi === null
      ? `Example numbers: ${CFG.ipsiEx} in 100 in the same breast and ${S.contra} in 100 in the other breast. Enter the MSK estimate in part 1 to make this picture yours.`
      : `Based on your MSK estimate of ${ipsi} in 100 in the same breast, plus about ${S.contra} in 100 in the other breast.`;
    const nm = OPTIONS.find(x => x.id === S.sel).name.split(',')[0];
    $('#say').textContent = S.sel === 'none'
      ? `Without a pill, about ${o.rec} out of 100 women like you would have DCIS or breast cancer again within 10 years.`
      : S.er === 'neg' ? 'For ER-negative DCIS, studies have not shown that a hormone pill lowers this chance.'
      : S.sel === 'ai' && pre ? 'Aromatase inhibitors only work after menopause.'
      : `With ${nm[0].toLowerCase() + nm.slice(1)}, about ${o.ben} fewer women out of 100 have DCIS or breast cancer again than with no pill.`;
    $('#peopleDesc').textContent = `${o.free} with no new breast cancer even without a pill, ${o.ben} spared by the pill, ${o.rec} with DCIS or cancer again.`;
    OPTIONS.forEach(x => {
      const r = $(`.crow[data-id="${x.id}"]`, cmpEl), oc = outcome(x.id);
      r.classList.toggle('sel', x.id === S.sel);
      $('.b', r).style.width = oc.ben + '%';
      $('.v', r).textContent = x.id === 'none' ? '—' : '+' + oc.ben;
    });
    autosize();
  }

  $('#contra').oninput = e => { S.contra = +e.target.value; render(); };
  ['ipsi', 'age'].forEach(id => $('#' + id).addEventListener('input', render));
  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
