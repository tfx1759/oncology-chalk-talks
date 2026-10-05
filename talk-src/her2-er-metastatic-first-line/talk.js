  // Median progression-free survival (months) as reported by each trial; the doctor can update these in Edit mode.
  const CFG_DEFAULTS = { pfsEt: 29.1, pfsPal: 44.3, induct: 4, pfsDxd: 38.0, pfsThp: 27.7 };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 'pfsEt', step: 0.1, label: 'PATINA, HP + endocrine therapy: median PFS from randomization (months)' },
    { k: 'pfsPal', step: 0.1, label: 'PATINA, HP + endocrine therapy + palbociclib: median PFS from randomization (months)' },
    { k: 'induct', step: 0.5, label: 'PATINA induction THP before randomization, drawn hatched (months)' },
    { k: 'pfsDxd', step: 0.1, label: 'DESTINY-Breast09, T-DXd + pertuzumab: median PFS, HR-positive subgroup (months)' },
    { k: 'pfsThp', step: 0.1, label: 'DESTINY-Breast09, THP: median PFS, HR-positive subgroup (months)' },
  ];
  const onCfg = () => render();
  const SPAN = 60; // months shown on the timeline

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'et', short: 'Chemo, then HP + pill', name: 'Chemo + HP, then HP + a hormone pill', trial: 'CLEOPATRA · PATINA control group',
      how: 'Taxane chemo with trastuzumab and pertuzumab (THP) every 3 weeks for 4 to 8 doses. Then HP every 3 weeks plus a daily aromatase inhibitor, for as long as it keeps working',
      pros: ['The longest track record of the three', 'Chemo stops after a few months', 'Keeps T-DXd for later, when it still works very well'],
      cons: ['Chemo side effects for those months: hair loss, numbness, low blood counts', 'In each study, the newer plan kept the cancer under control longer than this one'],
      fit: 'Many people, especially those who want a break from chemo' },
    { id: 'pal', short: '+ palbociclib', name: 'Same, plus palbociclib after chemo', trial: 'PATINA',
      how: 'The same chemo + HP first. Then HP, a daily aromatase inhibitor, and palbociclib pills 3 weeks on, 1 week off',
      pros: ['After chemo, the cancer stayed under control for a median of 44 months, versus 29 without palbociclib', 'Still a break from chemo after the first months'],
      cons: ['Low white blood counts in most people, so regular blood tests', 'More diarrhea, mouth sores and tiredness; about half needed a lower dose', 'Not yet known whether it helps people live longer'],
      fit: 'People whose cancer is controlled after chemo who want the longest time before it grows' },
    { id: 'dxd', short: 'T-DXd + pertuzumab', name: 'T-DXd + pertuzumab', trial: 'DESTINY-Breast09',
      how: 'Both in a vein every 3 weeks, for as long as it keeps working. A hormone pill can be added after 6 doses',
      pros: ['For ER-positive cancers, the cancer stayed under control for a median of 38 months, versus 28 with THP', 'More tumors disappeared completely on scans', 'No taxane, so less numbness'],
      cons: ['Ongoing treatment with no planned break: nausea in 3 of 4 people, tiredness, hair loss in about half', 'Lung inflammation in about 1 in 8, usually mild; about 1 in 200 died of it', 'Not yet known whether it helps people live longer'],
      fit: 'People who want the longest control from the start and accept ongoing treatment' },
  ];

  const ROWS = [
    { id: 'et', label: 'Chemo + HP, then HP + hormone pill', src: 'PATINA · counted after chemo', chemo: true, pfs: () => CFG.pfsEt },
    { id: 'pal', label: '… plus palbociclib', src: 'PATINA · counted after chemo', chemo: true, pfs: () => CFG.pfsPal },
    { id: 'dxd', label: 'T-DXd + pertuzumab', src: 'DESTINY-Breast09, ER-positive · counted from day 1', pfs: () => CFG.pfsDxd },
    { id: 'thp', label: 'THP', src: 'DESTINY-Breast09 comparison group, ER-positive', ref: true, pfs: () => CFG.pfsThp },
  ];

  // Side effects from the randomized comparisons: DESTINY-Breast09 (T-DXd + pertuzumab vs THP) and
  // PATINA maintenance (with vs without palbociclib), as listed in the FDA labels.
  const FX = [
    ['How it is given', ['THP every 3 weeks for 4 to 8 doses, then HP every 3 weeks and a daily pill', 'Same, plus palbociclib pills 3 weeks on, 1 week off', 'T-DXd and pertuzumab every 3 weeks, ongoing']],
    ['Time on chemo', [['md', '4 to 8 doses, then a break'], ['md', '4 to 8 doses, then a break'], ['hi', 'Ongoing, no planned break']]],
    ['Hair loss', [['hi', 'About half, during chemo; it grows back'], ['hi', 'Same as chemo + HP'], ['hi', 'About half (48 in 100), while on it']]],
    ['Nausea, vomiting', [['md', 'Nausea in about 1 in 3, during chemo'], ['md', 'After chemo, nausea in 30 vs 15 in 100'], ['hi', 'Nausea in 3 of 4; vomiting in about half']]],
    ['Diarrhea', [['md', 'About 6 in 10, mostly during chemo'], ['hi', 'After chemo, 70 vs 37 in 100'], ['md', 'About 6 in 10']]],
    ['Severe drop in white counts', [['md', 'About 4 in 10, during chemo'], ['hi', 'About half on palbociclib; fevers from it were rare'], ['md', 'About 3 in 10']]],
    ['Mouth sores', [['md', 'About 1 in 6, during chemo'], ['hi', 'After chemo, 44 vs 11 in 100'], ['md', 'About 1 in 6']]],
    ['Tiredness', [['md', 'About 4 in 10'], ['md', 'After chemo, 32 vs 21 in 100'], ['md', 'About half']]],
    ['Numbness in hands and feet', [['md', 'About 3 in 10, from the taxane; can last'], ['md', 'Same as chemo + HP'], ['lo', 'About 1 in 10']]],
    ['Lung inflammation', [['lo', 'About 1 in 100'], ['lo', 'Uncommon'], ['hi', 'About 12 in 100; 2 of 381 people died of it']]],
    ['Heart pumping weakens', [['md', 'About 4 to 7 in 100; checked with heart scans'], ['md', 'Same; checked with heart scans'], ['md', 'About 11 in 100; checked with heart scans']]],
    ['Joint aches, hot flashes, bone thinning', [['md', 'From the hormone pill'], ['md', 'From the hormone pill'], ['lo', 'Only if a hormone pill is added']]],
  ];

  /* ---------- state ---------- */
  const S = { sel: 'et', plan: null, meno: null };
  const BLANK = { plan: null, meno: null };

  /* ---------- render ---------- */
  const optsEl = $('#opts'), tabsEl = $('#tabs'), tlEl = $('#timeline'), planEl = $('#planPick');
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
  [...OPTIONS.map(o => o.name), 'A clinical trial'].forEach(n => {
    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = n; p.textContent = n; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === n ? null : n; render(); };
    planEl.append(p);
  });
  $$('#menoChips .chip').forEach(c => c.onclick = () => { S.meno = S.meno === c.dataset.v ? null : c.dataset.v; render(); });

  ROWS.forEach(r => {
    const row = document.createElement('div');
    row.className = 'tl' + (r.ref ? ' ref' : ''); row.dataset.id = r.id;
    row.innerHTML = `<span>${r.label}<small>${r.src}</small></span><div class="ttrack">${r.chemo ? '<i class="seg chemo"></i>' : ''}<i class="seg pfs"></i></div><span class="v"></span>`;
    tlEl.append(row);
  });
  const axis = document.createElement('div');
  axis.className = 'axis'; axis.setAttribute('aria-hidden', 'true');
  axis.innerHTML = `<span></span><div class="ticks">${[0, 12, 24, 36, 48, 60].map(m =>
    `<span style="left:${m / SPAN * 100}%">${m ? m / 12 + (m === 12 ? ' year' : ' years') : 'Start'}</span>`).join('')}</div><span></span>`;
  tlEl.append(axis);

  const fx = $('#fx');
  fx.innerHTML = `<thead><tr><th></th>${OPTIONS.map(o => `<th data-id="${o.id}">${o.short}</th>`).join('')}</tr></thead><tbody>${
    FX.map(([label, cells]) => `<tr><th>${label}</th>${cells.map((c, i) =>
      `<td data-id="${OPTIONS[i].id}">${Array.isArray(c) ? `<span class="lvl ${c[0]}">${c[1]}</span>` : c}</td>`).join('')}</tr>`).join('')
  }</tbody>`;

  function select(id) { S.sel = id; render(); }
  const mo = v => (Math.round(v * 10) / 10).toString();

  function render() {
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $$('#menoChips .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === S.meno));
    $('#menoNote').hidden = S.meno === 'post';

    ROWS.forEach(r => {
      const row = $(`.tl[data-id="${r.id}"]`, tlEl), start = r.chemo ? CFG.induct : 0, pfs = r.pfs();
      row.classList.toggle('sel', r.id === S.sel);
      if (r.chemo) Object.assign($('.seg.chemo', row).style, { left: '0', width: (start / SPAN * 100) + '%' });
      Object.assign($('.seg.pfs', row).style, { left: (start / SPAN * 100) + '%', width: (Math.min(pfs, SPAN - start) / SPAN * 100) + '%' });
      $('.v', row).textContent = mo(pfs) + ' mo';
    });
    $('#say').textContent = {
      et: `In PATINA, people starting HP and a hormone pill after chemo had a median of ${mo(CFG.pfsEt)} months before the cancer grew.`,
      pal: `In PATINA, adding palbociclib after chemo raised that from ${mo(CFG.pfsEt)} to ${mo(CFG.pfsPal)} months.`,
      dxd: `In DESTINY-Breast09, for ER-positive cancers, T-DXd + pertuzumab kept the cancer under control for a median of ${mo(CFG.pfsDxd)} months, versus ${mo(CFG.pfsThp)} with THP.`,
    }[S.sel];
    autosize();
  }

  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
