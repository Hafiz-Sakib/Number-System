import { useMemo } from "react";
import { motion } from "framer-motion";
import { BASES, BASE_NAME, ratToBase, convert, showVal } from "../lib/engine";
import { usePrecision } from "../lib/settings";
import { navigate } from "../lib/router";
import { Blocks } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { BaseTabs, NumberField, PrecisionSelect, ResultCard, MobileResultBar, CopyButton, CLR, disp } from "../components/controls";

const EXAMPLES = [
  { from: 10, to: 2, v: "25.625", label: "25.625 ডেসিমাল → বাইনারি" },
  { from: 2, to: 10, v: "1010.01", label: "1010.01 বাইনারি → ডেসিমাল" },
  { from: 2, to: 16, v: "1011010.101", label: "1011010.101 বাইনারি → হেক্স" },
  { from: 8, to: 16, v: "755", label: "755 অক্টাল → হেক্স" },
  { from: 16, to: 10, v: "3A.8", label: "3A.8 হেক্স → ডেসিমাল" },
];

export default function Convert({ s, set, onUse }) {
    const [prec] = usePrecision();
  const res = useMemo(() => convert(s.value, s.from, s.to, prec), [s.value, s.from, s.to, prec]);
  const err = !res.ok && !res.empty ? res.msg : null;
  const all = useMemo(() => (res.ok ? BASES.map((b) => ({ base: b, ...ratToBase(res.rat, b, prec) })) : []), [res, prec]);
  const swap = () => set({ from: s.to, to: s.from, value: res.ok ? res.text : s.value });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="সংখ্যা রূপান্তর" sub="যেকোনো সংখ্যা পদ্ধতির সংখ্যাকে অন্য পদ্ধতিতে বদলান। উত্তরের সাথে পাবেন পুরো হিসাব।" />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[26rem_minmax(0,1fr)] xl:grid-cols-[29rem_minmax(0,1fr)]">
        <div className="space-y-3 lg:sticky lg:top-[4.75rem] lg:-mx-1 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:px-1 lg:pb-2">
          <Reveal y={16}>
            <div className="card space-y-3.5 p-4 sm:space-y-5 sm:p-6">
              <BaseTabs id="from" label="যে পদ্ধতির সংখ্যা দেবেন" value={s.from} onChange={(from) => set({ ...s, from })} />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-ink/10" />
                <motion.button type="button" onClick={swap} aria-label="পদ্ধতি দুটি অদল-বদল করুন" whileTap={{ rotate: 180, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper shadow-md sm:h-11 sm:w-11 transition-colors hover:bg-ink/85">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" /></svg>
                </motion.button>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
              <BaseTabs id="to" label="যে পদ্ধতিতে চান" value={s.to} onChange={(to) => set({ ...s, to })} />
              <NumberField label={`${BASE_NAME[s.from]} সংখ্যা`} base={s.from} value={s.value} onChange={(value) => set({ ...s, value })} error={err} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PrecisionSelect />
                <span className="hidden text-sm text-ink/50 min-[480px]:inline">Negative (−) ও ভগ্নাংশ (.) চলবে</span>
              </div>
            </div>
          </Reveal>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" aria-label="উদাহরণ">
            <span className="shrink-0 py-1.5 text-sm font-semibold text-ink/50">উদাহরণ:</span>
            {EXAMPLES.map((e) => (
              <button key={e.label} type="button" onClick={() => set({ from: e.from, to: e.to, value: e.v })} className="shrink-0 whitespace-nowrap rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold ring-1 ring-ink/10 transition hover:bg-ink/[.05] active:scale-95">{e.label}</button>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {res.ok ? (
            <>
              <ResultCard id="main-result" title={`${BASE_NAME[s.to]} ফলাফল`} base={s.to} value={res.text} exact={res.value.exact}>
                <CopyButton text={res.text} />
                <button type="button" onClick={() => onUse(s.to, res.text)} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">যোগ-বিয়োগে নিন</button>
              </ResultCard>

              <div className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold">একই সংখ্যা চার পদ্ধতিতে</h2>
                <p className="text-sm text-ink/55">সবগুলো একসাথে দেখলে মিলিয়ে নেওয়া সহজ। চাপ দিলে সেই পদ্ধতির ধাপ দেখা যাবে।</p>
                <div className="mt-3 grid grid-cols-2 gap-2 2xl:grid-cols-4">
                  {all.map((a) => (
                    <button key={a.base} type="button" onClick={() => set({ from: s.from, to: a.base, value: s.value })}
                      className={`min-w-0 rounded-2xl px-3 py-2 text-left ring-1 transition active:scale-[.98] sm:px-4 sm:py-3 ${CLR[a.base].bg} ${CLR[a.base].ring} ${a.base === s.to ? "outline outline-2 outline-offset-2 outline-ink/60" : ""}`}>
                      <span className={`block text-sm font-bold ${CLR[a.base].text}`}>{BASE_NAME[a.base]}</span>
                      <span className={`num mt-0.5 block break-all text-base font-bold sm:text-lg ${CLR[a.base].text}`}>{!a.exact && "≈ "}{disp(showVal(a))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-4 sm:p-7">
                <h2 className="text-2xl font-extrabold">ধাপে ধাপে ব্যাখ্যা</h2>
                <p className="mt-1 text-ink/55">পাঠ্যবইয়ের নিয়মে সমাধান।</p>
                <div className="mt-4"><Blocks blocks={res.blocks} /></div>
              </div>
            </>
          ) : (
            <div className="card grid min-h-[9rem] place-items-center p-6 text-center sm:min-h-[16rem] sm:p-8">
              <div>
                <p className="text-2xl font-extrabold">উত্তর এখানে দেখা যাবে</p>
                <p className="mx-auto mt-2 max-w-sm text-ink/55">{err ? "ইনপুটের ভুলটি ঠিক করুন।" : "বাঁ দিকের ঘরে একটি সংখ্যা লিখুন বা কোনো উদাহরণে চাপ দিন।"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {res.ok && <MobileResultBar targetId="main-result" items={[{ label: `${BASE_NAME[s.to]} ফলাফল`, value: res.text, base: s.to, exact: res.value.exact }]} copyText={res.text} />}
    </div>
  );
}
