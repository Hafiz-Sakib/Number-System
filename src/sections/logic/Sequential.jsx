import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Bits3D from "../../components/Bits3D";
import { GenButton, PillChoice } from "../../components/controls";
import { genGateInputs } from "../../lib/exampleGen";
import { BitBtn, Eq, Facts, P, Panel, useInterval } from "./shared";

const SUB = ["₀", "₁", "₂", "₃"];
const toNum = (bits) => bits.reduce((a, b) => (a << 1) | b, 0);

/* ক্লক পালস দিলে কিছুক্ষণ (ms) "উঁচু" (high) থাকে, তারপর নামে - বাস্তব ক্লকের রাইজিং এজের মতো */
function useEdge(clk, ms = 420) {
  const [hi, setHi] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    if (!clk) { setHi(false); return undefined; }
    setHi(true);
    const t = setTimeout(() => setHi(false), ms);
    return () => clearTimeout(t);
  }, [clk, ms]);
  return hi;
}

/* অসিলোস্কোপের মতো ক্লক তরঙ্গ: প্রতি পালসে নতুন স্পন্দন ডান থেকে ঢোকে, পুরনোগুলো বামে সরে */
function ClkScope({ count, hi }) {
  const N = 7, W = 26, H = 30;
  const n = Math.min(count, N);
  let base = "M0 24";
  for (let k = 0; k < N - 1; k++) { const x = k * W; base += k >= N - n ? `H${x + 4}V8H${x + W - 8}V24H${x + W}` : `H${x + W}`; }
  const lx = (N - 1) * W;
  const last = n > 0 ? `M${lx} 24H${lx + 4}V8H${lx + W - 8}V24H${lx + W}` : `M${lx} 24H${lx + W}`;
  return (
    <svg viewBox={`0 0 ${N * W} ${H}`} className="block h-9 w-44 text-ink" role="img" aria-label="ক্লক তরঙ্গ">
      <motion.g key={count} initial={count ? { x: W } : false} animate={{ x: 0 }} transition={{ duration: 0.28, ease: "easeOut" }}>
        <path d={base} fill="none" stroke="rgb(var(--ink) / .45)" strokeWidth="2" strokeLinejoin="round" />
        <path d={last} fill="none" stroke={hi ? "#10b981" : "rgb(var(--ink) / .45)"} strokeWidth={hi ? 2.8 : 2} strokeLinejoin="round" style={hi ? { filter: "drop-shadow(0 0 5px rgba(16,185,129,.9))" } : undefined} />
      </motion.g>
    </svg>
  );
}

function ClockPanel({ onClick, count, hi, label = "ক্লক পালস" }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        {/* প্রতি চাপে একটি ঢেউ-রিং ছড়ায় */}
        {count > 0 && <motion.span key={count} aria-hidden initial={{ opacity: 0.55, scale: 1 }} animate={{ opacity: 0, scale: 1.45 }} transition={{ duration: 0.55, ease: "easeOut" }} className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-emerald-500" />}
        <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onClick} className="relative inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[17px] font-bold text-paper shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17h5V7h8v10h5" /></svg>
          {label}<span className="num rounded-full bg-paper/20 px-2.5 py-0.5 text-sm">{count}</span>
        </motion.button>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-ink/[.05] px-3 py-1.5 ring-1 ring-ink/[.06]">
        <span className="num text-xs font-bold text-ink/55">CLK</span>
        <ClkScope count={count} hi={hi} />
        <motion.span initial={false} animate={{ opacity: hi ? 1 : 0.25, scale: hi ? 1 : 0.85 }} className="num w-5 text-center text-sm font-extrabold text-emerald-600 dark:text-emerald-300">↑</motion.span>
      </div>
    </div>
  );
}

/** ফ্লিপ-ফ্লপের কার্ড: নাম, ইনপুট অংশ (children), ক্লক-ত্রিভুজ, আউটপুট Q (জ্বলন্ত LED)।
    edge = ক্লকের ধার এখন সক্রিয়; moved = এই ফ্লিপ-ফ্লপে ডাটা-প্যাকেট ঢুকছে; dir = প্যাকেট কোনদিক থেকে আসে */
function FF({ name, q, tick, children, kind = "D", edge = false, moved = false, dir = "down" }) {
  const reduce = useReducedMotion();
  const pk = q ? "#10b981" : "#94a3b8";
  return (
    <div className="relative rounded-2xl bg-surface p-2 text-center ring-1 ring-ink/10 sm:p-3">
      <motion.div aria-hidden initial={false} className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{ boxShadow: edge && moved ? "inset 0 0 0 2px rgba(16,185,129,.75), 0 0 22px rgba(16,185,129,.35)" : "inset 0 0 0 0px rgba(16,185,129,0), 0 0 0 rgba(16,185,129,0)" }} transition={{ duration: 0.25 }} />
      <p className="num text-xs font-bold text-ink/55">{kind}-FF · {name}</p>
      <div className="my-2 flex min-h-11 items-center justify-center">{children}</div>

      {/* D → Q তার: ডাটা-প্যাকেট ওপর থেকে নিচে নামে (শিফটে বাঁ পাশ থেকে ঢোকে) */}
      <div className="relative mx-auto h-8 w-0.5 rounded bg-ink/15">
        {moved && tick > 0 && !reduce && (
          <motion.span key={tick} aria-hidden className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full"
            style={{ background: pk, boxShadow: `0 0 8px ${pk}` }}
            initial={dir === "right" ? { x: -46, y: -22, opacity: 0 } : { y: -6, opacity: 0 }}
            animate={dir === "right" ? { x: [-46, 0, 0], y: [-22, -22, 26], opacity: [0, 1, 0] } : { y: [-6, 28], opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 0.6, ease: "easeInOut" }} />
        )}
      </div>

      {/* ক্লক ইনপুটের ত্রিভুজ (>) : ধার এলে জ্বলে ওঠে */}
      <div className="relative mx-auto mt-0 flex h-7 w-16 items-center justify-center rounded-lg bg-ink/[.05] ring-1 ring-ink/10">
        <motion.svg viewBox="0 0 12 12" className="mr-1 h-3 w-3" initial={false} animate={{ opacity: edge ? 1 : 0.4 }} style={edge ? { filter: "drop-shadow(0 0 4px rgba(16,185,129,.9))" } : undefined}>
          <path d="M2 1 L10 6 L2 11 Z" fill={edge ? "#10b981" : "currentColor"} />
        </motion.svg>
        <span className="num text-[10px] font-bold text-ink/50">CLK</span>
      </div>

      {/* আউটপুট Q: 1 হলে আলো ছড়ায় */}
      <div className="relative mx-auto mt-3 grid h-12 w-12 place-items-center">
        <motion.span aria-hidden initial={false} className="absolute inset-[-10px] rounded-full" style={{ background: "radial-gradient(circle, rgba(52,211,153,.6), rgba(16,185,129,0) 70%)" }}
          animate={{ opacity: q ? (reduce ? 0.9 : [0.5, 1, 0.5]) : 0, scale: q ? 1 : 0.6 }} transition={q && !reduce ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25 }} />
        <motion.span key={`pop${tick}-${q}`} initial={false} className="num relative grid h-12 w-12 place-items-center rounded-full text-2xl font-extrabold ring-2"
          animate={{ backgroundColor: q ? "#10b981" : "rgba(120,124,150,.16)", color: q ? "#ffffff" : "rgba(120,124,150,.95)", scale: moved && tick > 0 && !reduce ? [1, 1.18, 1] : 1, boxShadow: q ? "0 0 14px rgba(16,185,129,.8), 0 0 30px rgba(16,185,129,.45)" : "0 0 0 rgba(16,185,129,0)" }}
          style={{ "--tw-ring-color": q ? "rgba(110,231,183,.9)" : "rgba(120,124,150,.25)" }} transition={{ duration: 0.3 }}>
          {q}
        </motion.span>
      </div>
      <p className="num mt-1 text-[11px] font-bold text-ink/45">Q</p>
    </div>
  );
}

/* ---------- 3.7.11 রেজিস্টার ---------- */
export function Register() {
  const [mode, setMode] = useState("par");
  const [d, setD] = useState([1, 0, 1, 1]);
  const [si, setSi] = useState(1);
  const [q, setQ] = useState([0, 0, 0, 0]); // q[0] = Q3 (MSB)
  const [clk, setClk] = useState(0);
  const edge = useEdge(clk);
  const pulse = () => { setQ((x) => (mode === "par" ? [...d] : [si, x[0], x[1], x[2]])); setClk((c) => c + 1); };
  const clear = () => { setQ([0, 0, 0, 0]); setClk(0); };
  const flip = (i) => setD((x) => x.map((v, j) => (j === i ? 1 - v : v)));
  const [exLabel, setExLabel] = useState("");
  /* প্যারালাল: D₃…D₀ চারটি বিট; শিফট: সিরিয়াল ইনপুট SI (একটি বিট, তাই সবসময় উল্টো মান আসে) */
  const generate = () => {
    if (mode === "par") {
      const ids = ["D3", "D2", "D1", "D0"];
      const ex = genGateInputs(ids, { cur: Object.fromEntries(ids.map((id, i) => [id, d[i]])), key: "reg-par" });
      setD(ids.map((id) => ex.values[id])); setExLabel(ex.label.replace("ইনপুট", "D বিট"));
    } else {
      const ex = genGateInputs(["SI"], { cur: { SI: si }, key: "reg-si" });
      setSi(ex.values.SI); setExLabel(`সিরিয়াল ইনপুট SI = ${ex.values.SI}`);
    }
  };
  return (
    <div className="space-y-4">
      <Panel>
        <P>**রেজিস্টার (Register)** হলো একগুচ্ছ **ফ্লিপ-ফ্লপ**, যা প্রতিটি একটি করে বিট ধরে রাখে। n বিটের রেজিস্টারে n টি ফ্লিপ-ফ্লপ লাগে। ক্লকের **প্রতিটি পালসেই** ফ্লিপ-ফ্লপ তার ইনপুট D এর মান আউটপুট Q তে তুলে নেয়; পরের পালস না আসা পর্যন্ত মান অপরিবর্তিত থাকে।</P>
        <div className="mt-3"><Facts items={[["প্যারালাল লোড", "সব বিট **একসাথে** এক ক্লকে ঢোকে (D₃ D₂ D₁ D₀ → Q₃ Q₂ Q₁ Q₀)।", "bg-lilac"], ["শিফট রেজিস্টার", "প্রতি ক্লকে বিটগুলো এক ঘর **ডানে সরে** যায়, বামে সিরিয়াল ইনপুট ঢোকে।", "bg-sky"]]} /></div>
        <div className="mt-4"><PillChoice id="reg" value={mode} onChange={(m) => { setMode(m); clear(); setExLabel(""); }} options={[{ id: "par", label: "প্যারালাল লোড" }, { id: "shift", label: "শিফট (সিরিয়াল ইন)" }]} /></div>
      </Panel>
      <Panel title={mode === "par" ? "৪-বিট প্যারালাল রেজিস্টার" : "৪-বিট শিফট রেজিস্টার"} sub={mode === "par" ? "D এর বিটগুলো ঠিক করো, তারপর ক্লক পালস দাও।" : "সিরিয়াল ইনপুট (SI) ঠিক করে ক্লক পালস দিতে থাকো: বিটগুলো ডানে সরবে।"}>
        <div className="mx-auto max-w-xl">
          {mode === "shift" && <div className="mb-3 flex items-center gap-3"><span className="num font-bold">SI</span><BitBtn v={si} onClick={() => setSi(1 - si)} label="সিরিয়াল ইনপুট" /><span className="text-sm text-ink/55">→ Q₃ তে ঢুকবে</span></div>}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <FF key={i} name={`Q${SUB[3 - i]}`} q={q[i]} tick={clk} edge={edge} moved dir={mode === "shift" ? "right" : "down"}>
                {mode === "par" ? <div className="flex flex-col items-center gap-1"><BitBtn v={d[i]} onClick={() => flip(i)} label={`D${3 - i}`} size="h-10 w-10" /><span className="num text-[11px] font-bold text-ink/45">D{SUB[3 - i]}</span></div>
                  : <p className="num text-sm font-bold text-ink/55">D ← {i === 0 ? "SI" : `Q${SUB[4 - i]}`}</p>}
              </FF>
            ))}
          </div>
          <div className="mt-3"><GenButton onClick={generate} note={exLabel || (mode === "par" ? "D₃ D₂ D₁ D₀-এর একটি র‍্যান্ডম মান" : "সিরিয়াল ইনপুট SI-এর নতুন মান")} /></div>
          <Bits3D bits={q} height={118} className="mt-3" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <ClockPanel onClick={pulse} count={clk} hi={edge} />
            <button type="button" onClick={clear} className="rounded-full bg-ink/[.07] px-5 py-2.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">মুছুন</button>
          </div>
          <p className="mt-4 rounded-2xl bg-mint px-4 py-3 text-center font-semibold ring-1 ring-ink/[.06]">রেজিস্টারে জমা: <Eq>{q.join("")}</Eq> = ডেসিমাল <span className="num">{toNum(q)}</span></p>
        </div>
      </Panel>
    </div>
  );
}

/* ---------- 3.7.12 কাউন্টার ---------- */
function Timing({ hist }) {
  const W = 44, L = 46, rows = [["CLK"], ["Q₀", 0], ["Q₁", 1], ["Q₂", 2], ["Q₃", 3]];
  const rh = 34, H = rows.length * rh + 14;
  return (
    <div className="overflow-x-auto no-sb rounded-2xl ring-1 ring-ink/10">
      <svg viewBox={`0 0 ${L + 12 * W + 8} ${H}`} className="block w-full min-w-[520px] text-ink" role="img" aria-label="টাইমিং ডায়াগ্রাম">
        {rows.map(([name, bit], r) => {
          const top = 8 + r * rh + 6, bot = top + 18;
          let d = "";
          hist.forEach((c, k) => {
            const x = L + k * W;
            if (bit == null) d += `${k === 0 ? "M" : "L"}${x} ${bot}L${x} ${top}L${x + W / 2} ${top}L${x + W / 2} ${bot}L${x + W} ${bot}`;
            else { const y = ((c >> bit) & 1) ? top : bot; const py = k ? (((hist[k - 1] >> bit) & 1) ? top : bot) : y; d += `${k === 0 ? "M" : "L"}${x} ${py}L${x} ${y}L${x + W} ${y}`; }
          });
          return (
            <g key={name}>
              <text x="4" y={top + 13} className="fill-current text-[12px] font-bold" opacity=".7">{name}</text>
              <path d={d} fill="none" stroke={bit == null ? "rgb(var(--ink) / .55)" : "#10b981"} strokeWidth="2.2" strokeLinejoin="round" />
            </g>
          );
        })}
        {hist.map((c, k) => <text key={k} x={L + k * W + W / 2} y={H - 2} textAnchor="middle" className="fill-current text-[10px] font-bold" opacity=".45">{c}</text>)}
      </svg>
    </div>
  );
}

export function Counter() {
  const [mode, setMode] = useState("up");
  const [c, setC] = useState(0);
  const [prev, setPrev] = useState(0);
  const [hist, setHist] = useState([0]);
  const [clk, setClk] = useState(0);
  const [run, setRun] = useState(false);
  const edge = useEdge(clk, 380);
  const next = (x, m) => (m === "up" ? (x + 1) % 16 : m === "down" ? (x + 15) % 16 : (x + 1) % 10);
  const step = () => { const n = next(c, mode); setPrev(c); setC(n); setHist((h) => [...h, n].slice(-12)); setClk((k) => k + 1); };
  useInterval(step, 900, run);
  const reset = () => { setC(0); setPrev(0); setHist([0]); setClk(0); setRun(false); };
  const bits = [(c >> 3) & 1, (c >> 2) & 1, (c >> 1) & 1, c & 1];
  const changed = (i) => ((c ^ prev) >> (3 - i)) & 1;
  return (
    <div className="space-y-4">
      <Panel>
        <P>**কাউন্টার (Counter)** ক্লক পালসের সংখ্যা গোনে। এটি ফ্লিপ-ফ্লপ দিয়ে তৈরি এবং ফ্লিপ-ফ্লপগুলো **টগল (T)** মোডে থাকে। n টি ফ্লিপ-ফ্লপে 2^[n] টি অবস্থা গোনা যায়, একে **MOD-2ⁿ** কাউন্টার বলে। 4 বিটে 0 থেকে 15 পর্যন্ত, তারপর আবার 0।</P>
        <div className="mt-3"><Facts items={[["Q₀", "প্রতি ক্লকে টগল করে (ক্লকের অর্ধেক ফ্রিকোয়েন্সি)।", "bg-lilac"], ["Q₁", "Q₀ যখন 1 থেকে 0 হয় তখন টগল করে (ক্লকের ¼ ফ্রিকোয়েন্সি)।", "bg-sky"], ["রিপল কাউন্টার", "প্রতিটি ফ্লিপ-ফ্লপ আগেরটির আউটপুট দিয়ে চলে (অ্যাসিনক্রোনাস)।", "bg-mint"], ["MOD-10", "গণনা 9 এ পৌঁছে 0 তে ফেরে (ডেকেড কাউন্টার)।", "bg-peach"]]} /></div>
        <div className="mt-4"><PillChoice id="cnt" value={mode} onChange={(m) => { setMode(m); reset(); }} options={[{ id: "up", label: "আপ (0→15)" }, { id: "down", label: "ডাউন (15→0)" }, { id: "mod10", label: "MOD-10 (0→9)" }]} /></div>
      </Panel>
      <Panel title="৪-বিট বাইনারি কাউন্টার" sub="ক্লক পালস দাও বা অটো চালু করো; টাইমিং ডায়াগ্রামে শেষ 12টি অবস্থা দেখো।">
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <FF key={i} kind="T" name={`Q${SUB[3 - i]}`} q={bits[i]} tick={changed(i) ? clk : 0} edge={edge} moved={!!changed(i)}>
                <span className={`num rounded-full px-2.5 py-1 text-xs font-bold ${changed(i) ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-ink/[.06] text-ink/50"}`}>{changed(i) ? "টগল হলো" : "অপরিবর্তিত"}</span>
              </FF>
            ))}
          </div>
          <Bits3D bits={bits} height={118} className="mt-3" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <ClockPanel onClick={step} count={clk} hi={edge} />
            <div className="flex gap-2">
              <button type="button" aria-pressed={run} onClick={() => setRun((r) => !r)} className={`rounded-full px-5 py-2.5 font-semibold transition active:scale-95 ${run ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{run ? "থামাও" : "অটো চালাও"}</button>
              <button type="button" onClick={reset} className="rounded-full bg-ink/[.07] px-5 py-2.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">রিসেট</button>
            </div>
          </div>
          <p className="mt-4 rounded-2xl bg-mint px-4 py-3 text-center font-semibold ring-1 ring-ink/[.06]">গণনা: <Eq>{bits.join("")}</Eq> = ডেসিমাল <span className="num text-xl font-extrabold">{c}</span></p>
        </div>
        <div className="mt-4"><Timing hist={hist} /></div>
        <p className="mt-2 text-sm text-ink/55">টাইমিং ডায়াগ্রাম: ক্লকের প্রতিটি ওঠার ধারে (↑) আউটপুট বদলায়। নিচের সংখ্যাগুলো সেই সময়ের গণনা।</p>
      </Panel>
    </div>
  );
}
