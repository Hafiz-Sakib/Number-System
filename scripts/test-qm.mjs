/* qmTrace: প্রাইম ইমপ্লিক্যান্ট ও বাছাই করা পদ minimize() এর সাথে মেলে কিনা */
import { minimize, parseExpr, qmTrace, simplify, sopString, tableOf, equivalent } from "../src/lib/logic.js";
let seed = 7; const rnd = (n) => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
let ok = 0, bad = 0;
for (let t = 0; t < 400; t++) {
  const n = 2 + rnd(3), vars = "ABCD".slice(0, n).split("");
  const ms = []; for (let i = 0; i < 1 << n; i++) if (rnd(2)) ms.push(i);
  const q = qmTrace(ms, n, vars);
  if (q.trivial) { (q.trivial === "1" ? ms.length === 1 << n : !ms.length) ? ok++ : bad++; continue; }
  const chosen = q.primes.filter((p) => p.chosen).map((p) => p.bits);
  const want = minimize(ms, n);
  const cov = new Set(q.primes.filter((p) => p.chosen).flatMap((p) => p.cover));
  const good = chosen.length === want.length && ms.every((m) => cov.has(m)) && q.sop === sopString(want, vars);
  good ? ok++ : (bad++, console.log("FAIL", ms, n));
}
const r = parseExpr("A·B + A·B' + A'·B"); const q = qmTrace(simplify(r.ast, r.vars).minterms, 2, r.vars);
console.log(q.sop, q.primes.map((p) => p.expr + ":" + p.cover));
console.log(`qm: ${ok} passed, ${bad} failed`); if (bad) process.exit(1);
