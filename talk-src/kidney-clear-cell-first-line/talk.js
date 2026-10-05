  // Trial results by IMDC risk group: best response (complete response, objective response, progressive disease, %),
  // median duration of response (months) and 5-year overall survival (%). IO + TKI blends KEYNOTE-426, CheckMate 9ER and CLEAR.
  // The doctor can update these in Edit mode.
  const CFG_DEFAULTS = {
    ioCrAll: 12, ioOrrAll: 40, ioPdAll: 18, ioCrIp: 12, ioOrrIp: 42, ioPdIp: 19, ioCrFav: 13, ioOrrFav: 30, ioPdFav: 12,
    tkCrAll: 15, tkOrrAll: 63, tkPdAll: 8, tkCrIp: 13, tkOrrIp: 61, tkPdIp: 8, tkCrFav: 16, tkOrrFav: 68, tkPdFav: 3,
    ioDor: 76, tkDor: 24,
    ioOs5All: 48, tkOs5All: 41, suOs5All: 37, ioOs5Ip: 43, tkOs5Ip: 39, suOs5Ip: 31,
  };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const GROUPS = { All: 'all risk groups', Ip: 'intermediate or poor risk', Fav: 'favorable risk' };
  const CFG_SPEC = [];
  [['io', 'IO + IO'], ['tk', 'IO + TKI']].forEach(([r, nm]) => Object.entries(GROUPS).forEach(([g, gn]) => {
    CFG_SPEC.push({ k: `${r}Cr${g}`, step: 1, label: `${nm}, ${gn}: cancer disappeared (complete response, %)` });
    CFG_SPEC.push({ k: `${r}Orr${g}`, step: 1, label: `${nm}, ${gn}: tumors shrank, including disappeared (objective response, %)` });
    CFG_SPEC.push({ k: `${r}Pd${g}`, step: 1, label: `${nm}, ${gn}: grew despite treatment (progressive disease as best response, %)` });
  }));
  CFG_SPEC.push(
    { k: 'ioDor', step: 1, label: 'IO + IO: median duration of response (months)' },
    { k: 'tkDor', step: 1, label: 'IO + TKI: median duration of response (months)' },
    { k: 'ioOs5All', step: 1, label: 'IO + IO, all risk groups: alive at 5 years (%)' },
    { k: 'tkOs5All', step: 1, label: 'IO + TKI, all risk groups: alive at 5 years (%)' },
    { k: 'suOs5All', step: 1, label: 'Sunitinib, all risk groups: alive at 5 years (%)' },
    { k: 'ioOs5Ip', step: 1, label: 'IO + IO, intermediate or poor risk: alive at 5 years (%)' },
    { k: 'tkOs5Ip', step: 1, label: 'IO + TKI, intermediate or poor risk: alive at 5 years (%)' },
    { k: 'suOs5Ip', step: 1, label: 'Sunitinib, intermediate or poor risk: alive at 5 years (%)' },
  );
  const onCfg = () => render();

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'io', short: 'IO + IO', name: 'Two immunotherapy drugs (IO + IO)', trial: 'CheckMate 214',
      how: 'Nivolumab + ipilimumab in a vein every 3 weeks for 4 doses, then nivolumab alone every 2 or 4 weeks',
      pros: ['When it works, the benefit often lasts for many years', 'A small group stay well controlled long after stopping treatment', 'No daily pill'],
      cons: ['Shrinks tumors in fewer people, and in about 1 in 5 the cancer grows at first', 'Serious immune side effects are more common, often needing steroids'],
      fit: 'Intermediate or poor risk, especially when there is time to wait for a response' },
    { id: 'tk', short: 'IO + TKI', name: 'Immunotherapy + a targeted pill (IO + TKI)', trial: 'KEYNOTE-426 · CheckMate 9ER · CLEAR',
      how: 'Pembrolizumab + axitinib, nivolumab + cabozantinib, or pembrolizumab + lenvatinib. Immunotherapy in a vein every 2 to 6 weeks, plus a pill every day',
      pros: ['Shrinks tumors in more people, and usually works faster', 'Few people see their cancer grow at first', 'Works in every risk group'],
      cons: ['Daily pill side effects: diarrhea, high blood pressure, sore hands and feet, tiredness', 'Responses tend not to last as long once treatment stops'],
      fit: 'Symptoms or fast growth that need control soon, and favorable risk' },
  ];

  const FX_COLS = ['io', 'tk'];
  // People out of 100 with each side effect. IO + IO: CheckMate 214, treatment-related, 8-year report and Yervoy/Opdivo labels.
  // IO + TKI: range across KEYNOTE-426 (Inlyta label), CheckMate 9ER (Lancet Oncol 2022, Cabometyx label) and CLEAR (NEJM 2021).
  const FX = [
    ['How it is given', ['Vein every 3 weeks for 4 doses, then nivolumab every 2 or 4 weeks', 'Vein every 2 to 6 weeks, plus a pill every day']],
    ['How long', ['Nivolumab continues while it works and is tolerated', 'Immunotherapy for up to 2 years; the pill continues while it works']],
    ['Serious side effects', [['md', 'About 48 in 100 (older pill: 64)'], ['hi', 'About 63 to 72 in 100 (older pill: 54 to 59)']]],
    ['Stopped because of side effects', [['md', 'About 24 in 100 stopped both drugs'], ['md', '26 to 37 in 100 stopped one drug; 7 to 13 stopped both']]],
    ['Needed high-dose steroids', [['hi', 'About 30 to 35 in 100'], ['md', 'About 14 to 22 in 100']]],
    ['Diarrhea', [['md', '29 in 100; immune colitis in about 10'], ['hi', '56 to 64 in 100']]],
    ['High blood pressure', [['lo', '2 in 100'], ['hi', '33 to 55 in 100; severe in 13 to 28']]],
    ['Sore hands and feet, mouth sores', [['lo', 'Hands and feet 1 in 100; mouth sores 5'], ['md', 'Hands and feet 28 to 40 in 100; mouth sores 17 to 35']]],
    ['Tiredness, poor appetite', [['md', 'Tiredness 38 in 100; poor appetite 14'], ['md', 'Tiredness 27 to 52 in 100; poor appetite 22 to 40']]],
    ['Thyroid', [['md', 'Underactive in about 17 to 22 in 100; overactive in 12'], ['md', 'Underactive in 35 to 47 in 100']]],
    ['Liver tests', [['md', 'Rise in about 12 in 100; immune hepatitis in 7'], ['md', 'Rise in 28 to 60 in 100; severe in 6 to 20, most with axitinib']]],
    ['Itch, rash', [['md', 'Itch 31, rash 23 in 100'], ['md', 'Rash 21 to 27 in 100']]],
    ['Adrenal or pituitary gland', [['md', 'About 7 and 5 in 100; some need hormone pills for life'], ['lo', 'Adrenal in about 2 to 5 in 100']]],
    ['Lung inflammation', [['md', 'About 4 to 6 in 100'], ['md', 'About 3 to 4 in 100']]],
    ['Other', [['md', 'Dose is not lowered; doses are held or stopped instead'], ['md', 'Pill dose lowered in 22 (axitinib) to 69 (lenvatinib) in 100; hoarse voice 12 to 30; with lenvatinib, weight loss and protein in the urine in about 30']]],
    ['Deaths from side effects', [['md', 'About 1 to 2 in 100'], ['md', 'Under 1 in 100']]],
  ];

  /* ---------- state ---------- */
  const FACTORS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
  const BLANK = { plan: null, f1: null, f2: null, f3: null, f4: null, f5: null, f6: null };
  const S = { sel: 'io', ...BLANK };

  // IMDC: 0 risk factors favorable, 1–2 intermediate, 3 or more poor. Waits until it can be decided.
  function risk() {
    const yes = FACTORS.filter(k => S[k] === 'yes').length, open = FACTORS.filter(k => S[k] === null).length;
    if (yes >= 3) return 'poor';
    if (open) return null;
    return yes === 0 ? 'fav' : 'int';
  }
  const grp = () => ({ fav: 'Fav', int: 'Ip', poor: 'Ip' }[risk()] || 'All');
  function resp(r, g = grp()) {
    const cr = CFG[`${r}Cr${g}`], orr = CFG[`${r}Orr${g}`], pd = CFG[`${r}Pd${g}`];
    return { cr, pr: orr - cr, sd: 100 - orr - pd, pd, orr };
  }

  /* ---------- render ---------- */
  const optsEl = $('#opts'), tabsEl = $('#tabs'), planEl = $('#planPick');
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
  });
  ['Nivolumab + ipilimumab', 'Pembrolizumab + axitinib', 'Nivolumab + cabozantinib', 'Pembrolizumab + lenvatinib', 'Watching with scans for now', 'A clinical trial'].forEach(n => {
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

  // Bars for the three differences. Rows: [label, value, max, unit, ref?, option id]
  function bars(el, rows) {
    el.innerHTML = rows.map(([label, v, max, unit, ref, id, bad]) =>
      `<div class="drow${ref ? ' ref' : ''}${bad ? ' bad' : ''}${id === S.sel ? ' sel' : ''}"><span>${label}</span><div class="dbar"><i style="width:${Math.min(100, v / max * 100)}%"></i></div><span class="v">${v}${unit}</span></div>`).join('');
  }

  function select(id) { S.sel = id; render(); }

  function render() {
    const rk = risk(), g = grp();
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $$('.mchips').forEach(m => $$('.chip', m).forEach(c => c.setAttribute('aria-pressed', S[m.dataset.k] === c.dataset.v)));

    const tag = $('#riskTag');
    tag.textContent = { fav: 'Favorable risk', int: 'Intermediate risk', poor: 'Poor risk' }[rk] || 'Answer the six questions';
    tag.className = 'tag ' + (rk ? 'yes' : 'no');

    $('#verdict').innerHTML = rk === 'fav'
      ? 'For favorable risk: <span class="hand">IO + TKI is used most often.</span> In this group, IO + IO shrank tumors in fewer people than the older pill did, and it is approved in the US only for intermediate or poor risk, though some guidelines list it as an option. Neither approach has yet been shown to help favorable-risk patients live longer than the older pill.'
      : rk ? `For ${rk === 'int' ? 'intermediate' : 'poor'} risk: <span class="hand">both approaches are good choices.</span> The differences below help decide which fits you.`
      : 'Answer the six risk questions in part 1 to see which approaches fit your risk group.';

    const o = resp(S.sel), cols = [[o.cr, 'var(--green)'], [o.pr, 'var(--blue)'], [o.sd, 'var(--free)'], [o.pd, 'var(--red)']];
    let n = 0; const fill = [];
    cols.forEach(([k, c]) => { for (let i = 0; i < k; i++) fill[n++] = c; });
    figs.forEach((f, i) => f.setAttribute('fill', fill[i] || 'var(--free)'));
    $('#nCr').textContent = o.cr; $('#nPr').textContent = o.pr; $('#nSd').textContent = o.sd; $('#nPd').textContent = o.pd;
    $('#basis').textContent = rk
      ? `Results for people with ${GROUPS[g]} in the studies.`
      : `Results for everyone in the studies, all risk groups together. Answer the risk questions in part 1 to fit the picture to you.`;
    const nm = OPTIONS.find(x => x.id === S.sel).short;
    $('#say').textContent = `With ${nm}, tumors shrank or disappeared in about ${o.orr} out of 100 people. In about ${o.pd} out of 100, the cancer grew in spite of treatment.`;
    $('#peopleDesc').textContent = `${o.cr} cancer disappeared, ${o.pr} tumors shrank, ${o.sd} stayed the same, ${o.pd} grew despite treatment.`;

    const a = resp('io'), b = resp('tk');
    bars($('#dShrink'), [['IO + IO: tumors shrank', a.orr, 100, ' in 100', false, 'io'], ['IO + TKI: tumors shrank', b.orr, 100, ' in 100', false, 'tk'],
      ['IO + IO: grew at first', a.pd, 100, ' in 100', false, 'io', true], ['IO + TKI: grew at first', b.pd, 100, ' in 100', false, 'tk', true]]);
    bars($('#dLast'), [['IO + IO', CFG.ioDor, 90, ' months', false, 'io'], ['IO + TKI', CFG.tkDor, 90, ' months', false, 'tk']]);
    const og = g === 'Fav' ? null : g;
    $('#dLiveNote').hidden = !!og;
    $('#dLive').hidden = !og;
    if (og) bars($('#dLive'), [['IO + IO', CFG['ioOs5' + og], 100, ' in 100', false, 'io'], ['IO + TKI', CFG['tkOs5' + og], 100, ' in 100', false, 'tk'], ['Older pill (sunitinib)', CFG['suOs5' + og], 100, ' in 100', true]]);
    autosize();
  }

  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
