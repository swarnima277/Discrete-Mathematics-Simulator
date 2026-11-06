/* Unit 1 - Sets: subsets, power set, Cartesian product, operations, Venn diagrams, inclusion-exclusion, bit-string representation. */
(() => {
  const { esc, chips, tbl, seg, list, set, txt, svg, col, venn, tf, yes, no } = DM;
  const P = DM.page('u1s', 'Sets', 'Sets are the language of mathematics. Build sets, combine them, and watch real Venn diagrams, grids and bit strings respond as you type. Elements are separated by commas.');
  const uni = (...s) => [...new Set(s.flat())];
  const num = a => a.every(x => x !== '' && !isNaN(x));
  const sortE = a => num(a) ? a.slice().sort((x, y) => x - y) : a.slice().sort();
  const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
  const inp = (c, s) => c.querySelector(s).value;

  /* ---------- Sets and subsets ---------- */
  const blob = (cx, cy, r, items, color, label, lx, ly) => {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity=".25" stroke="${col.br}" stroke-width="2"/>` + txt(lx, ly, label, { b: 1, s: 18, c: col.br });
    const k = Math.ceil(Math.sqrt(items.length || 1)), g = Math.min(34, (r * 1.3) / k);
    items.slice(0, 16).forEach((it, i) => { s += txt(cx + ((i % k) - (k - 1) / 2) * g, cy + (Math.floor(i / k) - (Math.ceil(items.length / k) - 1) / 2) * 20, it); });
    return s;
  };
  const c1 = P.card('s_basic', 'Sets and Subsets', 'A set is an unordered collection of distinct elements. A ⊆ B (subset) means every element of A is also in B; A ⊂ B (proper subset) additionally needs A ≠ B. The empty set ∅ is a subset of every set.',
    `<div class="row">${DM.field('Set A', 'A', '1, 2, 3')}${DM.field('Set B', 'B', '1, 2, 3, 4, 5')}${DM.field('Test element x', 'x', '2')}</div>
     <p><button type="button" class="go">Analyse</button> <button type="button" class="o ex" data-a="1,2" data-b="3,4">Disjoint example</button> <button type="button" class="o ex" data-a="1,2,3,4" data-b="3,4,5,6">Overlapping example</button> <button type="button" class="o ex" data-a="1,2,3" data-b="1,2,3">Equal sets</button></p><div class="out"></div>`,
    'A set of permissions ⊆ a larger set of permissions decides what a user may do; databases and type systems are built on membership and subset tests.');
  const basic = () => {
    const A = list(inp(c1, '.A')), B = list(inp(c1, '.B')), x = inp(c1, '.x').trim();
    const sub = A.every(e => B.includes(e)), sup = B.every(e => A.includes(e)), eq = sub && sup, dis = !A.some(e => B.includes(e));
    const missing = A.filter(e => !B.includes(e));
    const nest = (outer, oi, inner, ii) => {
      let r = `<circle cx="250" cy="150" r="130" fill="#8fbcd8" fill-opacity=".25" stroke="${col.br}" stroke-width="2"/><circle cx="250" cy="205" r="62" fill="#c9a98a" fill-opacity=".3" stroke="${col.br}" stroke-width="2"/>` + txt(250, 20, outer, { b: 1, s: 18, c: col.br }) + txt(250, 205 - 78, inner, { b: 1, s: 16, c: col.br });
      oi.slice(0, 12).forEach((it, i) => r += txt(250 + ((i % 6) - (Math.min(6, oi.length) - 1) / 2) * 36, 55 + Math.floor(i / 6) * 24, it));
      ii.slice(0, 9).forEach((it, i) => r += txt(250 + ((i % 3) - (Math.min(3, ii.length) - 1) / 2) * 30, 195 + Math.floor(i / 3) * 20, it)); return r; };
    let d;
    if (eq) d = blob(250, 150, 110, A, '#c9a98a', 'A = B', 250, 30);
    else if (sub) d = nest('B', B.filter(e => !A.includes(e)), 'A', A);
    else if (sup) d = nest('A', A.filter(e => !B.includes(e)), 'B', B);
    else if (dis) d = blob(130, 150, 100, A, '#c9a98a', 'A', 130, 40) + blob(370, 150, 100, B, '#8fbcd8', 'B', 370, 40);
    else d = null;
    const diag = d ? svg(500, 300, d) : venn({ names: ['A', 'B'], elems: DM.regionElems([A, B], uni(A, B)) });
    c1.querySelector('.out').innerHTML = DM.chips([['|A|', A.length], ['|B|', B.length], ['x ∈ A', x ? (A.includes(x) ? '<span class="ok">yes</span>' : '<span class="bad">no</span>') : '–'], ['x ∈ B', x ? (B.includes(x) ? '<span class="ok">yes</span>' : '<span class="bad">no</span>') : '–']]) +
      `<p>${tf(sub, `A ⊆ B`)}${!sub ? ` &nbsp;(${set(missing)} ∈ A but ∉ B)` : ''}<br>${tf(sub && !eq, 'A ⊂ B (proper subset)')}<br>${tf(sup, 'B ⊆ A')}<br>${tf(eq, 'A = B (each is a subset of the other)')}<br>${tf(dis, 'A and B are disjoint (no common element)')}<br>${yes('∅ ⊆ A always, so ∅ is a subset of every set')}</p>` + diag +
      DM.note(eq ? 'Equal sets: one circle.' : sub ? 'A ⊂ B is drawn as a circle inside a circle.' : sup ? 'B ⊂ A is drawn as a circle inside a circle.' : dis ? 'Disjoint sets: the circles do not touch.' : 'Neither is a subset: the circles overlap.');
  };
  c1.querySelector('.go').onclick = basic; c1.querySelectorAll('input').forEach(i => i.oninput = basic);
  c1.querySelectorAll('.ex').forEach(b => b.onclick = () => { c1.querySelector('.A').value = b.dataset.a; c1.querySelector('.B').value = b.dataset.b; basic(); }); basic();

  /* ---------- Power set ---------- */
  const c2 = P.card('s_power', 'Power Set', 'The power set P(S) is the set of ALL subsets of S (including ∅ and S itself). If |S| = n then |P(S)| = 2ⁿ, because each element is independently “in” or “out”.',
    `<div class="row">${DM.field('Set S (up to 6 elements)', 'S', 'a, b, c')}</div><p><button type="button" class="go">Build power set</button></p><div class="out"></div>
     <h4 class="simh">Build a subset yourself: tick the elements that are “in”</h4><div class="chips tick"></div><div class="mine"></div>`,
    'Feature flags: n on/off switches give 2ⁿ possible configurations. Test suites for n options need up to 2ⁿ cases.');
  const power = () => {
    const S = list(inp(c2, '.S')); if (S.length > 6) { DM.toast('Please use at most 6 elements.'); return; }
    const n = S.length, all = [...Array(1 << n).keys()].map(m => S.filter((_, i) => m >> i & 1));
    const by = {}; all.forEach(s => (by[s.length] = by[s.length] || []).push(s));
    c2.querySelector('.out').innerHTML = DM.chips([['|S|', n], ['|P(S)| = 2ⁿ', 1 << n]]) +
      Object.keys(by).map(k => `<p style="margin:6px 0"><b style="color:#8b5e3c">${k} element${k == 1 ? '' : 's'} (${by[k].length}):</b> ${by[k].map(s => `<span class="kchip">${s.length ? set(s) : '∅'}</span>`).join(' ')}</p>`).join('') +
      `<details><summary>Show the bit-string behind every subset</summary>${tbl(['#', ...S.map(esc), 'Subset'], all.map((s, m) => [m, ...S.map((_, i) => m >> i & 1), s.length ? set(s) : '∅']))}</details>`;
    c2.querySelector('.tick').innerHTML = S.map((s, i) => `<label style="display:inline-flex;gap:5px;align-items:center;margin:0 10px 0 0"><input type="checkbox" data-i="${i}" style="width:auto"> ${esc(s)}</label>`).join('');
    const upd = () => { const cur = S.filter((_, i) => c2.querySelector(`[data-i="${i}"]`).checked); c2.querySelector('.mine').innerHTML = `<div class="res">${cur.length ? set(cur) : '∅'}</div>` + DM.note(`bit string ${S.map((_, i) => +c2.querySelector(`[data-i="${i}"]`).checked).join('')} → subset number ${S.reduce((m, _, i) => m | (c2.querySelector(`[data-i="${i}"]`).checked ? 1 << i : 0), 0)} of ${(1 << n) - 1}`); };
    c2.querySelectorAll('.tick input').forEach(i => i.onchange = upd); upd();
  };
  c2.querySelector('.go').onclick = power; c2.querySelector('.S').oninput = power; power();

  /* ---------- Cartesian product ---------- */
  const c3 = P.card('s_cart', 'Cartesian Product', 'A × B is the set of all ordered pairs (a, b) with a ∈ A and b ∈ B. Order matters, so A × B ≠ B × A in general, and |A × B| = |A|·|B|.',
    `<div class="row">${DM.field('Set A', 'A', 'x, y, z')}${DM.field('Set B', 'B', '1, 2')}</div><p><button type="button" class="go">Form A × B</button></p><div class="out"></div>`,
    'Every table in a database is a subset of a Cartesian product of its column domains; pixel (row, column) coordinates are the product of two ranges.');
  const grid = (R, C, ln, cn, title) => {
    const cw = 52, W = 90 + cw * C.length, H = 50 + cw * R.length; let s = txt(W / 2 + 20, 14, title, { b: 1, c: col.br2 });
    C.forEach((c, j) => s += txt(90 + cw * j + cw / 2, 36, c, { b: 1 })); R.forEach((r, i) => s += txt(50, 50 + cw * i + cw / 2, r, { b: 1 }));
    R.forEach((r, i) => C.forEach((c, j) => s += `<rect x="${90 + cw * j}" y="${50 + cw * i}" width="${cw}" height="${cw}" fill="#faf6f1" stroke="#eadfd2"/><circle cx="${90 + cw * j + cw / 2}" cy="${50 + cw * i + cw / 2}" r="5" fill="${col.br}"/>`));
    return svg(W, H, s, 'vz grid');
  };
  const cart = () => {
    const A = list(inp(c3, '.A')), B = list(inp(c3, '.B')); if (A.length > 8 || B.length > 8) { DM.toast('Use at most 8 elements per set.'); return; }
    const AB = A.flatMap(a => B.map(b => `(${a}, ${b})`)), BA = B.flatMap(b => A.map(a => `(${b}, ${a})`));
    const same = AB.length === BA.length && AB.every(p => BA.includes(p));
    c3.querySelector('.out').innerHTML = DM.chips([['|A|', A.length], ['|B|', B.length], ['|A × B| = |A|·|B|', A.length * B.length]]) +
      `<p><b>A × B</b> = {${AB.map(esc).join(', ')}}</p><p><b>B × A</b> = {${BA.map(esc).join(', ')}}</p><p>${tf(same, same ? 'A × B = B × A here (happens only when A = B or one set is empty)' : 'A × B ≠ B × A – the order inside each pair matters')}</p>` +
      `<div style="display:flex;gap:12px;flex-wrap:wrap">${grid(A, B, 'A', 'B', 'A × B (rows = A, columns = B)')}${grid(B, A, 'B', 'A', 'B × A (rows = B, columns = A)')}</div>`;
  };
  c3.querySelector('.go').onclick = cart; c3.querySelectorAll('input').forEach(i => i.oninput = cart); cart();

  /* ---------- Set operations ---------- */
  const OPS = [['∪', 'A ∪ B', m => m & 3, 'in A or B or both'], ['∩', 'A ∩ B', m => (m & 3) === 3, 'in both A and B'], ['−', 'A − B', m => (m & 3) === 1, 'in A but not in B'], ['b−', 'B − A', m => (m & 3) === 2, 'in B but not in A'],
    ['Δ', 'A Δ B', m => (m & 3) === 1 || (m & 3) === 2, 'in exactly one of A, B'], ['A′', 'A′', m => !(m & 1), 'in U but not in A'], ['B′', 'B′', m => !(m & 2), 'in U but not in B'], ['(∪)′', '(A ∪ B)′', m => !(m & 3), 'in neither A nor B']];
  const c4 = P.card('s_ops', 'Set Operations', 'Union, intersection, difference, symmetric difference and complement (relative to a universal set U). Pick an operation to see its region shaded.',
    `<div class="row">${DM.field('Universal set U', 'U', '1,2,3,4,5,6,7,8,9,10')}${DM.field('Set A', 'A', '1,2,3,4,5')}${DM.field('Set B', 'B', '4,5,6,7')}</div><div class="op"></div><div class="out"></div>`,
    'Search engines combine result sets with AND (∩), OR (∪) and NOT (complement/difference); SQL’s UNION, INTERSECT and EXCEPT are these same operations.');
  const S0 = a => a.length ? set(a) : '∅';
  const opSeg = seg(c4.querySelector('.op'), OPS.map(o => [o[0], o[1]]), '∪', () => ops());
  const ops = () => {
    const A = list(inp(c4, '.A')), B = list(inp(c4, '.B')), U = uni(list(inp(c4, '.U')), A, B), cur = OPS.find(o => o[0] === opSeg.v);
    const res = U.filter(x => cur[2](DM.maskOf(x, [A, B])));
    c4.querySelector('.out').innerHTML = `<div class="res">${cur[1]} = ${res.length ? set(sortE(res)) : '∅'}</div>` + DM.note(`${cur[1]} = elements ${cur[3]}.`) +
      venn({ names: ['A', 'B'], elems: DM.regionElems([A, B], U), shade: m => !!cur[2](m) }) +
      DM.tbl(['Operation', 'Meaning', 'Result'], OPS.map(o => [o[1], o[3], S0(sortE(U.filter(x => o[2](DM.maskOf(x, [A, B])))))]), { hl: (i) => OPS[i][0] === opSeg.v }) +
      DM.chips([['|A ∪ B|', U.filter(x => DM.maskOf(x, [A, B])).length], ['disjoint?', A.some(x => B.includes(x)) ? 'no' : 'yes']]);
  };
  c4.querySelectorAll('input').forEach(i => i.oninput = ops); ops();

  /* ---------- Venn diagram with an expression engine ---------- */
  const parseExpr = src => {
    const t = []; const s = src.replace(/\s+/g, '').replace(/[|+]/g, '∪').replace(/[&*]/g, '∩').replace(/[\\-]/g, '−').replace(/\^/g, 'Δ').replace(/[!¬]/g, '~').replace(/[abc]/g, x => x.toUpperCase()).replace(/∅|\{\}/g, '0');
    for (const ch of s) t.push(ch);
    let i = 0; const peek = () => t[i], eat = () => t[i++];
    const atom = () => { const ch = eat(); if (ch === '(') { const f = expr(); if (eat() !== ')') throw new Error('Missing closing bracket.'); return f; }
      if ('ABC'.includes(ch) && ch) { const b = 'ABC'.indexOf(ch); return { v: m => !!(m >> b & 1), n: b }; } if (ch === 'U') return { v: () => true }; if (ch === '0') return { v: () => false };
      throw new Error(ch ? `Unexpected symbol “${ch}”.` : 'The expression ended unexpectedly.'); };
    const fac = () => { if (peek() === '~') { eat(); const f = fac(); return { v: m => !f.v(m), n: f.n }; } let f = atom(); while (peek() === "'" || peek() === '′') { eat(); const g = f; f = { v: m => !g.v(m), n: g.n }; } return f; };
    const term = () => { let f = fac(); while (peek() === '∩') { eat(); const g = f, h = fac(); f = { v: m => g.v(m) && h.v(m) }; } return f; };
    const expr = () => { let f = term(); while (['∪', '−', 'Δ'].includes(peek())) { const o = eat(), g = f, h = term(); f = { v: o === '∪' ? m => g.v(m) || h.v(m) : o === '−' ? m => g.v(m) && !h.v(m) : m => g.v(m) !== h.v(m) }; } return f; };
    const f = expr(); if (i < t.length) throw new Error(`Unexpected symbol “${t[i]}”.`); return f.v;
  };
  DM.parseSetExpr = parseExpr;
  const PRE = [['(A ∪ B)′', 'A′ ∩ B′', 'De Morgan (1): complement of a union'], ['(A ∩ B)′', 'A′ ∪ B′', 'De Morgan (2): complement of an intersection'], ['A ∩ (B ∪ C)', '(A ∩ B) ∪ (A ∩ C)', 'Distributive law'], ['A ∪ (A ∩ B)', 'A', 'Absorption law'], ['A − B', 'A ∩ B′', 'Difference as an intersection'], ['A Δ B', '(A ∪ B) − (A ∩ B)', 'Symmetric difference'], ['A ∪ (B ∩ C)', '(A ∪ B) ∩ C', 'NOT an identity – compare the regions']];
  const c5 = P.card('s_venn', 'Venn Diagram', 'A Venn diagram draws every possible membership combination of the sets as a region. Type any set expression (use ∪ ∩ − Δ and ′ for complement, or the keys | & - ^ ~ ) and the matching regions are shaded; compare two expressions to test set identities visually.',
    `<div class="seg" id="vn_sets"></div><div class="row">${DM.field('Set A', 'A', '1,2,3,4,5')}${DM.field('Set B', 'B', '4,5,6,7')}${DM.field('Set C (3-set mode)', 'C', '3,5,7,8')}${DM.field('Universal set U', 'U', '1,2,3,4,5,6,7,8,9,10')}</div>
     <div class="row"><div style="flex:2"><label>Expression 1 (shaded)</label><input class="e1" value="(A ∪ B)′"></div><div style="flex:2"><label>Expression 2 (to compare)</label><input class="e2" value="A′ ∩ B′"></div></div>
     <p><span style="font-size:13px;color:#8b5e3c">Identities to try:</span> <select class="pre">${PRE.map((p, i) => `<option value="${i}">${esc(p[2])}</option>`).join('')}</select> <button type="button" class="go">Shade &amp; compare</button> <button type="button" class="o sym" data-s="∪">∪</button><button type="button" class="o sym" data-s="∩">∩</button><button type="button" class="o sym" data-s="−">−</button><button type="button" class="o sym" data-s="Δ">Δ</button><button type="button" class="o sym" data-s="′">′</button><button type="button" class="o sym" data-s="(">(</button><button type="button" class="o sym" data-s=")">)</button></p><div class="out"></div>`,
    'Venn diagrams are used to explain probability events, database joins, and Boolean search filters. Verifying a set identity region-by-region is the visual form of a proof.');
  const nsSeg = seg(c5.querySelector('#vn_sets'), [['2', '2 sets (A, B)'], ['3', '3 sets (A, B, C)']], '3', () => venn5());
    let lastIn = c5.querySelector('.e1');
  c5.querySelectorAll('.e1,.e2').forEach(i => i.onfocus = () => lastIn = i);
  c5.querySelectorAll('.sym').forEach(b => b.onclick = () => { lastIn.value += b.dataset.s; venn5(); });
  const venn5 = () => {
    try {
      const n = +nsSeg.v, sets = ['.A', '.B', '.C'].slice(0, n).map(s => list(inp(c5, s))), U = uni(list(inp(c5, '.U')), ...sets);
      const f1 = parseExpr(inp(c5, '.e1')), e2 = inp(c5, '.e2').trim(), f2 = e2 ? parseExpr(e2) : null, masks = [...Array(1 << n).keys()];
      const res = U.filter(x => f1(DM.maskOf(x, sets)));
      let cmp = '';
      if (f2) { const diff = masks.filter(m => f1(m) !== f2(m)); cmp = `<p style="font-size:16px">${diff.length ? no('The two expressions are <b>not</b> equal as sets: they disagree on ' + diff.length + ' region(s).') : yes('Same shaded regions in every case – the two expressions are <b>equal</b> (a set identity).')}</p>` + (diff.length ? `<p>Differing regions (membership in ${['A', 'B', 'C'].slice(0, n).join(', ')}): ${diff.map(m => `<span class="kchip">${['A', 'B', 'C'].slice(0, n).map((_, i) => m >> i & 1).join('')}</span>`).join(' ')}</p>` : '') +
        `<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:260px"><b>Expression 2</b>${venn({ names: ['A', 'B', 'C'], n, elems: DM.regionElems(sets, U), shade: m => f2(m) })}</div></div>`; }
      c5.querySelector('.out').innerHTML = `<div class="res">${esc(inp(c5, '.e1'))} = ${res.length ? set(sortE(res)) : '∅'}</div><div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:260px"><b>Expression 1</b>${venn({ names: ['A', 'B', 'C'], n, elems: DM.regionElems(sets, U), shade: m => f1(m) })}</div></div>` + cmp +
        DM.note('Each region is one membership pattern; a region is shaded when elements with that pattern belong to the expression. The box is the universal set U.');
    } catch (e) { c5.querySelector('.out').innerHTML = `<p class="bad">${esc(e.message)}</p>`; }
  };
  c5.querySelector('.go').onclick = venn5;
  c5.querySelector('.pre').onchange = e => { const p = PRE[+e.target.value]; c5.querySelector('.e1').value = p[0]; c5.querySelector('.e2').value = p[1]; if (/C/.test(p[0] + p[1])) nsSeg.set('3'); venn5(); };
  c5.querySelectorAll('input').forEach(i => i.oninput = venn5); venn5();

  /* ---------- Inclusion-exclusion ---------- */
  const c6 = P.card('s_ie', 'Inclusion-Exclusion Principle', 'Adding |A| + |B| counts the overlap twice, so subtract it: |A ∪ B| = |A| + |B| − |A ∩ B|. For three sets: |A ∪ B ∪ C| = Σ|singles| − Σ|pairs| + |A ∩ B ∩ C|. Enter the sizes and see every region’s count appear in the diagram.',
    `<div class="seg" id="ie_n"></div><div class="row">${DM.field('|A|', 'a', 30, 'type="number"')}${DM.field('|B|', 'b', 25, 'type="number"')}${DM.field('|C|', 'c', 20, 'type="number"')}</div>
     <div class="row">${DM.field('|A ∩ B|', 'ab', 10, 'type="number"')}${DM.field('|A ∩ C|', 'ac', 8, 'type="number"')}${DM.field('|B ∩ C|', 'bc', 6, 'type="number"')}${DM.field('|A ∩ B ∩ C|', 'abc', 3, 'type="number"')}${DM.field('Total in U (optional)', 'tot', 60, 'type="number"')}</div><div class="out"></div>`,
    'Survey analysis (“how many students play cricket, football or chess?”), counting numbers divisible by 2, 3 or 5, and the probability of “at least one” event.');
  const ieSeg = seg(c6.querySelector('#ie_n'), [['2', 'Two sets'], ['3', 'Three sets']], '3', () => ie());
  const ie = () => {
    const n = +ieSeg.v, g = k => +inp(c6, '.' + k) || 0, [a, b, ab] = [g('a'), g('b'), g('ab')], c = n === 3 ? g('c') : 0, ac = n === 3 ? g('ac') : 0, bc = n === 3 ? g('bc') : 0, abc = n === 3 ? g('abc') : 0;
    const R = n === 2 ? { 1: a - ab, 2: b - ab, 3: ab } : { 7: abc, 3: ab - abc, 5: ac - abc, 6: bc - abc, 1: a - ab - ac + abc, 2: b - ab - bc + abc, 4: c - ac - bc + abc };
    const uni_ = Object.values(R).reduce((s, x) => s + x, 0), bad = Object.values(R).some(x => x < 0), tot = inp(c6, '.tot').trim() === '' ? null : g('tot'); if (tot !== null) R[0] = tot - uni_;
    const lab = {}; Object.keys(R).forEach(m => lab[m] = R[m]);
    c6.querySelectorAll('.row input').forEach(i => { const k = i.className; i.closest('div').style.display = n === 2 && ['c', 'ac', 'bc', 'abc'].includes(k) ? 'none' : ''; });
    const formula = n === 2 ? `|A ∪ B| = ${a} + ${b} − ${ab} = <b>${a + b - ab}</b>` : `|A ∪ B ∪ C| = (${a} + ${b} + ${c}) − (${ab} + ${ac} + ${bc}) + ${abc} = <b>${a + b + c - ab - ac - bc + abc}</b>`;
    c6.querySelector('.out').innerHTML = (bad ? `<p class="bad">These numbers are impossible: a region would have a negative count (check that intersections are not larger than the sets).</p>` : '') +
      `<div class="res">${formula}</div>` + (tot !== null ? `<p>Elements in none of the sets: ${tot} − ${uni_} = <b>${tot - uni_}</b></p>` : '') +
      venn({ names: ['A', 'B', 'C'], n, labels: lab }) + DM.note('The numbers in the diagram are the sizes of the individual regions, computed backwards from the sizes you typed (e.g. only-A = |A| − |A∩B| − |A∩C| + |A∩B∩C|).') +
      DM.chips([['sum of singles', n === 2 ? a + b : a + b + c], ['overlaps removed', n === 2 ? ab : ab + ac + bc], ['triple added back', n === 2 ? '–' : abc], ['union', uni_]]);
  };
  c6.querySelectorAll('input').forEach(i => i.oninput = ie); ie();

  /* ---------- Computer representation ---------- */
  const c7 = P.card('s_comp', 'Computer Representation of Sets', 'Order the universal set as u₁, u₂, …, uₙ. A subset is then stored as an n-bit string whose i-th bit is 1 exactly when uᵢ is in the set. Union = bitwise OR, intersection = bitwise AND, complement = bitwise NOT, symmetric difference = XOR – each a single machine instruction.',
    `<div class="row">${DM.field('Universal set U (ordered, ≤ 16 elements)', 'U', 'a, b, c, d, e, f, g, h')}${DM.field('Set A', 'A', 'a, c, e, g')}${DM.field('Set B', 'B', 'c, d, e, f')}</div><div class="out"></div>`,
    'Bitsets store sets of flags, file permissions (rwx = 3 bits), network masks and graph-algorithm “visited” sets in compact, very fast form.');
  const comp = () => {
    const U = list(inp(c7, '.U')); if (U.length > 16 || !U.length) { DM.toast('Use 1 to 16 universe elements.'); return; }
    const A = list(inp(c7, '.A')).filter(x => U.includes(x)), B = list(inp(c7, '.B')).filter(x => U.includes(x));
    const bits = s => U.map(u => +s.includes(u)), a = bits(A), b = bits(B), rows = [['A', a], ['B', b], ['A ∪ B  (OR)', a.map((x, i) => x | b[i])], ['A ∩ B  (AND)', a.map((x, i) => x & b[i])], ['A′  (NOT A)', a.map(x => 1 - x)], ['A Δ B  (XOR)', a.map((x, i) => x ^ b[i])], ['A − B  (A AND NOT B)', a.map((x, i) => x & (1 - b[i]))]];
    const val = r => parseInt(r.join(''), 2), dec = r => set(U.filter((_, i) => r[i]));
    c7.querySelector('.out').innerHTML = DM.tbl(['Set', ...U.map(esc), 'Bit string', 'As integer', 'Decoded set'], rows.map(([n, r]) => [n, ...r.map(x => x ? '<b style="color:#6b4226">1</b>' : '<span style="opacity:.4">0</span>'), `<code>${r.join('')}</code>`, val(r), dec(r) === '{}' ? '∅' : dec(r)])) +
      `<pre># the same idea in code (bit i = element i)\nA = 0b${a.join('')}   # ${val(a)}\nB = 0b${b.join('')}   # ${val(b)}\nA | B   # union         -> ${(val(a) | val(b)).toString(2).padStart(U.length, '0')}\nA & B   # intersection  -> ${(val(a) & val(b)).toString(2).padStart(U.length, '0')}\n~A &amp; mask  # complement -> ${rows[4][1].join('')}</pre>` + DM.note('Elements of A or B that are not in U are ignored; every operation touches all n bits at once.');
  };
  c7.querySelectorAll('input').forEach(i => i.oninput = comp); comp();
})();
