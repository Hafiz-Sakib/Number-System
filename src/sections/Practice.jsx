import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BASE_NAME, OPS, calc, convert, parseNum } from "../lib/engine";
import { LEVELS, makeArith, makeComplement, makeConvert, makeMcq, MCQ } from "../lib/questions";
import { Blocks, Rich } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { PillChoice, CLR, disp } from "../components/controls";

const MODES = [
  { id: "convert", label: "রূপান্তর" },
  { id: "arith", label: "যোগ-বিয়োগ-গুণ-ভাগ" },
  { id: "comp", label: "পরিপূরক" },
  { id: "mcq", label: "বহুনির্বাচনী" },
];
const gen = (mode, level) => (mode === "convert" ? makeConvert(level) : mode === "arith" ? makeArith(level) : mode === "comp" ? makeComplement(level) : makeMcq());

/* ভুল হলে দেখানোর সমাধান */
function solution(q) {
  if (q.kind === "convert") return convert(q.text, q.from, q.to).blocks;
  if (q.kind === "arith") return calc(q.a, q.b, q.op, q.base, "direct").blocks;
  if (q.kind === "comp" && q.sub === "sub") return calc(q.a, q.b, "-", 2, "complement").blocks;
  if (q.kind === "comp") {
    const b = [{ t: "p", text: `প্রতিটি বিট উল্টে দিই (0 → 1, 1 → 0): {{${q.x}|2}} → {{${q.ones}|2}}। এটি **1-এর পরিপূরক**।` }];
    if (q.sub === "twos") b.push({ t: "p", text: `এর সাথে 1 যোগ করি (বামের বাড়তি ক্যারি ফেলে দিই, ${q.n} বিটই থাকে): {{${q.ones}|2}} + {{1|2}} = {{${q.twos}|2}}। এটি **2-এর পরিপূরক**।` });
    b.push({ t: "box", text: `উত্তর = {{${q.expect}|2}}` });
    return b;
  }
  return null;
}

export default function Practice() {
  const [mode, setMode] = useState("convert");
  const [level, setLevel] = useState("easy");
  const [q, setQ] = useState(() => makeConvert("easy"));
  const [ans, setAns] = useState("");
  const [status, setStatus] = useState(null); // null | {ok} | {bad, invalid?} | {pick}
  const [score, setScore] = useState({ ok: 0, total: 0, streak: 0, best: 0 });

  const next = (m = mode, l = level) => { setQ(m === "mcq" ? makeMcq(q.idx) : gen(m, l)); setAns(""); setStatus(null); };
  const changeMode = (m) => { setMode(m); next(m, level); };
  const changeLevel = (l) => { setLevel(l); next(mode, l); };
  const record = (good) => setScore((s) => { const st = good ? s.streak + 1 : 0; return { ok: s.ok + (good ? 1 : 0), total: s.total + 1, streak: st, best: Math.max(s.best, st) }; });

  const check = () => {
    const p = parseNum(ans, q.base);
    if (!p.ok) { setStatus({ bad: true, invalid: p.msg }); return; }
    const e = parseNum(q.expect, q.base);
    const good = p.rat.n === e.rat.n && p.rat.d === e.rat.d;
    setStatus(good ? { ok: true } : { bad: true });
    record(good);
  };
  const choose = (i) => { if (status) return; const good = q.opts[i].ok; setStatus({ pick: i, ok: good, bad: !good }); record(good); };

  const steps = useMemo(() => (status && status.bad && !status.invalid ? solution(q) : null), [status, q]);
  const done = !!status && (status.ok || (status.bad && !status.invalid));
  const base = q.base;

  const question =
    q.kind === "convert" ? <><Rich text={`{{${q.text}|${q.from}}}`} /> কে <b className={`rounded-lg px-2 py-0.5 ${CLR[q.to].bg} ${CLR[q.to].text}`}>{BASE_NAME[q.to]}</b>-এ রূপান্তর করো।</>
    : q.kind === "arith" ? <><Rich text={`{{${q.a}|${q.base}}}`} /> <b className="px-1 text-2xl">{OPS[q.op].sign}</b> <Rich text={`{{${q.b}|${q.base}}}`} /> = কত? <span className="text-ink/55">(উত্তর {BASE_NAME[q.base]}-এ)</span></>
    : q.kind === "comp" && q.sub === "ones" ? <><Rich text={`{{${q.x}|2}}`} /> এর <b>1-এর পরিপূরক</b> কত?</>
    : q.kind === "comp" && q.sub === "twos" ? <><Rich text={`{{${q.x}|2}}`} /> এর <b>2-এর পরিপূরক</b> কত? <span className="text-ink/55">({q.n} বিটে)</span></>
    : q.kind === "comp" ? <><Rich text={`{{${q.a}|2}}`} /> <b className="px-1 text-2xl">−</b> <Rich text={`{{${q.b}|2}}`} /> = কত? <span className="text-ink/55">(2-এর পরিপূরক পদ্ধতিতে; ঋণাত্মক হলে − চিহ্ন দাও)</span></>
    : <Rich text={q.q} />;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="অনুশীলন" sub={`নিজে করুন, তারপর যাচাই করুন। ভুল হলে সঠিক উত্তর ও পুরো সমাধান দেখুন। ${MCQ.length}টি বহুনির্বাচনী ছাড়াও প্রতিবার নতুন নতুন প্রশ্ন তৈরি হয়।`} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
        <Reveal y={16} className="lg:sticky lg:top-[4.75rem]">
          <div className="card p-5 sm:p-6">
            <div className="space-y-3">
              <PillChoice id="pmode" value={mode} onChange={changeMode} options={MODES} />
              {mode !== "mcq" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-ink/60">কঠিনতা</span>
                  <PillChoice id="plevel" value={level} onChange={changeLevel} options={LEVELS} />
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-ink/[.04] p-4 sm:p-5">
              <p className="text-sm font-semibold text-ink/55">প্রশ্ন</p>
              <p className="mt-1.5 text-xl leading-[2] sm:text-2xl">{question}</p>
            </div>

            {q.kind === "mcq" ? (
              <div className="mt-4 grid gap-2.5" role="group" aria-label="বিকল্প">
                {q.opts.map((o, i) => {
                  const shown = !!status;
                  const style = shown ? (o.ok ? "bg-mint ring-emerald-500/50 text-emerald-900 dark:text-emerald-100" : status.pick === i ? "bg-peach ring-orange-500/50" : "bg-surface ring-ink/10 opacity-60") : "bg-surface ring-ink/10 hover:bg-ink/[.05] active:scale-[.99]";
                  return (
                    <button key={i} type="button" onClick={() => choose(i)} disabled={shown} className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-lg font-semibold ring-1 transition ${style}`}>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/10 text-sm font-bold">{"কখগঘ"[i]}</span>
                      <span className="min-w-0"><Rich text={o.t} /></span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form className="mt-5" onSubmit={(e) => { e.preventDefault(); if (!done) check(); }}>
                <label htmlFor="ans" className="mb-2 block text-sm font-semibold text-ink/60">তোমার উত্তর ({BASE_NAME[base]})</label>
                <div className="flex items-center gap-2">
                  <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-surface px-4 ring-1 focus-within:ring-2 ${status?.ok ? "ring-emerald-500 focus-within:ring-emerald-500" : status?.bad ? "ring-rose-500/60 focus-within:ring-rose-500" : "ring-ink/10 focus-within:ring-violet-500/70"}`}>
                    <input id="ans" value={ans} onChange={(e) => { setAns(e.target.value); if (status?.invalid) setStatus(null); }} disabled={done} autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false} placeholder="উত্তর লেখো"
                      className="num min-w-0 flex-1 bg-transparent py-3.5 text-2xl font-semibold outline-none placeholder:text-ink/25 disabled:opacity-70" />
                    <span className={`num shrink-0 rounded-lg px-2 py-1 text-sm font-bold ${CLR[base].bg} ${CLR[base].text}`}>({base})</span>
                  </div>
                  {done
                    ? <button type="button" onClick={() => next()} className="shrink-0 rounded-2xl bg-ink px-5 py-3.5 text-[15px] font-bold text-paper transition hover:bg-ink/85 active:scale-95">পরের প্রশ্ন</button>
                    : <button type="submit" disabled={!ans.trim()} className="shrink-0 rounded-2xl bg-ink px-5 py-3.5 text-[15px] font-bold text-paper transition enabled:hover:bg-ink/85 enabled:active:scale-95 disabled:opacity-40">যাচাই</button>}
                </div>
                {status?.invalid && <p role="alert" className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{status.invalid}</p>}
              </form>
            )}

            <AnimatePresence mode="wait">
              {status?.ok && (
                <motion.div key="ok" initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-mint px-4 py-3.5 text-lg font-bold text-emerald-900 ring-1 ring-emerald-500/25 dark:text-emerald-200">
                  সঠিক! চমৎকার হয়েছে।
                </motion.div>
              )}
              {status?.bad && !status.invalid && q.kind !== "mcq" && (
                <motion.div key="bad" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-peach px-4 py-3.5 ring-1 ring-orange-500/25">
                  <p className="font-bold text-orange-900 dark:text-orange-200">উত্তর মেলেনি।</p>
                  <p className="mt-1 text-orange-900 dark:text-orange-100">সঠিক উত্তর: <b className="num">({disp(q.expect)})<sub>{base}</sub></b></p>
                </motion.div>
              )}
              {status?.bad && q.kind === "mcq" && (
                <motion.div key="badm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-peach px-4 py-3.5 font-bold text-orange-900 ring-1 ring-orange-500/25 dark:text-orange-200">
                  উত্তর মেলেনি। সঠিক উত্তর সবুজ রঙে দেখানো হয়েছে।
                </motion.div>
              )}
            </AnimatePresence>
            {q.kind === "mcq" && status && (
              <div className="mt-4">
                <p className="leading-[1.85] text-ink/80"><b>ব্যাখ্যা: </b><Rich text={q.e} /></p>
                <button type="button" onClick={() => next()} className="mt-4 rounded-2xl bg-ink px-5 py-3 text-[15px] font-bold text-paper transition hover:bg-ink/85 active:scale-95">পরের প্রশ্ন</button>
              </div>
            )}
          </div>
        </Reveal>

        <div className="min-w-0 space-y-4">
          <div className="card p-5 sm:p-6" aria-live="polite">
            <h2 className="text-lg font-bold">তোমার অগ্রগতি</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["সঠিক", score.ok, "bg-mint"], ["মোট", score.total, "bg-sky"], ["টানা সঠিক", score.streak, "bg-lilac"], ["সর্বোচ্চ টানা", score.best, "bg-peach"]].map(([l, v, bg]) => (
                <div key={l} className={`rounded-2xl p-4 ${bg}`}><p className="text-sm font-semibold text-ink/60">{l}</p><p className="num mt-1 text-3xl font-extrabold">{v}</p></div>
              ))}
            </div>
          </div>

          {steps ? (
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">সমাধান কীভাবে হলো</h2>
              <div className="mt-4"><Blocks blocks={steps} /></div>
            </div>
          ) : (
            <div className="card p-5 sm:p-7">
              <h2 className="text-lg font-bold">কীভাবে অনুশীলন করবে</h2>
              <ul className="mt-3 space-y-2.5 leading-[1.8] text-ink/75">
                <li><b>রূপান্তর:</b> 12 ধরনের জোড়া থেকে এলোমেলো প্রশ্ন। কঠিন স্তরে বড় সংখ্যা ও ভগ্নাংশ আসে।</li>
                <li><b>যোগ-বিয়োগ-গুণ-ভাগ:</b> বাইনারি, অক্টাল ও হেক্সে হিসাব। কঠিন স্তরে ভাগও আছে।</li>
                <li><b>পরিপূরক:</b> 1-এর ও 2-এর পরিপূরক এবং 2-এর পরিপূরক দিয়ে বিয়োগ।</li>
                <li><b>বহুনির্বাচনী:</b> পরীক্ষার ধাঁচের প্রশ্ন, উত্তরের পর ব্যাখ্যাসহ।</li>
              </ul>
              <p className="mt-4 text-ink/55">ভুল উত্তর দিলে এখানে পুরো সমাধান দেখা যাবে। উত্তরে বাংলা অঙ্ক (১০১০) বা ছোট হাতের হেক্স (ff) লিখলেও চলবে।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
