import { useMemo, useState } from "react";
import { calc } from "../lib/engine";
import { complementBlocks, complements, parseBits, signedBlocks, signedForms, signedTable } from "../lib/complement";
import { useFmt } from "../lib/settings";
import { navigate } from "../lib/router";
import { Blocks, Detail, Rich } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { NumberField, PillChoice } from "../components/controls";

const dot = (i, f) => (f ? `${i}.${f}` : i);
const EX_LIVE = ["1011.01", "0110.1", "10100", "1101.101", "0.011"];
const EX_SOLVED = [
  { x: "10110", note: "পূর্ণসংখ্যা" },
  { x: "01101", note: "পূর্ণসংখ্যা, সামনে 0 সহ" },
  { x: "1011.01", note: "দশমিক বিন্দুসহ" },
  { x: "0110.101", note: "দশমিক বিন্দুসহ" },
  { x: "11010.11", note: "দশমিক বিন্দুসহ" },
  { x: "1000", note: "বিশেষ: 2's নিজেই" },
];

const Tile = ({ label, value, bg }) => {
  const fmt = useFmt();
  return (
    <div className={`min-w-0 rounded-2xl px-4 py-3 ring-1 ring-ink/[.06] ${bg}`}>
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="num mt-0.5 break-all text-2xl font-extrabold sm:text-3xl">{fmt(value)}<sub className="text-sm font-bold">{fmt(2)}</sub></p>
    </div>
  );
};

function Live() {
  const [v, setV] = useState("1011.01");
  const p = useMemo(() => parseBits(v), [v]);
  const d = useMemo(() => (p.ok ? { c: complements(p.int, p.frac), blocks: complementBlocks(p.int, p.frac) } : null), [p]);
  return (
    <div className="card p-5 sm:p-7">
      <h2 className="text-2xl font-extrabold">নিজে করে দেখুন</h2>
      <p className="mt-1 text-ink/55">যেকোনো বাইনারি সংখ্যা (দশমিক বিন্দুসহ) দিন, ধাপে ধাপে সমাধান পাবেন।</p>
      <div className="mt-4">
        <NumberField label="বাইনারি সংখ্যা" base={2} value={v} onChange={setV} error={p.ok || p.empty ? null : p.msg} id="comp-in" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-ink/50">উদাহরণ:</span>
        {EX_LIVE.map((e) => <button key={e} type="button" onClick={() => setV(e)} className="num rounded-full bg-ink/[.06] px-3 py-1.5 font-semibold transition hover:bg-ink/[.12] active:scale-95">{e}</button>)}
      </div>
      {d && (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Tile label="1-এর পরিপূরক" value={dot(d.c.ones.int, d.c.ones.frac)} bg="bg-lilac" />
            <Tile label="2-এর পরিপূরক" value={dot(d.c.twos.int, d.c.twos.frac)} bg="bg-mint" />
          </div>
          <Detail title="ধাপে ধাপে সমাধান দেখুন" blocks={d.blocks} open />
        </div>
      )}
    </div>
  );
}

function Rules() {
  return (
    <div className="card p-5 sm:p-7">
      <h2 className="text-2xl font-extrabold">নিয়ম এক নজরে</h2>
      <div className="mt-4 grid gap-3">
        <div className="rounded-2xl bg-lilac p-4 ring-1 ring-violet-500/20">
          <p className="text-lg font-extrabold">1-এর পরিপূরক (1's Complement)</p>
          <p className="mt-1.5 leading-[1.85] text-ink/80"><Rich text="প্রতিটি বিট উল্টে দিই: **0 → 1** আর **1 → 0**। দশমিক বিন্দু যেখানে আছে সেখানেই থাকে।" /></p>
          <p className="mt-1.5 text-ink/80"><Rich text="উদাহরণ: {{1011.01|2}} → {{0100.10|2}}" /></p>
        </div>
        <div className="rounded-2xl bg-mint p-4 ring-1 ring-emerald-500/20">
          <p className="text-lg font-extrabold">2-এর পরিপূরক (2's Complement)</p>
          <p className="mt-1.5 leading-[1.85] text-ink/80"><Rich text="**2's = 1's + 1**। অর্থাৎ 1-এর পরিপূরকের সবচেয়ে ডানের বিটে 1 যোগ করি (দশমিক থাকলে দশমিকের পরের শেষ বিটে)। বামের বাড়তি ক্যারি ফেলে দিই।" /></p>
          <p className="mt-1.5 text-ink/80"><Rich text="উদাহরণ: {{0100.10|2}} + {{0000.01|2}} = {{0100.11|2}}" /></p>
        </div>
        <div className="rounded-2xl bg-lemon p-4 ring-1 ring-amber-500/25">
          <p className="text-lg font-extrabold">দ্রুত নিয়ম (শর্টকাট)</p>
          <p className="mt-1.5 leading-[1.85] text-ink/80"><Rich text="ডান থেকে প্রথম **1** পর্যন্ত যেমন আছে তেমন লিখি, তার বামের বিটগুলো উল্টে দিই।" /></p>
          <p className="mt-1.5 text-ink/80"><Rich text="উদাহরণ: {{10110.100|2}} → ডানের 100 ঠিক, বামের 10110 → 01001; ফল {{01001.100|2}}" /></p>
        </div>
        <div className="rounded-2xl bg-sky p-4 ring-1 ring-sky-500/25">
          <p className="text-lg font-extrabold">যাচাইয়ের সূত্র</p>
          <p className="mt-1.5 leading-[1.85] text-ink/80"><Rich text="পূর্ণ অংশে **n** বিট হলে: **2's = 2^[n] − সংখ্যা** এবং **1's = 2's − শেষ বিটের মান**। দশমিকেও একই।" /></p>
        </div>
      </div>
    </div>
  );
}

function Solved() {
  const items = useMemo(() => EX_SOLVED.map((e) => {
    const [i, f = ""] = e.x.split(".");
    const c = complements(i, f);
    return { ...e, c, blocks: complementBlocks(i, f) };
  }), []);
  return (
    <Reveal y={16}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-2xl font-extrabold">সমাধান করা উদাহরণ</h2>
        <p className="mt-1 text-ink/55">প্রতিটিতে চাপ দিলে পুরো সমাধান খুলবে। অর্ধেকে দশমিক বিন্দু আছে।</p>
        <div className="mt-2 grid items-start gap-x-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((e) => (
            <Detail key={e.x} title={`{{${e.x}|2}} → 1's: {{${dot(e.c.ones.int, e.c.ones.frac)}|2}}, 2's: {{${dot(e.c.twos.int, e.c.twos.frac)}|2}}`} blocks={e.blocks} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function Signed() {
  const [d, setD] = useState("-5");
  const [n, setN] = useState(8);
  const txt = String(d).replace(/[−–—]/g, "-").trim();
  const num = txt === "" || txt === "-" ? NaN : Number(txt);
  const f = useMemo(() => (Number.isNaN(num) ? { ok: false, msg: "একটি পূর্ণসংখ্যা লিখুন (যেমন −5 বা 13)।" } : signedForms(num, n)), [num, n]);
  const rows = useMemo(() => signedTable(4), []);
  const fmt = useFmt();
  return (
    <Reveal y={16}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <div className="card p-5 sm:p-7">
          <h2 className="text-2xl font-extrabold">ঋণাত্মক সংখ্যা বাইনারিতে</h2>
          <p className="mt-1 text-ink/55">ডেসিমাল পূর্ণসংখ্যাকে n বিটের সাইন-ম্যাগনিটিউড, 1's ও 2's রূপে লিখুন।</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="sg-in" className="mb-2 block text-sm font-semibold text-ink/60">ডেসিমাল সংখ্যা</label>
              <input id="sg-in" value={d} onChange={(e) => setD(e.target.value)} inputMode="text" autoComplete="off" spellCheck={false} aria-invalid={!f.ok}
                className="num w-full rounded-2xl bg-surface px-4 py-3.5 text-2xl font-semibold ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500/70" />
            </div>
            <PillChoice id="sg-n" value={n} onChange={setN} options={[{ id: 4, label: `${fmt(4)} বিট` }, { id: 8, label: `${fmt(8)} বিট` }]} />
          </div>
          {!f.ok ? (
            <p role="alert" className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-300">{f.msg}</p>
          ) : (
            <div className="mt-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Tile label="সাইন-ম্যাগনিটিউড" value={f.sm} bg="bg-sky" />
                <Tile label="1's কমপ্লিমেন্ট" value={f.ones ?? "—"} bg="bg-lilac" />
                <Tile label="2's কমপ্লিমেন্ট" value={f.twos} bg="bg-mint" />
              </div>
              {!f.ones && <p className="mt-2 text-sm text-ink/55">1's কমপ্লিমেন্টে এই মানটি লেখা যায় না (সীমা −{fmt(2 ** (n - 1) - 1)} থেকে +{fmt(2 ** (n - 1) - 1)})।</p>}
              <Detail title="ধাপে ধাপে দেখুন" blocks={signedBlocks(f)} open />
            </div>
          )}
        </div>
        <div className="card p-5 sm:p-7">
          <h2 className="text-2xl font-extrabold">4 বিটের সব প্যাটার্ন</h2>
          <p className="mt-1 text-ink/55">একই বিট প্যাটার্ন তিন পদ্ধতিতে কোন মান বোঝায়। সবচেয়ে বামের বিট হলো সাইন বিট (0 = ধনাত্মক, 1 = ঋণাত্মক)।</p>
          <Blocks nested blocks={[{ t: "table", head: ["বিট", "সাইন-ম্যাগ.", "1's", "2's"], rows, hlCol: 3, note: "সাইন-ম্যাগনিটিউড ও 1's এ দুটি শূন্য (+0, −0) থাকে; 2's এ শূন্য একটিই, আর একটি বাড়তি ঋণাত্মক মান (−8) পাওয়া যায়।" }]} />
        </div>
      </div>
    </Reveal>
  );
}

function Subtract() {
  const ex = useMemo(() => [
    { a: "1101.1", b: "101.01", title: "{{1101.1|2}} − {{101.01|2}} (ফল ধনাত্মক)" },
    { a: "101.01", b: "1101.1", title: "{{101.01|2}} − {{1101.1|2}} (ফল ঋণাত্মক)" },
  ].map((e) => ({ ...e, ones: calc(e.a, e.b, "-", 2, "ones"), twos: calc(e.a, e.b, "-", 2, "complement") })), []);
  return (
    <Reveal y={16}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-2xl font-extrabold">পরিপূরক দিয়ে বিয়োগ</h2>
        <div className="mt-3 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-lilac p-4 ring-1 ring-violet-500/20">
            <p className="text-lg font-extrabold">1's দিয়ে A − B</p>
            <ol className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-ink/80">
              <li><Rich text="1. B এর 1-এর পরিপূরক নিই (বিট উল্টাই)।" /></li>
              <li><Rich text="2. A এর সাথে সেটি যোগ করি।" /></li>
              <li><Rich text="3. বামে ক্যারি এলে ক্যারিটি ডানের বিটে যোগ করি (end-around carry); ফল **ধনাত্মক**।" /></li>
              <li><Rich text="4. ক্যারি না এলে যোগফলের আবার 1's নিই, সামনে (−) বসাই; ফল **ঋণাত্মক**।" /></li>
            </ol>
          </div>
          <div className="rounded-2xl bg-mint p-4 ring-1 ring-emerald-500/20">
            <p className="text-lg font-extrabold">2's দিয়ে A − B</p>
            <ol className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-ink/80">
              <li><Rich text="1. B এর 2-এর পরিপূরক নিই (উল্টে 1 যোগ)।" /></li>
              <li><Rich text="2. A এর সাথে সেটি যোগ করি।" /></li>
              <li><Rich text="3. বামে ক্যারি এলে ফেলে দিই; ফল **ধনাত্মক**।" /></li>
              <li><Rich text="4. ক্যারি না এলে যোগফলের আবার 2's নিই, সামনে (−) বসাই; ফল **ঋণাত্মক**।" /></li>
            </ol>
          </div>
        </div>
        <div className="mt-2 grid items-start gap-x-5 lg:grid-cols-2">
          {ex.map((e) => (
            <div key={e.a + e.b}>
              {e.ones.ok && <Detail title={`1's: ${e.title}`} blocks={e.ones.blocks} />}
              {e.twos.ok && <Detail title={`2's: ${e.title}`} blocks={e.twos.blocks} />}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => navigate("/calc")} className="mt-4 rounded-full bg-ink px-5 py-2.5 font-semibold text-paper transition hover:bg-ink/85 active:scale-95">নিজের সংখ্যা দিয়ে হিসাব পেজে করুন →</button>
      </div>
    </Reveal>
  );
}

export default function Complement() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="1's ও 2's পরিপূরক" sub="1-এর ও 2-এর পরিপূরক (Complement) বের করার নিয়ম, দশমিকসহ উদাহরণ, ঋণাত্মক সংখ্যা ও পরিপূরক দিয়ে বিয়োগ।" />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <Reveal y={16}><Live /></Reveal>
        <Reveal y={16}><Rules /></Reveal>
      </div>
      <div className="mt-5 space-y-5">
        <Solved />
        <Signed />
        <Subtract />
      </div>
    </div>
  );
}
