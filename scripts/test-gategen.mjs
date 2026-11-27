/* লজিক গেট পাতার জেনারেটর: মান বৈধ, বর্তমান থেকে ভিন্ন, আর লেবেল আসল মানের সাথে মেলে কিনা */
import { genGateInputs, genRippleExample } from "../src/lib/exampleGen.js";
let ok = 0, bad = 0;
const chk = (c, m) => (c ? ok++ : (bad++, console.log("FAIL", m)));
const val = (b) => b.reduce((s, x) => (s << 1) | x, 0);

for (const [ids, radio] of [[["A"], false], [["A", "B"], false], [["A", "B", "C"], false], [["A", "B", "C", "D"], false], [Array.from({ length: 8 }, (_, i) => `D${i}`), true], [["SI"], false]]) {
  let cur = Object.fromEntries(ids.map((i) => [i, 0]));
  const seen = new Set();
  for (let t = 0; t < 600; t++) {
    const ex = genGateInputs(ids, { radio, cur });
    const bits = ids.map((i) => ex.values[i]);
    chk(ids.every((i) => ex.values[i] === 0 || ex.values[i] === 1), `bit ${ids}`);
    chk(bits.join("") !== ids.map((i) => cur[i]).join(""), `same as current ${ids} ${bits}`);
    if (radio) chk(bits.filter(Boolean).length <= 1, `radio ${bits}`);
    const ones = bits.filter(Boolean).length, n = bits.length;
    if (n > 1 && !radio) {
      if (ex.label === "সব ইনপুট 0") chk(ones === 0, "label all0");
      if (ex.label === "সব ইনপুট 1") chk(ones === n, "label all1");
      if (ex.label === "একটিমাত্র ইনপুট 1") chk(ones === 1 && n > 2, "label one1");
      if (ex.label === "একটিমাত্র ইনপুট 0") chk(ones === n - 1 && n > 2, "label one0");
      if (ex.label === "দুই ইনপুট ভিন্ন") chk(n === 2 && ones === 1, "label diff");
    }
    if (radio && ex.label === "কোনো ইনপুট সক্রিয় নয়") chk(ones === 0, "label none");
    seen.add(bits.join(""));
    cur = ex.values;
  }
  chk(seen.size === (radio ? ids.length + 1 : 1 << ids.length), `coverage ${ids.length}${radio ? "r" : ""}: ${seen.size}`);
}

const labels = new Set();
let cur = { a: [0, 0, 0, 0], b: [0, 0, 0, 0], cin: 0 };
for (let t = 0; t < 3000; t++) {
  const ex = genRippleExample(cur);
  const a = val(ex.a), b = val(ex.b), c = ex.cin, tot = a + b + c;
  chk(ex.a.length === 4 && ex.b.length === 4 && [...ex.a, ...ex.b].every((x) => x === 0 || x === 1) && (c === 0 || c === 1), "ripple range");
  chk(!(a === val(cur.a) && b === val(cur.b) && c === cur.cin), "ripple same as current");
  labels.add(ex.label);
  if (ex.label.startsWith("ওভারফ্লো")) chk(tot > 15, "ovf");
  if (ex.label.startsWith("সর্বোচ্চ")) chk(a === 15 && b === 15 && c === 1, "max");
  if (ex.label === "সব ইনপুট 0") chk(tot === 0, "allzero");
  if (ex.label === "কোনো ক্যারি হয় না") chk((a & b) === 0 && c === 0, "nocarry");
  if (ex.label.startsWith("A = B")) chk(a === b, "same");
  if (ex.label === "একটি সংখ্যা 0") chk((a === 0) !== (b === 0), "zero");
  if (ex.label === "শুধু Cin = 1") chk(a === 0 && b === 0 && c === 1, "cinonly");
  if (ex.label.startsWith("ক্যারি সব বিট")) { let k = c, run = 0, best = 0; for (let i = 0; i < 4; i++) { const x = (a >> i) & 1, y = (b >> i) & 1, co = (x & y) | (k & (x ^ y)); run = co ? run + 1 : 0; best = Math.max(best, run); k = co; } chk(best >= 4, `ripple chain ${a} ${b} ${c}`); }
  cur = ex;
}
chk(labels.size === 9, `ripple kinds ${labels.size}`);
console.log(`gategen: ${ok} passed, ${bad} failed`); if (bad) process.exit(1);
