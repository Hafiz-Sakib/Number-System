/* SOP / POS এর হিসাব: মিনটার্ম, ম্যাক্সটার্ম, আদর্শ রূপ, সরল রূপ, রাশি থেকে আদর্শ রূপে বিস্তার */
import { minimize, sopString, tableOf } from "./logic.js";

export const VARS = ["A", "B", "C", "D"];
export const bits = (k, n) => k.toString(2).padStart(n, "0");
const lit = (v, neg) => (neg ? v + "'" : v);

/** মিনটার্ম: 1 → চলক, 0 → চলকের পরিপূরক (বাম থেকে ডানে MSB) */
export const minterm = (k, vars) => { const b = bits(k, vars.length); return vars.map((v, i) => lit(v, b[i] === "0")).join("·"); };
/** ম্যাক্সটার্ম: 0 → চলক, 1 → চলকের পরিপূরক */
export const maxterm = (k, vars) => { const b = bits(k, vars.length); return "(" + vars.map((v, i) => lit(v, b[i] === "1")).join(" + ") + ")"; };

/** F' এর প্রাইম ইমপ্লিক্যান্ট থেকে সরল POS: প্রতিটি লিটারেল উল্টে, গুণ → যোগ, যোগ → গুণ (ডি-মরগান) */
export function posString(imps, vars) {
  if (!imps.length) return "1";
  const terms = imps.map((p) => [...p].map((ch, i) => (ch === "1" ? lit(vars[i], true) : ch === "0" ? vars[i] : "")).filter(Boolean));
  if (terms.some((t) => !t.length)) return "0";
  if (terms.length === 1) return terms[0].join(" + ");
  return terms.map((t) => (t.length > 1 ? "(" + t.join(" + ") + ")" : t[0])).join("·");
}

/** F (বিট-অ্যারে, সারি k = চলকগুলোর বাইনারি) → সব রূপ */
export function analyse(F, vars) {
  const n = vars.length, ones = [], zeros = [];
  F.forEach((f, k) => (f ? ones : zeros).push(k));
  const impOnes = minimize(ones, n), impZeros = minimize(zeros, n);
  return {
    ones, zeros,
    sopCanon: ones.length ? ones.map((k) => minterm(k, vars)).join(" + ") : "0",
    posCanon: zeros.length ? zeros.map((k) => maxterm(k, vars)).join("·") : "1",
    sopMin: sopString(impOnes, vars),
    posMin: posString(impZeros, vars),
    compSop: sopString(impZeros, vars), // F' এর সরল SOP
  };
}

/** একটি মিনটার্ম/ম্যাক্সটার্ম k-কে সারি at-এর মান বসিয়ে হিসাব (ধাপে ধাপে লেখার জন্য) */
export function evalTerm(k, at, vars, mode) {
  const sop = mode === "sop", n = vars.length, bk = bits(k, n), ba = bits(at, n), sep = sop ? "·" : " + ";
  const parts = vars.map((v, i) => { const neg = sop ? bk[i] === "0" : bk[i] === "1"; const val = +ba[i]; return { v, neg, val, out: neg ? 1 - val : val }; });
  return {
    text: parts.map((p) => lit(p.v, p.neg)).join(sep),
    sub: parts.map((p) => `${p.val}${p.neg ? "'" : ""}`).join(sep),
    vals: parts.map((p) => p.out).join(sep),
    res: sop ? +parts.every((p) => p.out === 1) : +parts.some((p) => p.out === 1),
  };
}

const asLit = (n) => (n.t === "var" ? { v: n.n, neg: false } : n.t === "not" && n.a.t === "var" ? { v: n.a.n, neg: true } : null);
const parseTerm = (n, kind) => { const lits = (n.t === kind ? n.args : [n]).map(asLit); return lits.every(Boolean) ? lits : null; };

/** SOP/POS আকারের রাশি → প্রতিটি পদ কোন কোন মিনটার্ম/ম্যাক্সটার্ম ঢাকে। আকার ঠিক না হলে valid:false */
export function expandForm(ast, vars, mode) {
  const sop = mode === "sop", n = vars.length;
  const top = ast.t === (sop ? "or" : "and") ? ast.args : [ast];
  const parsed = top.map((t) => parseTerm(t, sop ? "and" : "or"));
  const tbl = tableOf(ast, vars);
  const want = sop ? 1 : 0;
  const fromTable = tbl.map((f, k) => (f === want ? k : -1)).filter((k) => k >= 0);
  if (!parsed.every(Boolean)) return { valid: false, rows: fromTable };
  const terms = parsed.map((lits) => {
    const used = new Set(lits.map((l) => l.v));
    const missing = vars.filter((v) => !used.has(v));
    const rows = [];
    for (let k = 0; k < 1 << n; k++) {
      const b = bits(k, n);
      const ok = lits.every((l) => { const val = +b[vars.indexOf(l.v)]; const lv = l.neg ? 1 - val : val; return sop ? lv === 1 : lv === 0; });
      if (ok) rows.push(k);
    }
    const text = lits.map((l) => lit(l.v, l.neg)).join(sop ? "·" : " + ");
    const full = !missing.length ? text : sop ? text + missing.map((v) => `·(${v} + ${v}')`).join("") : `(${text} + ${missing.map((v) => `${v}·${v}'`).join(" + ")})`;
    return { text, missing, rows, full };
  });
  const rows = [...new Set(terms.flatMap((t) => t.rows))].sort((a, b) => a - b);
  return { valid: true, terms, rows };
}
