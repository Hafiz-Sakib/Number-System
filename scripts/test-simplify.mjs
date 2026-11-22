/* ধাপে ধাপে সরলীকরণের পরীক্ষা: র‍্যান্ডম রাশিতে প্রতিটি ধাপ ও চূড়ান্ত ফল মূল রাশির সমতুল্য কিনা */
import { equivalent, parseExpr, simplifySteps, toStr } from "../src/lib/logic.js";

let seed = 12345;
const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
const V = ["A", "B", "C", "D"];
const gen = (d) => {
  if (d === 0 || rnd(5) === 0) return V[rnd(4)] + (rnd(3) === 0 ? "'" : "");
  const a = gen(d - 1), b = gen(d - 1);
  const op = [" + ", "·", " + ", "·", "⊕"][rnd(5)];
  const e = `(${a})${op}(${b})`;
  return rnd(6) === 0 ? `(${e})'` : e;
};
let pass = 0, fail = 0;
for (let i = 0; i < 600; i++) {
  const src = gen(1 + rnd(3));
  const r = parseExpr(src, 4);
  if (!r.ok) continue;
  const d = simplifySteps(r.ast, r.vars);
  let ok = equivalent(r.ast, d.final) && equivalent(r.ast, d.start);
  d.steps.forEach((s) => { if (!equivalent(r.ast, s.ast)) ok = false; });
  if (ok) pass++; else { fail++; console.log("FAIL", src, "→", toStr(d.final)); }
}
console.log(`simplify: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
