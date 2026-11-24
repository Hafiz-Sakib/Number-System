/* SOP/POS: আদর্শ ও সরল রূপ সবসময় মূল ফাংশনের সাথে মেলে কিনা; রাশি-বিস্তার সঠিক কিনা */
import { parseExpr, tableOf } from "../src/lib/logic.js";
import { analyse, expandForm, evalTerm, minterm, maxterm } from "../src/lib/forms.js";
let seed = 11; const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
let ok = 0, bad = 0;
const chk = (c, m) => (c ? ok++ : (bad++, console.log("FAIL", m)));
for (let t = 0; t < 600; t++) {
  const n = 2 + rnd(3), vars = "ABCD".slice(0, n).split("");
  const F = Array.from({ length: 1 << n }, () => rnd(2));
  const a = analyse(F, vars);
  for (const k of ["sopCanon", "posCanon", "sopMin", "posMin"]) {
    const p = parseExpr(a[k]);
    chk(p.ok && tableOf(p.ast, vars).every((x, i) => x === F[i]), `${k} ${F} -> ${a[k]}`);
  }
  // F' = compSop
  const c = parseExpr(a.compSop);
  chk(c.ok && tableOf(c.ast, vars).every((x, i) => x === 1 - F[i]), `comp ${F}`);
  // মিনটার্ম/ম্যাক্সটার্ম ঠিক একটি সারিতে 1/0
  for (let k = 0; k < 1 << n; k++) for (const mode of ["sop", "pos"]) {
    const e = evalTerm(k, 0, vars, mode); void e;
    const want = mode === "sop" ? 1 : 0;
    const only = Array.from({ length: 1 << n }, (_, r) => evalTerm(k, r, vars, mode).res).map((v, r) => (v === want ? r : -1)).filter((r) => r >= 0);
    chk(only.length === 1 && only[0] === k, `term ${mode} ${k}`);
  }
}
// রাশি বিস্তার
const s = parseExpr("A + B·C"); const e = expandForm(s.ast, s.vars, "sop");
chk(e.valid && e.rows.join() === "3,4,5,6,7", "A+BC rows " + e.rows);
const p = parseExpr("(A + B)·(A' + C)"); const f = expandForm(p.ast, p.vars, "pos");
chk(f.valid && f.rows.join() === "0,1,4,6", "pos rows " + f.rows);
chk(!expandForm(parseExpr("A·(B + C)").ast, ["A", "B", "C"], "sop").valid, "non-sop invalid");
chk(minterm(3, ["A", "B", "C"]) === "A'·B·C" && maxterm(3, ["A", "B", "C"]) === "(A + B' + C')", "terms");
console.log(`forms: ${ok} passed, ${bad} failed`); if (bad) process.exit(1);
