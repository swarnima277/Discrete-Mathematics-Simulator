/* Member 1 - Real-world application simulator (card 5 on the Modular Arithmetic page).
   Runs the module's real-world uses as live simulations, the way the cryptography modules do.
   Added alongside member1.js / member1_examples.js, which are unchanged. All modular arithmetic goes
   through Member 1's own functions: modularAddition, modularSubtraction, modularMultiplication, calculateGCD.
   Relies on the shared helpers in index.html: $, $$, esc, val, pick, guard, table. */
(() => {
  const M = id => $('#m1s_' + id);
  const out = M('out');
  const pad = x => String(x).padStart(2, '0');
  const num = (id, name) => {
    const s = M(id).value.trim(), x = Number(s);
    if (s === '' || !Number.isFinite(x)) throw new Error(`${name}: please enter a number.`);
    return x;
  };
  const int = (id, name, lo, hi) => {
    const x = num(id, name);
    if (!Number.isSafeInteger(x)) throw new Error(`${name} must be a whole number.`);
    if (x < lo || x > hi) throw new Error(`${name} must be between ${lo} and ${hi}.`);
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

  /* ================= 1. Clock & time zones (mod 1440 minutes / mod 24 hours) ================= */
  const fmt24 = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const fmt12 = m => { const h = Math.floor(m / 60); return `${h % 12 || 12}:${pad(m % 60)} ${h < 12 ? 'AM' : 'PM'}`; };
  const dayWord = d => d === 0 ? 'same day' : `${d > 0 ? '+' : '−'}${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'}`;
  const clockFace = () => {
    let s = '<svg class="simclock" viewBox="-110 -110 220 220" role="img" aria-label="Analog clock">' +
      '<circle r="104" fill="#faf6f1" stroke="#6b4226" stroke-width="4"/>';
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30, r1 = i % 5 ? 92 : 86;
      s += `<line x1="${(r1 * Math.sin(a)).toFixed(1)}" y1="${(-r1 * Math.cos(a)).toFixed(1)}" x2="${(98 * Math.sin(a)).toFixed(1)}" y2="${(-98 * Math.cos(a)).toFixed(1)}" stroke="#8b5e3c" stroke-width="${i % 5 ? 1 : 2.5}"/>`;
    }
    for (let h = 1; h <= 12; h++) {
      const a = h * Math.PI / 6;
      s += `<text x="${(72 * Math.sin(a)).toFixed(1)}" y="${(-72 * Math.cos(a) + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-family="Georgia,serif" fill="#6b4226">${h}</text>`;
    }
    return s + '<line id="m1s_hh" y2="-50" stroke="#6b4226" stroke-width="7" stroke-linecap="round"/>' +
      '<line id="m1s_mh" y2="-80" stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/>' +
      '<circle r="6" fill="#6b4226"/></svg>';
  };
  const setHands = m => {
    $('#m1s_hh').setAttribute('transform', `rotate(${m / 2})`); // 360° per 720 min
    $('#m1s_mh').setAttribute('transform', `rotate(${m * 6})`); // 360° per 60 min
  };

  async function simClock(my) {
    const st = M('clock_start').value;
    if (!/^\d{2}:\d{2}/.test(st)) throw new Error('Pick a start time.');
    const S = +st.slice(0, 2) * 60 + +st.slice(3, 5);
    const hrs = num('clock_hours', 'Hours that pass'), zone = num('clock_zone', 'Time-zone shift');
    if (Math.abs(hrs) > 1e6) throw new Error('Hours that pass must be within ±1,000,000.');
    if (Math.abs(zone) > 14) throw new Error('Time-zone shift must be between −14 and +14 hours.');
    const E = Math.round(hrs * 60), Z = Math.round(zone * 60);
    const there = modularAddition(S, E, 1440), local = modularAddition(there, Z, 1440);
    const days = Math.floor((S + E + Z) / 1440);

    out.innerHTML = `<div class="simclockwrap">${clockFace()}<div><div class="res" id="m1s_dig">${fmt24(S)}</div>
      <p class="simnote" id="m1s_day">same day</p><p class="simnote">Elapsed: <span id="m1s_el">0</span> h</p></div></div><div id="m1s_more"></div>`;
    setHands(S);
    const total = E + Z;
    const ok = await tween(Math.min(4000, Math.max(1200, Math.abs(total) / 60 * 40)), p => {
      const cur = S + total * p;
      setHands(cur);
      $('#m1s_dig').textContent = fmt24(modularAddition(Math.round(cur), 0, 1440));
      $('#m1s_day').textContent = dayWord(Math.floor(cur / 1440));
      $('#m1s_el').textContent = (total * p / 60).toFixed(1);
    });
    if (!ok || my !== token) return;
    $('#m1s_dig').innerHTML = `${fmt24(local)} &nbsp;<small>(${fmt12(local)})</small>`;

    const L = [
      'A day has 24 × 60 = 1440 minutes and the clock starts again at 00:00, so clock time is the number of minutes past midnight <b>mod 1440</b>.',
      `Start ${fmt24(S)} = ${S} min; ${hrs} h = ${E} min.`,
      `(${S} + ${E}) mod 1440 = <b>${there}</b> → ${fmt24(there)} where you started.`];
    if (Z) L.push(`Time-zone shift ${zone > 0 ? '+' : ''}${zone} h = ${Z} min: (${there} + ${Z}) mod 1440 = <b>${local}</b> → ${fmt24(local)} local time.`);
    L.push(`Days rolled over = ⌊(${S} + ${E}${Z ? ` + ${Z}` : ''}) / 1440⌋ = <b>${days}</b> (${dayWord(days)}).`);
    if (S % 60 === 0 && E % 60 === 0 && Z % 60 === 0)
      L.push(`With whole hours this is plain mod 24: (${S / 60} + ${E / 60 + Z / 60}) mod 24 = ${modularAddition(S / 60, E / 60 + Z / 60, 24)}.`);
    $('#m1s_more').innerHTML = steps(L) +
      `<h3 class="success simans">Arrival: ${fmt24(local)} (${fmt12(local)}), ${dayWord(days)}</h3>`;
  }

  /* ================= 2. Calendar weekdays (mod 7) ================= */
  const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const fmtDate = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  async function simCalendar(my) {
    const ds = M('cal_date').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) throw new Error('Pick a start date.');
    const [y, mo, d] = ds.split('-').map(Number);
    const N = int('cal_days', 'Days later', -1e6, 1e6);
    const start = new Date(y, mo - 1, d), w = start.getDay();
    const res = modularAddition(w, N, 7), q = Math.floor(N / 7), r = N - 7 * q;
    const end = new Date(y, mo - 1, d + N);

    out.innerHTML = `<div class="simstrip">${WD.map((x, i) => `<div class="wk" id="m1s_wk${i}">${x.slice(0, 3)}<br><small>${i}</small></div>`).join('')}</div>
      <p class="simnote">Whole weeks jumped: <b id="m1s_wq">0</b> &nbsp;·&nbsp; extra days: <b id="m1s_wr">0</b></p><div id="m1s_more"></div>`;
    const mark = i => WD.forEach((_, j) => $('#m1s_wk' + j).classList.toggle('cur', j === i));
    mark(w);
    // whole weeks: the marker never moves, only the counter does
    if (!await tween(Math.min(1600, 300 + Math.abs(q) * 30), p => { $('#m1s_wq').textContent = Math.round(q * p); })) return;
    for (let k = 1; k <= r; k++) {
      await sleep(320);
      if (my !== token) return;
      mark(modularAddition(w, 7 * q + k, 7));
      $('#m1s_wr').textContent = k;
    }
    if (my !== token) return;
    $('#m1s_wk' + res).classList.add('end');
    const check = end.getDay() === res;
    $('#m1s_more').innerHTML = steps([
      'Number the weekdays Sunday = 0, Monday = 1, …, Saturday = 6. They repeat every 7 days, so weekdays work <b>mod 7</b>.',
      `${fmtDate(start)} is a ${WD[w]} → ${w}.`,
      `${N} = 7 × ${q} + ${r}: the ${q} whole week${Math.abs(q) === 1 ? '' : 's'} land on the same weekday, so only ${N} mod 7 = <b>${r}</b> matters.`,
      `(${w} + ${N}) mod 7 = <b>${res}</b> → ${WD[res]}.`,
      `Check against the real calendar: ${fmtDate(start)} ${N < 0 ? '−' : '+'} ${Math.abs(N)} days = ${fmtDate(end)} ${check ? '<span class="ok">✔ matches</span>' : '<span class="bad">✘ mismatch</span>'}`]) +
      `<h3 class="success simans">${Math.abs(N)} days ${N < 0 ? 'before' : 'after'} that date is a ${WD[res]}</h3>`;
  }

  /* ================= 3. ISBN-10 check digit (mod 11) ================= */
  let isbnNote = '';
  async function simIsbn(my) {
    const raw = M('isbn').value, s = raw.replace(/[\s-]/g, '').toUpperCase();
    if (!/^\d{9}[\dX]$/.test(s)) throw new Error('An ISBN-10 is 9 digits followed by a digit or X (hyphens and spaces are ignored).');
    const note = isbnNote; isbnNote = '';
    out.innerHTML = (note ? `<p class="simnote">${note}</p>` : '') + `<div id="m1s_tab"></div><div id="m1s_more"></div>`;
    const rows = [];
    let sum = 0, run = 0, s9 = 0;
    for (let i = 0; i < 10; i++) {
      const v = s[i] === 'X' ? 10 : +s[i], wt = 10 - i;
      sum += v * wt;
      run = modularAddition(run, modularMultiplication(v, wt, 11), 11);
      if (i === 8) s9 = run;
      rows.push([i + 1, s[i], `${v} × ${wt}`, v * wt, sum, run]);
      $('#m1s_tab').innerHTML = table(['Position', 'Digit', 'Digit × weight', 'Product', 'Running sum', 'Sum mod 11'], rows, i);
      await sleep(160);
      if (my !== token) return;
    }
    const valid = run === 0, want = modularSubtraction(0, s9, 11), wantCh = want === 10 ? 'X' : String(want);
    const L = [
      'Each of the 10 digits is multiplied by its weight 10, 9, …, 1 (an X in the last place means 10).',
      `Weighted sum = <b>${sum}</b>.`,
      `A real ISBN-10 must satisfy sum ≡ 0 (mod 11). Here ${sum} mod 11 = <b>${run}</b>, so ${sum} ${valid ? '≡' : '≢'} 0 (mod 11).`];
    if (!valid) L.push(`For these first nine digits the check digit must be x with ${s9} + x ≡ 0 (mod 11) → x = (0 − ${s9}) mod 11 = <b>${wantCh}</b>, not ${s[9]}.`);
    L.push('Because 11 is prime, this check catches every single wrong digit and every swap of two neighbouring digits. Try the buttons above.');
    $('#m1s_more').innerHTML = steps(L) + (valid
      ? `<h3 class="success simans">✔ Valid ISBN – the library system accepts it</h3>`
      : `<h3 class="error simans">✘ Invalid ISBN – the scanner rejects it (a typo was caught)</h3>`);
  }
  const digitSpots = raw => [...raw].map((c, i) => /\d/.test(c) ? i : -1).filter(i => i >= 0).slice(0, 9);
  const mutateIsbn = kind => {
    const raw = M('isbn').value, at = digitSpots(raw), ch = [...raw];
    if (at.length < 9) throw new Error('Enter a 10-character ISBN first.');
    if (kind === 'typo') {
      const i = Math.floor(Math.random() * 9), old = ch[at[i]];
      let nw; do nw = String(Math.floor(Math.random() * 10)); while (nw === old);
      ch[at[i]] = nw;
      isbnNote = `Simulated typo: digit ${i + 1} changed from ${old} to ${nw}.`;
    } else {
      const c = [...Array(8).keys()].filter(i => ch[at[i]] !== ch[at[i + 1]]);
      if (!c.length) throw new Error('All neighbouring digits are equal, so there is nothing to swap.');
      const i = c[Math.floor(Math.random() * c.length)];
      [ch[at[i]], ch[at[i + 1]]] = [ch[at[i + 1]], ch[at[i]]];
      isbnNote = `Simulated slip: digits ${i + 1} and ${i + 2} swapped (${ch[at[i + 1]]}${ch[at[i]]} → ${ch[at[i]]}${ch[at[i + 1]]}).`;
    }
    M('isbn').value = ch.join('');
  };

  /* ================= 4. Hash table (key mod m) ================= */
  async function simHash(my) {
    const keys = M('hash_keys').value.split(/[,;\s]+/).filter(Boolean);
    if (!keys.length) throw new Error('Enter at least one key.');
    if (keys.length > 60) throw new Error('Please use at most 60 keys.');
    const m = int('hash_m', 'Table size m', 1, 50);
    const plan = keys.map(k => {
      if (/^[-+]?\d+$/.test(k)) {
        const x = Number(k);
        if (!Number.isSafeInteger(x)) throw new Error(`Key ${k} is too large.`);
        const slot = modularAddition(x, 0, m);
        return { k, slot, how: `${x} mod ${m} = ${slot}` };
      }
      let h = 0; // text key: polynomial hash h = (h·31 + character code) mod m, one character at a time
      for (const c of k) h = modularAddition(modularMultiplication(h, 31, m), c.codePointAt(0), m);
      return { k, slot: h, how: `(h·31 + char code) mod ${m}, per letter = ${h}` };
    });
    out.innerHTML = `<div class="slots">${Array.from({ length: m }, (_, i) =>
      `<div class="slot"><b>slot ${i}</b><span id="m1s_s${i}"></span></div>`).join('')}</div><div id="m1s_tab"></div><div id="m1s_more"></div>`;
    const rows = [], fill = Array(m).fill(0);
    let coll = 0;
    const gap = Math.min(500, Math.max(110, 5000 / plan.length));
    for (const [i, x] of plan.entries()) {
      out.querySelectorAll('.kchip.new').forEach(c => c.classList.remove('new'));
      const c = document.createElement('span'), hit = fill[x.slot] > 0;
      c.className = 'kchip new' + (hit ? ' col' : '');
      c.textContent = x.k;
      $('#m1s_s' + x.slot).append(c);
      fill[x.slot]++; coll += hit;
      rows.push([x.k, x.how, x.slot, hit ? 'collision → chained' : 'empty slot']);
      $('#m1s_tab').innerHTML = table(['Key', 'Hash', 'Slot', 'Result'], rows.slice(-8), Math.min(rows.length, 8) - 1);
      await sleep(gap);
      if (my !== token) return;
    }
    out.querySelectorAll('.kchip.new').forEach(c => c.classList.remove('new'));
    $('#m1s_tab').innerHTML = table(['Key', 'Hash', 'Slot', 'Result'], rows);
    $('#m1s_more').innerHTML = chips([['keys', plan.length], ['load factor', (plan.length / m).toFixed(2)],
      ['collisions', coll], ['longest chain', Math.max(...fill)], ['empty slots', fill.filter(x => !x).length]]) +
      steps([
        `Each key is stored in slot (key mod ${m}), so a lookup jumps straight to one slot instead of searching the whole table.`,
        'Text keys are first turned into a number with a polynomial hash, reducing mod m after every letter so the numbers stay small.',
        'Keys with the same remainder collide and are chained in the same slot.',
        'Tip: store 0, 10, 20, …, 90 with m = 10 and then with m = 11. A table size that shares a factor with a pattern in the keys makes them pile up, which is why hash tables often use a prime size.']);
  }

  /* ================= 5. Affine cipher key (solve a·x ≡ 1 mod 26) ================= */
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  async function simAffine(my) {
    const a = int('aff_a', 'Multiplier a', -1e6, 1e6), b = int('aff_b', 'Shift b', -1e6, 1e6);
    const msg = M('aff_msg').value;
    if (!/[a-z]/i.test(msg)) throw new Error('Enter a message with at least one letter.');
    if (msg.length > 120) throw new Error('Please keep the message to 120 characters.');
    const g = calculateGCD(a, 26);
    const E = x => modularAddition(modularMultiplication(a, x, 26), b, 26);
    out.innerHTML = flow(['Pick key (a, b)', 'Solve a·x ≡ 1 (mod 26)', 'Alice encrypts', 'Send', 'Bob decrypts']) + '<div id="m1s_more"></div>';
    flowTo(1); await sleep(450); if (my !== token) return;
    if (g !== 1) {
      const pairs = [];
      for (let x = 0; x < 26 && pairs.length < 3; x++) { const y = x + 26 / g; if (y < 26) pairs.push([A[x], A[y], A[E(x)]]); }
      flowTo(2);
      $('#m1s_more').innerHTML = steps([
        `Bob can only undo E(x) = (${a}x + ${b}) mod 26 if he can find x with ${a}·x ≡ 1 (mod 26).`,
        `gcd(${a}, 26) = <b>${g}</b>, and ${g} does not divide 1, so this congruence has <b>no solution</b>.`,
        `So different letters encrypt to the same letter: ${pairs.map(p => `${p[0]} and ${p[1]} both become ${p[2]}`).join('; ')}.`]) +
        `<div class="map">Plain &nbsp;<span>${A}</span><br>Cipher <span>${[...A].map((_, x) => A[E(x)]).join('')}</span></div>` +
        `<h3 class="error simans">✘ a = ${a} is not a usable key: Bob cannot tell which letter was meant. Pick a with gcd(a, 26) = 1.</h3>`;
      return;
    }
    let inv = 0;
    for (let i = 0; i < 26; i++) if (modularMultiplication(a, i, 26) === 1) { inv = i; break; }
    const D = y => modularMultiplication(inv, modularSubtraction(y, b, 26), 26);
    const rows = [];
    let cipher = '', back = '';
    for (const ch of msg) {
      const up = ch.toUpperCase(), x = A.indexOf(up);
      if (x < 0) { cipher += ch; back += ch; continue; }
      const y = E(x), z = D(y), low = ch !== up;
      cipher += low ? A[y].toLowerCase() : A[y];
      back += low ? A[z].toLowerCase() : A[z];
      rows.push([up, x, `(${a}·${x} + ${b}) mod 26 = ${y}`, A[y], `${inv}·(${y} − ${b}) mod 26 = ${z}`, A[z]]);
    }
    const more = $('#m1s_more');
    more.innerHTML = steps([
      `Bob needs the inverse of a: solve ${a}·x ≡ 1 (mod 26). gcd(${a}, 26) = 1, so exactly one solution exists.`,
      `x = a⁻¹ = <b>${inv}</b>, since ${a} × ${inv} = ${a * inv} = 26 × ${Math.floor(a * inv / 26)} + ${modularMultiplication(a, inv, 26)}.`]);
    flowTo(2); await sleep(500); if (my !== token) return;
    more.innerHTML += `<p class="simnote">Alice's message</p><div class="res">${esc(msg)}</div>`;
    flowTo(3); await sleep(500); if (my !== token) return;
    more.innerHTML += `<p class="simnote">Sent over the open channel (an eavesdropper sees only this)</p><div class="res">${esc(cipher)}</div>`;
    flowTo(4); await sleep(500); if (my !== token) return;
    more.innerHTML += `<p class="simnote">Bob decrypts with D(y) = ${inv}·(y − ${b}) mod 26</p><div class="res">${esc(back)}</div>` +
      `<h4 class="simh">Letter by letter</h4>` + table(['Letter', 'x', 'Encrypt', 'Cipher', 'Decrypt', 'Bob reads'], rows);
    flowTo(5);
  }

  /* ---- tabs, run button, presets ---- */
  const SIMS = { clock: simClock, calendar: simCalendar, isbn: simIsbn, hash: simHash, affine: simAffine };
  const show = () => {
    const v = val('m1sim');
    $$('[data-m1s]').forEach(el => el.hidden = el.dataset.m1s !== v);
    token++; out.innerHTML = '';
  };
  $('[data-g=m1sim]').addEventListener('click', e => { if (e.target.closest('button')) show(); });
  const go = guard(async () => { const my = ++token; out.innerHTML = ''; await SIMS[val('m1sim')](my); });
  M('go').onclick = go;
  M('isbn_typo').onclick = guard(async () => { mutateIsbn('typo'); await go(); });
  M('isbn_swap').onclick = guard(async () => { mutateIsbn('swap'); await go(); });
  const t = new Date();
  M('cal_date').value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;

  // One preset per existing "Real-world examples" card, in the same order as member1_examples.js
  const PRESETS = [
    { tab: 'clock', set: { clock_start: '09:00', clock_hours: 100, clock_zone: 0 } },
    { tab: 'calendar', set: { cal_date: '2026-11-04', cal_days: 100 } },
    { tab: 'isbn', set: { isbn: '0-306-40615-2' } },
    { tab: 'hash', set: { hash_keys: Array.from({ length: 20 }, (_, i) => i).join(', '), hash_m: 5 } },
    { tab: 'affine', set: { aff_a: 5, aff_b: 8, aff_msg: 'Meet at noon' } }];
  const simulate = p => {
    pick('m1sim', p.tab);
    for (const k in p.set) M(k).value = p.set[k];
    $('#m1_sim_card').scrollIntoView({ behavior: 'smooth' });
    go();
  };
  $$('#ex1 .ex').forEach((card, i) => {
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
