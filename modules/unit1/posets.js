/* Unit 1 - Partial orderings, Hasse diagrams, lattices. One poset workbench (PS) shared by the three cards. */
(() => {
  const { esc, tbl, seg, list, set, col, tf, yes, no, chips } = DM;
  const P = DM.page('u1p', 'Partial Orders, Hasse Diagrams and Lattices', 'A partial order ranks some – not necessarily all – pairs of elements. Choose a poset in the first card (divisibility, subsets, or your own pairs); the Hasse diagram and the lattice tests below always use it.');
  const key = (a, b) => a + '\t' + b;
  const PS = { el: [], L: new Set(), subs: [] };
  const leq = (a, b) => PS.L.has(key(a, b)), lt = (a, b) => a !== b && leq(a, b);
  const notify = () => PS.subs.forEach(f => f());
  const mk = (el, f) => { PS.el = el; PS.L = new Set(); el.forEach(a => el.forEach(b => { if (f(a, b)) PS.L.add(key(a, b)); })); };
  const closureOf = (el, ps, rt) => { const L = new Set(ps.map(([a, b]) => key(a, b))); if (rt) el.forEach(a => L.add(key(a, a))); if (rt) for (const k of el) for (const i of el) for (const j of el) if (L.has(key(i, k)) && L.has(key(k, j))) L.add(key(i, j)); return L; };
  const subsetsOf = s => { const el = [...Array(1 << s.length).keys()].map(m => s.filter((_, i) => m >> i & 1).join('') || '∅'); return { el, f: (a, b) => (a === '∅' || [...a].every(c => b.includes(c))) }; };
  const PRE = {
    div: () => { const n = DM.int(c1.querySelector('.n').value, 'N', 2, 120); const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); mk(d.map(String), (a, b) => b % a === 0); },
    sub: () => { const s = subsetsOf(['a', 'b', 'c']); mk(s.el, s.f); },
    sub4: () => { const s = subsetsOf(['a', 'b', 'c', 'd']); mk(s.el, s.f); },
    chain: () => mk(['1', '2', '3', '4', '5'], (a, b) => +a <= +b),
    divn: () => { const n = DM.int(c1.querySelector('.n').value, 'N', 2, 20); mk(Array.from({ length: n }, (_, i) => String(i + 1)), (a, b) => b % a === 0); },
    n5: () => { const el = ['0', 'a', 'b', 'c', '1']; PS.el = el; PS.L = closureOf(el, [['0', 'a'], ['a', 'b'], ['b', '1'], ['0', 'c'], ['c', '1']], true); },
    m3: () => { const el = ['0', 'a', 'b', 'c', '1']; PS.el = el; PS.L = closureOf(el, [['0', 'a'], ['0', 'b'], ['0', 'c'], ['a', '1'], ['b', '1'], ['c', '1']], true); },
    nol: () => { const el = ['a', 'b', 'c', 'd']; PS.el = el; PS.L = closureOf(el, [['a', 'c'], ['a', 'd'], ['b', 'c'], ['b', 'd']], true); },
    wb: () => { if (!DM.RS.sq) throw new Error('Tick “B = A” in the Relations page first.'); PS.el = DM.RS.A.slice(); PS.L = new Set(DM.RS.R); },
    cus: () => { const el0 = list(c1.querySelector('.ce').value), ps = [...c1.querySelector('.cp').value.matchAll(/([A-Za-z0-9_]+)\s*(?:<=|≤|<|-)\s*([A-Za-z0-9_]+)/g)].map(m => [m[1], m[2]]); const el = [...new Set([...el0, ...ps.flat()])]; if (el.length > 14) throw new Error('At most 14 elements.'); PS.el = el; PS.L = closureOf(el, ps, c1.querySelector('.cc').checked); }
  };
  const c1 = P.card('r_po', 'Partial Orderings', 'A partial order is a relation that is reflexive, antisymmetric and transitive; (S, ≤) is then a poset. Two elements may be incomparable (like 2 and 3 under divisibility). Pick a poset, then inspect its chains, antichains, minimal/maximal elements and bounds.',
    `<p>Poset: <select class="pre" style="width:auto"><option value="div">Divisors of N (divisibility)</option><option value="sub">Subsets of {a,b,c} under ⊆</option><option value="sub4">Subsets of {a,b,c,d} under ⊆</option><option value="chain">{1,…,5} under ≤ (a chain)</option><option value="divn">{1,…,N} under divisibility</option><option value="n5">Pentagon lattice N5</option><option value="m3">Diamond lattice M3</option><option value="nol">Poset that is not a lattice</option><option value="wb">Relation from the Relations page</option><option value="cus">Custom pairs…</option></select> N = <input class="n" type="number" value="12" style="width:80px"> <button type="button" class="go">Load</button></p>
     <div class="row cust" hidden><div><label>Elements (optional)</label><input class="ce" value="a, b, c, d"></div><div style="flex:2"><label>Pairs “x ≤ y” (write x&lt;y)</label><input class="cp" value="a<b, a<c, b<d, c<d"></div><div><label>&nbsp;</label><label style="display:flex;gap:6px;align-items:center;color:#2e2118;font-size:13px"><input type="checkbox" class="cc" checked style="width:auto"> add reflexive + transitive pairs</label></div></div>
     <div class="out"></div><h4 class="simh">Bounds of a subset</h4><div class="row"><div style="flex:2"><label>Subset B of the poset (comma-separated)</label><input class="sb" value=""></div></div><div class="bout"></div>`,
    'Task scheduling and build systems are posets (“A must finish before B”); version history, file-system folders and “is a prerequisite of” relations are partial orders.');
  const q1 = s => c1.querySelector(s);
  const poset = () => { const el = PS.el, W = {}; W.ref = el.find(a => !leq(a, a)); W.ant = (() => { for (const a of el) for (const b of el) if (a !== b && leq(a, b) && leq(b, a)) return [a, b]; })(); W.tra = (() => { for (const a of el) for (const b of el) for (const c of el) if (leq(a, b) && leq(b, c) && !leq(a, c)) return [a, b, c]; })(); W.ok = !W.ref && !W.ant && !W.tra; return W; };
  const covers = () => { const r = []; PS.el.forEach(a => PS.el.forEach(b => { if (lt(a, b) && !PS.el.some(z => lt(a, z) && lt(z, b))) r.push([a, b]); })); return r; };
  const minimal = () => PS.el.filter(a => !PS.el.some(b => lt(b, a))), maximal = () => PS.el.filter(a => !PS.el.some(b => lt(a, b)));
  const ranks = () => { const r = {}; const go = a => r[a] ?? (r[a] = Math.max(-1, ...PS.el.filter(b => lt(b, a)).map(go)) + 1); PS.el.forEach(go); return r; };
  DM.hasseLayout = (el, cov, rank) => { const W = 640, lv = {}; el.forEach(a => (lv[rank[a]] = lv[rank[a]] || []).push(a)); const H = Object.keys(lv).length, ph = Math.max(260, H * 85), x = {};
    Object.values(lv).forEach(L => L.forEach((a, i) => x[a] = (i + 1) / (L.length + 1)));
    for (let it = 0; it < 4; it++) for (const d of [1, -1]) { const ks = Object.keys(lv).map(Number).sort((a, b) => d * (a - b)); ks.forEach(k => lv[k].sort((a, b) => { const bc = z => { const nb = cov.filter(([p, q]) => (d > 0 ? q === z : p === z)).map(([p, q]) => d > 0 ? p : q); return nb.length ? nb.reduce((s, y) => s + x[y], 0) / nb.length : x[z]; }; return bc(a) - bc(b); }).forEach((a, i, L) => x[a] = (i + 1) / (L.length + 1))); }
    const pos = {}; el.forEach(a => pos[a] = { x: Math.round(60 + x[a] * (W - 120)), y: Math.round(ph - 45 - rank[a] * ((ph - 90) / Math.max(1, H - 1))) }); return { pos, h: ph }; };
  const hasse = (deco = {}, stage = 'hasse') => { const el = PS.el, cov = covers(), rk = ranks(), { pos, h } = DM.hasseLayout(el, cov, rk), cs = new Set(cov.map(c => key(...c)));
    let edges = [];
    const all = []; el.forEach(a => el.forEach(b => { if (leq(a, b)) all.push([a, b]); }));
    if (stage === 'digraph') edges = all.map(([a, b]) => ({ u: el.indexOf(a), v: el.indexOf(b), color: a === b ? '#b9a48e' : cs.has(key(a, b)) ? col.br : '#c0584e', dash: a !== b && !cs.has(key(a, b)) }));
    else if (stage === 'noloops') edges = all.filter(([a, b]) => a !== b).map(([a, b]) => ({ u: el.indexOf(a), v: el.indexOf(b), color: cs.has(key(a, b)) ? col.br : '#c0584e', dash: !cs.has(key(a, b)) }));
    else edges = cov.map(([a, b]) => ({ u: el.indexOf(a), v: el.indexOf(b), color: (deco.edge && deco.edge(a, b)) || col.br, width: 2.6 }));
    return DM.drawGraph({ w: 640, h, directed: stage !== 'hasse', cls: 'vz wide', r: 17, nodes: el.map(a => ({ x: pos[a].x, y: pos[a].y, label: a, ...(deco.node && deco.node(a)) })), edges }); };
  const showBounds = () => { const B = list(q1('.sb').value).filter(x => PS.el.includes(x)), el = PS.el, out = c1.querySelector('.bout');
    if (!B.length) { out.innerHTML = '<p class="simnote">Type some elements of the poset to see their upper and lower bounds, least upper bound (lub) and greatest lower bound (glb).</p>'; return; }
    const ub = el.filter(u => B.every(b => leq(b, u))), lb = el.filter(l => B.every(b => leq(l, b))), lub = ub.filter(u => ub.every(v => leq(u, v))), glb = lb.filter(l => lb.every(v => leq(v, l)));
    out.innerHTML = DM.chips([['upper bounds', set(ub) || '∅'], ['lub', lub.length ? esc(lub[0]) : 'none'], ['lower bounds', set(lb)], ['glb', glb.length ? esc(glb[0]) : 'none']]) + hasse({ node: a => B.includes(a) ? { fill: '#e6c9a8', ring: col.br } : ub.includes(a) ? { fill: '#cfe3f1' } : lb.includes(a) ? { fill: '#d9ecd5' } : {} }) + DM.note('Brown = your subset B, blue = upper bounds, green = lower bounds. The lub is the least element among the upper bounds (if there is one).'); };
  const draw1 = () => { const W = poset(), el = PS.el, ps = el.flatMap(a => el.filter(b => leq(a, b)).map(b => [a, b])), mn = minimal(), mx = maximal();
    let h = `<div class="res" style="font-size:15px;word-break:normal">≤ = {${ps.slice(0, 60).map(([a, b]) => `(${esc(a)}, ${esc(b)})`).join(', ')}${ps.length > 60 ? ', …' : ''}}  (${ps.length} pairs)</div>` +
      DM.tbl(['Axiom', 'Holds?', 'Witness'], [['Reflexive', DM.tf(!W.ref, ''), W.ref ? `${esc(W.ref)} ≤ ${esc(W.ref)} missing` : '–'], ['Antisymmetric', DM.tf(!W.ant, ''), W.ant ? `${esc(W.ant[0])} ≤ ${esc(W.ant[1])} and ${esc(W.ant[1])} ≤ ${esc(W.ant[0])}` : '–'], ['Transitive', DM.tf(!W.tra, ''), W.tra ? `${W.tra.map(esc).join(' ≤ ')} but ${esc(W.tra[0])} ≰ ${esc(W.tra[2])}` : '–']]);
    if (!W.ok) { h += `<p><span class="badge n">Not a partial order</span></p>`; c1.querySelector('.out').innerHTML = h; return; }
    const comparable = (a, b) => leq(a, b) || leq(b, a), total = el.every(a => el.every(b => comparable(a, b)));
    const rk = ranks(), longest = Math.max(...Object.values(rk)) + 1; let width = 1; if (el.length <= 14) for (let m = 1; m < 1 << el.length; m++) { const s = el.filter((_, i) => m >> i & 1); if (s.length > width && s.every(a => s.every(b => a === b || !comparable(a, b)))) width = s.length; }
    const least = el.filter(a => el.every(b => leq(a, b))), greatest = el.filter(a => el.every(b => leq(b, a))), inc = []; el.forEach((a, i) => el.slice(i + 1).forEach(b => { if (!comparable(a, b)) inc.push(`${esc(a)} ∥ ${esc(b)}`); }));
    const lin = []; { const left = el.slice(); while (left.length) { const m = left.filter(a => !left.some(b => lt(b, a)))[0]; lin.push(m); left.splice(left.indexOf(m), 1); } }
    h += `<p><span class="badge y">Partial order ✔</span><span class="badge ${total ? 'y' : 'n'}">${total ? 'Total order (a chain)' : 'Not a total order'}</span></p>` + DM.chips([['minimal', set(mn)], ['maximal', set(mx)], ['least element', least.length ? esc(least[0]) : 'none'], ['greatest element', greatest.length ? esc(greatest[0]) : 'none'], ['longest chain', longest + ' elements'], ['largest antichain', width]]) +
      `<p><b>Incomparable pairs:</b> ${inc.length ? inc.slice(0, 30).join(', ') + (inc.length > 30 ? ', …' : '') : 'none – every two elements are comparable'}</p><p><b>A linear extension</b> (topological sort that respects ≤): ${lin.map(esc).join(' → ')}</p>`;
    c1.querySelector('.out').innerHTML = h; showBounds();
  };
  q1('.go').onclick = DM.guard(() => { const v = q1('.pre').value; q1('.cust').hidden = v !== 'cus'; PRE[v](); draw1(); notify(); });
  q1('.pre').onchange = () => { q1('.cust').hidden = q1('.pre').value !== 'cus'; };
  q1('.sb').oninput = showBounds; PRE.div(); draw1();

  /* ================= Hasse diagram ================= */
  const c2 = P.card('r_hasse', 'Hasse Diagram', 'A Hasse diagram is the leanest picture of a poset: draw ≤ as a digraph, delete the loops (reflexive), delete the shortcut edges (transitive), put smaller elements lower so arrows can be dropped. Step through the stages, or click an element to highlight everything above and below it.',
    `<div class="seg st"></div><p>Highlight element: <select class="pick" style="width:auto"></select></p><div class="out"></div>`, 'Hasse diagrams appear in version-control history, course-prerequisite charts, taxonomy trees and the layout of dependency graphs.');
  const stSeg = seg(c2.querySelector('.st'), [['digraph', '1 · Digraph of ≤'], ['noloops', '2 · Remove loops'], ['notrans', '3 · Remove shortcuts'], ['hasse', '4 · Hasse diagram']], 'hasse', () => draw2());
  const c2pick = c2.querySelector('.pick');
  const draw2 = () => { const out = c2.querySelector('.out'), W = poset(); if (!W.ok) { out.innerHTML = '<p class="simnote">The chosen relation is not a partial order, so it has no Hasse diagram (see the Partial Orderings card).</p>'; return; }
    const cur = c2pick.value, sel = PS.el.includes(cur) ? cur : '';
    c2pick.innerHTML = '<option value="">(none)</option>' + PS.el.map(a => `<option ${a === sel ? 'selected' : ''}>${esc(a)}</option>`).join('');
    const stage = stSeg.v === 'notrans' ? 'notrans' : stSeg.v;
    const msg = { digraph: 'All pairs a ≤ b as arrows, including a loop at every element. Dashed red arrows are “shortcuts” implied by transitivity.', noloops: 'Loops removed (every element is ≤ itself, so they carry no information). The dashed red arrows are transitive shortcuts.', notrans: 'Shortcut arrows removed: only the covering relations remain (a covers b if nothing lies strictly between).', hasse: 'Arrow heads dropped by the convention “upward means greater”. This is the Hasse diagram.' }[stSeg.v];
    out.innerHTML = hasse({ node: a => sel ? (a === sel ? { fill: '#e6c9a8', ring: col.br } : leq(sel, a) ? { fill: '#cfe3f1' } : leq(a, sel) ? { fill: '#d9ecd5' } : {}) : {} }, stage) + DM.note(msg + (sel ? ` Brown = ${sel}; blue = elements ≥ ${sel}; green = elements ≤ ${sel}.` : '')) +
      DM.tbl(['Covering pair (a ⋖ b)'], covers().map(([a, b]) => [`${esc(a)} is covered by ${esc(b)}`]).slice(0, 40));
  };
  c2pick.onchange = draw2; PS.subs.push(draw2); draw2();

  /* ================= Lattices ================= */
  const c3 = P.card('r_lat', 'Lattices', 'A lattice is a poset in which every two elements have a least upper bound a ∨ b (join) and a greatest lower bound a ∧ b (meet). Divisibility on divisors of n and subsets under ⊆ are lattices; the “not a lattice” preset has a pair with no unique lub. Pick two elements to see their bounds on the diagram.',
    `<div class="row"><div><label>Element a</label><select class="a"></select></div><div><label>Element b</label><select class="b"></select></div></div><div class="out"></div>`,
    'Lattices underlie access-control levels (public < internal < secret), type hierarchies, program analysis and Boolean algebras that design digital circuits.');
  const q3 = s => c3.querySelector(s);
  const lubOf = (a, b) => { const ub = PS.el.filter(u => leq(a, u) && leq(b, u)), l = ub.filter(u => ub.every(v => leq(u, v))); return { ub, l: l[0] }; };
  const glbOf = (a, b) => { const lb = PS.el.filter(u => leq(u, a) && leq(u, b)), g = lb.filter(u => lb.every(v => leq(v, u))); return { lb, g: g[0] }; };
  const draw3 = () => { const out = q3('.out'), W = poset(); if (!W.ok) { out.innerHTML = '<p class="simnote">Not a partial order, so lattice questions do not apply.</p>'; return; }
    const el = PS.el, ca = q3('.a').value, cb = q3('.b').value, A = el.includes(ca) ? ca : el[0], B = el.includes(cb) ? cb : el[el.length - 1];
    ['.a', '.b'].forEach((s, k) => { q3(s).innerHTML = el.map(x => `<option ${x === (k ? B : A) ? 'selected' : ''}>${esc(x)}</option>`).join(''); });
    const bad = []; el.forEach((a, i) => el.slice(i).forEach(b => { if (lubOf(a, b).l === undefined) bad.push([a, b, 'join']); if (glbOf(a, b).g === undefined) bad.push([a, b, 'meet']); }));
    const isL = !bad.length, join = (a, b) => lubOf(a, b).l, meet = (a, b) => glbOf(a, b).g;
    const top = el.find(a => el.every(b => leq(b, a))), bot = el.find(a => el.every(b => leq(a, b)));
    let h = `<p><span class="badge ${isL ? 'y' : 'n'}">${isL ? 'This poset is a lattice' : 'Not a lattice'}</span></p>`;
    if (!isL) { const [a, b, t] = bad[0]; const s = t === 'join' ? lubOf(a, b).ub : glbOf(a, b).lb; h += `<p>${no(`${esc(a)} and ${esc(b)} have no ${t === 'join' ? 'least upper' : 'greatest lower'} bound: the ${t === 'join' ? 'upper' : 'lower'} bounds are ${set(s)} and none of them is ${t === 'join' ? 'below' : 'above'} all the others.`)}</p>`; }
    const sa = lubOf(A, B), sb = glbOf(A, B);
    h += hasse({ node: x => x === A || x === B ? { fill: '#e6c9a8', ring: col.br } : x === sa.l ? { fill: '#cfe3f1', ring: '#4f8fb5' } : x === sb.g ? { fill: '#d9ecd5', ring: col.green } : sa.ub.includes(x) ? { fill: '#eaf3f9' } : sb.lb.includes(x) ? { fill: '#edf6ea' } : {} }) +
      DM.chips([[`${esc(A)} ∨ ${esc(B)} (join = lub)`, sa.l !== undefined ? esc(sa.l) : 'does not exist'], [`${esc(A)} ∧ ${esc(B)} (meet = glb)`, sb.g !== undefined ? esc(sb.g) : 'does not exist']]) + DM.note('Brown = a and b, blue = their join (upper bounds shaded lighter), green = their meet (lower bounds shaded lighter).');
    if (isL && el.length <= 16) {
      let dist = true, wit = null; for (const a of el) for (const b of el) for (const c of el) if (dist && meet(a, join(b, c)) !== join(meet(a, b), meet(a, c))) { dist = false; wit = [a, b, c]; }
      const comp = top !== undefined && bot !== undefined ? el.map(x => [x, el.filter(y => join(x, y) === top && meet(x, y) === bot)]) : null, compl = comp && comp.every(c => c[1].length);
      h += DM.h4('Lattice properties') + `<p>${tf(top !== undefined && bot !== undefined, `Bounded: greatest element 1 = ${top !== undefined ? esc(top) : '–'}, least element 0 = ${bot !== undefined ? esc(bot) : '–'}`)}<br>${tf(dist, dist ? 'Distributive: a ∧ (b ∨ c) = (a ∧ b) ∨ (a ∧ c) for all a, b, c' : `Not distributive: for (${wit.map(esc).join(', ')}) the two sides differ`)}<br>${tf(!!compl, compl ? 'Complemented: every element has a complement (x ∨ y = 1, x ∧ y = 0)' : 'Not complemented')}<br>${tf(dist && compl, 'Boolean algebra (distributive + complemented)')}</p>`;
      if (el.length <= 9) h += `<div class="gi"><div><b>Join table  a ∨ b</b>${tbl(['∨', ...el.map(esc)], el.map(a => [`<b>${esc(a)}</b>`, ...el.map(b => esc(join(a, b)))]))}</div><div><b>Meet table  a ∧ b</b>${tbl(['∧', ...el.map(esc)], el.map(a => [`<b>${esc(a)}</b>`, ...el.map(b => esc(meet(a, b)))]))}</div></div>`;
    }
    out.innerHTML = h; };
  q3('.a').onchange = draw3; q3('.b').onchange = draw3; PS.subs.push(draw3); draw3();
})();
