/* কুইজের প্রশ্নভাণ্ডার: সংখ্যা পদ্ধতি, চার অপারেশন, পরিপূরক, লজিক গেট ও বুলিয়ান এলজেবরা।
   প্রতিটি প্রশ্ন: { c: বিষয়, q: প্রশ্ন, o: [সঠিক, ভুল, ভুল, ভুল], e: ব্যাখ্যা, s?: () => ধাপে ধাপে সমাধান (ব্লক), v?: যাচাইয়ের তথ্য }
   o এর প্রথমটিই সঠিক; দেখানোর সময় এলোমেলো হয়। সংখ্যার প্রশ্নগুলো নির্দিষ্ট seed দিয়ে তৈরি, তাই ভাণ্ডার সবসময় একই থাকে
   এবং প্রতিটির উত্তর ইঞ্জিন দিয়ে হিসাব করা (scripts/test-quizbank.mjs আবার যাচাই করে)। */
import { BASES, BASE_NAME, OPS, calc, calcMulti, convert, rat, ratToBase, showVal } from "./engine.js";
import { complementBlocks, complements, signedBlocks, signedForms } from "./complement.js";
import { GATE_FN, evalAst, parseExpr, tableOf } from "./logic.js";
import { MCQ as BASE_MCQ } from "./questions.js";

export const CATS = [
  { id: "conv", label: "রূপান্তর", bg: "bg-lilac", note: "বাইনারি, অক্টাল, ডেসিমাল, হেক্স" },
  { id: "add", label: "যোগ", bg: "bg-mint", note: "বাইনারি, অক্টাল, হেক্স" },
  { id: "sub", label: "বিয়োগ", bg: "bg-sky", note: "সরাসরি ও পরিপূরক দিয়ে" },
  { id: "mul", label: "গুণ", bg: "bg-peach", note: "বাইনারি, অক্টাল, হেক্স" },
  { id: "div", label: "ভাগ", bg: "bg-lemon", note: "বাইনারি, অক্টাল, হেক্স" },
  { id: "comp", label: "পরিপূরক", bg: "bg-lilac", note: "1's, 2's ও ঋণাত্মক সংখ্যা" },
  { id: "gate", label: "লজিক গেট", bg: "bg-mint", note: "গেট, অ্যাডার, এনকোডার, কাউন্টার" },
  { id: "bool", label: "বুলিয়ান এলজেবরা", bg: "bg-sky", note: "সূত্র, উপপাদ্য, সত্যক সারণী" },
  { id: "basic", label: "মৌলিক ধারণা", bg: "bg-peach", note: "বিট, বাইট, কোড" },
];

/* ---------- নির্দিষ্ট seed-এর র‍্যান্ডম ---------- */
let seed = 20261122;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (a) => a[Math.floor(rnd() * a.length)];
const shuf = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

const DIGITS = "0123456789ABCDEF";
const S = (r, b) => showVal(ratToBase(r, b, 30)).replace("-", "−");
const R = (n) => rat(BigInt(n));
const N = (s, b) => `{{${s}|${b}}}`;
const FR = [[1n, 2n], [1n, 4n], [3n, 4n], [1n, 8n], [3n, 8n], [5n, 8n], [7n, 8n]];
const withFrac = (n) => { const [a, d] = pick(FR); return rat(BigInt(n) * d + a, d); };
const norm = (s) => { const neg = /^[-−]/.test(s); const [i0, f0 = ""] = s.replace(/^[-−]/, "").split("."); const i = i0.replace(/^0+(?=.)/, ""); const f = f0.replace(/0+$/, ""); return (neg ? "−" : "") + i + (f ? "." + f : ""); };

/** একটি সঠিক উত্তরের পাশে আকর্ষণীয় ভুল উত্তর (একটি অঙ্ক বদল, জোড়া অদলবদল, উল্টানো, বিন্দু সরানো ইত্যাদি) */
function distract(ans, base, { fixed = false, extra = [] } = {}) {
  const neg = /^[−-]/.test(ans);
  const core = ans.replace(/^[−-]/, "");
  const ch = [...core];
  const pos = ch.map((c, i) => (c === "." ? -1 : i)).filter((i) => i >= 0);
  const val = (c) => DIGITS.indexOf(c);
  const pool = [...extra];
  const add = (s) => { if (s && !s.startsWith(".") && !s.endsWith(".") && [...s].every((c) => c === "." || (val(c) >= 0 && val(c) < base))) pool.push((neg ? "−" : "") + s); };
  for (const i of pos) for (const d of [1, -1]) { const v = val(ch[i]) + d; if (v >= 0 && v < base) { const c = [...ch]; c[i] = DIGITS[v]; add(c.join("")); } }
  for (let k = 0; k < 6; k++) { const c = [...ch]; c[pick(pos)] = DIGITS[ri(0, base - 1)]; add(c.join("")); }
  for (let k = 0; k + 1 < ch.length; k++) if (ch[k] !== "." && ch[k + 1] !== "." && ch[k] !== ch[k + 1]) { const c = [...ch]; [c[k], c[k + 1]] = [c[k + 1], c[k]]; add(c.join("")); }
  if (!fixed) {
    const [i, f] = core.split(".");
    const tail = f !== undefined ? "." + f : "";
    if (i.length > 1) { add([...i].reverse().join("") + tail); add(i.slice(0, -1) + tail); add(i.slice(0, -1) + "." + i.slice(-1) + (f || "")); }
    add(i + DIGITS[ri(0, base - 1)] + tail);
    if (f) add(i + f[0] + "." + f.slice(1));
  }
  const key = (s) => (fixed ? s : norm(s));
  const seen = new Set([key(ans)]);
  const out = [];
  for (const s0 of shuf(pool)) { const s = fixed ? s0 : norm(s0); if (!seen.has(key(s))) { seen.add(key(s)); out.push(s); if (out.length === 3) break; } }
  let guard = 0;
  while (out.length < 3 && guard++ < 200) { const s = [...ch].map((c) => (c === "." ? c : DIGITS[ri(0, base - 1)])).join(""); const t = (neg ? "−" : "") + s; if (!seen.has(key(t)) && !s.startsWith(".") && !s.endsWith(".")) { seen.add(key(t)); out.push(t); } }
  return out;
}

const raw = [];
const seenQ = new Set();
const push = (x) => { const k = x.c + "|" + x.q + "|" + x.o[0]; if (seenQ.has(k) || new Set(x.o).size !== x.o.length) return false; seenQ.add(k); raw.push(x); return true; };
/** সংখ্যা-উত্তরের প্রশ্ন: বিকল্প নিজেই তৈরি হয় */
const numQ = (c, q, ans, base, e, s, v, opt = {}) => push({ c, q, o: [N(ans, base), ...(opt.wrongs || distract(ans, base, opt)).map((w) => N(w, base))], e, s, v });

/* ---------- পুরনো ৩৬টি ---------- */
const BASE_CAT = ["basic", "basic", "basic", "basic", "add", "basic", "basic", "conv", "conv", "conv", "conv", "conv", "basic", "basic", "basic", "sub", "basic", "conv", "conv", "basic", "basic", "mul", "comp", "comp", "conv", "conv", "conv", "add", "conv", "add", "add", "conv", "sub", "basic", "conv", "conv"];
BASE_MCQ.forEach((m, i) => push({ c: BASE_CAT[i], q: m.q, o: m.o, e: m.e }));

/* ---------- রূপান্তর (72) ---------- */
const PAIRS = BASES.flatMap((f) => BASES.filter((t) => t !== f).map((t) => [f, t]));
const hint = (f, t, frac) => {
  if (f === 10) return `পূর্ণ অংশকে ${t} দিয়ে বারবার ভাগ করে ভাগশেষ নিচ থেকে উপরে সাজাই।${frac ? ` ভগ্নাংশকে বারবার ${t} দিয়ে গুণ করে পূর্ণ অংশগুলো উপর থেকে নিচে সাজাই।` : ""}`;
  if (t === 10) return `প্রতিটি অঙ্ককে তার স্থানীয় মান (${f}-এর ঘাত) দিয়ে গুণ করে যোগ করি।${f === 16 ? " (A–F = 10–15)" : ""}`;
  if (f === 2) return `দশমিক বিন্দু থেকে ${t === 8 ? 3 : 4} বিট করে গ্রুপ করে প্রতিটি গ্রুপকে একটি ${BASE_NAME[t]} অঙ্কে লিখি।`;
  if (t === 2) return `প্রতিটি ${BASE_NAME[f]} অঙ্ককে ${f === 8 ? 3 : 4} বিটে লিখি।`;
  return `সরাসরি নয়, বাইনারি হয়ে যাই: প্রতিটি ${BASE_NAME[f]} অঙ্ককে ${f === 8 ? 3 : 4} বিটে লিখে ${t === 8 ? 3 : 4} বিট করে গ্রুপ করি।`;
};
for (const [f, t] of PAIRS) {
  for (let k = 0; k < 6; k++) {
    const frac = k >= 3;
    for (let tries = 0; tries < 30; tries++) {
      const max = [40, 255, 1023][k % 3];
      const n = ri(f === 10 || t === 16 ? 12 : 5, max);
      const r = frac ? withFrac(n) : R(n);
      const x = S(r, f), y = S(r, t);
      if (x === y) continue;
      const q = [`${N(x, f)} এর ${BASE_NAME[t]} রূপ কোনটি?`, `${N(x, f)} কে ${BASE_NAME[t]}-এ রূপান্তর করলে কত হয়?`, `নিচের কোন ${BASE_NAME[t]} সংখ্যাটি ${N(x, f)} এর সমান?`][k % 3];
      if (numQ("conv", q, y, t, `${N(x, f)} = ${N(y, t)}। ${hint(f, t, frac)}`, () => convert(x, f, t).blocks, { k: "conv", x, f, t, y })) break;
    }
  }
}

/* ---------- যোগ, বিয়োগ, গুণ, ভাগ ---------- */
const arith = (c, base, op, ra, rb, opt = {}) => {
  const a = S(ra, base), b = S(rb, base);
  const r = calc(a, b, op, base, opt.method || "direct");
  if (!r.ok) return false;
  const ans = r.text.replace("-", "−");
  const da = S(ra, 10), db = S(rb, 10), dr = S(r.rat, 10);
  const sign = OPS[op].sign;
  const q = opt.q || `${N(a, base)} ${sign} ${N(b, base)} = কত?`;
  const e = `যাচাই: ${N(a, base)} = ${da}, ${N(b, base)} = ${db}। ${da} ${sign} ${db} = ${dr} = ${N(ans, base)}।${opt.note ? " " + opt.note : ""}`;
  return numQ(c, q, ans, base, e, () => calc(a, b, op, base, opt.method || "direct").blocks, { k: "arith", a, b, op, base, y: ans });
};
const gen = (n, f) => { let made = 0, guard = 0; while (made < n && guard++ < 500) if (f()) made++; };

/* যোগ (35) */
gen(10, () => arith("add", 2, "+", R(ri(5, 60)), R(ri(5, 60))));
gen(5, () => arith("add", 2, "+", withFrac(ri(2, 20)), withFrac(ri(2, 20))));
gen(8, () => arith("add", 8, "+", R(ri(20, 300)), R(ri(20, 300))));
gen(9, () => arith("add", 16, "+", R(ri(20, 900)), R(ri(20, 900))));
gen(3, () => {
  const xs = [ri(3, 30), ri(3, 30), ri(3, 30)];
  const raws = xs.map((x) => x.toString(2));
  const r = calcMulti(raws, 2);
  const ans = r.text;
  return numQ("add", `${raws.map((x) => N(x, 2)).join(" + ")} = কত?`, ans, 2, `যাচাই: ${xs.join(" + ")} = ${xs[0] + xs[1] + xs[2]} = ${N(ans, 2)}।`, () => calcMulti(raws, 2).blocks, { k: "multi", raws, y: ans });
});

/* বিয়োগ (33) */
const ordered = (lo, hi) => { let x = ri(lo, hi), y = ri(lo, hi); if (x < y) [x, y] = [y, x]; if (x === y) x += 3; return [x, y]; };
gen(10, () => { const [x, y] = ordered(8, 120); return arith("sub", 2, "-", R(x), R(y)); });
gen(4, () => { const [x, y] = ordered(4, 40); return arith("sub", 2, "-", withFrac(x), withFrac(y)); });
gen(6, () => { const [x, y] = ordered(20, 400); return arith("sub", 8, "-", R(x), R(y)); });
gen(6, () => { const [x, y] = ordered(30, 1000); return arith("sub", 16, "-", R(x), R(y)); });
gen(4, () => { const [x, y] = ordered(10, 120); return arith("sub", 2, "-", R(x), R(y), { method: "complement", q: `2-এর পরিপূরক পদ্ধতিতে ${N(x.toString(2), 2)} − ${N(y.toString(2), 2)} = কত?`, note: "(2-এর পরিপূরক দিয়ে করলেও একই ফল।)" }); });
gen(3, () => { const [x, y] = ordered(8, 100); return arith("sub", 2, "-", R(y), R(x), { q: `${N(y.toString(2), 2)} − ${N(x.toString(2), 2)} = কত? (ঋণাত্মক হতে পারে)` }); });

/* গুণ (23 + পুরনো 1) */
gen(9, () => arith("mul", 2, "*", R(ri(3, 31)), R(ri(2, 15))));
gen(3, () => arith("mul", 2, "*", withFrac(ri(1, 6)), withFrac(ri(1, 5))));
gen(5, () => arith("mul", 8, "*", R(ri(5, 60)), R(ri(3, 20))));
gen(6, () => arith("mul", 16, "*", R(ri(5, 80)), R(ri(3, 15))));

/* ভাগ (24) */
gen(9, () => { const y = ri(2, 12), k = ri(2, 20); return arith("div", 2, "/", R(y * k), R(y)); });
gen(6, () => { const y = ri(2, 12), k = ri(2, 25); return arith("div", 8, "/", R(y * k), R(y)); });
gen(6, () => { const y = ri(2, 15), k = ri(2, 40); return arith("div", 16, "/", R(y * k), R(y)); });
gen(3, () => { const y = pick([2, 4, 8]), x = ri(5, 60); return x % y ? arith("div", 2, "/", R(x), R(y)) : false; });

/* ---------- পরিপূরক ---------- */
const bit = (s, i) => s.slice(0, i) + (s[i] === "1" ? "0" : "1") + s.slice(i + 1);
const flipOne = (s) => { const idx = [...s].map((c, i) => (c === "." ? -1 : i)).filter((i) => i >= 0); return bit(s, pick(idx)); };
const uniq = (a, not) => [...new Set(a)].filter((x) => x !== not);
const fill = (ans, list) => { const w = uniq(list, ans); let g = 0; while (w.length < 3 && g++ < 50) { const c = flipOne(ans); if (c !== ans && !w.includes(c)) w.push(c); } return w.slice(0, 3); };
const pad = (n, w) => n.toString(2).padStart(w, "0");
const dotted = (i, f) => (f ? `${i}.${f}` : i);
gen(6, () => { const n = pick([4, 5, 6, 8]), x = pad(ri(1, 2 ** n - 2), n), c = complements(x, ""); return numQ("comp", `${N(x, 2)} এর 1-এর পরিপূরক কত?`, c.ones.int, 2, `প্রতিটি বিট উল্টাই: ${N(x, 2)} → ${N(c.ones.int, 2)}। (2-এর পরিপূরক হতো ${N(c.twos.int, 2)}।)`, () => complementBlocks(x, ""), { k: "ones", x, y: c.ones.int }, { fixed: true, wrongs: fill(c.ones.int, [c.twos.int, x, flipOne(c.ones.int), flipOne(c.ones.int)]) }); });
gen(6, () => { const n = pick([4, 5, 6, 8]), x = pad(ri(1, 2 ** n - 2), n), c = complements(x, ""); return numQ("comp", `${N(x, 2)} এর 2-এর পরিপূরক কত? (${n} বিটে)`, c.twos.int, 2, `1-এর পরিপূরক ${N(c.ones.int, 2)}, তার সাথে 1 যোগ করে ${N(c.twos.int, 2)}।`, () => complementBlocks(x, ""), { k: "twos", x, y: c.twos.int }, { fixed: true, wrongs: fill(c.twos.int, [c.ones.int, x, flipOne(c.twos.int), flipOne(c.twos.int)]) }); });
gen(3, () => { const i = pad(ri(1, 15), 4), f = pad(ri(1, 7), 3), c = complements(i, f); return numQ("comp", `${N(dotted(i, f), 2)} এর 1-এর পরিপূরক কত?`, dotted(c.ones.int, c.ones.frac), 2, `দশমিক বিন্দু যেখানে আছে সেখানেই রেখে প্রতিটি বিট উল্টাই: ${N(dotted(i, f), 2)} → ${N(dotted(c.ones.int, c.ones.frac), 2)}।`, () => complementBlocks(i, f), { k: "ones-f", i, f, y: dotted(c.ones.int, c.ones.frac) }, { fixed: true, wrongs: fill(dotted(c.ones.int, c.ones.frac), [dotted(c.twos.int, c.twos.frac), dotted(i, f), flipOne(dotted(c.ones.int, c.ones.frac))]) }); });
gen(4, () => { const i = pad(ri(1, 15), 4), f = pad(ri(1, 7), 3), c = complements(i, f); return numQ("comp", `${N(dotted(i, f), 2)} এর 2-এর পরিপূরক কত?`, dotted(c.twos.int, c.twos.frac), 2, `1-এর পরিপূরক ${N(dotted(c.ones.int, c.ones.frac), 2)}; শেষ বিটে 1 যোগ করে ${N(dotted(c.twos.int, c.twos.frac), 2)}।`, () => complementBlocks(i, f), { k: "twos-f", i, f, y: dotted(c.twos.int, c.twos.frac) }, { fixed: true, wrongs: fill(dotted(c.twos.int, c.twos.frac), [dotted(c.ones.int, c.ones.frac), dotted(i, f), flipOne(dotted(c.twos.int, c.twos.frac))]) }); });
gen(4, () => { const d = -ri(3, 100), n = 8, f = signedForms(d, n); return numQ("comp", `${d.toString().replace("-", "−")} কে 8 বিটের 2-এর পরিপূরক পদ্ধতিতে লিখলে কোনটি হয়?`, f.twos, 2, `${Math.abs(d)} = ${N(pad(Math.abs(d), 8), 2)}; এর 1-এর পরিপূরক ${N(f.ones, 2)}; তার সাথে 1 যোগ: ${N(f.twos, 2)}।`, () => signedBlocks(f), { k: "neg2", d, n, y: f.twos }, { fixed: true, wrongs: fill(f.twos, [f.sm, f.ones, flipOne(f.twos)]) }); });
gen(3, () => {
  const d = -ri(3, 100), f = signedForms(d, 8);
  const ans = String(d).replace("-", "−");
  const wrongs = [String(parseInt(f.twos, 2)), String(d + 1).replace("-", "−"), String(d - 1).replace("-", "−")];
  return push({ c: "comp", q: `${N(f.twos, 2)} এটি 8 বিটের 2-এর পরিপূরক সংখ্যা। এর ডেসিমাল মান কত?`, o: [ans, ...wrongs], e: `সাইন বিট 1, তাই ঋণাত্মক। 2-এর পরিপূরক নিলে মান ${N(pad(Math.abs(d), 8), 2)} = ${Math.abs(d)}। সংখ্যাটি ${ans}।`, s: () => signedBlocks(f), v: { k: "dec2", bits: f.twos, y: d } });
});
const H = (c, q, o, e) => push({ c, q, o, e });
H("comp", "n বিটের 2-এর পরিপূরক পদ্ধতিতে (সাইনসহ) সর্বোচ্চ ধনাত্মক মান কত?", ["2^[n−1] − 1", "2^[n] − 1", "2^[n−1]", "2^[n]"], "সবচেয়ে বামের বিট সাইন বিট, বাকি n−1 বিটে সর্বোচ্চ 2^[n−1] − 1।");
H("comp", "8 বিটের 2-এর পরিপূরক পদ্ধতিতে সবচেয়ে ছোট (সর্বনিম্ন) সংখ্যা কত?", ["−128", "−127", "−255", "−256"], "পরিসীমা −2^[7] থেকে 2^[7] − 1, অর্থাৎ −128 থেকে +127।");
H("comp", "কোন পদ্ধতিতে শূন্যের দুটি রূপ (+0 ও −0) থাকে?", ["1-এর পরিপূরক", "2-এর পরিপূরক", "দুটিতেই শূন্যের রূপ একটি", "কোনোটিতেই নেই"], "1-এর পরিপূরকে {{0000|2}} ও {{1111|2}} দুটোই শূন্য। 2-এর পরিপূরকে শূন্য কেবল {{0000|2}}।");
H("comp", "1-এর পরিপূরক পদ্ধতিতে বিয়োগে সবচেয়ে বামে ক্যারি এলে কী করা হয়?", ["ক্যারিটি সবচেয়ে ডানের বিটের সাথে যোগ করা হয়", "ক্যারিটি ফেলে দেওয়া হয়", "ফলের সামনে (−) চিহ্ন বসে", "আবার বিয়োগ করা হয়"], "একে end-around carry বলে। ক্যারিটি ডানের বিটে যোগ করলে ধনাত্মক ফল পাওয়া যায়।");
H("comp", "2-এর পরিপূরক পদ্ধতিতে বিয়োগে সবচেয়ে বামে ক্যারি এলে কী করা হয়?", ["ক্যারি ফেলে দিই, ফল ধনাত্মক", "ক্যারি ডানের বিটে যোগ করি", "ফল ঋণাত্মক ধরি", "আবার 1 যোগ করি"], "2-এর পরিপূরকে বাড়তি ক্যারি ফেলে দিই; যা থাকে সেটিই ধনাত্মক ফল।");
H("comp", "পরিপূরক পদ্ধতিতে বিয়োগে ক্যারি না এলে ফল কেমন হয়?", ["ঋণাত্মক; যোগফলের পরিপূরক নিয়ে (−) বসাই", "ধনাত্মক", "শূন্য", "ভুল হিসাব"], "ক্যারি না এলে A < B, তাই ফল ঋণাত্মক। যোগফলের আবার পরিপূরক নিয়ে সামনে (−) চিহ্ন দিই।");
H("comp", "2-এর পরিপূরক ও 1-এর পরিপূরকের সম্পর্ক কোনটি?", ["2-এর পরিপূরক = 1-এর পরিপূরক + 1", "2-এর পরিপূরক = 1-এর পরিপূরক − 1", "দুটি সবসময় সমান", "2-এর পরিপূরক = মূল সংখ্যা + 1"], "প্রথমে বিট উল্টে 1-এর পরিপূরক, তার সাথে 1 যোগ করলে 2-এর পরিপূরক।");

/* ---------- মৌলিক ধারণা ---------- */
H("basic", "1 নিবল (nibble) = কত বিট?", ["4", "8", "2", "16"], "অর্ধেক বাইট = **4** বিট। এক হেক্স অঙ্কও 4 বিট।");
H("basic", "অচিহ্নিত 8 বিটে সর্বোচ্চ ডেসিমাল মান কত?", ["255", "256", "127", "128"], "সবগুলো বিট 1 হলে {{11111111|2}} = 2^[8] − 1 = **255**।");
H("basic", "n সংখ্যক বিট দিয়ে সর্বোচ্চ কতটি ভিন্ন মান প্রকাশ করা যায়?", ["2^[n]", "2n", "n^[2]", "n + 1"], "প্রতিটি বিটে 2টি সম্ভাবনা, তাই n বিটে **2^[n]** টি।");
H("basic", "1 কিলোবাইট (KB) = কত বাইট (কম্পিউটার হিসাবে)?", ["1024", "1000", "512", "100"], "কম্পিউটারে 1 KB = 2^[10] = **1024** বাইট।");
H("basic", "কম্পিউটারে রঙের কোড #FF0000 এ FF এর ডেসিমাল মান কত?", ["255", "15", "256", "240"], "{{FF|16}} = 15×16 + 15 = **255**। (লাল রঙ সর্বোচ্চ।)");
H("basic", "বাইনারি সংখ্যার সবচেয়ে বামের বিটকে কী বলে?", ["MSB (সর্বোচ্চ মানের বিট)", "LSB (সর্বনিম্ন মানের বিট)", "সাইন বিট নয় কখনো", "প্যারিটি বিট"], "বামের বিটের স্থানীয় মান সবচেয়ে বেশি, তাই **MSB**। ডানের বিট **LSB**।");
H("basic", "ASCII কোডে বড় হাতের A এর ডেসিমাল মান কত?", ["65", "97", "48", "64"], "A = 65, B = 66 …; ছোট হাতের a = 97; অঙ্ক 0 = 48।");
H("basic", "BCD কোডে ডেসিমাল 29 কীভাবে লেখা হয়?", ["{{0010 1001|2}}", "{{11101|2}}", "{{0001 1101|2}}", "{{0010 0101|2}}"], "প্রতিটি ডেসিমাল অঙ্ক আলাদা 4 বিটে: 2 = 0010, 9 = 1001।");
H("basic", "কোন সংখ্যা পদ্ধতিতে একটি অঙ্ক সবচেয়ে কম বিটে প্রকাশ করা যায়?", ["বাইনারি (1 বিট)", "অক্টাল (3 বিট)", "ডেসিমাল (প্রায় 3.3 বিট)", "হেক্স (4 বিট)"], "বাইনারির একটি অঙ্কই এক বিট, তাই সবচেয়ে কম।");
H("basic", "সংখ্যা পদ্ধতির 'ভিত্তি' (base) বলতে কী বোঝায়?", ["ওই পদ্ধতিতে ব্যবহৃত মোট অঙ্কের (প্রতীকের) সংখ্যা", "সবচেয়ে বড় অঙ্ক", "সংখ্যার দৈর্ঘ্য", "দশমিক বিন্দুর অবস্থান"], "দশমিকে 10টি, বাইনারিতে 2টি অঙ্ক, তাই ভিত্তি যথাক্রমে 10 ও 2।");
H("basic", "অক্টাল সংখ্যা পদ্ধতি কী কাজে সুবিধাজনক?", ["বড় বাইনারি সংখ্যা সংক্ষেপে লিখতে", "দশমিক ভগ্নাংশ লিখতে", "বিয়োগ এড়াতে", "ASCII কোড বানাতে"], "3 বিট = 1 অক্টাল অঙ্ক, তাই লম্বা বাইনারি ছোট করে লেখা যায়।");

/* ---------- লজিক গেট ---------- */
const combos = (n) => Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1));
const lab = (bits) => bits.map((b, i) => `${"ABC"[i]} = ${b}`).join(", ");
const GATE_BN = { AND: "AND", OR: "OR", NAND: "NAND", NOR: "NOR", XOR: "XOR", XNOR: "XNOR" };
for (const g of ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"]) {
  for (const want of [1, 0]) {
    for (const n of [2, 3]) {
      if (n === 2 && (g === "XOR" || g === "XNOR")) continue; // দুই ইনপুটে একাধিক সঠিক
      const cs = combos(n), good = cs.filter((c) => GATE_FN[g](c) === want), bad = cs.filter((c) => GATE_FN[g](c) !== want);
      if (n === 2 && good.length !== 1) continue; // ঠিক একটি সঠিক বিকল্প চাই
      if (n === 3 && !(g === "XOR" || g === "XNOR" || g === "AND" || g === "NOR")) continue; // সংখ্যা সীমিত রাখি
      const ans = pick(good), wr = shuf(bad).slice(0, 3);
      if (wr.length < 3) continue;
      const e = `${g} গেটে প্রতিটি সংমিশ্রণ বসিয়ে দেখি: ${[ans, ...wr].map((c) => `${lab(c)} → Y = ${GATE_FN[g](c)}`).join("; ")}। তাই ${lab(ans)}।`;
      push({ c: "gate", q: `কোন ইনপুট সংমিশ্রণে ${n} ইনপুটের ${GATE_BN[g]} গেটের আউটপুট ${want} হয়?`, o: [lab(ans), ...wr.map(lab)], e, v: { k: "gate", g, want, ans, wr } });
    }
  }
}
H("gate", "কোন দুটি গেটকে 'সর্বজনীন গেট' (Universal Gate) বলা হয়?", ["NAND ও NOR", "AND ও OR", "XOR ও XNOR", "NOT ও AND"], "NAND ও NOR প্রতিটি একা দিয়েই AND, OR, NOT সহ যেকোনো লজিক সার্কিট বানানো যায়।");
H("gate", "AND গেটের আউটপুট কখন 1 হয়?", ["সব ইনপুট 1 হলে", "যেকোনো একটি ইনপুট 1 হলে", "সব ইনপুট 0 হলে", "ইনপুটগুলো ভিন্ন হলে"], "AND মানে গুণ: কেবল সব ইনপুট 1 হলে আউটপুট 1।");
H("gate", "OR গেটের আউটপুট কখন 0 হয়?", ["সব ইনপুট 0 হলে", "যেকোনো একটি ইনপুট 0 হলে", "সব ইনপুট 1 হলে", "কখনোই নয়"], "OR মানে যোগ: একটিও 1 থাকলে আউটপুট 1; কেবল সব ইনপুট 0 হলে 0।");
H("gate", "NAND গেটের আউটপুট কখন 0 হয়?", ["সব ইনপুট 1 হলে", "সব ইনপুট 0 হলে", "যেকোনো একটি ইনপুট 1 হলে", "ইনপুট ভিন্ন হলে"], "NAND = NOT AND। AND-এর আউটপুট 1 হলে (সব ইনপুট 1) NAND-এর আউটপুট 0।");
H("gate", "NOR গেটের আউটপুট কখন 1 হয়?", ["সব ইনপুট 0 হলে", "যেকোনো একটি ইনপুট 1 হলে", "সব ইনপুট 1 হলে", "ইনপুট ভিন্ন হলে"], "NOR = NOT OR। OR-এর আউটপুট 0 হলে (সব ইনপুট 0) NOR-এর আউটপুট 1।");
H("gate", "দুই ইনপুটের XOR গেটের আউটপুট কখন 1 হয়?", ["ইনপুট দুটি ভিন্ন হলে", "ইনপুট দুটি সমান হলে", "দুটিই 1 হলে", "দুটিই 0 হলে"], "XOR (Exclusive OR) অসমতা ধরে: A ≠ B হলে আউটপুট 1।");
H("gate", "দুই ইনপুটের XNOR গেটের আউটপুট কখন 1 হয়?", ["ইনপুট দুটি সমান হলে", "ইনপুট দুটি ভিন্ন হলে", "কেবল দুটিই 1 হলে", "কখনোই নয়"], "XNOR = NOT XOR; A = B হলে আউটপুট 1 (সমতা শনাক্তকারী)।");
H("gate", "কোন গেটকে সমতা শনাক্তকারী (equality detector) বলা হয়?", ["XNOR", "XOR", "NAND", "NOR"], "XNOR-এর আউটপুট 1 হয় ইনপুট দুটি সমান হলে।");
H("gate", "XOR গেটের বুলিয়ান রাশি কোনটি?", ["A'·B + A·B'", "A·B + A'·B'", "A + B", "(A + B)'"], "XOR = A ⊕ B = A'·B + A·B'। (A·B + A'·B' হলো XNOR।)");
H("gate", "XNOR গেটের বুলিয়ান রাশি কোনটি?", ["A·B + A'·B'", "A'·B + A·B'", "A·B", "A' + B'"], "XNOR = (A ⊕ B)' = A·B + A'·B'।");
H("gate", "NAND গেটের বুলিয়ান রাশি কোনটি?", ["(A·B)'", "A'·B'", "A·B'", "A + B"], "NAND মানে AND-এর পর NOT: Y = (A·B)' = A' + B'।");
H("gate", "NOR গেটের বুলিয়ান রাশি কোনটি?", ["(A + B)'", "A' + B'", "A·B", "A'·B"], "NOR মানে OR-এর পর NOT: Y = (A + B)' = A'·B'।");
H("gate", "একটি NAND গেট দিয়ে NOT গেট বানাতে কী করা হয়?", ["দুই ইনপুটে একই সিগন্যাল দিই", "একটি ইনপুট 0 রাখি", "আউটপুট ইনপুটে ফেরত দিই", "দুটি আউটপুট জুড়ে দিই"], "(A·A)' = A'। তাই দুই ইনপুট একসাথে জুড়লে NAND ইনভার্টারের মতো কাজ করে।");
H("gate", "NAND গেট দিয়ে AND গেট বানাতে ন্যূনতম কয়টি NAND লাগে?", ["2", "1", "3", "4"], "প্রথম NAND দিয়ে (A·B)', দ্বিতীয় NAND ইনভার্টার করে A·B। মোট **2**টি।");
H("gate", "NAND গেট দিয়ে OR গেট বানাতে ন্যূনতম কয়টি NAND লাগে?", ["3", "2", "4", "5"], "A' ও B' (2টি NAND ইনভার্টার), তারপর (A'·B')' = A + B (1টি NAND)। মোট **3**টি।");
H("gate", "NOR গেট দিয়ে OR গেট বানাতে ন্যূনতম কয়টি NOR লাগে?", ["2", "1", "3", "4"], "প্রথম NOR দিয়ে (A + B)', দ্বিতীয় NOR ইনভার্টার করে A + B। মোট **2**টি।");
H("gate", "NOR গেট দিয়ে AND গেট বানাতে ন্যূনতম কয়টি NOR লাগে?", ["3", "2", "4", "1"], "A' ও B' (2টি), তারপর (A' + B')' = A·B (1টি)। মোট **3**টি।");
H("gate", "দুই ইনপুটের NAND গেটের সত্যক সারণীতে কয়টি সারিতে আউটপুট 1?", ["3", "1", "2", "4"], "কেবল A = 1, B = 1 হলে আউটপুট 0; বাকি 3টি সারিতে 1।");
H("gate", "দুই ইনপুটের NOR গেটের সত্যক সারণীতে কয়টি সারিতে আউটপুট 1?", ["1", "3", "2", "4"], "কেবল A = 0, B = 0 হলে আউটপুট 1; বাকি 3টি সারিতে 0।");
H("gate", "দুই ইনপুটের XOR গেটের সত্যক সারণীতে কয়টি সারিতে আউটপুট 1?", ["2", "1", "3", "4"], "(0,1) ও (1,0) এই দুই সারিতে আউটপুট 1।");
H("gate", "AND গেটের একটি ইনপুটে সবসময় 0 দিলে আউটপুট কী হয়?", ["সবসময় 0", "সবসময় 1", "অন্য ইনপুটের সমান", "অন্য ইনপুটের বিপরীত"], "A·0 = 0, অন্য ইনপুট যা-ই হোক।");
H("gate", "OR গেটের একটি ইনপুটে সবসময় 1 দিলে আউটপুট কী হয়?", ["সবসময় 1", "সবসময় 0", "অন্য ইনপুটের সমান", "অন্য ইনপুটের বিপরীত"], "A + 1 = 1।");
H("gate", "XOR গেটের একটি ইনপুটে সবসময় 1 দিলে আউটপুট কী হয়?", ["অন্য ইনপুটের বিপরীত", "অন্য ইনপুটের সমান", "সবসময় 1", "সবসময় 0"], "A ⊕ 1 = A'। তাই XOR কে নিয়ন্ত্রিত ইনভার্টার হিসেবেও ব্যবহার করা যায়।");
H("gate", "XOR গেটের একটি ইনপুটে সবসময় 0 দিলে আউটপুট কী হয়?", ["অন্য ইনপুটের সমান", "অন্য ইনপুটের বিপরীত", "সবসময় 1", "সবসময় 0"], "A ⊕ 0 = A।");
H("gate", "লজিক গেটের প্রতীকে আউটপুটে ছোট বৃত্ত (bubble) কী বোঝায়?", ["আউটপুটের নেগেশন (উল্টানো)", "ইনপুট সংখ্যা বেশি", "শক্তির উৎস", "ক্লক সিগন্যাল"], "বৃত্ত মানে NOT। AND + বৃত্ত = NAND, OR + বৃত্ত = NOR।");
H("gate", "মৌলিক লজিক গেট কোনগুলো?", ["AND, OR, NOT", "NAND, NOR, XOR", "XOR, XNOR, NOT", "AND, NAND, NOR"], "অন্য সব গেট ও সার্কিট এই তিনটি দিয়েই বানানো যায়।");
H("gate", "n সংখ্যক ইনপুটের গেটের সত্যক সারণীতে সারি কয়টি?", ["2^[n]", "2n", "n^[2]", "n"], "প্রতিটি ইনপুটে 2টি সম্ভাবনা, তাই 2^[n] টি সংমিশ্রণ। 3 ইনপুটে 8টি।");
H("gate", "হাফ অ্যাডারের Sum আউটপুটের রাশি কোনটি?", ["A ⊕ B", "A·B", "A + B", "(A·B)'"], "দুই বিট যোগে যোগফল বিট = A ⊕ B।");
H("gate", "হাফ অ্যাডারের Carry আউটপুটের রাশি কোনটি?", ["A·B", "A ⊕ B", "A + B", "A' + B'"], "ক্যারি তখনই হয় যখন দুটি বিটই 1: Carry = A·B।");
H("gate", "একটি হাফ অ্যাডার বানাতে কোন কোন গেট লাগে?", ["একটি XOR ও একটি AND", "দুটি OR", "একটি NOT ও একটি OR", "একটি NAND ও একটি NOR"], "Sum = XOR গেট, Carry = AND গেট।");
H("gate", "ফুল অ্যাডারের ইনপুট ও আউটপুট সংখ্যা যথাক্রমে কত?", ["3 ও 2", "2 ও 2", "3 ও 3", "2 ও 3"], "ইনপুট A, B ও Cin (3টি); আউটপুট Sum ও Cout (2টি)।");
H("gate", "ফুল অ্যাডারের Sum আউটপুটের রাশি কোনটি?", ["A ⊕ B ⊕ Cin", "A·B·Cin", "A + B + Cin", "(A ⊕ B)·Cin"], "তিন বিটের যোগফল বিট তাদের XOR: Sum = A ⊕ B ⊕ Cin।");
H("gate", "ফুল অ্যাডারে A = 1, B = 1, Cin = 1 হলে আউটপুট কী?", ["Sum = 1, Cout = 1", "Sum = 0, Cout = 1", "Sum = 1, Cout = 0", "Sum = 0, Cout = 0"], "1 + 1 + 1 = 3 = {{11|2}}; তাই Sum = 1, Cout = 1।");
H("gate", "ফুল অ্যাডারে A = 1, B = 0, Cin = 1 হলে আউটপুট কী?", ["Sum = 0, Cout = 1", "Sum = 1, Cout = 1", "Sum = 1, Cout = 0", "Sum = 0, Cout = 0"], "1 + 0 + 1 = 2 = {{10|2}}; তাই Sum = 0, Cout = 1।");
H("gate", "একটি ফুল অ্যাডার বানাতে ন্যূনতম কী কী লাগে?", ["2টি হাফ অ্যাডার ও 1টি OR গেট", "1টি হাফ অ্যাডার ও 1টি AND গেট", "3টি হাফ অ্যাডার", "2টি OR ও 1টি NOT"], "প্রথম হাফ অ্যাডারে A, B; দ্বিতীয়টিতে তার Sum ও Cin; দুই Carry OR করলে Cout।");
H("gate", "3-to-8 ডিকোডারে ইনপুট ও আউটপুট লাইন যথাক্রমে কত?", ["3 ও 8", "8 ও 3", "3 ও 3", "2 ও 8"], "n ইনপুটের ডিকোডারে 2^[n] আউটপুট; n = 3 হলে 8।");
H("gate", "8-to-3 এনকোডারে ইনপুট ও আউটপুট লাইন যথাক্রমে কত?", ["8 ও 3", "3 ও 8", "8 ও 8", "3 ও 3"], "এনকোডারে 2^[n] ইনপুট লাইন থেকে n বিট বাইনারি কোড আসে।");
H("gate", "ডিকোডারের কাজ কোনটি?", ["বাইনারি কোড থেকে নির্দিষ্ট একটি আউটপুট লাইন সক্রিয় করা", "একাধিক লাইনকে বাইনারি কোডে বদলানো", "দুটি সংখ্যা যোগ করা", "তথ্য জমা রাখা"], "ডিকোডার n বিট কোড পেয়ে 2^[n] লাইনের একটি সক্রিয় করে।");
H("gate", "এনকোডারের কাজ কোনটি?", ["সক্রিয় ইনপুট লাইনকে বাইনারি কোডে বদলানো", "বাইনারি কোড থেকে একটি লাইন সক্রিয় করা", "দুটি বিট যোগ করা", "ক্লক বানানো"], "এনকোডার ডিকোডারের উল্টো: লাইনকে কোডে পরিণত করে।");
H("gate", "3-to-8 ডিকোডারে ইনপুট {{101|2}} হলে কোন আউটপুট লাইন সক্রিয় হয়?", ["D5", "D3", "D6", "D1"], "{{101|2}} = 5, তাই D5 সক্রিয়।");
H("gate", "4-to-2 এনকোডারে D2 সক্রিয় থাকলে আউটপুট (A1 A0) কত?", ["{{10|2}}", "{{01|2}}", "{{11|2}}", "{{00|2}}"], "লাইন নম্বর 2 = {{10|2}}।");
H("gate", "একটি ফ্লিপ-ফ্লপ কত বিট তথ্য জমা রাখতে পারে?", ["1 বিট", "2 বিট", "4 বিট", "8 বিট"], "ফ্লিপ-ফ্লপ একটি বাইস্টেবল ডিভাইস; দুটি অবস্থার একটিতে (0 বা 1) থাকে, তাই **1** বিট।");
H("gate", "4 বিটের একটি রেজিস্টার বানাতে কয়টি ফ্লিপ-ফ্লপ লাগে?", ["4", "2", "8", "16"], "প্রতি বিটের জন্য একটি ফ্লিপ-ফ্লপ।");
H("gate", "{{1100|2}} কে ডানে এক বিট শিফট করলে (সামনে 0 ঢুকিয়ে) কী হয়?", ["{{0110|2}}", "{{1001|2}}", "{{0011|2}}", "{{1000|2}}"], "প্রতিটি বিট এক ঘর ডানে সরে; সবচেয়ে ডানের 0 বেরিয়ে যায়, বামে 0 ঢোকে: 0110।");
H("gate", "3টি ফ্লিপ-ফ্লপের বাইনারি কাউন্টার সর্বোচ্চ কয়টি ভিন্ন অবস্থা গণনা করতে পারে?", ["8", "3", "6", "16"], "2^[3] = **8** টি অবস্থা (000 থেকে 111, অর্থাৎ 0 থেকে 7)।");
H("gate", "MOD-16 কাউন্টার বানাতে ন্যূনতম কয়টি ফ্লিপ-ফ্লপ লাগে?", ["4", "3", "8", "16"], "2^[4] = 16, তাই 4টি।");

/* ---------- বুলিয়ান এলজেবরা ---------- */
/* সরল রূপ: [রাশি, সরল রূপ, ভুল তিনটি] । test-quizbank.mjs প্রতিটির সমতুল্যতা সত্যক সারণী দিয়ে যাচাই করে */
const EQ = [
  ["A + A·B", "A", ["B", "A·B", "A + B"]],
  ["A·(A + B)", "A", ["B", "A + B", "A·B"]],
  ["A + A'·B", "A + B", ["A·B", "A'", "A' + B"]],
  ["A·B + A·B'", "A", ["B", "A'", "A + B"]],
  ["(A + B)·(A + B')", "A", ["B", "A + B", "A·B'"]],
  ["A·B + A'·B", "B", ["A", "A·B", "A + B"]],
  ["A + A'", "1", ["0", "A", "A'"]],
  ["A·A'", "0", ["1", "A", "A'"]],
  ["A·B + A·B·C", "A·B", ["A·B·C", "A + B", "B·C"]],
  ["(A + B)'", "A'·B'", ["A' + B'", "A·B", "A + B"]],
  ["(A·B)'", "A' + B'", ["A'·B'", "A + B", "A·B'"]],
  ["A·B' + A'", "A' + B'", ["A' + B", "A·B", "A'"]],
  ["A·B + A·B' + A'·B", "A + B", ["A·B", "A'·B + A·B'", "A' + B'"]],
  ["(A + B)·(A' + C)", "A·C + A'·B", ["A·B + A'·C", "A + B·C", "(A + C)·(A' + B)"]],
  ["A·B + A'·C + B·C", "A·B + A'·C", ["A·B + B·C", "A'·C + B·C", "A·B·C"]],
  ["A'·B' + A'·B", "A'", ["B'", "A'·B", "A' + B"]],
  ["A·B·C + A·B·C'", "A·B", ["A·C", "A·B·C", "B"]],
  ["(A + B)·(A + C)", "A + B·C", ["A·B + C", "A + B + C", "A·(B + C)"]],
  ["(A ⊕ B)'", "A·B + A'·B'", ["A'·B + A·B'", "A·B", "A + B"]],
  ["A + 1", "1", ["0", "A", "A'"]],
  ["A·1", "A", ["0", "1", "A'"]],
  ["A + 0", "A", ["0", "1", "A'"]],
  ["(A')'", "A", ["A'", "0", "1"]],
  ["A + A", "A", ["2A", "1", "0"]],
  ["A·A", "A", ["A²", "1", "0"]],
  ["(A·B + C)'", "(A' + B')·C'", ["A'·B' + C'", "A' + B' + C'", "A'·B'·C'"]],
  ["(A + B·C)'", "A'·(B' + C')", ["A'·B'·C'", "A' + B'·C'", "A' + B' + C'"]],
  ["(A' + B)'", "A·B'", ["A'·B", "A·B", "A'·B'"]],
  ["A·(A' + B)", "A·B", ["A", "B", "A + B"]],
  ["(A + B + C)'", "A'·B'·C'", ["A' + B' + C'", "A·B·C", "A'·B'·C"]],
  ["(A·B·C)'", "A' + B' + C'", ["A'·B'·C'", "A + B + C", "A' + B + C"]],
];
EQ.forEach(([a, b, w]) => push({ c: "bool", q: `বুলিয়ান রাশি ${a} এর সরল (সমতুল্য) রূপ কোনটি?`, o: [b, ...w], e: `${a} = ${b}। সত্যক সারণীতে সব সংমিশ্রণে দুই পাশের মান মেলে।`, v: { k: "eq", a, b, w } }));

/* রাশির মান: কোন সংমিশ্রণে F = v? */
const EVALS = ["A·B' + C", "(A + B)·C'", "A·B + A'·C", "(A ⊕ B)·C", "A'·B + A·B'", "(A + B')·(B + C)", "A·(B + C)'", "(A·B)' + C", "A + B·C'", "A·B·C' + A'·C"];
EVALS.forEach((src, i) => {
  const r = parseExpr(src), vars = r.vars, n = vars.length, want = i % 2;
  const all = combos(n).map((b) => ({ b, f: evalAst(r.ast, Object.fromEntries(vars.map((v, k) => [v, b[k]]))) }));
  const good = all.filter((x) => x.f === want), bad = all.filter((x) => x.f !== want);
  if (!good.length || bad.length < 3) return;
  const ans = pick(good), wr = shuf(bad).slice(0, 3);
  const L = (b) => b.map((x, k) => `${vars[k]} = ${x}`).join(", ");
  push({ c: "bool", q: `F = ${src} হলে কোন মানের জন্য F = ${want} হয়?`, o: [L(ans.b), ...wr.map((x) => L(x.b))], e: `প্রতিটি বিকল্পে মান বসাই: ${[ans, ...wr].map((x) => `${L(x.b)} → F = ${x.f}`).join("; ")}। তাই ${L(ans.b)}।`, v: { k: "eval", src, want, ans: ans.b, wr: wr.map((x) => x.b) } });
});

/* মিনটার্ম তালিকা (A সবচেয়ে বামের বিট) */
["A·B + A'·B'", "A'·B + A·B'", "A + B", "A·B·C", "A'·B'·C + A·B·C'"].forEach((src) => {
  const r = parseExpr(src), vars = r.vars, T = tableOf(r.ast, vars);
  const ms = T.map((f, k) => (f ? k : -1)).filter((k) => k >= 0), tot = T.length;
  const show = (a) => `Σm(${a.join(", ")})`;
  const set = new Set([show(ms)]);
  const opts = [show(ms)];
  let g = 0;
  while (opts.length < 4 && g++ < 100) {
    const a = [...ms];
    const m = ri(0, 2);
    if (m === 0) a.push(ri(0, tot - 1)); else if (m === 1 && a.length > 1) a.splice(ri(0, a.length - 1), 1); else a[ri(0, a.length - 1)] = ri(0, tot - 1);
    const s = show([...new Set(a)].sort((x, y) => x - y));
    if (!set.has(s) && a.length) { set.add(s); opts.push(s); }
  }
  if (opts.length === 4) push({ c: "bool", q: `F = ${src} এর মিনটার্ম তালিকা কোনটি? (${vars.join("")}; ${vars[0]} সবচেয়ে বামের বিট)`, o: opts, e: `যেসব সংমিশ্রণে F = 1 সেগুলোর দশমিক মান: ${ms.join(", ")}। তাই ${show(ms)}।`, v: { k: "min", src, ms } });
});

H("bool", "বুলিয়ান এলজেবরার উদ্ভাবক কে?", ["জর্জ বুল (George Boole)", "চার্লস ব্যাবেজ", "অগাস্টাস ডি মরগান", "ব্লেইজ পাসকাল"], "ইংরেজ গণিতবিদ জর্জ বুল ১৮৫৪ সালে লজিকের বীজগণিত প্রকাশ করেন।");
H("bool", "বুলিয়ান চলক কয়টি মান নিতে পারে?", ["2টি (0 ও 1)", "3টি", "10টি", "অসংখ্য"], "বুলিয়ান চলকের মান কেবল 0 (মিথ্যা/বন্ধ) বা 1 (সত্য/চালু)।");
H("bool", "ডি মরগানের প্রথম উপপাদ্য কোনটি?", ["(A + B)' = A'·B'", "(A + B)' = A' + B'", "(A·B)' = A'·B'", "(A + B)' = A·B"], "যোগের পরিপূরক = পরিপূরকগুলোর গুণ।");
H("bool", "ডি মরগানের দ্বিতীয় উপপাদ্য কোনটি?", ["(A·B)' = A' + B'", "(A·B)' = A'·B'", "(A·B)' = A + B", "(A·B)' = A·B'"], "গুণের পরিপূরক = পরিপূরকগুলোর যোগ।");
H("bool", "A + A·B = A কোন সূত্রের উদাহরণ?", ["শোষণ সূত্র (Absorption)", "বিনিময় সূত্র", "সংযোজন সূত্র", "ডি মরগান"], "A + A·B = A·(1 + B) = A·1 = A; B যোগ হয়েও A-তে শোষিত হয়েছে।");
H("bool", "A + (B + C) = (A + B) + C কোন সূত্র?", ["সহযোগ (Associative) সূত্র", "বিনিময় (Commutative) সূত্র", "বণ্টন (Distributive) সূত্র", "শোষণ সূত্র"], "বন্ধনী কোথায় বসছে তাতে ফল বদলায় না।");
H("bool", "A + B = B + A কোন সূত্র?", ["বিনিময় (Commutative) সূত্র", "সহযোগ সূত্র", "বণ্টন সূত্র", "শোষণ সূত্র"], "অপারেন্ডের ক্রম বদলালে ফল একই।");
H("bool", "A·(B + C) = A·B + A·C কোন সূত্র?", ["বণ্টন (Distributive) সূত্র", "সহযোগ সূত্র", "বিনিময় সূত্র", "শোষণ সূত্র"], "গুণ যোগের ওপর বণ্টিত হয়। বুলিয়ানে যোগও গুণের ওপর বণ্টিত: A + B·C = (A + B)·(A + C)।");
H("bool", "A + A' এর মান কত?", ["1", "0", "A", "A'"], "চলক ও তার পরিপূরকের OR সবসময় 1।");
H("bool", "A·A' এর মান কত?", ["0", "1", "A", "A'"], "চলক ও তার পরিপূরকের AND সবসময় 0।");
H("bool", "A + 0 = A এর দ্বৈত (dual) রাশি কোনটি?", ["A·1 = A", "A·0 = A", "A + 1 = A", "A·0 = 0"], "দ্বৈত রাশিতে + ও · এবং 0 ও 1 অদলবদল হয়।");
H("bool", "A + A' = 1 এর দ্বৈত (dual) রাশি কোনটি?", ["A·A' = 0", "A·A' = 1", "A + A' = 0", "A·A = 0"], "+ কে ·, 1 কে 0 করলে A·A' = 0।");
H("bool", "A·(B + C) এর দ্বৈত (dual) রাশি কোনটি?", ["A + B·C", "A + B + C", "A·B·C", "A·B + C"], "· ↔ + বদলালে A + (B·C)।");
H("bool", "SOP-এর পূর্ণরূপ কী?", ["Sum of Products (গুণফলের যোগ)", "Product of Sums (যোগফলের গুণ)", "Sum of Parts", "Single Output Port"], "যেমন A·B + A'·C হলো SOP।");
H("bool", "POS-এর পূর্ণরূপ কী?", ["Product of Sums (যোগফলের গুণ)", "Sum of Products", "Product of Signals", "Positive Output Signal"], "যেমন (A + B)·(A' + C) হলো POS।");
H("bool", "(A + B)·(A' + C) কোন রূপের উদাহরণ?", ["POS", "SOP", "মিনটার্ম", "কোনোটি নয়"], "যোগফলগুলোর গুণ, তাই Product of Sums।");
H("bool", "মিনটার্ম (minterm) কী?", ["সব চলকসহ একটি AND (গুণ) পদ, যার মান 1 হয়", "সব চলকসহ একটি OR (যোগ) পদ", "একটি চলকের পরিপূরক", "যেকোনো সরল রাশি"], "যেমন তিন চলকে A'·B·C একটি মিনটার্ম; এটি কেবল একটি সংমিশ্রণেই 1 দেয়।");
H("bool", "ম্যাক্সটার্ম (maxterm) কী?", ["সব চলকসহ একটি OR (যোগ) পদ, যার মান 0 হয়", "সব চলকসহ একটি AND পদ", "একটি চলকের মান", "সরলীকরণের শেষ ধাপ"], "যেমন A + B' + C একটি ম্যাক্সটার্ম; এটি কেবল একটি সংমিশ্রণেই 0 দেয়।");
H("bool", "তিন চলকের (A, B, C) মোট কয়টি মিনটার্ম থাকে?", ["8", "6", "3", "9"], "2^[3] = **8** টি (m0 থেকে m7)।");
H("bool", "চার চলকের মোট কয়টি মিনটার্ম থাকে?", ["16", "8", "4", "12"], "2^[4] = **16** টি।");
H("bool", "তিন চলকে A'·B·C মিনটার্মটি কত নম্বর?", ["m3", "m6", "m1", "m5"], "A'BC → {{011|2}} = 3, তাই m3।");
H("bool", "তিন চলকে A·B'·C মিনটার্মটি কত নম্বর?", ["m5", "m3", "m6", "m2"], "AB'C → {{101|2}} = 5, তাই m5।");
H("bool", "তিন চলকের m6 মিনটার্মের রাশি কোনটি?", ["A·B·C'", "A·B'·C", "A'·B·C", "A·B·C"], "6 = {{110|2}}: A = 1, B = 1, C = 0 তাই A·B·C'।");
H("bool", "তিন চলকের M0 ম্যাক্সটার্মের রাশি কোনটি?", ["A + B + C", "A' + B' + C'", "A·B·C", "A' + B + C"], "M0 এ সবগুলো বিট 0, তাই চলকগুলো স্বাভাবিক রূপে: A + B + C।");
H("bool", "তিন চলকের M5 ম্যাক্সটার্মের রাশি কোনটি?", ["A' + B + C'", "A + B' + C", "A' + B' + C", "A + B + C'"], "5 = {{101|2}}: 1 হলে চলকের পরিপূরক, 0 হলে স্বাভাবিক: A' + B + C'।");
H("bool", "n চলকের বুলিয়ান সত্যক সারণীতে সারি কয়টি?", ["2^[n]", "n^[2]", "2n", "n!"], "2 চলকে 4, 3 চলকে 8, 4 চলকে 16টি সারি।");
H("bool", "F = A + B এর সত্যক সারণীতে কয়টি সারিতে F = 0?", ["1", "2", "3", "4"], "কেবল A = 0, B = 0 হলে F = 0।");
H("bool", "F = A·B এর সত্যক সারণীতে কয়টি সারিতে F = 1?", ["1", "2", "3", "4"], "কেবল A = 1, B = 1 হলে F = 1।");
H("bool", "F = A ⊕ B এর সত্যক সারণীতে কয়টি সারিতে F = 1?", ["2", "1", "3", "4"], "(0,1) ও (1,0) এই দুই সারিতে।");
H("bool", "A + B·C রাশিতে কোন অপারেশন আগে হয়?", ["B·C (AND আগে)", "A + B (OR আগে)", "সবগুলো একসাথে", "বাম থেকে ডানে ক্রমানুসারে"], "অগ্রাধিকার: NOT, তারপর AND, তারপর OR।");
H("bool", "A·B + A'·C + B·C এ B·C পদটিকে কী বলে?", ["সংহতি পদ (Consensus term), বাদ দেওয়া যায়", "মিনটার্ম নয়", "মূল পদ", "পরিপূরক পদ"], "A·B + A'·C + B·C = A·B + A'·C; B·C পদটি বাড়তি।");
H("bool", "(A + B)' এর সমতুল্য গেট কোনটি?", ["NOR", "NAND", "XOR", "AND"], "NOR গেটের আউটপুট Y = (A + B)'।");
H("bool", "A' + B' এর সমতুল্য গেট কোনটি?", ["NAND", "NOR", "XNOR", "OR"], "A' + B' = (A·B)' যা NAND-এর রাশি।");
H("bool", "A'·B + A·B' কোন গেটের রাশি?", ["XOR", "XNOR", "NAND", "NOR"], "দুটি ভিন্ন হলে 1; এটি XOR।");
H("bool", "বুলিয়ান রাশি সরল করলে সার্কিটে কী সুবিধা হয়?", ["কম গেট লাগে, খরচ ও জটিলতা কমে", "গেট বেশি লাগে", "গতি কমে", "আউটপুট বদলে যায়"], "সরল রূপ একই আউটপুট দেয়, কিন্তু কম গেট দিয়ে।");

/* ---------- চূড়ান্ত ভাণ্ডার ---------- */
export const QUESTIONS = raw.map((x, i) => ({ ...x, id: i }));
export const CAT_COUNT = Object.fromEntries(CATS.map((c) => [c.id, QUESTIONS.filter((q) => q.c === c.id).length]));
export const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label]));
