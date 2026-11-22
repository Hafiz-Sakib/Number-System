import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./ui";
import { PillChoice } from "./controls";
import { Block, pad } from "./HomePlay";
import { useInterval } from "../sections/logic/shared";

/* হোম পেজের বাড়তি ৬টি সেকশন (বাস্তব জীবনের উদাহরণ):
   বাইনারি ও স্টোরেজ: ১) পেনড্রাইভ 64 GB কেন 59 GB  ২) রঙ ও ছবির সাইজ  ৩) অডিওর সিঁড়ি ও দানা দানা ভাব  ৪) পাসওয়ার্ডের শক্তি
   লজিক গেট: ৫) প্যারিটি বিট (XOR): ধাপে ধাপে অ্যানিমেশন */

const fmt = (n) => Math.round(n).toLocaleString("en-US");

function SubHead({ children }) {
  return (
    <Reveal y={12}>
      <p className="mt-4 inline-flex rounded-full bg-lilac px-3 py-1 text-sm font-bold ring-1 ring-ink/[.06]">{children}</p>
    </Reveal>
  );
}

/* ---------- ১) পেনড্রাইভের 64 GB → 59 GB ---------- */
const SIZES = [8, 16, 32, 64, 128, 256, 512, 1000];
const UNITS = [["KB", 1], ["MB", 2], ["GB", 3], ["TB", 4]];
function StorageLab() {
  const [n, setN] = useState(64);
  const bytes = n * 1e9;
  const gib = bytes / 2 ** 30;
  const pct = (gib / n) * 100;
  const name = (x) => (x === 1000 ? "1 TB" : `${x} GB`);
  return (
    <Block tag="স্টোরেজ" title="64 GB পেনড্রাইভে কেন 59 GB দেখায়?" desc="কোম্পানি হিসাব করে 1000 ধরে (ডেসিমাল), কিন্তু কম্পিউটার হিসাব করে 1024 = 2¹⁰ ধরে (বাইনারি)। এই পার্থক্য থেকেই KB, MB, GB-র গল্প। সাইজ বেছে দেখুন কতটা “হারিয়ে” যায়।">
      <div className="flex flex-wrap gap-2">
        {SIZES.map((x) => <button key={x} type="button" aria-pressed={n === x} onClick={() => setN(x)} className={`num rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${n === x ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{name(x)}</button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-lemon px-4 py-3 ring-1 ring-ink/[.06]">
          <p className="text-xs font-bold text-ink/55">বক্সে লেখা (কোম্পানি, 1000 ধরে)</p>
          <p className="num mt-1 text-3xl font-extrabold">{name(n)}</p>
          <p className="num mt-1 break-all text-sm font-semibold text-ink/60">{n} × 1000³ = {fmt(bytes)} বাইট</p>
        </div>
        <div className="rounded-2xl bg-sky px-4 py-3 ring-1 ring-ink/[.06]">
          <p className="text-xs font-bold text-ink/55">কম্পিউটারে দেখায় (1024 ধরে)</p>
          <p className="num mt-1 text-3xl font-extrabold">{gib.toFixed(2)} GB</p>
          <p className="num mt-1 break-all text-sm font-semibold text-ink/60">{fmt(bytes)} ÷ 1024³ = {gib.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-3" aria-hidden>
        <div className="h-3 w-full overflow-hidden rounded-full bg-amber-400/40">
          <motion.div initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} className="h-full rounded-full bg-emerald-500" />
        </div>
      </div>
      <p className="num mt-2 text-sm font-semibold text-ink/65">কম্পিউটারের চোখে {pct.toFixed(1)}%: প্রায় {(n - gib).toFixed(1)} GB কম দেখায়। আসলে কিছুই হারায়নি, শুধু মাপার গজ আলাদা।</p>
      <p className="mb-2 mt-4 text-sm font-bold text-ink/55">ধাপে ধাপে ফাঁক বাড়ে (বাইটে):</p>
      <div className="overflow-x-auto rounded-2xl ring-1 ring-ink/[.08]">
        <table className="num w-full text-center text-sm font-semibold">
          <thead><tr className="bg-ink/[.06] text-ink/60"><th className="px-3 py-2">একক</th><th className="px-3 py-2">কোম্পানি (1000ᵏ)</th><th className="px-3 py-2">কম্পিউটার (1024ᵏ)</th><th className="px-3 py-2">ফাঁক</th></tr></thead>
          <tbody>
            {UNITS.map(([u, k]) => (
              <tr key={u}><td className="px-3 py-1.5 font-extrabold">1 {u}</td><td className="px-3 py-1.5">{fmt(1000 ** k)}</td><td className="px-3 py-1.5">{fmt(1024 ** k)}</td><td className="px-3 py-1.5 text-rose-600 dark:text-rose-300">{((1 - 1000 ** k / 1024 ** k) * 100).toFixed(1)}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 rounded-2xl bg-lemon px-4 py-2.5 text-sm font-semibold">উইন্ডোজ বাইনারি মান দেখিয়েও “GB” লেখে। সঠিক নাম GiB (গিবিবাইট)। তাই বড় স্টোরেজে ফাঁকও বেশি চোখে পড়ে।</p>
    </Block>
  );
}

/* ---------- ২) রঙ ও ছবির সাইজ ---------- */
const DEPTHS = [1, 2, 4, 8, 24];
const RES = [["HD", 1280, 720], ["Full HD", 1920, 1080], ["4K", 3840, 2160]];
function ImageLab() {
  const [bits, setBits] = useState(24);
  const [ri, setRi] = useState(1);
  const [, w, h] = RES[ri];
  const colors = 2 ** bits;
  const px = w * h;
  const totalBits = px * bits;
  const bytes = totalBits / 8;
  const cells = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const t = i / 47;
    if (bits === 24) return `hsl(${Math.round(t * 300)} 85% 55%)`;
    const L = 2 ** bits, g = Math.round((Math.round(t * (L - 1)) / (L - 1)) * 255);
    return `rgb(${g} ${g} ${g})`;
  }), [bits]);
  return (
    <Block tag="রঙ ও ছবি" title="24-বিট রঙ, আর একটি ছবির আসল সাইজ" desc="n বিটে 2ⁿ রকম রঙ। 24-বিট মানে লাল, সবুজ, নীল প্রতিটির জন্য 8 বিট করে। এরপর ছবির পিক্সেল সংখ্যা × বিট দিয়ে ছবির সাইজ বিটেই বের করা যায়।">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink/55">বিট গভীরতা:</span>
        {DEPTHS.map((d) => <button key={d} type="button" aria-pressed={bits === d} onClick={() => setBits(d)} className={`num rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${bits === d ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{d}-বিট</button>)}
      </div>
      <div className="mt-3 flex overflow-hidden rounded-2xl ring-1 ring-ink/10" role="img" aria-label={`${bits}-বিট রঙের নমুনা`}>
        {cells.map((c, i) => <span key={i} className="h-12 flex-1 sm:h-14" style={{ backgroundColor: c }} />)}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-ink/50">{bits === 24 ? "পূর্ণ রঙের বর্ণালি" : `গ্রে-শেডের ধাপ: মাত্র ${colors} রকম`}</p>
      <div className="mt-3 rounded-2xl bg-lilac px-4 py-3 ring-1 ring-ink/[.06]">
        <p className="num text-[15px] font-semibold text-ink/70">2<sup>{bits}</sup> = <span className="text-2xl font-extrabold text-ink">{fmt(colors)}</span> রকম রঙ{bits === 24 && <span className="font-sans text-sm text-ink/60"> (প্রায় 1 কোটি 67 লাখ; 8 + 8 + 8 বিট)</span>}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink/55">ছবির মাপ:</span>
        {RES.map(([n, a, b], i) => <button key={n} type="button" aria-pressed={ri === i} onClick={() => setRi(i)} className={`num rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${ri === i ? "bg-ink text-paper" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{n} ({a}×{b})</button>)}
      </div>
      <ol className="num mt-3 space-y-1.5 rounded-2xl bg-ink/[.04] p-3 text-[15px] font-semibold ring-1 ring-ink/[.06]">
        <li>পিক্সেল = {w} × {h} = <span className="font-extrabold">{fmt(px)}</span></li>
        <li>মোট বিট = {fmt(px)} × {bits} = <span className="font-extrabold">{fmt(totalBits)}</span></li>
        <li>বাইট = {fmt(totalBits)} ÷ 8 = <span className="font-extrabold">{fmt(bytes)}</span></li>
        <li>MB = {fmt(bytes)} ÷ 1024² = <span className="rounded-lg bg-lemon px-2 py-0.5 font-extrabold">{(bytes / 2 ** 20).toFixed(2)} MB</span> <span className="font-sans text-sm text-ink/55">({(bytes / 1e6).toFixed(2)} মেগাবাইট, 1000 ধরলে)</span></li>
      </ol>
      <p className="mt-3 text-sm text-ink/55">এটি সংকোচন ছাড়া কাঁচা মাপ। JPEG সংকোচন করে বাস্তবে ফাইল অনেক ছোট করে।</p>
    </Block>
  );
}

/* ---------- ৩) অডিও: সিঁড়ির ধাপ ও “দানা দানা” ভাব ---------- */
const AW = 600, AH = 230, EH = 84, N = 40, CYC = 2;
const wf = (t) => Math.sin(t * Math.PI * 2 * CYC);
const AUDIO_STEPS = [
  ["আসল আওয়াজ মসৃণ ঢেউ", "বাতাসের কাঁপুনি যেকোনো উচ্চতায় থাকতে পারে: মাঝামাঝি মানও আছে।"],
  ["কম্পিউটারের আছে শুধু সিঁড়ি", "n বিটে 0 থেকে 2ⁿ−1 পর্যন্ত নম্বর দেওয়া 2ⁿ টি ধাপ। ধাপের মাঝখানে দাঁড়ানো যায় না।"],
  ["তাই নিকটতম ধাপে গোল", "মাপা মান ধাপের মাঝে পড়লে কাছের ধাপে বসাই। এই গরমিলই “দানা দানা” আওয়াজ।"],
];
function AudioLab() {
  const [bits, setBits] = useState(3);
  const [sel, setSel] = useState(9);
  const [playing, setPlaying] = useState("");
  const ctxRef = useRef(null);
  useEffect(() => () => { try { ctxRef.current && ctxRef.current.close(); } catch { /* ignore */ } }, []);
  const L = 2 ** bits;
  const Y = (v) => AH / 2 - v * (AH / 2 - 20);
  const dx = AW / N;
  const { orig, step, samples, maxErr } = useMemo(() => {
    let o = "";
    for (let i = 0; i <= 240; i++) o += `${i ? "L" : "M"}${((i / 240) * AW).toFixed(1)} ${Y(wf(i / 240)).toFixed(1)}`;
    const arr = [];
    let s = "", mx = 0;
    for (let i = 0; i < N; i++) {
      const y0 = wf((i + 0.5) / N);
      const k = Math.round(((y0 + 1) / 2) * (L - 1));
      const v = (k / (L - 1)) * 2 - 1;
      const err = y0 - v;
      mx = Math.max(mx, Math.abs(err));
      arr.push({ x: (i + 0.5) * dx, y0, k, v, err });
      s += `${i ? "L" : "M"}${(i * dx).toFixed(1)} ${Y(v).toFixed(1)}H${((i + 1) * dx).toFixed(1)}`;
    }
    return { orig: o, step: s, samples: arr, maxErr: mx };
  }, [bits]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = samples[sel];
  const grid = L <= 32 ? Array.from({ length: L }, (_, i) => ({ y: Y((i / (L - 1)) * 2 - 1), k: i })) : [];
  const errPct = (maxErr / 2) * 100;
  const feel = bits <= 3 ? "প্রচণ্ড দানা দানা: ঢেউ প্রায় চৌকো হয়ে গেছে" : bits <= 6 ? "স্পষ্ট দানা দানা, পুরোনো মেশিনের মতো" : bits <= 8 ? "8-বিট গেমের আওয়াজের মতো" : bits <= 12 ? "অনেকটা মসৃণ" : "সিডি মানের (16-বিট): কানে ধরা যায় না";

  const play = (mode) => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = ctxRef.current || (ctxRef.current = new AC());
      if (ctx.resume) ctx.resume();
      const sr = ctx.sampleRate, dur = 1.4, len = Math.floor(sr * dur);
      const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const t = i / sr, env = Math.min(1, t * 25, (dur - t) * 25);
        const y = env * (0.55 * Math.sin(2 * Math.PI * 330 * t) + 0.35 * Math.sin(2 * Math.PI * 495 * t));
        d[i] = mode === "q" ? (Math.round(((y + 1) / 2) * (L - 1)) / (L - 1)) * 2 - 1 : y;
      }
      const src = ctx.createBufferSource(), g = ctx.createGain();
      g.gain.value = 0.16; src.buffer = buf; src.connect(g); g.connect(ctx.destination);
      src.onended = () => setPlaying("");
      src.start(); setPlaying(mode);
    } catch { setPlaying(""); }
  };

  return (
    <Block tag="অডিও" title="বিট কমালে গানে “দানা দানা” ভাব কেন?" desc="ডিজিটাল অডিও আসলে সিঁড়ি বেয়ে ওঠানামা। সিঁড়ির ধাপ যত কম, আসল ঢেউ আর সিঁড়ির মাঝের ফাঁক তত বেশি, আর সেই ফাঁকই কানে দানা দানা আওয়াজ হয়ে বাজে।">
      <div className="grid gap-2.5 sm:grid-cols-3">
        {AUDIO_STEPS.map(([t, d], i) => (
          <div key={t} className={`rounded-2xl p-3 ring-1 ring-ink/[.06] ${["bg-sky", "bg-lilac", "bg-peach"][i]}`}>
            <p className="flex items-center gap-2 text-[15px] font-extrabold"><span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs text-paper">{i + 1}</span>{t}</p>
            <p className="mt-1.5 text-sm leading-[1.7] text-ink/70">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input type="range" min="1" max="16" value={bits} aria-label="অডিওর বিট সংখ্যা" onChange={(e) => setBits(+e.target.value)} className="h-2 min-w-0 flex-1 accent-emerald-500" />
        <span className="num rounded-xl bg-sky px-3 py-1 text-lg font-extrabold">{bits}-বিট</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {[[1, "1-বিট"], [3, "3-বিট"], [8, "8-বিট (গেম)"], [16, "16-বিট (সিডি)"]].map(([b, l]) => <button key={b} type="button" aria-pressed={bits === b} onClick={() => setBits(b)} className={`num rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${bits === b ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{l}</button>)}
      </div>

      <div className="mt-4 rounded-2xl bg-zinc-950 p-2 ring-1 ring-white/10">
        <p className="px-2 pt-1 text-xs font-bold text-zinc-400">তরঙ্গ ও সিঁড়ি: বাঁ পাশের সংখ্যা = ধাপের নম্বর</p>
        <svg viewBox={`0 0 ${AW} ${AH}`} className="h-auto w-full" role="img" aria-label={`${bits}-বিট অডিও: ${L}টি ধাপ, সর্বোচ্চ ভুল ${errPct.toFixed(1)} শতাংশ`}>
          <rect x={sel * dx} y="0" width={dx} height={AH} fill="rgba(255,255,255,.1)" />
          {grid.map((g) => (
            <g key={g.k}>
              <line x1="0" x2={AW} y1={g.y} y2={g.y} stroke="rgba(255,255,255,.14)" strokeWidth="1" />
              {L <= 16 && <text x="4" y={g.y - 3} fontSize="10" fontWeight="700" fill="rgba(255,255,255,.5)" className="num">{g.k}</text>}
            </g>
          ))}
          <path d={orig} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeDasharray="4 4" />
          {samples.map((s, i) => <line key={i} x1={s.x} x2={s.x} y1={Y(s.y0)} y2={Y(s.v)} stroke="#fb7185" strokeWidth="3" strokeLinecap="round" opacity={L > 4096 ? 0 : 0.95} />)}
          <path d={step} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
          {samples.map((s, i) => <circle key={i} cx={s.x} cy={Y(s.y0)} r={i === sel ? 5 : 2.6} fill={i === sel ? "#fde047" : "#fff"} />)}
        </svg>
        <p className="px-2 pb-1 text-xs font-semibold text-zinc-400"><span className="text-emerald-400">━</span> ডিজিটাল সিঁড়ি &nbsp;<span>╌</span> আসল ঢেউ &nbsp;<span className="text-rose-400">┃</span> গোল করার ভুল &nbsp;<span className="text-white">●</span> মাপার মুহূর্ত</p>
      </div>

      <div className="mt-2 rounded-2xl bg-zinc-950 p-2 ring-1 ring-white/10">
        <p className="px-2 pt-1 text-xs font-bold text-zinc-400">শুধু ভুলটুকু আলাদা করে দেখুন (এটাই কানে “দানা”)</p>
        <svg viewBox={`0 0 ${AW} ${EH}`} className="h-auto w-full" aria-hidden>
          <line x1="0" x2={AW} y1={EH / 2} y2={EH / 2} stroke="rgba(255,255,255,.25)" strokeWidth="1" />
          {samples.map((s, i) => { const h = s.err * (EH / 2 - 6); return <rect key={i} x={s.x - 4} width="8" y={Math.min(EH / 2, EH / 2 - h)} height={Math.max(Math.abs(h), 0.8)} rx="2" fill={i === sel ? "#fde047" : "#fb7185"} />; })}
        </svg>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl bg-lilac px-4 py-2.5 ring-1 ring-ink/[.06]"><p className="text-xs font-bold text-ink/55">সিঁড়ির ধাপ</p><p className="num text-xl font-extrabold">2<sup>{bits}</sup> = {fmt(L)}</p></div>
        <div className="rounded-2xl bg-peach px-4 py-2.5 ring-1 ring-ink/[.06]"><p className="text-xs font-bold text-ink/55">সর্বোচ্চ ভুল</p><p className="num text-xl font-extrabold">{errPct < 0.01 ? "< 0.01" : errPct.toFixed(errPct < 1 ? 2 : 1)}%</p></div>
        <div className="rounded-2xl bg-mint px-4 py-2.5 ring-1 ring-ink/[.06]"><p className="text-xs font-bold text-ink/55">1 সেকেন্ডের ফাইল (মনো, 44,100 নমুনা)</p><p className="num text-xl font-extrabold">{fmt((44100 * bits) / 8)} বাইট</p></div>
      </div>
      <p className="mt-2 text-sm font-semibold text-ink/70">{feel}। প্রতি 1 বিট বাড়ালে ধাপ দ্বিগুণ, ভুল প্রায় অর্ধেক, কিন্তু ফাইলও বড়।</p>

      <div className="mt-4 rounded-2xl bg-ink/[.04] p-3 ring-1 ring-ink/[.06] sm:p-4">
        <p className="text-sm font-bold text-ink/55">একটি নমুনা খুলে দেখুন (স্লাইডার টানুন)</p>
        <input type="range" min="0" max={N - 1} value={sel} aria-label="নমুনা নির্বাচন" onChange={(e) => setSel(+e.target.value)} className="mt-1 h-2 w-full accent-yellow-400" />
        <ol className="num mt-2 space-y-1 text-[15px] font-semibold">
          <li>① আসল উচ্চতা: <span className="font-extrabold">{cur.y0.toFixed(3)}</span> <span className="font-sans text-sm text-ink/50">(-1 থেকে +1-এর মধ্যে)</span></li>
          <li>② নিকটতম ধাপ: <span className="font-extrabold">#{cur.k}</span> <span className="font-sans text-sm text-ink/50">(0 থেকে {fmt(L - 1)}-এর মধ্যে)</span></li>
          <li>③ ধাপের নম্বর {bits} বিটে: <span className="rounded-lg bg-emerald-500 px-2 py-0.5 font-extrabold tracking-wider text-white">{pad(cur.k, bits)}</span> <span className="font-sans text-sm text-ink/50">← ফাইলে এটুকুই জমা হয়</span></li>
          <li>④ ফেরত বাজানোর মান <span className="font-extrabold">{cur.v.toFixed(3)}</span>, গরমিল <span className="font-extrabold text-rose-600 dark:text-rose-300">{cur.err >= 0 ? "+" : ""}{cur.err.toFixed(3)}</span></li>
        </ol>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" disabled={!!playing} onClick={() => play("o")} className="rounded-full bg-ink/[.07] px-5 py-2 text-sm font-semibold transition enabled:hover:bg-ink/[.12] enabled:active:scale-95 disabled:opacity-50">{playing === "o" ? "বাজছে…" : "▶ আসল আওয়াজ শুনুন"}</button>
        <button type="button" disabled={!!playing} onClick={() => play("q")} className="num rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition enabled:hover:bg-ink/85 enabled:active:scale-95 disabled:opacity-50">{playing === "q" ? "বাজছে…" : `▶ ${bits}-বিটে শুনুন`}</button>
        <span className="text-xs text-ink/50">দুটো পরপর শুনে তফাত ধরুন (ভলিউম কম রাখুন)।</span>
      </div>
    </Block>
  );
}

/* ---------- ৪) পাসওয়ার্ডের শক্তি ---------- */
const SETS = [[10, "শুধু অঙ্ক (0–9)"], [26, "a–z"], [62, "a–z, A–Z, 0–9"], [94, "সব চিহ্নসহ"]];
const RATES = [[1e3, "অনলাইন লগইন", "10³"], [1e9, "একটি কম্পিউটার", "10⁹"], [1e12, "GPU-র দল", "10¹²"]];
function fmtTime(s) {
  if (s < 0.001) return "মুহূর্তেই (1 মিলিসেকেন্ডের কম)";
  if (s < 60) return `${+s.toFixed(s < 10 ? 2 : 0)} সেকেন্ড`;
  const m = s / 60; if (m < 60) return `${Math.round(m)} মিনিট`;
  const h = m / 60; if (h < 24) return `${+h.toFixed(1)} ঘণ্টা`;
  const d = h / 24; if (d < 365) return `${Math.round(d)} দিন`;
  const y = d / 365.25; if (y < 1e6) return `${fmt(y)} বছর`;
  const e = Math.floor(Math.log10(y));
  return <>≈ {(y / 10 ** e).toFixed(1)} × 10<sup>{e}</sup> বছর</>;
}
function PasswordLab() {
  const [len, setLen] = useState(8);
  const [cs, setCs] = useState(62);
  const [ri, setRi] = useState(1);
  const bits = len * Math.log2(cs);
  const total = cs ** len;
  const secs = total / RATES[ri][0];
  const [label, bar] = bits < 28 ? ["খুব দুর্বল", "bg-rose-500"] : bits < 36 ? ["দুর্বল", "bg-orange-500"] : bits < 60 ? ["মোটামুটি", "bg-amber-400"] : bits < 80 ? ["ভালো", "bg-emerald-500"] : ["খুব শক্তিশালী", "bg-emerald-600"];
  return (
    <Block tag="পাসওয়ার্ড" title="আপনার পাসওয়ার্ডে কত বিট, ভাঙতে কত সময়?" desc="C রকম চিহ্ন দিয়ে n অক্ষরের পাসওয়ার্ড বানানো যায় Cⁿ ভাবে। এটাই 2ⁿ-র আসল ব্যবহার: প্রতিটি অক্ষর বাড়ালে সম্ভাবনা C গুণ হয়, আর বিট বাড়ে log₂C করে।">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-ink/55">দৈর্ঘ্য</span>
        <input type="range" min="4" max="20" value={len} aria-label="পাসওয়ার্ডের অক্ষর সংখ্যা" onChange={(e) => setLen(+e.target.value)} className="h-2 min-w-0 flex-1 accent-emerald-500" />
        <span className="num rounded-xl bg-sky px-3 py-1 text-lg font-extrabold">{len} অক্ষর</span>
      </div>
      <div className="mt-3"><PillChoice id="pw-set" value={cs} onChange={setCs} options={SETS.map(([id, label]) => ({ id, label }))} /></div>
      <div className="mt-3"><PillChoice id="pw-rate" value={ri} onChange={setRi} options={RATES.map(([, label], id) => ({ id, label }))} /></div>
      <p className="num mt-1.5 text-xs font-semibold text-ink/50">ধরা হয়েছে প্রতি সেকেন্ডে {RATES[ri][2]}টি চেষ্টা</p>
      <div className="mt-4 rounded-2xl bg-ink/[.04] p-3 ring-1 ring-ink/[.06] sm:p-4">
        <p className="num text-[15px] font-semibold text-ink/70">সম্ভাবনা = {cs}<sup>{len}</sup> = <span className="break-all font-extrabold text-ink">{total < 1e15 ? fmt(total) : `≈ ${total.toExponential(2).replace("e+", " × 10^")}`}</span></p>
        <p className="num mt-1 text-[15px] font-semibold text-ink/70">বিট = {len} × log₂({cs}) ≈ <span className="text-2xl font-extrabold text-ink">{bits.toFixed(1)}</span> বিট</p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-ink/10" aria-hidden><motion.div initial={false} animate={{ width: `${Math.min(bits / 100, 1) * 100}%` }} transition={{ duration: 0.3 }} className={`h-full rounded-full ${bar}`} /></div>
        <p className="mt-1 text-sm font-bold">{label}</p>
      </div>
      <p className="mt-3 rounded-2xl bg-lemon px-4 py-3 text-[15px] font-semibold">সব সম্ভাবনা চেষ্টা করতে সবচেয়ে বেশি লাগবে: <span className="num text-lg font-extrabold">{fmtTime(secs)}</span></p>
      <p className="mt-3 text-sm text-ink/55">এটি তাত্ত্বিক হিসাব। মানুষের বানানো পাসওয়ার্ড (নাম, জন্মতারিখ) আগে চেষ্টা করা হয়, তাই বাস্তবে আরও তাড়াতাড়ি ভাঙে। এলোমেলো ও লম্বা পাসওয়ার্ডই ভালো।</p>
    </Block>
  );
}

/* ---------- ৫) প্যারিটি বিট: ধাপে ধাপে অ্যানিমেশন ---------- */
const P_PRESETS = [["A", 65], ["C", 67], ["S", 83], ["z", 122]];
const bitsOf = (n) => pad(n, 7).split("").map(Number);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const LAST = 11;
function pickHits(n) { const idx = [0, 1, 2, 3, 4, 5, 6, 7]; for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, n); }
const cell = (on, cls = "") => `num grid h-10 w-8 place-items-center rounded-xl text-lg font-extrabold transition sm:h-12 sm:w-10 sm:text-xl ${on ? "bg-emerald-500 text-white" : "bg-ink/10 text-ink/50"} ${cls}`;

function ParityLab() {
  const reduce = !!useReducedMotion();
  const [data, setData] = useState(bitsOf(65));
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(false);
  const [noiseN, setNoiseN] = useState(1);
  const [hits, setHits] = useState([]);
  useInterval(() => setStep((s) => Math.min(LAST, s + 1)), step === 9 ? 1300 : 800, run && step < LAST);

  const ones = sum(data), parity = ones % 2;
  const sent = [...data, parity];
  const cursor = Math.min(step, 7);
  const cnt = data.map((_, i) => sum(data.slice(0, i + 1)));
  const counted = step >= 1 ? sum(data.slice(0, cursor)) : 0;
  const arrived = step >= 10;
  const recv = sent.map((b, i) => (arrived && hits.includes(i) ? b ^ 1 : b));
  const rOnes = sum(recv), good = rOnes % 2 === 0;
  const code = parseInt(data.join(""), 2);
  const ch = code >= 33 && code <= 126 ? String.fromCharCode(code) : "·";

  const start = () => { setHits(pickHits(noiseN)); setStep(1); setRun(true); };
  const reset = () => { setStep(0); setRun(false); };
  const next = () => { if (step === 0) { setHits(pickHits(noiseN)); setStep(1); setRun(false); } else setStep((s) => Math.min(LAST, s + 1)); setRun(false); };
  const setD = (d) => { setData(d); reset(); };

  const verdict = good ? (hits.length ? ["bg-lemon text-ink", `সাবধান! ${hits.length}টি বিট উল্টেছে, কিন্তু 1-এর সংখ্যা ${rOnes} (জোড়) রয়ে গেছে, তাই প্রাপক ভুলটা ধরতেই পারল না। প্যারিটি বিট একসাথে জোড় সংখ্যক ভুল ধরতে পারে না।`] : ["bg-mint text-emerald-900 dark:text-emerald-200", `1-এর সংখ্যা ${rOnes}, জোড়। নিয়ম মিলে গেছে: ডেটা ঠিকঠাক পৌঁছেছে।`])
    : ["bg-rose-500/15 text-rose-700 dark:text-rose-300", `1-এর সংখ্যা ${rOnes}, বেজোড়! নিয়ম ভেঙেছে, তাই প্রাপক বুঝে ফেলল পথে কোথাও একটি বিট উল্টে গেছে। আবার পাঠাতে বলবে।`];
  const caption = step === 0 ? "ডেটা বেছে নিন (বিটে চাপ দিয়ে নিজেও বদলাতে পারেন), তারপর “চালু করুন” চাপুন।"
    : step <= 7 ? `${step}-তম বিট ${data[step - 1]}: ${data[step - 1] ? "এটি 1, তাই গুনতিতে যোগ হলো।" : "এটি 0, গুনব না।"} এ পর্যন্ত 1-এর সংখ্যা: ${counted}।`
    : step === 8 ? `মোট 1 আছে ${ones}টি, অর্থাৎ ${ones % 2 ? "বেজোড়" : "জোড়"}। নিয়ম: প্যাকেটে 1 সবসময় জোড় রাখব। তাই প্যারিটি বিট = ${parity} ${parity ? "(একটি 1 যোগ করে জোড় বানালাম)" : "(আগেই জোড়, তাই 0)"}।`
    : step === 9 ? "8 বিটের প্যাকেট তার বেয়ে প্রাপকের দিকে ছুটছে…"
    : step === 10 ? (hits.length ? `ঝড়! পথে ${hits.length}টি বিট উল্টে গেছে (লাল দাগ)। প্রাপক তা জানে না।` : "প্যাকেট নিরাপদে পৌঁছেছে।")
    : "প্রাপক এবার প্যাকেটের সব 1 গুনে দেখছে…";

  return (
    <Block tag="ত্রুটি শনাক্তকরণ" title="প্যারিটি বিট: ভুল ধরার সহজ কৌশল" desc="ধরুন 8টি বাতি আছে এবং নিয়ম হলো সবসময় জোড় সংখ্যক বাতি জ্বলবে। 7টি বাতি ডেটা, অষ্টমটি বাড়তি বাতি (প্যারিটি) যা শুধু সংখ্যাটা জোড় করার জন্য। পথে একটি বাতি উল্টে গেলেই নিয়ম ভাঙে, আর প্রাপক ধরে ফেলে। চালিয়ে দেখুন।">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink/55">ডেটা:</span>
        {P_PRESETS.map(([l, n]) => <button key={l} type="button" aria-pressed={code === n} onClick={() => setD(bitsOf(n))} className={`num rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95 ${code === n ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>‘{l}’ = {pad(n, 7)}</button>)}
        <button type="button" onClick={() => setD(Array.from({ length: 7 }, () => (Math.random() < 0.5 ? 0 : 1)))} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">র‍্যান্ডম</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink/55">পথে ভুল:</span>
        <PillChoice id="par-noise" value={noiseN} onChange={(v) => { setNoiseN(v); reset(); }} options={[{ id: 0, label: "নেই" }, { id: 1, label: "1টি বিট উল্টাবে" }, { id: 2, label: "2টি বিট উল্টাবে" }]} />
      </div>

      {/* প্রেরক */}
      <div className="mt-4 rounded-2xl bg-sky p-3 ring-1 ring-ink/[.06] sm:p-4">
        <p className="mb-2 text-sm font-extrabold">প্রেরক <span className="num font-semibold text-ink/55">ডেটা ‘{ch}’ ({code})</span></p>
        <div className="flex flex-wrap items-start gap-1.5 sm:gap-2">
          {data.map((x, i) => {
            const active = step >= 1 && step <= 7 && i === step - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <motion.button type="button" aria-label={`ডেটা বিট ${i + 1}: ${x}`} disabled={run && step < LAST} onClick={() => setD(data.map((v, k) => (k === i ? v ^ 1 : v)))} animate={{ scale: active ? 1.18 : 1 }} transition={{ duration: reduce ? 0 : 0.25 }}
                  className={`${cell(x, "outline-none focus-visible:ring-2 focus-visible:ring-violet-500")} ${active ? "ring-4 ring-yellow-400" : ""}`}>{x}</motion.button>
                <span className="num h-5 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">{step >= 1 && i < cursor && x ? <motion.span initial={reduce ? false : { scale: 0, y: -6 }} animate={{ scale: 1, y: 0 }} className="inline-block rounded-full bg-emerald-500 px-1.5 text-white">{cnt[i]}</motion.span> : ""}</span>
              </div>
            );
          })}
          <span className="num mt-2 text-xl font-extrabold text-ink/40" aria-hidden>+</span>
          <div className="flex flex-col items-center gap-1">
            <motion.span key={step >= 8 ? `p${parity}` : "q"} initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className={`num grid h-10 w-8 place-items-center rounded-xl text-lg font-extrabold sm:h-12 sm:w-10 sm:text-xl ${step >= 8 ? "bg-violet-500 text-white shadow-[0_0_16px_rgba(139,92,246,.7)]" : "border-2 border-dashed border-ink/25 text-ink/35"}`}>{step >= 8 ? parity : "?"}</motion.span>
            <span className="h-5 text-[11px] font-bold text-violet-600 dark:text-violet-300">প্যারিটি</span>
          </div>
        </div>
        <p className="num mt-2 text-sm font-semibold text-ink/65">1-এর গুনতি: <span className="text-xl font-extrabold text-ink">{counted}</span>{step >= 8 && <span> → {ones % 2 ? "বেজোড়" : "জোড়"}</span>}</p>
      </div>

      {/* তার */}
      <div className="relative my-1 h-14" aria-hidden>
        <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/15" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface px-3 py-0.5 text-xs font-bold text-ink/45 ring-1 ring-ink/10">তার ↓</div>
        {step === 9 && (
          <motion.div initial={reduce ? false : { left: "2%" }} animate={{ left: "50%" }} transition={{ duration: reduce ? 0 : 1.1, ease: "easeInOut" }} className="absolute top-1/2 flex -translate-y-1/2 gap-0.5 rounded-lg bg-surface p-1 shadow-lg ring-1 ring-ink/15">
            {sent.map((b, i) => <span key={i} className={`num grid h-6 w-5 place-items-center rounded text-xs font-extrabold ${i === 7 ? "bg-violet-500 text-white" : b ? "bg-emerald-500 text-white" : "bg-ink/10 text-ink/50"}`}>{b}</span>)}
          </motion.div>
        )}
      </div>

      {/* প্রাপক */}
      <div className={`rounded-2xl p-3 ring-1 ring-ink/[.06] sm:p-4 ${step >= LAST ? (good ? "bg-mint" : "bg-rose-500/10") : "bg-peach"}`}>
        <p className="mb-2 text-sm font-extrabold">প্রাপক</p>
        {arrived ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {recv.map((x, i) => {
              const hit = hits.includes(i);
              return <motion.span key={i} initial={reduce ? false : { y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduce ? 0 : i * 0.05 }} className={cell(x, `${i === 7 ? "!bg-violet-500 !text-white" : ""} ${hit ? "ring-4 ring-rose-500" : ""}`)}>{x}</motion.span>;
            })}
            {hits.length > 0 && <span className="ml-1 text-sm font-bold text-rose-600 dark:text-rose-300">লাল দাগ = উল্টে যাওয়া বিট</span>}
          </div>
        ) : <p className="text-sm text-ink/50">প্যাকেট এখনো পৌঁছায়নি…</p>}
        {step >= LAST && <p className="num mt-2 text-sm font-semibold text-ink/70">প্রাপকের গুনতি: 1 আছে <span className="text-xl font-extrabold text-ink">{rOnes}</span>টি → {good ? "জোড়" : "বেজোড়"}</p>}
      </div>

      <motion.p key={step} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-lilac px-4 py-3 text-[15px] font-semibold leading-[1.8] ring-1 ring-ink/[.06]">{step >= LAST ? verdict[1] : caption}</motion.p>
      {step >= LAST && <p className={`mt-2 rounded-2xl px-4 py-2.5 text-center text-lg font-extrabold ${verdict[0]}`}>{!good ? "ভুল ধরা পড়েছে ✗" : hits.length ? "ভুল ধরা পড়েনি, অথচ ভুল ছিল!" : "সব ঠিক ✓"}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={start} disabled={run && step < LAST} className="rounded-full bg-emerald-500 px-5 py-2 font-semibold text-white transition enabled:active:scale-95 disabled:opacity-50">{step === 0 ? "▶ চালু করুন" : "↻ আবার চালান"}</button>
        <button type="button" onClick={next} disabled={step >= LAST} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition enabled:hover:bg-ink/[.12] enabled:active:scale-95 disabled:opacity-40">পরের ধাপ</button>
        <button type="button" onClick={reset} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">শুরুতে ফিরুন</button>
      </div>

      {step >= 8 && (
        <p className="num mt-4 rounded-2xl bg-ink/[.05] px-4 py-3 text-[15px] font-semibold text-ink/75">
          গণিতের ভাষায়: প্যারিটি = {data.join(" ⊕ ")} = <span className="font-extrabold text-violet-600 dark:text-violet-300">{parity}</span>
          <span className="mt-1 block font-sans text-sm text-ink/55">⊕ মানে XOR গেট: দুই ইনপুট ভিন্ন হলে 1। সব বিটে পরপর XOR চালালে ফল ঠিক “1-এর সংখ্যা জোড় না বেজোড়” (জোড় হলে 0, বেজোড় হলে 1)। এটাই XOR গেটের আসল কাজ।</span>
        </p>
      )}
    </Block>
  );
}

export default function HomeExtra() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8" aria-labelledby="real-h">
      <Reveal y={16}>
        <div className="mb-2 max-w-2xl">
          <p className="mb-2 inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold ring-1 ring-emerald-600/15">বাস্তব জীবনে</p>
          <h2 id="real-h" className="text-3xl font-extrabold sm:text-4xl">আশেপাশের জিনিসে বাইনারি ও লজিক গেট</h2>
        </div>
      </Reveal>
      <div className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-6">
        <SubHead>বাইনারি ও স্টোরেজ</SubHead>
        <StorageLab />
        <ImageLab />
        <AudioLab />
        <PasswordLab />
        <SubHead>লজিক গেট</SubHead>
        <ParityLab />
      </div>
    </section>
  );
}
