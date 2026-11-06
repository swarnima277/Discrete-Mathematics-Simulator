/* Unit 1 - Logic: propositions, truth tables, tautologies, conditionals & equivalence, arguments and rules of inference. */
(() => {
  const { esc, tbl, seg, col, tf, yes, no } = DM;
  const P = DM.page('u1l', 'Propositional Logic', 'Logic is the mathematics of reasoning. Type formulas using p, q, r … and the connectives ¬ (not, or ~ !), ∧ (and, or &), ∨ (or, or |), ⊕ (xor), → (implies, or ->), ↔ (iff, or <->). Constants: T and F. Precedence: ¬ ∧ ∨ ⊕ → ↔.');

  /* ---------- parser ---------- */
  const norm = s => s.replace(/<->|<=>|↔/g, '↔').replace(/->|=>|→/g, '→').replace(/\bxor\b|⊕/gi, '⊕').replace(/\band\b|&&|&|∧/gi, '∧').replace(/\bor\b|\|\||\||∨/gi, '∨').replace(/\bnot\b|~|!|¬/gi, '¬').replace(/\s+/g, '');
  const parse = src => {
    const t = [...norm(src)]; let i = 0; const peek = () => t[i], eat = () => t[i++];
    const atom = () => { const c = eat(); if (c === '(') { const f = iff(); if (eat() !== ')') throw new Error('Missing closing bracket “)”.'); return f; } if (c === 'T') return { t: 'c', v: true }; if (c === 'F') return { t: 'c', v: false }; if (c && /[a-su-z]/.test(c)) return { t: 'v', n: c }; if (c === 't') return { t: 'v', n: c }; throw new Error(c ? `Unexpected symbol “${c}”.` : 'The formula ended unexpectedly.'); };
    const not = () => { if (peek() === '¬') { eat(); return { t: 'n', a: not() }; } return atom(); };
    const bin = (sub, ops) => () => { let f = sub(); while (ops.includes(peek())) { const op = eat(); f = { t: 'b', op, a: f, b: sub() }; } return f; };
    const and = bin(not, ['∧']), or = bin(and, ['∨']), xor = bin(or, ['⊕']);
    const imp = () => { const a = xor(); if (peek() === '→') { eat(); return { t: 'b', op: '→', a, b: imp() }; } return a; };
    const iff = bin(imp, ['↔']);
    const f = iff(); if (i < t.length) throw new Error(`Unexpected symbol “${t[i]}”.`); return f;
  };
  const str = (f, top = true) => f.t === 'v' ? f.n : f.t === 'c' ? (f.v ? 'T' : 'F') : f.t === 'n' ? '¬' + str(f.a, false) : (top ? '' : '(') + str(f.a, false) + ' ' + f.op + ' ' + str(f.b, false) + (top ? '' : ')');
  const ev = (f, e) => f.t === 'v' ? e[f.n] : f.t === 'c' ? f.v : f.t === 'n' ? !ev(f.a, e) : ({ '∧': (a, b) => a && b, '∨': (a, b) => a || b, '⊕': (a, b) => a !== b, '→': (a, b) => !a || b, '↔': (a, b) => a === b })[f.op](ev(f.a, e), ev(f.b, e));
  const vars = (f, s = new Set()) => { if (f.t === 'v') s.add(f.n); else if (f.t === 'n') vars(f.a, s); else if (f.t === 'b') { vars(f.a, s); vars(f.b, s); } return s; };
  const subs = (f, out = []) => { if (f.t === 'n' || f.t === 'b') { f.t === 'n' ? subs(f.a, out) : (subs(f.a, out), subs(f.b, out)); if (!out.some(o => str(o) === str(f))) out.push(f); } return out; };
  const rows = (vs, fn) => { const n = vs.length, r = []; for (let m = (1 << n) - 1; m >= 0; m--) { const e = {}; vs.forEach((v, i) => e[v] = !!(m >> (n - 1 - i) & 1)); r.push([e, fn(e)]); } return r; };
  const TF = b => b ? '<b style="color:#2e7d32">T</b>' : '<b style="color:#b3261e">F</b>';
  DM.logic = { parse, str, ev, vars };
  const syms = `<button type="button" class="o sym">¬</button><button type="button" class="o sym">∧</button><button type="button" class="o sym">∨</button><button type="button" class="o sym">⊕</button><button type="button" class="o sym">→</button><button type="button" class="o sym">↔</button><button type="button" class="o sym">(</button><button type="button" class="o sym">)</button>`;
  const bindSyms = (c, inp) => { let last = c.querySelector(inp); c.querySelectorAll('input[type=text],input:not([type])').forEach(i => i.onfocus = () => last = i); c.querySelectorAll('.sym').forEach(b => b.onclick = () => { last.value += b.textContent; last.focus(); last.oninput && last.oninput(); }); };
  const fullTable = (f, extra = []) => { const vs = [...vars(f)].sort(), cols = subs(f); if (vs.length > 5) throw new Error('Use at most 5 variables.');
    const rs = rows(vs, e => ev(f, e)); const heads = [...vs, ...cols.map(c => str(c))];
    return { vs, rs, html: tbl(heads.map((h, i) => i === heads.length - 1 && cols.length ? `<span style="background:#f1e0cc;color:#6b4226;padding:0 4px;border-radius:4px">${esc(h)}</span>` : esc(h)), rs.map(([e, v]) => [...vs.map(x => TF(e[x])), ...cols.map(c => TF(ev(c, e)))]).map(r => r.map((x, i) => i >= r.length - 1 && cols.length ? x.replace('<b ', '<b class="fin" ') : x)), { hl: (i, r) => false }) }; };

  /* ================= Propositions ================= */
  const SENT = [['2 + 3 = 5', 1, 'A true statement – a proposition (truth value T).'], ['The Moon is made of cheese.', 1, 'False, but still a statement: it has a definite truth value.'], ['Close the door.', 0, 'A command has no truth value.'], ['x + 2 = 7', 0, 'An open sentence: true or false depends on x, so it is not (yet) a proposition.'], ['Is it raining?', 0, 'A question is not a statement.'], ['Every even integer greater than 2 is the sum of two primes.', 1, 'Goldbach’s conjecture: a proposition even though nobody knows whether it is true.'], ['This sentence is false.', 0, 'A paradox: it cannot consistently be assigned T or F.'], ['Pune is a city in Maharashtra.', 1, 'True – a proposition.']];
  const c1 = P.card('l_prop', 'Propositions', 'A proposition is a declarative sentence that is either true or false, never both. Compound propositions are built with connectives. First decide which sentences are propositions; then flip p and q and watch every connective respond.',
    `<h4 class="simh">1 · Is it a proposition?</h4><div class="quiz"></div><p class="simnote qs"></p><h4 class="simh">2 · Connectives sandbox</h4><p><span class="seg pp"></span> &nbsp; <span class="seg qq"></span></p><div class="out"></div>`,
    'Conditions in programs (if (a && !b)), database WHERE clauses and digital-circuit gates are compound propositions.');
  let score = 0, answered = 0;
  c1.querySelector('.quiz').innerHTML = SENT.map((s, i) => `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0;padding:6px 10px;border:1px solid #eadfd2;border-radius:10px"><span style="flex:1;min-width:200px">“${esc(s[0])}”</span><button type="button" class="o" data-i="${i}" data-a="1">Proposition</button><button type="button" class="o" data-i="${i}" data-a="0">Not a proposition</button><span class="fb" style="flex-basis:100%;font-size:13px"></span></div>`).join('');
  c1.querySelector('.quiz').onclick = e => { const b = e.target.closest('button'); if (!b) return; const s = SENT[+b.dataset.i], ok = +b.dataset.a === s[1], fb = b.parentNode.querySelector('.fb'); if (!fb.textContent) { answered++; if (ok) score++; } fb.innerHTML = (ok ? '<span class="ok">✔ Correct. </span>' : '<span class="bad">✘ Not quite. </span>') + esc(s[2]); c1.querySelector('.qs').textContent = `Score: ${score} / ${answered} answered`; };
  let pv = true, qv = true; const pS = seg(c1.querySelector('.pp'), [['1', 'p = T'], ['0', 'p = F']], '1', v => { pv = v === '1'; sand(); }), qS = seg(c1.querySelector('.qq'), [['1', 'q = T'], ['0', 'q = F']], '1', v => { qv = v === '1'; sand(); });
  const sand = () => { const e = { p: pv, q: qv }, L = [['¬p', 'not p'], ['p ∧ q', 'p and q'], ['p ∨ q', 'p or q'], ['p ⊕ q', 'exactly one of p, q'], ['p → q', 'if p then q'], ['p ↔ q', 'p if and only if q']];
    c1.querySelector('.out').innerHTML = tbl(['Formula', 'Reads as', 'Value now'], L.map(([f, r]) => [`<b>${f}</b>`, r, TF(ev(parse(f), e))])) + DM.note('Try p = F, q = anything: p → q is T (a false hypothesis makes the implication vacuously true). p → q is F only when p = T and q = F.'); };
  sand();

  /* ================= Truth tables ================= */
  const c2 = P.card('l_tt', 'Truth Tables', 'A truth table lists the value of a formula for every assignment of T/F to its variables (2ⁿ rows for n variables). Intermediate columns show how the value is built up, sub-formula by sub-formula.',
    `<div class="row"><div style="flex:4"><label>Formula</label><input class="f" value="(p → q) ∧ (q → r)"></div><div><label>&nbsp;</label><button type="button" class="go">Build table</button></div></div><p>${syms}</p><div class="out"></div>`,
    'Truth tables verify digital-circuit designs and the conditions in test plans; a table with n inputs needs 2ⁿ test cases.');
  const tt = () => { try { const f = parse(c2.querySelector('.f').value), T = fullTable(f), tr = T.rs.filter(r => r[1]);
    const dnf = tr.length ? tr.map(([e]) => '(' + T.vs.map(v => e[v] ? v : '¬' + v).join(' ∧ ') + ')').join(' ∨ ') : 'F (no true rows)';
    c2.querySelector('.out').innerHTML = `<div class="res" style="font-size:16px;word-break:normal">${esc(str(f))}</div>` + T.html + DM.chips([['rows', T.rs.length], ['true rows', tr.length], ['false rows', T.rs.length - tr.length]]) + `<p><b>Canonical DNF</b> (OR of the true rows): ${esc(dnf)}</p>` + DM.note('The highlighted last column is the value of the whole formula. Every formula equals the OR of the rows where it is true.'); } catch (e) { c2.querySelector('.out').innerHTML = `<p class="bad">${esc(e.message)}</p>`; } };
  c2.querySelector('.go').onclick = tt; c2.querySelector('.f').oninput = tt; bindSyms(c2, '.f'); tt();

  /* ================= Tautologies ================= */
  const TAU = [['p ∨ ¬p', 'Law of excluded middle'], ['p ∧ ¬p', 'Contradiction'], ['(p → q) ↔ (¬p ∨ q)', 'Implication as OR'], ['((p → q) ∧ p) → q', 'Modus ponens'], ['(p → q) → (q → p)', 'Converse error (not a tautology)'], ['¬(p ∧ q) ↔ (¬p ∨ ¬q)', 'De Morgan'], ['p → (q → p)', 'Always true'], ['(p ∨ q) ∧ ¬p', 'Satisfiable, not a tautology']];
  const c3 = P.card('l_taut', 'Tautologies', 'A tautology is true in every row (e.g. p ∨ ¬p); a contradiction is false in every row; anything else is a contingency. A formula that is true in at least one row is satisfiable.',
    `<div class="row"><div style="flex:4"><label>Formula</label><input class="f" value="((p → q) ∧ p) → q"></div><div><label>&nbsp;</label><button type="button" class="go">Classify</button></div></div><p>${syms}</p><p>Examples: ${TAU.map((t, i) => `<button type="button" class="o ex" data-i="${i}" title="${esc(t[1])}">${esc(t[0])}</button>`).join(' ')}</p><div class="out"></div>`,
    'Automatic program verifiers and SAT solvers decide exactly this question for huge formulas (chip verification, scheduling, planning).');
  const taut = () => { try { const f = parse(c3.querySelector('.f').value), T = fullTable(f), t = T.rs.filter(r => r[1]).length, n = T.rs.length;
    const kind = t === n ? ['y', 'Tautology – true in every row'] : t === 0 ? ['n', 'Contradiction – false in every row'] : ['', 'Contingency – true in some rows, false in others'];
    const ce = T.rs.find(r => !r[1]), se = T.rs.find(r => r[1]), show = e => T.vs.map(v => `${v} = ${e[v] ? 'T' : 'F'}`).join(', ');
    c3.querySelector('.out').innerHTML = `<p><span class="badge ${kind[0]}">${kind[1]}</span><span class="badge ${t ? 'y' : 'n'}">${t ? 'satisfiable' : 'unsatisfiable'}</span></p><p>${t === n ? yes('No counter-example exists.') : no(`Counter-example (formula false): <b>${show(ce[0])}</b>`)}<br>${t ? yes(`Satisfying assignment (formula true): <b>${show(se[0])}</b>`) : no('No assignment makes it true.')}</p>` + T.html + DM.chips([['true rows', `${t} of ${n}`]]); } catch (e) { c3.querySelector('.out').innerHTML = `<p class="bad">${esc(e.message)}</p>`; } };
  c3.querySelector('.go').onclick = taut; c3.querySelector('.f').oninput = taut; bindSyms(c3, '.f');
  c3.querySelectorAll('.ex').forEach(b => b.onclick = () => { c3.querySelector('.f').value = TAU[+b.dataset.i][0]; taut(); }); taut();

  /* ================= Conditional propositions & logical equivalence ================= */
  const LAWS = [['De Morgan (∧)', '¬(p ∧ q)', '¬p ∨ ¬q'], ['De Morgan (∨)', '¬(p ∨ q)', '¬p ∧ ¬q'], ['Implication', 'p → q', '¬p ∨ q'], ['Contrapositive', 'p → q', '¬q → ¬p'], ['Biconditional', 'p ↔ q', '(p → q) ∧ (q → p)'], ['Distributive', 'p ∧ (q ∨ r)', '(p ∧ q) ∨ (p ∧ r)'], ['Absorption', 'p ∨ (p ∧ q)', 'p'], ['Double negation', '¬¬p', 'p'], ['Exportation', '(p ∧ q) → r', 'p → (q → r)'], ['Converse (NOT equivalent)', 'p → q', 'q → p'], ['Negation of →', '¬(p → q)', 'p ∧ ¬q']];
  const c4 = P.card('l_cond', 'Conditional Propositions and Logical Equivalence', 'The conditional p → q is false only when p is true and q is false. From it come the converse q → p, the inverse ¬p → ¬q and the contrapositive ¬q → ¬p. Only the contrapositive is always equivalent to p → q. Two formulas are logically equivalent (≡) when their truth tables agree in every row.',
    `<h4 class="simh">1 · The four related conditionals</h4><div class="row">${DM.field('p (hypothesis)', 'ps', 'it rains')}${DM.field('q (conclusion)', 'qs', 'the ground is wet')}</div><div class="conds"></div>
     <h4 class="simh">2 · Are two formulas logically equivalent?</h4><div class="row"><div style="flex:3"><label>Formula 1</label><input class="e1" value="p → q"></div><div style="flex:3"><label>Formula 2</label><input class="e2" value="¬p ∨ q"></div></div><p>${syms}</p><p>Laws: <select class="law" style="width:auto">${LAWS.map((l, i) => `<option value="${i}">${esc(l[0])}</option>`).join('')}</select> <button type="button" class="go">Test equivalence</button></p><div class="out"></div>`,
    'Refactoring a condition (if !(a && b) → if (!a || !b)) relies on equivalence laws; contrapositive proofs and “proof by contradiction” rely on p → q ≡ ¬q → ¬p.');
  const q4 = s => c4.querySelector(s);
  const conds = () => { const p = q4('.ps').value, q = q4('.qs').value; const T = e => [e.p, e.q];
    const F = [['p → q (conditional)', 'p → q', `If ${p}, then ${q}.`], ['q → p (converse)', 'q → p', `If ${q}, then ${p}.`], ['¬p → ¬q (inverse)', '¬p → ¬q', `If not (${p}), then not (${q}).`], ['¬q → ¬p (contrapositive)', '¬q → ¬p', `If not (${q}), then not (${p}).`]].map(x => [...x, parse(x[1])]);
    const base = F[0][3], eqs = f => [0, 1, 2, 3].every(k => { const e = { p: !!(k >> 1), q: !!(k & 1) }; return ev(f, e) === ev(base, e); });
    q4('.conds').innerHTML = tbl(['p', 'q', ...F.map(f => esc(f[0]))], [[1, 1], [1, 0], [0, 1], [0, 0]].map(([a, b]) => [TF(a), TF(b), ...F.map(f => TF(ev(f[3], { p: !!a, q: !!b })))])) + tbl(['Statement', 'In words', 'Equivalent to p → q?'], F.map(f => [`<b>${esc(f[0])}</b>`, esc(f[2]), eqs(f[3]) ? '<span class="ok">✔ same truth table</span>' : '<span class="bad">✘ different</span>'])) + DM.note('The converse and the inverse are equivalent to each other (they are contrapositives of one another) but NOT to the original. “If it rains the ground is wet” does not mean “if the ground is wet it rained”.'); };
  const eqv = () => { try { const f = parse(q4('.e1').value), g = parse(q4('.e2').value), vs = [...new Set([...vars(f), ...vars(g)])].sort(); if (vs.length > 5) throw new Error('Use at most 5 variables.');
    const rs = rows(vs, e => [ev(f, e), ev(g, e)]), diff = rs.filter(r => r[1][0] !== r[1][1]);
    q4('.out').innerHTML = `<p style="font-size:16px">${diff.length ? no(`<b>Not equivalent</b>: ${esc(str(f))} and ${esc(str(g))} differ in ${diff.length} row(s)`) : yes(`<b>Logically equivalent</b>: ${esc(str(f))} ≡ ${esc(str(g))} (the formula ${esc(str(f))} ↔ ${esc(str(g))} is a tautology)`)}</p>` + tbl([...vs, esc(str(f)), esc(str(g)), 'agree?'], rs.map(([e, [a, b]]) => [...vs.map(v => TF(e[v])), TF(a), TF(b), a === b ? '<span class="ok">✔</span>' : '<span class="bad">✘</span>']), { hl: (i, r) => rs[i][1][0] !== rs[i][1][1] }); } catch (e) { q4('.out').innerHTML = `<p class="bad">${esc(e.message)}</p>`; } };
  q4('.go').onclick = eqv; q4('.law').onchange = () => { const l = LAWS[+q4('.law').value]; q4('.e1').value = l[1]; q4('.e2').value = l[2]; eqv(); };
  c4.querySelectorAll('.ps,.qs').forEach(i => i.oninput = conds); q4('.e1').oninput = eqv; q4('.e2').oninput = eqv; bindSyms(c4, '.e1'); conds(); eqv();

  /* ================= Arguments and rules of inference ================= */
  const RULES = [['Modus ponens', 'p → q, p', 'q'], ['Modus tollens', 'p → q, ¬q', '¬p'], ['Hypothetical syllogism', 'p → q, q → r', 'p → r'], ['Disjunctive syllogism', 'p ∨ q, ¬p', 'q'], ['Addition', 'p', 'p ∨ q'], ['Simplification', 'p ∧ q', 'p'], ['Conjunction', 'p, q', 'p ∧ q'], ['Resolution', 'p ∨ q, ¬p ∨ r', 'q ∨ r'], ['Constructive dilemma', '(p → q) ∧ (r → s), p ∨ r', 'q ∨ s'], ['Fallacy: affirming the conclusion', 'p → q, q', 'p'], ['Fallacy: denying the hypothesis', 'p → q, ¬p', '¬q']];
  const c5 = P.card('l_args', 'Arguments and Rules of Inference', 'An argument is valid if the conclusion is true in every row where all premises are true (the “critical rows”). Rules of inference such as modus ponens are valid argument forms that let you build a proof step by step. Enter premises (one per line) and a conclusion.',
    `<div class="row"><div style="flex:3"><label>Premises (one per line)</label><textarea class="pr" rows="3">p → q\nq → r\np</textarea></div><div style="flex:2"><label>Conclusion</label><input class="cn" value="r"></div></div><p>${syms}</p><p>Load a rule: <select class="rule" style="width:auto">${RULES.map((r, i) => `<option value="${i}">${esc(r[0])}</option>`).join('')}</select> <button type="button" class="go">Check validity</button></p><div class="out"></div>
     <h4 class="simh">Rule library</h4><div class="lib"></div>`,
    'Legal reasoning, mathematical proofs, expert systems and Prolog all chain these rules; a proof is just a sequence of valid inference steps.');
  const q5 = s => c5.querySelector(s);
  const neg = f => f.t === 'n' ? f.a : { t: 'n', a: f }, K = f => str(f);
  const prove = (prem, conc) => {
    const allowed = new Set(); const addA = f => { allowed.add(K(f)); allowed.add(K(neg(f))); subs(f).forEach(s => { allowed.add(K(s)); allowed.add(K(neg(s))); }); }; [...prem, conc].forEach(addA);
    const known = new Map(); prem.forEach((f, i) => known.set(K(f), { f, why: 'Premise', from: [] })); const add = (f, why, from) => { if (!known.has(K(f)) && allowed.has(K(f))) { known.set(K(f), { f, why, from: from.map(K) }); return true; } return false; };
    for (let it = 0; it < 60; it++) { let ch = false; const L = [...known.values()].map(x => x.f), has = f => known.has(K(f));
      L.forEach(f => { if (f.t === 'b' && f.op === '∧') { ch = add(f.a, 'Simplification', [f]) || ch; ch = add(f.b, 'Simplification', [f]) || ch; }
        if (f.t === 'n' && f.a.t === 'n') ch = add(f.a.a, 'Double negation', [f]) || ch;
        if (f.t === 'b' && f.op === '↔') { ch = add({ t: 'b', op: '→', a: f.a, b: f.b }, 'Biconditional', [f]) || ch; ch = add({ t: 'b', op: '→', a: f.b, b: f.a }, 'Biconditional', [f]) || ch; }
        if (f.t === 'b' && f.op === '→') { if (has(f.a)) ch = add(f.b, 'Modus ponens', [f, f.a]) || ch; if (has(neg(f.b))) ch = add(neg(f.a), 'Modus tollens', [f, neg(f.b)]) || ch;
          L.forEach(g => { if (g.t === 'b' && g.op === '→' && K(g.a) === K(f.b)) ch = add({ t: 'b', op: '→', a: f.a, b: g.b }, 'Hypothetical syllogism', [f, g]) || ch; }); }
        if (f.t === 'b' && f.op === '∨') { if (has(neg(f.a))) ch = add(f.b, 'Disjunctive syllogism', [f, neg(f.a)]) || ch; if (has(neg(f.b))) ch = add(f.a, 'Disjunctive syllogism', [f, neg(f.b)]) || ch;
          L.forEach(g => { if (g.t === 'b' && g.op === '∨' && K(g.a) === K(neg(f.a))) ch = add({ t: 'b', op: '∨', a: f.b, b: g.b }, 'Resolution', [f, g]) || ch; }); } });
      [...allowed].forEach(s => { let f; try { f = parse(s); } catch (e) { return; } if (f.t === 'b' && f.op === '∧' && has(f.a) && has(f.b)) ch = add(f, 'Conjunction', [f.a, f.b]) || ch; if (f.t === 'b' && f.op === '∨' && (has(f.a) || has(f.b))) ch = add(f, 'Addition', [has(f.a) ? f.a : f.b]) || ch; });
      if (known.has(K(conc)) || !ch) break; }
    if (!known.has(K(conc))) return null; const order = [], seen = new Set(); const dfs = k => { if (seen.has(k)) return; seen.add(k); known.get(k).from.forEach(dfs); order.push(k); }; dfs(K(conc)); return order.map(k => ({ s: k, ...known.get(k) }));
  };
  const args = () => { try { const prem = q5('.pr').value.split('\n').map(s => s.trim()).filter(Boolean).map(parse), conc = parse(q5('.cn').value); const vs = [...new Set([...prem.flatMap(f => [...vars(f)]), ...vars(conc)])].sort(); if (vs.length > 5) throw new Error('Use at most 5 variables.');
    const rs = rows(vs, e => [prem.map(f => ev(f, e)), ev(conc, e)]), crit = rs.filter(r => r[1][0].every(Boolean)), bad = crit.find(r => !r[1][1]), valid = !bad;
    const pf = prove(prem, conc);
    q5('.out').innerHTML = `<p><span class="badge ${valid ? 'y' : 'n'}">${valid ? 'VALID argument' : 'INVALID argument'}</span></p><p>${valid ? yes(`In all ${crit.length} critical row(s) (every premise true) the conclusion is also true.`) : no(`Counter-example: ${vs.map(v => `${v} = ${bad[0][v] ? 'T' : 'F'}`).join(', ')} makes every premise true and the conclusion false.`)}</p>` +
      tbl([...vs, ...prem.map(f => esc(str(f))), `<u>∴ ${esc(str(conc))}</u>`, 'critical row?'], rs.map(([e, [pv, cv]]) => [...vs.map(v => TF(e[v])), ...pv.map(TF), TF(cv), pv.every(Boolean) ? (cv ? '<span class="ok">✔ critical, conclusion T</span>' : '<span class="bad">✘ critical, conclusion F</span>') : '<span style="opacity:.4">–</span>']), { hl: (i, r) => rs[i][1][0].every(Boolean) }) +
      (valid ? DM.h4('Derivation by rules of inference') + (pf ? tbl(['#', 'Statement', 'Justification'], pf.map((x, i) => [i + 1, esc(x.s), x.why + (x.from.length ? ' on ' + x.from.map(k => '#' + (pf.findIndex(y => y.s === k) + 1)).join(', ') : '')])) : '<p class="simnote">The argument is valid (truth table), but the built-in prover did not find a short derivation with the basic rules.</p>') : '<p class="simnote">An invalid argument has no derivation: this is how fallacies such as “affirming the conclusion” are exposed.</p>'); } catch (e) { q5('.out').innerHTML = `<p class="bad">${esc(e.message)}</p>`; } };
  q5('.go').onclick = args; q5('.pr').oninput = args; q5('.cn').oninput = args; bindSyms(c5, '.cn');
  q5('.rule').onchange = () => { const r = RULES[+q5('.rule').value]; q5('.pr').value = r[1].replace(/, (?![^(]*\))/g, '\n'); q5('.cn').value = r[2]; args(); };
  q5('.lib').innerHTML = tbl(['Rule', 'Premises', 'Conclusion', 'Valid?'], RULES.map(r => { const prem = r[1].split(/, (?![^(]*\))/).map(parse), c = parse(r[2]), vs = [...new Set([...prem.flatMap(f => [...vars(f)]), ...vars(c)])]; const ok = rows(vs, e => !prem.every(f => ev(f, e)) || ev(c, e)).every(x => x[1]); return [`<b>${esc(r[0])}</b>`, esc(r[1]), '∴ ' + esc(r[2]), ok ? '<span class="ok">✔ valid</span>' : '<span class="bad">✘ fallacy</span>']; }));
  args();
})();
