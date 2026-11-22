import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CATS, CAT_COUNT, CAT_LABEL, QUESTIONS } from "../lib/quizbank";
import { shuffle } from "../lib/questions";
import { Detail, Rich } from "../components/Steps";
import { PillChoice } from "../components/controls";
import { Reveal } from "../components/ui";

/* বহুনির্বাচনী কুইজ: বিষয় ও প্রশ্ন সংখ্যা বেছে শুরু → একটি একটি করে উত্তর ও সাথে সাথে ব্যাখ্যা → শেষে ফলাফল ও ভুলগুলোর পুনরালোচনা */
const LENS = [10, 20, 30, 50];
const LETTERS = "কখগঘ";
const store = {
  get(k, d) { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const build = (q) => ({ q, opts: shuffle(q.o.map((t, k) => ({ t, ok: k === 0 }))), pick: null });

/** নতুন প্রশ্ন আগে, সব বিষয় মিশ্র হলে বিষয় ধরে সমানভাবে ভাগ করে নেওয়া */
function sample(pool, n, seen) {
  const ordered = [...shuffle(pool.filter((q) => !seen.has(q.id))), ...shuffle(pool.filter((q) => seen.has(q.id)))];
  const cats = [...new Set(ordered.map((q) => q.c))];
  if (cats.length === 1) return shuffle(ordered.slice(0, n));
  const by = Object.fromEntries(cats.map((c) => [c, ordered.filter((q) => q.c === c)]));
  const order = shuffle(cats), out = [];
  while (out.length < n && out.length < ordered.length) for (const c of order) { if (out.length >= n) break; const q = by[c].shift(); if (q) out.push(q); }
  return shuffle(out);
}

const Chip = ({ c }) => {
  const m = CATS.find((x) => x.id === c);
  return <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ring-ink/[.06] ${m?.bg || "bg-lilac"}`}>{CAT_LABEL[c]}</span>;
};

export default function Quiz() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState("setup"); // setup | play | result
  const [cat, setCat] = useState("all");
  const [len, setLen] = useState(10);
  const [run, setRun] = useState(null); // { items, i, t0, t1, retry }
  const [now, setNow] = useState(0);
  const [best, setBest] = useState(() => store.get("quiz-best", {}));
  const seen = useRef(new Set(store.get("quiz-seen", [])));

  const pool = useMemo(() => (cat === "all" ? QUESTIONS : QUESTIONS.filter((q) => q.c === cat)), [cat]);
  const n = Math.min(len, pool.length);

  const start = (items, retry = false) => {
    setRun({ items, i: 0, t0: Date.now(), t1: 0, retry });
    setNow(Date.now());
    setStage("play");
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const begin = () => {
    if (seen.current.size > QUESTIONS.length - n) seen.current = new Set(); // প্রায় সব দেখা হয়ে গেলে নতুন করে শুরু
    start(sample(pool, n, seen.current).map(build));
  };

  useEffect(() => {
    if (stage !== "play") return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stage]);

  const cur = run && stage === "play" ? run.items[run.i] : null;
  const answered = !!cur && cur.pick !== null;
  const last = !!run && run.i === run.items.length - 1;

  const choose = useCallback((k) => {
    setRun((r) => {
      if (!r || r.items[r.i].pick !== null) return r;
      const items = r.items.map((x, j) => (j === r.i ? { ...x, pick: k } : x));
      seen.current.add(items[r.i].q.id);
      return { ...r, items };
    });
  }, []);

  const finish = useCallback(() => {
    setRun((r) => {
      const t1 = Date.now();
      const ok = r.items.filter((x) => x.pick !== null && x.opts[x.pick].ok).length;
      if (!r.retry && r.items.length >= 10) {
        const pct = Math.round((ok / r.items.length) * 100);
        const key = cat;
        setBest((b) => { if ((b[key]?.pct ?? -1) >= pct) return b; const nb = { ...b, [key]: { pct, ok, total: r.items.length } }; store.set("quiz-best", nb); return nb; });
      }
      store.set("quiz-seen", [...seen.current].slice(-QUESTIONS.length));
      return { ...r, t1 };
    });
    setStage("result");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [cat]);

  const next = useCallback(() => {
    if (!run) return;
    if (run.i >= run.items.length - 1) finish();
    else setRun((r) => ({ ...r, i: r.i + 1 }));
  }, [run, finish]);

  /* কিবোর্ড: 1–4 দিয়ে উত্তর, Enter বা → দিয়ে পরের প্রশ্ন */
  useEffect(() => {
    if (stage !== "play") return undefined;
    const on = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key) && !answered) choose(+e.key - 1);
      else if ((e.key === "Enter" || e.key === "ArrowRight") && answered) { e.preventDefault(); next(); }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, [stage, answered, choose, next]);

  /* ---------- শুরুর পর্দা ---------- */
  if (stage === "setup") {
    const tiles = [{ id: "all", label: "সব বিষয় (মিশ্র)", bg: "bg-lilac", note: "সব বিষয় থেকে সমানভাবে" }, ...CATS];
    return (
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Reveal y={16}>
          <div className="card p-5 sm:p-7">
            <h2 className="text-2xl font-extrabold">বিষয় বাছুন</h2>
            <p className="mt-1 text-ink/55">মোট {QUESTIONS.length}টি বহুনির্বাচনী প্রশ্ন। প্রতিবার নতুন প্রশ্নগুলো আগে আসে।</p>
            <div role="radiogroup" aria-label="বিষয়" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tiles.map((t) => {
                const on = cat === t.id, count = t.id === "all" ? QUESTIONS.length : CAT_COUNT[t.id], b = best[t.id];
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setCat(t.id)}
                    className={`relative rounded-3xl p-4 text-left ring-1 transition active:scale-[.98] ${t.bg} ${on ? "ring-2 ring-ink" : "ring-ink/[.08] hover:ring-ink/25"} ${t.id === "all" ? "sm:col-span-2 xl:col-span-3" : ""}`}>
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-lg font-extrabold">{t.label}</span>
                      <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full text-sm font-bold ${on ? "bg-ink text-paper" : "bg-ink/10 text-transparent"}`}>✓</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-ink/60">{t.note}</span>
                    <span className="num mt-2 flex flex-wrap gap-x-3 text-sm font-semibold text-ink/70">
                      <span>{count}টি প্রশ্ন</span>
                      {b && <span className="text-emerald-800 dark:text-emerald-300">সেরা: {b.pct}%</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
        <Reveal y={16} className="lg:sticky lg:top-[4.75rem]">
          <div className="card p-5 sm:p-6">
            <h2 className="text-lg font-bold">কুইজ শুরু করুন</h2>
            <p className="mt-3 text-sm font-semibold text-ink/60">প্রশ্ন সংখ্যা</p>
            <div className="mt-2"><PillChoice id="qlen" value={len} onChange={setLen} options={LENS.map((x) => ({ id: x, label: String(x) }))} /></div>
            <p className="mt-3 text-sm text-ink/55">{cat === "all" ? "সব বিষয়" : CAT_LABEL[cat]} থেকে <b className="num">{n}</b>টি প্রশ্ন আসবে{n < len ? ` (এই বিষয়ে মোট ${pool.length}টিই আছে)` : ""}।</p>
            <button type="button" onClick={begin} className="mt-5 w-full rounded-2xl bg-ink px-5 py-3.5 text-lg font-bold text-paper transition hover:bg-ink/85 active:scale-[.98]">কুইজ শুরু করুন →</button>
            <ul className="mt-5 space-y-2 text-[15px] leading-relaxed text-ink/70">
              <li>• প্রতিটি উত্তরের সাথে সাথে সঠিক উত্তর ও ব্যাখ্যা দেখা যায়।</li>
              <li>• যোগ-বিয়োগ-গুণ-ভাগ ও রূপান্তরে পুরো সমাধানও খুলে দেখা যায়।</li>
              <li>• কিবোর্ডে <b>1–4</b> চাপলে উত্তর, <b>Enter</b> চাপলে পরের প্রশ্ন।</li>
              <li>• শেষে ফলাফল ও ভুলগুলো আবার করার সুযোগ।</li>
            </ul>
          </div>
        </Reveal>
      </div>
    );
  }

  /* ---------- কুইজ চলছে ---------- */
  if (stage === "play" && cur) {
    const total = run.items.length;
    const okSoFar = run.items.filter((x) => x.pick !== null && x.opts[x.pick].ok).length;
    const doneN = run.items.filter((x) => x.pick !== null).length;
    const good = answered && cur.opts[cur.pick].ok;
    const q = cur.q;
    const steps = q.s ? q.s() : null;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="num text-lg font-extrabold">প্রশ্ন {run.i + 1} <span className="text-ink/45">/ {total}</span></p>
            <div className="num flex items-center gap-2 text-sm font-semibold text-ink/65">
              <span className="rounded-full bg-mint px-3 py-1 text-emerald-900 dark:text-emerald-200">সঠিক {okSoFar}</span>
              <span className="rounded-full bg-sky px-3 py-1">⏱ {mmss(Math.max(0, Math.round((now - run.t0) / 1000)))}</span>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[.08]" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneN} aria-label="অগ্রগতি">
            <motion.div className="h-full rounded-full bg-violet-500" initial={false} animate={{ width: `${(doneN / total) * 100}%` }} transition={{ duration: reduce ? 0 : 0.35 }} />
          </div>

          <div>
            <motion.div key={run.i} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div className="mt-5"><Chip c={q.c} /></div>
              <p className="mt-3 text-xl font-semibold leading-[1.9] sm:text-2xl"><Rich text={q.q} /></p>

              <div className="mt-5 grid gap-2.5" role="group" aria-label="বিকল্প">
                {cur.opts.map((o, k) => {
                  const style = answered ? (o.ok ? "bg-mint ring-emerald-500/50 text-emerald-900 dark:text-emerald-100" : cur.pick === k ? "bg-peach ring-orange-500/50" : "bg-surface ring-ink/10 opacity-60") : "bg-surface ring-ink/10 hover:bg-ink/[.05] active:scale-[.99]";
                  return (
                    <button key={k} type="button" onClick={() => choose(k)} disabled={answered} aria-label={`${LETTERS[k]}: ${o.t.replace(/\{\{([^}|]*)(\|\d+)?\}\}/g, "$1")}`}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-lg font-semibold ring-1 transition ${style}`}>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/10 text-sm font-bold">{LETTERS[k]}</span>
                      <span className="min-w-0 flex-1 break-words"><Rich text={o.t} /></span>
                      {answered && o.ok && <span aria-hidden className="shrink-0 text-xl">✓</span>}
                      {answered && cur.pick === k && !o.ok && <span aria-hidden className="shrink-0 text-xl">✗</span>}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-4" aria-live="polite">
                  <div className={`rounded-2xl px-4 py-3 font-bold ring-1 ${good ? "bg-mint text-emerald-900 ring-emerald-500/25 dark:text-emerald-200" : "bg-peach text-orange-900 ring-orange-500/25 dark:text-orange-200"}`}>
                    {good ? "সঠিক! চমৎকার হয়েছে।" : <>উত্তর মেলেনি। সঠিক উত্তর: <Rich text={q.o[0]} /></>}
                  </div>
                  <p className="mt-3 leading-[1.85] text-ink/80"><b>ব্যাখ্যা: </b><Rich text={q.e} /></p>
                  {steps && <Detail key={run.i} title="পুরো সমাধান দেখুন (ধাপে ধাপে)" blocks={steps} open={!good} />}
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setStage("setup")} className="rounded-full px-4 py-2 text-sm font-semibold text-ink/55 transition hover:bg-ink/[.06] hover:text-ink">কুইজ ছাড়ুন</button>
            {answered && <button type="button" onClick={next} className="rounded-2xl bg-ink px-6 py-3 text-[15px] font-bold text-paper transition hover:bg-ink/85 active:scale-95">{last ? "ফলাফল দেখুন" : "পরের প্রশ্ন →"}</button>}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- ফলাফল ---------- */
  if (stage === "result" && run) {
    const total = run.items.length;
    const okN = run.items.filter((x) => x.pick !== null && x.opts[x.pick].ok).length;
    const pct = Math.round((okN / total) * 100);
    const secs = Math.max(1, Math.round((run.t1 - run.t0) / 1000));
    const wrong = run.items.filter((x) => x.pick === null || !x.opts[x.pick].ok);
    const msg = pct >= 90 ? "অসাধারণ! পরীক্ষার জন্য তুমি প্রস্তুত।" : pct >= 75 ? "খুব ভালো হয়েছে। ভুলগুলো একবার দেখে নাও।" : pct >= 50 ? "ভালো চেষ্টা। ভুলগুলো আবার করলে আরও ভালো হবে।" : "আরও অনুশীলন দরকার। শিখুন পেজের নিয়মগুলো দেখে আবার চেষ্টা করো।";
    const byCat = CATS.map((c) => { const xs = run.items.filter((x) => x.q.c === c.id); return { ...c, total: xs.length, ok: xs.filter((x) => x.pick !== null && x.opts[x.pick].ok).length }; }).filter((c) => c.total);
    const R = 52, C = 2 * Math.PI * R;
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Reveal y={14}>
          <div className="card p-5 text-center sm:p-8">
            <h2 className="text-2xl font-extrabold">{run.retry ? "পুনরায় চেষ্টার ফলাফল" : "কুইজের ফলাফল"}</h2>
            <div className="relative mx-auto mt-5 size-40">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
                <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-ink/10" />
                <motion.circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" strokeLinecap="round" className={pct >= 75 ? "stroke-emerald-500" : pct >= 50 ? "stroke-amber-500" : "stroke-rose-500"}
                  strokeDasharray={C} initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: reduce ? 0 : 1, ease: [0.22, 1, 0.36, 1] }} />
              </svg>
              <div className="absolute inset-0 grid place-items-center"><div><p className="num text-4xl font-extrabold">{pct}%</p><p className="num text-sm font-semibold text-ink/55">{okN} / {total}</p></div></div>
            </div>
            <p className="mt-4 text-lg font-semibold">{msg}</p>
            <div className="num mt-4 flex flex-wrap justify-center gap-2 text-sm font-semibold">
              <span className="rounded-full bg-mint px-3.5 py-1.5 text-emerald-900 dark:text-emerald-200">সঠিক {okN}</span>
              <span className="rounded-full bg-peach px-3.5 py-1.5 text-orange-900 dark:text-orange-200">ভুল {total - okN}</span>
              <span className="rounded-full bg-sky px-3.5 py-1.5">সময় {mmss(secs)}</span>
              <span className="rounded-full bg-lilac px-3.5 py-1.5">গড় {Math.round(secs / total)} সেকেন্ড/প্রশ্ন</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {wrong.length > 0 && <button type="button" onClick={() => start(shuffle(wrong.map((x) => build(x.q))), true)} className="rounded-2xl bg-ink px-5 py-3 font-bold text-paper transition hover:bg-ink/85 active:scale-95">ভুলগুলো আবার করুন ({wrong.length})</button>}
              {!run.retry && <button type="button" onClick={begin} className={`rounded-2xl px-5 py-3 font-bold transition active:scale-95 ${wrong.length ? "bg-ink/[.08] hover:bg-ink/[.14]" : "bg-ink text-paper hover:bg-ink/85"}`}>নতুন কুইজ</button>}
              <button type="button" onClick={() => setStage("setup")} className="rounded-2xl bg-ink/[.08] px-5 py-3 font-bold transition hover:bg-ink/[.14] active:scale-95">বিষয় বদলান</button>
            </div>
          </div>
        </Reveal>

        {byCat.length > 1 && (
          <Reveal y={14}>
            <div className="card p-5 sm:p-7">
              <h3 className="text-lg font-extrabold">বিষয় অনুযায়ী ফল</h3>
              <ul className="mt-3 space-y-3">
                {byCat.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[15px]"><span className="font-semibold">{c.label}</span><span className="num text-ink/60">{c.ok}/{c.total}</span></div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/[.08]"><div className={`h-full rounded-full ${c.ok / c.total >= 0.75 ? "bg-emerald-500" : c.ok / c.total >= 0.5 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${(c.ok / c.total) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {wrong.length > 0 ? (
          <Reveal y={14}>
            <div className="card p-5 sm:p-7">
              <h3 className="text-lg font-extrabold">ভুল প্রশ্নগুলোর সমাধান</h3>
              <p className="mt-1 text-ink/55">প্রতিটিতে চাপ দিলে সঠিক উত্তর ও পুরো সমাধান খুলবে।</p>
              {wrong.map((x, i) => (
                <Detail key={x.q.id} title={`${i + 1}. ${x.q.q}`} blocks={[
                  { t: "p", text: x.pick === null ? "তুমি এই প্রশ্নের উত্তর দাওনি।" : `তোমার উত্তর: ${x.opts[x.pick].t}` },
                  { t: "box", text: `সঠিক উত্তর: ${x.q.o[0]}` },
                  { t: "p", text: x.q.e },
                  ...(x.q.s ? [{ t: "h", text: "পুরো সমাধান" }, ...x.q.s()] : []),
                ]} />
              ))}
            </div>
          </Reveal>
        ) : (
          <p className="rounded-2xl bg-mint px-4 py-3 text-center text-lg font-bold text-emerald-900 ring-1 ring-emerald-500/25 dark:text-emerald-200">একটিও ভুল হয়নি! 🎉</p>
        )}
      </div>
    );
  }
  return null;
}
