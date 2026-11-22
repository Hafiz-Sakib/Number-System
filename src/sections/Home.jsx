import { useEffect, useMemo, useState } from "react";
import { BASES, BASE_NAME, parseNum, ratToBase, showVal } from "../lib/engine";
import { usePrecision } from "../lib/settings";
import { navigate } from "../lib/router";
import { BlurText, DigitRoll, Pill, SwapWord, TiltCard } from "../components/ui";
import { BaseTabs, CLR, NumberField, disp } from "../components/controls";
import HomePlay from "../components/HomePlay";

const WORDS = ["রূপান্তর", "যোগ", "বিয়োগ", "গুণ", "ভাগ"];

export default function Home({ onOpen }) {
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

      <HomePlay />
    </>
  );
}
