  // Trial results, % of people. A = PACIFIC 5-year (chemoradiation then durvalumab vs placebo).
  // B = simple mean of CheckMate 816 final and KEYNOTE-671 5-year (chemo-immunotherapy before surgery vs chemo alone);
  // pCR and reaching surgery also include AEGEAN. The doctor can update these in Edit mode.
  const CFG_DEFAULTS = {
    aOs: 43, aOsC: 33, aPfs: 33, aPfsC: 19,
    bOs: 65, bOsC: 54, bEfs: 50, bEfsC: 30,
    bPcr: 20, bPcrC: 4, bSurg: 82, bSurgC: 78,
  };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 'aOs', step: 1, label: 'A, chemoradiation then durvalumab: alive at 5 years (%)' },
    { k: 'aOsC', step: 1, label: 'A, chemoradiation alone (placebo): alive at 5 years (%)' },
    { k: 'aPfs', step: 1, label: 'A, durvalumab: alive without progression at 5 years (%)' },
    { k: 'aPfsC', step: 1, label: 'A, placebo: alive without progression at 5 years (%)' },
    { k: 'bOs', step: 1, label: 'B, chemo-immunotherapy then surgery: alive at 5 years (%)' },
    { k: 'bOsC', step: 1, label: 'B, chemo then surgery: alive at 5 years (%)' },
    { k: 'bEfs', step: 1, label: 'B, chemo-immunotherapy: event-free at 5 years (%)' },
    { k: 'bEfsC', step: 1, label: 'B, chemo alone: event-free at 5 years (%)' },
    { k: 'bPcr', step: 1, label: 'B, chemo-immunotherapy: no living cancer at surgery (pCR, %)' },
    { k: 'bPcrC', step: 1, label: 'B, chemo alone: no living cancer at surgery (pCR, %)' },
    { k: 'bSurg', step: 1, label: 'B, chemo-immunotherapy: reached surgery (%)' },
    { k: 'bSurgC', step: 1, label: 'B, chemo alone: reached surgery (%)' },
  ];
  const onCfg = () => render();

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'a', short: 'A: Chemoradiation', name: 'Chemo + radiation, then durvalumab', trial: 'PACIFIC',
      how: 'Chemo with daily radiation (Monday to Friday) for about 6 weeks, then durvalumab in a vein every 2 or 4 weeks for 1 year',
      pros: ['No operation', 'Works when surgery is not possible or not safe', 'Durvalumab after chemoradiation raised 5-year survival by about 10 in 100'],
      cons: ['Radiation can cause painful swallowing and lung inflammation', 'About a year and a half of treatment in all', 'Durvalumab is only given if the cancer has not grown during chemoradiation'],
      fit: 'When surgery is not possible, or would mean removing a whole lung' },
    { id: 'b', short: 'B: Surgery', name: 'Chemo-immunotherapy, then surgery', trial: 'CheckMate 816 · KEYNOTE-671 · AEGEAN',
      how: 'Chemo + immunotherapy (nivolumab, pembrolizumab or durvalumab) in a vein every 3 weeks for 3 or 4 cycles, then surgery, with or without immunotherapy for about 1 year after',
      pros: ['The tumor is removed and checked, so we learn how well treatment worked', 'In about 1 in 5 people no living cancer is left at surgery', 'Immunotherapy raised 5-year survival by about 10 in 100'],
      cons: ['Needs an operation, a hospital stay and weeks of recovery', 'About 1 in 5 do not reach surgery, from side effects, cancer growth or other reasons', 'Only for people a surgeon judges can safely have the cancer removed'],
      fit: 'When a surgeon judges the cancer can be fully removed and you are fit for surgery' },
  ];

  const FX_COLS = ['a', 'b'];
  // People out of 100. "Added by immunotherapy" rows are immunotherapy minus placebo or chemo alone in the same trial.
  // A: PACIFIC (Antonia NEJM 2017; Imfinzi label). B: KEYNOTE-671 (Wakelee NEJM 2023), AEGEAN (Heymach NEJM 2023), CheckMate 816 (Forde NEJM 2022).
  const FX = [
    ['How it is given', ['Chemo weekly or every 3 to 4 weeks, with radiation 5 days a week; then a vein drip every 2 or 4 weeks', 'Vein drip every 3 weeks for 3 or 4 cycles; surgery about 4 to 6 weeks later; then a drip every 3 or 4 weeks in some plans']],
    ['How long', ['About 6 weeks, then 1 year of durvalumab', 'About 3 months, surgery and recovery, then about 1 year in some plans']],
    ['From the main treatment itself', [['md', 'Painful swallowing from radiation is common; severe in about 7 in 100. Tiredness, low blood counts, skin redness'], ['md', 'Chemo: tiredness, nausea, low blood counts. Surgery: a few days in hospital, weeks of recovery; about 1 in 100 die within 30 days of a lobectomy']]],
    ['Serious side effects added by immunotherapy', [['lo', 'About 4 more in 100 (30 vs 26 with placebo)'], ['lo', 'About the same to 7 more in 100 (33 to 45 vs 37 to 43)']]],
    ['Stopped because of side effects', [['md', 'About 5 more in 100 (15 vs 10 with placebo)'], ['md', 'About 6 in 100 could not have surgery because of side effects (4 without immunotherapy)']]],
    ['Lung inflammation (pneumonitis)', [['md', 'About 9 more in 100 (34 vs 25, mostly from radiation); severe in about 1 more'], ['lo', 'About 4 more in 100 (6 vs 2)']]],
    ['Thyroid', [['md', 'Underactive in about 10 more in 100 (12 vs 2)'], ['md', 'Underactive in about 9 more in 100 (11 vs 2)']]],
    ['Rash, itch', [['md', 'Rash about 11 more in 100; itch about 6 more'], ['md', 'Not reported separately in the main papers']]],
    ['Any immune side effect', [['md', 'About 16 more in 100 (24 vs 8)'], ['md', 'About 14 more in 100 (24 to 25 vs 10 to 11)']]],
    ['Deaths from side effects', [['md', 'About 4 to 6 in 100 in both groups, mostly lung problems after radiation'], ['md', 'About 1 to 2 in 100 in both groups']]],
  ];

  /* ---------- state ---------- */
  const BLANK = { plan: null, drv: null, surg: null };
  const S = { sel: 'a', ...BLANK };

  // Which approaches are open. Waits until both answers are in, except when a gene change is found.
  function fit() {
    if (S.drv === 'pos') return 'tgt';
    if (S.drv === null || S.surg === null) return null;
    if (S.drv === 'wait') return 'wait';
    return { yes: 'both', no: 'crt', maybe: 'review' }[S.surg];
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
  ['Chemoradiation, then durvalumab', 'Chemo-immunotherapy, then surgery', 'Targeted pill plan (gene change found)', 'Chemo and radiation one after the other', 'A clinical trial', 'Still deciding'].forEach(n => {
    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = n; p.textContent = n; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === n ? null : n; render(); };
    planEl.append(p);
  });
  $$('.mchips').forEach(g => $$('.chip', g).forEach(c => c.onclick = () => {
    const k = g.dataset.k; S[k] = S[k] === c.dataset.v ? null : c.dataset.v; render();
  }));

  const fx = $('#fx');
  fx.innerHTML = `<thead><tr><th></th>${FX_COLS.map(id => `<th data-id="${id}">${OPTIONS.find(o => o.id === id).name}</th>`).join('')}</tr></thead><tbody>${
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

  // Rows: [label, value, max, unit, ref (older treatment, grey), option id]
  function bars(el, rows) {
    el.innerHTML = rows.map(([label, v, max, unit, ref, id]) =>
      `<div class="drow${ref ? ' ref' : ''}${id === S.sel ? ' sel' : ''}"><span>${label}</span><div class="dbar"><i style="width:${Math.min(100, v / max * 100)}%"></i></div><span class="v">${v}${unit}</span></div>`).join('');
  }

  function select(id) { S.sel = id; render(); }

  const FIT = {
    both: ['Both approaches', 'Both approaches are open to you. <span class="hand">The choice depends on what matters to you</span> and on the team’s view of how much surgery would be needed.'],
    crt: ['Chemoradiation', 'Surgery is not an option, so <span class="hand">chemo and radiation, then durvalumab for a year</span>, is the standard approach.'],
    review: ['Both, pending review', 'Both may be open. <span class="hand">A surgeon’s opinion and a team review come first</span>, then we can choose together.'],
    tgt: ['Targeted pill', 'A gene change was found, so <span class="hand">immunotherapy is usually left out</span>. We would pair chemoradiation or surgery with a targeted pill instead (see below).'],
    wait: ['Waiting for tests', 'The gene tests should come back <span class="hand">before we start immunotherapy</span>, because a gene change would change the plan.'],
  };

  function render() {
    const f = fit();
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $$('.mchips').forEach(m => $$('.chip', m).forEach(c => c.setAttribute('aria-pressed', S[m.dataset.k] === c.dataset.v)));

    const tag = $('#fitTag');
    tag.textContent = f ? FIT[f][0] : 'Answer the two questions';
    tag.className = 'tag ' + (f ? 'yes' : 'no');
    $('#verdict').innerHTML = f ? FIT[f][1] : 'Answer the two questions in part 1 to see which approaches fit you.';

    const a = S.sel === 'a', os = a ? CFG.aOs : CFG.bOs, base = a ? CFG.aOsC : CFG.bOsC, add = Math.max(0, os - base), rest = 100 - base - add;
    figs.forEach((g, i) => g.setAttribute('fill', i < base ? 'var(--green)' : i < base + add ? 'var(--blue)' : 'var(--free)'));
    $('#nBase').textContent = base; $('#nAdd').textContent = add; $('#nRest').textContent = rest;
    $('#basis').textContent = a
      ? 'Option A, PACIFIC: people who had finished chemoradiation without the cancer growing, then durvalumab or a placebo.'
      : 'Option B, CheckMate 816 and KEYNOTE-671 together: people with stage II or III cancer that a surgeon could remove, treated with or without immunotherapy.';
    $('#say').textContent = `With ${a ? 'chemoradiation then durvalumab' : 'chemo-immunotherapy then surgery'}, about ${os} out of 100 people were alive at 5 years, compared with ${base} with the older treatment in the same study.`;
    $('#peopleDesc').textContent = `${base} alive with the older treatment, ${add} more alive with immunotherapy, ${rest} did not live 5 years.`;

    bars($('#dLive'), [['A: + durvalumab', CFG.aOs, 100, ' in 100', false, 'a'], ['A: chemoradiation alone', CFG.aOsC, 100, ' in 100', true],
      ['B: chemo-immunotherapy', CFG.bOs, 100, ' in 100', false, 'b'], ['B: chemo alone', CFG.bOsC, 100, ' in 100', true]]);
    bars($('#dFree'), [['A: + durvalumab', CFG.aPfs, 100, ' in 100', false, 'a'], ['A: chemoradiation alone', CFG.aPfsC, 100, ' in 100', true],
      ['B: chemo-immunotherapy', CFG.bEfs, 100, ' in 100', false, 'b'], ['B: chemo alone', CFG.bEfsC, 100, ' in 100', true]]);
    bars($('#dSurg'), [['Reached surgery', CFG.bSurg, 100, ' in 100', false, 'b'], ['Reached surgery, chemo alone', CFG.bSurgC, 100, ' in 100', true],
      ['No living cancer left', CFG.bPcr, 100, ' in 100', false, 'b'], ['No living cancer, chemo alone', CFG.bPcrC, 100, ' in 100', true]]);
    autosize();
  }

  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
