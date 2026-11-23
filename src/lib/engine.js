/* ============================================================================
   সংখ্যা পদ্ধতি - গণনা ইঞ্জিন
   - সব হিসাব BigInt দিয়ে (ভগ্নাংশসহ নিখুঁত, floating-point ভুল নেই)
   - প্রতিটি উত্তরের সাথে বাংলা ধাপে-ধাপে ব্যাখ্যা ("ব্লক") ফেরত দেয়
   Inline markup in strings:  {{1010|2}} = (1010)₂   {{25}} = মোনো সংখ্যা   **bold**   2^[3]   x_[2]
   ========================================================================== */

export const BASES = [2, 8, 10, 16];
export const BASE_NAME = { 2: "বাইনারি", 8: "অক্টাল", 10: "ডেসিমাল", 16: "হেক্সাডেসিমাল" };
export const BASE_SHORT = { 2: "বাইনারি", 8: "অক্টাল", 10: "ডেসিমাল", 16: "হেক্স" };
const DIG = "0123456789ABCDEF";
const BN = "০১২৩৪৫৬৭৮৯";

export const toBnDigits = (s) => String(s).replace(/[0-9]/g, (d) => BN[+d]);
const fromBn = (s) => s.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

/* ---------- ছোট সাহায্যকারী ---------- */
const N = (s, b) => `{{${s}|${b}}}`;
const M = (s) => `{{${s}}}`;
const allowed = (base) => (base === 2 ? "0 ও 1" : base === 8 ? "0 থেকে 7" : base === 10 ? "0 থেকে 9" : "0–9 ও A–F");
const dv = (ch) => DIG.indexOf(ch);
const dl = (v) => DIG[v];
/* অঙ্ক দেখানোর সময় হেক্সে A(10) */
const dshow = (ch, base) => (base === 16 && dv(ch) >= 10 ? `${ch}(${dv(ch)})` : ch);
const sup = (p) => `^[${p}]`;
const trimInt = (s) => s.replace(/^0+(?=.)/, "") || "0";
const trimFrac = (s) => s.replace(/0+$/, "");
const join = (neg, i, f) => `${neg ? "-" : ""}${i}${f ? "." + f : ""}`;

export function big(str, base) {
  const B = BigInt(base);
  let v = 0n;
  for (const ch of str) v = v * B + BigInt(dv(ch));
  return v;
}
const bigStr = (v, base) => v.toString(base).toUpperCase();
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
export const rat = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
const rAdd = (x, y) => rat(x.n * y.d + y.n * x.d, x.d * y.d);
const rSub = (x, y) => rat(x.n * y.d - y.n * x.d, x.d * y.d);
const rMul = (x, y) => rat(x.n * y.n, x.d * y.d);
const rDiv = (x, y) => rat(x.n * y.d, x.d * y.n);
const rCmpAbs = (x, y) => { const a = (x.n < 0n ? -x.n : x.n) * y.d, b = (y.n < 0n ? -y.n : y.n) * x.d; return a < b ? -1 : a > b ? 1 : 0; };

/* ---------- ইনপুট যাচাই ---------- */
export function normalize(raw) {
  return fromBn(String(raw ?? "")).replace(/\s+/g, "").replace(/[−–—]/g, "-").toUpperCase();
}

export function parseNum(raw, base, maxDigits = 64) {
  const s = normalize(raw);
  if (!s) return { ok: false, empty: true, msg: "একটি সংখ্যা লেখো।" };
  if (/[^0-9A-F.+-]/.test(s)) {
    const bad = s.match(/[^0-9A-F.+-]/)[0];
    return { ok: false, msg: `'${bad}' বৈধ অঙ্ক নয়। ${BASE_NAME[base]} সংখ্যায় শুধু ${allowed(base)} ব্যবহার করো।` };
  }
  if ((s.match(/\./g) || []).length > 1) return { ok: false, msg: "একটির বেশি দশমিক বিন্দু (.) থাকতে পারে না।" };
  const m = /^([+-]?)([0-9A-F]*)(?:\.([0-9A-F]*))?$/.exec(s);
  if (!m) return { ok: false, msg: "চিহ্ন (+/−) শুধু সংখ্যার শুরুতে বসবে।" };
  const [, sign, ip = "", fp = ""] = m;
  if (!ip && !fp) return { ok: false, msg: "অন্তত একটি অঙ্ক লেখো।" };
  for (const ch of ip + fp) {
    if (dv(ch) >= base) return { ok: false, msg: `'${ch}' অঙ্কটি ${BASE_NAME[base]} (ভিত্তি ${base}) সংখ্যায় থাকতে পারে না। এখানে শুধু ${allowed(base)} ব্যবহার করো।` };
  }
  if (ip.length + fp.length > maxDigits) return { ok: false, msg: `সংখ্যাটি খুব বড়। সর্বোচ্চ ${maxDigits}টি অঙ্ক ব্যবহার করো।` };
  const int = trimInt(ip || "0");
  const frac = trimFrac(fp);
  const iv = big(int, base);
  const fv = frac ? big(frac, base) : 0n;
  const den = BigInt(base) ** BigInt(frac.length);
  let r = rat(iv * den + fv, den);
  const zero = r.n === 0n;
  const neg = sign === "-" && !zero;
  if (neg) r = rat(-r.n, r.d);
  return { ok: true, base, neg, int, frac, rat: r };
}

/* সংখ্যা -> নির্দিষ্ট ভিত্তিতে (ছাঁটাই করে, গোল করে না) */
export function ratToBase(r, base, precision = 8) {
  const neg = r.n < 0n;
  const n = neg ? -r.n : r.n;
  const B = BigInt(base);
  const ip = n / r.d;
  let rem = n % r.d;
  let frac = "";
  let exact = true;
  while (rem !== 0n) {
    if (frac.length >= precision) { exact = false; break; }
    rem *= B;
    frac += DIG[Number(rem / r.d)];
    rem %= r.d;
  }
  const f = exact ? frac : frac;
  const isZero = ip === 0n && f === "" && exact;
  return { neg: neg && !isZero, int: bigStr(ip, base), frac: exact ? trimFrac(f) : f, exact };
}
export const showVal = (v) => join(v.neg, v.int, v.frac);

/* ===========================================================================
   রূপান্তর
   =========================================================================== */

/* ডেসিমাল -> 2/8/16 */
function decToBase(p, to, precision) {
  const blocks = [];
  const B = BigInt(to);
  const iv = BigInt(p.int);
  let intStr;
  blocks.push({ t: "h", text: `ধাপ 1: পূর্ণ অংশ ${M(p.int)} কে ${M(to)} দিয়ে বারবার ভাগ করি` });
  if (iv === 0n) {
    intStr = "0";
    blocks.push({ t: "p", text: "পূর্ণ অংশ 0, তাই এই অংশের ফল 0।" });
  } else {
    const rows = [];
    let q = iv;
    let digits = "";
    while (q > 0n) {
      const r = Number(q % B);
      const nq = q / B;
      digits = dl(r) + digits;
      rows.push([`${q} ÷ ${to}`, `${nq}`, { x: to === 16 && r >= 10 ? `${r} = ${dl(r)}` : `${r}`, hl: true }]);
      q = nq;
    }
    intStr = digits;
    blocks.push({ t: "table", head: ["ভাগ", "ভাগফল", "ভাগশেষ ↑"], rows, note: "ভাগফল 0 না হওয়া পর্যন্ত ভাগ চলবে।" });
    if (to === 16) blocks.push({ t: "p", text: "হেক্সাডেসিমালে 10 = A, 11 = B, 12 = C, 13 = D, 14 = E, 15 = F।" });
    blocks.push({ t: "p", text: `ভাগশেষগুলো **নিচ থেকে উপরের দিকে** সাজিয়ে পাই: ${N(intStr, to)}` });
  }
  let fracStr = "";
  let exact = true;
  if (p.frac) {
    const k = p.frac.length;
    const fd = 10n ** BigInt(k);
    let fn = BigInt(p.frac);
    const rows = [];
    blocks.push({ t: "h", text: `ধাপ 2: ভগ্নাংশ অংশ ${M("0." + p.frac)} কে ${M(to)} দিয়ে বারবার গুণ করি` });
    const show = (v) => { const s = v.toString().padStart(k, "0"); const t = trimFrac(s); return t ? "0." + t : "0"; };
    while (fn !== 0n) {
      if (fracStr.length >= precision) { exact = false; break; }
      const prod = fn * B;
      const ip = prod / fd;
      const nf = prod % fd;
      const ipn = Number(ip);
      fracStr += dl(ipn);
      const pr = `${ip}${nf === 0n ? "" : "." + trimFrac(nf.toString().padStart(k, "0"))}`;
      rows.push([`${show(fn)} × ${to}`, pr, { x: to === 16 && ipn >= 10 ? `${ipn} = ${dl(ipn)}` : `${ipn}`, hl: true }]);
      fn = nf;
    }
    blocks.push({ t: "table", head: ["গুণ", "গুণফল", "পূর্ণ অংশ ↓"], rows, note: exact ? "ভগ্নাংশ অংশ 0 হয়ে গেলে গুণ থামে।" : `ভগ্নাংশ অংশ কখনো 0 হচ্ছে না, তাই ${precision} ঘর পর্যন্ত নিয়ে থামলাম।` });
    blocks.push({ t: "p", text: `পূর্ণ অংশগুলো **উপর থেকে নিচের দিকে** সাজিয়ে পাই: ${N("0." + fracStr, to)}` });
    if (!exact) blocks.push({ t: "warn", text: `ভগ্নাংশ শেষ হয় না (অসীম ধারা)। তাই ফলটি **আসন্ন মান (≈)**, ${precision} ঘর পর্যন্ত।` });
  }
  return { blocks, int: intStr, frac: fracStr, exact };
}

/* 2/8/16 -> ডেসিমাল: পূর্ণ অংশ ও ভগ্নাংশ অংশের আলাদা টেবিল */
function baseToDec(p, from) {
  const blocks = [];
  const B = BigInt(from);
  const head = ["অঙ্ক", "অবস্থান", "স্থানীয় মান", "গুণফল"];
  const part = (str, isInt) => {
    let sub = rat(0n);
    const terms = [], prods = [];
    const rows = [...str].map((ch, i) => {
      const pos = isInt ? str.length - 1 - i : -(i + 1);
      const v = dv(ch);
      const place = pos >= 0 ? rat(B ** BigInt(pos)) : rat(1n, B ** BigInt(-pos));
      const prod = rat(BigInt(v) * place.n, place.d);
      sub = rAdd(sub, prod);
      const prodStr = showVal(ratToBase(prod, 10, 40));
      terms.push(`${dshow(ch, from)} × ${from}${sup(pos)}`);
      prods.push(prodStr);
      return [dshow(ch, from), `${from}${sup(pos)}`, showVal(ratToBase(place, 10, 40)), prodStr];
    });
    return { rows, terms, prods, sub, text: showVal(ratToBase(sub, 10, 60)) };
  };
  blocks.push({ t: "p", text: `প্রতিটি অঙ্ককে তার **স্থানীয় মান** (${from}${sup("অবস্থান")}) দিয়ে গুণ করে যোগ করি। পূর্ণ অংশ ও ভগ্নাংশ অংশের হিসাব আলাদা টেবিলে করে শেষে দুটি যোগ করব। দশমিক বিন্দুর বামে অবস্থান 0, 1, 2 … এবং ডানে −1, −2 …` });
  const I = part(p.int, true);
  blocks.push({ t: "h", text: "পূর্ণ অংশ (দশমিক বিন্দুর আগে)" });
  blocks.push({ t: "p", text: `${N(p.int, from)} = ${I.terms.join(" + ")}` });
  blocks.push({ t: "table", head, rows: I.rows, hlCol: 3 });
  blocks.push({ t: "p", text: `পূর্ণ অংশের যোগফল: ${I.prods.join(" + ")} = **${I.text}**` });
  let total = I.sub;
  if (p.frac) {
    const F = part(p.frac, false);
    blocks.push({ t: "h", text: "ভগ্নাংশ অংশ (দশমিক বিন্দুর পর)" });
    blocks.push({ t: "p", text: `${N("0." + p.frac, from)} = ${F.terms.join(" + ")}` });
    blocks.push({ t: "table", head, rows: F.rows, hlCol: 3 });
    blocks.push({ t: "p", text: `ভগ্নাংশ অংশের যোগফল: ${F.prods.join(" + ")} = **${F.text}**` });
    total = rAdd(total, F.sub);
    blocks.push({ t: "h", text: "দুই অংশ যোগ" });
    blocks.push({ t: "box", text: `${M(I.text)} + ${M(F.text)} = ${M(showVal(ratToBase(total, 10, 60)))}` });
  }
  const res = ratToBase(total, 10, 60);
  return { blocks, int: res.int, frac: res.frac, exact: true };
}

/* বাইনারি -> অক্টাল/হেক্স (গ্রুপ করে) */
function binToPow(p, k) {
  const to = k === 3 ? 8 : 16;
  const blocks = [];
  const pi = p.int.padStart(Math.ceil(p.int.length / k) * k, "0");
  const pf = p.frac.padEnd(Math.ceil(p.frac.length / k) * k, "0");
  const grp = (s) => s.match(new RegExp(`.{${k}}`, "g")) || [];
  const gi = grp(pi), gf = grp(pf);
  blocks.push({ t: "p", text: `বাইনারি থেকে ${BASE_NAME[to]}: দশমিক বিন্দু থেকে শুরু করে **${k} বিট করে** গ্রুপ করি (${to} = 2^[${k}])। পূর্ণ অংশে ডান থেকে বামে, ভগ্নাংশে বাম থেকে ডানে। কম পড়লে শূন্য বসাই।` });
  const gc = (g, n) => `[[${g}|${n}]]`; // গ্রুপ নম্বর ধরে রঙ: পূর্ণ ও ভগ্নাংশ মিলিয়ে একটানা, তাই পাশাপাশি রঙ মেলে না
  blocks.push({ t: "p", text: `${N(p.int + (p.frac ? "." + p.frac : ""), 2)} → ${gi.map((g, n) => gc(g, n)).join(" ")}${gf.length ? " [[.|dot]] " + gf.map((g, n) => gc(g, gi.length + n)).join(" ") : ""}` });
  const row = (g) => { const v = parseInt(g, 2); return [g, `${v}`, { x: dl(v), hl: true }]; };
  const head = ["বিট গ্রুপ", "ডেসিমাল মান", `${BASE_SHORT[to]} অঙ্ক`];
  const intS = gi.map((g) => dl(parseInt(g, 2))).join("");
  const fracS = gf.map((g) => dl(parseInt(g, 2))).join("");
  blocks.push({ t: "h", text: "পূর্ণ অংশের গ্রুপ" });
  blocks.push({ t: "table", head, rows: gi.map(row) });
  if (gf.length) { blocks.push({ t: "h", text: "ভগ্নাংশ অংশের গ্রুপ" }); blocks.push({ t: "table", head, rows: gf.map(row) }); }
  return { blocks, int: trimInt(intS), frac: trimFrac(fracS), exact: true };
}

/* অক্টাল/হেক্স -> বাইনারি (প্রতি অঙ্ককে k বিটে) */
function powToBin(p, from) {
  const k = from === 8 ? 3 : 4;
  const blocks = [];
  blocks.push({ t: "p", text: `${BASE_NAME[from]} থেকে বাইনারি: প্রতিটি অঙ্ককে **${k} বিটের** বাইনারিতে লিখি (${from} = 2^[${k}])।` });
  const row = (ch) => { const v = dv(ch); return [dshow(ch, from), `${v}`, { x: v.toString(2).padStart(k, "0"), hl: true }]; };
  const head = ["অঙ্ক", "ডেসিমাল মান", `${k} বিট বাইনারি`];
  blocks.push({ t: "h", text: "পূর্ণ অংশের অঙ্ক" });
  blocks.push({ t: "table", head, rows: [...p.int].map(row) });
  if (p.frac) { blocks.push({ t: "h", text: "ভগ্নাংশ অংশের অঙ্ক" }); blocks.push({ t: "table", head, rows: [...p.frac].map(row) }); }
  const rawI = [...p.int].map((c) => dv(c).toString(2).padStart(k, "0")).join("");
  const rawF = [...p.frac].map((c) => dv(c).toString(2).padStart(k, "0")).join("");
  const ti = trimInt(rawI), tf = trimFrac(rawF);
  const cut = (s) => s.match(new RegExp(`.{${k}}`, "g")) || [];
  const gI = cut(rawI), gF = cut(rawF);
  const colored = gI.map((g, n) => `[[${g}|${n}]]`).join("") + (gF.length ? "[[.|dot]]" + gF.map((g, n) => `[[${g}|${gI.length + n}]]`).join("") : "");
  blocks.push({ t: "p", text: `সব বিট পাশাপাশি বসিয়ে পাই: ${colored}` });
  if (ti !== rawI || tf !== rawF) blocks.push({ t: "p", text: "শুরুর অপ্রয়োজনীয় 0 (পূর্ণ অংশে) এবং শেষের অপ্রয়োজনীয় 0 (ভগ্নাংশে) বাদ দিই।" });
  return { blocks, int: ti, frac: tf, exact: true };
}

export function convert(raw, from, to, precision = 8) {
  const p = parseNum(raw, from);
  if (!p.ok) return p;
  const blocks = [];
  const sign = p.neg ? "-" : "";
  const src = `${p.int}${p.frac ? "." + p.frac : ""}`;
  let res;
  if (from === to) {
    blocks.push({ t: "p", text: "দুটি পদ্ধতি একই, তাই সংখ্যার মান অপরিবর্তিত থাকে।" });
    res = { int: p.int, frac: p.frac, exact: true };
  } else if (from === 10) {
    res = decToBase(p, to, precision);
    blocks.push(...res.blocks);
  } else if (to === 10) {
    res = baseToDec(p, from);
    blocks.push(...res.blocks);
  } else if (from === 2) {
    res = binToPow(p, to === 8 ? 3 : 4);
    blocks.push(...res.blocks);
  } else if (to === 2) {
    res = powToBin(p, from);
    blocks.push(...res.blocks);
  } else {
    /* অক্টাল <-> হেক্স : বাইনারি হয়ে */
    blocks.push({ t: "p", text: `${BASE_NAME[from]} থেকে ${BASE_NAME[to]} সরাসরি হয় না। তাই **বাইনারি হয়ে** যাই: ${BASE_SHORT[from]} → বাইনারি → ${BASE_SHORT[to]}।` });
    blocks.push({ t: "h", text: `ধাপ 1: ${BASE_NAME[from]} → বাইনারি` });
    const a = powToBin(p, from);
    blocks.push(...a.blocks);
    blocks.push({ t: "box", text: `${N(src, from)} = ${N(join(false, a.int, a.frac), 2)}` });
    blocks.push({ t: "h", text: `ধাপ 2: বাইনারি → ${BASE_NAME[to]}` });
    const b = binToPow({ int: a.int, frac: a.frac }, to === 8 ? 3 : 4);
    blocks.push(...b.blocks);
    res = b;
  }
  if (p.neg) blocks.push({ t: "p", text: "সংখ্যাটি ঋণাত্মক ছিল, তাই চিহ্ন (−) আলাদা রেখে মান রূপান্তর করেছি এবং ফলের আগে বসিয়েছি।" });
  const value = { neg: p.neg, int: res.int, frac: res.frac, exact: res.exact };
  blocks.push({ t: "box", text: `${p.neg ? "−" : ""}${N(src, from)} = ${res.exact ? "" : "≈ "}${p.neg ? "−" : ""}${N(join(false, res.int, res.frac), to)}` });
  return { ok: true, value, text: showVal(value), blocks, input: join(p.neg, p.int, p.frac), rat: p.rat };
}

/* ===========================================================================
   কলাম-ভিত্তিক গাণিতিক (যোগ, বিয়োগ, গুণ, ভাগ)
   =========================================================================== */

function align(A, B) {
  const fi = Math.max(A.int.length, B.int.length), ff = Math.max(A.frac.length, B.frac.length);
  const pad = (x) => ({ int: x.int.padStart(fi, "0"), frac: x.frac.padEnd(ff, "0") });
  return [pad(A), pad(B), fi, ff];
}
const withPoint = (arr, fi, ff) => (ff > 0 ? [...arr.slice(0, fi), ".", ...arr.slice(fi)] : arr);
const cellsOf = (digits, fi, ff, lead = "") => [lead, ...withPoint([...digits], fi, ff)];

function sumLine(a, b, c, base, op) {
  /* a + b + c  =  s  =  q×base + r */
  const s = dv(a) + dv(b) + c;
  const q = Math.floor(s / base), r = s % base;
  const head = `${dshow(a, base)} + ${dshow(b, base)} + ক্যারি ${c} = ${s}`;
  const tail = q > 0 ? `${s} = ${q}×${base} + ${r} → লিখি **${dl(r)}**, ক্যারি **${q}**` : `${s} < ${base}, তাই লিখি **${dl(r)}**, ক্যারি **0**`;
  return { s, q, r, line: `${head}। ${tail}` };
}

/* দুটি non-negative সংখ্যার যোগ (কলাম পদ্ধতি) */
function addCols(A, B, base) {
  const [a, b, fi, ff] = align(A, B);
  const da = a.int + a.frac, db = b.int + b.frac;
  const n = da.length;
  const res = Array(n);
  const cin = Array(n).fill(0);
  const lines = [];
  let c = 0, step = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (ff > 0 && i === fi - 1) lines.push("দশমিক বিন্দু (.) এর বাঁয়ের কলামে যাওয়ার আগে ফলেও দশমিক বিন্দু বসালাম।");
    cin[i] = c;
    const x = sumLine(da[i], db[i], c, base);
    res[i] = dl(x.r);
    c = x.q;
    lines.push(`কলাম ${++step}: ${x.line}`);
  }
  const lead = c > 0 ? bigStr(BigInt(c), base) : "";
  if (c > 0) lines.push(`সবশেষে বাকি ক্যারি ${c} কে বামে নামিয়ে লিখি **${lead}**।`);
  const digits = res.join("");
  const rows = [
    { kind: "carry", label: "ক্যারি", cells: cellsOf(cin.map((v) => (v ? String(v) : "")), fi, ff) },
    { kind: "num", label: "", cells: cellsOf(da, fi, ff) },
    { kind: "num", label: "+", cells: cellsOf(db, fi, ff) },
    { kind: "sep" },
    { kind: "res", label: "", cells: cellsOf(digits, fi, ff, lead) },
  ];
  const intS = lead + digits.slice(0, fi), fracS = digits.slice(fi);
  return { int: trimInt(intS), frac: trimFrac(fracS), rawInt: intS, rawFrac: fracS, cout: lead, digits, fi, ff, lines, grid: { t: "cols", rows } };
}

/* বড় - ছোট (non-negative, A >= B) */
function subCols(A, B, base) {
  const [a, b, fi, ff] = align(A, B);
  const da = a.int + a.frac, db = b.int + b.frac;
  const n = da.length;
  const res = Array(n);
  const brw = Array(n).fill("");
  const lines = [];
  let bo = 0, step = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (ff > 0 && i === fi - 1) lines.push("দশমিক বিন্দু (.) ফলে বসালাম।");
    const x = dv(da[i]), y = dv(db[i]);
    const d = x - y - bo;
    const head = `${dshow(da[i], base)} − ${dshow(db[i], base)}${bo ? " − ধার 1" : ""} = ${d}`;
    if (d < 0) {
      res[i] = dl(d + base);
      lines.push(`কলাম ${++step}: ${head}। ঋণাত্মক, তাই পাশের কলাম থেকে ধার নিই: ${d} + ${base} = ${d + base} → লিখি **${dl(d + base)}**, ধার **1**`);
      bo = 1;
      if (i > 0) brw[i - 1] = "1";
    } else {
      res[i] = dl(d);
      lines.push(`কলাম ${++step}: ${head}। লিখি **${dl(d)}**, ধার **0**`);
      bo = 0;
    }
  }
  const digits = res.join("");
  const rows = [
    { kind: "carry", label: "ধার", cells: cellsOf(brw, fi, ff) },
    { kind: "num", label: "", cells: cellsOf(da, fi, ff) },
    { kind: "num", label: "−", cells: cellsOf(db, fi, ff) },
    { kind: "sep" },
    { kind: "res", label: "", cells: cellsOf(digits, fi, ff) },
  ];
  return { int: trimInt(digits.slice(0, fi)), frac: trimFrac(digits.slice(fi)), lines, grid: { t: "cols", rows } };
}

/* এক অঙ্ক দিয়ে গুণ (পূর্ণসংখ্যা স্ট্রিং) */
function mulDigit(Astr, d, base) {
  const lines = [];
  const out = [];
  let c = 0;
  for (let i = Astr.length - 1; i >= 0; i--) {
    const x = dv(Astr[i]);
    const s = x * d + c;
    const q = Math.floor(s / base), r = s % base;
    lines.push(`${dshow(Astr[i], base)} × ${dshow(dl(d), base)}${c ? " + ক্যারি " + c : ""} = ${s}${q > 0 ? ` = ${q}×${base} + ${r} → লিখি ${dl(r)}, ক্যারি ${q}` : ` → লিখি ${dl(r)}, ক্যারি 0`}`);
    out.push(dl(r));
    c = q;
  }
  if (c > 0) { lines.push(`বাকি ক্যারি ${c} সামনে লিখি ${bigStr(BigInt(c), base)}`); out.push(bigStr(BigInt(c), base).split("").reverse().join("")); }
  return { digits: out.reverse().join(""), lines };
}

/* অনেকগুলো সারির যোগ (আংশিক গুণফল) */
function addMany(rows, base) {
  const W = Math.max(...rows.map((r) => r.length));
  const pr = rows.map((r) => r.padStart(W, "0"));
  const out = [];
  const lines = [];
  let c = 0, step = 0;
  for (let i = W - 1; i >= 0; i--) {
    const vals = pr.map((r) => dv(r[i]));
    const s = vals.reduce((x, y) => x + y, 0) + c;
    const q = Math.floor(s / base), r = s % base;
    lines.push(`কলাম ${++step}: ${vals.join(" + ")}${c ? " + ক্যারি " + c : ""} = ${s}${q > 0 ? ` = ${q}×${base} + ${r} → লিখি ${dl(r)}, ক্যারি ${q}` : ` → লিখি ${dl(r)}`}`);
    out.push(dl(r));
    c = q;
  }
  if (c > 0) { lines.push(`বাকি ক্যারি ${c} সামনে লিখি ${bigStr(BigInt(c), base)}`); out.push(bigStr(BigInt(c), base).split("").reverse().join("")); }
  return { digits: out.reverse().join(""), lines };
}

function mulDirect(A, B, base) {
  const blocks = [];
  const fa = A.frac.length, fb = B.frac.length;
  const a = trimInt((A.int + A.frac).replace(/^0+/, "") || "0");
  const b = trimInt((B.int + B.frac).replace(/^0+/, "") || "0");
  if (fa + fb > 0) blocks.push({ t: "p", text: `দশমিক বিন্দু আপাতত বাদ দিয়ে সংখ্যা দুটিকে পূর্ণসংখ্যা ধরি: ${M(a)} × ${M(b)}। (ভগ্নাংশের মোট ঘর = ${fa} + ${fb} = ${fa + fb})` });
  const partials = [];
  const shown = [];
  for (let j = 0; j < b.length; j++) {
    const d = dv(b[b.length - 1 - j]);
    const w = j + 1;
    let p, lines;
    if (d === 0) { p = "0".repeat(a.length); lines = [`গুণক অঙ্ক 0, তাই পুরো সারি 0।`]; }
    else if (d === 1) { p = a; lines = [`গুণক অঙ্ক 1, তাই ভাজ্য সংখ্যাটিই বসে।`]; }
    else { const r = mulDigit(a, d, base); p = r.digits; lines = r.lines; }
    partials.push(p + "0".repeat(j));
    shown.push({ p, j });
    blocks.push({ t: "detail", title: `${w} নং আংশিক গুণফল: ${M(a)} × ${M(dshow(dl(d), base))}${j ? ` (${j} ঘর বামে সরিয়ে)` : ""} = ${M(p)}`, blocks: [{ t: "list", items: lines }] });
  }
  const sum = b.length === 1 ? { digits: partials[0], lines: [] } : addMany(partials, base);
  const raw = sum.digits;
  const W = Math.max(a.length, b.length + 0, raw.length, ...shown.map((s) => s.p.length + s.j));
  const cell = (str, shift = 0) => { const arr = [...str, ...Array(shift).fill("")]; return [...Array(W - arr.length).fill(""), ...arr]; };
  const rows = [
    { kind: "num", label: "", cells: cell(a) },
    { kind: "num", label: "×", cells: cell(b) },
    { kind: "sep" },
    ...shown.map((s) => ({ kind: "num", label: "", cells: cell(s.p, s.j) })),
    ...(b.length > 1 ? [{ kind: "sep" }, { kind: "res", label: "", cells: cell(raw) }] : []),
  ];
  blocks.push({ t: "cols", rows });
  if (b.length > 1) blocks.push({ t: "detail", title: "আংশিক গুণফলগুলো যোগ করার কলাম-হিসাব", blocks: [{ t: "list", items: sum.lines }] });
  const rawT = trimInt(raw.replace(/^0+/, "") || "0");
  const tf = fa + fb;
  let intS = rawT, fracS = "";
  if (tf > 0) {
    const padded = rawT.padStart(tf + 1, "0");
    intS = padded.slice(0, padded.length - tf);
    fracS = padded.slice(padded.length - tf);
    blocks.push({ t: "p", text: `গুণফল ${M(rawT)}। ডান দিক থেকে ${tf} ঘর গুনে দশমিক বিন্দু বসাই: **${intS}.${fracS}**` });
  }
  return { blocks, int: trimInt(intS), frac: trimFrac(fracS), exact: true };
}

function divDirect(A, B, base, precision) {
  const blocks = [];
  const s = Math.max(A.frac.length, B.frac.length);
  const scaleStr = (X) => trimInt((X.int + X.frac.padEnd(s, "0")).replace(/^0+/, "") || "0");
  const a = scaleStr(A), b = scaleStr(B);
  if (s > 0) blocks.push({ t: "p", text: `ভাজ্য ও ভাজক দুটিকেই দশমিক বিন্দু ${s} ঘর ডানে সরিয়ে পূর্ণসংখ্যা বানাই (দুটিতে একই কাজ, তাই ভাগফল বদলায় না): ${M(a)} ÷ ${M(b)}` });
  const Bv = big(b, base), Bb = BigInt(base);
  if (base > 2) {
    blocks.push({ t: "detail", title: `ভাজক ${b} এর গুণিতক তালিকা (ভাগফলের অঙ্ক খুঁজতে কাজে লাগে)`, blocks: [{ t: "table", head: ["অঙ্ক", `${b} × অঙ্ক`], rows: Array.from({ length: base - 1 }, (_, i) => [dshow(dl(i + 1), base), bigStr(Bv * BigInt(i + 1), base)]) }] });
  }
  let rem = 0n, qd = "", rows = [], idx = 0, fracDigits = "", exact = true;
  const step = (partial) => {
    const q = partial / Bv;
    const prod = q * Bv;
    rem = partial - prod;
    rows.push([`${++idx}`, bigStr(partial, base), `${b} × ${dshow(dl(Number(q)), base)} = ${bigStr(prod, base)}`, { x: bigStr(rem, base), hl: false }, { x: dl(Number(q)), hl: true }]);
    return dl(Number(q));
  };
  for (const ch of a) qd += step(rem * Bb + BigInt(dv(ch)));
  let intQ = trimInt(qd);
  if (rem !== 0n) {
    while (rem !== 0n) {
      if (fracDigits.length >= precision) { exact = false; break; }
      fracDigits += step(rem * Bb);
    }
  }
  const nInt = a.length;
  blocks.push({ t: "table", head: ["ধাপ", "নামানো অংশ", "ভাজক × ভাগফলের অঙ্ক", "ভাগশেষ", "অঙ্ক"], rows: rows.map((r, i) => (i === nInt && rows.length > nInt ? r : r)), hlCol: 4, note: `ভাজ্যের অঙ্কগুলো একটি একটি করে নামাই (পূর্ণ অংশ শেষে ${nInt} ধাপ)${rows.length > nInt ? `, এরপর দশমিক বিন্দু বসিয়ে ডানে 0 নামাই।` : "।"} প্রতি ধাপে ভাগফলের অঙ্ক = (নামানো অংশ ÷ ভাজক) এর পূর্ণ অংশ।` });
  if (rows.length > nInt) blocks.push({ t: "p", text: `পূর্ণ অংশের ভাগশেষ ছিল 0 নয়, তাই ভাগফলে **দশমিক বিন্দু** বসিয়ে ডানে 0 নামিয়ে ভাগ চালিয়ে গেলাম।` });
  if (!exact) blocks.push({ t: "warn", text: `ভাগশেষ কখনো 0 হচ্ছে না। তাই ${precision} ঘর পর্যন্ত নিয়ে থামলাম, ফল **আসন্ন মান (≈)**।` });
  return { blocks, int: intQ, frac: exact ? trimFrac(fracDigits) : fracDigits, exact };
}

/* বাইনারি বিয়োগ: 2-এর পরিপূরক */
function twosComplementSub(A, B) {
  const blocks = [];
  const [a, b, fi, ff] = align(A, B);
  const da = a.int + a.frac, db = b.int + b.frac, n = da.length;
  if (/^0*$/.test(db)) {
    blocks.push({ t: "p", text: "B = 0, তাই A − 0 = A। (শূন্যের 2-এর পরিপূরকের দরকার নেই।)" });
    return { blocks, neg: false, int: trimInt(a.int), frac: trimFrac(a.frac), exact: true };
  }
  blocks.push({ t: "p", text: `বিয়োগ ${N(da.slice(0, fi) + (ff ? "." + da.slice(fi) : ""), 2)} − ${N(db.slice(0, fi) + (ff ? "." + db.slice(fi) : ""), 2)} কে যোগে বদলাই: **A − B = A + (B এর 2-এর পরিপূরক)**। দুই সংখ্যার ঘরসংখ্যা সমান করে নিয়েছি (মোট ${n} বিট)।` });
  const ones = [...db].map((c) => (c === "0" ? "1" : "0")).join("");
  blocks.push({ t: "h", text: "ধাপ 1: B এর 1-এর পরিপূরক (0 কে 1, 1 কে 0)" });
  blocks.push({ t: "box", text: `${M(db)} → ${M(ones)}` });
  const one = "0".repeat(n - 1) + "1";
  const tw = addCols({ int: ones.slice(0, fi), frac: ones.slice(fi) }, { int: one.slice(0, fi), frac: one.slice(fi) }, 2);
  const twDigits = tw.digits;
  blocks.push({ t: "h", text: "ধাপ 2: 1-এর পরিপূরকের সাথে 1 যোগ করে 2-এর পরিপূরক পাই" });
  blocks.push(tw.grid);
  if (tw.cout) blocks.push({ t: "p", text: "সবচেয়ে বামের বাড়তি ক্যারি ফেলে দিই (ঘরসংখ্যা " + n + " ই থাকবে)।" });
  blocks.push({ t: "box", text: `B এর 2-এর পরিপূরক = ${M(twDigits)}` });
  const sum = addCols({ int: da.slice(0, fi), frac: da.slice(fi) }, { int: twDigits.slice(0, fi), frac: twDigits.slice(fi) }, 2);
  blocks.push({ t: "h", text: "ধাপ 3: A এর সাথে B এর 2-এর পরিপূরক যোগ করি" });
  blocks.push(sum.grid);
  let neg = false, rd = sum.digits;
  if (sum.cout) {
    blocks.push({ t: "p", text: "সবচেয়ে বামে **ক্যারি 1** এসেছে। নিয়ম: ক্যারি এলে তা ফেলে দিই, ফল **ধনাত্মক** এবং বাকি অংশই উত্তর।" });
  } else {
    neg = true;
    blocks.push({ t: "p", text: "বামে **ক্যারি আসেনি**। নিয়ম: ক্যারি না এলে ফল **ঋণাত্মক**। তখন যোগফলের আবার 2-এর পরিপূরক নিয়ে মান পাই।" });
    const ones2 = [...rd].map((c) => (c === "0" ? "1" : "0")).join("");
    const t2 = addCols({ int: ones2.slice(0, fi), frac: ones2.slice(fi) }, { int: one.slice(0, fi), frac: one.slice(fi) }, 2);
    blocks.push({ t: "p", text: `যোগফল ${M(rd)} → 1-এর পরিপূরক ${M(ones2)} → 1 যোগ করে ${M(t2.digits)}` });
    rd = t2.digits;
  }
  const iS = rd.slice(0, fi), fS = rd.slice(fi);
  return { blocks, neg, int: trimInt(iS), frac: trimFrac(fS), exact: true };
}

/* বাইনারি বিয়োগ: 1-এর পরিপূরক (end-around carry) */
function onesComplementSub(A, B) {
  const blocks = [];
  const [a, b, fi, ff] = align(A, B);
  const da = a.int + a.frac, db = b.int + b.frac, n = da.length;
  const flip = (x) => [...x].map((c) => (c === "0" ? "1" : "0")).join("");
  const split = (x) => ({ int: x.slice(0, fi), frac: x.slice(fi) });
  const show = (x) => x.slice(0, fi) + (ff ? "." + x.slice(fi) : "");
  if (/^0*$/.test(db)) {
    blocks.push({ t: "p", text: "B = 0, তাই A − 0 = A। (শূন্যের পরিপূরকের দরকার নেই।)" });
    return { blocks, neg: false, int: trimInt(a.int), frac: trimFrac(a.frac), exact: true };
  }
  blocks.push({ t: "p", text: `বিয়োগ ${N(show(da), 2)} − ${N(show(db), 2)} কে যোগে বদলাই: **A − B = A + (B এর 1-এর পরিপূরক)**। দুই সংখ্যার ঘরসংখ্যা সমান করে নিয়েছি (মোট ${n} বিট)।` });
  const ones = flip(db);
  blocks.push({ t: "h", text: "ধাপ 1: B এর 1-এর পরিপূরক (0 কে 1, 1 কে 0)" });
  blocks.push({ t: "box", text: `${M(db)} → ${M(ones)}` });
  const sum = addCols(split(da), split(ones), 2);
  blocks.push({ t: "h", text: "ধাপ 2: A এর সাথে B এর 1-এর পরিপূরক যোগ করি" });
  blocks.push(sum.grid);
  let neg = false, rd = sum.digits;
  if (sum.cout) {
    const one = "0".repeat(n - 1) + "1";
    const ar = addCols(split(sum.digits), split(one), 2);
    blocks.push({ t: "p", text: "সবচেয়ে বামে **ক্যারি 1** এসেছে। নিয়ম: ক্যারি এলে তা ফেলে দিয়ে সবচেয়ে ডানের বিটে যোগ করি (এটিকে **end-around carry** বলে)। ফল **ধনাত্মক**।" });
    blocks.push({ t: "h", text: "ধাপ 3: end-around carry যোগ করি" });
    blocks.push(ar.grid);
    rd = ar.digits;
  } else {
    neg = true;
    const back = flip(rd);
    blocks.push({ t: "p", text: "বামে **ক্যারি আসেনি**। নিয়ম: ক্যারি না এলে ফল **ঋণাত্মক**। তখন যোগফলের আবার 1-এর পরিপূরক নিলেই মান পাই।" });
    blocks.push({ t: "box", text: `${M(rd)} এর 1-এর পরিপূরক = ${M(back)}` });
    rd = back;
  }
  return { blocks, neg, int: trimInt(rd.slice(0, fi)), frac: trimFrac(rd.slice(fi)), exact: true };
}

/* দুইয়ের বেশি non-negative সংখ্যার যোগ (কলাম পদ্ধতি; ক্যারি 1-এর বেশিও হতে পারে) */
function addColsMany(list, base) {
  const fi = Math.max(...list.map((x) => x.int.length)), ff = Math.max(...list.map((x) => x.frac.length));
  const rows = list.map((x) => x.int.padStart(fi, "0") + x.frac.padEnd(ff, "0"));
  const n = fi + ff;
  const res = Array(n), cin = Array(n).fill(0), lines = [];
  let c = 0, step = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (ff > 0 && i === fi - 1) lines.push("দশমিক বিন্দু (.) এর বাঁয়ের কলামে যাওয়ার আগে ফলেও দশমিক বিন্দু বসালাম।");
    cin[i] = c;
    const vals = rows.map((r) => dv(r[i]));
    const s = vals.reduce((x, y) => x + y, 0) + c;
    const q = Math.floor(s / base), r = s % base;
    res[i] = dl(r);
    lines.push(`কলাম ${++step}: ${vals.map((v, k) => dshow(dl(v), base)).join(" + ")}${c ? " + ক্যারি " + c : ""} = ${s}${q > 0 ? ` = ${q}×${base} + ${r} → লিখি **${dl(r)}**, ক্যারি **${q}**` : ` < ${base}, তাই লিখি **${dl(r)}**, ক্যারি **0**`}`);
    c = q;
  }
  const lead = c > 0 ? bigStr(BigInt(c), base) : "";
  if (c > 0) lines.push(`সবশেষে বাকি ক্যারি ${c} কে বামে নামিয়ে লিখি **${lead}**।`);
  const digits = res.join("");
  const grid = { t: "cols", rows: [
    { kind: "carry", label: "ক্যারি", cells: cellsOf(cin.map((v) => (v ? String(v) : "")), fi, ff) },
    ...rows.map((r, k) => ({ kind: "num", label: k === 0 ? "" : "+", cells: cellsOf(r, fi, ff) })),
    { kind: "sep" },
    { kind: "res", label: "", cells: cellsOf(digits, fi, ff, lead) },
  ] };
  const intS = lead + digits.slice(0, fi);
  return { int: trimInt(intS), frac: trimFrac(digits.slice(fi)), lines, grid };
}

export const MAX_OPERANDS = 10;
const ORD = ["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম"];
export const ordinal = (i) => ORD[i] || `${toBnDigits(i + 1)}তম`;

/* অনেকগুলো সংখ্যার যোগ: raws = ["1011", "110", "-101", ...] (একই ভিত্তিতে) */
export function calcMulti(raws, base, method = "direct", precision = 8) {
  const P = [];
  for (let i = 0; i < raws.length; i++) {
    const x = parseNum(raws[i], base);
    if (!x.ok) return { ok: false, which: i, msg: x.msg, empty: x.empty };
    P.push(x);
  }
  const r = P.reduce((acc, x) => rAdd(acc, x.rat), rat(0n));
  const mag = (x) => ({ int: x.int, frac: x.frac });
  const txt = (x) => `${x.neg ? "−" : ""}${x.int}${x.frac ? "." + x.frac : ""}`;
  const plain = (x) => x.int + (x.frac ? "." + x.frac : "");
  const sTxt = P.map(txt);
  const blocks = [];
  let out;
  if (method === "decimal" && base !== 10) {
    blocks.push({ t: "p", text: `ধাপে ধাপে: (1) প্রতিটি সংখ্যাকে ডেসিমালে বদলাই, (2) ডেসিমালে সবগুলো যোগ করি, (3) ফলকে আবার ${BASE_NAME[base]}-এ বদলাই।` });
    blocks.push({ t: "h", text: "ধাপ 1: ডেসিমালে রূপান্তর" });
    const cs = raws.map((x) => convert(x, base, 10));
    cs.forEach((c, i) => blocks.push({ t: "detail", title: `${N(sTxt[i], base)} কে ডেসিমালে: = ${M(c.text)}`, blocks: c.blocks }));
    blocks.push({ t: "h", text: "ধাপ 2: ডেসিমালে যোগ" });
    const fk = P.reduce((m, x) => Math.max(m, x.frac.length), 0);
    const dres = ratToBase(r, 10, Math.max(precision + 8, 4 * fk + 4));
    const dText = showVal(dres);
    blocks.push({ t: "box", text: `${cs.map((c) => M(c.text)).join(" + ")} = ${M(dText)}` });
    blocks.push({ t: "h", text: `ধাপ 3: ফলকে ${BASE_NAME[base]}-এ রূপান্তর` });
    const cr = convert(dText, 10, base, Math.max(precision, fk + 1));
    blocks.push({ t: "detail", title: `${M(dText)} কে ${BASE_NAME[base]}-এ রূপান্তর`, blocks: cr.blocks, open: true });
    out = { neg: cr.value.neg, int: cr.value.int, frac: cr.value.frac, exact: cr.value.exact };
  } else {
    const pos = P.filter((x) => !x.neg), neg = P.filter((x) => x.neg);
    const group = (list, title) => {
      if (list.length === 1) return { int: list[0].int, frac: list[0].frac };
      const g = addColsMany(list.map(mag), base);
      blocks.push({ t: "h", text: title });
      blocks.push(g.grid);
      blocks.push({ t: "detail", title: "কলাম ধরে ধাপে-ধাপে হিসাব (ডান থেকে বামে)", blocks: [{ t: "p", text: "মাঝের যোগফলগুলো ডেসিমালে লেখা হয়েছে; ক্যারি ঘরেও ডেসিমাল সংখ্যা বসেছে।" }, { t: "list", items: g.lines }], open: list === pos || !pos.length });
      return { int: g.int, frac: g.frac };
    };
    if (!neg.length) {
      blocks.push({ t: "p", text: `সবগুলো সংখ্যা ধনাত্মক (বা 0), তাই ${P.length}টি সংখ্যা একসাথে কলাম ধরে যোগ করি। প্রতি কলামে সবগুলো অঙ্ক ও আগের ক্যারি যোগ হয়।` });
      out = { neg: false, ...group(pos, "যোগ") };
    } else if (!pos.length) {
      blocks.push({ t: "p", text: `সবগুলো সংখ্যা ঋণাত্মক, তাই চিহ্ন ছাড়া মানগুলো যোগ করি এবং ফলের আগে (−) বসাই।` });
      out = { neg: true, ...group(neg, "মানগুলোর যোগ") };
    } else {
      blocks.push({ t: "p", text: "কিছু সংখ্যা ধনাত্মক, কিছু ঋণাত্মক। তাই (1) ধনাত্মকগুলো একসাথে যোগ করি, (2) ঋণাত্মকগুলোর মান একসাথে যোগ করি, (3) বড় মান থেকে ছোট মান বিয়োগ করে বড়টির চিহ্ন বসাই।" });
      const sp = group(pos, `ধাপ 1: ধনাত্মক সংখ্যাগুলোর যোগফল`);
      if (pos.length === 1) blocks.push({ t: "h", text: "ধাপ 1: ধনাত্মক সংখ্যা" }, { t: "box", text: `${N(plain(sp), base)}` });
      const sn = group(neg, `ধাপ 2: ঋণাত্মক সংখ্যাগুলোর মানের যোগফল`);
      if (neg.length === 1) blocks.push({ t: "h", text: "ধাপ 2: ঋণাত্মক সংখ্যা (মান)" }, { t: "box", text: `${N(plain(sn), base)}` });
      const pr = parseNum(plain(sp), base).rat, nr = parseNum(plain(sn), base).rat;
      const c = rCmpAbs(pr, nr);
      blocks.push({ t: "h", text: "ধাপ 3: বড় মান − ছোট মান" });
      if (c === 0) { blocks.push({ t: "p", text: "দুই মান সমান, তাই ফল 0।" }); out = { neg: false, int: "0", frac: "" }; }
      else {
        const big_ = c > 0 ? sp : sn, small = c > 0 ? sn : sp;
        blocks.push({ t: "p", text: `বড় মান ${N(plain(big_), base)} (${c > 0 ? "ধনাত্মক দলের" : "ঋণাত্মক দলের"}), ছোট মান ${N(plain(small), base)}। ফলের চিহ্ন বড় মানের দলের চিহ্ন।` });
        const d = subCols(big_, small, base);
        blocks.push(d.grid);
        blocks.push({ t: "detail", title: "কলাম ধরে ধাপে-ধাপে হিসাব (ডান থেকে বামে)", blocks: [{ t: "p", text: "মাঝের সংখ্যাগুলো ডেসিমালে লেখা হয়েছে।" }, { t: "list", items: d.lines }] });
        out = { neg: c < 0, int: d.int, frac: d.frac };
      }
    }
    out.exact = true;
  }
  const isZero = out.int === "0" && !out.frac;
  out.neg = out.neg && !isZero;
  const resultText = showVal(out);
  blocks.push({ t: "box", text: `${sTxt.map((x, i) => (i === 0 ? N(x, base) : x.startsWith("−") ? `+ (${N(x, base)})` : `+ ${N(x, base)}`)).join(" ")} = ${out.neg ? "−" : ""}${N(join(false, out.int, out.frac), base)}` });
  const all = BASES.map((b) => ({ base: b, ...ratToBase(r, b, precision) }));
  return { ok: true, value: out, text: resultText, blocks, all, rat: r };
}

/* ===========================================================================
   calc: A (op) B  একই ভিত্তিতে
   =========================================================================== */
export const OPS = {
  "+": { name: "যোগ", sign: "+", result: "যোগফল" },
  "-": { name: "বিয়োগ", sign: "−", result: "বিয়োগফল" },
  "*": { name: "গুণ", sign: "×", result: "গুণফল" },
  "/": { name: "ভাগ", sign: "÷", result: "ভাগফল" },
};

export function availableMethods(base, op, a, b) {
  const m = [{ id: "direct", label: "সরাসরি পদ্ধতি" }];
  if (base !== 10) m.push({ id: "decimal", label: "ডেসিমালে রূপান্তর করে" });
  if (base === 2 && op === "-" && a?.ok && b?.ok && !a.neg && !b.neg) m.push({ id: "ones", label: "1-এর পরিপূরক" }, { id: "complement", label: "2-এর পরিপূরক" });
  return m;
}

export function calc(aRaw, bRaw, op, base, method = "direct", precision = 8) {
  const A = parseNum(aRaw, base);
  if (!A.ok) return { ok: false, which: "a", msg: A.msg, empty: A.empty };
  const B = parseNum(bRaw, base);
  if (!B.ok) return { ok: false, which: "b", msg: B.msg, empty: B.empty };
  if (op === "/" && B.rat.n === 0n) return { ok: false, which: "b", msg: "শূন্য (0) দিয়ে ভাগ করা যায় না।" };

  const aR = A.rat, bR = B.rat; // চিহ্নসহ নিখুঁত ভগ্নাংশ
  let r;
  if (op === "+") r = rAdd(aR, bR);
  else if (op === "-") r = rSub(aR, bR);
  else if (op === "*") r = rMul(aR, bR);
  else r = rDiv(aR, bR);

  const blocks = [];
  const aS = `${A.neg ? "−" : ""}${A.int}${A.frac ? "." + A.frac : ""}`;
  const bS = `${B.neg ? "−" : ""}${B.int}${B.frac ? "." + B.frac : ""}`;
  const opS = OPS[op].sign;
  let out;

  if (method === "decimal" && base !== 10) {
    blocks.push({ t: "p", text: `ধাপে ধাপে: (1) দুটি সংখ্যাকে ডেসিমালে বদলাই, (2) ডেসিমালে ${OPS[op].name} করি, (3) ফলকে আবার ${BASE_NAME[base]}-এ বদলাই।` });
    blocks.push({ t: "h", text: "ধাপ 1: ডেসিমালে রূপান্তর" });
    const ca = convert(aRaw, base, 10), cb = convert(bRaw, base, 10);
    blocks.push({ t: "detail", title: `${N(aS, base)} কে ডেসিমালে: = ${M(ca.text)}`, blocks: ca.blocks });
    blocks.push({ t: "detail", title: `${N(bS, base)} কে ডেসিমালে: = ${M(cb.text)}`, blocks: cb.blocks });
    blocks.push({ t: "h", text: `ধাপ 2: ডেসিমালে ${OPS[op].name}` });
    const fk = A.frac.length + B.frac.length;
    const dres = ratToBase(r, 10, op === "/" ? Math.max(precision + 8, 20) : Math.max(precision + 8, 4 * fk + 4));
    const dText = showVal(dres);
    blocks.push({ t: "box", text: `${M(ca.text)} ${opS} ${M(cb.text)} = ${dres.exact ? "" : "≈ "}${M(dText)}` });
    if (!dres.exact) blocks.push({ t: "p", text: "ডেসিমালে ভাগফল শেষ হয় না, তাই কয়েক ঘর পর্যন্ত নেওয়া হলো।" });
    blocks.push({ t: "h", text: `ধাপ 3: ফলকে ${BASE_NAME[base]}-এ রূপান্তর` });
    const cr = convert(dText, 10, base, op === "/" ? precision : Math.max(precision, fk + 1));
    blocks.push({ t: "detail", title: `${M(dText)} কে ${BASE_NAME[base]}-এ রূপান্তর`, blocks: cr.blocks, open: true });
    out = { neg: cr.value.neg, int: cr.value.int, frac: cr.value.frac, exact: cr.value.exact && dres.exact };
  } else if (method === "ones" && base === 2 && op === "-" && !A.neg && !B.neg) {
    const t = onesComplementSub(A, B);
    blocks.push(...t.blocks);
    out = { neg: t.neg && !(t.int === "0" && !t.frac), int: t.int, frac: t.frac, exact: true };
  } else if (method === "complement" && base === 2 && op === "-" && !A.neg && !B.neg) {
    const t = twosComplementSub(A, B);
    blocks.push(...t.blocks);
    out = { neg: t.neg && !(t.int === "0" && !t.frac), int: t.int, frac: t.frac, exact: true };
  } else {
    /* সরাসরি (কলাম) পদ্ধতি - চিহ্ন সামলে মান (magnitude) দিয়ে কাজ */
    let sB = op === "-" ? !B.neg : B.neg; // কার্যকর চিহ্ন (true = Negative)
    if (op === "-" && B.rat.n === 0n) sB = false;
    const sA = A.neg;
    let res;
    let neg = false;
    if (op === "+" || op === "-") {
      if (op === "-" && B.rat.n !== 0n) blocks.push({ t: "p", text: "বিয়োগকে যোগে বদলাই: A − B = A + (−B), অর্থাৎ দ্বিতীয় সংখ্যার চিহ্ন উল্টে যোগ করি।" });
      const magA = { int: A.int, frac: A.frac }, magB = { int: B.int, frac: B.frac };
      if (sA === sB || A.rat.n === 0n || B.rat.n === 0n) {
        const sgn = A.rat.n === 0n ? sB : sA;
        blocks.push({ t: "p", text: `${sA === sB ? "দুই সংখ্যার চিহ্ন একই" : "একটি সংখ্যা 0"}, তাই মান (চিহ্ন ছাড়া) দুটি **যোগ** করি${sgn ? " এবং ফলের আগে (−) বসাই" : ""}।` });
        res = addCols(magA, magB, base);
        blocks.push(res.grid);
        blocks.push({ t: "detail", title: "কলাম ধরে ধাপে-ধাপে হিসাব (ডান থেকে বামে)", blocks: [{ t: "p", text: "মাঝের যোগফলগুলো ডেসিমালে লেখা হয়েছে।" }, { t: "list", items: res.lines }], open: true });
        neg = sgn;
      } else {
        const c = rCmpAbs(A.rat, B.rat);
        blocks.push({ t: "p", text: `দুই সংখ্যার চিহ্ন ভিন্ন, তাই মান দুটি **বিয়োগ** করি: বড় মান থেকে ছোট মান। ফলের চিহ্ন হবে বড় মানের সংখ্যার চিহ্ন।` });
        if (c === 0) { res = { int: "0", frac: "", lines: [], grid: null }; blocks.push({ t: "p", text: "দুটি মান সমান, তাই ফল 0।" }); neg = false; }
        else {
          const big_ = c > 0 ? magA : magB, small = c > 0 ? magB : magA;
          blocks.push({ t: "p", text: `বড় মান ${N(big_.int + (big_.frac ? "." + big_.frac : ""), base)}, ছোট মান ${N(small.int + (small.frac ? "." + small.frac : ""), base)}।` });
          res = subCols(big_, small, base);
          blocks.push(res.grid);
          blocks.push({ t: "detail", title: "কলাম ধরে ধাপে-ধাপে হিসাব (ডান থেকে বামে)", blocks: [{ t: "p", text: "মাঝের সংখ্যাগুলো ডেসিমালে লেখা হয়েছে।" }, { t: "list", items: res.lines }], open: true });
          neg = c > 0 ? sA : sB;
        }
      }
      out = { neg: neg && !(res.int === "0" && !res.frac), int: res.int, frac: res.frac, exact: true };
    } else if (op === "*") {
      const rs = mulDirect(A, B, base);
      blocks.push(...rs.blocks);
      neg = (sA !== sB) && A.rat.n !== 0n && B.rat.n !== 0n;
      if (neg) blocks.push({ t: "p", text: "দুই সংখ্যার চিহ্ন ভিন্ন, তাই গুণফল ঋণাত্মক।" });
      out = { neg, int: rs.int, frac: rs.frac, exact: true };
    } else {
      const rs = divDirect(A, B, base, precision);
      blocks.push(...rs.blocks);
      neg = (sA !== sB) && A.rat.n !== 0n;
      if (neg) blocks.push({ t: "p", text: "দুই সংখ্যার চিহ্ন ভিন্ন, তাই ভাগফল ঋণাত্মক।" });
      out = { neg, int: rs.int, frac: rs.frac, exact: rs.exact };
    }
  }
  const isZero = out.int === "0" && !out.frac;
  out.neg = out.neg && !isZero;
  const resultText = showVal(out);
  blocks.push({ t: "box", text: `${N(aS, base)} ${opS} ${N(bS, base)} = ${out.exact ? "" : "≈ "}${out.neg ? "−" : ""}${N(join(false, out.int, out.frac), base)}` });
  const all = BASES.map((b) => ({ base: b, ...ratToBase(r, b, precision) }));
  return { ok: true, value: out, text: resultText, blocks, all, rat: r, aS, bS };
}
