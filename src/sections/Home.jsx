import { useEffect, useMemo, useState } from "react";
import { BASES, BASE_NAME, parseNum, ratToBase, showVal } from "../lib/engine";
import { useFmt, usePrecision } from "../lib/settings";
import { navigate } from "../lib/router";
import { BlurText, DigitRoll, Pill, Reveal, SwapWord, TiltCard } from "../components/ui";
import { BaseTabs, CLR, NumberField, disp } from "../components/controls";

const WORDS = ["রূপান্তর", "যোগ", "বিয়োগ", "গুণ", "ভাগ"];

const FEATURES = [
  { to: "/convert", bg: "bg-lilac", t: "রূপান্তর", big: "12 জোড়া", d: "চার পদ্ধতির যেকোনোটি থেকে যেকোনোটিতে, ভগ্নাংশ ও ঋণাত্মকসহ। ভাগ-গুণ, স্থানীয় মান, গ্রুপ পদ্ধতিতে সমাধান।" },
  { to: "/calc", bg: "bg-mint", t: "যোগ · বিয়োগ · গুণ · ভাগ", big: "কলাম হিসাব", d: "ক্যারি ও ধার দেখিয়ে পাঠ্যবইয়ের মতো হিসাব। যোগে একসাথে অনেক সংখ্যা, বাইনারি বিয়োগে 1-এর ও 2-এর পরিপূরকও আছে।" },
  { to: "/practice", bg: "bg-peach", t: "অনুশীলন", big: "নিজে করুন", d: "এলোমেলো প্রশ্ন, সাথে সাথে যাচাই। ভুল হলে সঠিক উত্তর ও পুরো সমাধান।" },
];

export default function Home({ onOpen }) {
  const fmt = useFmt();
  const [prec] = usePrecision();
  const [i, setI] = useState(0);
  const [live, setLive] = useState({ base: 10, value: "202" });
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2200); return () => clearInterval(t); }, []);
  const p = useMemo(() => parseNum(live.value, live.base), [live]);
  const err = !p.ok && !p.empty ? p.msg : null;

  return (
    <>
      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-10 pt-8 sm:px-6 sm:pt-16 lg:px-8 lg:min-h-[80svh] grid-cols-[minmax(0,1fr)] lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <p className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-mint px-4 py-1.5 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-600/15 dark:text-emerald-200 dark:ring-emerald-400/20">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> এইচএসসি আইসিটি · সংখ্যা পদ্ধতি
          </p>
          <h1 className="text-[2.7rem] font-extrabold leading-[1.15] min-[400px]:text-5xl sm:text-7xl">
            <BlurText text="সংখ্যা পদ্ধতি" delay={0.1} />
            <span className="mt-1 block text-ink/45"><BlurText text="ধাপে ধাপে" delay={0.45} /> <SwapWord words={WORDS} index={i} className="text-ink" /></span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-[1.9] text-ink/65">বাইনারি, অক্টাল, ডেসিমাল ও হেক্সাডেসিমাল - ভগ্নাংশসহ যেকোনো সংখ্যা বসান। উত্তরের সাথে পাবেন পাঠ্যবইয়ের নিয়মে পুরো সমাধান।</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill onClick={() => navigate("/convert")}>রূপান্তর করি</Pill>
            <Pill onClick={() => navigate("/calc")} dark={false}>যোগ-বিয়োগ-গুণ-ভাগ</Pill>
          </div>
        </div>

        <TiltCard className="card mx-auto w-full max-w-md p-5 sm:p-6">
          <p className="text-sm font-bold text-ink/55">এখনই চেষ্টা করুন</p>
          <div className="mt-3 space-y-4">
            <BaseTabs id="live" value={live.base} onChange={(base) => setLive({ ...live, base })} />
            <NumberField label="সংখ্যা লিখুন" base={live.base} value={live.value} onChange={(value) => setLive({ ...live, value })} error={err} chips={false} id="live-in" />
          </div>
          <div className="mt-4 space-y-2">
            {BASES.map((b) => {
              const r = p.ok ? ratToBase(p.rat, b, prec) : null;
              const v = r ? showVal(r) : "";
              return (
                <button key={b} type="button" disabled={!p.ok} onClick={() => onOpen(live.base, b, p.neg ? "-" + p.int + (p.frac ? "." + p.frac : "") : p.int + (p.frac ? "." + p.frac : ""))}
                  className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-left ring-1 transition enabled:active:scale-[.98] ${CLR[b].bg} ${CLR[b].ring}`}>
                  <span className={`shrink-0 text-sm font-bold ${CLR[b].text}`}>{BASE_NAME[b]}</span>
                  <span className={`num min-w-0 break-all text-right text-lg font-bold ${CLR[b].text}`}>{r ? <>{!r.exact && "≈ "}<DigitRoll text={disp(v)} /></> : "—"}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink/50">কোনো সারিতে চাপ দিলে পুরো ধাপ দেখা যাবে।</p>
        </TiltCard>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, k) => (
            <Reveal key={f.to} delay={k * 0.08}>
              <button type="button" onClick={() => navigate(f.to)} className={`group h-full w-full rounded-3xl p-6 text-left ring-1 ring-ink/[.06] transition hover:-translate-y-1 active:scale-[.98] ${f.bg}`}>
                <p className="text-sm font-bold text-ink/60">{f.t}</p>
                <p className="mt-2 text-3xl font-extrabold">{fmt(f.big)}</p>
                <p className="mt-3 leading-[1.8] text-ink/70">{f.d}</p>
              </button>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-4" y={16}>
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
            <p className="max-w-xl leading-[1.8] text-ink/70"><b className="text-ink">ফোনে ইনস্টল করুন।</b> একবার খুললে ইন্টারনেট ছাড়াও চলে। সব হিসাব আপনার ডিভাইসেই হয়।</p>
            <button type="button" onClick={() => navigate("/learn")} className="rounded-full bg-ink/[.07] px-5 py-2.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">নিয়মকানুন দেখুন</button>
          </div>
        </Reveal>
      </section>
    </>
  );
}
