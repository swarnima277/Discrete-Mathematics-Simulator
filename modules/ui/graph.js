/* Graph engine shared by Units 1 (digraphs of relations), 5 (graphs) and 6 (trees, shortest paths, spanning trees).
   Graph object: { names:[...], pos:[{x,y}], edges:[{u,v,w}], directed:bool, weighted:bool } (vertices are 0..n-1). */
(() => {
  const { esc, col } = DM;
  const G = DM.G = {};
  let gid = 0;
  G.label = i => i < 26 ? String.fromCharCode(65 + i) : 'V' + i;

  /* ---------- drawing ---------- */
  DM.drawGraph = spec => {
    const { w = 640, h = 400, nodes, edges, directed } = spec, R = spec.r || 18, id = ++gid;
    const colors = [...new Set(edges.map(e => e.color || col.br))];
    const defs = directed ? colors.map((c, i) => `<marker id="ah${id}_${i}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`).join('') : '';
    const grp = {}; edges.forEach((e, i) => { const k = Math.min(e.u, e.v) + '_' + Math.max(e.u, e.v); (grp[k] = grp[k] || []).push(i); });
    let eb = '', lb = '';
    const lab = (x, y, t, c) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="12.5" font-weight="700" fill="${c || col.br2}" stroke="#fff" stroke-width="4" paint-order="stroke">${esc(t)}</text>`;
    edges.forEach((e, i) => {
      const a = nodes[e.u], b = nodes[e.v], c = e.color || col.br, k = Math.min(e.u, e.v) + '_' + Math.max(e.u, e.v), Gp = grp[k], idx = Gp.indexOf(i);
      const mk = directed ? `marker-end="url(#ah${id}_${colors.indexOf(c)})"` : '', sw = e.width || 2.2, da = e.dash ? 'stroke-dasharray="6 4"' : '';
      if (e.u === e.v) { const s = 1 + idx * .55, x = a.x, y = a.y; eb += `<path d="M${x - 9},${y - R + 2} C${x - 36 * s},${y - R - 48 * s} ${x + 36 * s},${y - R - 48 * s} ${x + 9},${y - R + 2}" fill="none" stroke="${c}" stroke-width="${sw}" ${da} ${mk}/>`; if (e.label != null) lb += lab(x, y - R - 38 * s, e.label, e.lc); return; }
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, sign = e.u < e.v ? 1 : -1, off = (idx - (Gp.length - 1) / 2) * 44 * sign;
      const cx = (a.x + b.x) / 2 + nx * off, cy = (a.y + b.y) / 2 + ny * off;
      const da1 = Math.hypot(cx - a.x, cy - a.y) || 1, db1 = Math.hypot(cx - b.x, cy - b.y) || 1, rb = R + (directed ? 2 : 0);
      const sx = a.x + (cx - a.x) / da1 * R, sy = a.y + (cy - a.y) / da1 * R, ex = b.x + (cx - b.x) / db1 * rb, ey = b.y + (cy - b.y) / db1 * rb;
      eb += `<path d="M${sx},${sy} Q${cx},${cy} ${ex},${ey}" fill="none" stroke="${c}" stroke-width="${sw}" ${da} ${mk}/>`;
      if (e.label != null) lb += lab(.25 * sx + .5 * cx + .25 * ex + (off === 0 ? nx * 10 : 0), .25 * sy + .5 * cy + .25 * ey + (off === 0 ? ny * 10 : 0), e.label, e.lc);
    });
    const nb = nodes.map(n => `${n.ring ? `<circle cx="${n.x}" cy="${n.y}" r="${R + 6}" fill="none" stroke="${n.ring}" stroke-width="3" opacity=".7"/>` : ''}<circle cx="${n.x}" cy="${n.y}" r="${R}" fill="${n.fill || col.cream}" stroke="${n.stroke || col.br}" stroke-width="2"/><text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="central" font-size="${(n.label || '').length > 2 ? 11 : 14}" font-weight="700" fill="${n.lc || col.tx}">${esc(n.label ?? '')}</text>${n.sub != null ? `<text x="${n.x}" y="${n.y + R + 12}" text-anchor="middle" font-size="12" fill="${n.subc || col.br2}" font-weight="700">${esc(n.sub)}</text>` : ''}`).join('');
    return DM.svg(w, h, `<defs>${defs}</defs>${eb}${nb}${lb}`, spec.cls || 'vz wide');
  };
  /* build a draw spec from a graph and decorations: deco = { n:{i:{fill,stroke,ring,sub,lc,label}}, e:{i:{color,dash,width,label}}, showW } */
  G.draw = (g, deco = {}, opt = {}) => DM.drawGraph({ w: opt.w || 640, h: opt.h || 400, r: opt.r, cls: opt.cls, directed: g.directed,
    nodes: g.pos.map((p, i) => ({ x: p.x, y: p.y, label: g.names[i], ...(deco.n && deco.n[i]) })),
    edges: g.edges.map((e, i) => ({ u: e.u, v: e.v, label: g.weighted && deco.showW !== false ? e.w : undefined, ...(deco.e && deco.e[i]) })) });

  /* ---------- construction ---------- */
  G.circle = (n, cx = 320, cy = 200, r = 150, start = -Math.PI / 2) => Array.from({ length: n }, (_, i) => ({ x: Math.round(cx + r * Math.cos(start + 2 * Math.PI * i / n)), y: Math.round(cy + r * Math.sin(start + 2 * Math.PI * i / n)) }));
  G.make = (n, edges, pos, o = {}) => ({ names: o.names || Array.from({ length: n }, (_, i) => G.label(i)), pos: pos || G.circle(n), edges: edges.map(e => ({ u: e[0], v: e[1], w: e[2] ?? 1 })), directed: !!o.directed, weighted: !!o.weighted });
  G.clone = g => ({ ...g, names: g.names.slice(), pos: g.pos.map(p => ({ ...p })), edges: g.edges.map(e => ({ ...e })) });
  const cyc = n => Array.from({ length: n }, (_, i) => [i, (i + 1) % n]);
  const comp = n => { const e = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]); return e; };
  G.presets = {
    'Complete K5': () => G.make(5, comp(5)),
    'Cycle C6': () => G.make(6, cyc(6)),
    'Path P5': () => G.make(5, [[0, 1], [1, 2], [2, 3], [3, 4]], Array.from({ length: 5 }, (_, i) => ({ x: 90 + i * 115, y: 200 }))),
    'Complete bipartite K3,3': () => G.make(6, [0, 1, 2].flatMap(i => [3, 4, 5].map(j => [i, j])), [0, 1, 2].map(i => ({ x: 180, y: 90 + i * 110 })).concat([0, 1, 2].map(i => ({ x: 460, y: 90 + i * 110 })))),
    'Petersen graph': () => G.make(10, [...cyc(5), ...[0, 1, 2, 3, 4].map(i => [i, i + 5]), ...[0, 1, 2, 3, 4].map(i => [5 + i, 5 + (i + 2) % 5])], [...G.circle(5, 320, 200, 165), ...G.circle(5, 320, 200, 80)]),
    'Cube Q3': () => G.make(8, [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], [[170, 110], [400, 110], [400, 300], [170, 300], [250, 160], [480, 160], [480, 350], [250, 350]].map(([x, y]) => ({ x: x - 40, y: y - 60 }))),
    'Wheel W6': () => G.make(6, [...cyc(5), ...[0, 1, 2, 3, 4].map(i => [i, 5])], [...G.circle(5, 320, 200, 150), { x: 320, y: 200 }]),
    'Star K1,5': () => G.make(6, [1, 2, 3, 4, 5].map(i => [0, i]), [{ x: 320, y: 200 }, ...G.circle(5, 320, 200, 150)]),
    'House': () => G.make(5, [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4]], [{ x: 220, y: 200 }, { x: 420, y: 200 }, { x: 420, y: 350 }, { x: 220, y: 350 }, { x: 320, y: 80 }]),
    'Bowtie (cut vertex)': () => G.make(5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]], [{ x: 120, y: 120 }, { x: 120, y: 290 }, { x: 320, y: 200 }, { x: 520, y: 120 }, { x: 520, y: 290 }]),
    'Two components': () => G.make(7, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 6]], [{ x: 100, y: 120 }, { x: 220, y: 100 }, { x: 160, y: 250 }, { x: 330, y: 120 }, { x: 420, y: 250 }, { x: 510, y: 120 }, { x: 560, y: 290 }]),
    'Two triangles': () => G.make(6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]], [{ x: 120, y: 120 }, { x: 260, y: 120 }, { x: 190, y: 270 }, { x: 380, y: 120 }, { x: 520, y: 120 }, { x: 450, y: 270 }]),
    'Null graph N5': () => G.make(5, []),
    'Tree (8 vertices)': () => G.make(8, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [5, 6], [5, 7]], [{ x: 320, y: 50 }, { x: 190, y: 150 }, { x: 460, y: 150 }, { x: 120, y: 270 }, { x: 260, y: 270 }, { x: 460, y: 250 }, { x: 390, y: 360 }, { x: 530, y: 360 }]),
    'Prism (3-regular)': () => G.make(6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]], [...G.circle(3, 320, 200, 70), ...G.circle(3, 320, 200, 165)]),
    'Directed sample': () => G.make(6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3], [1, 4], [0, 0]], null, { directed: true }),
    'Weighted sample': () => G.make(7, [[0, 1, 7], [0, 3, 5], [1, 2, 8], [1, 3, 9], [1, 4, 7], [2, 4, 5], [3, 4, 15], [3, 5, 6], [4, 5, 8], [4, 6, 9], [5, 6, 11]], [{ x: 90, y: 120 }, { x: 230, y: 60 }, { x: 420, y: 70 }, { x: 160, y: 270 }, { x: 330, y: 190 }, { x: 330, y: 340 }, { x: 540, y: 270 }], { weighted: true }),
    'Weighted directed (roads)': () => G.make(6, [[0, 1, 4], [0, 2, 2], [1, 2, 5], [1, 3, 10], [2, 4, 3], [4, 3, 4], [3, 5, 11], [4, 5, 15]], [{ x: 70, y: 200 }, { x: 220, y: 80 }, { x: 220, y: 320 }, { x: 440, y: 90 }, { x: 420, y: 300 }, { x: 580, y: 200 }], { weighted: true, directed: true })
  };
  /* text format:  "A-B, B-C:4, C>D, E"  (':w' weight, '>' directed arc, lone name = isolated vertex) */
  G.parse = (text, old) => {
    const names = [], edges = []; const id = s => { let i = names.indexOf(s); if (i < 0) { names.push(s); i = names.length - 1; } return i; };
    let directed = false, weighted = false;
    String(text).split(/[,;\n]+/).map(t => t.trim()).filter(Boolean).forEach(t => {
      const m = /^([A-Za-z0-9_]+)\s*(->|>|-)?\s*([A-Za-z0-9_]+)?(?:\s*:\s*(-?\d+(?:\.\d+)?))?$/.exec(t); if (!m) throw new Error(`Cannot read “${t}”. Use e.g.  A-B, B-C:4, C>D, E`);
      const u = id(m[1]); if (m[3] === undefined) return; const v = id(m[3]); if (m[2] && m[2] !== '-') directed = true; if (m[4] !== undefined) weighted = true; edges.push({ u, v, w: m[4] !== undefined ? +m[4] : 1 });
    });
    if (names.length > 26) throw new Error('At most 26 vertices.');
    const keep = old ? old.names.map((n, i) => [n, old.pos[i]]) : [], circ = G.circle(names.length);
    return { names, pos: names.map((n, i) => (keep.find(k => k[0] === n) || [0, circ[i]])[1]), edges, directed: directed || (old && old.directed && edges.length === 0 ? old.directed : directed), weighted };
  };
  G.toText = g => { const used = new Set(); const e = g.edges.map(e => { used.add(e.u); used.add(e.v); return `${g.names[e.u]}${g.directed ? '>' : '-'}${g.names[e.v]}${g.weighted ? ':' + e.w : ''}`; }); g.names.forEach((n, i) => { if (!used.has(i)) e.push(n); }); return e.join(', '); };

  /* ---------- algorithms ---------- */
  G.adj = (g, dir = false) => { const a = g.names.map(() => []); g.edges.forEach((e, i) => { a[e.u].push({ to: e.v, id: i, w: e.w }); if (!(dir && g.directed) && e.u !== e.v) a[e.v].push({ to: e.u, id: i, w: e.w }); }); return a; };
  G.degrees = g => { const d = g.names.map(() => 0), din = d.slice(), dout = d.slice(); g.edges.forEach(e => { d[e.u]++; d[e.v]++; dout[e.u]++; din[e.v]++; }); return { deg: d, din, dout }; };
  G.components = g => { const a = G.adj(g), c = g.names.map(() => -1); let k = 0; g.names.forEach((_, s) => { if (c[s] >= 0) return; const q = [s]; c[s] = k; while (q.length) { const x = q.shift(); a[x].forEach(({ to }) => { if (c[to] < 0) { c[to] = k; q.push(to); } }); } k++; }); return { comp: c, count: k }; };
  G.connected = g => g.names.length === 0 || G.components(g).count === 1;
  G.bfs = (g, s, dir = false) => { const a = G.adj(g, dir), dist = g.names.map(() => -1), par = g.names.map(() => -1), pe = g.names.map(() => -1), order = [s]; dist[s] = 0; for (let i = 0; i < order.length; i++) a[order[i]].forEach(({ to, id }) => { if (dist[to] < 0) { dist[to] = dist[order[i]] + 1; par[to] = order[i]; pe[to] = id; order.push(to); } }); return { dist, par, pe, order }; };
  G.dfs = (g, s) => { const a = G.adj(g), seen = g.names.map(() => false), par = g.names.map(() => -1), pe = g.names.map(() => -1), order = []; const go = x => { seen[x] = true; order.push(x); a[x].forEach(({ to, id }) => { if (!seen[to]) { par[to] = x; pe[to] = id; go(to); } }); }; go(s); return { par, pe, order, seen }; };
  G.uf = n => { const p = Array.from({ length: n }, (_, i) => i); const f = x => p[x] === x ? x : (p[x] = f(p[x])); return { find: f, union: (a, b) => { a = f(a); b = f(b); if (a === b) return false; p[a] = b; return true; } }; };
  G.hasCycle = g => { const u = G.uf(g.names.length); return g.edges.some(e => !u.union(e.u, e.v)); };
  G.isTree = g => g.names.length > 0 && G.connected(g) && g.edges.length === g.names.length - 1;
  G.simplePaths = (g, s, t, limit = 200) => { const a = G.adj(g, true), res = []; const go = (x, path) => { if (res.length >= limit) return; if (x === t) { res.push(path.slice()); return; } a[x].forEach(({ to }) => { if (!path.includes(to)) { path.push(to); go(to, path); path.pop(); } }); }; go(s, [s]); return res; };
  G.simpleCycles = (g, limit = 200) => { const a = G.adj(g), n = g.names.length, res = [], seen = new Set(); const go = (s, x, path) => { if (res.length >= limit) return; a[x].forEach(({ to }) => { if (to === s && path.length >= 3) { const key = [...path].sort((p, q) => p - q).join(',') + '|' + (path[1] < path[path.length - 1] ? path : [path[0], ...path.slice(1).reverse()]).join(','); if (!seen.has(key)) { seen.add(key); res.push(path.slice()); } } else if (to > s && !path.includes(to)) { path.push(to); go(s, to, path); path.pop(); } }); }; for (let s = 0; s < n; s++) go(s, s, [s]); return res; };
  G.adjMatrix = g => { const n = g.names.length, M = Array.from({ length: n }, () => Array(n).fill(0)); g.edges.forEach(e => { M[e.u][e.v]++; if (!g.directed && e.u !== e.v) M[e.v][e.u]++; }); return M; };
  G.mmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
  /* Hamiltonian search with a step log for animation: events {t:'push'|'pop'|'found'|'fail', path} */
  G.hamilton = (g, cycle = true, maxEv = 4000, start = 0) => {
    const a = G.adj(g, true), n = g.names.length, ev = []; let found = null; const path = [start], on = Array(n).fill(false); on[start] = true;
    const go = () => { if (found || ev.length > maxEv) return; if (path.length === n) { const ok = !cycle || a[path[n - 1]].some(x => x.to === start); if (ok) { found = path.slice(); ev.push({ t: 'found', path: path.slice() }); } return; }
      for (const { to } of a[path[path.length - 1]]) { if (on[to]) continue; on[to] = true; path.push(to); ev.push({ t: 'push', path: path.slice() }); go(); if (found) return; path.pop(); on[to] = false; ev.push({ t: 'pop', path: path.slice() }); } };
    if (n) go(); return { found, ev, truncated: ev.length > maxEv };
  };
  G.degseq = g => G.degrees(g).deg.slice().sort((x, y) => y - x);
  G.iso = (g1, g2) => {
    const n = g1.names.length; if (n !== g2.names.length || g1.edges.length !== g2.edges.length) return null;
    const A = G.adjMatrix(g1), B = G.adjMatrix(g2), d1 = G.degrees(g1).deg, d2 = G.degrees(g2).deg; if (d1.slice().sort().join() !== d2.slice().sort().join()) return null;
    const order = [...Array(n).keys()].sort((x, y) => d1[y] - d1[x]), map = Array(n).fill(-1), used = Array(n).fill(false);
    const go = k => { if (k === n) return true; const v = order[k]; for (let w = 0; w < n; w++) { if (used[w] || d1[v] !== d2[w] || A[v][v] !== B[w][w]) continue; let ok = true; for (let j = 0; j < k && ok; j++) { const u = order[j]; if (A[v][u] !== B[w][map[u]] || A[u][v] !== B[map[u]][w]) ok = false; } if (!ok) continue; map[v] = w; used[w] = true; if (go(k + 1)) return true; used[w] = false; map[v] = -1; } return false; };
    return go(0) ? map.slice() : null;
  };
  /* connectivity (undirected view): vertex cuts and edge cuts by exhaustive search (small graphs) */
  G.subgraphDel = (g, vs, es) => { const keepV = g.names.map((_, i) => !vs.includes(i)), idx = []; let k = 0; keepV.forEach((kv, i) => idx[i] = kv ? k++ : -1); return { names: g.names.filter((_, i) => keepV[i]), pos: g.pos.filter((_, i) => keepV[i]), edges: g.edges.filter((e, i) => !es.includes(i) && keepV[e.u] && keepV[e.v]).map(e => ({ ...e, u: idx[e.u], v: idx[e.v] })), directed: g.directed, weighted: g.weighted }; };
  G.minVertexCut = g => { const n = g.names.length; if (!G.connected(g)) return { k: 0, cut: [] }; const isK = G.degrees(g).deg.length && g.edges.length >= n * (n - 1) / 2 && (() => { const M = G.adjMatrix(g); return M.every((r, i) => r.every((x, j) => i === j || x > 0)); })(); if (isK) return { k: n - 1, cut: null, complete: true };
    for (let k = 1; k <= n - 2; k++) for (const c of DM.combs([...Array(n).keys()], k)) { if (!G.connected(G.subgraphDel(g, c, []))) return { k, cut: c }; } return { k: n - 1, cut: null }; };
  G.minEdgeCut = g => { const m = g.edges.length; if (!G.connected(g)) return { k: 0, cut: [] }; if (g.names.length < 2) return { k: 0, cut: [] };
    for (let k = 1; k <= Math.min(m, Math.min(...G.degrees(g).deg)); k++) { if (DM.nCr(m, k) > 40000n) return { k: null, cut: null, big: true }; for (const c of DM.combs([...Array(m).keys()], k)) if (!G.connected(G.subgraphDel(g, [], c))) return { k, cut: c }; } return { k: Math.min(...G.degrees(g).deg), cut: null }; };
  /* number of spanning trees: Kirchhoff's matrix-tree theorem */
  G.countSpanning = g => { const n = g.names.length; if (n <= 1) return 1; const L = Array.from({ length: n }, () => Array(n).fill(0)); g.edges.forEach(e => { if (e.u === e.v) return; L[e.u][e.u]++; L[e.v][e.v]++; L[e.u][e.v]--; L[e.v][e.u]--; }); const M = L.slice(1).map(r => r.slice(1)), m = n - 1; let det = 1;
    for (let i = 0; i < m; i++) { let p = i; for (let r = i + 1; r < m; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; if (Math.abs(M[p][i]) < 1e-9) return 0; if (p !== i) { [M[p], M[i]] = [M[i], M[p]]; det = -det; } det *= M[i][i]; for (let r = i + 1; r < m; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c < m; c++) M[r][c] -= f * M[i][c]; } } return Math.round(det); };

  /* ---------- interactive editor ---------- */
  G.Editor = function (host, o = {}) {
    const ed = { g: G.clone(o.g || G.presets[o.preset || 'Petersen graph']()), mode: 'move', sel: null, deco: null, subs: [], multi: !!o.multi, drag: null, o };
    const presetNames = o.presets || Object.keys(G.presets);
    host.innerHTML = `<div class="ged"><div class="seg gm"></div> <select class="gp"><option value="">Load a preset graph…</option>${presetNames.map(n => `<option>${esc(n)}</option>`).join('')}</select> <button type="button" class="o gc">Clear</button>
      ${o.directedToggle ? '<label style="display:inline-flex;gap:5px;align-items:center;margin:0 0 0 8px"><input type="checkbox" class="gd" style="width:auto"> directed</label>' : ''}${o.multiToggle ? '<label style="display:inline-flex;gap:5px;align-items:center;margin:0 0 0 8px"><input type="checkbox" class="gmu" style="width:auto"> allow loops &amp; parallel edges</label>' : ''}
      <div class="simnote gh2"></div><div class="gv"></div><div class="row" style="margin-top:6px"><div style="flex:4"><label>Edge list (edit and press Apply):  A-B, B-C${o.weighted ? ':4' : ''}${o.directedToggle ? ', C>D' : ''}, E</label><input class="et"></div><div style="flex:0 0 auto;align-self:flex-end"><button type="button" class="o ea">Apply</button></div></div></div>`;
    const $ = s => host.querySelector(s), view = $('.gv');
    const modes = [['move', 'Move'], ['vertex', 'Add vertex'], ['edge', 'Add edge'], ['del', 'Delete']]; if (o.weighted) modes.push(['w', 'Set weight']);
    const hints = { move: 'Drag vertices to rearrange them.', vertex: 'Click on empty space to add a vertex.', edge: 'Click a vertex, then another vertex, to join them.', del: 'Click a vertex or an edge to delete it.', w: 'Click an edge to change its weight.' };
    ed.modeSeg = DM.seg($('.gm'), modes, 'move', m => { ed.mode = m; ed.sel = null; $('.gh2').textContent = hints[m]; render(); });
    $('.gh2').textContent = hints.move;
    const render = () => { const g = ed.g, deco = ed.deco ? ed.deco(g) : {}; if (ed.sel != null) { deco.n = deco.n || {}; deco.n[ed.sel] = { ...(deco.n[ed.sel] || {}), ring: col.br }; }
      view.innerHTML = G.draw(g, deco, { cls: 'vz wide gcanvas' }); $('.et').value = G.toText(g); if ($('.gd')) $('.gd').checked = g.directed; };
    const changed = () => { render(); ed.subs.forEach(f => f(ed.g)); };
    ed.set = g => { ed.g = G.clone(g); ed.sel = null; changed(); }; ed.changed = changed; ed.subscribe = f => { ed.subs.push(f); f(ed.g); }; ed.render = render;
    const pt = ev => { const s = view.querySelector('svg'), r = s.getBoundingClientRect(); return { x: (ev.clientX - r.left) * 640 / r.width, y: (ev.clientY - r.top) * 400 / r.height }; };
    const nodeAt = p => ed.g.pos.findIndex(q => Math.hypot(q.x - p.x, q.y - p.y) <= 22);
    const edgeAt = p => { let best = -1, bd = 9; ed.g.edges.forEach((e, i) => { const a = ed.g.pos[e.u], b = ed.g.pos[e.v]; let d; if (e.u === e.v) d = Math.abs(Math.hypot(p.x - a.x, p.y - (a.y - 40)) - 24); else { const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))); d = Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)); } if (d < bd) { bd = d; best = i; } }); return best; };
    const addEdge = (u, v) => { const g = ed.g; if (!ed.multi && (u === v || g.edges.some(e => (e.u === u && e.v === v) || (!g.directed && e.u === v && e.v === u)))) { DM.toast(u === v ? 'Loops are off (tick “allow loops & parallel edges”).' : 'That edge already exists (parallel edges are off).'); return; }
      let w = 1; if (g.weighted) { const r = prompt('Weight of this edge?', String(1 + Math.floor(Math.random() * 9))); if (r === null || isNaN(+r)) return; w = +r; } g.edges.push({ u, v, w }); };
    view.onpointerdown = ev => { const p = pt(ev), n = nodeAt(p), g = ed.g;
      if (ed.mode === 'move' && n >= 0) { ed.drag = n; ev.preventDefault(); const mv = e => { const q = pt(e); g.pos[n] = { x: Math.max(20, Math.min(620, q.x)), y: Math.max(20, Math.min(380, q.y)) }; changed(); }, up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); }; addEventListener('pointermove', mv); addEventListener('pointerup', up); }
      else if (ed.mode === 'vertex' && n < 0) { if (g.names.length >= 26) return DM.toast('At most 26 vertices.'); g.names.push(G.label(g.names.length)); g.pos.push({ x: Math.round(p.x), y: Math.round(p.y) }); changed(); }
      else if (ed.mode === 'edge' && n >= 0) { if (ed.sel === null) { ed.sel = n; render(); } else { addEdge(ed.sel, n); ed.sel = null; changed(); } }
      else if (ed.mode === 'del') { if (n >= 0) { const ng = G.subgraphDel(g, [n], []); ng.names = ng.names.map((_, i) => G.label(i)); ed.g = ng; changed(); } else { const e = edgeAt(p); if (e >= 0) { g.edges.splice(e, 1); changed(); } } }
      else if (ed.mode === 'w' && n < 0) { const e = edgeAt(p); if (e >= 0) { const r = prompt('New weight?', g.edges[e].w); if (r !== null && !isNaN(+r)) { g.edges[e].w = +r; changed(); } } } };
    $('.gp').onchange = e => { const n = e.target.value; if (n) ed.set(G.presets[n]()); e.target.value = ''; };
    $('.gc').onclick = () => { ed.set({ names: [], pos: [], edges: [], directed: ed.g.directed, weighted: ed.g.weighted }); };
    $('.ea').onclick = () => { try { const ng = G.parse($('.et').value, ed.g); if (!o.weighted) ng.weighted = false; else ng.weighted = true; ng.directed = o.directedToggle ? (ng.directed || ed.g.directed) : false; ed.multi = true; ed.g = ng; changed(); } catch (e) { DM.toast(e.message); } };
    $('.et').onkeydown = e => { if (e.key === 'Enter') $('.ea').click(); };
    if ($('.gd')) $('.gd').onchange = e => { ed.g.directed = e.target.checked; changed(); };
    if ($('.gmu')) $('.gmu').onchange = e => { ed.multi = e.target.checked; };
    if (o.weighted) ed.g.weighted = true;
    changed(); return ed;
  };
})();
