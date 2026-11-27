/* উদাহরণ জেনারেটর
   ─────────────────────────────────────────────────────────────
   • আকার (অতি ছোট → অনেক বড়), দশমিকসহ/দশমিক ছাড়া, ঋণাত্মক — সব ধরনের বৈচিত্র্য আসে।
   • এজ কেস সামলানো আছে: শূন্য ভাজক, সব-শূন্য সংখ্যা, সমান সংখ্যার বিয়োগ, ভুল অঙ্ক ইত্যাদি কখনো আসে না।
   • নির্বাচিত পদ্ধতি/প্রক্রিয়া অনুযায়ী উদাহরণ তৈরি হয়, তাই ফল সবসময় বৈধ হয়।
   অন্য পাতার জন্য নতুন ফাংশন এই ফাইলেই যোগ করা যাবে। */

import { parseNum } from "./engine.js";
import { parseBits } from "./complement.js";
import { parseExpr, tableOf } from "./logic.js";

const DIGITS = "0123456789ABCDEF";
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const chance = (p) => Math.random() < p;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wpick = (pairs) => {
  const t = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * t;
  for (const [v, w] of pairs) if ((r -= w) < 0) return v;
  return pairs[0][0];
};

/* ───────── মৌলিক অঙ্ক-জেনারেটর ───────── */
/* পূর্ণ অংশ: প্রথম অঙ্ক 0 নয় (একঅঙ্কের সংখ্যায় 0 হতে পারে) */
function randInt(base, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += DIGITS[ri(i === 0 && len > 1 ? 1 : 0, base - 1)];
  return s;
}
/* ভগ্নাংশ অংশ: শেষ অঙ্ক কখনো 0 নয় */
function randFrac(base, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += DIGITS[ri(0, base - 1)];
  if (s.endsWith("0")) s = s.slice(0, -1) + DIGITS[ri(1, base - 1)];
  return s;
}
/* ডেসিমাল ভগ্নাংশ যা 2-এর ঘাতের হর (k/2^m) — বাইনারি/অক্টাল/হেক্সে সসীম হয় */
const DY_M = { xs: [1, 2], s: [1, 3], m: [2, 4], l: [3, 5], xl: [4, 7] };
function dyadicFrac(size) {
  const m = ri(...DY_M[size]);
  const num = 2 * ri(0, 2 ** (m - 1) - 1) + 1;
  return String(num * 5 ** m).padStart(m, "0");
}

/* ───────── আকার ───────── */
const SIZES = ["xs", "s", "m", "l", "xl"];
const idx = (s) => SIZES.indexOf(s);
const SIZE_NAME = { xs: "অতি ছোট", s: "ছোট", m: "মাঝারি", l: "বড়", xl: "অনেক বড়" };
const FRAC_BY_SIZE = { xs: [1, 1], s: [1, 2], m: [2, 3], l: [3, 4], xl: [4, 6] };

/* রূপান্তর পাতার আকার-সারণি (পূর্ণ অংশের অঙ্ক-সংখ্যা) */
const CONV = {
  int: {
    2: { xs: [1, 3], s: [4, 6], m: [7, 10], l: [11, 14], xl: [15, 20] },
    8: { xs: [1, 2], s: [3, 4], m: [5, 6], l: [7, 8], xl: [9, 10] },
    10: { xs: [1, 1], s: [2, 3], m: [4, 5], l: [6, 7], xl: [8, 10] },
    16: { xs: [1, 2], s: [3, 3], m: [4, 5], l: [6, 7], xl: [8, 9] },
  },
  fracCap: { 2: 8, 8: 4, 10: 6, 16: 4 },
};
/* হিসাবের পাতায় সংখ্যা একটু ছোট রাখি, যাতে ধাপ পড়া যায় */
const CALC = {
  int: {
    2: { xs: [1, 2], s: [3, 4], m: [5, 6], l: [7, 9], xl: [10, 12] },
    8: { xs: [1, 1], s: [2, 2], m: [3, 3], l: [4, 5], xl: [6, 7] },
    10: { xs: [1, 1], s: [2, 2], m: [3, 4], l: [5, 6], xl: [7, 8] },
    16: { xs: [1, 1], s: [2, 2], m: [3, 3], l: [4, 5], xl: [6, 6] },
  },
  fracCap: { 2: 6, 8: 3, 10: 4, 16: 3 },
};

function fracLen(cfg, base, size, maxFrac = 99) {
  let [lo, hi] = FRAC_BY_SIZE[size];
  hi = Math.min(hi, cfg.fracCap[base], maxFrac);
  lo = Math.min(lo, hi);
  return ri(lo, hi);
}
function mkSized(cfg, base, size, frac, dyadic = false, maxFrac = 99) {
  const [lo, hi] = cfg.int[base][size];
  let v = randInt(base, ri(lo, hi));
  if (frac) v += "." + (dyadic ? dyadicFrac(size) : randFrac(base, fracLen(cfg, base, size, maxFrac)));
  return v;
}

/* ───────── তুলনা ও যাচাই ───────── */
const ratOf = (str, base) => { const p = parseNum(str, base); return p.ok ? p.rat : null; };
const isZero = (v, base) => { const x = ratOf(v, base); return !x || x.n === 0n; };
const lessThan = (a, b, base) => { const x = ratOf(a, base), y = ratOf(b, base); return x && y ? x.n * y.d < y.n * x.d : false; };
const sameVal = (a, b, base) => { const x = ratOf(a, base), y = ratOf(b, base); return x && y && x.n * y.d === y.n * x.d; };
const toBase = (n, base) => n.toString(base).toUpperCase();

/* =====================================================================
   ১) সংখ্যা রূপান্তর পাতা
   ===================================================================== */
const CONV_SIZE_W = [["xs", 1], ["s", 3], ["m", 4], ["l", 3], ["xl", 2]];
function convertRegular(base, to) {
  const size = wpick(CONV_SIZE_W);
  const frac = chance(0.5);
  let value = mkSized(CONV, base, size, frac, base === 10 && to !== 10);
  if (/^0*(\.0*)?$/.test(value)) return null; // সব অঙ্ক শূন্য হলে বাদ
  let isNeg = false;
  if (chance(0.1) && !/^0*(\.0*)?$/.test(value)) { value = "-" + value; isNeg = true; }
  return { value, label: `${SIZE_NAME[size]} ${frac ? "দশমিকসহ সংখ্যা" : "পূর্ণসংখ্যা"}${isNeg ? " (ঋণাত্মক)" : ""}`, key: size + frac };
}

let lastConv = { value: null, key: null };

/* fromBase: "যে পদ্ধতি থেকে", toBase: "যে পদ্ধতিতে" */
export function genConvertExample(fromBase, toBase = 2) {
  let r;
  for (let t = 0; t < 20; t++) {
    r = convertRegular(fromBase, toBase);
    if (!r) continue;
    const key = r.key || r.label;
    if (r.value === lastConv.value) continue;
    if (key === lastConv.key && t < 10) continue; // টানা একই ধরন এড়াই
    lastConv = { value: r.value, key };
    return { value: r.value, label: r.label };
  }
  return { value: randInt(fromBase, 4), label: "পূর্ণসংখ্যা" };
}

/* =====================================================================
   ২) যোগ · বিয়োগ · গুণ · ভাগ পাতা
   ===================================================================== */
const CALC_SIZE_W = [["xs", 1], ["s", 3], ["m", 4], ["l", 3], ["xl", 1]];
const cnum = (base, size, frac, maxFrac) => mkSized(CALC, base, size, frac, false, maxFrac);
function calcRegular(base, op) {
  let sa = wpick(CALC_SIZE_W);
  let sb;
  if (op === "*") {
    sb = wpick([["xs", 3], ["s", 4], ["m", 2], ["l", 1]]);
    if (idx(sb) > 1 && idx(sa) > 3) sa = "l";
    if (idx(sa) >= 3 && idx(sb) >= 2) sb = "s";
  } else if (op === "/") {
    sb = SIZES[chance(0.2) ? ri(idx(sa), Math.min(3, idx(sa) + 1)) : ri(0, Math.max(0, Math.min(2, idx(sa) - 1)))];
  } else {
    sb = chance(0.35) ? sa : pick(SIZES);
  }
  const mode = wpick(op === "/" ? [["none", 50], ["a", 30], ["both", 10], ["b", 10]] : [["none", 45], ["both", 25], ["a", 15], ["b", 15]]);
  const fa = mode === "both" || mode === "a";
  const fb = mode === "both" || mode === "b";
  const maxF = op === "*" && fa && fb ? 2 : op === "/" ? 3 : 99;

  let a, b, label;
  let exact = false;
  if (op === "/" && mode === "none" && chance(0.45)) {
    // নিঃশেষে বিভাজ্য: আগে ভাজক ও ভাগফল বেছে গুণ করে ভাজ্য বানাই
    let d = 0, q = 0, dS = "", qS = "";
    for (let i = 0; i < 20 && d < 2; i++) { dS = randInt(base, ri(1, base === 2 ? 3 : 2)); d = parseInt(dS, base); }
    const lenA = ri(...CALC.int[base][sa]);
    for (let i = 0; i < 20 && q < 2; i++) { qS = randInt(base, Math.max(1, lenA - dS.length)); q = parseInt(qS, base); }
    if (d >= 2 && q >= 2) { a = toBase(d * q, base); b = dS; exact = true; label = `নিঃশেষে বিভাজ্য (${SIZE_NAME[sa]} সংখ্যা)`; }
  }
  if (!exact) {
    a = cnum(base, sa, fa, maxF);
    b = cnum(base, sb, fb, maxF);
    if (op === "/") for (let i = 0; i < 10 && isZero(b, base); i++) b = cnum(base, sb, fb, maxF);
    const sizes = sa === sb ? `${SIZE_NAME[sa]} আকারের` : `${SIZE_NAME[sa]} ও ${SIZE_NAME[sb]}`;
    const fl = { none: "পূর্ণসংখ্যা", both: "দুটোই দশমিকসহ", a: "প্রথমটি দশমিকসহ", b: "দ্বিতীয়টি দশমিকসহ" }[mode];
    label = `${sizes} সংখ্যা · ${fl}`;
  }
  const more = [];
  if (op === "+") {
    const c = wpick([[2, 70], [3, 20], [4, 10]]);
    for (let i = 2; i < c; i++) {
      let x = cnum(base, SIZES[ri(0, idx(sa))], chance(0.4), 99);
      for (let k = 0; k < 10 && isZero(x, base); k++) x = cnum(base, SIZES[ri(0, idx(sa))], chance(0.4), 99);
      if (isZero(x, base)) return null;
      more.push(x);
    }
    if (c > 2) label = `${c === 3 ? "তিনটি" : "চারটি"} সংখ্যার যোগ · ${label}`;
  }
  if (isZero(a, base) || isZero(b, base)) return null; // শূন্য শুধু এজ কেসে আসবে

  let negNote = "";
  if (op === "-") {
    if (sameVal(a, b, base)) return null;
    const wantLess = chance(0.2);
    if (lessThan(a, b, base) !== wantLess) [a, b] = [b, a];
    if (wantLess) negNote = " · ফল ঋণাত্মক";
  }
  return { a, b, more, label: label + negNote, key: `${op}${sa}${sb}${mode}${more.length}` };
}

const lastCalc = {};

/* base: সংখ্যা পদ্ধতি, op: "+", "-", "*", "/" */
export function genCalcExample(base, op) {
  const k = `${base}${op}`;
  for (let t = 0; t < 30; t++) {
    const r = calcRegular(base, op);
    if (!r) continue;
    const more = r.more || [];
    const sig = [r.a, r.b, ...more].join("|");
    const key = r.key || r.label;
    if (sig === lastCalc[k]?.sig) continue;
    if (key === lastCalc[k]?.key && t < 15) continue;
    lastCalc[k] = { sig, key };
    return { a: r.a, b: r.b, more, label: r.label };
  }
  return { a: randInt(base, 4), b: randInt(base, 2), more: [], label: "পূর্ণসংখ্যা" };
}


/* =====================================================================
   ৩) 1's ও 2's পরিপূরক পাতা
   ===================================================================== */
const lastComp = { v: null, d: null };

/* বাইনারি সংখ্যা (পূর্ণ অংশ ১–১৩ বিট, দশমিকের পরে ১–৬ বিট; সীমা MAX_INT=16, MAX_FRAC=8-এর ভেতরে) */
export function genComplementExample() {
  for (let t = 0; t < 30; t++) {
    const kind = wpick([["int", 33], ["frac", 45], ["fracOnly", 8], ["lead0", 14]]);
    const size = wpick([["s", 3], ["m", 4], ["l", 3]]);
    const intLen = size === "s" ? ri(3, 5) : size === "m" ? ri(6, 9) : ri(10, 13);
    const fLen = size === "s" ? ri(1, 2) : size === "m" ? ri(2, 4) : ri(4, 6);
    let v, label;
    if (kind === "int") { v = randInt(2, intLen); label = `${SIZE_NAME[size === "s" ? "s" : size === "m" ? "m" : "l"]} পূর্ণসংখ্যা`; }
    else if (kind === "frac") {
      let fr = randFrac(2, fLen);
      label = `${SIZE_NAME[size]} দশমিকসহ`;
      if (fLen >= 2 && fLen <= 5 && chance(0.15)) { fr += "0"; label = "দশমিকের শেষে 0 সহ"; }
      v = randInt(2, intLen) + "." + fr;
    } else if (kind === "fracOnly") { v = "0." + randFrac(2, ri(2, 6)); label = "শুধু ভগ্নাংশ (0 . দিয়ে শুরু)"; }
    else { v = "0" + randInt(2, ri(3, 8)); label = "সামনে 0 সহ"; if (chance(0.4)) { v += "." + randFrac(2, ri(1, 3)); label = "সামনে 0 ও দশমিকসহ"; } }
    const p = parseBits(v);
    if (!p.ok || !v.includes("1") || v === lastComp.v) continue;
    if (label === lastComp.d && t < 12) continue;
    lastComp.v = v; lastComp.d = label;
    return { value: v, label };
  }
  return { value: "1011.01", label: "দশমিকসহ" };
}

/* n বিটে ঋণাত্মক/ধনাত্মক পূর্ণসংখ্যা। −2^(n−1) বাদ, কারণ ওটা 1's পরিপূরকে লেখা যায় না */
const lastSigned = {};
export function genSignedExample(n) {
  const lim = 2 ** (n - 1) - 1;
  for (let t = 0; t < 20; t++) {
    const cls = wpick([["small", 3], ["mid", 4], ["big", 3]]);
    const q = Math.ceil(lim / 4);
    let mag = cls === "small" ? ri(1, Math.max(1, q)) : cls === "mid" ? ri(q, Math.ceil((3 * lim) / 4)) : ri(Math.ceil((3 * lim) / 4), lim);
    mag = Math.min(lim, Math.max(1, mag));
    const negv = chance(0.65);
    const value = negv ? -mag : mag;
    if (value === lastSigned[n]) continue;
    lastSigned[n] = value;
    return { value, label: `${negv ? "ঋণাত্মক" : "ধনাত্মক"} সংখ্যা (${{ small: "ছোট", mid: "মাঝারি", big: "সীমার কাছাকাছি" }[cls]})` };
  }
  return { value: -5, label: "ঋণাত্মক সংখ্যা" };
}

/* =====================================================================
   ৪) বুলিয়ান এলজেবরা / লজিক পাতা
   ===================================================================== */
const BN = "০১২৩৪৫৬৭৮৯";
const bn = (x) => String(x).replace(/\d/g, (d) => BN[d]);
const LETTERS = ["A", "B", "C", "D"];
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = ri(0, i); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const litS = (l) => l.v + (l.n ? "'" : "");
const lit = (v, n = chance(0.4)) => ({ v, n });
const prod = (t) => t.map(litS).join("·");
const sopStr = (terms) => terms.map(prod).join(" + ");
const posStr = (terms) => terms.map((t) => (t.length > 1 ? `(${t.map(litS).join(" + ")})` : litS(t[0]))).join("·");
const sub = (a, b) => a.every((l) => b.some((m) => m.v === l.v && m.n === l.n)); // a ⊆ b

function randTerm(vars, k) {
  return shuffle(vars).slice(0, k).sort().map((v) => lit(v));
}
/* count টি পদ/উৎপাদক; প্রতিটিতে minK–maxK টি লিটারাল; সব চলক কোথাও না কোথাও থাকবে;
   একটি অন্যটির অংশ বা সমান নয়; একলিটারাল পদ সর্বোচ্চ maxSingles টি; পদগুলো গুছিয়ে সাজানো */
const termKey = (t) => t.map((l) => l.v).join("") + t.map((l) => +l.n).join("");
function genTerms(vars, count, minK, maxK, maxSingles = 1) {
  const singles = vars.length === 2 ? Math.max(maxSingles, 2) : maxSingles;
  for (let t = 0; t < 120; t++) {
    const terms = Array.from({ length: count }, () => randTerm(vars, ri(minK, Math.min(maxK, vars.length))));
    if (!vars.every((v) => terms.some((x) => x.some((l) => l.v === v)))) continue;
    if (!terms.every((a, i) => terms.every((b, j) => i === j || !sub(a, b)))) continue;
    if (terms.filter((x) => x.length === 1).length > singles) continue;
    return terms.sort((a, b) => (termKey(a) < termKey(b) ? -1 : 1));
  }
  return null;
}
const termCount = (n) => (n === 2 ? ri(2, 3) : n === 3 ? ri(2, 4) : ri(3, 4));

const EXPR_KINDS = [
  { id: "sop", w: 24, min: 2, label: "SOP আকার", make: (V, n) => { const t = genTerms(V, termCount(n), 1, n); return t && sopStr(t); } },
  { id: "pos", w: 16, min: 2, label: "POS আকার", make: (V, n) => { const t = genTerms(V, termCount(n), 1, n); return t && posStr(t); } },
  { id: "red", w: 16, min: 2, label: "সরলীকরণযোগ্য (শোষণ / অপ্রয়োজনীয়তা)", make: (V, n) => {
    const base = genTerms(V, Math.max(2, termCount(n) - 1), 1, Math.max(1, n - 1));
    if (!base) return null;
    if (chance(0.5)) { // শোষণ: t + t·x
      const t = base[ri(0, base.length - 1)];
      const free = V.filter((v) => !t.some((l) => l.v === v));
      if (free.length) { const extra = [...t, lit(pick(free))].sort((a, b) => (a.v < b.v ? -1 : 1)); return sopStr([...base, extra]); }
    }
    // অপ্রয়োজনীয়তা: u + u'·w
    const v = pick(V), w = pick(V.filter((x) => x !== v)), u = lit(v);
    const terms = [[u], [{ v, n: !u.n }, lit(w)]];
    const rest = V.filter((x) => x !== v && x !== w);
    if (rest.length) terms.push([lit(pick([v, w])), ...rest.map((x) => lit(x))].sort((a, b) => (a.v < b.v ? -1 : 1)));
    return sopStr(terms);
  } },
  { id: "cons", w: 8, min: 3, label: "কনসেনসাস (AB + A'C + BC)", make: (V, n) => {
    const [x, ...others] = shuffle(V);
    const cut = ri(1, others.length - 1);
    const Y = others.slice(0, cut).sort().map((v) => lit(v)), Z = others.slice(cut).sort().map((v) => lit(v));
    const s = (a) => a.sort((p, q) => (p.v < q.v ? -1 : 1));
    const xl = lit(x);
    return sopStr([s([xl, ...Y]), s([{ v: x, n: !xl.n }, ...Z]), s([...Y, ...Z])]);
  } },
  { id: "dm", w: 14, min: 2, label: "ডি-মরগান (NOT সহ)", make: (V, n) => {
    if (chance(0.5)) { const t = genTerms(V, ri(2, Math.min(3, n)), 1, n); return t && `(${chance(0.5) ? sopStr(t) : posStr(t)})'`; }
    const t = genTerms(V, termCount(n), 1, n);
    if (!t) return null;
    const cand = t.map((x, i) => i).filter((i) => t[i].length >= 2);
    if (!cand.length) return null;
    const k = pick(cand);
    return t.map((x, i) => (i === k ? `(${x.slice(0, 2).map(litS).join("·")})'${x.length > 2 ? "·" + prod(x.slice(2)) : ""}` : prod(x))).join(" + ");
  } },
  { id: "xor", w: 8, min: 2, label: "XOR যুক্ত", make: (V, n) => {
    const x = (i) => litS(lit(V[i - 1], chance(0.3)));
    const T = {
      2: [() => `${x(1)} ⊕ ${x(2)}`],
      3: [() => `${x(1)} ⊕ ${x(2)} ⊕ ${x(3)}`, () => `(${x(1)} ⊕ ${x(2)})·${x(3)}`, () => `${x(1)} ⊕ (${x(2)}·${x(3)})`, () => `(${x(1)} ⊕ ${x(2)}) + ${x(3)}`],
      4: [() => `${x(1)} ⊕ ${x(2)} ⊕ ${x(3)} ⊕ ${x(4)}`, () => `(${x(1)} ⊕ ${x(2)})·(${x(3)} ⊕ ${x(4)})`, () => `(${x(1)} ⊕ ${x(2)}) + ${x(3)}·${x(4)}`, () => `(${x(1)} ⊕ ${x(2)} ⊕ ${x(3)})·${x(4)}`],
    };
    return pick(T[n])();
  } },
  { id: "fac", w: 14, min: 3, label: "ফ্যাক্টর করা / বন্ধনীযুক্ত রূপ", make: (V, n) => {
    const sh = shuffle(V);
    const cn = n === 4 && chance(0.4) ? 2 : 1;
    const C = sh.slice(0, cn).sort().map((v) => lit(v));
    const rest = sh.slice(cn).sort();
    const R = genTerms(rest, 2, 1, rest.length);
    if (!R) return null;
    return `${prod(C)}·(${sopStr(R)})`;
  } },
];

const lastExpr = { src: null, key: null };

/* যেকোনো বুলিয়ান রাশি (২, ৩ বা ৪ চলক): { title, label } */
export function genExprExample() {
  for (let t = 0; t < 60; t++) {
    const n = wpick([[2, 25], [3, 45], [4, 30]]);
    const V = LETTERS.slice(0, n);
    const kind = wpick(EXPR_KINDS.filter((k) => k.min <= n).map((k) => [k, k.w]));
    let src;
    try { src = kind.make(V, n); } catch { src = null; }
    if (!src) continue;
    const r = parseExpr(src, 4);
    if (!r.ok || r.vars.length !== n) continue;
    const tb = tableOf(r.ast, r.vars);
    if (tb.every((x) => x === tb[0])) continue; // ধ্রুবক (সবসময় 0 বা 1) হলে বাদ
    const key = `${n}${kind.id}`;
    if (src === lastExpr.src || (key === lastExpr.key && t < 25)) continue;
    lastExpr.src = src; lastExpr.key = key;
    return { title: src, label: `${bn(n)} চলক · ${kind.label}` };
  }
  return { title: "A·B + A'·C", label: "৩ চলক · SOP আকার" };
}

/* SOP/POS → আদর্শ রূপ পাতা: mode = "sop" | "pos" */
const lastForm = {};
export function genFormExprExample(mode) {
  const sop = mode === "sop";
  for (let t = 0; t < 60; t++) {
    const n = wpick([[2, 20], [3, 50], [4, 30]]);
    const V = LETTERS.slice(0, n);
    const full = chance(0.12);
    const terms = genTerms(V, termCount(n), full ? n : 1, full ? n : Math.max(1, n === 2 ? 2 : n - 1));
    if (!terms) continue;
    if (!full && !terms.some((x) => x.length < n)) continue;
    const src = sop ? sopStr(terms) : posStr(terms);
    const r = parseExpr(src, 4);
    if (!r.ok || r.vars.length !== n) continue;
    const tb = tableOf(r.ast, r.vars);
    if (tb.every((x) => x === tb[0])) continue; // সবসময় 0 বা 1 হলে বাদ
    const missing = terms.filter((x) => x.length < n).length;
    if (src === lastForm[mode]) continue;
    lastForm[mode] = src;
    return { title: src, label: `${bn(n)} চলক · ${missing ? `${bn(missing)}টি পদে অনুপস্থিত চলক` : "সব পদে সব চলক আছে"}` };
  }
  return { title: sop ? "A + B·C" : "(A + B)·(A' + C)", label: "৩ চলক" };
}

/* সত্যক সারণী থেকে SOP/POS পাতা: n চলকের জন্য F=1 সারির তালিকা (ones) */
const popcount = (k) => k.toString(2).split("").filter((c) => c === "1").length;
const lastTT = {};
export function genTruthExample(n, mode = "sop") {
  const N = 1 << n;
  const kinds = [
    ["random", 28, "এলোমেলো সারণী"],
    ["cubes", 30, "গুচ্ছ আকারের (সরলীকরণযোগ্য)"],
    ["parity", 8, "প্যারিটি"],
    ["majority", n >= 3 ? 8 : 0, "সংখ্যাগরিষ্ঠ"],
    ["sparse", 12, "অল্প কয়েকটি সারি"],
    ["dense", 8, "প্রায় সব সারি"],
  ].filter((k) => k[1] > 0);
  for (let t = 0; t < 40; t++) {
    const [id, , name] = wpick(kinds.map((k) => [k, k[1]]));
    const g = Array(N).fill(0);
    if (id === "random") { const p = pick([0.25, 0.4, 0.5, 0.6]); for (let k = 0; k < N; k++) g[k] = chance(p) ? 1 : 0; }
    else if (id === "cubes") {
      const c = ri(1, n === 2 ? 2 : 3);
      for (let i = 0; i < c; i++) {
        const free = ri(0, Math.min(n - 1, 2)); // মুক্ত চলকের সংখ্যা: গুচ্ছের আকার 2^free
        const freeIdx = shuffle([...Array(n).keys()]).slice(0, free);
        const base = ri(0, N - 1);
        for (let k = 0; k < N; k++) if ([...Array(n).keys()].every((b) => freeIdx.includes(b) || ((k >> b) & 1) === ((base >> b) & 1))) g[k] = 1;
      }
    } else if (id === "parity") { const odd = chance(0.5); for (let k = 0; k < N; k++) g[k] = popcount(k) % 2 === (odd ? 1 : 0) ? 1 : 0; }
    else if (id === "majority") { for (let k = 0; k < N; k++) g[k] = popcount(k) >= Math.floor(n / 2) + 1 ? 1 : 0; }
    else if (id === "sparse") { const c = ri(1, 2); for (let i = 0; i < c; i++) g[ri(0, N - 1)] = 1; }
    else { g.fill(1); const c = ri(1, 2); for (let i = 0; i < c; i++) g[ri(0, N - 1)] = 0; }
    const ones = [];
    for (let k = 0; k < N; k++) if ((mode === "pos" ? 1 - g[k] : g[k]) === 1) ones.push(k);
    if (ones.length === 0 || ones.length === N) continue; // ধ্রুবক ফাংশন নয়
    const key = ones.join(",");
    if (key === lastTT[`${n}${mode}`]) continue;
    lastTT[`${n}${mode}`] = key;
    return { ones, label: `${bn(n)} চলক · ${name}` };
  }
  return { ones: n === 2 ? [1, 2] : [3, 5, 6, 7], label: `${bn(n)} চলক` };
}
