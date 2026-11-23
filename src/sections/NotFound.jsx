import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BinaryText } from "../components/BinaryText";
import { BlurText, DigitRoll, Pill, Reveal } from "../components/ui";
import { CLR } from "../components/controls";
import { BASE_NAME } from "../lib/engine";
import { navigate } from "../lib/router";

/* ৪০৪ পেজ। "404" নিজেই একটি সংখ্যা: বাইনারিতে 110010100। তাই লেখাটি 0/1 হয়ে ঝিলমিল করে ডিকোড হয় (motion-brew BinaryText),
   পেছনে 0/1 ঝরে পড়ে, আর নিচের ৯টি বিটে ক্লিক করে পাঠক নিজে মান বদলে দেখতে পারে। বোতাম দুটি motion-brew-র magnetic বোতামের মতো কার্সরের দিকে ঝোঁকে। */
const TARGET = 404;
const WEIGHTS = [256, 128, 64, 32, 16, 8, 4, 2, 1];
const START = TARGET.toString(2).padStart(WEIGHTS.length, "0").split("").map(Number);
const SHOW = [[2, TARGET.toString(2)], [8, TARGET.toString(8)], [16, TARGET.toString(16).toUpperCase()]];

/* ঝরা বিটের সারি: CSS অ্যানিমেশন, তাই হালকা; "কম অ্যানিমেশন" চালু থাকলে পুরোই লুকানো (index.css) */
const RAIN = Array.from({ length: 18 }, (_, i) => ({ left: (i * 5.9 + (i % 3) * 1.9) % 98, delay: -((i * 0.83) % 7), dur: 7 + ((i * 1.7) % 6), ch: i % 3 === 0 ? "0" : i % 3 === 1 ? "1" : (i % 2 ? "1" : "0"), size: 13 + (i % 4) * 5 }));
function BitRain() {
  return (
    <div aria-hidden className="bit-rain pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {RAIN.map((b, i) => <span key={i} className="num" style={{ left: `${b.left}%`, fontSize: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>{b.ch}</span>)}
    </div>
  );
}

function BitSwitches() {
  const reduce = useReducedMotion();
  const [bits, setBits] = useState(START);
  const value = bits.reduce((s, b, i) => s + b * WEIGHTS[i], 0);
  const solved = value === TARGET;
  const flip = (i) => setBits((a) => a.map((b, k) => (k === i ? 1 - b : b)));
  return (
    <div className="card mx-auto mt-10 w-full max-w-xl p-5 sm:p-6">
      <p className="text-sm font-bold text-ink/55">বিটে ক্লিক করে মান বদলাও</p>
      <div role="group" aria-label="৯ বিটের সুইচ" className="mt-4 grid grid-cols-9 gap-1.5 sm:gap-2">
        {bits.map((b, i) => (
          <div key={WEIGHTS[i]} className="flex min-w-0 flex-col items-center gap-1.5">
            <motion.button type="button" aria-pressed={!!b} aria-label={`${WEIGHTS[i]} এর ঘর, এখন ${b}`} onClick={() => flip(i)} whileTap={reduce ? undefined : { scale: 0.88 }}
              className={`num grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-xl text-xl font-extrabold transition-colors sm:text-2xl ${b ? "bg-ink text-paper" : "bg-ink/[.07] text-ink/45 hover:bg-ink/[.12]"}`}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={b} initial={reduce ? false : { y: b ? 14 : -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: b ? -14 : 14, opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 30 }}>{b}</motion.span>
              </AnimatePresence>
            </motion.button>
            <span className="num text-[10px] font-bold text-ink/45 sm:text-xs">{WEIGHTS[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink/[.05] px-4 py-3" aria-live="polite">
        <span className="text-sm font-bold text-ink/60">ডেসিমাল মান</span>
        <span className={`num text-2xl font-extrabold transition-colors ${solved ? "text-emerald-600 dark:text-emerald-400" : ""}`}><DigitRoll text={String(value)} /></span>
        <span className="basis-full text-sm text-ink/60 sm:basis-auto">{solved ? "ঠিক 404! ঠিকানার মতোই এখানেও কিছু নেই।" : "বিটগুলো মিলিয়ে 404 বানাতে পারো কিনা দেখো।"}</span>
      </div>
      {!solved && <button type="button" onClick={() => setBits(START)} className="mt-3 text-sm font-semibold text-ink/70 underline decoration-ink/25 underline-offset-4 transition hover:text-ink">আবার 404 করো</button>}
    </div>
  );
}

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="relative mx-auto w-full max-w-3xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pt-16">
      <BitRain />
      <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-peach px-4 py-1.5 text-sm font-semibold ring-1 ring-ink/[.06]"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />ভুল ঠিকানা</p>
      <BinaryText as="h1" text="404" duration={1.3} className="block text-[5.5rem] font-extrabold leading-none tracking-tight min-[400px]:text-[7.5rem] sm:text-[11rem]" />
      <h2 id="nf-title" className="mt-4 text-2xl font-extrabold sm:text-4xl"><BlurText text="পেজটি খুঁজে পাওয়া যায়নি" delay={0.5} /></h2>
      <Reveal y={14} delay={0.2}>
        <p className="mx-auto mt-3 max-w-lg text-lg leading-[1.85] text-ink/65">তুমি যে ঠিকানাটি খুলতে চেয়েছিলে সেটি এই অ্যাপে নেই। ঠিকানায় ভুল থাকতে পারে, নয়তো পেজটি সরে গেছে।</p>
        <ul aria-label="404 সংখ্যাটির তিন রূপ" className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {SHOW.map(([b, v]) => (
            <li key={b} className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm ring-1 ${CLR[b].bg} ${CLR[b].ring}`}>
              <span className={`font-bold ${CLR[b].text}`}>{BASE_NAME[b]}</span><span className={`num font-extrabold ${CLR[b].text}`}>{v}</span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal y={18} delay={0.1}><BitSwitches /></Reveal>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Pill onClick={() => navigate("/")}>হোমে ফিরে যাও</Pill>
        <Pill onClick={() => navigate("/convert")} dark={false}>রূপান্তর করো</Pill>
      </div>
    </section>
  );
}
