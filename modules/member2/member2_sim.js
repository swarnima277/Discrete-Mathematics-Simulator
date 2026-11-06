/* Member 2 - Real-world application simulator (card 5 on the Number Theory page).
   Runs the toolkit's real-world uses as live simulations, the way the cryptography modules do.
   Added alongside member2.js, which is unchanged. Every GCD, inverse, Bézout identity, factorization and
   φ value comes from the existing endpoints in app.py (m2_gcd, m2_extended_gcd, m2_inverse, m2_factor),
   i.e. from number_theory_toolkit.py. Relies on the shared helpers in index.html: $, $$, esc, api, val, pick, guard, table. */
(() => {
  const M = id => $('#m2s_' + id);
  const out = M('out');
  const int = (id, name, lo, hi) => {
    const s = M(id).value.trim(), x = Number(s);
    if (s === '' || !Number.isSafeInteger(x)) throw new Error(`${name} must be a whole number.`);
    if (x < lo || x > hi) throw new Error(`${name} must be between ${lo} and ${hi.toLocaleString('en-US')}.`);
    return x;
  };

  /* ---- animation helpers: starting a new run cancels the one in progress ---- */
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let token = 0;
  const sleep = ms => new Promise(r => setTimeout(r, still ? 0 : ms));
  const tween = (ms, f) => new Promise(res => {
    const my = token, t0 = performance.now();
    const tick = now => {
      if (my !== token) return res(false);
      const p = still ? 1 : Math.min(1, (now - t0) / ms);
      f(p);
      p < 1 ? requestAnimationFrame(tick) : res(true);
    };
    requestAnimationFrame(tick);
  });
  const steps = (items, title = 'Step-by-step') =>
    `<h4 class="simh">${title}</h4><ol class="simol">${items.map(s => `<li>${s}</li>`).join('')}</ol>`;
  const chips = list => `<div class="chips">${list.map(([k, x]) => `<div class="chip"><b>${k}</b>${esc(x)}</div>`).join('')}</div>`;
  const flow = names => `<div class="simflow">${names.map((s, i) => `<span class="simstep">${s}</span>${i < names.length - 1 ? '→' : ''}`).join('')}</div>`;
  const flowTo = n => out.querySelectorAll('.simstep').forEach((s, i) => s.classList.toggle('done', i < n));
  const fmtF = f => f.map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ');

  /* ================= 1. Meshing gears (GCD & LCM) ================= */
  const PITCH = 10; // arc length of one tooth, so both gears have the same tooth size
  const gear = (teeth, fill) => {
    const R = teeth * PITCH / (2 * Math.PI), h = PITCH * 0.55, Ro = R + h / 2, Rr = R - h / 2, s = 2 * Math.PI / teeth, pts = [];
    for (let k = 0; k < teeth; k++)
      for (const [r, o] of [[Rr, -0.27], [Ro, -0.13], [Ro, 0.13], [Rr, 0.27]])
        pts.push(`${(r * Math.cos((k + o) * s)).toFixed(2)},${(r * Math.sin((k + o) * s)).toFixed(2)}`);
    return { R, Ro, svg: `<path d="M${pts.join('L')}Z" fill="${fill}" stroke="#6b4226" stroke-width="1"/>` +
      `<circle r="${Math.max(4, R * 0.18).toFixed(1)}" fill="#fff" stroke="#6b4226" stroke-width="1.5"/>` +
      `<line x2="${(Rr * 0.85).toFixed(1)}" stroke="#6b4226" stroke-width="2"/>` +
      `<circle cx="${R.toFixed(2)}" r="${(PITCH * 0.3).toFixed(2)}" fill="#b3261e"/>` };
  };

  async function simGears(my) {
    const a = int('gear_a', 'Teeth on gear A', 4, 200), b = int('gear_b', 'Teeth on gear B', 4, 200);
    const r = await api('m2_gcd', { a, b });
    if (my !== token) return;
    const g = r.gcd, L = r.lcm;
    const GA = gear(a, '#e8d5c0'), GB = gear(b, '#d9c3ab'), padd = 8;
    const cy = Math.max(GA.Ro, GB.Ro) + padd, ax = GA.Ro + padd, bx = ax + GA.R + GB.R, W = bx + GB.Ro + padd;
    const b0 = 180 + 180 / b; // turn B so a gap faces A's first tooth (they interlock)
    out.innerHTML = `<svg class="simgears" viewBox="0 0 ${W.toFixed(1)} ${(2 * cy).toFixed(1)}" role="img" aria-label="Two meshing gears">
      <g id="m2s_ga" transform="translate(${ax.toFixed(2)},${cy.toFixed(2)})">${GA.svg}</g>
      <g id="m2s_gb" transform="translate(${bx.toFixed(2)},${cy.toFixed(2)}) rotate(${b0})">${GB.svg}</g></svg>
      <p class="simnote">Teeth meshed: <b id="m2s_gt">0</b> &nbsp;·&nbsp; gear A turns: <b id="m2s_gat">0.00</b> &nbsp;·&nbsp; gear B turns: <b id="m2s_gbt">0.00</b></p><div id="m2s_more"></div>`;
    const ga = $('#m2s_ga'), gb = $('#m2s_gb');
    const ok = await tween(Math.min(9000, Math.max(2500, L * 45)), p => {
      const t = L * p;
      ga.setAttribute('transform', `translate(${ax.toFixed(2)},${cy.toFixed(2)}) rotate(${(t * 360 / a).toFixed(3)})`);
      gb.setAttribute('transform', `translate(${bx.toFixed(2)},${cy.toFixed(2)}) rotate(${(b0 - t * 360 / b).toFixed(3)})`);
      $('#m2s_gt').textContent = Math.round(t);
      $('#m2s_gat').textContent = (t / a).toFixed(2);
      $('#m2s_gbt').textContent = (t / b).toFixed(2);
    });
    if (!ok || my !== token) return;
    $('#m2s_more').innerHTML = `<h3 class="success simans">✔ The two red teeth meet again after ${L} teeth (A turns ${L / a}×, B turns ${L / b}×)</h3>` +
      chips([['gcd', g], ['lcm', L], ['ratio A : B', `${a / g} : ${b / g}`], ['A turns', L / a], ['B turns', L / b]]) +
      steps([
        `gcd(${a}, ${b}) = <b>${g}</b> by the Euclidean algorithm (table below), so the gear ratio ${a} : ${b} simplifies to <b>${a / g} : ${b / g}</b>.`,
        `Gear B turns ${a / g}/${b / g} as fast as gear A.`,
        `The marked teeth line up again after lcm(${a}, ${b}) = ${a} × ${b} / ${g} = <b>${L}</b> teeth: gear A has made ${L / a} full turns and gear B ${L / b}.`,
        g === 1
          ? `Because gcd = 1 (a “hunting tooth” design), every tooth on A meets every tooth on B. Wear is spread evenly, which is why engineers like coprime tooth counts.`
          : `Because gcd = ${g} > 1, each tooth on A only ever meets ${b / g} of B's ${b} teeth, so any damaged tooth keeps hitting the same few partners. Engineers often add or remove a tooth to make the counts coprime.`]) +
      `<h4 class="simh">Euclidean algorithm (a = q·b + r)</h4>` + table(['a', 'b', 'q', 'r'], r.steps);
  }

  /* ================= 2. Valid affine-cipher multipliers (inverses mod m, φ(m)) ================= */
  async function simKeys(my) {
    const m = int('keys_m', 'Alphabet size m', 2, 200);
    const as = Array.from({ length: m - 1 }, (_, i) => i + 1);
    const [f, ...inv] = await Promise.all([api('m2_factor', { n: m }), ...as.map(a => api('m2_inverse', { a, n: m }))]);
    if (my !== token) return;
    const primes = f.factors.map(x => x[0]);
    out.innerHTML = `<p class="simnote">Testing every multiplier a = 1 … ${m - 1}: a key works only if Bob can find a⁻¹ mod ${m}.</p>
      <div class="keygrid">${as.map(a => `<div class="kc" id="m2s_k${a}"><b>${a}</b>…</div>`).join('')}</div>
      <p class="simnote">Usable so far: <b id="m2s_kn">0</b></p><div id="m2s_more"></div>`;
    let n = 0;
    const gap = Math.min(90, 2500 / as.length);
    for (const [i, a] of as.entries()) {
      const x = inv[i].multiplicative, cell = $('#m2s_k' + a);
      if (x === null) cell.innerHTML = `<b>${a}</b>shares ${primes.find(p => a % p === 0)}`;
      else { cell.classList.add('yes'); cell.innerHTML = `<b>${a}</b>a⁻¹=${x}`; n++; }
      $('#m2s_kn').textContent = n;
      await sleep(gap);
      if (my !== token) return;
    }
    $('#m2s_more').innerHTML = `<h3 class="success simans">${n} usable multipliers, and φ(${m}) = ${f.phi} ${n === f.phi ? '✔' : '✘'}</h3>` +
      chips([['m', `${m} = ${f.factorization}`], ['φ(m)', f.phi], ['usable a', n], ['total keys (a, b)', `${n} × ${m} = ${n * m}`]]) +
      steps([
        `Affine encryption E(x) = (a·x + b) mod ${m} can only be undone if a has a multiplicative inverse mod ${m}, i.e. gcd(a, ${m}) = 1.`,
        `${m} = ${f.factorization}, so a fails exactly when it is a multiple of ${primes.join(' or ')}.`,
        `Counting the dark cells gives ${n}. Euler's φ(${m}) = <b>${f.phi}</b> counts the same thing directly, without testing each a.`,
        `With any shift b = 0 … ${m - 1}, the cipher has ${n} × ${m} = <b>${n * m}</b> keys (counting the do-nothing key a = 1, b = 0). That is small enough to brute-force by hand.`]);
  }

  /* ================= 3. Building an RSA private key (Extended Euclid) ================= */
  const modpow = (b, e, m) => {
    let r = 1n; b = BigInt(b) % BigInt(m); e = BigInt(e); m = BigInt(m);
    while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; }
    return r;
  };
  async function simRsa(my) {
    const p = int('rsa_p', 'p', 2, 1e7), q = int('rsa_q', 'q', 2, 1e7), e = int('rsa_e', 'e', 2, 1e9), msg = int('rsa_m', 'Message M', 0, 1e13);
    if (p === q) throw new Error('p and q must be two different primes.');
    if (p * q > 1e13) throw new Error('p × q must be at most 10^13 for this demo.');
    out.innerHTML = flow(['p, q prime?', 'n = p·q', 'φ(n)', 'gcd(e, φ) = 1?', 'd = e⁻¹ mod φ', 'Encrypt', 'Decrypt']) + '<ol class="simol" id="m2s_rl"></ol><div id="m2s_more"></div>';
    const li = h => { $('#m2s_rl').insertAdjacentHTML('beforeend', `<li>${h}</li>`); };
    const stop = h => { $('#m2s_more').innerHTML = `<h3 class="error simans">${h}</h3>`; };
    const pause = async () => { await sleep(450); return my === token; };

    const [fp, fq] = await Promise.all([api('m2_factor', { n: p }), api('m2_factor', { n: q })]);
    if (my !== token) return;
    const prime = f => f.factors.length === 1 && f.factors[0][1] === 1;
    li(`p = ${p}: ${prime(fp) ? 'prime ✔' : `${p} = ${fp.factorization}, not prime ✘`}. &nbsp; q = ${q}: ${prime(fq) ? 'prime ✔' : `${q} = ${fq.factorization}, not prime ✘`}`);
    flowTo(1);
    if (!prime(fp) || !prime(fq)) return stop('✘ RSA needs two primes. Try p = 61, q = 53.');
    if (!await pause()) return;

    const n = p * q;
    li(`n = ${p} × ${q} = <b>${n}</b>. This is public.`);
    flowTo(2); if (!await pause()) return;

    const fn = await api('m2_factor', { n });
    if (my !== token) return;
    const phi = fn.phi;
    li(`φ(n) = (p − 1)(q − 1) = ${p - 1} × ${q - 1} = <b>${phi}</b>. This is secret: computing it needs the factors ${fmtF(fn.factors)}.`);
    flowTo(3); if (!await pause()) return;

    if (e >= phi) return stop(`✘ e must be smaller than φ(n) = ${phi}.`);
    const g = await api('m2_gcd', { a: e, b: phi });
    if (my !== token) return;
    li(`gcd(e, φ) = gcd(${e}, ${phi}) = <b>${g.gcd}</b> ${g.gcd === 1 ? '✔ so e has an inverse' : '✘'}`);
    flowTo(4);
    if (g.gcd !== 1) return stop(`✘ e = ${e} shares a factor with φ(n), so no private key exists. Try e = 3, 5, 17 or 65537.`);
    if (!await pause()) return;

    const [eg, iv] = await Promise.all([api('m2_extended_gcd', { a: e, b: phi }), api('m2_inverse', { a: e, n: phi })]);
    if (my !== token) return;
    const d = ((eg.s % phi) + phi) % phi;
    li(`Extended Euclid: ${esc(eg.identity)}, so e·(${eg.s}) ≡ 1 (mod ${phi}) → d = ${eg.s} mod ${phi} = <b>${d}</b> ` +
      (iv.multiplicative === d ? '(the inverse finder agrees ✔)' : `(inverse finder says ${iv.multiplicative})`));
    flowTo(5); if (!await pause()) return;

    if (msg >= n) return stop(`✘ The message M must be smaller than n = ${n}.`);
    const c = modpow(msg, e, n);
    li(`Alice encrypts M = ${msg} with the public key: c = M<sup>e</sup> mod n = ${msg}<sup>${e}</sup> mod ${n} = <b>${c}</b>`);
    flowTo(6); if (!await pause()) return;

    const back = modpow(c, d, n);
    li(`Bob decrypts with the private key: c<sup>d</sup> mod n = ${c}<sup>${d}</sup> mod ${n} = <b>${back}</b> ${back === BigInt(msg) ? '✔ the original message' : '✘'}`);
    flowTo(7);
    $('#m2s_more').innerHTML = chips([['public key (e, n)', `(${e}, ${n})`], ['private key (d, n)', `(${d}, ${n})`]]) +
      `<h4 class="simh">Extended Euclidean table for ${e} and ${phi}</h4>` + table(['q', 'r', 's', 't'], eg.steps);
  }

  /* ================= 4. Factoring attack (why RSA moduli are huge) ================= */
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const randPrime = k => {
    const lo = 10 ** (k - 1), hi = 10 ** k;
    for (;;) { for (let x = lo + Math.floor(Math.random() * (hi - lo)); x < hi; x++) if (isPrime(x)) return x; }
  };
  const semiprime = d => {
    for (;;) {
      const p = randPrime(Math.ceil(d / 2)), q = randPrime(Math.floor(d / 2)), n = p * q;
      if (p !== q && String(n).length === d && n <= 1e13) return n;
    }
  };
  async function simAttack(my) {
    const max = int('atk_digits', 'Largest modulus size', 4, 13);
    const sizes = [...new Set([4, 6, 8, 10, 12, 13].filter(d => d <= max).concat(max))].sort((x, y) => x - y);
    out.innerHTML = `<p class="simnote">An attacker sees only the public modulus n = p·q. The toolkit's trial-division factorizer attacks moduli of growing size:</p>
      <div id="m2s_tab"></div><div class="bars" id="m2s_bars"></div><div id="m2s_more"></div>`;
    const rows = [], times = [];
    let last = null;
    for (const d of sizes) {
      const n = semiprime(d), t0 = performance.now();
      const f = await api('m2_factor', { n });
      const ms = performance.now() - t0;
      if (my !== token) return;
      rows.push([d, n, fmtF(f.factors), `${ms.toFixed(1)} ms`]);
      times.push([d, ms]);
      last = { n, ms };
      $('#m2s_tab').innerHTML = table(['Digits', 'Public n', 'Recovered p × q', 'Time'], rows, rows.length - 1);
      const top = Math.max(...times.map(x => x[1]));
      $('#m2s_bars').innerHTML = times.map(([dd, t]) =>
        `<div class="bar"><span>${dd} digits</span><i style="width:${Math.max(1, t / top * 100).toFixed(1)}%"></i><em>${t.toFixed(1)} ms</em></div>`).join('');
      await sleep(250);
    }
    if (my !== token) return;
    // trial division needs about √n steps, so scale the last measurement up to a 617-digit (2048-bit) modulus
    const yrs = Math.log10(last.ms / 1000) - 0.5 * Math.log10(last.n) + 308.25 - Math.log10(3.156e7);
    $('#m2s_more').innerHTML = `<h3 class="success simans">Every key above was broken. Now scale it up to a real 2048-bit key…</h3>` + steps([
      'Trial division tries every candidate divisor up to √n, so every 2 extra digits in n makes the attack about 10 times slower. The bars show this growth (tiny moduli are dominated by network overhead).',
      `At this rate a real RSA-2048 modulus (617 digits) would take about <b>10<sup>${Math.round(yrs)}</sup> years</b>. The universe is about 1.4 × 10<sup>10</sup> years old.`,
      'Better algorithms exist (the general number field sieve), but the largest RSA challenge number factored publicly is RSA-250 (250 digits, 2020). That is why RSA keys use hundreds of digits, and why the toolkit stops at 10^13.']);
  }

  /* ================= 5. Water-jug puzzle (Bézout's identity) ================= */
  const pour = (X, Y, c, nx, ny) => { // fill X, pour X → Y, empty Y when full; until either jug holds c
    let x = 0, y = 0, fills = 0, empties = 0;
    const st = [];
    while (x !== c && y !== c && st.length < 600) {
      if (x === 0) { x = X; fills++; st.push([`Fill ${nx}`, x, y]); }
      else if (y === Y) { y = 0; empties++; st.push([`Empty ${ny}`, x, y]); }
      else { const t = Math.min(x, Y - y); x -= t; y += t; st.push([`Pour ${nx} → ${ny}`, x, y]); }
    }
    return { st, fills, empties, x, y, nx, ny, X, Y };
  };
  async function simJugs(my) {
    const a = int('jug_a', 'Jug A', 1, 99), b = int('jug_b', 'Jug B', 1, 99), c = int('jug_c', 'Target', 0, 99);
    const [g, eg] = await Promise.all([api('m2_gcd', { a, b }), api('m2_extended_gcd', { a, b })]);
    if (my !== token) return;
    const G = g.gcd, bez = `Bézout (Extended Euclid): ${esc(eg.identity)}`;
    if (c > Math.max(a, b))
      return void (out.innerHTML = `<h3 class="error simans">✘ Impossible: neither jug can hold ${c} L.</h3>` + steps([bez]));
    if (c % G)
      return void (out.innerHTML = `<h3 class="error simans">✘ Impossible: every amount you can measure is a multiple of gcd(${a}, ${b}) = ${G}, and ${G} does not divide ${c}.</h3>` +
        steps([bez, `Every pour, fill or empty changes the total water by a multiple of ${a} or ${b}, so the water in the jugs is always ${a}·x + ${b}·y, a multiple of ${G}.`]));
    const A1 = pour(a, b, c, 'A', 'B'), B1 = pour(b, a, c, 'B', 'A');
    const S = A1.st.length <= B1.st.length ? A1 : B1, flip = S === B1; // states are (first jug, second jug); show as (A, B)
    const ab = s => flip ? [s[2], s[1]] : [s[1], s[2]];
    const top = Math.max(a, b), H = v => `${(v / top * 160).toFixed(1)}px`;
    out.innerHTML = `<div class="jugs"><div><div class="jug" style="height:${H(a)}"><i id="m2s_wa" style="height:0"></i></div><p><b>A</b> · <span id="m2s_va">0</span> / ${a} L</p></div>
      <div><div class="jug" style="height:${H(b)}"><i id="m2s_wb" style="height:0"></i></div><p><b>B</b> · <span id="m2s_vb">0</span> / ${b} L</p></div>
      <div class="simnote" id="m2s_act">Goal: exactly ${c} L in one jug</div></div><div id="m2s_tab"></div><div id="m2s_more"></div>`;
    const rows = [], gap = Math.min(700, Math.max(150, 9000 / Math.max(1, S.st.length)));
    for (const [i, s] of S.st.entries()) {
      const [va, vb] = ab(s);
      $('#m2s_wa').style.height = H(va); $('#m2s_wb').style.height = H(vb);
      $('#m2s_va').textContent = va; $('#m2s_vb').textContent = vb;
      $('#m2s_act').textContent = `Step ${i + 1}: ${s[0]}`;
      rows.push([i + 1, s[0], va, vb]);
      $('#m2s_tab').innerHTML = table(['Step', 'Action', 'A (L)', 'B (L)'], rows, i);
      await sleep(gap);
      if (my !== token) return;
    }
    const [fa, fb] = ab([0, S.x, S.y]), k = c / G;
    $('#m2s_more').innerHTML = `<h3 class="success simans">✔ ${c} L measured in ${S.st.length} step${S.st.length === 1 ? '' : 's'}</h3>` + steps([
      `A target is reachable only if gcd(${a}, ${b}) = ${G} divides it. ${G} | ${c} ✔`,
      `The pouring is itself a Bézout combination: jug ${S.nx} was filled ${S.fills} time${S.fills === 1 ? '' : 's'} and jug ${S.ny} emptied ${S.empties} time${S.empties === 1 ? '' : 's'}, so the water left is ${S.fills}·${S.X} − ${S.empties}·${S.Y} = ${S.fills * S.X - S.empties * S.Y} L (A ${fa} + B ${fb}).`,
      `${bez}. Scaling by ${c} / ${G} = ${k}: ${a}·(${eg.s * k}) + ${b}·(${eg.t * k}) = ${c}. Every solvable target has such a recipe.`,
      a === 3 && b === 5 && c === 4 ? 'This is the riddle from the film <i>Die Hard with a Vengeance</i>: 3 and 5 gallon jugs, measure exactly 4.' : 'Puzzle classic: try A = 3, B = 5, target 4.']);
  }

  /* ---- tabs, run button, presets ---- */
  const SIMS = { gears: simGears, keys: simKeys, rsa: simRsa, attack: simAttack, jugs: simJugs };
  const show = () => {
    const v = val('m2sim');
    $$('[data-m2s]').forEach(el => el.hidden = el.dataset.m2s !== v);
    token++; out.innerHTML = '';
  };
  $('[data-g=m2sim]').addEventListener('click', e => { if (e.target.closest('button')) show(); });
  const go = guard(async () => { const my = ++token; out.innerHTML = ''; await SIMS[val('m2sim')](my); });
  M('go').onclick = go;

  // One preset per existing "Real-world examples" card, in the same order as member2.js
  const PRESETS = [
    { tab: 'gears', set: { gear_a: 84, gear_b: 126 } },
    { tab: 'keys', set: { keys_m: 26 } },
    { tab: 'rsa', set: { rsa_p: 61, rsa_q: 53, rsa_e: 17, rsa_m: 65 } },
    { tab: 'attack', set: { atk_digits: 13 } },
    { tab: 'jugs', set: { jug_a: 3, jug_b: 5, jug_c: 4 } }];
  const simulate = p => {
    pick('m2sim', p.tab);
    for (const k in p.set) M(k).value = p.set[k];
    $('#m2_sim_card').scrollIntoView({ behavior: 'smooth' });
    go();
  };
  $$('#ex2 .ex').forEach((card, i) => {
    const p = PRESETS[i], tryBtn = card.querySelector('button');
    if (!p || !tryBtn) return;
    const wrap = document.createElement('div'), b = document.createElement('button');
    wrap.className = 'exbtns';
    tryBtn.replaceWith(wrap);
    b.type = 'button'; b.className = 'o'; b.textContent = 'Simulate ▶';
    b.addEventListener('click', e => { e.stopPropagation(); simulate(p); }); // keep the card grid's "Try it" handler from firing
    wrap.append(tryBtn, b);
  });
})();
