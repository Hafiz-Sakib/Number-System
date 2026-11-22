import { QUESTIONS, CATS, CAT_COUNT } from "../src/lib/quizbank.js";
import { calc, calcMulti, convert, parseNum } from "../src/lib/engine.js";
import { complements, signedForms } from "../src/lib/complement.js";
import { GATE_FN, equivalent, evalAst, parseExpr, tableOf } from "../src/lib/logic.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const plain = (s) => s.replace(/\{\{([^}|]*)(\|[^}]*)?\}\}/g, "$1").replace(/^−/, "-").replace(/−/g, "-");

/* গঠন: ঠিক 4টি আলাদা বিকল্প, প্রশ্ন ও ব্যাখ্যা আছে, বিষয় বৈধ */
const ids = new Set(CATS.map((c) => c.id));
const qset = new Set();
for (const q of QUESTIONS) {
  ok(ids.has(q.c), `category ${q.c}`);
  ok(q.o.length === 4 && new Set(q.o).size === 4, `4 distinct options: ${q.q}`);
  ok(q.q && q.e && q.q.length > 5, `text: ${q.q}`);
  ok(!qset.has(q.c + q.q + q.o[0]), `duplicate: ${q.q}`); qset.add(q.c + q.q + q.o[0]);
  ok(typeof q.s === "undefined" || (Array.isArray(q.s()) && q.s().length > 0), `steps: ${q.q}`);
  for (const o of q.o) ok(!/undefined|NaN|\[object/.test(o), `bad option ${o}`);
}
for (const c of CATS) ok(CAT_COUNT[c.id] >= 20, `category ${c.id} has ${CAT_COUNT[c.id]}`);
ok(QUESTIONS.length >= 350, `total ${QUESTIONS.length}`);

/* গাণিতিক উত্তর আবার ইঞ্জিন দিয়ে যাচাই + ভুল উত্তরগুলো সঠিক নয় */
const val = (s, b) => { const p = parseNum(plain(s), b); return p.ok ? `${p.rat.n}/${p.rat.d}` : null; };
const num = (o) => o.replace(/^\{\{|\|\d+\}\}$/g, "");
for (const q of QUESTIONS) {
  const v = q.v; if (!v) continue;
  if (v.k === "conv") {
    ok(convert(v.x, v.f, v.t).text.replace("-", "−") === v.y, `conv ${v.x}`);
    ok(val(v.x, v.f) === val(v.y, v.t), `conv value ${v.x}`);
    for (const w of q.o.slice(1)) ok(val(num(w), v.t) !== val(v.y, v.t), `conv wrong equals right ${v.x} ${w}`);
  } else if (v.k === "arith") {
    const r = calc(v.a, v.b, v.op, v.base, "direct");
    ok(r.text.replace("-", "−") === v.y, `arith ${v.a}${v.op}${v.b}`);
    const A = parseNum(plain(v.a), v.base).rat, B = parseNum(plain(v.b), v.base).rat;
    const want = v.op === "+" ? [A.n * B.d + B.n * A.d, A.d * B.d] : v.op === "-" ? [A.n * B.d - B.n * A.d, A.d * B.d] : v.op === "*" ? [A.n * B.n, A.d * B.d] : [A.n * B.d, A.d * B.n];
    const got = parseNum(plain(v.y), v.base).rat;
    ok(got.n * want[1] === want[0] * got.d, `arith value ${v.a}${v.op}${v.b}`);
    for (const w of q.o.slice(1)) ok(val(num(w), v.base) !== val(v.y, v.base), `arith wrong equals right ${v.a}${v.op}${v.b}`);
  } else if (v.k === "multi") {
    ok(calcMulti(v.raws, 2).text === v.y && parseInt(v.y, 2) === v.raws.reduce((a, x) => a + parseInt(x, 2), 0), `multi ${v.raws}`);
  } else if (v.k === "ones" || v.k === "twos") {
    const c = complements(v.x, ""), x = parseInt(v.x, 2), n = v.x.length;
    ok(v.k === "ones" ? v.y === c.ones.int && parseInt(v.y, 2) === 2 ** n - 1 - x : v.y === c.twos.int && parseInt(v.y, 2) === (2 ** n - x) % 2 ** n, `${v.k} ${v.x}`);
    for (const w of q.o.slice(1)) ok(num(w) !== v.y, `${v.k} wrong equals right`);
  } else if (v.k === "ones-f" || v.k === "twos-f") {
    const c = complements(v.i, v.f), all = parseInt(v.i + v.f, 2), n = (v.i + v.f).length;
    const want = v.k === "ones-f" ? 2 ** n - 1 - all : (2 ** n - all) % 2 ** n;
    ok(parseInt(v.y.replace(".", ""), 2) === want && v.y.length === v.i.length + v.f.length + 1, `${v.k} ${v.i}.${v.f}`);
    ok(c.ones.int.length === v.i.length, "width");
  } else if (v.k === "neg2") {
    ok(parseInt(v.y, 2) === 256 + v.d && signedForms(v.d, 8).twos === v.y, `neg2 ${v.d}`);
  } else if (v.k === "dec2") {
    ok(parseInt(v.bits, 2) - 256 === v.y, `dec2 ${v.bits}`);
    ok(q.o[0] === String(v.y).replace("-", "−"), "dec2 answer text");
  } else if (v.k === "gate") {
    ok(GATE_FN[v.g](v.ans) === v.want && v.wr.every((c) => GATE_FN[v.g](c) !== v.want), `gate ${v.g} ${v.want}`);
  } else if (v.k === "eq") {
    const a = parseExpr(v.a); ok(a.ok, `parse ${v.a}`);
    const b = parseExpr(v.b); ok(b.ok, `parse ${v.b}`);
    if (a.ok && b.ok) ok(equivalent(a.ast, b.ast), `eq ${v.a} == ${v.b}`);
    for (const w of v.w) { const x = parseExpr(w.replace("²", "")); if (x.ok && !/²|2A/.test(w)) ok(!equivalent(a.ast, x.ast), `wrong option equals: ${v.a} vs ${w}`); }
  } else if (v.k === "eval") {
    const r = parseExpr(v.src), f = (b) => evalAst(r.ast, Object.fromEntries(r.vars.map((x, i) => [x, b[i]])));
    ok(f(v.ans) === v.want && v.wr.every((b) => f(b) !== v.want), `eval ${v.src}`);
  } else if (v.k === "min") {
    const r = parseExpr(v.src), T = tableOf(r.ast, r.vars);
    ok(JSON.stringify(T.map((f, k) => (f ? k : -1)).filter((k) => k >= 0)) === JSON.stringify(v.ms), `min ${v.src}`);
    ok(new Set(q.o).size === 4, "min options");
  }
}
/* মান যাচাইযোগ্য হাতে-লেখা কিছু দাবি */
ok(parseInt("11111011", 2) - 256 === -5, "−5");
console.log(`quizbank: ${pass} passed, ${fail} failed, total ${QUESTIONS.length} questions ${JSON.stringify(CAT_COUNT)}`);
process.exit(fail ? 1 : 0);
