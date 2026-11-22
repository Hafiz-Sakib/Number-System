import { GATE_FN, evalNet, truthRows, autoLayout, parseExpr, evalAst, toStr, tableOf, equivalent, astToSpec, minimize, simplify, sopString } from "../src/lib/logic.js";
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const eq = (a, b, m) => ok(a === b, `${m} got=${a} want=${b}`);

// গেট
const tt = (t, n) => Array.from({ length: 1 << n }, (_, k) => GATE_FN[t](Array.from({ length: n }, (_, i) => (k >> (n - 1 - i)) & 1))).join("");
eq(tt("AND", 2), "0001", "AND"); eq(tt("OR", 2), "0111", "OR"); eq(tt("NAND", 2), "1110", "NAND"); eq(tt("NOR", 2), "1000", "NOR");
eq(tt("XOR", 2), "0110", "XOR"); eq(tt("XNOR", 2), "1001", "XNOR"); eq(tt("NOT", 1), "10", "NOT"); eq(tt("XOR", 3), "01101001", "XOR3"); eq(tt("AND", 3), "00000001", "AND3");

// পার্সার
const P = (s) => { const r = parseExpr(s); if (!r.ok) throw new Error(s + ": " + r.error); return r; };
const T = (s) => tableOf(P(s).ast, P(s).vars).join("");
eq(T("A·B"), "0001", "A·B"); eq(T("AB"), "0001", "AB implicit"); eq(T("A+B"), "0111", "A+B"); eq(T("A'"), "10", "A'"); eq(T("(A+B)'"), "1000", "(A+B)'");
eq(T("A'B + AB'"), "0110", "xor form"); eq(T("A^B"), "0110", "A^B"); eq(T("!A + B"), "1101", "!A+B"); eq(T("A+A'B"), "0111", "A+A'B");
eq(T("A(B+C)"), T("AB+AC"), "distrib"); eq(T("(A'B')'"), T("A+B"), "demorgan"); eq(T("A''"), "01", "A''");
eq(T("a b"), "0001", "lowercase space"); eq(T("A+1"), "11", "A+1"); eq(T("A·0"), "00", "A·0");
ok(!parseExpr("A+").ok, "A+ invalid"); ok(!parseExpr("(A").ok, "paren"); ok(!parseExpr("A)").ok, "paren2"); ok(!parseExpr("A$").ok, "bad char"); ok(parseExpr("").empty, "empty");
ok(!parseExpr("ABCDEF").ok, "6 vars");
eq(toStr(P("A'B+AB'").ast), "A'·B + A·B'", "toStr"); eq(toStr(P("(A+B)'").ast), "(A + B)'", "toStr not"); eq(toStr(P("(A+B)C").ast), "(A + B)·C", "toStr paren");
// toStr round trip
for (const s of ["A'B+AB'", "(A+B)'C", "A^B^C", "A(B+C')+D'", "((A+B)(C+D))'"]) { const a = P(s).ast; ok(equivalent(a, P(toStr(a)).ast), "roundtrip " + s); }

// QM: ব্রুট-ফোর্স যাচাই
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let t = 0; t < 300; t++) {
  const n = 1 + Math.floor(rnd() * 5);
  const ms = []; for (let k = 0; k < 1 << n; k++) if (rnd() < 0.45) ms.push(k);
  const vars = "ABCDE".slice(0, n).split("");
  const sop = sopString(minimize(ms, n), vars);
  const p = parseExpr(sop); ok(p.ok, "sop parse " + sop);
  const got = tableOf(p.ast, vars);
  ok(got.every((v, k) => v === (ms.includes(k) ? 1 : 0)), `QM n=${n} ms=${ms} sop=${sop}`);
}
eq(simplify(P("A+A'B").ast, ["A", "B"]).sop, "A + B", "simplify A+A'B");
eq(simplify(P("AB+AB'").ast, ["A", "B"]).sop, "A", "simplify AB+AB'");
eq(simplify(P("A'B'+AB").ast, ["A", "B"]).sop, "A·B + A'·B'", "xnor stays");
eq(simplify(P("A+A'").ast, ["A"]).sop, "1", "tautology");
eq(simplify(P("AA'").ast, ["A"]).sop, "0", "contradiction");
eq(simplify(P("(A+B)(A+C)").ast, ["A", "B", "C"]).sop, "A + B·C", "simplify distributive");

// সার্কিট স্পেক + অটো-লেআউট + হিসাব
for (const s of ["A'B+AB'", "(A+B)'C+D", "A^B^C", "A", "A+1", "ABCDE+A'", "(AB)'+(CD)'"]) {
  const r = P(s);
  const spec = astToSpec(r.ast);
  const net = autoLayout(spec);
  const t = truthRows(net);
  const want = tableOf(r.ast, net.inputs.map((i) => i.id));
  ok(t.rows.every((row, k) => row.out[0] === want[k]), "net eval " + s);
  ok(net.w > 0 && net.h > 0 && net.gates.every((g) => Number.isFinite(g.x) && Number.isFinite(g.y)), "layout finite " + s);
  // একই কলামে গেট ওভারল্যাপ করে না
  const byX = {}; net.gates.forEach((g) => (byX[g.x] ||= []).push(g));
  Object.values(byX).forEach((l) => { l.sort((a, b) => a.y - b.y); for (let i = 1; i < l.length; i++) ok(l[i].y >= l[i - 1].y + l[i - 1].h, "overlap " + s); });
}

// অ্যাডার (হাতে লেখা স্পেক)
const FA = autoLayout({ inputs: [{ id: "A" }, { id: "B" }, { id: "Cin" }], gates: [
  { id: "x1", type: "XOR", in: ["A", "B"] }, { id: "s", type: "XOR", in: ["x1", "Cin"] }, { id: "a1", type: "AND", in: ["A", "B"] }, { id: "a2", type: "AND", in: ["x1", "Cin"] }, { id: "c", type: "OR", in: ["a1", "a2"] }],
  outputs: [{ id: "S", from: "s" }, { id: "C", from: "c" }] });
truthRows(FA).rows.forEach((r) => { const t = r.in[0] + r.in[1] + r.in[2]; eq(r.out[0], t & 1, "FA sum"); eq(r.out[1], t >> 1, "FA carry"); });
// NAND দিয়ে AND/OR/NOT
const nandOr = autoLayout({ inputs: [{ id: "A" }, { id: "B" }], gates: [{ id: "g1", type: "NAND", in: ["A", "A"] }, { id: "g2", type: "NAND", in: ["B", "B"] }, { id: "g3", type: "NAND", in: ["g1", "g2"] }], outputs: [{ id: "Y", from: "g3" }] });
eq(truthRows(nandOr).rows.map((r) => r.out[0]).join(""), "0111", "OR from NAND");
console.log(`logic: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
