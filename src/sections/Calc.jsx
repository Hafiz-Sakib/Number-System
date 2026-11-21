import { useMemo, useState } from "react";
import { BASE_NAME, MAX_OPERANDS, OPS, availableMethods, calc, calcMulti, ordinal, parseNum, showVal } from "../lib/engine";
import { useFmt, usePrecision } from "../lib/settings";
import { Blocks } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { BaseTabs, NumberField, PrecisionSelect, ResultCard, CopyButton, PillChoice, CLR, disp } from "../components/controls";

export default function Calc({ s, set, onConvert }) {
  const [prec] = usePrecision();
  const fmt = useFmt();
  const [focus, setFocus] = useState("a"); // অঙ্ক-বোতাম শুধু সর্বশেষ ফোকাস-করা ঘরের নিচে
  const more = s.more || [];
  const filled = useMemo(() => more.filter((x) => x.trim() !== ""), [more]); // খালি বাড়তি ঘর হিসাবে ধরি না
  const multi = s.op === "+" && filled.length > 0; // যোগে দুইয়ের বেশি সংখ্যা
  const list = useMemo(() => [s.a, s.b, ...more], [s.a, s.b, more]); // ভুল ধরার জন্য সব ঘর
  const calcList = useMemo(() => [s.a, s.b, ...filled], [s.a, s.b, filled]);
  const pa = useMemo(() => parseNum(s.a, s.base), [s.a, s.base]);
  const pb = useMemo(() => parseNum(s.b, s.base), [s.b, s.base]);
  const methods = availableMethods(s.base, s.op, pa, pb).filter((m) => !multi || m.id === "direct" || m.id === "decimal");
  const method = methods.some((m) => m.id === s.method) ? s.method : "direct";
  const res = useMemo(
    () => (multi ? calcMulti(calcList, s.base, method, prec) : calc(s.a, s.b, s.op, s.base, method, prec)),
    [multi, calcList, s.a, s.b, s.op, s.base, method, prec],
  );
  const errs = useMemo(() => list.map((x) => { const p = parseNum(x, s.base); return !p.ok && !p.empty ? p.msg : null; }), [list, s.base]);
  const zeroDiv = !res.ok && res.which === "b" && pb.ok && s.op === "/" ? res.msg : null;
  const anyErr = errs.some(Boolean) || zeroDiv;
  const setMore = (i, v) => set({ ...s, more: more.map((x, k) => (k === i ? v : x)) });
  const addMore = () => { if (list.length >= MAX_OPERANDS) return; set({ ...s, more: [...more, ""] }); setFocus(`m${more.length}`); };
  const removeMore = (i) => { set({ ...s, more: more.filter((_, k) => k !== i) }); setFocus("a"); };
  const nextRound = () => set({ ...s, a: res.text.replace(/^-/, "−"), b: "", more: [] });
  const total = multi ? calcList.length : 2;
  const slots = 2 + more.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="যোগ · বিয়োগ · গুণ · ভাগ" sub="একই সংখ্যা পদ্ধতির সংখ্যা দিন (যোগে দুইয়ের বেশিও চলে)। উত্তরের সাথে কলাম ধরে পুরো হিসাব দেখুন।" />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[26rem_minmax(0,1fr)] xl:grid-cols-[29rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[4.75rem] lg:-mx-1 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:px-1 lg:pb-2">
          <Reveal y={16}>
            <div className="card space-y-5 p-5 sm:p-6">
              <BaseTabs id="calc-base" label="সংখ্যা পদ্ধতি" value={s.base} onChange={(base) => set({ ...s, base })} />
              <NumberField label={`${ordinal(0)} সংখ্যা`} base={s.base} value={s.a} onChange={(a) => set({ ...s, a })} error={errs[0]} id="calc-a" chips={focus === "a"} onFocus={() => setFocus("a")} />
              <div>
                <p className="mb-2 text-sm font-semibold text-ink/60">কী করতে চান</p>
                <div role="radiogroup" aria-label="গাণিতিক প্রক্রিয়া" className="grid grid-cols-4 gap-2">
                  {Object.entries(OPS).map(([k, o]) => {
                    const on = s.op === k;
                    return (
                      <button key={k} type="button" role="radio" aria-checked={on} onClick={() => set({ ...s, op: k })}
                        className={`rounded-2xl py-2.5 text-center transition active:scale-95 ${on ? "bg-ink text-paper shadow-md" : "bg-ink/[.06] hover:bg-ink/[.11]"}`}>
                        <span className="block text-3xl font-bold leading-none">{o.sign}</span>
                        <span className="mt-1 block text-[13px] font-semibold opacity-80">{o.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <NumberField label={`${ordinal(1)} সংখ্যা`} base={s.base} value={s.b} onChange={(b) => set({ ...s, b })} error={errs[1] || zeroDiv} id="calc-b" chips={focus === "b"} onFocus={() => setFocus("b")} />
              {s.op === "+" && (
                <>
                  {more.map((v, i) => (
                    <NumberField key={i} label={`${ordinal(i + 2)} সংখ্যা`} base={s.base} value={v} onChange={(x) => setMore(i, x)} error={errs[i + 2]} id={`calc-m${i}`} chips={focus === `m${i}`} onFocus={() => setFocus(`m${i}`)}
                      action={<button type="button" onClick={() => removeMore(i)} aria-label={`${ordinal(i + 2)} সংখ্যা বাদ দিন`} className="inline-flex items-center gap-1 rounded-full bg-ink/[.06] px-2.5 py-1 text-xs font-semibold text-ink/60 transition hover:bg-ink/[.11] hover:text-ink active:scale-95">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>বাদ
                      </button>} />
                  ))}
                  {slots < MAX_OPERANDS ? (
                    <button type="button" onClick={addMore} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 py-3 text-[15px] font-semibold text-ink/65 transition hover:border-violet-500/50 hover:bg-violet-500/[.06] hover:text-ink active:scale-[.98]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>আরও সংখ্যা যোগ করুন
                    </button>
                  ) : <p className="text-center text-sm text-ink/50">সর্বোচ্চ {fmt(MAX_OPERANDS)}টি সংখ্যা যোগ করা যায়।</p>}
                </>
              )}
              {(s.op === "/" || method === "decimal") && <PrecisionSelect />}
            </div>
          </Reveal>
        </div>

        <div className="min-w-0 space-y-4">
          {res.ok ? (
            <>
              <ResultCard title={`${OPS[s.op].result}${multi ? ` · ${fmt(total)}টি সংখ্যা` : ""} (${BASE_NAME[s.base]})`} base={s.base} value={res.text} exact={res.value.exact}>
                <CopyButton text={res.text} />
                <button type="button" onClick={nextRound} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">পরের হিসাবে প্রথম সংখ্যা করুন</button>
              </ResultCard>

              <div className="card p-5 sm:p-6">
                <h2 className="text-lg font-bold">উত্তর চার পদ্ধতিতে</h2>
                <p className="text-sm text-ink/55">যেকোনোটিতে চাপ দিয়ে রূপান্তরের ধাপ দেখুন।</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                  {res.all.map((a) => (
                    <button key={a.base} type="button" onClick={() => onConvert(s.base, a.base, res.text)} disabled={a.base === s.base}
                      className={`min-w-0 rounded-2xl px-4 py-3 text-left ring-1 transition enabled:active:scale-[.98] ${CLR[a.base].bg} ${CLR[a.base].ring} ${a.base === s.base ? "cursor-default" : ""}`}>
                      <span className={`block text-sm font-bold ${CLR[a.base].text}`}>{BASE_NAME[a.base]}{a.base === s.base ? " (এই হিসাব)" : " · ধাপ দেখুন"}</span>
                      <span className={`num mt-0.5 block break-all text-lg font-bold ${CLR[a.base].text}`}>{!a.exact && "≈ "}{disp(showVal(a))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-5 sm:p-7">
                <h2 className="text-2xl font-extrabold">ধাপে ধাপে সমাধান</h2>
                {methods.length > 1 && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm font-semibold text-ink/60">কোন পদ্ধতিতে দেখবেন</p>
                    <PillChoice id="method" options={methods.map((m) => ({ id: m.id, label: m.label }))} value={method} onChange={(m) => set({ ...s, method: m })} />
                  </div>
                )}
                <div className="mt-4"><Blocks key={`${method}-${s.op}-${s.base}-${total}`} blocks={res.blocks} /></div>
              </div>
            </>
          ) : (
            <div className="card grid min-h-[16rem] place-items-center p-8 text-center">
              <div>
                <p className="text-2xl font-extrabold">উত্তর এখানে দেখা যাবে</p>
                <p className="mx-auto mt-2 max-w-sm text-ink/55">{anyErr ? "ইনপুটের ভুলটি ঠিক করুন।" : s.op === "+" ? "বাঁ দিকে সংখ্যাগুলো লিখুন।" : "বাঁ দিকে দুটি সংখ্যা লিখুন।"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
