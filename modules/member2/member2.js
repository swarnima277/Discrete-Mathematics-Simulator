/* Member 2 - Number Theory Toolkit: UI glue for the sidebar frontend.
   Calls the endpoints in app.py, which in turn call number_theory_toolkit.py (unchanged).
   Relies on the shared helpers defined in index.html: $, esc, api, guard, table, exCards. */
(() => {
  const v = id => $('#' + id).value;
  const chips = list => `<div class="chips">${list.map(([k, x]) => `<div class="chip"><b>${k}</b>${esc(x)}</div>`).join('')}</div>`;
  const put = (id, html) => { $('#' + id).innerHTML = html; };

  const gcdRun = guard(async () => {
    const a = v('m2_gcd_a'), b = v('m2_gcd_b');
    const r = await api('m2_gcd', { a, b });
    put('m2_gcd_out',
      `<div class="res">gcd(${esc(a)}, ${esc(b)}) = ${r.gcd}</div>` +
      chips([['lcm', r.lcm], ['coprime?', r.coprime ? 'yes' : 'no'], ['common divisors', r.divisors.join(', ')]]) +
      (r.steps.length
        ? `<h4 style="color:#6b4226;margin:14px 0 0">Euclidean algorithm (a = q·b + r)</h4>` + table(['a', 'b', 'q', 'r'], r.steps)
        : `<p style="font-size:13px;color:#8b5e3c">b = 0, so gcd(a, 0) = |a| with no division steps.</p>`));
  });

  const egcdRun = guard(async () => {
    const a = v('m2_eg_a'), b = v('m2_eg_b');
    const r = await api('m2_extended_gcd', { a, b });
    put('m2_eg_out',
      `<div class="res">${esc(r.identity)}</div>` +
      chips([['gcd', r.gcd], ['s', r.s], ['t', r.t]]) +
      `<h4 style="color:#6b4226;margin:14px 0 0">Extended Euclidean table (each row keeps r = a·s + b·t)</h4>` +
      table(['q', 'r', 's', 't'], r.steps));
  });

  const invRun = guard(async () => {
    const a = v('m2_inv_a'), n = v('m2_inv_n');
    const r = await api('m2_inverse', { a, n });
    const mult = r.multiplicative === null
      ? `<span class="bad">none</span> – gcd(${esc(a)} mod ${esc(n)}, ${esc(n)}) ≠ 1, so ${esc(a)} is not invertible mod ${esc(n)}`
      : `<b>${r.multiplicative}</b> &nbsp;(check: ${esc(a)} × ${r.multiplicative} ≡ 1 mod ${esc(n)})`;
    put('m2_inv_out',
      `<div class="res">Additive inverse of ${esc(a)} mod ${esc(n)} = ${r.additive}</div>` +
      `<p style="margin:10px 0 0">Multiplicative inverse: ${mult}</p>`);
  });

  const facRun = guard(async () => {
    const n = v('m2_f_n');
    const r = await api('m2_factor', { n });
    put('m2_f_out',
      `<div class="res">${esc(r.number)} = ${esc(r.factorization)}</div>` +
      chips([['φ(n)', r.phi], ['# divisors', r.divisors.length], ['divisors', r.divisors.length > 40 ? r.divisors.slice(0, 40).join(', ') + ' …' : r.divisors.join(', ')]]) +
      `<h4 style="color:#6b4226;margin:14px 0 0">Division ladder</h4>` + table(['number', 'divide by', 'quotient'], r.ladder));
  });

  $('#m2_gcd_go').onclick = gcdRun;
  $('#m2_eg_go').onclick = egcdRun;
  $('#m2_inv_go').onclick = invRun;
  $('#m2_f_go').onclick = facRun;

  const set = (o) => { for (const k in o) $('#' + k).value = o[k]; };
  const tryIt = (vals, btn, card) => { set(vals); $('#' + card).scrollIntoView({ behavior: 'smooth' }); $('#' + btn).click(); };

  exCards('#ex2', [
    { tag: 'Engineering · Gears', t: 'Gear ratios & fractions', d: 'GCD simplifies 84/126 to 2/3 and tells you how often two gear teeth line up again.', run: () => tryIt({ m2_gcd_a: 84, m2_gcd_b: 126 }, 'm2_gcd_go', 'm2_gcd_card') },
    { tag: 'Cryptography · Affine cipher', t: 'Valid cipher keys', d: 'φ(26) = 12 counts the multipliers a that give a usable Affine cipher key.', run: () => tryIt({ m2_f_n: 26 }, 'm2_f_go', 'm2_f_card') },
    { tag: 'Cryptography · RSA', t: 'Modular inverses', d: 'Extended Euclid finds the RSA decryption key: the inverse of e = 17 modulo φ(n) = 3120.', run: () => tryIt({ m2_inv_a: 17, m2_inv_n: 3120 }, 'm2_inv_go', 'm2_inv_card') },
    { tag: 'Security · Factoring', t: 'Security of factoring', d: 'Factoring a 12-digit product of two primes by trial division already takes noticeable work – real RSA moduli have hundreds of digits.', run: () => tryIt({ m2_f_n: 999985999949 }, 'm2_f_go', 'm2_f_card') },
    { tag: 'Algebra · Bézout', t: 'Writing gcd as a combination', d: 'Extended Euclid expresses gcd(240, 46) = 2 as 240·s + 46·t.', run: () => tryIt({ m2_eg_a: 240, m2_eg_b: 46 }, 'm2_eg_go', 'm2_eg_card') }
  ]);
})();
