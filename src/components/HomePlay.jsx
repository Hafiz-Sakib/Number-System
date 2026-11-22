import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DigitRoll, Reveal } from "./ui";
import { CLR, PillChoice } from "./controls";
import { Lab } from "./Circuit";
import { gateNet, useInterval } from "../sections/logic/shared";
import { navigate } from "../lib/router";

/* হোম পেজের ৯টি ইন্টারেক্টিভ / অ্যানিমেটেড সেকশন (একটির নিচে একটি, ক্রমানুসারে):
   ১) ৮-বিট বাইট সুইচ  ২) গণনার দৌড় (চার পদ্ধতি)  ৩) ২ দিয়ে ভাগের অ্যানিমেশন
   ৪) মন-পড়া কার্ড (বাইনারির জাদু)  ৫) মিনি লজিক গেট ল্যাব (আউটপুট 1 হলে glow)
   ৬) হেক্স রঙ মিক্সার  ৭) ASCII/Unicode টেক্সট এনকোডার  ৮) IPv4 ঠিকানা  ৯) BCD ডিজিটাল ঘড়ি */

const pad = (s, n) => s.toString(2).padStart(n, "0");

function Block({ tag, title, desc, children, className = "", tone = "bg-surface" }) {
  return (
    <Reveal className={className}>
      <section className={`card h-full p-5 sm:p-6 ${tone === "bg-surface" ? "" : ""}`}>
        <p className="num mb-2 inline-flex rounded-full bg-ink/[.06] px-3 py-1 text-xs font-bold text-ink/60">{tag}</p>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="mt-1.5 max-w-2xl leading-[1.8] text-ink/65">{desc}</p>
        <div className="mt-5">{children}</div>
      </section>
    </Reveal>
  );
}

/* ---------- ১) বাইট সুইচ ---------- */
const PRESETS = [[0, "0"], [65, "'A'"], [127, "127"], [255, "255"]];
function ByteLab() {
  const [v, setV] = useState(72);
  const bits = [7, 6, 5, 4, 3, 2, 1, 0];
  const on = bits.filter((i) => (v >> i) & 1);
  const ch = v >= 33 && v <= 126 ? String.fromCharCode(v) : v === 32 ? "␣" : "·";
  const out = [[2, pad(v, 8)], [8, v.toString(8)], [10, String(v)], [16, v.toString(16).toUpperCase()]];
  return (
    <Block tag="বাইট সুইচ" title="৮টি সুইচে একটি বাইট" desc="প্রতিটি সুইচ একটি বিট। চালু (1) করলে তার ঘরের মান (স্থানীয় মান) যোগ হয়: সুইচ টিপে দেখুন চারটি পদ্ধতিতে সংখ্যাটি কী দাঁড়ায়।">
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5">
        {bits.map((i) => {
          const b = (v >> i) & 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="num text-[11px] font-bold text-ink/45 sm:text-xs">{1 << i}</span>
              <motion.button type="button" role="switch" aria-checked={!!b} aria-label={`বিট ${i}`} whileTap={{ scale: 0.88 }} onClick={() => setV(v ^ (1 << i))}
                initial={false} animate={{ backgroundColor: b ? "#10b981" : "rgba(120,124,150,.16)", color: b ? "#fff" : "rgba(120,124,150,.95)", boxShadow: b ? "0 0 0 2px rgba(110,231,183,.9), 0 0 16px rgba(16,185,129,.75), 0 0 34px rgba(16,185,129,.35)" : "0 0 0 0 rgba(0,0,0,0)" }}
                transition={{ duration: 0.2 }} className="num grid h-11 w-9 place-items-center rounded-xl text-xl font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:h-14 sm:w-12">
                <motion.span key={b} initial={{ y: b ? 10 : -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }}>{b}</motion.span>
              </motion.button>
              <span className="num text-[10px] text-ink/35">2^{i}</span>
            </div>
          );
        })}
      </div>
      <p className="num mt-4 rounded-2xl bg-ink/[.05] px-4 py-2.5 text-center text-[15px] font-semibold text-ink/75">
        {on.length ? on.map((i) => 1 << i).join(" + ") : "0"} = <span className="font-extrabold text-ink">{v}</span>
        <span className="ml-3 rounded-lg bg-lemon px-2 py-0.5 text-ink">ASCII: {ch}</span>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {out.map(([b, t]) => (
          <div key={b} className={`min-w-0 rounded-2xl px-4 py-3 ring-1 ${CLR[b].bg} ${CLR[b].ring}`}>
            <p className={`text-xs font-bold ${CLR[b].text}`}>{{ 2: "বাইনারি", 8: "অক্টাল", 10: "ডেসিমাল", 16: "হেক্সাডেসিমাল" }[b]}</p>
            <p className={`num mt-1 break-all text-xl font-extrabold ${CLR[b].text}`}><DigitRoll text={t} /></p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map(([n, l]) => <button key={n} type="button" onClick={() => setV(n)} className="num rounded-full bg-ink/[.07] px-4 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">{l}</button>)}
        <button type="button" onClick={() => setV(Math.floor(Math.random() * 256))} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">র‍্যান্ডম</button>
      </div>
    </Block>
  );
}

/* ---------- ২) গণনার দৌড় ---------- */
function CountRace() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const [run, setRun] = useState(!reduce);
  useInterval(() => setN((x) => (x + 1) % 32), 900, run);
  const rows = [[2, pad(n, 5)], [8, n.toString(8)], [10, String(n)], [16, n.toString(16).toUpperCase()]];
  const NAME = { 2: "বাইনারি", 8: "অক্টাল", 10: "ডেসিমাল", 16: "হেক্স" };
  return (
    <Block tag="গণনার দৌড়" title="একই সংখ্যা, চার রূপ" desc="0 থেকে 31 পর্যন্ত গুনতে থাকলে চার পদ্ধতিতে সংখ্যাটি কীভাবে বদলায় দেখুন। ভিত্তি পূর্ণ হলেই নতুন ঘর (ক্যারি) যোগ হয়।">
      <div className="space-y-2">
        {rows.map(([b, t]) => (
          <div key={b} className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 ring-1 ${CLR[b].bg} ${CLR[b].ring}`}>
            <span className={`text-sm font-bold ${CLR[b].text}`}>{NAME[b]}</span>
            {b === 2 ? (
              <span className="flex gap-1.5">
                {t.split("").map((c, i) => (
                  <motion.span key={i} initial={false} animate={{ backgroundColor: c === "1" ? "#10b981" : "rgba(120,124,150,.2)", color: c === "1" ? "#fff" : "rgba(120,124,150,1)", boxShadow: c === "1" ? "0 0 12px rgba(16,185,129,.7)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.2 }} className="num grid h-8 w-7 place-items-center rounded-lg text-base font-extrabold">{c}</motion.span>
                ))}
              </span>
            ) : <span className={`num text-2xl font-extrabold ${CLR[b].text}`}><DigitRoll text={t} /></span>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-0.5" aria-hidden>
        {Array.from({ length: 32 }, (_, i) => <motion.span key={i} initial={false} animate={{ opacity: i <= n ? 1 : 0.18, scaleY: i === n ? 1.7 : 1 }} className={`h-2 flex-1 rounded-full ${i % 8 === 7 ? "bg-violet-500" : "bg-emerald-500"}`} />)}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" aria-pressed={run} onClick={() => setRun((r) => !r)} className={`rounded-full px-5 py-2 font-semibold transition active:scale-95 ${run ? "bg-emerald-500 text-white" : "bg-ink text-paper"}`}>{run ? "থামান" : "চালান"}</button>
        <button type="button" onClick={() => setN((x) => (x + 1) % 32)} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">+1</button>
        <button type="button" onClick={() => setN(0)} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">0 থেকে</button>
      </div>
    </Block>
  );
}

/* ---------- ৩) ২ দিয়ে ভাগ ---------- */
const divSteps = (n) => { const r = []; let x = n; if (!x) return [{ x: 0, q: 0, r: 0 }]; while (x > 0) { r.push({ x, q: x >> 1, r: x & 1 }); x >>= 1; } return r; };
function DivideLab() {
  const [n, setN] = useState(25);
  const [shown, setShown] = useState(0);
  const [go, setGo] = useState(true);
  const steps = useMemo(() => divSteps(n), [n]);
  const L = steps.length;
  const playing = go && shown < L;
  useInterval(() => setShown((s) => s + 1), 650, playing);
  const pick = (v) => { setN(v); setShown(0); setGo(true); };
  const done = shown >= L;
  return (
    <Block tag="ভাগের পদ্ধতি" title="২ দিয়ে ভাগ করে বাইনারি" desc="ডেসিমাল থেকে বাইনারিতে যেতে বারবার 2 দিয়ে ভাগ করি। ভাগশেষগুলো নিচ থেকে ওপরে পড়লেই উত্তর।">
      <div className="flex flex-wrap items-center gap-3">
        <input type="range" min="1" max="255" value={n} aria-label="ডেসিমাল সংখ্যা" onChange={(e) => pick(+e.target.value)} className="h-2 min-w-0 flex-1 accent-emerald-500" />
        <span className="num rounded-xl bg-sky px-3 py-1 text-lg font-extrabold">{n}</span>
        <button type="button" onClick={() => { setShown(0); setGo(true); }} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">আবার চালাও</button>
      </div>
      <div className="mt-4 min-h-[8.5rem] rounded-2xl bg-ink/[.04] p-3 ring-1 ring-ink/[.06]">
        <ul className="num space-y-1.5 text-[15px]">
          <AnimatePresence initial={false}>
            {steps.slice(0, shown).map((s, i) => (
              <motion.li key={`${n}-${i}`} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }} className="flex items-center gap-2">
                <span className="w-24 shrink-0 font-semibold sm:w-28">{s.x} ÷ 2 = {s.q}</span>
                <span className="text-ink/50">ভাগশেষ</span>
                <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} className={`grid h-6 w-6 place-items-center rounded-md text-sm font-extrabold ${s.r ? "bg-emerald-500 text-white" : "bg-ink/10"}`}>{s.r}</motion.span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {shown === 0 && <p className="text-ink/45">ধাপ শুরু হচ্ছে…</p>}
      </div>
      <p className="mt-3 text-sm font-bold text-ink/55">ভাগশেষ নিচ থেকে ওপরে ↑</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: L }, (_, j) => {
          const si = L - 1 - j, filled = si < shown;
          return (
            <motion.span key={`${n}-${j}`} initial={false} animate={{ backgroundColor: filled ? (steps[si].r ? "#10b981" : "rgba(120,124,150,.25)") : "rgba(120,124,150,.08)", scale: filled ? [1, 1.25, 1] : 1, boxShadow: filled && steps[si].r ? "0 0 12px rgba(16,185,129,.7)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.3 }}
              className={`num grid h-10 w-8 place-items-center rounded-lg text-lg font-extrabold ${filled ? (steps[si].r ? "text-white" : "text-ink") : "text-transparent ring-1 ring-dashed ring-ink/20"}`}>{filled ? steps[si].r : "·"}</motion.span>
          );
        })}
        <AnimatePresence>{done && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="num ml-2 rounded-xl bg-lilac px-3 py-1.5 text-lg font-extrabold">({n})₁₀ = ({n.toString(2)})₂</motion.span>}</AnimatePresence>
      </div>
    </Block>
  );
}

/* ---------- ৪) মন-পড়া কার্ড (বাইনারির জাদু) ---------- */
const CARDS = [1, 2, 4, 8, 16];
const cardNums = (c) => Array.from({ length: 31 }, (_, i) => i + 1).filter((n) => n & c);
function MagicCards() {
  const [picked, setPicked] = useState([]);
  const toggle = (c) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const total = picked.reduce((s, c) => s + c, 0);
  const bin = pad(total, 5);
  return (
    <Block tag="মন-পড়া কার্ড" title="মনে মনে একটা সংখ্যা ভাবুন" desc="1 থেকে 31-এর মধ্যে যেকোনো একটি সংখ্যা ভাবুন। যে কার্ডগুলোতে সেটি আছে, শুধু সেগুলোতে চাপ দিন: নিচে সংখ্যাটি বলে দেওয়া হবে। জাদু নয়, বাইনারি!">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {CARDS.map((c) => {
          const on = picked.includes(c);
          return (
            <motion.button key={c} type="button" aria-pressed={on} onClick={() => toggle(c)} whileTap={{ scale: 0.95 }} initial={false}
              animate={{ boxShadow: on ? "0 0 0 2px rgba(16,185,129,.95), 0 0 22px rgba(16,185,129,.4)" : "0 0 0 1px rgba(120,124,150,.22)" }}
              className={`rounded-2xl p-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 ${on ? "bg-emerald-500/15" : "bg-ink/[.04]"} ${c === 16 ? "col-span-1" : ""}`}>
              <span className={`num mb-1.5 flex items-center justify-between text-xs font-extrabold ${on ? "text-emerald-700 dark:text-emerald-300" : "text-ink/55"}`}>
                <span>কার্ড {c}</span><span aria-hidden>{on ? "✓" : "○"}</span>
              </span>
              <span className="num grid grid-cols-4 gap-0.5 text-center text-[11px] font-semibold leading-6 text-ink/70">
                {cardNums(c).map((n) => <span key={n} className={`rounded ${on ? "bg-emerald-500/20" : ""}`}>{n}</span>)}
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-lilac px-4 py-3 text-center ring-1 ring-ink/[.06]">
        {picked.length ? (
          <>
            <p className="num text-[15px] font-semibold text-ink/70">{[...picked].sort((a, b) => a - b).join(" + ")} = <span className="text-2xl font-extrabold text-ink"><DigitRoll text={String(total)} /></span></p>
            <p className="num mt-1 text-sm font-semibold text-ink/55">বাইনারি: {bin.split("").map((ch, i) => <span key={i} className={ch === "1" ? "font-extrabold text-emerald-600 dark:text-emerald-300" : ""}>{ch}</span>)}: কার্ড বাছা মানে বিট 1, না বাছা মানে বিট 0</p>
          </>
        ) : <p className="font-semibold text-ink/55">এখনো কোনো কার্ড বাছা হয়নি। সংখ্যাটি যে কার্ডে আছে তাতে চাপ দিন।</p>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPicked([])} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">নতুন করে শুরু</button>
        <button type="button" onClick={() => setPicked(CARDS.filter((c) => (1 + Math.floor(Math.random() * 31)) & c))} className="rounded-full bg-ink/[.07] px-4 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">এলোমেলো কার্ড</button>
      </div>
    </Block>
  );
}

/* ---------- ৫) মিনি লজিক গেট ল্যাব ---------- */
const GSAY = {
  AND: "দুটিই 1 হলে আউটপুট 1।", OR: "যেকোনো একটি 1 হলেই আউটপুট 1।", NOT: "ইনপুটের উল্টো মান দেয়।",
  NAND: "AND এর উল্টো: দুটিই 1 হলে শুধু 0।", NOR: "OR এর উল্টো: দুটিই 0 হলে শুধু 1।", XOR: "ইনপুট ভিন্ন হলে 1।", XNOR: "ইনপুট সমান হলে 1।",
};
function MiniGate() {
  const [t, setT] = useState("AND");
  const net = useMemo(() => gateNet(t, t === "NOT" ? 1 : 2), [t]);
  return (
    <Block tag="লজিক গেট" title="মিনি লজিক গেট ল্যাব" desc="গেট বেছে নিন, সুইচ টিপুন। আউটপুট 1 হলে LED সবুজ আলোয় জ্বলে ওঠে।">
      <PillChoice id="home-gate" value={t} onChange={setT} options={Object.keys(GSAY).map((g) => ({ id: g, label: g }))} />
      <p className="mb-3 mt-3 text-ink/70">{GSAY[t]}</p>
      <Lab key={t} net={net} />
      <button type="button" onClick={() => navigate("/gates")} className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">সব গেট ও অ্যাডার →</button>
    </Block>
  );
}


/* ---------- ৬) হেক্স রঙ মিক্সার ---------- */
const RGB = [["R", "লাল", "#ef4444"], ["G", "সবুজ", "#10b981"], ["B", "নীল", "#3b82f6"]];
const COLOR_PRESETS = [["লাল", [255, 0, 0]], ["হলুদ", [255, 255, 0]], ["সবুজ", [0, 200, 90]], ["আকাশি", [60, 160, 255]], ["বেগুনি", [145, 80, 224]], ["সাদা", [255, 255, 255]], ["কালো", [0, 0, 0]]];
const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
function ColorMixer() {
  const [rgb, setRgb] = useState([145, 80, 224]);
  const set = (i, v) => setRgb((a) => a.map((x, k) => (k === i ? v : x)));
  const code = "#" + rgb.map(hex2).join("");
  const light = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 150;
  return (
    <Block tag="হেক্স রঙ" title="হেক্সাডেসিমালে রঙের কোড" desc="ওয়েবের প্রতিটি রঙ তিনটি বাইট: লাল, সবুজ, নীল (0–255)। প্রতি বাইট হেক্সে দুই অঙ্ক। স্লাইডার টেনে দেখুন রঙ ও হেক্স কোড একসাথে বদলায়।">
      <div className="grid items-stretch gap-4 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <motion.div initial={false} animate={{ backgroundColor: code }} transition={{ duration: 0.25 }} className="grid min-h-[8rem] place-items-center rounded-2xl ring-1 ring-ink/10 sm:min-h-0" role="img" aria-label={`রঙ ${code}`}>
          <span className={`num text-3xl font-extrabold tracking-wide ${light ? "text-black/80" : "text-white"}`}>{code}</span>
        </motion.div>
        <div className="min-w-0 space-y-2.5">
          {RGB.map(([k, name, col], i) => {
            const h = hex2(rgb[i]);
            return (
              <div key={k} className="rounded-2xl bg-ink/[.04] px-3.5 py-2.5 ring-1 ring-ink/[.06]">
                <div className="flex items-center justify-between gap-2 text-sm font-bold">
                  <span style={{ color: col }}>{name} ({k})</span>
                  <span className="num text-ink/60">{rgb[i]} = {pad(rgb[i], 8)}₂ = <span className="text-base font-extrabold text-ink">{h}</span><sub className="text-ink/40">16</sub></span>
                </div>
                <input type="range" min="0" max="255" value={rgb[i]} aria-label={name} onChange={(e) => set(i, +e.target.value)} className="mt-1.5 h-2 w-full" style={{ accentColor: col }} />
                <p className="num mt-1 text-xs font-semibold text-ink/50">{parseInt(h[0], 16)} × 16 + {parseInt(h[1], 16)} = {rgb[i]}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {COLOR_PRESETS.map(([n, v]) => (
          <button key={n} type="button" onClick={() => setRgb(v)} className="inline-flex items-center gap-2 rounded-full bg-ink/[.07] px-3.5 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">
            <span aria-hidden className="h-3.5 w-3.5 rounded-full ring-1 ring-ink/20" style={{ backgroundColor: `rgb(${v.join(",")})` }} />{n}
          </button>
        ))}
        <button type="button" onClick={() => setRgb([0, 0, 0].map(() => Math.floor(Math.random() * 256)))} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">র‍্যান্ডম রঙ</button>
      </div>
    </Block>
  );
}

/* ---------- ৭) টেক্সট থেকে বাইনারি (ASCII ও Unicode) ---------- */
const TXT_PRESETS = ["Sakib", "Hi!", "আমি", "A", "৳100"];
function TextEncoder2() {
  const [txt, setTxt] = useState("Sakib");
  const chars = [...txt].slice(0, 8);
  const more = [...txt].length - chars.length;
  return (
    <Block tag="ASCII ও Unicode" title="আপনার নাম কম্পিউটারে কীভাবে জমা থাকে?" desc="কম্পিউটার অক্ষর চেনে না, চেনে শুধু সংখ্যা। প্রতিটি অক্ষরের একটি কোড আছে (ইংরেজির জন্য ASCII, বাংলাসহ সব ভাষার জন্য Unicode) আর সেই কোডটিই বাইনারিতে জমা হয়। যেকোনো কিছু লিখে দেখুন।">
      <input type="text" value={txt} maxLength={24} onChange={(e) => setTxt(e.target.value)} placeholder="এখানে লিখুন…" aria-label="অক্ষর লিখুন"
        className="w-full rounded-2xl bg-ink/[.05] px-4 py-3 text-xl font-bold outline-none ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500" />
      <div className="mt-2 flex flex-wrap gap-2">
        {TXT_PRESETS.map((t) => <button key={t} type="button" onClick={() => setTxt(t)} className="rounded-full bg-ink/[.07] px-3.5 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">{t}</button>)}
      </div>
      <div className="mt-3 space-y-2">
        {chars.length === 0 && <p className="rounded-2xl bg-ink/[.04] px-4 py-3 text-ink/50">কিছু লিখলে এখানে প্রতিটি অক্ষরের কোড দেখা যাবে।</p>}
        <AnimatePresence initial={false}>
          {chars.map((ch, i) => {
            const cp = ch.codePointAt(0), ascii = cp < 128;
            const bin = cp.toString(2).padStart(ascii ? 8 : 16, "0");
            return (
              <motion.div key={`${i}-${ch}`} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-3 py-2 ring-1 ring-ink/[.06] ${ascii ? "bg-sky" : "bg-lilac"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-2xl font-extrabold">{ch === " " ? "␣" : ch}</span>
                <span className="num w-24 shrink-0 text-sm font-bold text-ink/65">{ascii ? "ASCII" : "Unicode"} {cp}<span className="ml-1 text-ink/40">({ascii ? cp.toString(16).toUpperCase() : "U+" + cp.toString(16).toUpperCase().padStart(4, "0")})</span></span>
                <span className="num flex min-w-0 flex-wrap gap-0.5">
                  {bin.split("").map((b, k) => <span key={k} className={`grid h-6 w-[1.15rem] place-items-center rounded text-[13px] font-extrabold ${b === "1" ? "bg-emerald-500 text-white" : "bg-ink/10 text-ink/45"} ${k % 4 === 3 && k < bin.length - 1 ? "mr-1" : ""}`}>{b}</span>)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {more > 0 && <p className="text-sm text-ink/50">আরও {more}টি অক্ষর আছে: এখানে প্রথম 8টি দেখানো হলো।</p>}
      </div>
      <p className="mt-3 rounded-2xl bg-lemon px-4 py-2.5 text-sm font-semibold">মজার তথ্য: ASCII-তে <span className="num font-extrabold">A = 65</span> আর <span className="num font-extrabold">a = 97</span>। দুটোর পার্থক্য ঠিক 32, অর্থাৎ বাইনারিতে শুধু একটি বিট আলাদা।</p>
    </Block>
  );
}

/* ---------- ৮) IPv4 ঠিকানা: সংখ্যা পদ্ধতির নেটওয়ার্ক ব্যবহার ---------- */
const IP_PRESETS = [["ঘরের রাউটার", [192, 168, 0, 1]], ["Google DNS", [8, 8, 8, 8]], ["লোকালহোস্ট", [127, 0, 0, 1]], ["বিশ্ববিদ্যালয়", [172, 16, 5, 20]]];
const ipClass = (a) => (a < 128 ? "A" : a < 192 ? "B" : a < 224 ? "C" : a < 240 ? "D" : "E");
const isPrivate = ([a, b]) => a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
function IpLab() {
  const [ip, setIp] = useState([192, 168, 0, 1]);
  const flip = (o, bit) => setIp((a) => a.map((x, k) => (k === o ? x ^ (1 << bit) : x)));
  const kind = ip[0] === 127 ? "লুপব্যাক (নিজের কম্পিউটার)" : isPrivate(ip) ? "প্রাইভেট (শুধু স্থানীয় নেটওয়ার্কে)" : "পাবলিক (ইন্টারনেটে চলে)";
  return (
    <Block tag="IPv4 ঠিকানা" title="ইন্টারনেটের ঠিকানাও আসলে বাইনারি" desc="প্রতিটি ডিভাইসের IP ঠিকানা চারটি বাইট (অক্টেট): প্রতিটি 0–255। বিট টিপে ঠিকানা বানান: ডটযুক্ত ডেসিমাল রূপটি পাবেন সাথে সাথে।">
      <div className="space-y-2">
        {ip.map((val, o) => (
          <div key={o} className="flex items-center gap-2 rounded-2xl bg-ink/[.04] px-2.5 py-2 ring-1 ring-ink/[.06] sm:gap-3 sm:px-3">
            <span className="num w-12 shrink-0 text-center text-xl font-extrabold sm:w-14 sm:text-2xl"><DigitRoll text={String(val)} /></span>
            <div className="flex min-w-0 flex-1 justify-between gap-1">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                const on = (val >> bit) & 1;
                return (
                  <motion.button key={bit} type="button" role="switch" aria-checked={!!on} aria-label={`অক্টেট ${o + 1}, মান ${1 << bit}`} onClick={() => flip(o, bit)} whileTap={{ scale: 0.88 }} initial={false}
                    animate={{ backgroundColor: on ? "#10b981" : "rgba(120,124,150,.16)", color: on ? "#fff" : "rgba(120,124,150,.95)", boxShadow: on ? "0 0 12px rgba(16,185,129,.55)" : "0 0 0 rgba(0,0,0,0)" }}
                    className="num flex h-10 min-w-0 flex-1 flex-col items-center justify-center rounded-lg text-sm font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:h-11">
                    {on}<span className="text-[8px] font-semibold opacity-70 sm:text-[9px]">{1 << bit}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <p className="num rounded-2xl bg-mint px-4 py-2.5 text-center text-2xl font-extrabold">{ip.join(".")}</p>
        <p className="num break-all rounded-2xl bg-sky px-4 py-2.5 text-center text-[13px] font-bold sm:text-sm">{ip.map((x) => pad(x, 8)).join(".")}</p>
        <p className="rounded-2xl bg-lilac px-4 py-2.5 text-center text-[15px] font-semibold">ক্লাস <span className="num font-extrabold">{ipClass(ip[0])}</span> · {kind}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {IP_PRESETS.map(([n, v]) => <button key={n} type="button" onClick={() => setIp(v)} className="rounded-full bg-ink/[.07] px-3.5 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">{n}</button>)}
        <button type="button" onClick={() => setIp([0, 0, 0, 0].map(() => Math.floor(Math.random() * 256)))} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">র‍্যান্ডম</button>
      </div>
    </Block>
  );
}

/* ---------- ৯) BCD ডিজিটাল ঘড়ি ---------- */
const nowParts = () => { const d = new Date(), z = (n) => String(n).padStart(2, "0"); return z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()); };
function BcdClock() {
  const [t, setT] = useState(nowParts);
  const [run, setRun] = useState(true);
  useInterval(() => setT(nowParts()), 1000, run);
  const digits = t.split("").map(Number);
  const secs = Number(t.slice(4));
  const BIT = [8, 4, 2, 1];
  return (
    <Block tag="BCD কোড" title="ডিজিটাল ঘড়ির ভেতরের বাইনারি" desc="ডিজিটাল ঘড়ি, ক্যালকুলেটর ও মিটারে প্রতিটি দশমিক অঙ্ক আলাদা 4 বিটে রাখা হয়: একে বলে BCD (Binary Coded Decimal)। এখনকার সময়টি BCD-তে কেমন দেখায় দেখুন।">
      <div className="mx-auto flex max-w-md justify-center gap-1 sm:gap-2">
        {digits.map((d, i) => (
          <div key={i} className={`flex flex-1 flex-col items-center gap-1.5 ${i === 1 || i === 3 ? "mr-2 sm:mr-4" : ""}`}>
            {BIT.map((w) => {
              const on = (d & w) !== 0;
              return <motion.span key={w} initial={false} animate={{ backgroundColor: on ? "#f43f5e" : "rgba(120,124,150,.16)", boxShadow: on ? "0 0 12px rgba(244,63,94,.75), 0 0 26px rgba(244,63,94,.3)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.18 }} className="block aspect-square w-full max-w-[2.4rem] rounded-full" title={`${w}`} />;
            })}
            <span className="num mt-0.5 text-2xl font-extrabold sm:text-3xl"><DigitRoll text={String(d)} /></span>
            <span className="num text-[11px] font-bold text-ink/45">{pad(d, 4)}</span>
          </div>
        ))}
      </div>
      <p className="num mt-1 text-center text-xs font-semibold text-ink/40" aria-hidden>বাঁ থেকে: ঘণ্টা · মিনিট · সেকেন্ড। প্রতি কলামে ওপর থেকে নিচে বিটের মান 8, 4, 2, 1</p>
      <p className="mt-3 rounded-2xl bg-ink/[.05] px-4 py-2.5 text-center text-[15px] font-semibold">
        সেকেন্ড <span className="num font-extrabold">{String(secs).padStart(2, "0")}</span>: BCD-তে <span className="num font-extrabold text-rose-600 dark:text-rose-300">{pad(Math.floor(secs / 10), 4)} {pad(secs % 10, 4)}</span> (8 বিট), কিন্তু সাধারণ বাইনারিতে <span className="num font-extrabold">{secs.toString(2)}</span>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" aria-pressed={run} onClick={() => setRun((r) => !r)} className={`rounded-full px-5 py-2 font-semibold transition active:scale-95 ${run ? "bg-emerald-500 text-white" : "bg-ink text-paper"}`}>{run ? "থামান" : "চালান"}</button>
        <button type="button" onClick={() => setT(nowParts())} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">এখনকার সময়</button>
      </div>
    </Block>
  );
}

export default function HomePlay() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8" aria-labelledby="play-h">
      <Reveal y={16}>
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 inline-flex rounded-full bg-lemon px-3 py-1 text-sm font-bold ring-1 ring-amber-500/20">হাতে-কলমে শিখুন</p>
          <h2 id="play-h" className="text-3xl font-extrabold sm:text-4xl">খেলতে খেলতে বুঝে ফেলুন</h2>
        </div>
      </Reveal>
      <div className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-6">
        <ByteLab />
        <CountRace />
        <DivideLab />
        <MagicCards />
        <MiniGate />
        <ColorMixer />
        <TextEncoder2 />
        <IpLab />
        <BcdClock />
      </div>
    </section>
  );
}
