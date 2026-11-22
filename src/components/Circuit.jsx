import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GW, evalNet, pinY, truthRows } from "../lib/logic";

/* লজিক সার্কিট আঁকার টুকরোগুলো: গেটের প্রতীক, তার (সিগন্যালে রং ও প্রবাহ), ইনপুট সুইচ, আউটপুট LED, সত্যক সারণী।
   সব SVG + framer-motion; সার্কিটের গঠন আসে lib/logic.js-এর নেটলিস্ট থেকে। */

const ON = "#10b981";
const TINT = "rgba(16,185,129,.22)";

const AND_BODY = "M8 2 H30 C48 2 58 12 58 22 C58 32 48 42 30 42 H8 Z";
const OR_BODY = "M6 2 C16 12 16 32 6 42 C30 42 50 36 60 22 C50 8 30 2 6 2 Z";
const XOR_ARC = "M2 2 C12 12 12 32 2 42";
const PARTS = {
  AND: { body: AND_BODY, tip: 58 },
  NAND: { body: AND_BODY, tf: "scale(.92 1)", bubble: 57.4 },
  OR: { body: OR_BODY, tip: 60 },
  NOR: { body: OR_BODY, tf: "scale(.92 1)", bubble: 59.2 },
  XOR: { body: OR_BODY, tf: "translate(4 0)", arc: XOR_ARC, tip: 64 },
  XNOR: { body: OR_BODY, tf: "translate(4 0) scale(.86 1)", arc: XOR_ARC, bubble: 59.6 },
  NOT: { body: "M8 3 L52 22 L8 41 Z", bubble: 56 },
};
const cls = (v) => `sw ${v ? "wire-on" : "wire-off"}`;

/** গেটের প্রতীক (প্রস্থ 64)। ins = ইনপুট মান, out = আউটপুট মান */
export function GateShape({ type, h = 44, ins = [], out = 0 }) {
  const P = PARTS[type];
  const n = Math.max(ins.length, 1);
  const sy = h / 44;
  return (
    <g>
      {ins.map((v, i) => { const y = (h * (2 * i + 1)) / (2 * n); return <line key={i} x1="0" x2="12" y1={y} y2={y} className={cls(v)} />; })}
      <g transform={`scale(1 ${sy})`}>
        <path d={P.body} transform={P.tf} className="gate-body" vectorEffect="non-scaling-stroke" />
        <motion.path d={P.body} transform={P.tf} fill={TINT} stroke="none" initial={false} animate={{ opacity: out ? 1 : 0 }} transition={{ duration: 0.25 }} />
        {P.arc && <path d={P.arc} className="gate-line" vectorEffect="non-scaling-stroke" />}
      </g>
      {P.bubble && <circle cx={P.bubble} cy={h / 2} r="4" className="gate-body" />}
      <line x1={P.bubble ? P.bubble + 4 : P.tip} x2={GW} y1={h / 2} y2={h / 2} className={cls(out)} />
    </g>
  );
}

function Switch({ x, y, label, on, onToggle, fixed }) {
  const reduce = useReducedMotion();
  const sx = x - 54;
  const spring = reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 30 };
  return (
    <g>
      <text x={sx - 7} y={y + 4.5} textAnchor="end" className="fill-current text-[13px] font-bold">{label}</text>
      <g className={fixed ? "" : "sw-toggle"} role={fixed ? undefined : "switch"} aria-checked={fixed ? undefined : !!on} aria-label={fixed ? undefined : `ইনপুট ${label}`} tabIndex={fixed ? undefined : 0}
        onClick={fixed ? undefined : onToggle} onKeyDown={fixed ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}>
        <motion.rect className="sw-track" x={sx} y={y - 12} width="40" height="24" rx="12" initial={false} animate={{ fill: on ? ON : "rgba(120,124,150,.28)" }} transition={{ duration: 0.2 }} stroke="none" />
        <text x={on ? sx + 12 : sx + 28} y={y + 4} textAnchor="middle" className="pointer-events-none select-none fill-white text-[11px] font-bold" opacity={on ? 1 : 0}>1</text>
        <text x={on ? sx + 12 : sx + 28} y={y + 4} textAnchor="middle" className="pointer-events-none select-none fill-current text-[11px] font-bold" opacity={on ? 0 : 0.55}>0</text>
        <motion.circle cy={y} r="9" fill="#fff" initial={false} animate={{ cx: on ? sx + 28 : sx + 12 }} transition={spring} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }} />
        {!fixed && <rect x={sx - 4} y={y - 16} width="48" height="32" fill="transparent" />}
      </g>
      <line x1={sx + 40} x2={x} y1={y} y2={y} className={cls(on)} />
    </g>
  );
}

function Led({ x, y, label, on }) {
  const reduce = useReducedMotion();
  return (
    <g>
      <line x1={x} x2={x + 5} y1={y} y2={y} className={cls(on)} />
      <motion.circle cx={x + 17} cy={y} r="17" fill={ON} initial={false} animate={{ opacity: on ? 0.28 : 0, scale: on && !reduce ? [0.8, 1.15, 1] : 1 }} transition={{ duration: 0.35 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <motion.circle cx={x + 17} cy={y} r="11" initial={false} animate={{ fill: on ? ON : "rgba(120,124,150,.3)" }} transition={{ duration: 0.2 }} stroke="rgb(var(--ink) / .55)" strokeWidth="1.5" />
      <text x={x + 17} y={y + 4} textAnchor="middle" className="pointer-events-none fill-white text-[11px] font-bold" opacity={on ? 1 : 0}>1</text>
      <text x={x + 17} y={y + 4} textAnchor="middle" className="pointer-events-none fill-current text-[11px] font-bold" opacity={on ? 0 : 0.55}>0</text>
      <text x={x + 38} y={y + 4.5} className="fill-current text-[13px] font-bold">{label}</text>
    </g>
  );
}

/** একটি নেটলিস্ট আঁকে। state = { ইনপুট-id: 0|1 }, onToggle(id) ক্লিক/কীবোর্ডে ডাকা হয়। */
export function Circuit({ net, state, onToggle, label = "লজিক সার্কিট" }) {
  const vals = useMemo(() => evalNet(net, state), [net, state]);
  const { wires, dots } = useMemo(() => {
    const pos = {};
    net.inputs.forEach((p) => (pos[p.id] = { x: p.x, y: p.y }));
    (net.consts || []).forEach((p) => (pos[p.id] = { x: p.x, y: p.y }));
    net.gates.forEach((g) => (pos[g.id] = { x: g.x + GW, y: g.y + g.h / 2 }));
    const list = [];
    net.gates.forEach((g) => g.in.forEach((src, i) => list.push({ src, to: { x: g.x, y: pinY(g, i) }, vx: g.x - 12 - i * 6 })));
    net.outputs.forEach((o) => list.push({ src: o.from, to: { x: o.x, y: o.y }, vx: o.x - 16 }));
    const fan = {};
    list.forEach((w) => (fan[w.src] = (fan[w.src] || 0) + 1));
    const dotsL = [];
    const ws = list.map((w, k) => {
      const a = pos[w.src] || { x: 0, y: 0 };
      const vx = Math.max(a.x + 10, w.vx);
      const d = a.y === w.to.y ? `M${a.x} ${a.y}H${w.to.x}` : `M${a.x} ${a.y}H${vx}V${w.to.y}H${w.to.x}`;
      if (fan[w.src] > 1 && a.y !== w.to.y) dotsL.push({ x: vx, y: a.y, src: w.src, k });
      return { ...w, d, k };
    });
    return { wires: ws, dots: dotsL };
  }, [net]);

  const off = wires.filter((w) => !vals[w.src]);
  const on = wires.filter((w) => vals[w.src]);
  return (
    <svg viewBox={`0 0 ${net.w} ${net.h}`} width={net.w} height={net.h} role="group" aria-label={label} className="mx-auto block h-auto w-full min-w-[var(--mw)] text-ink sm:min-w-[min(var(--mw),380px)]" style={{ "--mw": Math.min(net.w, 540) + "px", maxWidth: Math.round(net.w * 1.45) }}>
      {off.map((w) => <path key={`o${w.k}`} d={w.d} className="sw wire-off" />)}
      {on.map((w) => <path key={`n${w.k}`} d={w.d} className="sw wire-on" />)}
      {on.map((w) => <path key={`f${w.k}`} d={w.d} className="flow" />)}
      {dots.map((d) => <circle key={`d${d.k}`} cx={d.x} cy={d.y} r="3.6" fill={vals[d.src] ? ON : "rgb(var(--ink) / .45)"} />)}
      {net.gates.map((g) => (
        <g key={g.id} transform={`translate(${g.x} ${g.y})`}>
          <GateShape type={g.type} h={g.h} ins={g.in.map((id) => vals[id])} out={vals[g.id]} />
          <text x={GW / 2 - 2} y={g.h + 12} textAnchor="middle" className="pointer-events-none fill-current text-[9.5px] font-semibold" opacity=".5">{g.label ?? g.type}</text>
        </g>
      ))}
      {net.inputs.map((p) => <Switch key={p.id} x={p.x} y={p.y} label={p.label ?? p.id} on={!!state[p.id]} onToggle={() => onToggle(p.id)} />)}
      {(net.consts || []).map((p) => <Switch key={p.id} x={p.x} y={p.y} label={`${p.value}`} on={!!p.value} fixed />)}
      {net.outputs.map((o) => <Led key={o.id} x={o.x} y={o.y} label={o.label ?? o.id} on={!!vals[o.from]} />)}
    </svg>
  );
}

/** সত্যক সারণী। active = এখনকার ইনপুটের সারি (হাইলাইট), onPick(i) = সারিতে চাপলে সেই ইনপুট বসে। */
export function TruthTable({ ins, outs, rows, active = -1, onPick, className = "", compare }) {
  return (
    <div className={`max-w-full overflow-x-auto no-sb rounded-2xl ring-1 ring-ink/10 ${className}`}>
      <table className="mx-auto min-w-max text-[15px] sm:min-w-[20rem]" aria-label="সত্যক সারণী">
        <thead>
          <tr className="bg-ink/[.05]">
            {ins.map((h, i) => <th key={`i${i}`} className="px-3.5 py-2 text-center font-semibold text-ink/70"><span className="num">{h}</span></th>)}
            {outs.map((h, i) => <th key={`o${i}`} className={`px-3.5 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300 ${i === 0 ? "border-l-2 border-ink/15" : ""}`}><span className="num">{h}</span></th>)}
            {compare && <th className="px-3.5 py-2 text-center font-semibold text-ink/60">{compare.head}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} aria-selected={active === k} onClick={onPick ? () => onPick(k) : undefined}
              className={`border-t border-ink/[.07] transition-colors ${onPick ? "cursor-pointer hover:bg-ink/[.04]" : ""} ${active === k ? "bg-violet-500/[.12] hover:bg-violet-500/[.12]" : ""}`}>
              {r.in.map((b, i) => <td key={`i${i}`} className="num px-3.5 py-1.5 text-center text-ink/75">{b}</td>)}
              {r.out.map((b, i) => <td key={`o${i}`} className={`num px-3.5 py-1.5 text-center ${b ? "font-extrabold text-emerald-600 dark:text-emerald-300" : "text-ink/40"} ${i === 0 ? "border-l-2 border-ink/15" : ""}`}>{b}</td>)}
              {compare && <td className="px-3.5 py-1.5 text-center font-bold text-emerald-600 dark:text-emerald-300">{compare.cell(r, k)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** ইনপুট-অবস্থার hook: { st, toggle, set } ; radio হলে একবারে একটিই 1 থাকে */
export function useInputs(ids, { radio = false, init } = {}) {
  const [raw, setRaw] = useState(init || {});
  const st = Object.fromEntries(ids.map((i) => [i, raw[i] ?? 0]));
  const toggle = (id) => setRaw(() => {
    if (radio) return Object.fromEntries(ids.map((i) => [i, i === id && !st[id] ? 1 : 0]));
    return { ...st, [id]: st[id] ? 0 : 1 };
  });
  const set = (obj) => setRaw(() => ({ ...st, ...obj }));
  return { st, toggle, set };
}

/** সার্কিট + সত্যক সারণী একসাথে (সারণীর সারিতে চাপলে ইনপুট বদলায়) */
export function Lab({ net, table, radio = false, init, className = "", hideTable = false, below }) {
  const ids = useMemo(() => net.inputs.map((i) => i.id), [net]);
  const { st, toggle, set } = useInputs(ids, { radio, init });
  const tbl = useMemo(() => table || truthRows(net), [net, table]);
  const active = tbl.rows.findIndex((r) => r.in.every((b, i) => b === st[ids[i]]));
  return (
    <div className={className}>
      <div className="board overflow-x-auto no-sb rounded-2xl p-2 ring-1 ring-ink/10 sm:p-3">
        <Circuit net={net} state={st} onToggle={toggle} />
      </div>
      <p className="mt-2 text-center text-xs text-ink/45">সুইচে চাপ দিয়ে ইনপুট বদলান; সবুজ তারে সিগন্যাল 1 চলছে।</p>
      {typeof below === "function" ? below(st) : below}
      {!hideTable && (
        <div className="mt-3">
          <TruthTable ins={tbl.ins} outs={tbl.outs} rows={tbl.rows} active={active} onPick={(k) => set(Object.fromEntries(ids.map((id, i) => [id, tbl.rows[k].in[i]])))} />
        </div>
      )}
    </div>
  );
}
