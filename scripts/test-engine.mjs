import { convert, calc, calcMulti, parseNum, ratToBase, showVal, BASES, availableMethods } from "../src/lib/engine.js";

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("FAIL:", msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg}  got=${a}  want=${b}`);

/* ---------- নির্দিষ্ট পাঠ্যবইয়ের উদাহরণ ---------- */
eq(convert("25", 10, 2).text, "11001", "25 → 2");
eq(convert("0.625", 10, 2).text, "0.101", "0.625 → 2");
eq(convert("25.625", 10, 2).text, "11001.101", "25.625 → 2");
eq(convert("1010.01", 2, 10).text, "10.25", "1010.01 → 10");
eq(convert("3A.8", 16, 10).text, "58.5", "3A.8 → 10");
eq(convert("1011010.101", 2, 8).text, "132.5", "bin → oct");
eq(convert("1011010.101", 2, 16).text, "5A.A", "bin → hex");
eq(convert("5A.A", 16, 2).text, "1011010.101", "hex → bin");
eq(convert("132.5", 8, 2).text, "1011010.101", "oct → bin");
eq(convert("755", 8, 16).text, "1ED", "oct → hex");
eq(convert("1ED", 16, 8).text, "755", "hex → oct");
eq(convert("255", 10, 16).text, "FF", "255 → FF");
eq(convert("-255", 10, 16).text, "-FF", "negative");
eq(convert("০১১০১", 2, 10).text, "13", "bangla digits");
eq(convert("ff", 16, 10).text, "255", "lowercase hex");
eq(convert("0", 10, 2).text, "0", "zero");
eq(convert(".5", 10, 2).text, "0.1", ".5");
eq(convert("0.1", 10, 2, 8).text, "0.00011001", "0.1 → 2 (8 digits)");
ok(convert("0.1", 10, 2, 8).value.exact === false, "0.1 → 2 inexact flag");
ok(!parseNum("12", 2).ok, "2 invalid in binary");
ok(!parseNum("1.2.3", 10).ok, "double point");
ok(!parseNum("G", 16).ok, "G invalid hex");
ok(!parseNum("", 10).ok, "empty");
eq(calc("1011", "101", "+", 2).text, "10000", "1011+101");
eq(calc("1101", "1011", "-", 2).text, "10", "1101-1011");
eq(calc("1011", "1101", "-", 2).text, "-10", "1011-1101");
eq(calc("A5", "3C", "+", 16).text, "E1", "A5+3C");
eq(calc("77", "1", "+", 8).text, "100", "77+1 oct");
eq(calc("1010", "11", "*", 2).text, "11110", "1010*11");
eq(calc("FF", "FF", "*", 16).text, "FE01", "FF*FF");
eq(calc("1100100", "101", "/", 2).text, "10100", "100/5");
eq(calc("1", "11", "/", 2, "direct", 8).text, "0.01010101", "1/3 binary");
eq(calc("1010", "0111", "-", 2, "complement").text, "11", "2's comp 10-7");
eq(calc("0111", "1010", "-", 2, "complement").text, "-11", "2's comp 7-10");
eq(calc("1.1", "1.1", "+", 2).text, "11", "1.1+1.1");
eq(calc("1.01", "0.11", "*", 2).text, "0.1111", "1.25 * 0.75 = 0.9375");
eq(calc("-5", "3", "+", 10).text, "-2", "-5 + 3");
eq(calc("-5", "-3", "-", 10).text, "-2", "-5 - -3");
eq(calc("5", "-3", "-", 10).text, "8", "5 - -3");
eq(calc("-4", "-3", "*", 10).text, "12", "neg*neg");
eq(calc("-12", "4", "/", 10).text, "-3", "neg/pos");
eq(calc("0", "5", "-", 10).text, "-5", "0-5");
eq(calc("5", "5", "-", 10).text, "0", "5-5 no negative zero");
ok(!calc("5", "0", "/", 10).ok, "div zero error");
ok(!calc("12", "1", "+", 2).ok, "invalid operand");

/* ---------- এলোমেলো যাচাই (নিখুঁত BigInt রেফারেন্সের সাথে) ---------- */
let seed = 12345;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const DIGITS = "0123456789ABCDEF";
const rndNum = (base, maxI = 9, maxF = 6, neg = false) => {
  let s = "";
  const li = ri(1, maxI), lf = ri(0, maxF);
  for (let i = 0; i < li; i++) s += DIGITS[ri(0, base - 1)];
  if (lf) { s += "."; for (let i = 0; i < lf; i++) s += DIGITS[ri(0, base - 1)]; }
  return (neg && rnd() < 0.3 ? "-" : "") + s;
};

for (let it = 0; it < 600; it++) {
  for (const from of BASES) for (const to of BASES) {
    const x = rndNum(from, 10, 7, true);
    const prec = [4, 6, 8, 12][ri(0, 3)];
    const r = convert(x, from, to, prec);
    ok(r.ok, `convert ok ${x} ${from}->${to}`);
    const p = parseNum(x, from);
    /* precision শুধু ডেসিমাল -> 2/8/16 এ খাটে; বাকি সব রূপান্তর নিখুঁত (terminating) */
    const want = from === 10 && to !== 10 ? ratToBase(p.rat, to, prec) : ratToBase(p.rat, to, 400);
    eq(showVal(r.value), showVal(want), `convert ${x} ${from}->${to} p=${prec}`);
    eq(r.value.exact, want.exact, `exact flag ${x} ${from}->${to}`);
    ok(r.blocks.length > 0 && r.blocks.every((b) => b.t), "blocks shape");
    if (want.exact) {
      const back = parseNum(r.text, to, 1000);
      ok(back.ok && back.rat.n === p.rat.n && back.rat.d === p.rat.d, `roundtrip ${x} ${from}->${to}=${r.text}`);
    }
  }
}

const rv = (s, base) => parseNum(s, base).rat;
for (let it = 0; it < 500; it++) {
  for (const base of BASES) {
    for (const op of ["+", "-", "*", "/"]) {
      const a = rndNum(base, 8, 4, true), b = rndNum(base, 8, 4, true);
      const prec = [4, 6, 8][ri(0, 2)];
      const pa = parseNum(a, base), pb = parseNum(b, base);
      if (op === "/" && pb.rat.n === 0n) continue;
      const methods = availableMethods(base, op, pa, pb);
      for (const m of methods) {
        const r = calc(a, b, op, base, m.id, prec);
        ok(r.ok, `calc ok ${a} ${op} ${b} b${base} ${m.id}`);
        if (!r.ok) continue;
        const A = pa.rat, B = pb.rat;
        let n, d;
        if (op === "+") { n = A.n * B.d + B.n * A.d; d = A.d * B.d; }
        else if (op === "-") { n = A.n * B.d - B.n * A.d; d = A.d * B.d; }
        else if (op === "*") { n = A.n * B.n; d = A.d * B.d; }
        else { n = A.n * B.d; d = A.d * B.n; }
        if (d < 0n) { n = -n; d = -d; }
        /* + − × নিখুঁত (সব অঙ্ক), শুধু ভাগে precision খাটে */
        const want = ratToBase({ n, d }, base, op === "/" ? prec : 400);
        eq(r.text, showVal(want), `calc ${a} ${op} ${b} b${base} [${m.id}] p=${prec}`);
        ok(r.all.length === 4 && r.blocks.length > 0, "calc shape");
        eq(r.all.find((x) => x.base === base).int, r.value.int, `all-bases int ${a} ${op} ${b} b${base}`);
      }
    }
  }
}

/* ---------- 1-এর পরিপূরক এবং অনেক সংখ্যার যোগ ---------- */
eq(calc("1010", "0111", "-", 2, "ones").text, "11", "1's comp 10-7");
eq(calc("0111", "1010", "-", 2, "ones").text, "-11", "1's comp 7-10");
eq(calc("101", "101", "-", 2, "ones").text, "0", "1's comp x-x");
eq(calc("1101.1", "101.01", "-", 2, "ones").text, "1000.01", "1's comp fraction");
ok(availableMethods(2, "-", parseNum("11", 2), parseNum("1", 2)).map((m) => m.id).join() === "direct,decimal,ones,complement", "binary sub methods");
eq(calcMulti(["1011", "110", "101"], 2).text, "10110", "multi 11+6+5");
eq(calcMulti(["A", "B", "C", "D"], 16).text, "2E", "multi hex");
eq(calcMulti(["1011", "-110", "-101"], 2).text, "0", "multi mixed → 0");
eq(calcMulti(["101", "-1111", "11"], 2).text, "-111", "multi negative result");
eq(calcMulti(["7", "7", "7", "7", "7"], 8).text, "43", "multi octal carry>1");
ok(!calcMulti(["1", "12", "1"], 2).ok && calcMulti(["1", "12", "1"], 2).which === 1, "multi invalid operand index");
for (let t = 0; t < 400; t++) {
  const base = [2, 8, 10, 16][t % 4];
  const k = 3 + (t % 5);
  const rnd = () => {
    const d = "0123456789ABCDEF".slice(0, base);
    const L = (n) => Array.from({ length: n }, () => d[Math.floor(Math.random() * base)]).join("");
    return (Math.random() < 0.35 ? "-" : "") + L(1 + Math.floor(Math.random() * 6)) + (Math.random() < 0.4 ? "." + L(1 + Math.floor(Math.random() * 3)) : "");
  };
  const raws = Array.from({ length: k }, rnd);
  let tot = { n: 0n, d: 1n };
  for (const x of raws) { const q = parseNum(x, base).rat; tot = { n: tot.n * q.d + q.n * tot.d, d: tot.d * q.d }; }
  if (tot.d < 0n) tot = { n: -tot.n, d: -tot.d };
  for (const m of ["direct", "decimal"]) {
    if (m === "decimal" && base === 10) continue;
    const r = calcMulti(raws, base, m, 8);
    ok(r.ok, `multi ok ${raws} b${base} ${m}`);
    if (r.ok) eq(r.text, showVal(ratToBase(tot, base, 400)), `multi ${raws.join(" + ")} b${base} [${m}]`);
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

