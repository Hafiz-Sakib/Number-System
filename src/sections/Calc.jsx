import { useMemo } from "react";
import { BASE_NAME, OPS, availableMethods, calc, parseNum, showVal } from "../lib/engine";
import { usePrecision } from "../lib/settings";
import { Blocks } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { BaseTabs, NumberField, PrecisionSelect, ResultCard, CopyButton, PillChoice, CLR, disp } from "../components/controls";

export default function Calc({ s, set, onConvert }) {
  const [prec] = usePrecision();
  const pa = useMemo(() => parseNum(s.a, s.base), [s.a, s.base]);
  const pb = useMemo(() => parseNum(s.b, s.base), [s.b, s.base]);
  const methods = availableMethods(s.base, s.op, pa, pb);
  const method = methods.some((m) => m.id === s.method) ? s.method : "direct";
  const res = useMemo(() => calc(s.a, s.b, s.op, s.base, method, prec), [s.a, s.b, s.op, s.base, method, prec]);
  const errA = !pa.ok && !pa.empty ? pa.msg : null;
  const errB = !pb.ok && !pb.empty ? pb.msg : null;
  const zeroDiv = !res.ok && res.which === "b" && pb.ok ? res.msg : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="যোগ · বিয়োগ · গুণ · ভাগ" sub="একই সংখ্যা পদ্ধতির দুটি সংখ্যা দিন। উত্তরের সাথে কলাম ধরে পুরো হিসাব দেখুন।" />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[26rem_minmax(0,1fr)] xl:grid-cols-[29rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-[4.75rem] lg:-mx-1 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:px-1 lg:pb-2">
          <Reveal y={16}>
            <div className="card space-y-5 p-5 sm:p-6">
              <BaseTabs id="calc-base" label="সংখ্যা পদ্ধতি" value={s.base} onChange={(base) => set({ ...s, base })} />
              <NumberField label="প্রথম সংখ্যা" base={s.base} value={s.a} onChange={(a) => set({ ...s, a })} error={errA} id="calc-a" />
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
              <NumberField label="দ্বিতীয় সংখ্যা" base={s.base} value={s.b} onChange={(b) => set({ ...s, b })} error={errB || zeroDiv} id="calc-b" />
              {(s.op === "/" || method === "decimal") && <PrecisionSelect />}
            </div>
          </Reveal>
        </div>

        <div className="min-w-0 space-y-4">
          {res.ok ? (
            <>
              <ResultCard title={`${OPS[s.op].result} (${BASE_NAME[s.base]})`} base={s.base} value={res.text} exact={res.value.exact}>
                <CopyButton text={res.text} />
                <button type="button" onClick={() => set({ ...s, a: res.text.replace(/^-/, "−") })} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">পরের হিসাবে প্রথম সংখ্যা করুন</button>
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
                <div className="mt-4"><Blocks key={`${method}-${s.op}-${s.base}`} blocks={res.blocks} /></div>
              </div>
            </>
          ) : (
            <div className="card grid min-h-[16rem] place-items-center p-8 text-center">
              <div>
                <p className="text-2xl font-extrabold">উত্তর এখানে দেখা যাবে</p>
                <p className="mx-auto mt-2 max-w-sm text-ink/55">{errA || errB || zeroDiv ? "ইনপুটের ভুলটি ঠিক করুন।" : "বাঁ দিকে দুটি সংখ্যা লিখুন।"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
