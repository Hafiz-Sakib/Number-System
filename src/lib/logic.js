/* ডিজিটাল লজিকের ইঞ্জিন: গেট ফাংশন, নেটলিস্ট (সার্কিট) হিসাব ও অটো-লেআউট,
   বুলিয়ান রাশির পার্সার, সত্যক সারণী এবং Quine-McCluskey সরলীকরণ। UI-এর কোনো নির্ভরতা নেই। */

/* ---------- গেট ---------- */
const xor = (v) => v.reduce((a, b) => a ^ b, 0);
export const GATE_FN = {
  AND: (v) => +v.every(Boolean),
  OR: (v) => +v.some(Boolean),
  NOT: (v) => +!v[0],
  NAND: (v) => +!v.every(Boolean),
  NOR: (v) => +!v.some(Boolean),
  XOR: (v) => xor(v),
  XNOR: (v) => +!xor(v),
};
export const GATE_NAME = { AND: "AND", OR: "OR", NOT: "NOT", NAND: "NAND", NOR: "NOR", XOR: "XOR", XNOR: "XNOR" };

/* ---------- নেটলিস্ট ---------- */
export const GW = 64; // গেটের প্রস্থ
export const gateH = (n) => (n <= 2 ? 44 : 22 * n);
export const pinY = (g, i) => g.y + (g.h * (2 * i + 1)) / (2 * g.in.length);

/** net: { inputs:[{id}], consts:[{id:"#1",value}], gates:[{id,type,in:[id]}] ... } ; state: { A:0, B:1 } → সব নোডের মান */
export function evalNet(net, state) {
  const vals = { ...state };
  (net.consts || []).forEach((c) => { vals[c.id] = c.value; });
  const gm = new Map(net.gates.map((g) => [g.id, g]));
  const val = (id) => {
    if (id in vals) return vals[id];
    const g = gm.get(id);
    if (!g) return 0;
    return (vals[id] = GATE_FN[g.type](g.in.map(val)));
  };
  net.gates.forEach((g) => val(g.id));
  net.outputs.forEach((o) => val(o.from));
  return vals;
}

/** সব ইনপুট সংমিশ্রণের জন্য সত্যক সারণী (ইনপুট MSB-আগে গোনা) */
export function truthRows(net) {
  const ids = net.inputs.map((i) => i.id);
  const n = ids.length;
  const rows = [];
  for (let k = 0; k < 1 << n; k++) {
    const bits = ids.map((_, i) => (k >> (n - 1 - i)) & 1);
    const st = Object.fromEntries(ids.map((id, i) => [id, bits[i]]));
    const v = evalNet(net, st);
    rows.push({ in: bits, out: net.outputs.map((o) => v[o.from]) });
  }
  return { ins: net.inputs.map((i) => i.label ?? i.id), outs: net.outputs.map((o) => o.label ?? o.id), rows };
}

/* ---------- অটো-লেআউট ----------
   spec: { inputs:[{id,label}], consts?:[{id,value}], gates:[{id,type,in:[id],label?,x?,y?}], outputs:[{id,from,label}] }
   ফল: প্রতিটি নোডের x,y সহ নেটলিস্ট, w ও h। গেট গভীরতা অনুযায়ী কলামে বসে। */
export function autoLayout(spec, o = {}) {
  const { inGap = 56, colGap = 168, x0 = 180, inX = 100, gateGap = 18, top = 28 } = o;
  const gates = spec.gates.map((g) => ({ ...g, h: gateH(g.in.length) }));
  const gm = new Map(gates.map((g) => [g.id, g]));
  const depth = {};
  const dep = (id) => (id in depth ? depth[id] : (depth[id] = gm.has(id) ? 1 + Math.max(0, ...gm.get(id).in.map(dep)) : 0));
  gates.forEach((g) => dep(g.id));
  const maxD = Math.max(0, ...gates.map((g) => depth[g.id]));

  const pos = {};
  const inputs = spec.inputs.map((p, i) => { const q = { ...p, x: inX, y: top + i * inGap }; pos[p.id] = { x: q.x, y: q.y }; return q; });
  const consts = (spec.consts || []).map((c, i) => { const q = { ...c, x: inX, y: top + (inputs.length + i) * inGap }; pos[c.id] = { x: q.x, y: q.y }; return q; });

  for (let d = 1; d <= maxD; d++) {
    const lvl = gates.filter((g) => depth[g.id] === d).map((g) => ({ g, cy: g.y != null ? g.y + g.h / 2 : g.in.reduce((s, id) => s + pos[id].y, 0) / g.in.length }));
    lvl.sort((a, b) => a.cy - b.cy);
    let bottom = -Infinity;
    for (const it of lvl) {
      let cy = it.cy;
      if (it.g.y == null) cy = Math.max(cy, bottom + gateGap + it.g.h / 2);
      it.g.y = cy - it.g.h / 2;
      if (it.g.x == null) it.g.x = x0 + (d - 1) * colGap;
      bottom = it.g.y + it.g.h;
      pos[it.g.id] = { x: it.g.x + GW, y: cy };
    }
  }

  const minY = Math.min(top, ...gates.map((g) => g.y));
  const shift = minY < top ? top - minY : 0;
  if (shift) { inputs.forEach((p) => (p.y += shift)); consts.forEach((p) => (p.y += shift)); gates.forEach((g) => (g.y += shift)); Object.values(pos).forEach((p) => (p.y += shift)); }

  const right = Math.max(inX + 70, ...gates.map((g) => g.x + GW));
  const outX = right + 46;
  const outs = spec.outputs.map((p) => ({ ...p, x: outX, y: pos[p.from].y })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < outs.length; i++) if (outs[i].y < outs[i - 1].y + 40) outs[i].y = outs[i - 1].y + 40;
  const maxY = Math.max(...inputs.map((p) => p.y), ...consts.map((p) => p.y), ...gates.map((g) => g.y + g.h), ...outs.map((p) => p.y));
  return { inputs, consts, gates, outputs: outs, w: outX + 92, h: maxY + 36 };
}

/* ---------- রাশির পার্সার ---------- */
const AND_CH = "*.·&∧", OR_CH = "+|∨", XOR_CH = "^⊕", POST = "'′", PRE = "!~¬";

function tokenize(src) {
  const t = [];
  for (const ch of src) {
    if (/\s/.test(ch)) continue;
    if (/[A-Za-z]/.test(ch)) t.push({ k: "var", v: ch.toUpperCase() });
    else if (ch === "0" || ch === "1") t.push({ k: "const", v: +ch });
    else if (AND_CH.includes(ch)) t.push({ k: "and" });
    else if (OR_CH.includes(ch)) t.push({ k: "or" });
    else if (XOR_CH.includes(ch)) t.push({ k: "xor" });
    else if (POST.includes(ch)) t.push({ k: "post" });
    else if (PRE.includes(ch)) t.push({ k: "pre" });
    else if (ch === "(") t.push({ k: "(" });
    else if (ch === ")") t.push({ k: ")" });
    else throw new Error(`"${ch}" চিহ্নটি বুঝতে পারিনি।`);
  }
  return t;
}

const nary = (t, args) => ({ t, args: args.flatMap((a) => (a.t === t ? a.args : [a])) });

export function parseExpr(src, maxVars = 5) {
  try {
    const tk = tokenize(String(src));
    if (!tk.length) return { ok: false, empty: true, error: "একটি রাশি লেখো।" };
    let i = 0;
    const peek = () => tk[i];
    const starts = (x) => x && (x.k === "var" || x.k === "const" || x.k === "(" || x.k === "pre");
    const primary = () => {
      const x = tk[i++];
      if (!x) throw new Error("রাশিটি অসম্পূর্ণ।");
      if (x.k === "var") return { t: "var", n: x.v };
      if (x.k === "const") return { t: "const", v: x.v };
      if (x.k === "(") { const e = orE(); if (peek()?.k !== ")") throw new Error("বন্ধনী ( ) মেলেনি।"); i++; return e; }
      throw new Error("এখানে একটি চলক (A, B …), 0/1 বা ( আশা করেছিলাম।");
    };
    const unary = () => {
      if (peek()?.k === "pre") { i++; return { t: "not", a: unary() }; }
      let e = primary();
      while (peek()?.k === "post") { i++; e = { t: "not", a: e }; }
      return e;
    };
    const andE = () => {
      const a = [unary()];
      for (;;) {
        if (peek()?.k === "and") { i++; a.push(unary()); }
        else if (starts(peek())) a.push(unary());
        else break;
      }
      return a.length === 1 ? a[0] : nary("and", a);
    };
    const xorE = () => { const a = [andE()]; while (peek()?.k === "xor") { i++; a.push(andE()); } return a.length === 1 ? a[0] : nary("xor", a); };
    const orE = () => { const a = [xorE()]; while (peek()?.k === "or") { i++; a.push(xorE()); } return a.length === 1 ? a[0] : nary("or", a); };
    const ast = orE();
    if (i < tk.length) throw new Error(tk[i].k === ")" ? "বাড়তি ) বন্ধনী আছে।" : "দুটি চলকের মাঝে অপারেটর (+ বা ·) লাগবে।");
    const vars = [...new Set(collectVars(ast))].sort();
    if (vars.length > maxVars) return { ok: false, error: `সর্বোচ্চ ${maxVars}টি চলক (${"ABCDE".slice(0, maxVars).split("").join(", ")}) ব্যবহার করো; তোমার রাশিতে ${vars.length}টি আছে।` };
    return { ok: true, ast, vars };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function collectVars(n) {
  if (n.t === "var") return [n.n];
  if (n.t === "const") return [];
  if (n.t === "not") return collectVars(n.a);
  return n.args.flatMap(collectVars);
}

export function evalAst(n, env) {
  switch (n.t) {
    case "var": return env[n.n] ? 1 : 0;
    case "const": return n.v;
    case "not": return +!evalAst(n.a, env);
    case "and": return +n.args.every((a) => evalAst(a, env));
    case "or": return +n.args.some((a) => evalAst(a, env));
    default: return n.args.reduce((s, a) => s ^ evalAst(a, env), 0);
  }
}

const PREC = { or: 1, xor: 2, and: 3, not: 4, var: 5, const: 5 };
export function toStr(n) {
  const wrap = (x, min) => (PREC[x.t] < min ? `(${toStr(x)})` : toStr(x));
  switch (n.t) {
    case "var": return n.n;
    case "const": return String(n.v);
    case "not": return `${wrap(n.a, 4)}'`;
    case "and": return n.args.map((x) => wrap(x, 3)).join("·");
    case "xor": return n.args.map((x) => wrap(x, 2)).join(" ⊕ ");
    default: return n.args.map((x) => wrap(x, 1)).join(" + ");
  }
}

/** একই চলক-তালিকায় সব সংমিশ্রণের আউটপুট (বিট-অ্যারে, MSB-আগে) */
export function tableOf(ast, vars) {
  const n = vars.length, out = [];
  for (let k = 0; k < 1 << n; k++) {
    const env = Object.fromEntries(vars.map((v, i) => [v, (k >> (n - 1 - i)) & 1]));
    out.push(evalAst(ast, env));
  }
  return out;
}

export function equivalent(a, b) {
  const vars = [...new Set([...collectVars(a), ...collectVars(b)])].sort();
  const ta = tableOf(a, vars), tb = tableOf(b, vars);
  return ta.every((x, i) => x === tb[i]);
}

/* ---------- AST → সার্কিট স্পেক ---------- */
export function astToSpec(ast, label = "F") {
  const gates = [], seen = new Map(), used = new Set(), consts = new Set();
  let c = 0;
  const mk = (type, ins) => {
    const key = type + ":" + ins.join(",");
    if (seen.has(key)) return seen.get(key);
    const id = "g" + ++c;
    gates.push({ id, type, in: ins });
    seen.set(key, id);
    return id;
  };
  const build = (n) => {
    if (n.t === "var") { used.add(n.n); return n.n; }
    if (n.t === "const") { consts.add(n.v); return "#" + n.v; }
    if (n.t === "not") return mk("NOT", [build(n.a)]);
    const type = n.t.toUpperCase();
    let ids = [...new Set(n.args.map(build))];
    if (type === "XOR") { ids = n.args.map(build); let acc = ids[0]; for (let k = 1; k < ids.length; k++) acc = mk("XOR", [acc, ids[k]]); return acc; }
    while (ids.length > 4) ids = [mk(type, ids.slice(0, 4)), ...ids.slice(4)];
    return ids.length === 1 ? ids[0] : mk(type, ids);
  };
  const out = build(ast);
  return {
    inputs: [...used].sort().map((v) => ({ id: v, label: v })),
    consts: [...consts].map((v) => ({ id: "#" + v, value: v })),
    gates,
    outputs: [{ id: label, from: out, label }],
  };
}

/* ---------- Quine-McCluskey ---------- */
export function minimize(minterms, n) {
  if (!minterms.length) return [];
  const total = 1 << n;
  if (minterms.length === total) return ["-".repeat(n)];
  let terms = new Set(minterms.map((m) => m.toString(2).padStart(n, "0")));
  const primes = [];
  while (terms.size) {
    const arr = [...terms], used = new Set(), next = new Set();
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      let d = -1, ok = true;
      for (let k = 0; k < n; k++) {
        if (arr[i][k] === arr[j][k]) continue;
        if (arr[i][k] === "-" || arr[j][k] === "-" || d >= 0) { ok = false; break; }
        d = k;
      }
      if (ok && d >= 0) { next.add(arr[i].slice(0, d) + "-" + arr[i].slice(d + 1)); used.add(arr[i]); used.add(arr[j]); }
    }
    arr.forEach((t) => !used.has(t) && primes.push(t));
    terms = next;
  }
  const ms = minterms.map((m) => m.toString(2).padStart(n, "0"));
  const covers = (p, m) => [...p].every((ch, i) => ch === "-" || ch === m[i]);
  const chosen = new Set();
  const left = new Set(ms);
  for (const m of ms) {
    const ps = primes.filter((p) => covers(p, m));
    if (ps.length === 1) chosen.add(ps[0]);
  }
  chosen.forEach((p) => ms.forEach((m) => covers(p, m) && left.delete(m)));
  while (left.size) {
    let best = null, bs = -1;
    for (const p of primes) {
      if (chosen.has(p)) continue;
      const cnt = [...left].filter((m) => covers(p, m)).length;
      const lits = [...p].filter((ch) => ch !== "-").length;
      const score = cnt * 10 - lits;
      if (score > bs) { bs = score; best = p; }
    }
    chosen.add(best);
    ms.forEach((m) => covers(best, m) && left.delete(m));
  }
  const rank = (p) => [...p].map((ch) => (ch === "1" ? 0 : ch === "0" ? 1 : 2)).join("");
  return [...chosen].sort((a, b) => (rank(a) < rank(b) ? -1 : 1));
}

export function sopString(imps, vars) {
  if (!imps.length) return "0";
  return imps.map((p) => {
    const lits = [...p].map((ch, i) => (ch === "1" ? vars[i] : ch === "0" ? vars[i] + "'" : "")).filter(Boolean);
    return lits.length ? lits.join("·") : "1";
  }).join(" + ");
}

/** রাশি → { minterms, sop (সরল রাশি), ast2 (সরল রাশির AST) } */
export function simplify(ast, vars) {
  const t = tableOf(ast, vars);
  const minterms = t.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
  const imps = minimize(minterms, vars.length);
  const sop = sopString(imps, vars);
  const p = parseExpr(sop);
  return { minterms, sop, ast2: p.ok ? p.ast : null };
}

/* ---------- ধাপে ধাপে সরলীকরণ (বীজগণিতের নিয়ম প্রয়োগ করে) ----------
   প্রতিটি ধাপে ঠিক একটি নিয়ম প্রয়োগ হয়। ফল: [{ ast, law, eq }], সবশেষে সত্যক সারণী দিয়ে মিলিয়ে নেওয়া হয়।
   P, Q, R এখানে যেকোনো রাশি (A, B, C … থেকে আলাদা রাখতে)। */
const LAW = {
  invol: ["দ্বিপরিপূরক (Involution)", "(P')' = P"],
  dm_and: ["ডি-মরগান (De Morgan)", "(P·Q)' = P' + Q'"],
  dm_or: ["ডি-মরগান (De Morgan)", "(P + Q)' = P'·Q'"],
  xor: ["XOR এর সংজ্ঞা", "P ⊕ Q = P'·Q + P·Q'"],
  not_c: ["ধ্রুবকের পরিপূরক", "0' = 1 , 1' = 0"],
  id_or: ["অভেদ (Identity)", "P + 0 = P"],
  id_and: ["অভেদ (Identity)", "P·1 = P"],
  nul_or: ["নাল (Null)", "P + 1 = 1"],
  nul_and: ["নাল (Null)", "P·0 = 0"],
  idem_or: ["সমশক্তি (Idempotent)", "P + P = P"],
  idem_and: ["সমশক্তি (Idempotent)", "P·P = P"],
  comp_or: ["পরিপূরক (Complement)", "P + P' = 1"],
  comp_and: ["পরিপূরক (Complement)", "P·P' = 0"],
  abs_or: ["শোষণ (Absorption)", "P + P·Q = P"],
  abs_and: ["শোষণ (Absorption)", "P·(P + Q) = P"],
  red_or: ["অপ্রয়োজনীয়তা (Redundancy)", "P + P'·Q = P + Q"],
  red_and: ["অপ্রয়োজনীয়তা (Redundancy)", "P·(P' + Q) = P·Q"],
  con_or: ["কনসেনসাস (Consensus)", "P·Q + P'·R + Q·R = P·Q + P'·R"],
  con_and: ["কনসেনসাস (Consensus)", "(P + Q)·(P' + R)·(Q + R) = (P + Q)·(P' + R)"],
  cmb_or: ["বণ্টন (Distributive): সাধারণ উৎপাদক", "P·Q + P·Q' = P·(Q + Q')"],
  cmb_and: ["বণ্টন (Distributive): সাধারণ উৎপাদক", "(P + Q)·(P + Q') = P + Q·Q'"],
  dist: ["বণ্টন (Distributive)", "P·(Q + R) = P·Q + P·R"],
  qm: ["Quine–McCluskey (কার্নো ম্যাপের মতো)", "সব মিনটার্ম মিলিয়ে সবচেয়ে ছোট SOP"],
};
const K = toStr;
const V = (n) => ({ t: "var", n });
const NOT = (a) => ({ t: "not", a });
const CONST = (v) => ({ t: "const", v });
const comp = (x) => (x.t === "not" ? x.a : NOT(x));
const lits = (n) => (n.t === "var" ? 1 : n.t === "const" ? 0 : n.t === "not" ? lits(n.a) : n.args.reduce((s, a) => s + lits(a), 0));
const same = (a, b) => K(a) === K(b);
const flat = (n) => {
  if (n.t === "and" || n.t === "or" || n.t === "xor") {
    const args = n.args.map(flat).flatMap((a) => (a.t === n.t && n.t !== "xor" ? a.args : [a]));
    return { t: n.t, args };
  }
  if (n.t === "not") return NOT(flat(n.a));
  return n;
};
const mkN = (t, args) => (args.length === 0 ? CONST(t === "or" ? 0 : 1) : args.length === 1 ? args[0] : { t, args });
const inOf = (t) => (t === "or" ? "and" : "or");
const facs = (a, inT) => (a.t === inT ? a.args : [a]);
const hasK = (list, x) => list.some((y) => same(y, x));
const subset = (s, big) => s.every((x) => hasK(big, x));

function naryRule(node) {
  const t = node.t, inT = inOf(t), A = node.args, ident = t === "or" ? 0 : 1, absorb = 1 - ident;
  const R = (args, law) => ({ node: mkN(t, args), law: LAW[`${law}_${t}`] });
  // ১) ধ্রুবক
  const cAbs = A.find((a) => a.t === "const" && a.v === absorb);
  if (cAbs) return { node: CONST(absorb), law: LAW[`nul_${t}`] };
  if (A.some((a) => a.t === "const" && a.v === ident) && A.length > 1) return R(A.filter((a) => !(a.t === "const" && a.v === ident)), "id");
  // ২) সমশক্তি
  const uniq = []; A.forEach((a) => !hasK(uniq, a) && uniq.push(a));
  if (uniq.length < A.length) return R(uniq, "idem");
  // ৩) পরিপূরক
  if (A.some((a) => hasK(A, comp(a)))) return { node: CONST(absorb), law: LAW[`comp_${t}`] };
  const F = A.map((a) => facs(a, inT));
  // ৪) শোষণ
  for (let i = 0; i < A.length; i++) for (let j = 0; j < A.length; j++) {
    if (i !== j && F[i].length < F[j].length && subset(F[i], F[j])) return R(A.filter((_, k) => k !== j), "abs");
  }
  // ৫) অপ্রয়োজনীয়তা: P + P'·Q = P + Q
  for (let i = 0; i < A.length; i++) if (F[i].length === 1) for (let j = 0; j < A.length; j++) {
    if (i === j || F[j].length < 2) continue;
    const c = comp(F[i][0]);
    if (hasK(F[j], c)) {
      const nj = mkN(inT, F[j].filter((y) => !same(y, c)));
      return R(A.map((a, k) => (k === j ? nj : a)), "red");
    }
  }
  // ৬) কনসেনসাস
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
    const opp = F[i].filter((x) => hasK(F[j], comp(x)));
    if (opp.length !== 1) continue;
    const x = opp[0];
    const cons = [...F[i].filter((y) => !same(y, x)), ...F[j].filter((y) => !same(y, comp(x)))];
    if (!cons.length || cons.some((c) => hasK(cons, comp(c)))) continue;
    const k = A.findIndex((_, q) => q !== i && q !== j && subset(cons, F[q]));
    if (k >= 0) return R(A.filter((_, q) => q !== k), "con");
  }
  // ৭) সাধারণ উৎপাদক: P·Q + P·Q' = P·(Q + Q')
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
    if (F[i].length !== F[j].length || F[i].length < 2) continue;
    const di = F[i].filter((x) => !hasK(F[j], x)), dj = F[j].filter((x) => !hasK(F[i], x));
    if (di.length !== 1 || dj.length !== 1 || !same(comp(di[0]), dj[0])) continue;
    const common = F[i].filter((x) => hasK(F[j], x));
    const merged = mkN(inT, [...common, mkN(t, [di[0], dj[0]])]);
    return R(A.filter((_, q) => q !== j).map((a, q) => (q === (j < i ? i - 1 : i) ? merged : a)), "cmb");
  }
  return null;
}

function stepOnce(n, dist) {
  if (n.t === "var" || n.t === "const") return null;
  if (n.t === "not") {
    const c = stepOnce(n.a, dist);
    if (c) return { ...c, node: NOT(c.node) };
    const a = n.a;
    if (a.t === "const") return { node: CONST(1 - a.v), law: LAW.not_c };
    if (a.t === "not") return { node: a.a, law: LAW.invol };
    if (a.t === "and") return { node: { t: "or", args: a.args.map(NOT) }, law: LAW.dm_and };
    if (a.t === "or") return { node: { t: "and", args: a.args.map(NOT) }, law: LAW.dm_or };
    return null;
  }
  for (let i = 0; i < n.args.length; i++) {
    const c = stepOnce(n.args[i], dist);
    if (c) return { ...c, node: { t: n.t, args: n.args.map((a, k) => (k === i ? c.node : a)) } };
  }
  if (n.t === "xor") {
    const [a, b, ...rest] = n.args;
    const x = { t: "or", args: [{ t: "and", args: [comp(a), b] }, { t: "and", args: [a, comp(b)] }] };
    return { node: mkN("xor", [x, ...rest]), law: LAW.xor };
  }
  const r = naryRule(n);
  if (r) return r;
  if (dist && n.t === "and") {
    const oi = n.args.findIndex((a) => a.t === "or");
    if (oi >= 0) {
      const rest = n.args.filter((_, k) => k !== oi);
      return { node: { t: "or", args: n.args[oi].args.map((x) => ({ t: "and", args: [...rest, x] })) }, law: LAW.dist };
    }
  }
  return null;
}

function runSteps(ast, dist) {
  let cur = flat(ast); const steps = [];
  for (let i = 0; i < 60; i++) {
    let r = stepOnce(cur, false);
    if (!r && dist) r = stepOnce(cur, true);
    if (!r) break;
    cur = flat(r.node);
    if (lits(cur) > 40) return null;
    steps.push({ ast: cur, law: r.law[0], eq: r.law[1] });
  }
  return { start: flat(ast), steps, last: cur };
}

/** রাশি → { start, steps:[{ast,law,eq}], final, already } ; steps খালি হলে রাশি আগে থেকেই সরল */
export function simplifySteps(ast, vars) {
  const base = flat(ast);
  const cands = [runSteps(ast, false), runSteps(ast, true)].filter((c) => c && equivalent(ast, c.last));
  cands.sort((a, b) => lits(a.last) - lits(b.last) || a.steps.length - b.steps.length);
  const best = cands[0] || { start: base, steps: [], last: base };
  const qm = simplify(ast, vars);
  const steps = best.steps.slice();
  let final = best.last;
  if (qm.ast2 && equivalent(ast, qm.ast2) && lits(qm.ast2) < lits(final)) {
    steps.push({ ast: qm.ast2, law: LAW.qm[0], eq: LAW.qm[1], qm: true });
    final = qm.ast2;
  }
  return { start: base, steps, final, already: steps.length === 0 };
}

/* ---------- Quine–McCluskey এর হিসাবের খাতা ----------
   minimize() শুধু ফল দেয়; এটি প্রতিটি ধাপ রেকর্ড করে, যাতে পর্দায় হিসাব দেখানো যায়:
   ১) মিনটার্ম 1-এর সংখ্যা ধরে গ্রুপ  ২) পাশের গ্রুপের জোড়া মিলিয়ে একটি চলক বাদ ("-")
   ৩) যা আর মেলে না সেগুলো প্রাইম ইমপ্লিক্যান্ট  ৪) কভারেজ ছক: কোনটি অপরিহার্য, কোনটি বাছাই */
export function qmTrace(minterms, n, vars) {
  const bin = (m) => m.toString(2).padStart(n, "0");
  const lit = (p) => sopString([p], vars);
  const covers = (p, m) => [...p].every((ch, i) => ch === "-" || ch === m[i]);
  const ms = minterms.map(bin);
  if (!minterms.length || minterms.length === 1 << n) return { trivial: minterms.length ? "1" : "0", n };
  const ones = (s) => [...s].filter((c) => c === "1").length;
  let cur = minterms.map((m) => ({ bits: bin(m), ms: [m], used: false }));
  const columns = [];
  const primes = [];
  while (cur.length) {
    const buckets = new Map();
    cur.forEach((t) => { const k = ones(t.bits); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(t); });
    const keys = [...buckets.keys()].sort((a, b) => a - b);
    const next = new Map();
    const pairs = [];
    for (const k of keys) {
      for (const a of buckets.get(k) || []) for (const b of buckets.get(k + 1) || []) {
        let d = -1, ok = true;
        for (let i = 0; i < n; i++) {
          if (a.bits[i] === b.bits[i]) continue;
          if (a.bits[i] === "-" || b.bits[i] === "-" || d >= 0) { ok = false; break; }
          d = i;
        }
        if (!ok || d < 0) continue;
        a.used = b.used = true;
        const bits = a.bits.slice(0, d) + "-" + a.bits.slice(d + 1);
        const set = [...new Set([...a.ms, ...b.ms])].sort((x, y) => x - y);
        if (!next.has(bits)) next.set(bits, { bits, ms: set, used: false });
        pairs.push({ a: a.ms.join(","), b: b.ms.join(","), bits });
      }
    }
    columns.push({ groups: keys.map((k) => ({ ones: k, terms: buckets.get(k).map((t) => ({ bits: t.bits, ms: t.ms, used: t.used })) })), pairs });
    cur.forEach((t) => { if (!t.used) primes.push({ bits: t.bits, ms: t.ms }); });
    cur = [...next.values()];
  }
  const uniq = new Map(primes.map((p) => [p.bits, p]));
  const P = [...uniq.values()].map((p) => ({ ...p, expr: lit(p.bits), cover: minterms.filter((m) => covers(p.bits, bin(m))) }));
  const essential = new Set();
  minterms.forEach((m) => { const c = P.filter((p) => p.cover.includes(m)); if (c.length === 1) essential.add(c[0].bits); });
  const chosen = new Set(minimize(minterms, n));
  P.forEach((p) => { p.essential = essential.has(p.bits); p.chosen = chosen.has(p.bits); });
  return { n, minterms, columns, primes: P, sop: sopString([...chosen], vars), trivial: null };
}
