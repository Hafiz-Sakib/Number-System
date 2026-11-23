import { useMemo } from "react";
import { BASES, BASE_NAME, convert } from "../lib/engine";
import { navigate } from "../lib/router";
import { Blocks, Detail, Rich } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { CLR } from "../components/controls";

const INFO = {
  2: { digits: "0, 1", eg: "1011", use: "কম্পিউটার শুধু 0 ও 1 বোঝে" },
  8: { digits: "0 থেকে 7", eg: "13", use: "3 বিট = 1 অক্টাল অঙ্ক" },
  10: { digits: "0 থেকে 9", eg: "11", use: "আমাদের দৈনন্দিন সংখ্যা" },
  16: { digits: "0–9, A–F", eg: "B", use: "4 বিট = 1 হেক্স অঙ্ক" },
};

/* ---------- রূপান্তরের নিয়ম: প্রতিটি পদ্ধতি থেকে বাকি তিনটিতে, সব উদাহরণে দশমিক বিন্দু ---------- */
const G3 = "দশমিক বিন্দু থেকে বামে ও ডানে 3 বিট করে গ্রুপ করি। কম পড়লে বামের গ্রুপের সামনে এবং ডানের গ্রুপের পিছনে 0 বসাই।";
const G4 = "দশমিক বিন্দু থেকে বামে ও ডানে 4 বিট করে গ্রুপ করি। কম পড়লে বামের গ্রুপের সামনে এবং ডানের গ্রুপের পিছনে 0 বসাই।";
const place = (b) => [
  `দশমিকের বামের অঙ্কগুলোর স্থানীয় মান ডান থেকে ${b}^[0], ${b}^[1], ${b}^[2] …; ডানের অঙ্কগুলোর ${b}^[−1], ${b}^[−2] …`,
  "প্রতিটি অঙ্ককে তার স্থানীয় মান দিয়ে গুণ করি" + (b === 16 ? " (A–F এর মান 10–15)।" : "।"),
  "সব গুণফল যোগ করলে ডেসিমাল মান পাই।",
];
const divmul = (b, name) => [
  `পূর্ণ অংশ: ${b} দিয়ে বারবার ভাগ করি (ভাগফল 0 হওয়া পর্যন্ত)। ভাগশেষগুলো নিচ থেকে উপরে সাজাই${b === 16 ? " (10–15 হলে A–F)" : ""}।`,
  `ভগ্নাংশ অংশ: ${b} দিয়ে বারবার গুণ করি। প্রতি গুণফলের পূর্ণ অংশ উপর থেকে নিচে সাজাই; আবার ভগ্নাংশ অংশ নিয়ে গুণ করি (0 হলে বা যতটুকু দরকার ততটুকু হলে থামি)।`,
  `পূর্ণ অংশের ফলের পর দশমিক বিন্দু বসিয়ে ভগ্নাংশের ফল লিখি: এটিই ${name}।`,
];

const GROUPS = [
  {
    base: 2,
    items: [
      { to: 8, ex: "1011010.101", steps: [G3, "প্রতিটি 3 বিটের গ্রুপকে একটি অক্টাল অঙ্কে লিখি (000 = 0, 001 = 1 … 111 = 7)।", "অঙ্কগুলো পাশাপাশি বসিয়ে দশমিক বিন্দু আগের জায়গায় রাখি।"] },
      { to: 10, ex: "1010.01", steps: place(2) },
      { to: 16, ex: "11010110.1011", steps: [G4, "প্রতিটি 4 বিটের গ্রুপকে একটি হেক্স অঙ্কে লিখি (0000 = 0 … 1001 = 9, 1010 = A … 1111 = F)।", "অঙ্কগুলো পাশাপাশি বসিয়ে দশমিক বিন্দু আগের জায়গায় রাখি।"] },
    ],
  },
  {
    base: 8,
    items: [
      { to: 2, ex: "52.64", steps: ["প্রতিটি অক্টাল অঙ্ককে 3 বিটে লিখি (0 = 000, 1 = 001 … 7 = 111)।", "দশমিক বিন্দু আগের জায়গায় রাখি।", "শুরুর বামের ও শেষের ডানের বাড়তি 0 বাদ দিই।"] },
      { to: 10, ex: "17.4", steps: place(8) },
      { to: 16, ex: "75.2", steps: ["সরাসরি নয়, বাইনারি হয়ে যাই। ধাপ 1: প্রতিটি অক্টাল অঙ্ককে 3 বিটে লিখি।", "ধাপ 2: সেই বাইনারিকে দশমিক বিন্দু থেকে 4 বিট করে গ্রুপ করি (দরকারে 0 বসাই)।", "ধাপ 3: প্রতিটি গ্রুপকে হেক্স অঙ্কে লিখি।"] },
    ],
  },
  {
    base: 10,
    items: [
      { to: 2, ex: "25.625", steps: divmul(2, "বাইনারি") },
      { to: 8, ex: "45.75", steps: divmul(8, "অক্টাল") },
      { to: 16, ex: "255.75", steps: divmul(16, "হেক্স") },
    ],
  },
  {
    base: 16,
    items: [
      { to: 2, ex: "3A.8", steps: ["প্রতিটি হেক্স অঙ্ককে 4 বিটে লিখি (0 = 0000 … 9 = 1001, A = 1010 … F = 1111)।", "দশমিক বিন্দু আগের জায়গায় রাখি।", "শুরুর বামের ও শেষের ডানের বাড়তি 0 বাদ দিই।"] },
      { to: 10, ex: "2F.8", steps: place(16) },
      { to: 8, ex: "A5.C", steps: ["সরাসরি নয়, বাইনারি হয়ে যাই। ধাপ 1: প্রতিটি হেক্স অঙ্ককে 4 বিটে লিখি।", "ধাপ 2: সেই বাইনারিকে দশমিক বিন্দু থেকে 3 বিট করে গ্রুপ করি (দরকারে 0 বসাই)।", "ধাপ 3: প্রতিটি গ্রুপকে অক্টাল অঙ্কে লিখি।"] },
    ],
  },
];


/* ---------- সংক্ষিপ্ত তত্ত্ব: সংখ্যা পদ্ধতি, চিহ্নযুক্ত সংখ্যা, কোড ---------- */
const THEORY = [
  { t: "সংখ্যা পদ্ধতি", bg: "bg-lilac", ring: "ring-violet-500/20", items: [
    "সংখ্যা লেখা, পড়া ও হিসাব করার নিয়মকে সংখ্যা পদ্ধতি বলে। কয়টি অঙ্ক বা প্রতীক ব্যবহার হয়, সেটিই এর **ভিত্তি (base)**।",
    "**স্থানিক:** অঙ্কের মান বসার স্থানের ওপর নির্ভর করে (বাইনারি, অক্টাল, ডেসিমাল, হেক্স)। **অস্থানিক:** স্থান বদলালেও অঙ্কের মান একই থাকে (রোমান I, V, X)।",
    "আগে আঙুল, পাথর, দড়ির গিট দিয়ে গোনা হতো; পরে চিহ্ন এলো। শূন্যসহ দশমিক পদ্ধতি ভারতীয় উপমহাদেশে গড়ে ওঠে এবং আরবদের হাত ধরে ছড়ায়, তাই একে ইন্দো-আরবীয় পদ্ধতি বলে।",
  ] },
  { t: "চিহ্নযুক্ত সংখ্যা", bg: "bg-mint", ring: "ring-emerald-500/20", items: [
    "কম্পিউটারে (−) চিহ্ন নেই, তাই সবচেয়ে বামের বিট (MSB) সাইন বিট: **0 = ধনাত্মক, 1 = ঋণাত্মক**।",
    "**সাইন-ম্যাগনিটিউড:** সাইন বিট ও মান আলাদা। 8 বিটে +5 = {{00000101|2}}, −5 = {{10000101|2}}। অসুবিধা: +0 ও −0 দুটি শূন্য, আর যোগ-বিয়োগে ঝামেলা।",
    "এ কারণেই 1's ও 2's পরিপূরক ব্যবহার হয়। বিস্তারিত পরিপূরক পেজে।",
  ], go: true },
  { t: "কোড", bg: "bg-sky", ring: "ring-sky-500/25", items: [
    "অক্ষর, অঙ্ক ও চিহ্নকে বিট প্যাটার্নে লেখার নিয়মকে কোড বলে।",
    "**BCD:** প্রতিটি ডেসিমাল অঙ্কের জন্য আলাদা 4 বিট। 29 = {{0010 1001|2}}।",
    "**ASCII:** 7 বিট, 128টি অক্ষর (A = 65, a = 97, 0 = 48); বর্ধিত ASCII 8 বিট, 256টি। **EBCDIC:** 8 বিটের কোড (আইবিএম)।",
    "**ইউনিকোড:** বাংলাসহ বিশ্বের প্রায় সব ভাষার অক্ষরের জন্য একটি সর্বজনীন কোড।",
  ] },
];

const GROUP_NAME = { 2: "বাইনারি থেকে সব", 8: "অক্টাল থেকে সব", 10: "ডেসিমাল থেকে সব", 16: "হেক্সাডেসিমাল থেকে সব" };

const ref = (() => {
  const rows = [];
  for (let i = 0; i < 32; i++) rows.push([`${i}`, i.toString(2).padStart(5, "0"), i.toString(8), i.toString(16).toUpperCase()]);
  return rows;
})();

const glance = {
  t: "table",
  head: ["থেকে ↓ / এতে →", "বাইনারি", "অক্টাল", "ডেসিমাল", "হেক্স"],
  rows: [
    ["বাইনারি", "—", "3 বিট গ্রুপ", "স্থানীয় মান", "4 বিট গ্রুপ"],
    ["অক্টাল", "অঙ্ক → 3 বিট", "—", "স্থানীয় মান", "বাইনারি হয়ে"],
    ["ডেসিমাল", "÷2 ও ×2", "÷8 ও ×8", "—", "÷16 ও ×16"],
    ["হেক্স", "অঙ্ক → 4 বিট", "বাইনারি হয়ে", "স্থানীয় মান", "—"],
  ],
  note: "প্রতিটি নিয়মের বিস্তারিত ও দশমিকসহ উদাহরণ নিচে ক্রমানুসারে আছে।",
};

function Rule({ base, to, ex, steps }) {
  const r = useMemo(() => convert(ex, base, to), [ex, base, to]);
  return (
    <article className="min-w-0 rounded-3xl bg-surface p-4 ring-1 ring-ink/[.08] sm:p-5">
      <h4 className="flex flex-wrap items-center gap-x-2 text-lg font-extrabold">
        <span className={CLR[base].text}>{BASE_NAME[base]}</span>
        <span aria-hidden className="text-ink/40">→</span>
        <span className={CLR[to].text}>{BASE_NAME[to]}</span>
      </h4>
      <ol className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink/80">
        {steps.map((t, i) => (
          <li key={i} className="flex gap-2.5 rounded-xl bg-ink/[.04] px-3 py-2">
            <span className="num mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink/[.1] text-xs font-bold">{i + 1}</span>
            <span className="min-w-0"><Rich text={t} /></span>
          </li>
        ))}
      </ol>
      <p className={`mt-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold ring-1 ${CLR[to].bg} ${CLR[to].ring}`}>
        <Rich text={`উদাহরণ: {{${ex}|${base}}} = {{${r.text}|${to}}}`} />
      </p>
      <Detail title="সমাধানের ধাপ" blocks={r.blocks} />
    </article>
  );
}

const jump = (b) => document.getElementById(`from-${b}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Learn() {
  const opTables = [
    { t: "h", text: "বাইনারি যোগের নিয়ম" },
    { t: "table", head: ["যোগ", "যোগফল", "ক্যারি"], rows: [["0 + 0", "0", "0"], ["0 + 1", "1", "0"], ["1 + 0", "1", "0"], ["1 + 1", "0", "1"], ["1 + 1 + 1 (ক্যারিসহ)", "1", "1"]], note: "1 + 1 = 2 = {{10|2}}, তাই লিখি 0 আর ক্যারি 1।" },
    { t: "h", text: "বাইনারি বিয়োগের নিয়ম" },
    { t: "table", head: ["বিয়োগ", "ফল", "ধার"], rows: [["0 − 0", "0", "0"], ["1 − 0", "1", "0"], ["1 − 1", "0", "0"], ["0 − 1", "1", "1 (পাশ থেকে ধার)"]], note: "0 − 1 এ পাশের কলাম থেকে ধার নিলে 0 হয় {{10|2}} = 2, তাই 2 − 1 = 1।" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="সংখ্যা পদ্ধতির নিয়ম" sub="চারটি সংখ্যা পদ্ধতির রূপান্তরের নিয়ম ও উদাহরণ এখানে একসাথে দেওয়া হয়েছে।" />

      <Reveal y={16}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BASES.map((b) => (
            <div key={b} className={`rounded-3xl p-5 ring-1 ${CLR[b].bg} ${CLR[b].ring}`}>
              <p className={`text-lg font-extrabold ${CLR[b].text}`}>{BASE_NAME[b]}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink/75"><Rich text={`ভিত্তি **${b}** · অঙ্ক: **${INFO[b].digits}**`} /></p>
              <p className="mt-1 text-[15px] text-ink/75"><Rich text={`উদাহরণ: {{${INFO[b].eg}|${b}}}`} /></p>
              <p className="mt-1 text-sm text-ink/60"><Rich text={INFO[b].use} /></p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal y={16}>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:grid-cols-3">
          {THEORY.map((c) => (
            <section key={c.t} className={`min-w-0 rounded-3xl p-5 ring-1 ${c.bg} ${c.ring}`}>
              <h2 className="text-xl font-extrabold">{c.t}</h2>
              <ul className="mt-2 space-y-2 text-[15px] leading-[1.8] text-ink/80">
                {c.items.map((t, i) => <li key={i} className="flex gap-2"><span aria-hidden className="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-ink/40" /><span className="min-w-0"><Rich text={t} /></span></li>)}
              </ul>
              {c.go && <button type="button" onClick={() => navigate("/complement")} className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/85 active:scale-95">পরিপূরক পেজে যাও →</button>}
            </section>
          ))}
        </div>
      </Reveal>

      <Reveal y={16}>
        <div className="card mt-5 p-5 sm:p-7">
          <h2 className="text-2xl font-extrabold">রূপান্তরের নিয়ম একসাথে</h2>
          <p className="mt-1 text-ink/55">কোন সংখ্যা পদ্ধতি থেকে অন্যটিতে যেতে কীভাবে হিসাব করতে হয়, তা এখানে দেখানো হয়েছে।</p>
          <Blocks nested blocks={[glance]} />
          <div className="mt-4 flex flex-wrap gap-2">
            {BASES.map((b) => (
              <button key={b} type="button" onClick={() => jump(b)} className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold ring-1 transition active:scale-95 ${CLR[b].bg} ${CLR[b].ring} ${CLR[b].text}`}>
                <span aria-hidden className={`size-2 rounded-full ${CLR[b].dot}`} />{GROUP_NAME[b]}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-5 space-y-5">
        {GROUPS.map((g) => (
          <Reveal key={g.base} y={16}>
            <section id={`from-${g.base}`} aria-label={GROUP_NAME[g.base]} className={`scroll-mt-24 rounded-[2rem] p-3 ring-1 sm:p-5 ${CLR[g.base].bg} ${CLR[g.base].ring}`}>
              <h2 className={`flex items-center gap-2.5 px-2 pb-3 pt-1 text-2xl font-extrabold ${CLR[g.base].text}`}>
                <span aria-hidden className={`size-3 rounded-full ${CLR[g.base].dot}`} />{GROUP_NAME[g.base]}
                <span className="text-base font-semibold opacity-70">(দশমিকসহ)</span>
              </h2>
              <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:grid-cols-3 lg:gap-4">
                {g.items.map((it) => <Rule key={it.to} base={g.base} {...it} />)}
              </div>
            </section>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">অঙ্কের স্থানীয় মান</h2>
              <p className="mt-2 leading-[1.85] text-ink/80"><Rich text="প্রতিটি অঙ্কের মান নির্ভর করে সে কোথায় বসেছে তার ওপর। ভিত্তি **b** হলে ডান থেকে প্রথম অঙ্কের স্থানীয় মান b^[0], তারপর b^[1], b^[2] …। দশমিক বিন্দুর ডানে b^[−1], b^[−2] …" /></p>
              <p className="mt-3 leading-[1.85] text-ink/80"><Rich text="{{1011.01|2}} = 1×2^[3] + 0×2^[2] + 1×2^[1] + 1×2^[0] + 0×2^[−1] + 1×2^[−2] = 8 + 0 + 2 + 1 + 0 + 0.25 = {{11.25|10}}" /></p>
            </div>
          </Reveal>
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">যোগ-বিয়োগের ছক</h2>
              <Blocks blocks={opTables} nested />
            </div>
          </Reveal>
        </div>
        <div className="min-w-0 space-y-5">
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">1's ও 2's পরিপূরক</h2>
              <p className="mt-2 leading-[1.85] text-ink/80"><Rich text="**1's:** প্রতিটি বিট উল্টাই। **2's:** 1's এর সাথে 1 যোগ। দশমিকসহ উদাহরণ, ঋণাত্মক সংখ্যা ও পরিপূরক দিয়ে বিয়োগ আলাদা পেজে আছে।" /></p>
              <button type="button" onClick={() => navigate("/complement")} className="mt-4 rounded-full bg-ink px-5 py-2.5 font-semibold text-paper transition hover:bg-ink/85 active:scale-95">পরিপূরক পেজে যাও →</button>
            </div>
          </Reveal>
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">0 থেকে 31 এর সারণি</h2>
              <p className="mt-1 text-ink/55">চারটি পদ্ধতির মান পাশাপাশি দেখানো হয়েছে।</p>
              <Blocks nested blocks={[{ t: "table", head: ["ডেসিমাল", "বাইনারি", "অক্টাল", "হেক্স"], rows: ref }]} />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
