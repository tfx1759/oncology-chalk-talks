  const CFG_DEFAULTS = { base: 15, tam: 0.60, aiVsTam: 0.80 };
  const CFG = { ...CFG_DEFAULTS, ...(EDITS.settings || {}) };
  const CFG_SPEC = [
    { k: 'base', step: 1, label: 'Default 10-year recurrence with no endocrine therapy (%)' },
    { k: 'tam', step: 0.01, label: 'Relative risk, tamoxifen 5 years vs none' },
    { k: 'aiVsTam', step: 0.01, label: 'Relative risk, aromatase inhibitor vs tamoxifen' },
  ];
  const onCfg = k => { if (!k || k === 'base') S.base = CFG.base; render(); };

  /* ---------- content ---------- */
  const OPTIONS = [
    { id: 'none', short: 'No pill', name: 'No hormone pill',
      how: 'Mammograms and checkups only',
      pros: ['No pill side effects'],
      cons: ['Highest chance the cancer comes back'],
      fit: 'Women with very small, very low-risk tumors, or who decide the benefit is not worth it to them' },
    { id: 'tam', short: 'Tamoxifen', name: 'Tamoxifen, 5 years',
      how: 'One pill a day. Blocks estrogen at the cancer cell',
      pros: ['No added joint aches', 'Helps keep bones strong'],
      cons: ['A bit less effective than aromatase inhibitors after menopause', 'Small risk of blood clots and uterine cancer', 'Hot flashes'],
      fit: 'Women with bone thinning, or who can’t tolerate an aromatase inhibitor' },
    { id: 'ai', short: 'Aromatase inhibitor', name: 'Aromatase inhibitor, 5 years',
      how: 'Anastrozole, letrozole or exemestane. One pill a day. Lowers estrogen in the body',
      pros: ['Most effective after menopause', 'No added risk of blood clots or uterine cancer'],
      cons: ['Joint and muscle aches', 'Bone thinning: needs bone scans, calcium and vitamin D', 'Vaginal dryness'],
      fit: 'The usual first choice after menopause' },
  ];

  const FX = [
    ['How it is taken', ['Nothing to take', 'One pill daily', 'One pill daily']],
    ['Hot flashes', [['lo', 'Usual after menopause'], ['md', 'Common; somewhat more than with an aromatase inhibitor'], ['md', 'Common']]],
    ['Joint and muscle aches', [['lo', 'Usual for age'], ['lo', 'No added risk'], ['hi', 'Common; up to half notice new or worse aches']]],
    ['Bone thinning, fractures', [['lo', 'Usual for age'], ['lo', 'Protects bones'], ['hi', 'Bone loss; about 1 in 10 have a fracture over 5 years, vs about 1 in 13 on tamoxifen']]],
    ['Blood clots', [['lo', 'Usual for age'], ['hi', 'Small added risk, about 2 more in 100'], ['lo', 'No added risk']]],
    ['Uterine cancer', [['lo', 'Usual for age'], ['hi', 'Small added risk, under 1 in 100'], ['lo', 'No added risk']]],
    ['Vaginal dryness, sex', [['lo', 'Usual'], ['md', 'Discharge is common'], ['md', 'Dryness is common']]],
  ];

  /* ---------- state ---------- */
  // What Clear ink and Print blank reset (typed fields and ticks are reset separately).
  const BLANK = { plan: null };
  const S = { base: CFG.base, sel: 'ai', plan: null };
  const RR = { none: 1, get tam() { return CFG.tam; }, get ai() { return CFG.tam * CFG.aiVsTam; } };
  function outcome(id) {
    const s0 = 1 - S.base / 100;
    const rec = Math.round(100 * (1 - Math.pow(s0, RR[id])));
    return { free: 100 - S.base, ben: S.base - rec, rec };
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
  });
  ['Anastrozole', 'Letrozole', 'Exemestane', 'Tamoxifen', 'Tamoxifen, then an aromatase inhibitor', 'No hormone pill'].forEach(n => {
    const p = document.createElement('button');
    p.className = 'chip'; p.dataset.id = n; p.textContent = n; p.setAttribute('aria-pressed', 'false');
    p.onclick = () => { S.plan = S.plan === n ? null : n; render(); };
    planEl.append(p);
  });

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

  /* CDK4/6 trial match from section 1 */
  function num(id) { const v = parseFloat($('#' + id).value); return isNaN(v) ? null : v; }
  function trials() {
    const size = num('size'), n = num('nodes'), g = num('grade'), ki = num('ki67'), rs = num('rs');
    const natalee = n >= 1 || size > 5 || (size > 2 && (g >= 3 || (g === 2 && (ki >= 20 || rs >= 26))));
    const monarch = n >= 4 || (n >= 1 && (g >= 3 || size >= 5));
    return { natalee, monarch, rs, known: size !== null && n !== null && g !== null };
  }

  function render() {
    $$('.opt', optsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('.btn', tabsEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.sel));
    $$('[data-id]', fx).forEach(c => c.classList.toggle('selcol', c.dataset.id === S.sel));
    $$('.chip', planEl).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.plan));
    $('#base').value = S.base; $('#baseOut').textContent = S.base + '%';

    const o = outcome(S.sel);
    figs.forEach((g, i) => g.setAttribute('fill', i < o.free ? 'var(--free)' : i < o.free + o.ben ? 'var(--blue)' : 'var(--red)'));
    $('#nFree').textContent = o.free; $('#nBen').textContent = o.ben; $('#nRec').textContent = o.rec;
    const opt = OPTIONS.find(x => x.id === S.sel);
    $('#say').textContent = S.sel === 'none'
      ? `Without a hormone pill, about ${o.rec} out of 100 women like you would have the cancer come back.`
      : `With ${opt.short === 'Tamoxifen' ? 'tamoxifen' : 'an aromatase inhibitor'}, about ${o.ben} fewer women out of 100 have the cancer come back than with no pill.`;
    $('#peopleDesc').textContent = `${o.free} free of cancer with surgery alone, ${o.ben} free of cancer because of the pill, ${o.rec} with cancer returning.`;
    OPTIONS.forEach(x => {
      const r = $(`.crow[data-id="${x.id}"]`, cmpEl), oc = outcome(x.id);
      r.classList.toggle('sel', x.id === S.sel);
      $('.b', r).style.width = oc.ben + '%';
      $('.v', r).textContent = x.id === 'none' ? '—' : '+' + oc.ben;
    });

    const t = trials();
    const tag = (el, ok) => {
      el.textContent = !t.known ? 'Fill in part 1 to check' : ok ? 'Matches who was in this study' : 'You would not have qualified';
      el.className = 'tag ' + (ok && t.known ? 'yes' : 'no');
    };
    tag($('#tagNat'), t.natalee); tag($('#tagMon'), t.monarch);
    $('#tNat').classList.toggle('dim', t.known && !t.natalee); $('#tMon').classList.toggle('dim', t.known && !t.monarch);
    $('#verdict').innerHTML = !t.known
      ? 'Fill in the tumor size, lymph nodes and grade in part 1 to see whether these studies apply to your cancer.'
      : !t.natalee && !t.monarch
      ? 'For your cancer: <span class="hand">a hormone pill alone is the standard.</span> Your cancer is lower risk than the women in these studies.'
      : `For your cancer: <span class="hand">this is worth discussing.</span> Your cancer matches who was in ${t.natalee && t.monarch ? 'both studies' : t.natalee ? 'the ribociclib study' : 'the abemaciclib study'}.`;
    $('#rsLine').hidden = t.rs !== null && t.rs > 25;
    autosize();
  }

  $('#base').oninput = e => { S.base = +e.target.value; render(); };
  ['size', 'nodes', 'grade', 'ki67', 'rs'].forEach(id => $('#' + id).addEventListener('input', render));
  $('#visitDate').value = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  function autosize() { $$('textarea.lines').forEach(t => { t.style.height = 'auto'; t.style.height = Math.max(64, t.scrollHeight) + 'px'; }); }
  $$('textarea.lines').forEach(t => t.addEventListener('input', autosize));
