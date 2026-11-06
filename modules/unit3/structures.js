/* Unit 3 (part 1) - finite algebraic structures engine + cards: structure ladder, algebraic systems, semigroups, monoids, groups. */
(() => {
  const { esc, tbl, seg, col, txt, svg, tf, yes, no, chips } = DM;
  const A = DM.alg = {};
  const sub = n => String(n).replace(/\d/g, c => '₀₁₂₃₄₅₆₇₈₉'[c]);

  /* ---------- structure = { names:[...], tab:[[i,j→k or -1]] } ---------- */
  A.fromFn = (names, f) => ({ names, tab: names.map((_, i) => names.map((_, j) => f(i, j))) });
  A.zn = (n) => A.fromFn(Array.from({ length: n }, (_, i) => String(i)), (i, j) => (i + j) % n);
  A.znMul = n => A.fromFn(Array.from({ length: n }, (_, i) => String(i)), (i, j) => (i * j) % n);
  A.units = n => { const u = []; for (let i = 1; i < n; i++) if (DM.gcd(i, n) === 1) u.push(i); return { ...A.fromFn(u.map(String), (i, j) => u.indexOf(u[i] * u[j] % n)), n }; };
  const cyc = p => { const seen = [], out = []; p.forEach((_, i) => { if (seen[i]) return; let c = [], x = i; while (!seen[x]) { seen[x] = 1; c.push(x + 1); x = p[x]; } if (c.length > 1) out.push('(' + c.join('') + ')'); }); return out.join('') || 'e'; };
  const cmp = (a, b) => a.map((_, i) => a[b[i]]);            // (a∘b)(i) = a(b(i))
  A.cyc = cyc; A.cmp = cmp;
  A.permGroup = (gens, n) => { const id = [...Array(n).keys()], key = p => p.join(','), seen = new Map([[key(id), id]]), q = [id]; while (q.length) { const x = q.shift(); gens.forEach(g => { const y = cmp(g, x), k = key(y); if (!seen.has(k)) { seen.set(k, y); q.push(y); } }); }
    const els = [...seen.values()].sort((a, b) => cyc(a).length - cyc(b).length || key(a).localeCompare(key(b))), idx = new Map(els.map((p, i) => [key(p), i]));
    return { names: els.map(cyc), perms: els, tab: els.map(a => els.map(b => idx.get(key(cmp(a, b))))) }; };
  const P3 = [[1, 0, 2], [1, 2, 0]], P4 = [[1, 2, 3, 0], [0, 3, 2, 1]];
  A.s3 = () => A.permGroup(P3, 3); A.s4 = () => A.permGroup([[1, 0, 2, 3], [1, 2, 3, 0]], 4); A.d4 = () => A.permGroup(P4, 4); A.a4 = () => A.permGroup([[1, 2, 0, 3], [1, 0, 3, 2]], 4);
  A.v4 = () => A.fromFn(['e', 'a', 'b', 'c'], (i, j) => i ^ j);
  A.q8 = () => { const N = ['1', '-1', 'i', '-i', 'j', '-j', 'k', '-k'], mul = (a, b) => { const sg = x => x[0] === '-' ? -1 : 1, base = x => x.replace('-', ''), t = { '1': { '1': [1, '1'], i: [1, 'i'], j: [1, 'j'], k: [1, 'k'] }, i: { '1': [1, 'i'], i: [-1, '1'], j: [1, 'k'], k: [-1, 'j'] }, j: { '1': [1, 'j'], i: [-1, 'k'], j: [-1, '1'], k: [1, 'i'] }, k: { '1': [1, 'k'], i: [1, 'j'], j: [-1, 'i'], k: [-1, '1'] } }[base(a)][base(b)], s = sg(a) * sg(b) * t[0]; return (s < 0 ? '-' : '') + t[1]; };
    return A.fromFn(N, (i, j) => { const r = mul(N[i], N[j]).replace('--', ''); return N.indexOf(r === '-1' ? '-1' : r); }); };
  A.maxMonoid = () => A.fromFn(['0', '1', '2', '3'], (i, j) => Math.max(i, j));
  A.subMod5 = () => A.fromFn(['0', '1', '2', '3', '4'], (i, j) => ((i - j) % 5 + 5) % 5);
  A.truncAdd = () => A.fromFn(['0', '1', '2', '3', '4', '5'], (i, j) => i + j < 6 ? i + j : -1);
  A.xor = A.v4;
  A.nonAssoc = () => A.fromFn(['a', 'b', 'c'], (i, j) => (i + 2 * j) % 3);       // rock-paper-scissors-like, not associative

  A.analyze = S => { const n = S.names.length, t = S.tab, R = {};
    R.closed = t.every(r => r.every(v => v >= 0 && v < n)); const bad = []; t.forEach((r, i) => r.forEach((v, j) => { if (v < 0 && bad.length < 3) bad.push([i, j]); })); R.notClosed = bad;
    R.assoc = true; if (R.closed) { outer: for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) if (t[t[a][b]][c] !== t[a][t[b][c]]) { R.assoc = false; R.assocBad = [a, b, c]; break outer; } } else R.assoc = null;
    R.id = R.closed ? [...Array(n).keys()].find(e => [...Array(n).keys()].every(a => t[e][a] === a && t[a][e] === a)) : undefined; if (R.id === undefined) R.id = null;
    R.leftId = R.closed ? [...Array(n).keys()].filter(e => t[e].every((v, a) => v === a)) : []; R.rightId = R.closed ? [...Array(n).keys()].filter(e => t.every((r, a) => r[e] === a)) : [];
    R.inv = null; if (R.id !== null) { R.inv = []; for (let a = 0; a < n; a++) R.inv.push(t[a].findIndex(v => v === R.id) >= 0 && t[a].findIndex((v, b) => v === R.id && t[b][a] === R.id) >= 0 ? t[a].findIndex((v, b) => v === R.id && t[b][a] === R.id) : -1); }
    R.comm = R.closed ? t.every((r, i) => r.every((v, j) => v === t[j][i])) : null;
    R.semigroup = R.closed && R.assoc; R.monoid = R.semigroup && R.id !== null; R.group = R.monoid && R.inv.every(x => x >= 0); R.abelian = R.group && R.comm;
    R.kind = R.abelian ? 'Abelian (commutative) group' : R.group ? 'Group' : R.monoid ? 'Monoid' : R.semigroup ? 'Semigroup' : R.closed ? 'Magma (closed, but not associative)' : 'Not even an algebraic system (not closed)'; return R; };
  A.order = (S, a, id) => { let x = a, k = 1; while (x !== id) { x = S.tab[x][a]; k++; if (k > 1000) return 0; } return k; };
  A.gen = (S, gens) => { const id = A.analyze(S).id, seen = new Set([id]), q = [id]; while (q.length) { const x = q.shift(); gens.forEach(g => { const y = S.tab[x][g]; if (!seen.has(y)) { seen.add(y); q.push(y); } }); } return [...seen].sort((a, b) => a - b); };
  A.subgroups = S => { const n = S.names.length, seen = new Map(); for (let a = 0; a < n; a++) for (let b = a; b < n; b++) { const H = A.gen(S, [a, b]); seen.set(H.join(','), H); } const id = A.analyze(S).id; seen.set(String(id), [id]); return [...seen.values()].sort((x, y) => x.length - y.length || x.join().localeCompare(y.join())); };
  A.table = (S, o = {}) => { const n = S.names.length, nm = i => i >= 0 ? esc(S.names[i]) : '∉'; return `<div class="tw"><table style="width:auto"><tr><th>∘</th>${S.names.map(x => `<th>${esc(x)}</th>`).join('')}</tr>${S.tab.map((r, i) => `<tr><th>${esc(S.names[i])}</th>${r.map((v, j) => `<td class="${o.cls ? o.cls(i, j, v) || '' : ''}" style="text-align:center">${nm(v)}</td>`).join('')}</tr>`).join('')}</table></div>`; };
  A.PRE = [['zn', '(ℤₙ, +) integers mod n under addition'], ['znm', '(ℤₙ, ×) integers mod n under multiplication'], ['un', '(ℤₙ*, ×) units mod n under multiplication'], ['s3', 'S₃ – permutations of 3 objects (6 elements)'], ['d4', 'D₄ – symmetries of a square (8 elements)'], ['v4', 'Klein four-group V₄'], ['a4', 'A₄ – even permutations of 4 objects (12 elements)'], ['q8', 'Quaternion group Q₈'], ['s4', 'S₄ – permutations of 4 objects (24 elements)'], ['max', '({0,1,2,3}, max)'], ['sub5', '(ℤ₅, subtraction)'], ['tr', '({0,…,5}, +) ordinary addition (not closed)'], ['na', '({a,b,c}, x∘y = x + 2y mod 3)']];
  A.build = (k, n = 6) => ({ zn: () => A.zn(n), znm: () => A.znMul(n), un: () => A.units(n), s3: A.s3, s4: A.s4, d4: A.d4, a4: A.a4, v4: A.v4, q8: A.q8, max: A.maxMonoid, sub5: A.subMod5, tr: A.truncAdd, na: A.nonAssoc })[k]();
  A.groupPRE = A.PRE.filter(p => ['zn', 'un', 's3', 'd4', 'v4', 'a4', 'q8', 's4'].includes(p[0]));
  A.selHTML = (pre, cls = 'pre') => `<select class="${cls}" style="width:auto">${pre.map(p => `<option value="${p[0]}">${esc(p[1])}</option>`).join('')}</select> n = <input class="n" type="number" value="6" min="2" max="14" style="width:70px">`;

  /* ---------- analysis lab shared by several cards ---------- */
  const lab = (c, focus, def) => {
    const q = s => c.querySelector(s); let S = null;
    c.querySelector('.labslot').innerHTML = `<p>Structure: ${A.selHTML(A.PRE.concat([['custom', 'Custom table (build your own)']]))} <span class="cust" hidden>size m = <input class="m" type="number" value="3" min="2" max="6" style="width:70px"></span></p><div class="ctab"></div><div class="out"></div>`;
    q('.pre').value = def; const nameOf = i => S.names[i];
    const draw = () => { const k = q('.pre').value, n = Math.max(2, Math.min(14, +q('.n').value || 6)); q('.cust').hidden = k !== 'custom'; q('.n').style.display = ['zn', 'znm', 'un'].includes(k) ? '' : 'none';
      if (k === 'custom') { const m = Math.max(2, Math.min(6, +q('.m').value || 3)); if (!S || !S.custom || S.names.length !== m) S = { custom: true, names: Array.from({ length: m }, (_, i) => String.fromCharCode(97 + i)), tab: Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i + j) % m)) }; }
      else if (!S || S.key !== k + n) { S = A.build(k, n); S.key = k + n; }
      q('.ctab').innerHTML = S.custom ? `<p class="simnote">Choose the result of each product x∘y (rows x, columns y):</p><div class="tw"><table style="width:auto"><tr><th>∘</th>${S.names.map(x => `<th>${x}</th>`).join('')}</tr>${S.tab.map((r, i) => `<tr><th>${S.names[i]}</th>${r.map((v, j) => `<td><select data-i="${i}" data-j="${j}" style="padding:3px 6px;width:auto">${S.names.map((x, z) => `<option value="${z}" ${z === v ? 'selected' : ''}>${x}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</table></div>` : '';
      const R = A.analyze(S), n_ = S.names.length, W = [];
      const nmv = i => esc(S.names[i]);
      const cls = (i, j, v) => v < 0 ? 'cr' : R.id !== null && (i === R.id || j === R.id) ? 'c1' : R.id !== null && v === R.id ? 'c2' : '';
      const rows = [['Closure', R.closed, R.closed ? 'every product x∘y lies in the set' : `${S.tab.flatMap((r, i) => r.map((v, j) => v < 0 ? `${nmv(i)}∘${nmv(j)}` : null)).filter(Boolean).slice(0, 3).join(', ')} fall outside the set`],
        ['Associativity (x∘y)∘z = x∘(y∘z)', R.assoc, R.assoc === null ? 'needs closure first' : R.assoc ? `all ${n_ ** 3} triples checked` : `fails for (${R.assocBad.map(nmv).join(', ')}): (${nmv(R.assocBad[0])}∘${nmv(R.assocBad[1])})∘${nmv(R.assocBad[2])} = ${nmv(S.tab[S.tab[R.assocBad[0]][R.assocBad[1]]][R.assocBad[2]])} but ${nmv(R.assocBad[0])}∘(${nmv(R.assocBad[1])}∘${nmv(R.assocBad[2])}) = ${nmv(S.tab[R.assocBad[0]][S.tab[R.assocBad[1]][R.assocBad[2]]])}`],
        ['Identity element e', R.id !== null, R.id !== null ? `e = ${nmv(R.id)} (row and column of ${nmv(R.id)} are copies of the headers; shaded gold)` : R.closed ? `no element works on both sides (left identities: ${R.leftId.map(nmv).join(', ') || 'none'}; right identities: ${R.rightId.map(nmv).join(', ') || 'none'})` : 'needs closure'],
        ['Inverses', R.inv ? R.inv.every(x => x >= 0) : false, R.inv ? R.inv.map((x, a) => x >= 0 ? `${nmv(a)}⁻¹ = ${nmv(x)}` : `<span class="bad">${nmv(a)} has no inverse</span>`).join(', ') : 'needs an identity'],
        ['Commutativity x∘y = y∘x', R.comm, R.comm === null ? '' : R.comm ? 'table is symmetric about the diagonal' : 'table is not symmetric']];
      const emph = { semi: [0, 1], mono: [0, 1, 2], group: [0, 1, 2, 3], all: [0, 1, 2, 3, 4] }[focus];
      q('.out').innerHTML = `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start"><div><b>Cayley table</b> ${n_ > 12 ? '<span class="simnote">(scroll)</span>' : ''}${A.table(S, { cls })}<div class="simnote">${R.id !== null ? 'gold = identity row/column; blue = pairs that multiply to e (inverses)' : ''}</div></div><div style="flex:1;min-width:300px">` + DM.tbl(['Axiom', 'Holds?', 'Evidence'], rows.map((r, i) => [`<b style="${emph.includes(i) ? '' : 'opacity:.55'}">${r[0]}</b>`, r[1] === null ? '–' : r[1] ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', r[2]])) + `<p><span class="badge ${R.semigroup ? 'y' : 'n'}">Semigroup</span><span class="badge ${R.monoid ? 'y' : 'n'}">Monoid</span><span class="badge ${R.group ? 'y' : 'n'}">Group</span><span class="badge ${R.abelian ? 'y' : 'n'}">Abelian group</span></p><div class="res" style="font-size:15px;word-break:normal">${R.kind}</div></div></div>`;
      c.dispatchEvent(new CustomEvent('lab', { detail: { S, R } })); };
    q('.pre').onchange = () => { S = null; draw(); }; q('.n').oninput = draw; q('.m').oninput = () => { S = null; draw(); };
    q('.ctab').onchange = e => { const s = e.target.closest('select'); if (!s) return; S.tab[+s.dataset.i][+s.dataset.j] = +s.value; draw(); };
    draw(); return { draw, get S() { return S; } };
  };

  const P = DM.page('u3a', 'Algebraic Systems, Semigroups, Monoids and Groups', 'An algebraic system is a set with one or more operations. Adding axioms one at a time – closure, associativity, an identity, inverses – climbs a ladder: magma → semigroup → monoid → group. The Cayley table (operation table) lets us test each axiom by eye and by computer.');
  const labCard = (id, t, concept, def, focus, use) => { const c = P.card(id, t, concept, `<div class="labslot"></div>`, use); return [c, lab(c, focus, def)]; };

  /* ================= The structure of algebra ================= */
  const [c1] = labCard('a_struct', 'The Structure of Algebra', 'Each class below is contained in the one before it: every group is a monoid, every monoid is a semigroup, every semigroup is a magma. The lab classifies any finite operation table; the nested boxes light up to the deepest class it reaches.', 'zn', 'all', 'Cryptography uses groups (RSA, elliptic curves), programming languages use monoids (string concatenation, map-reduce combiners), compilers use semigroups.');
  const ladder = c1.insertBefore(document.createElement('div'), c1.querySelector('.labslot'));
  c1.addEventListener('lab', e => { const R = e.detail.R, lv = R.abelian ? 4 : R.group ? 3 : R.monoid ? 2 : R.semigroup ? 1 : R.closed ? 0 : -1, N = ['Magma\n(closed)', 'Semigroup\n(+ associative)', 'Monoid\n(+ identity)', 'Group\n(+ inverses)', 'Abelian group\n(+ commutative)'], Ex = ['(ℤ, −)', '(ℕ>0, +)', '(ℕ, +)', '(ℤ, +)', '(ℤₙ, +)'];
    let s = ''; for (let i = 0; i < 5; i++) { const w = 600 - i * 100, x = 10 + i * 50, h = 220 - i * 40, y0 = 8 + i * 28; s += `<rect x="${x}" y="${y0}" width="${w}" height="${h}" rx="16" fill="${i <= lv ? '#e6c9a8' : '#faf6f1'}" fill-opacity="${i === lv ? 1 : .55}" stroke="${i === lv ? col.br : col.br2}" stroke-width="${i === lv ? 3 : 1.5}"/>` + txt(x + 14, y0 + 14, N[i].split('\n')[0], { a: 'start', b: 1, s: 13, c: col.br }) + txt(x + w - 14, y0 + 14, 'e.g. ' + Ex[i], { a: 'end', s: 11, c: col.br2 }); }
    ladder.innerHTML = DM.svg(620, 235, s, 'vz wide') + `<p class="simnote">This structure reaches: <b>${lv < 0 ? 'none (not closed – not an algebraic system)' : N[lv].split('\n')[0]}</b>. Next axiom to add: ${['closure', 'associativity', 'an identity element', 'inverses for every element', 'commutativity', '– (top of the ladder)'][lv + 1]}.</p>`; });
  c1.dispatchEvent(new Event('x')); lab; // initial draw already dispatched before the listener existed:
  c1.querySelector('.pre').dispatchEvent(new Event('change'));

  /* ================= Algebraic systems on infinite sets (sampled) ================= */
  const SETS = [['ℕ = {0, 1, 2, …}', x => x >= 0], ['ℤ (all integers)', () => true], ['Even integers', x => x % 2 === 0], ['Odd integers', x => Math.abs(x) % 2 === 1], ['Multiples of 3', x => x % 3 === 0], ['{−1, 0, 1}', x => Math.abs(x) <= 1], ['{−1, 1}', x => Math.abs(x) === 1], ['Positive integers', x => x > 0]];
  const OPS = [['x + y', (a, b) => a + b], ['x − y', (a, b) => a - b], ['x × y', (a, b) => a * b], ['x ÷ y (exact)', (a, b) => b !== 0 && a % b === 0 ? a / b : NaN], ['max(x, y)', Math.max], ['min(x, y)', Math.min], ['gcd(x, y)', (a, b) => DM.gcd(a, b)], ['x² + y', (a, b) => a * a + b], ['|x − y|', (a, b) => Math.abs(a - b)]];
  const c2 = P.card('a_sys', 'Algebraic Systems', 'An algebraic system (S, ∘) is a non-empty set S with a binary operation ∘ that is closed: x∘y ∈ S for all x, y ∈ S. Pick an infinite set and an operation; the tester samples integers from −12 to 12 and hunts for counter-examples (a sample can disprove a property, never prove it, but it shows what to prove).',
    `<div class="row"><div><label>Set S</label>${DM.sel(SETS.map((s, i) => [i, s[0]]), 'sset')}</div><div><label>Operation x ∘ y</label>${DM.sel(OPS.map((s, i) => [i, s[0]]), 'sop')}</div></div><div class="out"></div>`,
    'Deciding whether an operation keeps results inside the allowed set (are sums of even numbers even? are products of odd numbers odd?) underlies type systems, parity checks and number-system design.');
  const sys = () => { const [sn, mem] = SETS[+c2.querySelector('.sset').value], [on, f] = OPS[+c2.querySelector('.sop').value], el = Array.from({ length: 25 }, (_, i) => i - 12).filter(mem), out = c2.querySelector('.out'), inS = v => Number.isInteger(v) && mem(v);
    const cl = []; el.forEach(a => el.forEach(b => { const v = f(a, b); if (!inS(v) && cl.length < 3) cl.push(`${a} ∘ ${b} = ${Number.isNaN(v) ? 'undefined / not an integer' : v} ∉ S`); }));
    const closed = !cl.length; let as = null, co = null, id = null, inv = null;
    if (closed) { outer: for (const a of el) for (const b of el) for (const c of el) if (f(f(a, b), c) !== f(a, f(b, c))) { as = [a, b, c]; break outer; }
      co = el.every(a => el.every(b => f(a, b) === f(b, a))); id = el.find(e => el.every(a => f(e, a) === a && f(a, e) === a)); if (id !== undefined) inv = el.filter(a => !el.some(b => f(a, b) === id && f(b, a) === id)); }
    const kind = !closed ? 'not an algebraic system' : as ? 'magma (not associative)' : id === undefined ? 'semigroup' : inv && inv.length ? 'monoid' : 'group (on this sample)';
    out.innerHTML = `<p>Sample of S: ${el.slice(0, 14).join(', ')}${el.length > 14 ? ', …' : ''}</p>` + tbl(['Property', 'Result', 'Evidence'], [['Closed', closed ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', closed ? 'no escape found in the sample' : cl.join('; ')], ['Associative', as === null ? '–' : as ? '<span class="bad">✘</span>' : '<span class="ok">✔</span>', as ? `(${as[0]}∘${as[1]})∘${as[2]} = ${f(f(as[0], as[1]), as[2])} ≠ ${as[0]}∘(${as[1]}∘${as[2]}) = ${f(as[0], f(as[1], as[2]))}` : closed ? 'no counter-example in the sample' : ''], ['Commutative', co === null ? '–' : co ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', co === false ? 'x∘y ≠ y∘x for some x, y' : ''], ['Identity element', id === null || as ? '–' : id !== undefined ? `<span class="ok">✔</span>` : '<span class="bad">✘</span>', id !== undefined ? `e = ${id}` : closed ? 'none in the sample' : ''], ['Every element invertible', inv === null ? '–' : !inv.length ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>', inv && inv.length ? `no inverse for ${inv.slice(0, 6).join(', ')}${inv.length > 6 ? '…' : ''}` : '']]) + `<div class="res" style="font-size:15px">(S, ∘) looks like a: ${kind}</div>` + DM.note('Examples to try: (Even integers, +) is a group; (Odd integers, +) is not closed (odd + odd is even); (ℕ, −) is not closed; (ℤ, −) is closed but not associative; (ℕ, max) is a monoid with identity 0.'); };
  c2.querySelectorAll('select').forEach(s => s.onchange = sys); sys();

  /* ================= Semigroups, Monoids, Groups ================= */
  labCard('a_semi', 'Semi-Groups', 'A semigroup (S, ∘) is closed and associative: (x∘y)∘z = x∘(y∘z). Associativity is the only thing that lets us write x∘y∘z without brackets – and it is checked on all n³ triples. Try the non-associative preset to see a counter-example.', 'max', 'semi', 'Associativity is exactly what lets parallel/distributed systems combine partial results in any grouping (map-reduce, string concatenation, matrix chain products).');
  labCard('a_mono', 'Monoids', 'A monoid is a semigroup with an identity element e: e∘x = x∘e = x. The identity is unique (if e and e′ are both identities then e = e∘e′ = e′). Compare (ℤₙ, ×), which has identity 1 but zero has no inverse, with (ℤₙ, +).', 'znm', 'mono', 'Strings under concatenation (identity = empty string), numbers under addition (identity 0) and functions under composition (identity = do nothing) are monoids – the basis of fold/reduce operations.');
  labCard('a_group', 'Groups', 'A group is a monoid in which every element has an inverse: for each x there is x⁻¹ with x∘x⁻¹ = x⁻¹∘x = e. In a Cayley table of a group every element appears exactly once in each row and each column (a Latin square). The group is abelian if the table is symmetric.', 'un', 'group', 'Groups describe symmetry (molecules, crystals, puzzles like the Rubik’s cube), underlie RSA and elliptic-curve cryptography, and give error-correcting codes.');
  const gc = document.querySelector('#a_group'); gc.addEventListener('lab', e => { const { S, R } = e.detail; let extra = gc.querySelector('.latin'); if (!extra) { extra = document.createElement('div'); extra.className = 'latin'; gc.querySelector('.out').after(extra); } extra.innerHTML = R.closed ? `<p>${tf(S.tab.every(r => new Set(r).size === S.names.length) && S.tab[0].every((_, j) => new Set(S.tab.map(r => r[j])).size === S.names.length), 'Latin-square test: every element occurs exactly once in each row and column (necessary for a group)')}</p>${R.group ? `<p><b>Order of each element</b> (smallest k with xᵏ = e): ${S.names.map((x, i) => `${esc(x)}: ${A.order(S, i, R.id)}`).join(', ')}.  |G| = ${S.names.length}</p>` : ''}` : ''; });
  gc.querySelector('.pre').dispatchEvent(new Event('change'));
  ['a_semi', 'a_mono'].forEach(id => document.querySelector('#' + id).querySelector('.pre').dispatchEvent(new Event('change')));
})();
