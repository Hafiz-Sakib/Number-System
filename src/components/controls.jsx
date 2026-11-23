import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BASES, BASE_NAME, BASE_SHORT } from "../lib/engine";
import { PRECISIONS, useFmt, usePrecision } from "../lib/settings";
import { DigitRoll } from "./ui";

/* প্রতিটি সংখ্যা পদ্ধতির নিজস্ব রং: বাইনারি=বেগুনি, অক্টাল=সবুজ, ডেসিমাল=আকাশি, হেক্স=কমলা */
export const CLR = {
  2: { bg: "bg-lilac", dot: "bg-violet-500", text: "text-violet-900 dark:text-violet-200", ring: "ring-violet-500/25" },
  8: { bg: "bg-mint", dot: "bg-emerald-500", text: "text-emerald-900 dark:text-emerald-200", ring: "ring-emerald-500/25" },
  10: { bg: "bg-sky", dot: "bg-sky-500", text: "text-sky-900 dark:text-sky-200", ring: "ring-sky-500/25" },
  16: { bg: "bg-peach", dot: "bg-orange-500", text: "text-orange-900 dark:text-orange-200", ring: "ring-orange-500/25" },
};
const DIGITS = "0123456789ABCDEF";
const disp = (t) => String(t).replace(/^-/, "−");

/* সংখ্যা পদ্ধতি বাছাই: নরম পিল এক পদ্ধতি থেকে আরেকটিতে গড়িয়ে যায় */
export function BaseTabs({ value, onChange, label, id }) {
  const uid = useId();
  const fmt = useFmt();
  const still = !!useReducedMotion();
  return (
    <div>
      {label && <p className="mb-2 text-sm font-semibold text-ink/60">{label}</p>}
      <div role="radiogroup" aria-label={label} className="grid grid-cols-4 gap-1 rounded-2xl bg-ink/[.06] p-1">
        {BASES.map((b) => {
          const on = value === b;
          return (
            <button key={b} type="button" role="radio" aria-checked={on} onClick={() => onChange(b)} className="relative min-w-0 rounded-xl px-1 py-2.5 text-center outline-none sm:py-2 focus-visible:ring-2 focus-visible:ring-violet-500/60">
              {on && <motion.span layoutId={`${id || uid}-base`} transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-xl bg-surface shadow-sm ring-1 ring-ink/[.06]" />}
              <span className="relative block">
                <span className="flex items-center justify-center gap-1.5">
                  <span aria-hidden className={`h-2 w-2 rounded-full ${CLR[b].dot} ${on ? "" : "opacity-50"}`} />
                  <span className={`truncate text-[13px] font-bold sm:text-[15px] ${on ? "text-ink" : "text-ink/55"}`}>
                    {BASE_SHORT[b]}
                  </span>
                </span>
                <span className={`num hidden text-[11px] sm:block sm:text-xs ${on ? "text-ink/60" : "text-ink/35"}`}>ভিত্তি {fmt(b)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* সংখ্যা লেখার ঘর: ভুল অঙ্ক দিলে বাংলায় কারণ বলে; নিচে ট্যাপ করার মতো অঙ্ক-বোতাম */
export function NumberField({ label, base, value, onChange, error, id, placeholder, chips = true, onFocus, action }) {
  const fmt = useFmt();
  const uid = useId();
  const fid = id || uid;
  const add = (ch) => onChange(value + ch);
  const toggleSign = () => onChange(/^[-−]/.test(value) ? value.replace(/^[-−]/, "") : "-" + value);
  const chip = "grid h-9 min-w-9 place-items-center rounded-xl bg-ink/[.06] px-2 text-[16px] sm:h-10 sm:min-w-10 sm:text-[17px] font-semibold transition active:scale-90 hover:bg-ink/[.11]";
  const ph = placeholder ?? (base === 2 ? "1010.11" : base === 8 ? "725.4" : base === 10 ? "25.625" : "3A.8");
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
        <label htmlFor={fid} className="block text-sm font-semibold text-ink/60">{label}</label>
        {action}
      </div>
      <div className={`flex items-center gap-2 rounded-2xl bg-surface px-4 ring-1 transition focus-within:ring-2 ${error ? "ring-rose-500/60 focus-within:ring-rose-500" : "ring-ink/10 focus-within:ring-violet-500/70"}`}>
        <input id={fid} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={fmt(ph)} inputMode="text" autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false}
          aria-invalid={!!error} aria-describedby={error ? `${fid}-err` : undefined}
          className="num min-w-0 flex-1 bg-transparent py-2.5 text-2xl font-semibold outline-none sm:py-3.5 placeholder:text-ink/25" />
        <span className={`num shrink-0 rounded-lg px-2 py-1 text-sm font-bold ${CLR[base].bg} ${CLR[base].text}`}>({fmt(base)})</span>
      </div>
      {error ? (
        <p id={`${fid}-err`} role="alert" className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>
      ) : chips && (
        <div className="mt-2 flex flex-wrap gap-1 sm:gap-1.5" aria-label="অঙ্ক বোতাম">
          {[...DIGITS.slice(0, base)].map((d) => <button key={d} type="button" onClick={() => add(fmt(d))} className={`num ${chip}`}>{fmt(d)}</button>)}
          <button type="button" onClick={() => add(".")} className={chip} aria-label="দশমিক বিন্দু">.</button>
          <button type="button" onClick={toggleSign} className={chip} aria-label="চিহ্ন বদল (ধনাত্মক/ঋণাত্মক)">±</button>
          <button type="button" onClick={() => onChange(value.slice(0, -1))} className={chip} aria-label="শেষ অঙ্ক মুছুন">⌫</button>
          {value && <button type="button" onClick={() => onChange("")} className={`${chip} text-[14px]`}>মুছুন</button>}
        </div>
      )}
    </div>
  );
}

/* গড়ানো পিল: যেকোনো ছোট তালিকা থেকে একটি বাছাই (পদ্ধতি ইত্যাদি) */
export function PillChoice({ options, value, onChange, id }) {
  const uid = useId();
  const still = !!useReducedMotion();
  return (
    <div role="tablist" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink/[.06] p-1">
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)} className="relative whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-5 sm:text-[15px]">
          {value === o.id && <motion.span layoutId={`${id || uid}-pc`} transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-surface shadow-sm ring-1 ring-ink/[.06]" />}
          <span className={`relative ${value === o.id ? "text-ink" : "text-ink/55"}`}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function PrecisionSelect({ className = "" }) {
  const [p, setP] = usePrecision();
  const fmt = useFmt();
  return (
    <label className={`inline-flex items-center gap-2 text-sm font-semibold text-ink/60 ${className}`}>
      দশমিকের পর সর্বোচ্চ
      <select value={p} onChange={(e) => setP(+e.target.value)} className="rounded-xl bg-surface px-2.5 py-1.5 text-sm font-bold text-ink ring-1 ring-ink/10 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70">
        {PRECISIONS.map((n) => <option key={n} value={n}>{fmt(n)} ঘর</option>)}
      </select>
    </label>
  );
}

export function CopyButton({ text, label = "কপি" }) {
  const [done, setDone] = useState(false);
  const go = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
    setDone(true); setTimeout(() => setDone(false), 1400);
  };
  return (
    <button type="button" onClick={go} className="inline-flex items-center gap-1.5 rounded-full bg-ink/[.07] px-3.5 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{done ? <path d="m5 12 5 5 9-10" /> : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>}</svg>
      {done ? "কপি হয়েছে" : label}
    </button>
  );
}

/* বড় উত্তর-কার্ড: রং সংখ্যা পদ্ধতির, অঙ্কগুলো গড়িয়ে বদলায় */
export function ResultCard({ title, base, value, exact = true, children, id }) {
  const fmt = useFmt();
  const t = disp(value);
  const len = t.length;
  const size = len <= 12 ? "text-4xl sm:text-5xl" : len <= 24 ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl";
  return (
    <div id={id} className={`scroll-mt-20 rounded-3xl p-4 ring-1 sm:p-6 ${CLR[base].bg} ${CLR[base].ring}`}>
      <p className={`text-sm font-bold ${CLR[base].text}`}>{title}</p>
      <div className={`num mt-2 break-all font-extrabold leading-tight ${CLR[base].text} ${size}`}>
        {!exact && <span className="mr-1 font-semibold opacity-70" title="আসন্ন মান">≈</span>}
        <DigitRoll text={t} /><sub className="ml-0.5 align-baseline text-[.42em] font-bold">({fmt(base)})</sub>
      </div>
      {!exact && <p className="mt-2 text-sm font-medium text-ink/65">ভগ্নাংশ শেষ হয় না, তাই সীমিত ঘর পর্যন্ত আসন্ন মান দেখানো হলো।</p>}
      {children && <div className="mt-4 flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ফোনে নিচে ভাসমান ছোট উত্তর-বার: ইনপুট লেখার সময় স্ক্রল না করেই উত্তর দেখা যায়। আসল উত্তর-কার্ড পর্দায় থাকলে বা ফুটারে পৌঁছালে লুকিয়ে যায়। */
export function MobileResultBar({ items, targetId, copyText }) {
  const fmt = useFmt();
  const has = !!items && items.length > 0;
  const [inView, setInView] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    if (!has) return undefined;
    const watch = (el, set) => {
      if (!el) { set(false); return () => {}; }
      const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin: "0px 0px -140px 0px" });
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(document.getElementById(targetId), setInView);
    const b = watch(document.querySelector("footer"), setAtFooter);
    return () => { a(); b(); };
  }, [has, targetId]);
  if (!has) return null;
  const show = !inView && !atFooter;
  const base0 = items[0].base ?? 2;
  const go = () => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  return createPortal(
    <div aria-hidden={!show} className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3 transition duration-200 lg:hidden ${show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`} style={{ bottom: "max(5.1rem, calc(env(safe-area-inset-bottom) + 4.7rem))" }}>
      <div className={`flex w-full max-w-[460px] items-center gap-2 rounded-2xl p-2 pl-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] ring-1 ${show ? "pointer-events-auto" : ""} ${CLR[base0].bg} ${CLR[base0].ring}`} aria-live="polite">
        {items.map((it, k) => {
          const b = it.base ?? 2;
          return (
            <button key={k} type="button" tabIndex={show ? 0 : -1} onClick={go} className="min-w-0 flex-1 text-left">
              <span className={`block truncate text-[11px] font-bold ${CLR[b].text}`}>{it.label}</span>
              <span className={`num block truncate text-lg font-extrabold leading-tight ${CLR[b].text}`}>{it.exact === false && "≈ "}{fmt(disp(it.value))}<sub className="ml-0.5 text-[.6em] font-bold">({fmt(b)})</sub></span>
            </button>
          );
        })}
        {copyText && <CopyButton text={copyText} />}
      </div>
    </div>,
    document.body,
  );
}

export { disp };

/** গোছানো উদাহরণ-তালিকা: ছোট কার্ডের গ্রিড (শিরোনাম + ছোট ব্যাখ্যা)। limit-এর বেশি হলে "আরও দেখান"। */
export function ExampleGrid({ items, onPick, limit = 4, label = "উদাহরণ", cols = "grid-cols-2 sm:grid-cols-4", mono = true }) {
  const [all, setAll] = useState(false);
  const list = all ? items : items.slice(0, limit);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink/55">{label}</span>
        {items.length > limit && <button type="button" aria-expanded={all} onClick={() => setAll((x) => !x)} className="rounded-full px-2.5 py-1 text-sm font-semibold text-ink/60 transition hover:bg-ink/[.06] active:scale-95">{all ? "কম দেখান" : `আরও ${items.length - limit}টি`}</button>}
      </div>
      <div className={`grid gap-2 ${cols}`}>
        {list.map((it) => (
          <button key={it.key ?? it.title} type="button" onClick={() => onPick(it)} className="group min-w-0 rounded-2xl bg-ink/[.04] px-3 py-2 text-left ring-1 ring-ink/[.05] transition hover:bg-ink/[.08] hover:ring-ink/10 active:scale-[.97]">
            <span className={`block truncate text-[15px] font-bold ${mono ? "num" : ""}`}>{it.title}</span>
            {it.sub && <span className="mt-0.5 block truncate text-xs text-ink/50">{it.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
