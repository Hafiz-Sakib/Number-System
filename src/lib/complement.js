import { normalize } from "./engine.js";

/* 1-এর ও 2-এর পরিপূরক (দশমিক বিন্দুসহ বাইনারি সংখ্যার জন্য) + n-বিট Negative সংখ্যা */
export const MAX_INT = 16, MAX_FRAC = 8;

export function parseBits(raw) {
  const s = normalize(raw).replace(/\s+/g, "");
  if (!s) return { ok: false, empty: true, msg: "একটি বাইনারি সংখ্যা লিখুন।" };
  if (/^[-−]/.test(s)) return { ok: false, msg: "পরিপূরক বের করতে Positive বাইনারি সংখ্যা দিন (Negative সংখ্যা নিচের অংশে আছে)।" };
  if (!/^[01]*\.?[01]*$/.test(s) || s === ".") return { ok: false, msg: "বাইনারিতে শুধু 0 আর 1 এবং একটি দশমিক বিন্দু (.) চলে।" };
  const [i = "", f = ""] = s.split(".");
  if (!i && !f) return { ok: false, msg: "একটি বাইনারি সংখ্যা লিখুন।" };
  if (i.length > MAX_INT) return { ok: false, msg: `পূর্ণ অংশে সর্বোচ্চ ${MAX_INT}টি বিট দিন।` };
  if (f.length > MAX_FRAC) return { ok: false, msg: `দশমিকের পরে সর্বোচ্চ ${MAX_FRAC}টি বিট দিন।` };
  return { ok: true, int: i || "0", frac: f };
}

const flip = (t) => [...t].map((c) => (c === "1" ? "0" : "1")).join("");
const val = (int, frac) => parseInt(int, 2) + [...frac].reduce((a, c, k) => a + (c === "1" ? 2 ** -(k + 1) : 0), 0);
const bin = (v, k, m) => { // v ≥ 0, k পূর্ণ বিট, m দশমিক বিট
  const scaled = Math.round(v * 2 ** m);
  const t = scaled.toString(2).padStart(k + m, "0");
  return m ? `${t.slice(0, k)}.${t.slice(k)}` : t;
};
const dec = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(8)));

/** সব বিট একসাথে (দশমিক বিন্দু বাদ দিয়ে) → 1's, 2's, ক্যারি */
export function complements(int, frac) {
  const all = int + frac;
  const ones = flip(all);
  const carries = Array(all.length).fill(0); // carries[k] = k-তম বিটে ঢোকা ক্যারি
  const out = [...ones];
  let c = 1;
  for (let k = all.length - 1; k >= 0; k--) {
    carries[k] = c;
    const s = +out[k] + c;
    out[k] = String(s % 2);
    c = s > 1 ? 1 : 0;
  }
  const split = (t) => ({ int: t.slice(0, int.length), frac: t.slice(int.length) });
  return { all, ones: split(ones), twos: split(out.join("")), carries, carryOut: c, allZero: !all.includes("1") };
}

const dot = (i, f) => (f ? `${i}.${f}` : i);
const cells = (i, f) => [...i, ...(f ? [".", ...f] : [])];

/** ধাপে ধাপে সমাধান (Steps.jsx এর ব্লকে) */
export function complementBlocks(int, frac) {
  const r = complements(int, frac);
  const X = dot(int, frac), O = dot(r.ones.int, r.ones.frac), T = dot(r.twos.int, r.twos.frac);
  const k = int.length, m = frac.length;
  const blocks = [];
  blocks.push({ t: "p", text: `সংখ্যাটি {{${X}|2}}। পূর্ণ অংশে **${k}** বিট${m ? `, দশমিকের পরে **${m}** বিট` : ""}।` });
  blocks.push({ t: "h", text: "ধাপ 1: 1-এর পরিপূরক (প্রতিটি বিট উল্টাই)" });
  blocks.push({ t: "p", text: "0 কে 1 এবং 1 কে 0 করি। দশমিক বিন্দু যেখানে ছিল সেখানেই থাকে।" });
  blocks.push({ t: "cols", rows: [{ label: "সংখ্যা", cells: cells(int, frac) }, { kind: "sep" }, { label: "উল্টে", kind: "res", cells: cells(r.ones.int, r.ones.frac) }] });
  blocks.push({ t: "box", text: `{{${X}|2}} এর 1-এর পরিপূরক = {{${O}|2}}` });
  blocks.push({ t: "h", text: "ধাপ 2: 2-এর পরিপূরক (1-এর পরিপূরকের সবচেয়ে ডানের বিটে 1 যোগ)" });
  const lsb = `${m ? "দশমিকের পরের শেষ বিটে" : "শেষ বিটে"}`;
  blocks.push({ t: "p", text: `1-এর পরিপূরকের ${lsb} 1 যোগ করি। ক্যারি বামে চলে যায়।` });
  const plus = [...(int + frac)].map((_, j, a) => (j === a.length - 1 ? "1" : "0"));
  const plusCells = m ? [...plus.slice(0, k), ".", ...plus.slice(k)] : plus;
  // ক্যারি সারিতে শুধু সত্যিকারের ক্যারি (শেষ বিটে যোগ হওয়া 1 বাদে) দেখাই: ক্যারি আউট হয় ডান থেকে বামে
  const carryRow = (() => {
    const all = r.all.length, arr = Array(all).fill("");
    let c = 1;
    const cur = [...flip(r.all)];
    for (let q = all - 1; q >= 0; q--) { const s = +cur[q] + c; c = s > 1 ? 1 : 0; if (c && q > 0) arr[q - 1] = "1"; }
    return m ? [...arr.slice(0, k), "", ...arr.slice(k)] : arr;
  })();
  blocks.push({ t: "cols", rows: [{ label: "ক্যারি", kind: "carry", cells: carryRow }, { label: "1's", cells: cells(r.ones.int, r.ones.frac) }, { label: "+", cells: plusCells }, { kind: "sep" }, { label: "2's", kind: "res", cells: cells(r.twos.int, r.twos.frac) }] });
  if (r.carryOut) blocks.push({ t: "warn", text: "সবচেয়ে বামে যে বাড়তি ক্যারি এসেছে, সেটি ফেলে দিই; বিট সংখ্যা একই থাকে।" });
  blocks.push({ t: "box", text: `{{${X}|2}} এর 2-এর পরিপূরক = {{${T}|2}}` });
  // শর্টকাট
  const last1 = r.all.lastIndexOf("1");
  if (last1 >= 0) {
    const tail = r.all.slice(last1), head = r.all.slice(0, last1);
    blocks.push({ t: "h", text: "দ্রুত নিয়ম (শর্টকাট)" });
    blocks.push({ t: "p", text: `ডান দিক থেকে প্রথম **1** পর্যন্ত বিটগুলো যেমন আছে তেমন রাখি, তার বামের সব বিট উল্টে দিই (দশমিক বিন্দু বাদ দিয়ে ভাবি)।${head ? ` এখানে ডানের "${tail}" ঠিক থাকে, বামের "${head}" উল্টে "${flip(head)}" হয়।` : ` এখানে সবচেয়ে ডানের 1-ই প্রথম বিট, তাই কিছুই উল্টাতে হয় না।`}` });
  }
  // যাচাই
  const v = val(int, frac);
  const two = r.allZero ? 0 : 2 ** k - v;
  if (!r.allZero) blocks.push({ t: "p", text: `**যাচাই:** 2^[${k}] − ${dec(v)} = ${2 ** k} − ${dec(v)} = ${dec(two)} = {{${T}|2}}। (পূর্ণ অংশে ${k} বিট বলে 2^[${k}] থেকে বিয়োগ করেছি।)` });
  return blocks;
}

/** n-বিট Negative পূর্ণসংখ্যা: সাইন-ম্যাগনিটিউড, 1's, 2's */
export function signedForms(d, n) {
  const lim1 = 2 ** (n - 1) - 1, min2 = -(2 ** (n - 1));
  if (!Number.isInteger(d)) return { ok: false, msg: "এখানে পূর্ণসংখ্যা দিন (যেমন −5, 13)।" };
  if (d < min2 || d > lim1) return { ok: false, msg: `${n} বিটে −${2 ** (n - 1)} থেকে +${lim1} পর্যন্ত লেখা যায়।` };
  const mag = Math.abs(d).toString(2).padStart(n - 1, "0");
  const sm = (d < 0 ? "1" : "0") + mag;
  const pos = d >= 0;
  const ones = pos ? sm : flip(("0" + mag)); // 1's: মান Positive হলে একই, নইলে Positive রূপের উল্টো
  const twos = pos ? sm : ((2 ** n + d) >>> 0).toString(2).padStart(n, "0");
  return { ok: true, sm, ones: d === min2 ? null : ones, twos, mag, pos, d, n };
}

export function signedBlocks(f) {
  const { d, n, mag } = f;
  const b = [];
  if (f.pos) {
    b.push({ t: "p", text: `${d} Positive, তাই ${n} বিটে লিখি সামনে সাইন বিট **0** বসিয়ে: {{${f.sm}|2}}। Positive সংখ্যার তিন রূপই একই।` });
    return b;
  }
  const pm = (Math.abs(d)).toString(2).padStart(n, "0");
  b.push({ t: "p", text: `ধাপ 1: ${Math.abs(d)} কে ${n} বিটে বাইনারিতে লিখি: {{${pm}|2}}।` });
  b.push({ t: "p", text: `ধাপ 2 (সাইন-ম্যাগনিটিউড): সামনের সাইন বিট 1 করি: {{${f.sm}|2}}।` });
  if (f.ones) b.push({ t: "p", text: `ধাপ 3 (1's): {{${pm}|2}} এর সব বিট উল্টাই: {{${f.ones}|2}}।` });
  b.push({ t: "p", text: `${f.ones ? "ধাপ 4" : "ধাপ 3"} (2's): {{${pm}|2}} এর 1-এর পরিপূরক {{${flip(pm)}|2}} এর সাথে 1 যোগ করি = {{${f.twos}|2}}।` });
  return b;
}

/** n-বিট সব প্যাটার্নের তালিকা (n ≤ 4) */
export function signedTable(n = 4) {
  const rows = [];
  for (let p = 0; p < 2 ** n; p++) {
    const bits = p.toString(2).padStart(n, "0");
    const neg = bits[0] === "1";
    const rest = parseInt(bits.slice(1), 2);
    const sm = neg ? -rest : rest;
    const on = neg ? -parseInt(flip(bits.slice(1)), 2) : rest;
    const tw = neg ? p - 2 ** n : p;
    rows.push([bits, neg && rest === 0 ? "−0" : (sm > 0 ? "+" : "") + String(sm).replace("-", "−"), neg && on === 0 ? "−0" : (on > 0 ? "+" : "") + String(on).replace("-", "−"), (tw > 0 ? "+" : "") + String(tw).replace("-", "−")]);
  }
  return rows;
}
