import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Circuit, TruthTable, useInputs } from "../../components/Circuit";
import { PillChoice } from "../../components/controls";
import { Rich } from "../../components/Steps";
import { astToSpec, autoLayout, equivalent, parseExpr, simplify, tableOf, toStr } from "../../lib/logic";
import { Eq, Facts, P, Panel } from "./shared";

/* ---------- রাশি ল্যাব: যেকোনো বুলিয়ান রাশি → সার্কিট + সত্যক সারণী + সরলীকরণ ---------- */
const EXAMPLES = ["A·B + A'·C", "A + A'·B", "A·B + A·B'", "(A + B)'", "A'·B + A·B'", "A·B + A'·C + B·C", "(A + B)·(A + C)"];
const KEYS = ["+", "·", "'", "(", ")", "⊕", "A", "B", "C"];

export function ExprLab({ initial = "A·B + A'·C" }) {
  const [src, setSrc] = useState(initial);
  const [view, setView] = useState("orig");
  const r = useMemo(() => parseExpr(src), [src]);
  const d = useMemo(() => {
    if (!r.ok) return null;
    const vars = r.vars;
    const s = simplify(r.ast, vars);
    const netO = autoLayout(astToSpec(r.ast));
    const netS = s.ast2 ? autoLayout(astToSpec(s.ast2)) : null;
    const better = netS && netS.gates.length < netO.gates.length;
    return { vars, s, netO, netS, better, F: tableOf(r.ast, vars), same: s.ast2 ? equivalent(r.ast, s.ast2) : false };
  }, [r]);
  const ids = d ? d.vars : [];
  const { st, toggle, set } = useInputs(ids);
  const shown = d && view === "simple" && d.better ? d.netS : d?.netO;
  const n = ids.length;
  const idx = ids.reduce((a, v) => (a << 1) | st[v], 0);
  const rows = d ? d.F.map((f, k) => ({ in: ids.map((_, i) => (k >> (n - 1 - i)) & 1), out: [f] })) : [];

  return (
    <div>
      <label htmlFor="expr" className="mb-2 block text-sm font-semibold text-ink/60">বুলিয়ান রাশি (সর্বোচ্চ 5টি চলক: A–E)</label>
      <input id="expr" value={src} onChange={(e) => { setSrc(e.target.value); setView("orig"); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-invalid={!r.ok}
        className="num w-full rounded-2xl bg-surface px-4 py-3 text-xl font-semibold ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500/60" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {KEYS.map((k) => <button key={k} type="button" onClick={() => setSrc((s) => s + k)} className="num grid h-9 min-w-9 place-items-center rounded-xl bg-ink/[.06] px-2 font-semibold transition hover:bg-ink/[.12] active:scale-90">{k}</button>)}
        <button type="button" onClick={() => setSrc((s) => s.slice(0, -1))} className="h-9 rounded-xl bg-ink/[.06] px-3 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-90">মুছুন</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-ink/50">উদাহরণ:</span>
        {EXAMPLES.map((e) => <button key={e} type="button" onClick={() => { setSrc(e); setView("orig"); }} className="num rounded-full bg-ink/[.06] px-3 py-1.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">{e}</button>)}
      </div>
      <p className="mt-2 text-sm text-ink/50">যোগ <Eq>+</Eq> · গুণ <Eq>·</Eq> বা পাশাপাশি লিখুন (<Eq>AB</Eq>) · পরিপূরক <Eq>'</Eq> বা <Eq>!</Eq> · XOR <Eq>^</Eq></p>

      {!r.ok ? (
        <p role="alert" className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 font-semibold text-rose-700 dark:text-rose-300">{r.empty ? "উপরে একটি বুলিয়ান রাশি লিখুন।" : r.error}</p>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2 text-[15px]">
            <span className="rounded-full bg-lilac px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">F = <span className="num">{toStr(r.ast)}</span></span>
            <span className="rounded-full bg-sky px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">মিনটার্ম: <span className="num">{d.s.minterms.length ? `Σm(${d.s.minterms.join(", ")})` : "নেই"}</span></span>
            <span className="rounded-full bg-mint px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">সরল রূপ: <span className="num">{d.s.sop}</span>{d.same && <span aria-label="সত্যক সারণী মিলেছে"> ✓</span>}</span>
            <span className="rounded-full bg-peach px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">গেট: <span className="num">{d.netO.gates.length}{d.better ? ` → ${d.netS.gates.length}` : ""}</span></span>
          </div>
          {d.better ? <PillChoice id="expr-view" value={view} onChange={setView} options={[{ id: "orig", label: "আপনার রাশির সার্কিট" }, { id: "simple", label: "সরল রূপের সার্কিট" }]} />
            : <p className="text-sm text-ink/55">রাশিটি আগে থেকেই যথেষ্ট সরল, এর চেয়ে কম গেটে করা যায় না।</p>}
          <div className="board overflow-x-auto no-sb rounded-2xl p-2 ring-1 ring-ink/10 sm:p-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={view + src} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <Circuit net={shown} state={st} onToggle={toggle} />
              </motion.div>
            </AnimatePresence>
          </div>
          {n > 0 && <TruthTable ins={ids} outs={["F"]} rows={rows} active={idx} onPick={(k) => set(Object.fromEntries(ids.map((v, i) => [v, (k >> (n - 1 - i)) & 1])))} />}
          {d.same && d.better && <p className="text-sm text-ink/55">সরল রাশির সত্যক সারণী মূল রাশির সাথে সারি-সারি মিলেছে, তাই দুটি সার্কিটই সমান কাজ করে (কিন্তু সরলটিতে গেট কম)।</p>}
        </div>
      )}
    </div>
  );
}

/* ---------- 3.7.1 বুলিয়ান এলজেবরা ---------- */
export function Algebra() {
  return (
    <div className="space-y-4">
      <Panel>
        <P>**বুলিয়ান এলজেবরা** এমন একটি গণিত, যেখানে চলক (variable) কেবল দুটি মান নিতে পারে: **0** (মিথ্যা / বন্ধ / নিম্ন ভোল্টেজ) বা **1** (সত্য / চালু / উচ্চ ভোল্টেজ)। গণিতবিদ জর্জ বুল এটি উদ্ভাবন করেন; ডিজিটাল সার্কিটের নকশা ও সরলীকরণ এর উপরই দাঁড়িয়ে।</P>
        <div className="mt-4"><Facts items={[
          ["A · B", "**AND (গুণ)**: দুটিই 1 হলে ফল 1।", "bg-lilac"],
          ["A + B", "**OR (যোগ)**: অন্তত একটি 1 হলে ফল 1।", "bg-sky"],
          ["A'", "**NOT (পরিপূরক)**: 0 হলে 1, 1 হলে 0।", "bg-peach"],
          ["1 + 1 = 1", "বুলিয়ান যোগে 1 + 1 = 1 (সাধারণ গণিতের 2 নয়), কারণ মান মাত্র দুটি।", "bg-mint"],
        ]} /></div>
      </Panel>
      <Panel title="রাশি ল্যাব" sub="যেকোনো রাশি লিখুন: সাথে সাথে সার্কিট, সত্যক সারণী ও সবচেয়ে সরল রূপ দেখুন।">
        <ExprLab />
        <P className="mt-5">**সরলীকরণ কেন দরকার?** রাশি যত সরল, সার্কিটে গেট তত কম: খরচ, জায়গা ও বিদ্যুৎ কম। উপরের ল্যাব Quine–McCluskey পদ্ধতিতে সবচেয়ে সরল গুণফলের-যোগফল (SOP) রূপ বের করে এবং সত্যক সারণী মিলিয়ে নিশ্চিত করে।</P>
      </Panel>
    </div>
  );
}

/* ---------- 3.7.2 বুলিয়ান উপপাদ্য ---------- */
const THEOREMS = [
  ["অভেদ (Identity)", [["A + 0", "A"], ["A·1", "A"]]],
  ["নাল (Null)", [["A + 1", "1"], ["A·0", "0"]]],
  ["সমশক্তি (Idempotent)", [["A + A", "A"], ["A·A", "A"]]],
  ["পরিপূরক (Complement)", [["A + A'", "1"], ["A·A'", "0"]]],
  ["দ্বিপরিপূরক (Involution)", [["(A')'", "A"]]],
  ["বিনিময় (Commutative)", [["A + B", "B + A"], ["A·B", "B·A"]]],
  ["সংযোগ (Associative)", [["(A + B) + C", "A + (B + C)"], ["(A·B)·C", "A·(B·C)"]]],
  ["বণ্টন (Distributive)", [["A·(B + C)", "A·B + A·C"], ["A + B·C", "(A + B)·(A + C)"]]],
  ["শোষণ (Absorption)", [["A + A·B", "A"], ["A·(A + B)", "A"]]],
  ["অপ্রয়োজনীয়তা (Redundancy)", [["A + A'·B", "A + B"], ["A·(A' + B)", "A·B"]]],
  ["ডি-মরগান (De Morgan)", [["(A·B)'", "A' + B'"], ["(A + B)'", "A'·B'"]]],
];

function Law({ l, r }) {
  const [open, setOpen] = useState(false);
  const data = useMemo(() => {
    const a = parseExpr(l), b = parseExpr(r);
    const vars = [...new Set([...a.vars, ...b.vars])].sort();
    const n = vars.length;
    const ta = tableOf(a.ast, vars), tb = tableOf(b.ast, vars);
    return { vars, ok: equivalent(a.ast, b.ast), rows: ta.map((x, k) => ({ in: vars.map((_, i) => (k >> (n - 1 - i)) & 1), out: [x, tb[k]] })) };
  }, [l, r]);
  return (
    <div className="rounded-2xl bg-ink/[.04] px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="num text-[17px] font-bold">{l} <span className="text-ink/40">=</span> {r}</p>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold ring-1 ring-ink/10 transition hover:bg-ink/[.06] active:scale-95">{open ? "লুকান" : "সত্যক সারণীতে যাচাই"}</button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="pt-3">
              <TruthTable ins={data.vars} outs={["বাম পক্ষ", "ডান পক্ষ"]} rows={data.rows} compare={{ head: "মিল", cell: (row) => (row.out[0] === row.out[1] ? "✓" : "✗") }} />
              <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{data.ok ? "সব সারিতে দুই পক্ষ সমান, তাই সমীকরণটি সত্য।" : "দুই পক্ষ সমান নয়।"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Theorems() {
  return (
    <div className="space-y-4">
      <Panel>
        <P>বুলিয়ান সমীকরণ সরল করতে কিছু নিয়ম (উপপাদ্য) ব্যবহার হয়। প্রতিটি নিয়মের পাশের বোতামে চাপলে সত্যক সারণী বানিয়ে দুই পক্ষ মিলিয়ে দেখা যায়।</P>
        <P className="mt-3">**দ্বৈত নীতি (Duality):** কোনো সত্য সমীকরণে <Eq>+</Eq> ↔ <Eq>·</Eq> এবং <Eq>0</Eq> ↔ <Eq>1</Eq> বদলে দিলে আরেকটি সত্য সমীকরণ পাওয়া যায়। তাই নিচের প্রায় সব নিয়ম জোড়ায় জোড়ায় আছে।</P>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        {THEOREMS.map(([name, laws]) => (
          <Panel key={name} title={name}>
            <div className="space-y-2">{laws.map(([l, r]) => <Law key={l + r} l={l} r={r} />)}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

/* ---------- 3.7.4 ডি-মরগানের উপপাদ্য ---------- */
const LAWS = {
  one: { l: "(A·B)'", r: "A' + B'", name: "(A·B)' = A' + B'", say: "গুণফলের পরিপূরক = পরিপূরকগুলোর **যোগফল**। সার্কিটে: NAND = ইনপুট উল্টে OR।" },
  two: { l: "(A + B)'", r: "A'·B'", name: "(A + B)' = A'·B'", say: "যোগফলের পরিপূরক = পরিপূরকগুলোর **গুণফল**। সার্কিটে: NOR = ইনপুট উল্টে AND।" },
};
const QUIZ = [
  ["(A + B)' এর সমান কোনটি?", ["A' + B'", "A'·B'", "A·B", "A + B'"], 1, "ডি-মরগান: যোগফলের পরিপূরক = পরিপূরকগুলোর গুণফল, অর্থাৎ A'·B'।"],
  ["(A·B)' এর সমান কোনটি?", ["A'·B'", "A + B", "A' + B'", "A·B'"], 2, "গুণফলের পরিপূরক = পরিপূরকগুলোর যোগফল, অর্থাৎ A' + B'।"],
  ["(A' + B')' এর সরল রূপ কোনটি?", ["A + B", "A·B", "A'·B'", "A' + B"], 1, "(A' + B')' = (A')'·(B')' = A·B।"],
  ["NAND গেটের দুই ইনপুটই 1 হলে আউটপুট কত?", ["0", "1", "অনির্ধারিত", "দুটিই সম্ভব"], 0, "NAND = (A·B)'। 1·1 = 1, তার পরিপূরক 0।"],
  ["A + A'·B কে সরল করলে কী পাওয়া যায়?", ["A·B", "A + B", "B", "A"], 1, "অপ্রয়োজনীয়তা নিয়ম: A + A'·B = A + B।"],
  ["ডি-মরগানের উপপাদ্য কীসের মধ্যে সম্পর্ক দেখায়?", ["AND ও OR এর (পরিপূরকের মাধ্যমে)", "শুধু NOT এর", "যোগ ও বিয়োগের", "XOR ও XNOR এর"], 0, "উপপাদ্যটি AND ও OR কে পরিপূরকের মাধ্যমে পরস্পরে বদলে দেয়।"],
];

function Quiz() {
  const [ans, setAns] = useState({});
  const done = Object.keys(ans).length;
  const score = QUIZ.filter((q, i) => ans[i] === q[2]).length;
  return (
    <div className="space-y-4">
      {QUIZ.map(([q, opts, right, why], i) => (
        <fieldset key={i} className="rounded-2xl bg-ink/[.04] p-3.5 sm:p-4">
          <legend className="px-1 font-bold"><span className="num text-ink/45">{i + 1}.</span> {q}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {opts.map((o, k) => {
              const picked = ans[i] === k, shown = ans[i] != null;
              const tone = !shown ? "bg-surface ring-ink/10 hover:bg-ink/[.05]" : k === right ? "bg-emerald-500/15 ring-emerald-500/50" : picked ? "bg-rose-500/15 ring-rose-500/50" : "bg-surface ring-ink/10 opacity-60";
              return <button key={k} type="button" disabled={shown} onClick={() => setAns((a) => ({ ...a, [i]: k }))} className={`num rounded-xl px-3.5 py-2.5 text-left font-semibold ring-1 transition active:scale-[.98] ${tone}`}>{o}</button>;
            })}
          </div>
          {ans[i] != null && <p className="mt-2 text-sm leading-[1.8] text-ink/70"><b className={ans[i] === right ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>{ans[i] === right ? "সঠিক। " : "ভুল। "}</b>{why}</p>}
        </fieldset>
      ))}
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold">{done === QUIZ.length ? <>আপনার স্কোর: <span className="num">{score}/{QUIZ.length}</span></> : <span className="text-ink/55">উত্তর দেওয়া হয়েছে <span className="num">{done}/{QUIZ.length}</span></span>}</p>
        {done > 0 && <button type="button" onClick={() => setAns({})} className="rounded-full bg-ink/[.07] px-4 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">আবার করুন</button>}
      </div>
    </div>
  );
}

export function DeMorgan() {
  const [law, setLaw] = useState("one");
  const L = LAWS[law];
  const nets = useMemo(() => {
    const mk = (s) => autoLayout(astToSpec(parseExpr(s).ast), { inGap: 52 });
    return { l: mk(L.l), r: mk(L.r) };
  }, [L]);
  const { st, toggle, set } = useInputs(["A", "B"]);
  const idx = st.A * 2 + st.B;
  const A = parseExpr(L.l).ast, B = parseExpr(L.r).ast;
  const rows = [0, 1, 2, 3].map((k) => ({ in: [k >> 1, k & 1], out: [tableOf(A, ["A", "B"])[k], tableOf(B, ["A", "B"])[k]] }));
  return (
    <div className="space-y-4">
      <Panel>
        <P>**ডি-মরগানের উপপাদ্য (De Morgan's Theorem)** দুটি নিয়ম দেয়:</P>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-lilac px-4 py-3 ring-1 ring-ink/[.06]"><p className="num text-lg font-extrabold">(A·B)' = A' + B'</p><p className="mt-0.5 text-[15px] text-ink/70">গুণফলের পরিপূরক = পরিপূরকগুলোর যোগফল</p></div>
          <div className="rounded-2xl bg-sky px-4 py-3 ring-1 ring-ink/[.06]"><p className="num text-lg font-extrabold">(A + B)' = A'·B'</p><p className="mt-0.5 text-[15px] text-ink/70">যোগফলের পরিপূরক = পরিপূরকগুলোর গুণফল</p></div>
        </div>
        <P className="mt-3">মনে রাখার উপায়: **বার ভাঙো, চিহ্ন বদলাও** (AND ↔ OR) এবং প্রতিটি চলকের উপর পরিপূরক বসাও।</P>
      </Panel>
      <Panel title="সার্কিটে যাচাই" sub="একই ইনপুটে দুই পাশের সার্কিট সবসময় সমান আউটপুট দেয়।">
        <PillChoice id="dm" value={law} onChange={setLaw} options={[{ id: "one", label: "(A·B)' = A' + B'" }, { id: "two", label: "(A + B)' = A'·B'" }]} />
        <p className="mt-3 text-ink/70"><Rich text={L.say} /></p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {[["বাম পক্ষ", L.l, nets.l], ["ডান পক্ষ", L.r, nets.r]].map(([h, e, net]) => (
            <div key={h}>
              <p className="mb-1.5 text-sm font-bold text-ink/60">{h}: <span className="num text-ink">{e}</span></p>
              <div className="board overflow-x-auto no-sb rounded-2xl p-2 ring-1 ring-ink/10"><Circuit net={net} state={st} onToggle={toggle} /></div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <TruthTable ins={["A", "B"]} outs={["বাম", "ডান"]} rows={rows} active={idx} onPick={(k) => set({ A: k >> 1, B: k & 1 })} compare={{ head: "মিল", cell: (r) => (r.out[0] === r.out[1] ? "✓" : "✗") }} />
        </div>
      </Panel>
      <Panel title="Question set 3" sub="ডি-মরগান ও সরলীকরণের ছোট অনুশীলন। উত্তরে চাপ দিলেই ব্যাখ্যা দেখা যাবে।"><Quiz /></Panel>
    </div>
  );
}
