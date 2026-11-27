/* উদাহরণ জেনারেটর
   ─────────────────────────────────────────────────────────────
   • আকার (অতি ছোট → অনেক বড়), দশমিকসহ/দশমিক ছাড়া, ঋণাত্মক — সব ধরনের বৈচিত্র্য আসে।
   • এজ কেস সামলানো আছে: শূন্য ভাজক, সব-শূন্য সংখ্যা, সমান সংখ্যার বিয়োগ, ভুল অঙ্ক ইত্যাদি কখনো আসে না।
   • নির্বাচিত পদ্ধতি/প্রক্রিয়া অনুযায়ী উদাহরণ তৈরি হয়, তাই ফল সবসময় বৈধ হয়।
   অন্য পাতার জন্য নতুন ফাংশন এই ফাইলেই যোগ করা যাবে। */

import { parseNum } from "./engine.js";

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
