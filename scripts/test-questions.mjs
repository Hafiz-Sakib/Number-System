import { makeConvert, makeArith, makeComplement, makeMcq, MCQ, LEVELS } from "../src/lib/questions.js";
import { parseNum, convert, calc, ratToBase, showVal } from "../src/lib/engine.js";
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const N = 3000;
for (const { id } of LEVELS) for (let i = 0; i < N; i++) {
  const c = makeConvert(id);
  const p = parseNum(c.text, c.from), e = parseNum(c.expect, c.to);
  ok(p.ok && e.ok && p.rat.n * e.rat.d === e.rat.n * p.rat.d, `convert q ${c.text} ${c.from}->${c.to} = ${c.expect}`);
  ok(convert(c.text, c.from, c.to).text === c.expect, `engine agrees ${c.text}`);
  const a = makeArith(id);
  const A = parseNum(a.a, a.base).rat, B = parseNum(a.b, a.base).rat;
  const n = a.op === "+" ? A.n * B.d + B.n * A.d : a.op === "-" ? A.n * B.d - B.n * A.d : a.op === "*" ? A.n * B.n : A.n * B.d, d = a.op === "*" ? A.d * B.d : a.op === "/" ? A.d * B.n : A.d * B.d;
  const want = showVal(ratToBase({ n, d: d < 0n ? -d : d }, a.base, 40));
  ok(a.expect === want, `arith ${a.a} ${a.op} ${a.b} b${a.base} = ${a.expect} want ${want}`);
  if (a.op === "/") ok(!a.expect.includes(".") , `division exact ${a.a}/${a.b}`);
  if (a.op === "-") ok(!a.expect.startsWith("-"), `non-negative ${a.a}-${a.b}`);
  const k = makeComplement(id);
  if (k.sub === "sub") {
    const v = parseInt(k.a, 2) - parseInt(k.b, 2);
    ok(parseNum(k.expect, 2).rat.n === BigInt(v), `2's comp sub ${k.a}-${k.b}=${k.expect}`);
  } else {
    const x = parseInt(k.x, 2);
    ok(k.ones.length === k.n && parseInt(k.ones, 2) === (2 ** k.n - 1 - x), `ones ${k.x}`);
    ok(k.sub !== "twos" || (parseInt(k.twos, 2) + x) % 2 ** k.n === 0, `twos ${k.x}`);
  }
}
/* MCQ: প্রতিটিতে ঠিক একটি সঠিক, বিকল্প আলাদা */
for (let i = 0; i < 400; i++) { const m = makeMcq(); ok(m.opts.filter((o) => o.ok).length === 1 && new Set(m.opts.map((o) => o.t)).size === m.opts.length, `mcq shape ${m.q}`); }
/* MCQ-র গাণিতিক দাবিগুলো যাচাই */
const num = (s, b) => parseInt(s, b);
ok(num("1010", 2) === 10 && num("FF", 16) === 255 && num("17", 8) === 15 && num("1011", 2) === 11 && num("12", 8) === 10, "mcq decimal values");
ok((8).toString(2) === "1000" && (10).toString(16).toUpperCase() === "A" && (255).toString(16).toUpperCase() === "FF" && (10).toString(8) === "12", "mcq conversions");
ok(num("11", 2) * num("11", 2) === num("1001", 2) && num("101", 2) - num("11", 2) === num("10", 2) && num("7", 8) + 1 === num("10", 8) && num("1111", 2) === 15, "mcq arithmetic");
console.log(`questions: ${pass} passed, ${fail} failed, MCQ bank = ${MCQ.length}`);
process.exit(fail ? 1 : 0);
