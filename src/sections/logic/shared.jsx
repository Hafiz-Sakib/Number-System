import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Rich } from "../../components/Steps";
import { autoLayout } from "../../lib/logic";

/* লজিক পেজের ছোট ছোট সাধারণ টুকরো */
export const P = ({ children, className = "" }) => <p className={`leading-[1.95] text-ink/75 ${className}`}><Rich text={children} /></p>;
export const Eq = ({ children, className = "" }) => <span className={`num inline-block rounded-lg bg-ink/[.06] px-2 py-0.5 text-[.95em] font-semibold ${className}`}>{children}</span>;
export const Panel = ({ title, sub, children, className = "" }) => (
  <section className={`card p-4 sm:p-6 ${className}`}>
    {title && <h3 className="text-xl font-extrabold">{title}</h3>}
    {sub && <p className="mt-1 text-ink/60">{sub}</p>}
    <div className={title || sub ? "mt-4" : ""}>{children}</div>
  </section>
);
export const Facts = ({ items }) => (
  <ul className="grid gap-2 sm:grid-cols-2">
    {items.map(([h, d, bg = "bg-lilac"], i) => (
      <li key={i} className={`rounded-2xl px-4 py-3 ring-1 ring-ink/[.06] ${bg}`}>
        <p className="num text-lg font-extrabold">{h}</p>
        <p className="mt-0.5 text-[15px] leading-[1.7] text-ink/70"><Rich text={d} /></p>
      </li>
    ))}
  </ul>
);

/** একটি গেটের ছোট সার্কিট: ইনপুট A, B, C… আউটপুট Y */
export function gateNet(type, n = 2) {
  const ids = "ABCDEFGH".slice(0, type === "NOT" ? 1 : n).split("");
  return autoLayout({ inputs: ids.map((id) => ({ id, label: id })), gates: [{ id: "g", type, in: ids }], outputs: [{ id: "Y", from: "g", label: "Y" }] }, { inGap: 52 });
}
export const useNet = (build, deps) => useMemo(build, deps); // eslint-disable-line react-hooks/exhaustive-deps
export const spec = (inputs, gates, outputs) => ({
  inputs: inputs.map((id) => (typeof id === "string" ? { id, label: id } : id)),
  gates: gates.map(([id, type, ins, extra]) => ({ id, type, in: ins, ...extra })),
  outputs: outputs.map(([id, from, label]) => ({ id, from, label: label ?? id })),
});

export function useInterval(cb, ms, on) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => { if (!on) return undefined; const id = setInterval(() => ref.current(), ms); return () => clearInterval(id); }, [ms, on]);
}

/** গোল 0/1 টগল বোতাম (ফ্লিপ-ফ্লপ, অ্যাডার ইত্যাদির ইনপুটে) */
export function BitBtn({ v, onClick, label, size = "h-11 w-11", disabled }) {
  return (
    <button type="button" role="switch" aria-checked={!!v} aria-label={label} disabled={disabled} onClick={onClick}
      className={`num relative grid ${size} place-items-center rounded-full text-lg font-extrabold outline-none ring-1 transition active:scale-90 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-default ${v ? "text-white ring-emerald-600/30" : "text-ink/55 ring-ink/10"}`}>
      <motion.span initial={false} animate={{ backgroundColor: v ? "#10b981" : "rgba(120,124,150,.18)", scale: v ? [0.9, 1.08, 1] : 1 }} transition={{ duration: 0.25 }} className="absolute inset-0 rounded-full" />
      <span className="relative">{v ? 1 : 0}</span>
    </button>
  );
}
