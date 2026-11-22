import { useState } from "react";
import { motion } from "framer-motion";
import Bits3D from "../../components/Bits3D";
import { PillChoice } from "../../components/controls";
import { BitBtn, Eq, Facts, P, Panel, useInterval } from "./shared";

const SUB = ["₀", "₁", "₂", "₃"];
const toNum = (bits) => bits.reduce((a, b) => (a << 1) | b, 0);

function ClockBtn({ onClick, count, label = "ক্লক পালস" }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onClick} className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[17px] font-bold text-paper shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17h5V7h8v10h5" /></svg>
      {label}<span className="num rounded-full bg-paper/20 px-2.5 py-0.5 text-sm">{count}</span>
    </motion.button>
  );
}

/** ফ্লিপ-ফ্লপের কার্ড: নাম, ইনপুট অংশ (children), আউটপুট Q; ক্লকে বদলালে ঝলক দেয় */
function FF({ name, q, tick, children, kind = "D" }) {
  return (
    <motion.div key={tick} initial={{ scale: 1 }} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 0.3 }} className="rounded-2xl bg-surface p-2 text-center ring-1 ring-ink/10 sm:p-3">
      <p className="num text-xs font-bold text-ink/55">{kind}-FF · {name}</p>
      <div className="my-2 flex min-h-11 items-center justify-center">{children}</div>
      <div className="mx-auto h-px w-6 bg-ink/20" />
      <motion.p initial={false} animate={{ color: q ? "#059669" : "rgba(120,124,150,.9)" }} className="num mt-1.5 text-3xl font-extrabold">{q}</motion.p>
      <p className="num text-[11px] font-bold text-ink/45">Q</p>
    </motion.div>
  );
}

/* ---------- 3.7.11 রেজিস্টার ---------- */
export function Register() {
  const [mode, setMode] = useState("par");
  const [d, setD] = useState([1, 0, 1, 1]);
  const [si, setSi] = useState(1);
  const [q, setQ] = useState([0, 0, 0, 0]); // q[0] = Q3 (MSB)
  const [clk, setClk] = useState(0);
  const pulse = () => { setQ((x) => (mode === "par" ? [...d] : [si, x[0], x[1], x[2]])); setClk((c) => c + 1); };
  const clear = () => { setQ([0, 0, 0, 0]); setClk(0); };
  const flip = (i) => setD((x) => x.map((v, j) => (j === i ? 1 - v : v)));
  return (
    <div className="space-y-4">
      <Panel>
        <P>**রেজিস্টার (Register)** হলো একগুচ্ছ **ফ্লিপ-ফ্লপ**, যা প্রতিটি একটি করে বিট ধরে রাখে। n বিটের রেজিস্টারে n টি ফ্লিপ-ফ্লপ লাগে। ক্লকের **প্রতিটি পালসেই** ফ্লিপ-ফ্লপ তার ইনপুট D এর মান আউটপুট Q তে তুলে নেয়; পরের পালস না আসা পর্যন্ত মান অপরিবর্তিত থাকে।</P>
        <div className="mt-3"><Facts items={[["প্যারালাল লোড", "সব বিট **একসাথে** এক ক্লকে ঢোকে (D₃ D₂ D₁ D₀ → Q₃ Q₂ Q₁ Q₀)।", "bg-lilac"], ["শিফট রেজিস্টার", "প্রতি ক্লকে বিটগুলো এক ঘর **ডানে সরে** যায়, বামে সিরিয়াল ইনপুট ঢোকে।", "bg-sky"]]} /></div>
        <div className="mt-4"><PillChoice id="reg" value={mode} onChange={(m) => { setMode(m); clear(); }} options={[{ id: "par", label: "প্যারালাল লোড" }, { id: "shift", label: "শিফট (সিরিয়াল ইন)" }]} /></div>
      </Panel>
      <Panel title={mode === "par" ? "৪-বিট প্যারালাল রেজিস্টার" : "৪-বিট শিফট রেজিস্টার"} sub={mode === "par" ? "D এর বিটগুলো ঠিক করুন, তারপর ক্লক পালস দিন।" : "সিরিয়াল ইনপুট (SI) ঠিক করে ক্লক পালস দিতে থাকুন: বিটগুলো ডানে সরবে।"}>
        <div className="mx-auto max-w-xl">
          {mode === "shift" && <div className="mb-3 flex items-center gap-3"><span className="num font-bold">SI</span><BitBtn v={si} onClick={() => setSi(1 - si)} label="সিরিয়াল ইনপুট" /><span className="text-sm text-ink/55">→ Q₃ তে ঢুকবে</span></div>}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <FF key={i} name={`Q${SUB[3 - i]}`} q={q[i]} tick={clk}>
                {mode === "par" ? <div className="flex flex-col items-center gap-1"><BitBtn v={d[i]} onClick={() => flip(i)} label={`D${3 - i}`} size="h-10 w-10" /><span className="num text-[11px] font-bold text-ink/45">D{SUB[3 - i]}</span></div>
                  : <p className="num text-sm font-bold text-ink/55">D ← {i === 0 ? "SI" : `Q${SUB[4 - i]}`}</p>}
              </FF>
            ))}
          </div>
          <Bits3D bits={q} height={118} className="mt-3" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <ClockBtn onClick={pulse} count={clk} />
            <button type="button" onClick={clear} className="rounded-full bg-ink/[.07] px-5 py-2.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">সাফ (Clear)</button>
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
    <div className="overflow-x-auto rounded-2xl ring-1 ring-ink/10">
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
      <Panel title="৪-বিট বাইনারি কাউন্টার" sub="ক্লক পালস দিন বা অটো চালু করুন; টাইমিং ডায়াগ্রামে শেষ 12টি অবস্থা দেখুন।">
        <div className="mx-auto max-w-xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => (
              <FF key={i} kind="T" name={`Q${SUB[3 - i]}`} q={bits[i]} tick={changed(i) ? clk : 0}>
                <span className={`num rounded-full px-2.5 py-1 text-xs font-bold ${changed(i) ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-ink/[.06] text-ink/50"}`}>{changed(i) ? "টগল হলো" : "অপরিবর্তিত"}</span>
              </FF>
            ))}
          </div>
          <Bits3D bits={bits} height={118} className="mt-3" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <ClockBtn onClick={step} count={clk} />
            <div className="flex gap-2">
              <button type="button" aria-pressed={run} onClick={() => setRun((r) => !r)} className={`rounded-full px-5 py-2.5 font-semibold transition active:scale-95 ${run ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{run ? "থামান" : "অটো চালান"}</button>
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
