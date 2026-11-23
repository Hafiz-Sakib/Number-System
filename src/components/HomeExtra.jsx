import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./ui";
import { Block } from "./HomePlay";

/* হোম পেজের বাড়তি ২টি সেকশন (বাস্তব জীবনের উদাহরণ): ১) পেনড্রাইভ 64 GB কেন 59 GB  ২) রঙ ও ছবির সাইজ */

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
    <Block tag="স্টোরেজ" title="64 GB পেনড্রাইভে কেন 59 GB দেখায়?" desc="কোম্পানি হিসাব করে 1000 ধরে (ডেসিমাল), কিন্তু কম্পিউটার হিসাব করে 1024 = 2¹⁰ ধরে (বাইনারি)। এই পার্থক্য থেকেই KB, MB, GB-র গল্প। সাইজ বেছে দেখো কতটা “হারিয়ে” যায়।">
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

export default function HomeExtra() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8" aria-labelledby="real-h">
      <Reveal y={16}>
        <div className="mb-2 max-w-2xl">
          <p className="mb-2 inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold ring-1 ring-emerald-600/15">বাস্তব জীবনে</p>
          <h2 id="real-h" className="text-3xl font-extrabold sm:text-4xl">আশেপাশের জিনিসে বাইনারি</h2>
        </div>
      </Reveal>
      <div className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-6">
        <SubHead>বাইনারি ও স্টোরেজ</SubHead>
        <StorageLab />
        <ImageLab />
      </div>
    </section>
  );
}
