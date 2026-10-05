  // Chance of being alive at 5 years with ADT alone (%), by amount of cancer, and hazard ratios for death
  // with each added treatment compared with ADT alone. The doctor can update these in Edit mode.
  const CFG_DEFAULTS = { s0High: 26, s0Low: 55, hrAbi: 0.66, hrEnz: 0.70, hrApa: 0.65, hrDaro: 0.78, hrTriHigh: 0.48, hrTriLow: 0.66 };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 's0High', step: 1, label: 'Alive at 5 years with ADT alone, high volume (%)' },
    { k: 's0Low', step: 1, label: 'Alive at 5 years with ADT alone, low volume (%)' },
    { k: 'hrAbi', step: 0.01, label: 'HR for death, ADT + abiraterone vs ADT alone' },
    { k: 'hrEnz', step: 0.01, label: 'HR for death, ADT + enzalutamide vs ADT alone' },
    { k: 'hrApa', step: 0.01, label: 'HR for death, ADT + apalutamide vs ADT alone' },
    { k: 'hrDaro', step: 0.01, label: 'HR for death, ADT + darolutamide vs ADT alone' },
    { k: 'hrTriHigh', step: 0.01, label: 'HR for death, triplet vs ADT alone, high volume' },
    { k: 'hrTriLow', step: 0.01, label: 'HR for death, triplet vs ADT alone, low volume' },
  ];
  const onCfg = () => { S.s0 = s0Default(volume()); render(); };

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'adt', short: 'ADT alone', name: 'ADT alone', trial: 'The standard before 2015',
      how: 'A shot every 1 to 6 months, or a daily pill (relugolix)',
      pros: ['Fewest side effects beyond those of ADT itself', 'Simplest'],
      cons: ['In every large study, adding a second medicine helped men live longer'],
      fit: 'Men who are frail or can’t take anything else' },
    { id: 'abi', short: '+ abiraterone', name: 'ADT + abiraterone', trial: 'LATITUDE · STAMPEDE',
      how: 'Pills once a day on an empty stomach, plus prednisone (a steroid) every day',
      pros: ['Longer survival: in LATITUDE, a median of 53 vs 37 months', 'Generic, so usually low cost', 'The longest track record of the pills'],
      cons: ['Can raise blood pressure and lower potassium; liver blood tests at first', 'A steroid every day, which can raise blood sugar'],
      fit: 'Most men; extra care with diabetes, heart failure or liver disease' },
    { id: 'enz', short: '+ enzalutamide', name: 'ADT + enzalutamide', trial: 'ARCHES · ENZAMET',
      how: 'Pills once a day, with or without food',
      pros: ['Longer survival: in ARCHES, 66 vs 53 in 100 alive at 5 years', 'No steroid, few blood tests'],
      cons: ['More tiredness, and slightly more falls and fractures', 'Clashes with many other medicines; seizures are rare'],
      fit: 'Most men, including those with diabetes or heart problems' },
    { id: 'apa', short: '+ apalutamide', name: 'ADT + apalutamide', trial: 'TITAN',
      how: 'Pills once a day, with or without food',
      pros: ['Longer survival: in TITAN, 65 vs 52 in 100 alive at 4 years', 'No steroid'],
      cons: ['Rash in about 1 in 4 men, vs 1 in 11 on placebo', 'Underactive thyroid in a few; some medicine clashes'],
      fit: 'Most men; the thyroid is checked along the way' },
    { id: 'daro', short: '+ darolutamide', name: 'ADT + darolutamide', trial: 'ARANOTE',
      how: 'Pills twice a day with food',
      pros: ['Side effects close to placebo, including tiredness and thinking', 'The fewest clashes with other medicines', 'Cancer stayed under control longer than with ADT alone'],
      cons: ['Without chemo, a survival benefit is not yet proven: 26 vs 31 in 100 died, a gap that could be chance', 'The newest, with the shortest follow-up'],
      fit: 'Men worried about side effects or taking many medicines' },
    { id: 'tri', short: 'Triplet', name: 'ADT + docetaxel + darolutamide or abiraterone', trial: 'ARASENS · PEACE-1',
      how: '6 chemo infusions, one every 3 weeks, plus a daily pill that continues',
      pros: ['The largest survival gain for high-volume cancer found at diagnosis', 'In ARASENS, 63 vs 50 in 100 alive at 4 years, compared with ADT + chemo'],
      cons: ['About 4 months of chemo: hair loss, tiredness, numbness, infection risk', 'For low-volume cancer, no clear gain over a doublet'],
      fit: 'Fit men with high-volume cancer, especially found at diagnosis' },
  ];

  // Side effects each added medicine brings on top of ADT, compared with placebo where a placebo trial exists.
  const FX_COLS = ['abi', 'enz', 'apa', 'daro', 'tri'];
  const FX = [
    ['How it is taken', ['Once a day on an empty stomach, plus prednisone', 'Once a day', 'Once a day', 'Twice a day with food', '6 chemo doses, then a daily pill']],
    ['High blood pressure', [['hi', 'Severe in 20 vs 10 in 100'], ['md', '8 vs 6 in 100'], ['lo', '18 vs 16 in 100'], ['lo', 'Close to placebo'], ['md', '14 vs 9 in 100']]],
    ['Low potassium, liver tests', [['hi', 'Severe low potassium 10 vs 1 in 100; liver tests rise in 5 vs 1'], ['lo', 'Not a known problem'], ['lo', 'Not a known problem'], ['lo', 'Not a known problem'], ['lo', 'Not a known problem']]],
    ['Tiredness', [['lo', 'Close to placebo'], ['md', '24 vs 20 in 100'], ['lo', '20 vs 17 in 100'], ['lo', '6 vs 8 in 100, no more than placebo'], ['hi', 'Common during chemo']]],
    ['Falls and fractures', [['lo', 'No clear added risk'], ['md', 'Fractures 7 vs 4 in 100'], ['md', 'Fractures 6 vs 5 in 100'], ['lo', 'Close to placebo'], ['lo', 'Close to placebo']]],
    ['Memory, thinking, seizures', [['lo', 'Not a known problem'], ['md', 'Memory trouble 5 vs 2 in 100; seizures rare'], ['lo', 'Seizures rare'], ['lo', 'Close to placebo'], ['lo', 'Close to placebo']]],
    ['Rash, thyroid', [['lo', 'Not a known problem'], ['lo', 'Not a known problem'], ['hi', 'Rash 27 vs 9 in 100; low thyroid 7 vs 1'], ['lo', 'Close to placebo'], ['md', 'Rash 17 vs 14 in 100']]],
    ['Chemo effects', [['lo', 'None'], ['lo', 'None'], ['lo', 'None'], ['lo', 'None'], ['hi', 'Hair loss, numbness, nail changes; infection with fever in about 8 in 100']]],
  ];

  /* ---------- state ---------- */
  const BLANK = { plan: null, timing: null, beyond: null, organ: null };
  const S = { sel: 'enz', s0: CFG.s0High, volWas: null, ...BLANK };
  const s0Default = v => v === 'low' ? CFG.s0Low : CFG.s0High;

  // CHAARTED definition: organ (visceral) spread, or 4 or more bone spots with at least 1 outside the spine and pelvis.
  function volume() {
    const n = parseInt($('#bones').value, 10), known = !isNaN(n);
    if (S.organ === 'yes' || (known && n >= 4 && S.beyond === 'yes')) return 'high';
    if (S.organ === 'no' && known && (n < 4 || S.beyond === 'no')) return 'low';
    return null;
  }
  function hr(id) {
    return { adt: 1, abi: CFG.hrAbi, enz: CFG.hrEnz, apa: CFG.hrApa, daro: CFG.hrDaro,
      tri: volume() === 'low' ? CFG.hrTriLow : CFG.hrTriHigh }[id];
  }
  function outcome(id) {
    const s0 = S.s0 / 100, base = Math.round(100 * s0), alive = Math.round(100 * Math.pow(s0, hr(id)));
    return { free: base, ben: alive - base, rec: 100 - alive };
  }

  /* ---------- render ---------- */
  const optsEl = $('#opts'), tabsEl = $('#tabs'), cmpEl = $('#compare'), planEl = $('#planPick');
  OPTIONS.forEach(o => {
    const b = document.createElement('div');
    b.className = 'opt'; b.dataset.id = o.id; b.tabIndex = 0; b.setAttribute('role', 'button');
    b.onkeydown = e => { if (e.target === b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(o.id); } };
    b.innerHTML = `<div class="trialname">${o.trial}</div><h3>${o.name}</h3><div class="how">${o.how}</div><ul>${
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
  ['ADT alone', 'ADT + abiraterone', 'ADT + enzalutamide', 'ADT + apalutamide', 'ADT + darolutamide', 'ADT + docetaxel + darolutamide', 'ADT + docetaxel + abiraterone', 'A clinical trial'].forEach(n => {
    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = n; p.textContent = n; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === n ? null : n; render(); };
    planEl.append(p);
  });
  $$('.mchips').forEach(g => $$('.chip', g).forEach(c => c.onclick = () => {
    const k = g.dataset.k; S[k] = S[k] === c.dataset.v ? null : c.dataset.v; render();
  }));

  const fx = $('#fx');
  fx.innerHTML = `<thead><tr><th></th>${FX_COLS.map(id => `<th data-id="${id}">${OPTIONS.find(o => o.id === id).short}</th>`).join('')}</tr></thead><tbody>${
    FX.map(([label, cells]) => `<tr><th>${label}</th>${cells.map((c, i) =>
      `<td data-id="${FX_COLS[i]}">${Array.isArray(c) ? `<span class="lvl ${c[0]}">${c[1]}</span>` : c}</td>`).join('')}</tr>`).join('')
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
  const lower = s => s[0].toLowerCase() + s.slice(1);

  function render() {
    const v = volume();
    if (v !== S.volWas) { S.volWas = v; S.s0 = s0Default(v); }
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $$('.mchips').forEach(g => $$('.chip', g).forEach(c => c.setAttribute('aria-pressed', S[g.dataset.k] === c.dataset.v)));
    $('#s0').value = S.s0; $('#s0Out').textContent = S.s0 + '%';

    const tag = $('#volTag');
    tag.textContent = v === 'high' ? 'High volume' : v === 'low' ? 'Low volume' : 'Fill in the scans to check';
    tag.className = 'tag ' + (v ? 'yes' : 'no');

    const o = outcome(S.sel);
    figs.forEach((g, i) => g.setAttribute('fill', i < o.free ? 'var(--free)' : i < o.free + o.ben ? 'var(--blue)' : 'var(--red)'));
    $('#nFree').textContent = o.free; $('#nBen').textContent = o.ben; $('#nRec').textContent = o.rec;
    $('#basis').textContent = v === null
      ? `Example numbers for high-volume cancer, starting from ${S.s0} in 100 alive at 5 years with ADT alone. Fill in the scans in part 1 to fit the picture to you.`
      : `For ${v}-volume cancer, starting from about ${S.s0} in 100 alive at 5 years with ADT alone.`;
    const nm = OPTIONS.find(x => x.id === S.sel).name;
    $('#say').textContent = S.sel === 'adt'
      ? `With ADT alone, about ${o.free} out of 100 men like you are alive at 5 years.`
      : `With ${nm.startsWith("ADT") ? nm : lower(nm)}, about ${o.ben} more men out of 100 are alive at 5 years than with ADT alone.`;
    $('#peopleDesc').textContent = `${o.free} alive at 5 years with ADT alone, ${o.ben} more alive because of the added treatment, ${o.rec} died within 5 years.`;
    OPTIONS.forEach(x => {
      const r = $(`.crow[data-id="${x.id}"]`, cmpEl), oc = outcome(x.id);
      r.classList.toggle('sel', x.id === S.sel);
      $('.b', r).style.width = oc.ben + '%';
      $('.v', r).textContent = x.id === 'adt' ? '—' : '+' + oc.ben;
    });
    autosize();
  }

  $('#s0').oninput = e => { S.s0 = +e.target.value; render(); };
  $('#bones').addEventListener('input', render);
  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
