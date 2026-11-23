import * as React from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DigitRoll, Reveal } from "./ui";
import { CLR, PillChoice } from "./controls";
import { Lab } from "./Circuit";
import { gateNet, useInterval } from "../sections/logic/shared";
import { navigate } from "../lib/router";

/* হোম পেজের ১০টি ইন্টারেক্টিভ / অ্যানিমেটেড সেকশন (একটির নিচে একটি, ক্রমানুসারে):
   ১) ৮-বিট বাইট সুইচ  ২) গণনার দৌড় (চার পদ্ধতি)  ৩) ২ দিয়ে ভাগের অ্যানিমেশন
   ৪) মন-পড়া কার্ড (বাইনারির জাদু)  ৫) মিনি লজিক গেট ল্যাব (আউটপুট 1 হলে glow)
   ৬) হেক্স রঙ মিক্সার  ৭) ASCII/Unicode টেক্সট এনকোডার  ৮) IPv4 ঠিকানা  ৯) BCD ডিজিটাল ঘড়ি (12 ঘণ্টা)  ১০) 7-সেগমেন্ট ডিকোডার */

export const pad = (s, n) => s.toString(2).padStart(n, "0");

export function Block({ tag, title, desc, children, className = "", tone = "bg-surface" }) {
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
/* ASCII কোড 0–31 ও 127 হলো কন্ট্রোল ক্যারেক্টার (স্ক্রিনে দেখা যায় না); 128–255 ASCII-র বাইরে */
const CTRL = [
  ["NUL", "নাল (কিছু নেই), স্ট্রিং শেষ বোঝায়"], ["SOH", "হেডার শুরু"], ["STX", "টেক্সট শুরু"], ["ETX", "টেক্সট শেষ"],
  ["EOT", "ট্রান্সমিশন শেষ (Ctrl+D)"], ["ENQ", "অনুসন্ধান"], ["ACK", "গৃহীত হয়েছে"], ["BEL", "বিপ শব্দ"],
  ["BS", "ব্যাকস্পেস"], ["TAB", "ট্যাব"], ["LF", "নতুন লাইন (Enter)"], ["VT", "উল্লম্ব ট্যাব"],
  ["FF", "নতুন পাতা"], ["CR", "ক্যারেজ রিটার্ন"], ["SO", "শিফট আউট"], ["SI", "শিফট ইন"],
  ["DLE", "ডেটা লিংক এস্কেপ"], ["DC1", "ডিভাইস কন্ট্রোল ১"], ["DC2", "ডিভাইস কন্ট্রোল ২"], ["DC3", "ডিভাইস কন্ট্রোল ৩"],
  ["DC4", "ডিভাইস কন্ট্রোল ৪"], ["NAK", "অগৃহীত"], ["SYN", "সিনক্রোনাইজ"], ["ETB", "ব্লক শেষ"],
  ["CAN", "বাতিল"], ["EM", "মাধ্যম শেষ"], ["SUB", "প্রতিস্থাপন"], ["ESC", "এস্কেপ"],
  ["FS", "ফাইল বিভাজক"], ["GS", "গ্রুপ বিভাজক"], ["RS", "রেকর্ড বিভাজক"], ["US", "ইউনিট বিভাজক"],
];
function asciiInfo(v) {
  if (v > 127) return { ch: "ASCII-র বাইরে", kind: "ext", note: "ASCII শুধু 0 থেকে 127 পর্যন্ত। 128–255 হলো এক্সটেন্ডেড অংশ, এর অক্ষর এনকোডিং ভেদে বদলায়।" };
  if (v === 127) return { ch: "DEL", kind: "ctrl", note: "ডিলিট: কন্ট্রোল ক্যারেক্টার, স্ক্রিনে দেখা যায় না।" };
  if (v === 32) return { ch: "␣", kind: "char", note: "" };
  if (v < 32) return { ch: CTRL[v][0], kind: "ctrl", note: `${CTRL[v][1]}। এটি কন্ট্রোল ক্যারেক্টার, স্ক্রিনে দেখা যায় না।` };
  return { ch: String.fromCharCode(v), kind: "char", note: "" };
}
const PRESETS = [[0, "0"], [65, "'A'"], [127, "127"], [255, "255"]];
function ByteLab() {
  const [v, setV] = useState(72);
  const bits = [7, 6, 5, 4, 3, 2, 1, 0];
  const on = bits.filter((i) => (v >> i) & 1);
  const { ch, kind, note } = asciiInfo(v);
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
        <span className={`ml-3 inline-block rounded-lg px-2 py-0.5 text-ink ${kind === "char" ? "bg-lemon" : "bg-ink/[.1]"}`}>ASCII: {ch}</span>
      </p>
      {note && <p className="mt-2 text-center text-sm leading-[1.7] text-ink/60">{note}</p>}
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

/* ---------- ৩) ২ দিয়ে ভাগ (পূর্ণ অংশ) ও ২ দিয়ে গুণ (ভগ্নাংশ) ---------- */
const divSteps = (n) => { const r = []; let x = n; if (!x) return [{ x: 0, q: 0, r: 0 }]; while (x > 0) { r.push({ x, q: x >> 1, r: x & 1 }); x >>= 1; } return r; };
const MAXI = 1023, MAXFD = 6, MAXFB = 8; // পূর্ণ অংশের সর্বোচ্চ মান, দশমিকের পর সর্বোচ্চ অঙ্ক, ভগ্নাংশের সর্বোচ্চ বাইনারি বিট
const trimZ = (s) => { const t = s.replace(/0+$/, ""); return t.endsWith(".") ? t + "0" : t; };
/* ভগ্নাংশ: BigInt দিয়ে নির্ভুলভাবে বারবার ×2 (ফ্লোটিং-পয়েন্ট ভুল এড়াতে) */
function fracSteps(f) {
  if (!f) return { rows: [], cut: false };
  const den = 10n ** BigInt(f.length);
  let num = BigInt(f);
  const rows = [];
  while (num > 0n && rows.length < MAXFB) {
    const p = num * 2n, bit = p >= den ? 1 : 0, rest = bit ? p - den : p;
    rows.push({ a: trimZ("0." + num.toString().padStart(f.length, "0")), p: trimZ(`${bit}.` + rest.toString().padStart(f.length, "0")), bit });
    num = rest;
  }
  return { rows, cut: num > 0n };
}
function DivideLab() {
  const [val, setVal] = useState({ i: 25, f: "" });
  const [txt, setTxt] = useState("25");
  const [shown, setShown] = useState(0);
  const [go, setGo] = useState(true);
  const key = val.i + (val.f ? "." + val.f : "");
  const steps = useMemo(() => divSteps(val.i), [val.i]);
  const fr = useMemo(() => fracSteps(val.f), [val.f]);
  const iL = steps.length, fL = fr.rows.length, L = iL + fL;
  const playing = go && shown < L;
  useInterval(() => setShown((s) => s + 1), 650, playing);
  const restart = () => { setShown(0); setGo(true); };
  const pick = (v) => { setVal(v); setTxt(v.i + (v.f ? "." + v.f : "")); restart(); };
  const typed = (raw) => { // বাংলা অঙ্ক ও একটি দশমিক বিন্দু চলবে; খালি রাখলে আগের সংখ্যাই থাকে
    const d = raw.replace(/[০-৯]/g, (c) => "০১২৩৪৫৬৭৮৯".indexOf(c)).replace(/[^\d.]/g, "");
    const dot = d.indexOf(".");
    let ip = (dot < 0 ? d : d.slice(0, dot)).slice(0, 4);
    const fp = dot < 0 ? "" : d.slice(dot + 1).replace(/\./g, "").slice(0, MAXFD);
    if (ip !== "" && parseInt(ip, 10) > MAXI) ip = String(MAXI);
    setTxt(dot < 0 ? ip : `${ip}.${fp}`);
    if (ip === "" && fp === "") return;
    const v = { i: ip === "" ? 0 : parseInt(ip, 10), f: fp.replace(/0+$/, "") };
    if (v.i !== val.i || v.f !== val.f) { setVal(v); restart(); }
  };
  const iShown = Math.min(shown, iL), fShown = Math.max(0, shown - iL);
  const done = shown >= L;
  const bin = val.i.toString(2) + (fL ? "." + fr.rows.map((r) => r.bit).join("") : "");
  const bit = (b) => `grid h-6 w-6 place-items-center rounded-md text-sm font-extrabold ${b ? "bg-emerald-500 text-white" : "bg-ink/10"}`;
  return (
    <Block tag="ভাগের পদ্ধতি" title="২ দিয়ে ভাগ করে বাইনারি" desc="ডেসিমাল থেকে বাইনারিতে যেতে বারবার 2 দিয়ে ভাগ করি। ভাগশেষগুলো নিচ থেকে ওপরে সাজালেই উত্তর।">
      <div className="flex flex-wrap items-center gap-3">
        <input type="range" min="1" max="255" value={Math.max(1, Math.min(255, val.i))} aria-label="ডেসিমাল সংখ্যা" onChange={(e) => pick({ i: +e.target.value, f: "" })} className="h-2 min-w-0 flex-1 accent-emerald-500" />
        <input type="text" inputMode="decimal" autoComplete="off" value={txt} aria-label="ডেসিমাল সংখ্যা লিখুন (ভগ্নাংশও চলবে)" placeholder="0"
          onChange={(e) => typed(e.target.value)} onFocus={(e) => e.target.select()} onBlur={() => setTxt(key)}
          className="num h-11 w-32 rounded-xl bg-sky px-2 text-center text-xl font-extrabold outline-none ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500" />
        <button type="button" onClick={restart} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">আবার চালাও</button>
      </div>
      <p className="mt-2 text-xs text-ink/45">slider টানুন, অথবা পাশের ঘরে সংখ্যা লিখুন। ভগ্নাংশও চলবে, যেমন 25.625।</p>
      <div className="mt-4 min-h-[8.5rem] rounded-2xl bg-ink/[.04] p-3 ring-1 ring-ink/[.06]">
        {fL > 0 && <p className="mb-1.5 text-xs font-bold text-ink/50">পূর্ণ অংশ ({val.i}): বারবার 2 দিয়ে ভাগ</p>}
        <ul className="num space-y-1.5 text-[15px]">
          <AnimatePresence initial={false}>
            {steps.slice(0, iShown).map((s, i) => (
              <motion.li key={`${key}-${i}`} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }} className="flex items-center gap-2">
                <span className="w-24 shrink-0 font-semibold sm:w-28">{s.x} ÷ 2 = {s.q}</span>
                <span className="text-ink/50">ভাগশেষ</span>
                <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} className={bit(s.r)}>{s.r}</motion.span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {shown === 0 && <p className="text-ink/45">ধাপ শুরু হচ্ছে…</p>}
        {fL > 0 && fShown > 0 && (
          <>
            <p className="mb-1.5 mt-4 text-xs font-bold text-ink/50">ভগ্নাংশ অংশ (0.{val.f}): বারবার 2 দিয়ে গুণ, গুণফলের পূর্ণ অংশ লিখি</p>
            <ul className="num space-y-1.5 text-[15px]">
              <AnimatePresence initial={false}>
                {fr.rows.slice(0, fShown).map((s, i) => (
                  <motion.li key={`${key}-f${i}`} layout initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="w-44 shrink-0 font-semibold sm:w-52">{s.a} × 2 = {s.p}</span>
                    <span className="text-ink/50">পূর্ণ অংশ</span>
                    <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} className={bit(s.bit)}>{s.bit}</motion.span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {fr.cut && fShown >= fL && <p className="mt-2 text-xs text-ink/50">ভগ্নাংশ শেষ হচ্ছে না (অসীম বাইনারি), তাই {MAXFB} বিট পর্যন্ত নিয়ে প্রায় মান (≈) দেখানো হলো।</p>}
          </>
        )}
      </div>
      <p className="mt-3 text-sm font-bold text-ink/55">পূর্ণ অংশের ভাগশেষ নিচ থেকে ওপরে ↑{fL > 0 ? "  ·  ভগ্নাংশের বিট ওপর থেকে নিচে ↓" : ""}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: iL }, (_, j) => {
          const si = iL - 1 - j, filled = si < iShown;
          return (
            <motion.span key={`${key}-${j}`} initial={false} animate={{ backgroundColor: filled ? (steps[si].r ? "#10b981" : "rgba(120,124,150,.25)") : "rgba(120,124,150,.08)", scale: filled ? [1, 1.25, 1] : 1, boxShadow: filled && steps[si].r ? "0 0 12px rgba(16,185,129,.7)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.3 }}
              className={`num grid h-10 w-8 place-items-center rounded-lg text-lg font-extrabold ${filled ? (steps[si].r ? "text-white" : "text-ink") : "text-transparent ring-1 ring-dashed ring-ink/20"}`}>{filled ? steps[si].r : "·"}</motion.span>
          );
        })}
        {fL > 0 && <span aria-label="দশমিক বিন্দু" className="num mx-0.5 text-[1.9rem] font-black leading-none text-ink">.</span>}
        {fr.rows.map((r, k) => {
          const filled = k < fShown;
          return (
            <motion.span key={`${key}-fb${k}`} initial={false} animate={{ backgroundColor: filled ? (r.bit ? "#10b981" : "rgba(120,124,150,.25)") : "rgba(120,124,150,.08)", scale: filled ? [1, 1.25, 1] : 1, boxShadow: filled && r.bit ? "0 0 12px rgba(16,185,129,.7)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.3 }}
              className={`num grid h-10 w-8 place-items-center rounded-lg text-lg font-extrabold ${filled ? (r.bit ? "text-white" : "text-ink") : "text-transparent ring-1 ring-dashed ring-ink/20"}`}>{filled ? r.bit : "·"}</motion.span>
          );
        })}
        <AnimatePresence>{done && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="num ml-2 rounded-xl bg-lilac px-3 py-1.5 text-lg font-extrabold">({key})₁₀ {fr.cut ? "≈" : "="} ({bin})₂</motion.span>}</AnimatePresence>
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

/* ---------- ৮) IPv4 ঠিকানা: 4 অক্টেট × 8 বিট = 32 বিট ---------- */
const IP_PRESETS = [["ঘরের রাউটার", [192, 168, 0, 1]], ["Google DNS", [8, 8, 8, 8]], ["লোকালহোস্ট", [127, 0, 0, 1]], ["বিশ্ববিদ্যালয়", [172, 16, 5, 20]]];
const OCT_BG = ["bg-lilac", "bg-sky", "bg-mint", "bg-peach"];
const OCT_TX = ["text-violet-700 dark:text-violet-300", "text-blue-700 dark:text-blue-300", "text-emerald-700 dark:text-emerald-300", "text-orange-700 dark:text-orange-300"];
const OCT_NAME = ["১ম", "২য়", "৩য়", "৪র্থ"];
const ipClass = (a) => (a < 128 ? "A" : a < 192 ? "B" : a < 224 ? "C" : a < 240 ? "D" : "E");
const isPrivate = ([a, b]) => a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
function IpLab() {
  const [ip, setIp] = useState([192, 168, 0, 1]);
  const flip = (o, bit) => setIp((a) => a.map((x, k) => (k === o ? x ^ (1 << bit) : x)));
  const kind = ip[0] === 127 ? "লুপব্যাক (নিজের কম্পিউটার)" : isPrivate(ip) ? "প্রাইভেট (শুধু স্থানীয় নেটওয়ার্কে)" : "পাবলিক (ইন্টারনেটে চলে)";
  return (
    <Block tag="IPv4 ঠিকানা" title="ইন্টারনেটের ঠিকানাও আসলে বাইনারি" desc="IP ঠিকানা মানে 32টি বিট। এই 32 বিটকে 8 বিট করে চার ভাগ করা হয়: প্রতিটি ভাগের নাম অক্টেট (এক বাইট)। প্রতিটি অক্টেটের চালু বিটের মান যোগ করলে একটি সংখ্যা (0–255) পাওয়া যায়, আর চার সংখ্যা ডট দিয়ে জুড়লেই পরিচিত ঠিকানা।">
      <div className="grid gap-3 sm:grid-cols-2">
        {ip.map((val, o) => {
          const terms = [128, 64, 32, 16, 8, 4, 2, 1].filter((w) => val & w);
          return (
            <div key={o} className={`rounded-2xl p-3 ring-1 ring-ink/[.06] ${OCT_BG[o]}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-extrabold ${OCT_TX[o]}`}>{OCT_NAME[o]} অক্টেট</span>
                <span className="text-xs font-semibold text-ink/50">8 বিট = 1 বাইট</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[[7, 6, 5, 4], [3, 2, 1, 0]].map((nib, g) => (
                  <div key={g} className="flex gap-1 rounded-xl bg-surface/60 p-1">
                    {nib.map((bit) => {
                      const on = (val >> bit) & 1;
                      return (
                        <motion.button key={bit} type="button" role="switch" aria-checked={!!on} aria-label={`${OCT_NAME[o]} অক্টেট, মান ${1 << bit}`} onClick={() => flip(o, bit)} whileTap={{ scale: 0.88 }} initial={false}
                          animate={{ backgroundColor: on ? "#10b981" : "rgba(120,124,150,.16)", color: on ? "#fff" : "rgba(120,124,150,.95)", boxShadow: on ? "0 0 10px rgba(16,185,129,.5)" : "0 0 0 rgba(0,0,0,0)" }}
                          className="num flex h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-lg text-base font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                          {on}<span className="text-[9px] font-semibold opacity-75">{1 << bit}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="num mt-2.5 break-words text-center text-sm font-semibold text-ink/65">
                {terms.length ? terms.join(" + ") : "কোনো বিট চালু নেই"} = <span className="text-xl font-extrabold text-ink"><DigitRoll text={String(val)} /></span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-ink/[.04] p-3 ring-1 ring-ink/[.06] sm:p-4">
        <p className="text-xs font-bold text-ink/50">ডেসিমাল রূপ (চার সংখ্যা, ডট দিয়ে জোড়া)</p>
        <p className="num mt-1 flex flex-wrap items-baseline justify-center gap-x-1 text-3xl font-extrabold sm:text-4xl">
          {ip.map((x, i) => <span key={i} className="inline-flex items-baseline gap-1"><span className={OCT_TX[i]}>{x}</span>{i < 3 && <span className="text-ink/35">.</span>}</span>)}
        </p>
        <p className="mt-3 text-xs font-bold text-ink/50">বাইনারি রূপ (4 × 8 = 32 বিট)</p>
        <p className="num mt-1 flex flex-wrap items-center justify-center gap-x-1 gap-y-1.5 text-[13px] font-bold sm:text-base">
          {ip.map((x, i) => <span key={i} className="inline-flex items-center gap-1"><span className={`rounded-lg px-2 py-1 tracking-wider ${OCT_BG[i]} ${OCT_TX[i]}`}>{pad(x, 8)}</span>{i < 3 && <span className="text-ink/35">.</span>}</span>)}
        </p>
        <p className="mt-3 text-center text-sm text-ink/55">মোট 2<sup>32</sup> = <span className="num font-semibold">4,294,967,296</span>টি আলাদা IPv4 ঠিকানা সম্ভব।</p>
      </div>
      <p className="mt-3 rounded-2xl bg-lemon px-4 py-2.5 text-center text-[15px] font-semibold">ক্লাস <span className="num font-extrabold">{ipClass(ip[0])}</span> · {kind}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {IP_PRESETS.map(([n, v]) => <button key={n} type="button" onClick={() => setIp(v)} className="rounded-full bg-ink/[.07] px-3.5 py-1.5 text-sm font-semibold transition hover:bg-ink/[.12] active:scale-95">{n}</button>)}
        <button type="button" onClick={() => setIp([0, 0, 0, 0].map(() => Math.floor(Math.random() * 256)))} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">র‍্যান্ডম</button>
      </div>
    </Block>
  );
}

/* ---------- 7-সেগমেন্ট ডিসপ্লে (ঘড়ি ও ক্যালকুলেটরের অঙ্ক) ---------- */
const SEG_SHAPES = {
  a: "6,4 10,0 50,0 54,4 50,8 10,8", b: "56,10 60,14 60,42 56,46 52,42 52,14", c: "56,54 60,58 60,86 56,90 52,86 52,58",
  d: "6,98 10,94 50,94 54,98 50,102 10,102", e: "4,54 8,58 8,86 4,90 0,86 0,58", f: "4,10 8,14 8,42 4,46 0,42 0,14", g: "6,50 10,46 50,46 54,50 50,54 10,54",
};
const SEG_LABEL = { a: [30, 4.2], b: [56, 28], c: [56, 72], d: [30, 98], e: [4, 72], f: [4, 28], g: [30, 50] };
const SEG_PAT = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
function SevenSeg({ digit, on = "#f4f6f8", off = "rgba(255,255,255,.08)", labels = false, className = "" }) {
  const lit = digit != null && SEG_PAT[digit] ? SEG_PAT[digit] : "";
  return (
    <svg viewBox="-4 -4 72 110" className={className} aria-hidden>
      <g transform="translate(4 0) skewX(-4)">
        {Object.entries(SEG_SHAPES).map(([k, pts]) => {
          const isOn = lit.includes(k);
          return (
            <g key={k}>
              <polygon points={pts} style={{ fill: isOn ? on : off, filter: isOn ? `drop-shadow(0 0 3px ${on})` : "none", transition: "fill .2s, filter .2s" }} />
              {labels && <text x={SEG_LABEL[k][0]} y={SEG_LABEL[k][1]} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fontWeight="800" fill={isOn ? "#052e1b" : "rgba(255,255,255,.4)"} style={{ fontFamily: "ui-monospace, monospace" }}>{k}</text>}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ---------- ৯) BCD ডিজিটাল ঘড়ি (12 ঘণ্টা) ---------- */
const clockParts = (ms) => { const d = new Date(ms), h = d.getHours(), z = (n) => String(n).padStart(2, "0"); return { t: z(h % 12 || 12) + z(d.getMinutes()) + z(d.getSeconds()), pm: h >= 12 }; };
const GROUPS = [["ঘণ্টা", "bg-lilac"], ["মিনিট", "bg-sky"], ["সেকেন্ড", "bg-mint"]];
const BIT4 = [8, 4, 2, 1];
function BcdClock() {
  const [ms, setMs] = useState(() => Date.now());
  const [run, setRun] = useState(true);
  const [sel, setSel] = useState(5);
  useInterval(() => setMs(Date.now()), 1000, run);
  const { t, pm } = clockParts(ms);
  const digits = t.split("").map(Number);
  const g = sel >> 1, d = digits[sel];
  const pair = digits[g * 2] * 10 + digits[g * 2 + 1];
  const terms = BIT4.filter((w) => d & w);
  const colonOn = new Date(ms).getSeconds() % 2 === 0;
  return (
    <Block tag="BCD কোড" title="ডিজিটাল ঘড়ির ভেতরের বাইনারি" desc="ঘড়ির পর্দায় আমরা অঙ্ক দেখি, কিন্তু ভেতরে প্রতিটি দশমিক অঙ্ক আলাদা 4 বিটে জমা থাকে: একে বলে BCD (Binary Coded Decimal)। যেকোনো অঙ্কের কলামে চাপ দিলে ব্যাখ্যা পাবেন।">
      <div className="rounded-2xl bg-zinc-950 px-3 py-4 ring-1 ring-white/10 sm:px-6 sm:py-5" role="img" aria-label={`সময় ${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4)} ${pm ? "PM" : "AM"}`}>
        <div className="mx-auto flex max-w-lg items-center justify-center gap-0.5 sm:gap-1.5">
          {digits.map((x, i) => (
            <React.Fragment key={i}>
              <SevenSeg digit={x} className="h-12 w-auto min-[400px]:h-14 sm:h-20" />
              {(i === 1 || i === 3) && <span aria-hidden className="mx-0.5 flex flex-col gap-3 transition-opacity duration-300 sm:mx-1.5 sm:gap-5" style={{ opacity: colonOn ? 1 : 0.15 }}><i className="block h-1.5 w-1.5 rounded-full bg-zinc-100 sm:h-2.5 sm:w-2.5" /><i className="block h-1.5 w-1.5 rounded-full bg-zinc-100 sm:h-2.5 sm:w-2.5" /></span>}
            </React.Fragment>
          ))}
          <span className="num ml-1.5 self-end pb-1 text-sm font-extrabold text-emerald-400 sm:ml-3 sm:text-lg">{pm ? "PM" : "AM"}</span>
        </div>
        <p className="mt-2 text-center text-[11px] font-semibold text-zinc-500">12 ঘণ্টার ফরম্যাট</p>
      </div>

      <p className="mb-2 mt-4 text-sm font-bold text-ink/55">প্রতিটি অঙ্কের নিচে তার 4 বিট (জ্বললে 1, নিভলে 0):</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {GROUPS.map(([name, bg], gi) => (
          <div key={name} className={`rounded-2xl p-2 ring-1 ring-ink/[.06] sm:p-3 ${bg}`}>
            <p className="mb-1.5 text-center text-xs font-extrabold text-ink/65 sm:text-sm">{name} <span className="num font-bold text-ink/45">{digits[gi * 2] * 10 + digits[gi * 2 + 1]}</span></p>
            <div className="flex gap-1 sm:gap-2">
              {[gi * 2, gi * 2 + 1].map((i) => (
                <button key={i} type="button" onClick={() => setSel(i)} aria-pressed={sel === i} aria-label={`${name}, ${i % 2 ? "এককের" : "দশকের"} ঘরের অঙ্ক ${digits[i]}`}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-violet-500 sm:gap-1.5 sm:p-1.5 ${sel === i ? "bg-surface/80 ring-2 ring-violet-500" : "hover:bg-surface/40"}`}>
                  {BIT4.map((w) => {
                    const on = (digits[i] & w) !== 0;
                    return <motion.span key={w} initial={false} animate={{ backgroundColor: on ? "#f43f5e" : "rgba(120,124,150,.18)", boxShadow: on ? "0 0 12px rgba(244,63,94,.7)" : "0 0 0 rgba(0,0,0,0)" }} transition={{ duration: 0.18 }} className={`num grid aspect-square w-full max-w-[2.3rem] place-items-center rounded-full text-[11px] font-extrabold sm:text-sm ${on ? "text-white" : "text-ink/35"}`}>{w}</motion.span>;
                  })}
                  <span className="num text-2xl font-extrabold leading-none sm:text-3xl"><DigitRoll text={String(digits[i])} /></span>
                  <span className="num text-[11px] font-bold text-ink/50">{pad(digits[i], 4)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-ink/[.05] px-4 py-3 text-[15px] leading-[1.9] ring-1 ring-ink/[.06]">
        <p><span className="font-extrabold">{GROUPS[g][0]}-এর {sel % 2 ? "এককের" : "দশকের"} ঘর: অঙ্ক <span className="num">{d}</span></span>। জ্বলা LED-এর মান যোগ করলে <span className="num font-bold text-rose-600 dark:text-rose-300">{terms.length ? terms.join(" + ") : "0"} = {d}</span>, তাই BCD কোড <span className="num font-extrabold">{pad(d, 4)}</span>।</p>
        <p className="mt-1.5 text-ink/75">পুরো {GROUPS[g][0]} <span className="num font-bold">{String(pair).padStart(2, "0")}</span>: BCD-তে <span className="num font-extrabold text-rose-600 dark:text-rose-300">{pad(digits[g * 2], 4)} {pad(digits[g * 2 + 1], 4)}</span> (8 বিট, প্রতি অঙ্ক আলাদা), কিন্তু সাধারণ বাইনারিতে <span className="num font-extrabold">{pair.toString(2)}</span>।</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" aria-pressed={run} onClick={() => setRun((r) => !r)} className={`rounded-full px-5 py-2 font-semibold transition active:scale-95 ${run ? "bg-emerald-500 text-white" : "bg-ink text-paper"}`}>{run ? "থামান" : "চালান"}</button>
        <button type="button" onClick={() => { setRun(false); setMs((m) => m + 1000); }} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">+1 সেকেন্ড</button>
        <button type="button" onClick={() => setMs(Date.now())} className="rounded-full bg-ink/[.07] px-5 py-2 font-semibold transition hover:bg-ink/[.12] active:scale-95">এখনকার সময়</button>
      </div>
    </Block>
  );
}

/* ---------- ১০) 7-সেগমেন্ট ডিকোডার ---------- */
function SevenSegLab() {
  const [v, setV] = useState(6);
  const [auto, setAuto] = useState(false);
  useInterval(() => setV((x) => (x >= 9 ? 0 : x + 1)), 900, auto);
  const valid = v <= 9;
  const lit = valid ? SEG_PAT[v] : "";
  const out = "abcdefg".split("").map((c) => (lit.includes(c) ? 1 : 0));
  const setBits = (f) => { setAuto(false); setV(f); };
  return (
    <Block tag="ডিজিটাল ডিসপ্লে" title="4 বিট কীভাবে একটি অঙ্ক হয়ে জ্বলে?" desc="ঘড়ি বা ক্যালকুলেটরের প্রতিটি অঙ্ক আঁকা হয় 7টি আলাদা দাগ (a থেকে g) দিয়ে। BCD-র 4 বিট একটি ডিকোডার সার্কিটে ঢোকে, আর সেটি ঠিক করে কোন কোন দাগ জ্বলবে। বিট টিপে নিজে দেখুন।">
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-zinc-950 p-4 ring-1 ring-white/10">
          <SevenSeg digit={valid ? v : null} on="#34d399" labels className="mx-auto h-44 w-auto sm:h-52" />
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-bold text-ink/50">ইনপুট: BCD-র 4 বিট (টিপে বদলান)</p>
            <div className="grid grid-cols-4 gap-2">
              {BIT4.map((w) => {
                const on = (v & w) !== 0;
                return (
                  <motion.button key={w} type="button" role="switch" aria-checked={on} aria-label={`বিট মান ${w}`} onClick={() => setBits(v ^ w)} whileTap={{ scale: 0.9 }} initial={false}
                    animate={{ backgroundColor: on ? "#f43f5e" : "rgba(120,124,150,.16)", color: on ? "#fff" : "rgba(120,124,150,.95)", boxShadow: on ? "0 0 14px rgba(244,63,94,.6)" : "0 0 0 rgba(0,0,0,0)" }}
                    className="num flex h-14 flex-col items-center justify-center rounded-xl text-xl font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    {on ? 1 : 0}<span className="text-[10px] font-semibold opacity-75">{w}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <p className="text-center text-sm font-bold text-ink/45" aria-hidden>↓ ডিকোডার সার্কিট ↓</p>
          <div>
            <p className="mb-1.5 text-xs font-bold text-ink/50">আউটপুট: কোন দাগ জ্বলবে (1 = জ্বলবে)</p>
            <div className="grid grid-cols-7 gap-1.5">
              {"abcdefg".split("").map((c, i) => (
                <span key={c} className={`num flex flex-col items-center rounded-lg py-1.5 text-base font-extrabold transition-colors ${out[i] ? "bg-emerald-500 text-white" : "bg-ink/[.08] text-ink/45"}`}>{out[i]}<span className="text-[10px] font-semibold opacity-80">{c}</span></span>
              ))}
            </div>
          </div>
          {valid ? (
            <p className="num rounded-2xl bg-lilac px-4 py-2.5 text-center text-[15px] font-semibold">{pad(v, 4)} → {out.join("")} <span className="font-sans text-ink/55">({lit.length}টি দাগ জ্বলছে)</span></p>
          ) : (
            <p className="rounded-2xl bg-lemon px-4 py-2.5 text-center text-sm font-semibold"><span className="num font-extrabold">{pad(v, 4)}</span> = {v}: BCD-তে 10–15 কোনো অঙ্ক নয়, তাই ডিকোডার কোনো দাগ জ্বালায় না।</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: 10 }, (_, n) => <button key={n} type="button" onClick={() => setBits(n)} aria-label={`অঙ্ক ${n}`} className={`num h-10 w-10 rounded-xl text-lg font-extrabold transition active:scale-90 ${v === n ? "bg-emerald-500 text-white" : "bg-ink/[.07] hover:bg-ink/[.12]"}`}>{n}</button>)}
        <button type="button" aria-pressed={auto} onClick={() => setAuto((a) => !a)} className={`ml-1 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${auto ? "bg-emerald-500 text-white" : "bg-ink text-paper"}`}>{auto ? "থামান" : "0 থেকে 9 গুনুন"}</button>
      </div>
      <p className="mt-3 text-sm text-ink/55">এই কাজটি করে BCD-টু-7-সেগমেন্ট ডিকোডার (যেমন 7447 IC), যা প্রায় সব ডিজিটাল ঘড়ি, মিটার ও ক্যালকুলেটরের ভেতরে থাকে।</p>
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
        <SevenSegLab />
      </div>
    </section>
  );
}
