/* Unit 1 - Relations: product sets, pictorial representations, composition, types, closures, equivalence relations, partitions.
   One shared "relation workbench" (RS) drives the cards on this page: build R once, see it everywhere. */
(() => {
  const { esc, tbl, seg, list, set, txt, svg, col, tf, yes, no, chips } = DM;
  const P = DM.page('u1r', 'Relations', 'A relation is a set of ordered pairs. Build one relation R in the first card by clicking cells of the grid (or load a preset) – every other card on this page analyses that same relation: arrow diagrams, composition, properties, closures, equivalence classes and partitions.');
  const CL = ['#e6c9a8', '#cfe3f1', '#d9ecd5', '#f3d6d0', '#e7ddf0', '#f6efc8', '#d9d2c3', '#c8dde0'];
  const key = (a, b) => a + '\t' + b;
  const RS = { A: ['1', '2', '3', '4'], B: ['1', '2', '3', '4'], R: new Set(), sq: true, subs: [] };
  DM.RS = RS;
  const pairs = (R = RS.R) => [...R].map(k => k.split('\t'));
  const fmtP = ps => ps.length ? '{' + ps.map(([a, b]) => `(${esc(a)}, ${esc(b)})`).join(', ') + '}' : '∅';
  const notify = () => RS.subs.forEach(f => f());
  const nv = (x, arr) => isNaN(x) || x === '' ? arr.indexOf(x) + 1 : +x;
  const PRESETS = [['a divides b', (a, b) => a !== 0 && b % a === 0], ['a < b', (a, b) => a < b], ['a ≤ b', (a, b) => a <= b], ['a = b (identity)', (a, b) => a === b], ['a ≡ b (mod 2)', (a, b) => (a - b) % 2 === 0], ['a + b is even', (a, b) => (a + b) % 2 === 0], ['a + b = 5', (a, b) => a + b === 5], ['b = a + 1', (a, b) => b === a + 1], ['Empty relation', () => false], ['Universal relation A × B', () => true]];
  const applyPred = f => { RS.R = new Set(); RS.A.forEach(a => RS.B.forEach(b => { if (f(nv(a, RS.A), nv(b, RS.B))) RS.R.add(key(a, b)); })); };
  const M = () => RS.A.map(a => RS.B.map(b => RS.R.has(key(a, b))));
  /* generic multi-column arrow diagram used here and in the Functions page */
  DM.arrows = (cols, links, o = {}) => {
    const n = cols.length, W = o.w || (n === 2 ? 560 : 640), xs = cols.map((_, i) => n === 1 ? W / 2 : 110 + i * (W - 220) / (n - 1)), mx = Math.max(...cols.map(c => c.items.length)), gap = 42, H = 80 + mx * gap, id = 'ar' + Math.floor(Math.random() * 1e6);
    const colors = [...new Set(links.map(l => l.color || col.br))];
    let s = `<defs>${colors.map((c, i) => `<marker id="${id}${i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`).join('')}</defs>`;
    const y = (c, i) => 62 + (i + (mx - cols[c].items.length) / 2) * gap;
    cols.forEach((c, ci) => { const h = c.items.length * gap + 14; s += `<ellipse cx="${xs[ci]}" cy="${y(ci, 0) + (c.items.length - 1) * gap / 2}" rx="52" ry="${h / 2 + 6}" fill="#faf6f1" stroke="${col.br2}" stroke-width="2"/>` + txt(xs[ci], 20, c.title, { b: 1, s: 16, c: col.br });
      c.items.forEach((it, i) => { s += `<circle cx="${xs[ci]}" cy="${y(ci, i)}" r="${c.ring && c.ring[i] ? 14 : 13}" fill="${(c.fills && c.fills[i]) || '#fff'}" stroke="${(c.strokes && c.strokes[i]) || col.br}" stroke-width="${c.ring && c.ring[i] ? 3 : 1.5}"/>` + txt(xs[ci], y(ci, i), it, { s: it.length > 3 ? 10 : 13, b: 1 }); }); });
    const sorted = links.slice(); const cnt = {};
    sorted.forEach(l => { const a = xs[l.c] + 14, b = xs[l.c + 1] - 15, y1 = y(l.c, l.i), y2 = y(l.c + 1, l.j), c = l.color || col.br; s += `<line x1="${a}" y1="${y1}" x2="${b}" y2="${y2}" stroke="${c}" stroke-width="${l.width || 2}" ${l.dash ? 'stroke-dasharray="6 4"' : ''} marker-end="url(#${id}${colors.indexOf(c)})"/>`; });
    return DM.svg(W, H, s, 'vz');
  };
  DM.digraphOf = (A, ps, o = {}) => { const n = A.length, pos = DM.G.circle(n, 200, 185, n > 1 ? 110 : 0); return DM.drawGraph({ w: 400, h: 340, directed: true, cls: 'vz mini', nodes: A.map((a, i) => ({ x: pos[i].x, y: pos[i].y, label: a, fill: o.fill && o.fill[i] })), edges: ps.map(([a, b], i) => ({ u: A.indexOf(a), v: A.indexOf(b), ...(o.edge ? o.edge(a, b, i) : {}) })) }); };

  /* ================= Product sets / the workbench ================= */
  const c1 = P.card('r_prod', 'Product Sets', 'A relation R from A to B is any subset of the product set A × B. Click cells of the grid to decide which ordered pairs (a, b) belong to R. With “B = A” ticked, R is a relation on A – the case used by the next cards.',
    `<div class="row">${DM.field('Set A (rows)', 'A', '1, 2, 3, 4')}${DM.field('Set B (columns)', 'B', '1, 2, 3, 4')}<div><label>&nbsp;</label><label style="display:flex;gap:6px;align-items:center;font-size:14px;color:#2e2118"><input type="checkbox" class="sq" checked style="width:auto"> B = A (relation on A)</label></div></div>
     <p>Preset: <select class="pre" style="width:auto">${PRESETS.map((p, i) => `<option value="${i}">${esc(p[0])}</option>`).join('')}<option value="r">Random relation</option></select> <button type="button" class="go">Load preset</button> <button type="button" class="o clr">Clear</button></p>
     <div class="tw"><table class="mxg"></table></div><div class="out"></div>`,
    'A database table is a relation: a subset of the product of its column domains. “Follows”, “is a prerequisite of” and “is friends with” are all relations.');
  const q1 = s => c1.querySelector(s);
  const readSets = () => { RS.sq = q1('.sq').checked; RS.A = DM.list(q1('.A').value); if (RS.sq) { RS.B = RS.A; q1('.B').value = RS.A.join(', '); q1('.B').disabled = true; } else { RS.B = DM.list(q1('.B').value); q1('.B').disabled = false; }
    RS.R = new Set([...RS.R].filter(k => { const [a, b] = k.split('\t'); return RS.A.includes(a) && RS.B.includes(b); })); };
  const drawProd = () => {
    const m = M(); q1('.mxg').innerHTML = `<tr><th>R</th>${RS.B.map(b => `<th>${esc(b)}</th>`).join('')}</tr>` + RS.A.map((a, i) => `<tr><th>${esc(a)}</th>${RS.B.map((b, j) => `<td class="cb ${m[i][j] ? 'on' : ''}" data-i="${i}" data-j="${j}">${m[i][j] ? '1' : '0'}</td>`).join('')}</tr>`).join('');
    const ps = pairs(), dom = RS.A.filter(a => ps.some(p => p[0] === a)), ran = RS.B.filter(b => ps.some(p => p[1] === b));
    q1('.out').innerHTML = `<div class="res" style="font-size:15px;word-break:normal">R = ${fmtP(RS.A.flatMap(a => RS.B.filter(b => RS.R.has(key(a, b))).map(b => [a, b])))}</div>` +
      chips([['|A × B|', RS.A.length * RS.B.length], ['|R|', ps.length], ['possible relations 2^(|A||B|)', DM.fmtBig(2n ** BigInt(RS.A.length * RS.B.length))], ['domain', set(dom)], ['range', set(ran)]]) + DM.note('Cell (a, b) = 1 means a R b. The domain is the set of first coordinates that occur, the range the set of second coordinates.');
  };
  q1('.mxg').onclick = e => { const t = e.target.closest('td.cb'); if (!t) return; const k = key(RS.A[+t.dataset.i], RS.B[+t.dataset.j]); RS.R.has(k) ? RS.R.delete(k) : RS.R.add(k); drawProd(); notify(); };
  const refresh = () => { readSets(); drawProd(); notify(); };
  q1('.A').oninput = refresh; q1('.B').oninput = refresh; q1('.sq').onchange = refresh;
  q1('.go').onclick = () => { readSets(); const v = q1('.pre').value; if (v === 'r') { RS.R = new Set(); RS.A.forEach(a => RS.B.forEach(b => { if (Math.random() < .3) RS.R.add(key(a, b)); })); } else applyPred(PRESETS[+v][1]); drawProd(); notify(); };
  q1('.clr').onclick = () => { RS.R = new Set(); drawProd(); notify(); };
  readSets(); applyPred(PRESETS[7][1]); q1('.pre').value = '7'; drawProd();

  /* ================= Pictorial representations ================= */
  const c2 = P.card('r_pict', 'Pictorial Representatives of Relations', 'The same relation can be drawn as an arrow diagram (A on the left, B on the right), as a digraph (for a relation on one set: vertices with directed edges, loops for (a, a)), or as a 0/1 matrix.',
    `<div class="out"></div>`, 'Digraphs model one-way links such as web hyperlinks and following on social networks; 0/1 matrices are how those relations are stored and multiplied in software.');
  const drawPict = () => {
    const ps = pairs(), m = M();
    const arrow = DM.arrows([{ title: 'A', items: RS.A }, { title: 'B', items: RS.B }], ps.map(([a, b]) => ({ c: 0, i: RS.A.indexOf(a), j: RS.B.indexOf(b) })));
    c2.querySelector('.out').innerHTML = `<div class="gi"><div><b>Arrow diagram</b>${arrow}</div>${RS.sq ? `<div><b>Digraph of R on A</b>${DM.digraphOf(RS.A, ps)}${DM.note('A self-loop is drawn for every pair (a, a).')}</div>` : ''}</div>` +
      `<b>Matrix of R</b>` + DM.tbl(['R', ...RS.B.map(esc)], RS.A.map((a, i) => [`<b>${esc(a)}</b>`, ...m[i].map(x => x ? '<b style="color:#6b4226">1</b>' : '<span style="opacity:.35">0</span>')])) + `<p><b>As a set of pairs:</b> ${fmtP(ps)}</p>`;
  };
  RS.subs.push(drawPict); drawPict();

  /* ================= Composition ================= */
  const c3 = P.card('r_comp', 'Composition of Relations', 'If R ⊆ A × B and S ⊆ B × C, the composite S∘R (“R, then S”) contains (a, c) whenever some b has a R b and b S c. In matrix form it is the Boolean product M_R ⊙ M_S. Build S below (R comes from the workbench).',
    `<div class="row">${DM.field('Set C (columns of S)', 'C', '1, 2, 3, 4')}<div><label>&nbsp;</label><button type="button" class="o same">S := copy of R</button> <button type="button" class="o clr">Clear S</button></div></div>
     <p style="font-size:13px;color:#8b5e3c;margin:4px 0">Click cells to build S ⊆ B × C (rows = B).</p><div class="tw"><table class="mxg s"></table></div><div class="out"></div>`,
    'A friend-of-a-friend search is a composition; route planning composes “flight from X to Y” with “flight from Y to Z”; SQL joins compose tables on a shared column.');
  const q3 = s => c3.querySelector(s); let S = new Set(['1\t1', '2\t2', '3\t4', '4\t4']), Cset = ['1', '2', '3', '4'];
  const drawComp = () => {
    Cset = DM.list(q3('.C').value); S = new Set([...S].filter(k => { const [b, c] = k.split('\t'); return RS.B.includes(b) && Cset.includes(c); }));
    q3('.s').innerHTML = `<tr><th>S</th>${Cset.map(c => `<th>${esc(c)}</th>`).join('')}</tr>` + RS.B.map((b, i) => `<tr><th>${esc(b)}</th>${Cset.map((c, j) => `<td class="cb ${S.has(key(b, c)) ? 'on' : ''}" data-i="${i}" data-j="${j}">${S.has(key(b, c)) ? 1 : 0}</td>`).join('')}</tr>`).join('');
    const R1 = pairs(), S1 = [...S].map(k => k.split('\t')), comp = [];
    RS.A.forEach(a => Cset.forEach(c => { const via = RS.B.filter(b => RS.R.has(key(a, b)) && S.has(key(b, c))); if (via.length) comp.push([a, c, via]); }));
    const links = [...R1.map(([a, b]) => ({ c: 0, i: RS.A.indexOf(a), j: RS.B.indexOf(b), color: col.br })), ...S1.map(([b, c]) => ({ c: 1, i: RS.B.indexOf(b), j: Cset.indexOf(c), color: '#4f8fb5' }))];
    const mr = M(), ms = RS.B.map(b => Cset.map(c => S.has(key(b, c)))), mc = RS.A.map(a => Cset.map(c => comp.some(x => x[0] === a && x[1] === c)));
    const mat = (rows, cols, m, t) => `<div><b>${t}</b>` + DM.tbl(['', ...cols.map(esc)], rows.map((r, i) => [`<b>${esc(r)}</b>`, ...m[i].map(x => x ? '<b style="color:#6b4226">1</b>' : '<span style="opacity:.35">0</span>')])) + '</div>';
    let pw = '';
    if (RS.sq) { let cur = new Set(RS.R); const rows = [], sets = []; for (let k = 2; k <= 4; k++) { const nx = new Set(); pairs(cur).forEach(([a, b]) => RS.A.forEach(c => { if (RS.R.has(key(b, c))) nx.add(key(a, c)); })); cur = nx; sets.push(cur); rows.push([`R<sup>${k}</sup>`, fmtP(pairs(cur))]); }
      pw = DM.h4('Powers of R (for a relation on A, R∘R means “two steps”)') + DM.tbl(['Power', 'Pairs'], rows) + `<p>${tf([...sets[0]].every(k => RS.R.has(k)), 'R² ⊆ R, so R is transitive')}</p>`; }
    q3('.out').innerHTML = `<div class="res" style="font-size:15px;word-break:normal">S∘R = ${fmtP(comp.map(x => [x[0], x[1]]))}</div><b>Arrow diagram</b> (brown = R, blue = S): composite pairs are the two-step routes a → b → c.` + DM.arrows([{ title: 'A', items: RS.A }, { title: 'B', items: RS.B }, { title: 'C', items: Cset }], links, { w: 640 }) +
      DM.tbl(['(a, c) in S∘R', 'because of the intermediate b'], comp.map(x => [`(${esc(x[0])}, ${esc(x[1])})`, x[2].map(b => `${esc(x[0])} R ${esc(b)} and ${esc(b)} S ${esc(x[1])}`).join(';  ')])) +
      `<div class="gi">${mat(RS.A, RS.B, mr, 'M_R')}${mat(RS.B, Cset, ms, 'M_S')}${mat(RS.A, Cset, mc, 'M_R ⊙ M_S = M_(S∘R)')}</div>` + DM.note('Boolean product: entry (a, c) = 1 if some b has M_R(a, b) = 1 AND M_S(b, c) = 1 (OR over all b).') + pw;
  };
  q3('.s').onclick = e => { const t = e.target.closest('td.cb'); if (!t) return; const k = key(RS.B[+t.dataset.i], Cset[+t.dataset.j]); S.has(k) ? S.delete(k) : S.add(k); drawComp(); };
  q3('.C').oninput = drawComp; q3('.clr').onclick = () => { S = new Set(); drawComp(); };
  q3('.same').onclick = () => { q3('.C').value = RS.B.join(', '); S = new Set(RS.R); drawComp(); };
  RS.subs.push(drawComp); drawComp();

  /* ================= Types of relations ================= */
  const c4 = P.card('r_types', 'Types of Relations', 'Reflexive, irreflexive, symmetric, antisymmetric, asymmetric and transitive – each property is a statement about pairs, so one counter-example (witness) is enough to break it. Needs a relation on one set (tick “B = A”).',
    `<div class="out"></div>`, 'Checking that a “same group as” relation is an equivalence, or that “depends on” in a build system is a partial order without cycles, is exactly this property test.');
  const props = () => {
    const A = RS.A, has = (a, b) => RS.R.has(key(a, b)), r = {};
    const w1 = A.find(a => !has(a, a)); r.ref = [!w1, w1 && `(${w1}, ${w1}) ∉ R`];
    const w2 = A.find(a => has(a, a)); r.irr = [!w2, w2 && `(${w2}, ${w2}) ∈ R`];
    const w3 = pairs().find(([a, b]) => !has(b, a)); r.sym = [!w3, w3 && `(${w3[0]}, ${w3[1]}) ∈ R but (${w3[1]}, ${w3[0]}) ∉ R`];
    const w4 = pairs().find(([a, b]) => a !== b && has(b, a)); r.ant = [!w4, w4 && `${w4[0]} R ${w4[1]} and ${w4[1]} R ${w4[0]} with ${w4[0]} ≠ ${w4[1]}`];
    const w5 = pairs().find(([a, b]) => has(b, a)); r.asy = [!w5, w5 && `(${w5[0]}, ${w5[1]}) and (${w5[1]}, ${w5[0]}) both in R`];
    let w6 = null; pairs().forEach(([a, b]) => { if (!w6) A.forEach(c => { if (!w6 && has(b, c) && !has(a, c)) w6 = [a, b, c]; }); }); r.tra = [!w6, w6 && `(${w6[0]}, ${w6[1]}), (${w6[1]}, ${w6[2]}) ∈ R but (${w6[0]}, ${w6[2]}) ∉ R`];
    return r;
  };
  RS.props = props;
  const drawTypes = () => {
    if (!RS.sq) { c4.querySelector('.out').innerHTML = `<p class="simnote">These properties are defined for a relation on a single set. Tick “B = A” in the Product Sets card.</p>`; return; }
    const r = props(), N = { ref: ['Reflexive', 'every (a, a) is in R'], irr: ['Irreflexive', 'no (a, a) is in R'], sym: ['Symmetric', 'a R b ⇒ b R a'], ant: ['Antisymmetric', 'a R b and b R a ⇒ a = b'], asy: ['Asymmetric', 'a R b ⇒ not b R a'], tra: ['Transitive', 'a R b and b R c ⇒ a R c'] };
    const eq = r.ref[0] && r.sym[0] && r.tra[0], po = r.ref[0] && r.ant[0] && r.tra[0];
    c4.querySelector('.out').innerHTML = `<div class="res" style="font-size:15px;word-break:normal">R = ${fmtP(pairs())}</div>` + DM.tbl(['Property', 'Definition', 'Holds?', 'Witness (why it fails)'], Object.keys(N).map(k => [`<b>${N[k][0]}</b>`, N[k][1], r[k][0] ? '<span class="ok">✔ yes</span>' : '<span class="bad">✘ no</span>', r[k][0] ? '–' : esc(r[k][1])])) +
      `<p>${eq ? '<span class="badge y">Equivalence relation</span>' : ''}${po ? '<span class="badge y">Partial order</span>' : ''}${!eq && !po ? '<span class="badge n">neither an equivalence relation nor a partial order</span>' : ''}</p>` +
      DM.note('Note: a relation can be both symmetric and antisymmetric (e.g. the identity relation), and “not symmetric” does not mean “antisymmetric”. Equivalence = reflexive + symmetric + transitive. Partial order = reflexive + antisymmetric + transitive.');
  };
  RS.subs.push(drawTypes); drawTypes();

  /* ================= Closures ================= */
  const closure = (kind, R) => {
    const A = RS.A, n = A.length, W = A.map(a => A.map(b => R.has(key(a, b)))), added = [], log = [];
    const add = (i, j, why) => { if (!W[i][j]) { W[i][j] = true; added.push([A[i], A[j], why]); return true; } return false; };
    if (kind === 'ref' || kind === 'eq') A.forEach((a, i) => add(i, i, 'reflexive'));
    if (kind === 'sym' || kind === 'eq') A.forEach((a, i) => A.forEach((b, j) => { if (R.has(key(a, b)) || W[i][j]) add(j, i, 'symmetric'); }));
    if (kind === 'tra' || kind === 'eq') for (let k = 0; k < n; k++) { const step = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (W[i][k] && W[k][j] && add(i, j, `via ${A[k]}`)) step.push(`(${A[i]}, ${A[j]})`); log.push([A[k], step.length ? step.join(', ') : '–']); }
    return { W, added, log };
  };
  const c5 = P.card('r_clos', 'Closure Properties', 'The closure of R with respect to a property is the smallest relation containing R that has that property: add the fewest possible pairs. Reflexive closure adds (a, a); symmetric closure adds reverses; transitive closure adds shortcuts, computed here step by step with Warshall’s algorithm.',
    `<div class="seg cl"></div><div class="out"></div>`, 'Transitive closure answers “can I get from A to B by any chain of links?” – used in reachability queries, dependency resolution and recursive SQL queries.');
  const clSeg = seg(c5.querySelector('.cl'), [['ref', 'Reflexive closure'], ['sym', 'Symmetric closure'], ['tra', 'Transitive closure (Warshall)'], ['eq', 'Equivalence closure (all three)']], 'tra', () => drawClos());
  const drawClos = () => {
    if (!RS.sq) { c5.querySelector('.out').innerHTML = `<p class="simnote">Closures are defined for a relation on one set. Tick “B = A” in the Product Sets card.</p>`; return; }
    const kind = clSeg.v, { W, added, log } = closure(kind, RS.R), A = RS.A, all = [];
    A.forEach((a, i) => A.forEach((b, j) => { if (W[i][j]) all.push([a, b]); }));
    const addSet = new Set(added.map(x => key(x[0], x[1])));
    const graph = DM.digraphOf(A, all, { edge: (a, b) => addSet.has(key(a, b)) ? { color: '#c58f3a', dash: true, width: 2.6 } : {} });
    const names = { ref: 'Reflexive closure', sym: 'Symmetric closure', tra: 'Transitive closure', eq: 'Equivalence closure' };
    c5.querySelector('.out').innerHTML = `<div class="res" style="font-size:15px;word-break:normal">${names[kind]} = ${fmtP(all)}</div>` + chips([['|R|', RS.R.size], ['pairs added', added.length], ['|closure|', all.length]]) +
      `<div class="gi"><div><b>Digraph</b> (solid = original, dashed gold = added)${graph}</div><div><b>Matrix</b>` + DM.tbl(['', ...A.map(esc)], A.map((a, i) => [`<b>${esc(a)}</b>`, ...A.map((b, j) => addSet.has(key(a, b)) ? '<b style="color:#c58f3a">1 ✚</b>' : W[i][j] ? '<b style="color:#6b4226">1</b>' : '<span style="opacity:.35">0</span>')])) + '</div></div>' +
      (added.length ? DM.tbl(['Added pair', 'Reason'], added.map(x => [`(${esc(x[0])}, ${esc(x[1])})`, x[2]])) : '<p class="ok">R already has this property – nothing needs to be added.</p>') +
      (kind === 'tra' || kind === 'eq' ? DM.h4('Warshall’s algorithm: allow one more intermediate vertex k at a time') + DM.tbl(['k (new allowed intermediate)', 'pairs (i, j) added because i → k → j'], log) : '');
  };
  RS.subs.push(drawClos); drawClos();

  /* ================= Equivalence relations ================= */
  const c6 = P.card('r_equiv', 'Equivalence Relations', 'An equivalence relation is reflexive, symmetric and transitive. It sorts the set into equivalence classes [a] = {x : x R a}; the classes are disjoint and cover A. Try “congruence mod m”: it splits the integers by remainder.',
    `<div class="row">${DM.field('Modulus m', 'm', 3, 'type="number" min="2" max="12"')}<div><label>&nbsp;</label><button type="button" class="go">Load “a ≡ b (mod m)” on {0,…,11}</button></div></div><div class="out"></div>`,
    'Grouping duplicate records, checking whether two fractions are equal (1/2 = 2/4), and clock arithmetic all rely on equivalence classes.');
  const classes = () => { const seen = new Set(), cl = []; RS.A.forEach(a => { if (seen.has(a)) return; const c = RS.A.filter(b => RS.R.has(key(a, b))); c.forEach(x => seen.add(x)); cl.push(c); }); return cl; };
  const drawEq = () => {
    const out = c6.querySelector('.out'); if (!RS.sq) { out.innerHTML = `<p class="simnote">Tick “B = A” in the Product Sets card to test an equivalence relation.</p>`; return; }
    const r = props(), eq = r.ref[0] && r.sym[0] && r.tra[0];
    let h = DM.tbl(['Property', 'Holds?', 'Witness'], [['Reflexive', r.ref[0] ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', r.ref[0] ? '–' : esc(r.ref[1])], ['Symmetric', r.sym[0] ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', r.sym[0] ? '–' : esc(r.sym[1])], ['Transitive', r.tra[0] ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', r.tra[0] ? '–' : esc(r.tra[1])]]);
    if (eq) { const cl = classes(), idx = {}; cl.forEach((c, i) => c.forEach(x => idx[x] = i));
      h += `<p><span class="badge y">R is an equivalence relation</span> with ${cl.length} equivalence class${cl.length > 1 ? 'es' : ''}</p>` + DM.tbl(['Class', 'Elements'], cl.map((c, i) => [`<b>[${esc(c[0])}]</b>`, set(c)]), {}) + `<p><b>Quotient set A/R</b> = {${cl.map(c => `[${esc(c[0])}]`).join(', ')}}</p>` +
        `<div class="gi"><div><b>Digraph coloured by class</b>${DM.digraphOf(RS.A, pairs(), { fill: RS.A.map(a => CL[idx[a] % CL.length]) })}</div><div><b>Partition of A</b>${partDiagram(cl)}</div></div>` + DM.note('Every element lies in exactly one class, and a R b ⇔ [a] = [b]. This is the bridge to partitions (see the Partitions card).');
    } else { h += `<p><span class="badge n">R is not an equivalence relation</span></p><p><button type="button" class="eqfix">Replace R by its equivalence closure</button> <span style="font-size:13px;color:#8b5e3c">(adds the fewest pairs that make it one)</span></p>`; }
    out.innerHTML = h; const b = out.querySelector('.eqfix'); if (b) b.onclick = () => { const { W } = closure('eq', RS.R); RS.R = new Set(); RS.A.forEach((a, i) => RS.A.forEach((c, j) => { if (W[i][j]) RS.R.add(key(a, c)); })); drawProd(); notify(); };
  };
  const partDiagram = cl => { const w = 520, h = 40 + Math.ceil(cl.length / 3) * 120; let s = ''; cl.forEach((c, i) => { const x = 90 + (i % 3) * 170, y = 70 + Math.floor(i / 3) * 120, r = 34 + Math.min(c.length, 6) * 5; s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${CL[i % CL.length]}" stroke="${col.br}" stroke-width="2"/>` + txt(x, y, c.join(' '), { s: 13, b: 1 }); }); return DM.svg(w, h, s, 'vz mini'); };
  c6.querySelector('.go').onclick = () => { const m = DM.int(c6.querySelector('.m').value, 'm', 2, 12); q1('.sq').checked = true; q1('.A').value = Array.from({ length: 12 }, (_, i) => i).join(', '); readSets(); applyPred((a, b) => (a - b) % m === 0); drawProd(); notify(); };
  RS.subs.push(drawEq); drawEq();

  /* ================= Partitions ================= */
  const BELL = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147, 115975];
  const c7 = P.card('r_part', 'Partitions', 'A partition of A is a collection of non-empty, pairwise disjoint blocks whose union is A. Partitions and equivalence relations are two views of the same thing: blocks ↔ equivalence classes. Type a partition to build the relation it induces.',
    `<div class="row"><div style="flex:3"><label>Partition of A (blocks in braces, e.g. {1,2},{3},{4})</label><input class="p" value="{1, 3}, {2, 4}"></div><div><label>&nbsp;</label><button type="button" class="go">Check &amp; build relation</button></div></div><div class="out"></div>`,
    'Splitting data into shards, grading students into bands, and partitioning a disk are partitions; each induces an “is in the same group as” equivalence relation.');
  const drawPart = () => {
    const out = c7.querySelector('.out'), A = RS.A, blocks = [...c7.querySelector('.p').value.matchAll(/\{([^}]*)\}/g)].map(m => DM.list(m[1])), probs = [];
    if (!blocks.length) probs.push('Write the blocks inside curly braces.');
    if (blocks.some(b => !b.length)) probs.push('A block must not be empty.');
    const cnt = {}; blocks.flat().forEach(x => cnt[x] = (cnt[x] || 0) + 1);
    const dup = Object.keys(cnt).filter(x => cnt[x] > 1), miss = A.filter(a => !cnt[a]), extra = Object.keys(cnt).filter(x => !A.includes(x));
    if (dup.length) probs.push(`Blocks must be disjoint: ${set(dup)} appear in more than one block.`); if (miss.length) probs.push(`The blocks must cover A: ${set(miss)} missing.`); if (extra.length) probs.push(`${set(extra)} are not elements of A = ${set(A)}.`);
    let h = `<p>Current set <b>A = ${set(A)}</b> (edit it in the Product Sets card). Number of different partitions of a ${A.length}-element set (Bell number B<sub>${A.length}</sub>): <b>${BELL[A.length] ?? '–'}</b></p>`;
    if (probs.length) h += `<p>${probs.map(p => no(esc(p).replace(/&lt;/g, '<'))).join('<br>')}</p>`;
    else { const ps = blocks.flatMap(b => b.flatMap(x => b.map(y => [x, y])));
      h += `<p><span class="badge y">Valid partition</span> with ${blocks.length} block${blocks.length > 1 ? 's' : ''}</p>${partDiagram(blocks)}<p><b>Induced equivalence relation</b> (a R b ⇔ same block), |R| = Σ|block|² = ${ps.length}:</p><div class="res" style="font-size:14px;word-break:normal">${fmtP(ps)}</div><p><button type="button" class="load">Load this relation into the workbench</button></p>`;
      out._ps = ps; }
    if (RS.sq) { const r = props(), eq = r.ref[0] && r.sym[0] && r.tra[0]; h += DM.h4('Reverse direction: the partition induced by the workbench relation R') + (eq ? `<p>R is an equivalence relation, so its classes form the partition <b>${classes().map(set).join(', ')}</b>.</p>` : `<p class="simnote">R is not an equivalence relation, so it does not define a partition (see the Equivalence Relations card).</p>`); }
    out.innerHTML = h; const b = out.querySelector('.load'); if (b) b.onclick = () => { RS.R = new Set(out._ps.map(([a, c]) => key(a, c))); drawProd(); notify(); DM.toast('Loaded into the workbench.'); };
  };
  c7.querySelector('.go').onclick = drawPart; c7.querySelector('.p').oninput = drawPart; RS.subs.push(drawPart); drawPart();
})();
