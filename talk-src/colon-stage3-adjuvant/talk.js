  const CFG_DEFAULTS = { baseLow: 40, baseHigh: 60, fp: 0.70, ox: 0.80, short3: 1.12 };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 'baseLow', step: 1, label: 'Default 5-year recurrence without chemo, lower-risk group (%)' },
    { k: 'baseHigh', step: 1, label: 'Default 5-year recurrence without chemo, higher-risk group (%)' },
    { k: 'fp', step: 0.01, label: 'Hazard ratio, 5-FU or capecitabine vs surgery alone' },
    { k: 'ox', step: 0.01, label: 'Hazard ratio, adding oxaliplatin' },
    { k: 'short3', step: 0.01, label: 'CAPOX 3 vs 6 months in the higher-risk group (multiplier)' },
  ];
  const onCfg = k => { if (!k || k === 'baseLow' || k === 'baseHigh') S.base = DEFAULT_BASE[S.risk]; render(); };

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'none', short: 'No chemo', name: 'No chemo, close follow-up',
      how: 'Checkups, blood tests (CEA) and CT scans over 5 years',
      pros: ['No chemo side effects', 'Back to normal life soonest'],
      cons: ['Highest chance the cancer comes back'],
      fit: 'People who are too frail for chemo, or who decide the benefit is not worth it to them' },
    { id: 'cap', short: 'Pills alone', name: 'Capecitabine pills (or 5-FU), 6 months',
      how: 'Pills twice a day, 2 weeks on and 1 week off. No IV needed',
      pros: ['At home, no port or pump', 'No lasting nerve damage'],
      cons: ['Smaller benefit than adding oxaliplatin', 'Sore hands and feet, diarrhea'],
      fit: 'People over 70, or anyone who wants to avoid oxaliplatin' },
    { id: 'capox3', short: 'CAPOX 3 mo', name: 'CAPOX, 3 months',
      how: 'Oxaliplatin IV every 3 weeks (4 doses) plus capecitabine pills',
      pros: ['Most of the benefit of 6 months', 'Far less lasting numbness', 'Done in 3 months'],
      cons: ['Some numbness and cold sensitivity', 'In the higher-risk group, slightly less benefit than 6 months'],
      fit: 'The usual choice for the lower-risk group' },
    { id: 'ox6', short: 'Oxaliplatin 6 mo', name: 'FOLFOX or CAPOX, 6 months',
      how: 'FOLFOX: IV every 2 weeks with a 2-day home pump (12 doses). CAPOX: IV every 3 weeks plus pills (8 doses)',
      pros: ['Largest benefit, especially for the higher-risk group'],
      cons: ['About half have numbness that gets in the way of daily tasks', 'Longest course, most visits'],
      fit: 'Often chosen for the higher-risk group' },
  ];

  const FX = [
    ['How it is given', ['Visits and scans only', 'Pills at home; clinic every 3 weeks', 'IV every 3 weeks + pills', 'IV every 2–3 weeks; FOLFOX needs a port and pump']],
    ['Numbness and tingling in hands and feet (nerve damage)', [['lo', 'None'], ['lo', 'Rare'], ['md', 'About 1 in 7 moderate or worse'], ['hi', 'About 1 in 2 moderate or worse; can last months to years']]],
    ['Cold sensitivity (throat, fingers)', [['lo', 'None'], ['lo', 'None'], ['md', 'Common for a few days after each IV dose'], ['md', 'Common for a few days after each IV dose']]],
    ['Sore, red hands and feet', [['lo', 'None'], ['hi', 'Common'], ['md', 'Sometimes'], ['md', 'Sometimes (CAPOX)']]],
    ['Diarrhea, nausea, mouth sores', [['lo', 'None'], ['md', 'Sometimes'], ['md', 'Sometimes'], ['md', 'Sometimes']]],
    ['Low blood counts, infection risk', [['lo', 'None'], ['lo', 'Uncommon'], ['md', 'Sometimes'], ['md', 'Sometimes; more with FOLFOX']]],
    ['Tiredness', [['lo', 'None'], ['md', 'Mild to moderate'], ['md', 'Moderate, for 3 months'], ['md', 'Moderate, for 6 months']]],
  ];

  /* ---------- state ---------- */
  const DEFAULT_BASE = { get low() { return CFG.baseLow; }, get high() { return CFG.baseHigh; } };
  // What Clear ink and Print blank reset (typed fields and ticks are reset separately).
  const BLANK = { plan: null };
  const S = { risk: 'low', base: CFG.baseLow, sel: 'capox3', plan: null };

  function hr(id) {
    if (id === 'none') return 1;
    if (id === 'cap') return CFG.fp;
    if (id === 'ox6') return CFG.fp * CFG.ox;
    if (id === 'capox3') return S.risk === 'high' ? CFG.fp * CFG.ox * CFG.short3 : CFG.fp * CFG.ox;
  }
  function outcome(id) {
    const s0 = 1 - S.base / 100;
    const recur = Math.round(100 * (1 - Math.pow(s0, hr(id))));
    const free = 100 - S.base;
    return { free, ben: S.base - recur, rec: recur };
  }

  /* ---------- render ---------- */
  const optsEl = $('#opts'), tabsEl = $('#tabs'), cmpEl = $('#compare'), planEl = $('#planPick');
  OPTIONS.forEach(o => {
    const b = document.createElement('div');
    b.className = 'opt'; b.dataset.id = o.id; b.tabIndex = 0; b.setAttribute('role', 'button');
    b.onkeydown = e => { if (e.target === b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(o.id); } };
    b.innerHTML = `<h3>${o.name}</h3><div class="how">${o.how}</div><ul>${
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

    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = o.id; p.textContent = o.name; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === o.id ? null : o.id; render(); };
    planEl.append(p);
  });

  const fx = $('#fx');
  fx.innerHTML = `<thead><tr><th></th>${OPTIONS.map(o => `<th data-id="${o.id}">${o.short}</th>`).join('')}</tr></thead><tbody>${
    FX.map(([label, cells]) => `<tr><th>${label}</th>${cells.map((c, i) =>
      `<td data-id="${OPTIONS[i].id}">${Array.isArray(c) ? `<span class="lvl ${c[0]}">${c[1]}</span>` : c}</td>`).join('')}</tr>`).join('')
  }</tbody>`;

  // 10x10 people grid
  const NS = 'http://www.w3.org/2000/svg', people = $('#people'), figs = [];
  for (let i = 0; i < 100; i++) {
    const x = (i % 10) * 34 + 17, y = Math.floor(i / 10) * 34 + 17;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = '<circle cx="0" cy="-8" r="5"/><path d="M-8 12 C-8 0 -5 -1 0 -1 C5 -1 8 0 8 12 Z"/>';
    people.append(g); figs.push(g);
  }

  function select(id) { S.sel = id; render(); }

  function render() {
    $$('#riskChips .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.risk === S.risk));
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $('#base').value = S.base; $('#baseOut').textContent = S.base + '%';

    const o = outcome(S.sel);
    figs.forEach((g, i) => {
      const col = i < o.free ? 'var(--free)' : i < o.free + o.ben ? 'var(--blue)' : 'var(--red)';
      g.setAttribute('fill', col);
    });
    $('#nFree').textContent = o.free; $('#nBen').textContent = o.ben; $('#nRec').textContent = o.rec;
    const opt = OPTIONS.find(x => x.id === S.sel);
    $('#say').textContent = S.sel === 'none'
      ? `Without chemo, about ${o.rec} out of 100 people like you would have the cancer come back.`
      : `With ${opt.short.replace(' mo', ' months')}, about ${o.ben} more people out of 100 stay cancer-free than with surgery alone.`;
    $('#peopleDesc').textContent = `${o.free} cancer-free with surgery alone, ${o.ben} cancer-free because of chemo, ${o.rec} with cancer returning.`;

    OPTIONS.forEach(x => {
      const r = $(`.crow[data-id="${x.id}"]`, cmpEl), oc = outcome(x.id);
      r.classList.toggle('sel', x.id === S.sel);
      $('.b', r).style.width = oc.ben + '%';
      $('.v', r).textContent = x.id === 'none' ? '—' : '+' + oc.ben;
    });
    autosize();
  }

  $$('#riskChips .chip').forEach(c => c.onclick = () => {
    S.risk = c.dataset.risk; S.base = DEFAULT_BASE[S.risk];
    if (S.risk === 'high' && S.sel === 'capox3') S.sel = 'ox6';
    if (S.risk === 'low' && S.sel === 'ox6') S.sel = 'capox3';
    render();
  });
  $('#base').oninput = e => { S.base = +e.target.value; render(); };

  // risk group from node count
  function nodeRisk() {
    const n = parseInt($('#nodesPos').value, 10);
    if (n >= 4 && S.risk !== 'high') $('#riskChips [data-risk="high"]').click();
  }
  $('#nodesPos').addEventListener('change', nodeRisk);

  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // grow lined textareas so the handout never clips
  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
