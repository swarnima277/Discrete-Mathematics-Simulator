/* Shared UI helpers for the Unit 1-6 simulators (cards, tables, Venn diagrams, number helpers).
   Uses the same theme variables / classes as index.html - no new colours are introduced. */
(() => {
  const DM = window.DM = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  DM.esc = esc;
  DM.col = { br: '#6b4226', br2: '#8b5e3c', tan: '#d9c3ab', cream: '#faf6f1', line: '#eadfd2', blue: '#8fbcd8', green: '#2e7d32', red: '#b3261e', gold: '#c9a98a', sage: '#a9c9a4', tx: '#2e2118', hl: '#f1e0cc' };
  const main = document.querySelector('main');

  /* A page = <section class="page"> with a title + intro; page.card() appends one card (one syllabus subtopic). */
  DM.page = (id, title, intro) => {
    const s = document.createElement('section'); s.className = 'page'; s.id = id; s.hidden = true;
    s.innerHTML = `<h1>${title}</h1><p>${intro}</p>`; main.appendChild(s);
    return { el: s, card(cid, t, concept, body, use) {
      const d = document.createElement('div'); d.className = 'card'; d.id = cid;
      d.innerHTML = `<h3>${t}</h3><p class="concept">${concept}</p>${body}${use ? `<p class="use"><b>Real-world use:</b> ${use}</p>` : ''}`;
      s.appendChild(d); return d; } };
  };
  DM.chips = l => `<div class="chips">${l.map(([k, v]) => `<div class="chip"><b>${k}</b>${v}</div>`).join('')}</div>`;
  DM.tbl = (h, r, o = {}) => `<div class="tw"><table><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr>${r.map((x, i) => `<tr class="${o.hl && o.hl(i, x) ? 'hl' : ''}">${x.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
  DM.yes = t => `<span class="ok">✔</span> ${t}`;
  DM.no = t => `<span class="bad">✘</span> ${t}`;
  DM.tf = (b, t) => b ? DM.yes(t) : DM.no(t);
  DM.note = t => `<p class="simnote">${t}</p>`;
  DM.h4 = t => `<h4 class="simh">${t}</h4>`;
  DM.svg = (w, h, inner, cls = 'vz') => `<svg class="${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,sans-serif">${inner}</svg>`;
  DM.txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.s || 13}" fill="${o.c || DM.col.tx}" ${o.b ? 'font-weight="700"' : ''} ${o.f ? `font-family="${o.f}"` : ''} dominant-baseline="${o.d || 'central'}">${esc(t)}</text>`;
  DM.seg = (host, opts, init, cb) => {
    host.className = 'seg'; host.innerHTML = opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${v === init ? 'on' : ''}">${l}</button>`).join('');
    const o = { v: init, set(v) { o.v = v; host.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); } };
    host.onclick = e => { const b = e.target.closest('button'); if (!b) return; o.set(b.dataset.v); cb && cb(o.v); };
    return o;
  };
  DM.sel = (opts, cls = '') => `<select class="${cls}">${opts.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select>`;
  DM.field = (label, cls, val, extra = '') => `<div><label>${label}</label><input class="${cls}" value="${esc(val)}" ${extra}></div>`;
  DM.list = s => [...new Set(String(s).split(/[,;\s]+/).map(x => x.trim()).filter(Boolean))];
  DM.set = a => '{' + a.map(esc).join(', ') + '}';
  DM.sleep = ms => new Promise(r => setTimeout(r, ms));
  DM.int = (v, name, lo, hi) => { const x = Number(String(v).trim()); if (String(v).trim() === '' || !Number.isInteger(x)) throw new Error(`${name} must be a whole number.`); if (x < lo || x > hi) throw new Error(`${name} must be between ${lo} and ${hi}.`); return x; };
  const toast = m => { const t = document.querySelector('#toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(t._t); t._t = setTimeout(() => t.style.display = 'none', 3800); };
  DM.toast = toast;
  DM.guard = f => (...a) => { try { return f(...a); } catch (e) { toast(e.message); } };
  /* animation: a player that steps through n frames; draw(i) paints frame i */
  DM.player = (host, n, draw, ms = 700) => {
    if (host._stop) host._stop();
    host.innerHTML = `<div class="pl"><button type="button" class="o pb">⏮ Reset</button><button type="button" class="o pp">▶ Play</button><button type="button" class="o pn">Step ▶</button><input type="range" class="ps" min="0" max="${Math.max(0, n - 1)}" value="0"><span class="pc"></span></div>`;
    const sl = host.querySelector('.ps'), cnt = host.querySelector('.pc'); let timer = null;
    const show = i => { sl.value = i; cnt.textContent = `step ${+i + 1} / ${n}`; draw(+i); };
    const stop = () => { clearInterval(timer); timer = null; const pp = host.querySelector('.pp'); if (pp) pp.textContent = '▶ Play'; };
    host.querySelector('.pb').onclick = () => { stop(); show(0); };
    host.querySelector('.pn').onclick = () => { stop(); if (+sl.value < n - 1) show(+sl.value + 1); };
    host.querySelector('.pp').onclick = () => { if (timer) return stop(); if (+sl.value >= n - 1) show(0); host.querySelector('.pp').textContent = '⏸ Pause';
      timer = setInterval(() => { if (+sl.value >= n - 1) return stop(); show(+sl.value + 1); }, ms); };
    sl.oninput = () => { stop(); show(sl.value); };
    host._stop = stop; show(0); return { show, stop };
  };

  /* ---- number helpers (BigInt-safe where it matters) ---- */
  DM.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  DM.fact = n => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; };
  DM.nPr = (n, r) => { if (r > n || r < 0) return 0n; let x = 1n; for (let i = 0; i < r; i++) x *= BigInt(n - i); return x; };
  DM.nCr = (n, r) => { if (r > n || r < 0) return 0n; r = Math.min(r, n - r); let x = 1n; for (let i = 1; i <= r; i++) x = x * BigInt(n - r + i) / BigInt(i); return x; };
  DM.isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  DM.factor = n => { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; };
  DM.phi = n => DM.factor(n).reduce((r, [p]) => r / p * (p - 1), n);
  DM.mod = (a, n) => ((a % n) + n) % n;
  DM.powmod = (b, e, m) => { b = BigInt(b); e = BigInt(e); m = BigInt(m); let r = 1n; b %= m; if (b < 0n) b += m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r % m; };
  DM.egcd = (a, b) => { let [r0, r1, s0, s1, t0, t1] = [a, b, 1, 0, 0, 1]; while (r1) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [s0, s1] = [s1, s0 - q * s1]; [t0, t1] = [t1, t0 - q * t1]; } return [r0, s0, t0]; };
  DM.inv = (a, n) => { const [g, s] = DM.egcd(DM.mod(a, n), n); return g === 1 ? DM.mod(s, n) : null; };
  DM.fmtBig = x => { const s = x.toString(); return s.length > 30 ? s.slice(0, 12) + '…(' + s.length + ' digits)' : s; };
  DM.perms = a => a.length <= 1 ? [a.slice()] : a.flatMap((x, i) => DM.perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
  DM.combs = (a, r) => r === 0 ? [[]] : a.length < r ? [] : [...DM.combs(a.slice(1), r - 1).map(c => [a[0], ...c]), ...DM.combs(a.slice(1), r)];

  /* ---- Venn diagram: 2 or 3 sets, region shading + elements/labels per region ----
     mask bits: A=1, B=2, C=4 (mask 0 = outside every circle but inside the universe box). */
  let uid = 0;
  DM.venn = o => {
    const n = o.n || o.names.length, id = ++uid, fillc = '#e6c9a8', cc = ['#c9a98a', '#8fbcd8', '#a9c9a4'];
    const circ = n === 2 ? [[200, 150, 95], [300, 150, 95]] : [[190, 125, 90], [310, 125, 90], [250, 215, 90]];
    const W = 500, H = n === 2 ? 300 : 340;
    const anc = n === 2 ? { 1: [140, 150], 2: [360, 150], 3: [250, 150], 0: [450, 268] } : { 1: [130, 95], 2: [370, 95], 4: [250, 262], 3: [250, 92], 5: [190, 185], 6: [310, 185], 7: [250, 155], 0: [452, 312] };
    const lab = n === 2 ? [[120, 50], [380, 50]] : [[100, 45], [400, 45], [385, 300]];
    let defs = '', body = '';
    circ.forEach(([x, y, r], i) => defs += `<clipPath id="vc${id}_${i}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>`);
    const masks = [...Array(1 << n).keys()];
    if (o.shade) {
      defs += `<mask id="vz${id}"><rect width="${W}" height="${H}" fill="#fff"/>${circ.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('')}</mask>`;
      if (o.shade(0)) body += `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="${fillc}" mask="url(#vz${id})"/>`;
      masks.filter(m => m && o.shade(m)).forEach(m => {
        defs += `<mask id="vm${id}_${m}"><rect width="${W}" height="${H}" fill="#fff"/>${circ.map(([x, y, r], i) => (m >> i & 1) ? '' : `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('')}</mask>`;
        let inner = `<rect width="${W}" height="${H}" fill="${fillc}"/>`;
        circ.forEach((_, i) => { if (m >> i & 1) inner = `<g clip-path="url(#vc${id}_${i})">${inner}</g>`; });
        body += `<g mask="url(#vm${id}_${m})">${inner}</g>`;
      });
    }
    circ.forEach(([x, y, r], i) => body += `<circle cx="${x}" cy="${y}" r="${r}" fill="${cc[i]}" fill-opacity=".22" stroke="${DM.col.br}" stroke-width="2"/>`);
    body += `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none" stroke="${DM.col.br2}" stroke-width="1.5"/>` + DM.txt(20, 20, o.uni || 'U', { b: 1, c: DM.col.br2, s: 15 });
    o.names.slice(0, n).forEach((nm, i) => body += DM.txt(lab[i][0], lab[i][1], nm, { b: 1, s: 20, c: DM.col.br }));
    masks.forEach(m => {
      const [ax, ay] = anc[m];
      if (o.labels && o.labels[m] != null) { body += DM.txt(ax, ay, o.labels[m], { b: 1, s: 17, c: DM.col.br }); return; }
      let items = (o.elems && o.elems[m]) || [];
      if (items.length > 8) items = items.slice(0, 7).concat(['…']);
      const cols = items.length > 3 ? 2 : 1, rows = Math.ceil(items.length / cols);
      items.forEach((it, k) => { const cx = ax + (cols === 1 ? 0 : (k % 2 ? 22 : -22)), cy = ay + (Math.floor(k / cols) - (rows - 1) / 2) * 16; body += DM.txt(cx, cy, it, { s: 13 }); });
    });
    return DM.svg(W, H, `<defs>${defs}</defs>${body}`, 'vz venn');
  };
  DM.maskOf = (x, sets) => sets.reduce((m, s, i) => m | (s.includes(x) ? 1 << i : 0), 0);
  DM.regionElems = (sets, uni) => { const r = {}; uni.forEach(x => { const m = DM.maskOf(x, sets); (r[m] = r[m] || []).push(x); }); return r; };
})();
