import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Circuit, TruthTable, useInputs } from "../../components/Circuit";
import { ExampleGrid, PillChoice } from "../../components/controls";
import { Rich } from "../../components/Steps";
import { astToSpec, autoLayout, equivalent, parseExpr, qmTrace, simplify, simplifySteps, tableOf, toStr } from "../../lib/logic";
import { Eq, Facts, P, Panel } from "./shared";

/* ---------- রাশি ল্যাব: যেকোনো বুলিয়ান রাশি → সরলীকরণের ধাপ + সার্কিট + সত্যক সারণী ---------- */
const EXAMPLES = [
  { title: "A + A'·B", sub: "অপ্রয়োজনীয়তা" },
  { title: "A·B + A·B'", sub: "সাধারণ উৎপাদক" },
  { title: "(A + B)'", sub: "ডি-মরগান" },
  { title: "A·B + A'·C + B·C", sub: "কনসেনসাস" },
  { title: "A + A·B", sub: "শোষণ" },
  { title: "A'·B + A·B'", sub: "XOR (আগেই সরল)" },
  { title: "(A + B)·(A + B')", sub: "দ্বৈত রূপ" },
  { title: "A·B + A'·B' + A·B'", sub: "মিশ্র" },
];
const VARS = ["A", "B", "C", "D"];
const OPS = ["+", "·", "'", "(", ")", "⊕"];
const keyCls = "num grid h-9 min-w-9 place-items-center rounded-xl bg-ink/[.06] px-2 font-semibold transition hover:bg-ink/[.12] active:scale-90";
const litCount = (n) => (n.t === "var" ? 1 : n.t === "const" ? 0 : n.t === "not" ? litCount(n.a) : n.args.reduce((s, a) => s + litCount(a), 0));

/** সরলীকরণের ধাপগুলো পাঠ্যবইয়ের মতো সারিতে সাজিয়ে দেখায় (প্রতি সারিতে একটি নিয়ম) */
export function SimplifySteps({ data, orig }) {
  const [mode, setMode] = useState("all");
  const [k, setK] = useState(0);
  const { steps, start, final, already } = data;
  const L = steps.length;
  const shown = mode === "all" ? L : Math.min(k, L);
  const done = shown >= L;
  return (
    <div className="rounded-2xl bg-ink/[.035] p-3.5 ring-1 ring-ink/[.06] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-lg font-extrabold">সরলীকরণের ধাপ</h4>
        {!already && L > 1 && <PillChoice id="simp-mode" value={mode} onChange={(m) => { setMode(m); setK(0); }} options={[{ id: "all", label: "সব ধাপ" }, { id: "one", label: "একটি একটি করে" }]} />}
      </div>
      <ol className="mt-4 space-y-3">
        <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
          <span className="num mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-ink/10 text-xs font-bold text-ink/60">F</span>
          <div className="min-w-0"><p className="num break-words text-[17px] font-bold">F = {toStr(start)}</p><p className="text-xs text-ink/45">মূল রাশি</p></div>
        </li>
        {steps.slice(0, shown).map((st, i) => (
          <motion.li key={`${orig}-${i}-${mode}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: mode === "all" ? Math.min(i, 8) * 0.04 : 0 }} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
            <span className="num mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-700 dark:text-violet-300">{i + 1}</span>
            <div className="min-w-0">
              <p className="num break-words text-[17px] font-bold"><span className="text-ink/40">= </span>{toStr(st.ast)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded-full bg-lemon px-2.5 py-0.5 text-xs font-bold ring-1 ring-amber-500/20">{st.law}</span>
                <span className="num text-xs text-ink/50">{st.eq}</span>
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
      {already && <p className="mt-3 rounded-xl bg-mint px-3.5 py-2.5 text-[15px] font-semibold ring-1 ring-ink/[.06]">রাশিটি আগে থেকেই সরল: কোনো নিয়ম প্রয়োগ করে একে আর ছোট করা যায় না।</p>}
      {mode === "one" && !already && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" disabled={done} onClick={() => setK((x) => x + 1)} className="rounded-full bg-ink px-5 py-2 font-semibold text-paper transition enabled:hover:bg-ink/85 enabled:active:scale-95 disabled:opacity-35">{done ? "সব ধাপ শেষ" : shown === 0 ? "প্রথম ধাপ দেখো" : "পরের ধাপ →"}</button>
          {shown > 0 && <button type="button" onClick={() => setK(0)} className="rounded-full bg-ink/[.07] px-4 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">আবার</button>}
          <span className="num text-sm text-ink/50">{shown}/{L}</span>
        </div>
      )}
      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-mint px-4 py-3 ring-1 ring-emerald-500/20">
          <p className="num break-words text-xl font-extrabold">∴ F = {toStr(final)}</p>
          <p className="mt-1 text-sm text-ink/65">{!already && litCount(start) > litCount(final) ? <>চলকের সংখ্যা (literal) <span className="num font-bold">{litCount(start)} → {litCount(final)}</span>। </> : null}সত্যক সারণী মিলিয়ে দেখা হয়েছে: মূল রাশি ও সরল রাশির ফল সব সারিতে সমান ✓</p>
        </motion.div>
      )}
    </div>
  );
}


/** Quine–McCluskey এর পুরো হিসাব: মিনটার্ম → গ্রুপ → জোড়া মেলানো → প্রাইম ইমপ্লিক্যান্ট → কভারেজ ছক → উত্তর */
export function QmWork({ minterms, vars, original }) {
  const n = vars.length;
  const q = useMemo(() => qmTrace(minterms, n, vars), [minterms, n, vars]);
  const bin = (m) => m.toString(2).padStart(n, "0");
  const term = (m) => vars.map((v, i) => (bin(m)[i] === "1" ? v : v + "'")).join("·");
  const H = ({ no, children }) => <h5 className="mb-2 mt-5 flex items-center gap-2 text-[15px] font-extrabold first:mt-0"><span className="num grid h-6 w-6 place-items-center rounded-full bg-violet-500/15 text-xs text-violet-700 dark:text-violet-300">{no}</span>{children}</h5>;
  if (q.trivial) {
    return (
      <div className="rounded-2xl bg-ink/[.035] p-3.5 ring-1 ring-ink/[.06] sm:p-5">
        <h4 className="text-lg font-extrabold">সরলীকরণের হিসাব (সারণী পদ্ধতি)</h4>
        <p className="mt-3 leading-[1.9] text-ink/75">{q.trivial === "1" ? <>সত্যক সারণীর <b>সবকটি</b> সারিতে F = 1, অর্থাৎ ইনপুট যা-ই হোক আউটপুট সবসময় 1। তাই <span className="num font-bold">F = 1</span>: কোনো গেটই লাগে না।</> : <>সত্যক সারণীর <b>কোনো</b> সারিতেই F = 1 নেই, অর্থাৎ আউটপুট সবসময় 0। তাই <span className="num font-bold">F = 0</span>: কোনো গেটই লাগে না।</>}</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-ink/[.035] p-3.5 ring-1 ring-ink/[.06] sm:p-5">
      <h4 className="text-lg font-extrabold">সরলীকরণের হিসাব (Quine–McCluskey)</h4>
      <p className="mt-1 text-sm leading-[1.8] text-ink/55">বীজগণিতের নিয়মে আর ছোট না হলে এই পদ্ধতি সারণী থেকে সরাসরি সবচেয়ে ছোট রাশি বের করে। এটি কার্নো ম্যাপেরই হিসাব-করা রূপ।</p>

      <H no="১">সত্যক সারণী থেকে মিনটার্ম (যেসব সারিতে F = 1)</H>
      <div className="flex flex-wrap gap-1.5">
        {q.minterms.map((m) => <span key={m} className="num rounded-xl bg-sky px-2.5 py-1 text-sm font-bold ring-1 ring-ink/[.06]">m<sub>{m}</sub> = {bin(m)} <span className="font-semibold text-ink/50">→ {term(m)}</span></span>)}
      </div>
      <p className="num mt-2 break-words text-[15px] font-bold">F = Σm({q.minterms.join(", ")})</p>

      <H no="২">1-এর সংখ্যা ধরে গ্রুপ, তারপর পাশের গ্রুপের জোড়া মেলানো</H>
      <p className="mb-2 text-sm leading-[1.8] text-ink/55">যে দুটি পদের <b>মাত্র একটি বিট আলাদা</b>, তাদের একসাথে করে ওই বিটের জায়গায় <span className="num font-bold">-</span> বসে (চলকটি বাদ যায়)। যে পদ কোনো জোড়ায় ব্যবহার হয়েছে তার পাশে ✓।</p>
      <div className="flex gap-3 overflow-x-auto no-sb pb-1">
        {q.columns.filter((c) => c.groups.length).map((c, ci) => (
          <div key={ci} className="min-w-[10.5rem] shrink-0 rounded-xl bg-surface p-2.5 ring-1 ring-ink/10">
            <p className="mb-1.5 text-xs font-bold text-ink/50">{ci === 0 ? "প্রথম তালিকা" : `${ci + 1}-তম তালিকা`}</p>
            {c.groups.map((g) => (
              <div key={g.ones} className="mb-1.5 last:mb-0 border-t border-ink/[.07] pt-1.5 first:border-0 first:pt-0">
                <p className="text-[11px] font-bold text-ink/40">{ci === 0 ? `1 আছে ${g.ones}টি` : `গ্রুপ ${g.ones}`}</p>
                {g.terms.map((t) => (
                  <p key={t.bits} className="num flex items-center justify-between gap-2 text-sm font-semibold"><span>{t.ms.join(",")}</span><span className="tracking-widest">{t.bits}</span><span className={t.used ? "text-emerald-600" : "text-transparent"}>✓</span></p>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      {q.columns.some((c) => c.pairs.length) && (
        <details className="mt-2 text-sm text-ink/60"><summary className="w-fit cursor-pointer select-none font-semibold">কোন কোন জোড়া মিলেছে</summary>
          <ul className="num mt-1.5 space-y-0.5 leading-[1.8]">
            {q.columns.flatMap((c, ci) => c.pairs.map((p, k) => <li key={`${ci}-${k}`}>({p.a}) + ({p.b}) → <b>{p.bits}</b></li>))}
          </ul>
        </details>
      )}

      <H no="৩">প্রাইম ইমপ্লিক্যান্ট (যেগুলো আর মেলানো যায় না)</H>
      <div className="flex flex-wrap gap-1.5">
        {q.primes.map((p) => <span key={p.bits} className="num rounded-xl bg-lilac px-2.5 py-1 text-sm font-bold ring-1 ring-ink/[.06]">{p.bits} = {p.expr} <span className="font-semibold text-ink/50">({p.ms.join(",")})</span></span>)}
      </div>

      <H no="৪">কভারেজ ছক: কোন পদ কোন মিনটার্ম ঢাকে</H>
      <div className="overflow-x-auto no-sb rounded-xl ring-1 ring-ink/10">
        <table className="num w-full min-w-[20rem] border-collapse bg-surface text-center text-sm">
          <thead><tr className="bg-ink/[.05]"><th className="px-3 py-2 text-left">পদ</th>{q.minterms.map((m) => <th key={m} className="px-2.5 py-2">{m}</th>)}<th className="px-3 py-2 text-left">ফল</th></tr></thead>
          <tbody>
            {q.primes.map((p) => (
              <tr key={p.bits} className={`border-t border-ink/[.07] ${p.chosen ? "bg-mint/70" : ""}`}>
                <td className="px-3 py-2 text-left font-bold">{p.expr}</td>
                {q.minterms.map((m) => <td key={m} className="px-2.5 py-2">{p.cover.includes(m) ? <span className={p.chosen ? "font-extrabold text-emerald-700 dark:text-emerald-300" : "text-ink/45"}>✕</span> : ""}</td>)}
                <td className="whitespace-nowrap px-3 py-2 text-left text-xs font-bold">{p.essential ? "অপরিহার্য" : p.chosen ? "বাছাই" : "বাদ"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm leading-[1.8] text-ink/60"><b>অপরিহার্য</b> = এমন পদ, যেটি ছাড়া অন্তত একটি মিনটার্ম ঢাকা পড়ে না (ওই কলামে একটিই ✕)। বাকি মিনটার্ম কম পদে ঢাকার জন্য যেটি সবচেয়ে বেশি ঢাকে সেটি বেছে নেওয়া হয়েছে।</p>

      <div className="mt-4 rounded-2xl bg-mint px-4 py-3 ring-1 ring-emerald-500/20">
        <p className="num break-words text-xl font-extrabold">∴ F = {q.sop}</p>
        <p className="mt-1 text-sm text-ink/65">বাছাই করা পদগুলোর যোগফলই সরল রাশি{original ? <>; মূল রাশি ছিল <span className="num font-semibold">{original}</span></> : null}।</p>
      </div>
    </div>
  );
}

export function ExprLab({ initial = "A·B + A'·C", steps = false }) {
  const [src, setSrc] = useState(initial);
  const [view, setView] = useState("orig");
  const [showSteps, setShowSteps] = useState(true);
  const r = useMemo(() => parseExpr(src, 4), [src]);
  const d = useMemo(() => {
    if (!r.ok) return null;
    const vars = r.vars;
    const s = simplify(r.ast, vars);
    const netO = autoLayout(astToSpec(r.ast));
    const netS = s.ast2 ? autoLayout(astToSpec(s.ast2)) : null;
    const better = netS && netS.gates.length < netO.gates.length;
    return { vars, s, netO, netS, better, F: tableOf(r.ast, vars), same: s.ast2 ? equivalent(r.ast, s.ast2) : false, st: steps ? simplifySteps(r.ast, vars) : null };
  }, [r, steps]);
  const ids = d ? d.vars : [];
  const { st, toggle, set } = useInputs(ids);
  const shown = d && view === "simple" && d.better ? d.netS : d?.netO;
  const n = ids.length;
  const idx = ids.reduce((a, v) => (a << 1) | st[v], 0);
  const rows = d ? d.F.map((f, k) => ({ in: ids.map((_, i) => (k >> (n - 1 - i)) & 1), out: [f] })) : [];
  const pick = (e) => { setSrc(e.title); setView("orig"); };

  return (
    <div>
      <label htmlFor="expr" className="mb-2 block text-sm font-semibold text-ink/60">তোমার বুলিয়ান রাশি (সর্বোচ্চ 4টি চলক)</label>
      <input id="expr" value={src} onChange={(e) => { setSrc(e.target.value); setView("orig"); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-invalid={!r.ok}
        className="num w-full rounded-2xl bg-surface px-4 py-3 text-xl font-semibold ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500/60" />
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex gap-1.5">{VARS.map((k) => <button key={k} type="button" onClick={() => setSrc((x) => x + k)} className={keyCls}>{k}</button>)}</div>
        <div className="flex gap-1.5">{OPS.map((k) => <button key={k} type="button" onClick={() => setSrc((x) => x + k)} className={`${keyCls} bg-lilac`}>{k}</button>)}</div>
        <button type="button" onClick={() => setSrc((x) => x.slice(0, -1))} className="h-9 rounded-xl bg-ink/[.06] px-3 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-90">⌫</button>
        <button type="button" onClick={() => setSrc("")} className="h-9 rounded-xl bg-ink/[.06] px-3 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-90">মুছুন</button>
      </div>
      <details className="mt-2 text-sm text-ink/50"><summary className="w-fit cursor-pointer select-none font-semibold">লেখার নিয়ম</summary>
        <p className="mt-1.5 leading-[2]">যোগ <Eq>+</Eq> · গুণ <Eq>·</Eq> বা পাশাপাশি লেখো (<Eq>AB</Eq>) · পরিপূরক <Eq>'</Eq> বা <Eq>!</Eq> · XOR <Eq>^</Eq> বা <Eq>⊕</Eq></p>
      </details>
      <div className="mt-4"><ExampleGrid items={EXAMPLES} onPick={pick} limit={4} cols="grid-cols-2 lg:grid-cols-4" /></div>

      {!r.ok ? (
        <p role="alert" className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 font-semibold text-rose-700 dark:text-rose-300">{r.empty ? "উপরে একটি বুলিয়ান রাশি লেখো।" : r.error}</p>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2 text-[15px]">
            <span className="rounded-full bg-lilac px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">F = <span className="num">{toStr(r.ast)}</span></span>
            <span className="rounded-full bg-sky px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">মিনটার্ম: <span className="num">{d.s.minterms.length ? `Σm(${d.s.minterms.join(", ")})` : "নেই"}</span></span>
            <span className="rounded-full bg-mint px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">সরল রূপ: <span className="num">{d.s.sop}</span>{d.same && <span aria-label="সত্যক সারণী মিলেছে"> ✓</span>}</span>
            <span className="rounded-full bg-peach px-3.5 py-1.5 font-semibold ring-1 ring-ink/[.06]">গেট: <span className="num">{d.netO.gates.length}{d.better ? ` → ${d.netS.gates.length}` : ""}</span></span>
          </div>

          {steps && (
            <div>
              <button type="button" role="switch" aria-checked={showSteps} onClick={() => setShowSteps((x) => !x)} className="inline-flex items-center gap-3 rounded-full bg-ink/[.06] py-1.5 pl-4 pr-2 font-semibold transition hover:bg-ink/[.1] active:scale-[.98]">
                সরলীকরণের ধাপ দেখাও
                <span className={`relative h-6 w-11 rounded-full transition-colors ${showSteps ? "bg-emerald-500" : "bg-ink/25"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${showSteps ? "left-[22px]" : "left-0.5"}`} /></span>
              </button>
              <AnimatePresence initial={false}>
                {showSteps && d.st && (
                  <motion.div key="steps" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="space-y-3 pt-3">
                      <SimplifySteps key={src} data={d.st} orig={src} />
                      <QmWork key={`qm-${src}`} minterms={d.s.minterms} vars={d.vars} original={toStr(r.ast)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {d.better ? <PillChoice id="expr-view" value={view} onChange={setView} options={[{ id: "orig", label: "তোমার রাশির সার্কিট" }, { id: "simple", label: "সরল রূপের সার্কিট" }]} />
            : <p className="text-sm text-ink/55">রাশিটি আগে থেকেই যথেষ্ট সরল, এর চেয়ে কম গেটে করা যায় না।</p>}
          <div className="board overflow-x-auto no-sb rounded-2xl p-1.5 ring-1 ring-ink/10 sm:p-2 lg:p-3">
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
      <Panel title="বুলিয়ান রাশি পরীক্ষা" sub="একটি বুলিয়ান রাশি লেখো বা উদাহরণ বেছে নাও। এর সরলীকরণ, সার্কিট ও সত্যক সারণী দেখা যাবে।">
        <ExprLab steps />
        <P className="mt-5">**রাশি সরল করলে কী সুবিধা?** রাশি যত সরল, সার্কিটে গেট তত কম: খরচ, জায়গা ও বিদ্যুৎ কম। এই অংশ প্রথমে বুলিয়ান নিয়ম (অভেদ, শোষণ, ডি-মরগান ইত্যাদি) একটি একটি করে প্রয়োগ করে ধাপ দেখায়; দরকার হলে Quine–McCluskey দিয়ে আরও ছোট রূপ বের করে, আর সবশেষে সত্যক সারণী মিলিয়ে নিশ্চিত করে।</P>
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
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold ring-1 ring-ink/10 transition hover:bg-ink/[.06] active:scale-95">{open ? "লুকাও" : "সত্যক সারণীতে যাচাই"}</button>
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
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4">
          {[["বাম পক্ষ", L.l, nets.l], ["ডান পক্ষ", L.r, nets.r]].map(([h, e, net]) => (
            <div key={h} className="min-w-0">
              <p className="mb-1.5 text-sm font-bold text-ink/60">{h}: <span className="num text-ink">{e}</span></p>
              <div className="board overflow-x-auto no-sb rounded-2xl p-1.5 ring-1 ring-ink/10 lg:p-3"><Circuit net={net} state={st} onToggle={toggle} /></div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <TruthTable ins={["A", "B"]} outs={["বাম", "ডান"]} rows={rows} active={idx} onPick={(k) => set({ A: k >> 1, B: k & 1 })} compare={{ head: "মিল", cell: (r) => (r.out[0] === r.out[1] ? "✓" : "✗") }} />
        </div>
      </Panel>
    </div>
  );
}
