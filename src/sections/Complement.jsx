import { useMemo, useState } from "react";
import { calc } from "../lib/engine";
import { complementBlocks, complements, parseBits, signedBlocks, signedForms, signedTable } from "../lib/complement";
import { useFmt } from "../lib/settings";
import { navigate } from "../lib/router";
import { Blocks, Detail, Rich } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { ExampleGrid, MobileResultBar, NumberField, PillChoice } from "../components/controls";

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
    <div className={`min-w-0 rounded-2xl px-3 py-2.5 ring-1 ring-ink/[.06] sm:px-4 sm:py-3 ${bg}`}>
      <p className="text-sm font-semibold text-ink/60">{label}</p>
      <p className="num mt-0.5 break-all text-xl font-extrabold sm:text-3xl">{fmt(value)}<sub className="text-sm font-bold">{fmt(2)}</sub></p>
    </div>
  );
};


/* ---------- কেন লাগে: ছোট ছোট ধাপে ---------- */
const row = (label, bits, kind) => ({ label, kind, cells: [...bits] });
/* দুটি সমান দৈর্ঘ্যের বাইনারি যোগ; কলামে ক্যারি দেখানোর জন্য প্রতিটি ঘরে ঢোকা ক্যারিও ফেরত দেয় */
function addCols(a, b) {
  const n = a.length, cin = Array(n).fill(""), out = Array(n);
  let c = 0;
  for (let k = n - 1; k >= 0; k--) { cin[k] = c ? "1" : ""; const t = +a[k] + +b[k] + c; out[k] = String(t % 2); c = t > 1 ? 1 : 0; }
  return { res: (c ? "1" : "") + out.join(""), carry: { label: "ক্যারি", kind: "carry", cells: cin } };
}
const sumBlock = (la, a, lb, b) => { const r = addCols(a, b); return { t: "cols", rows: [r.carry, row(la, a), row(lb, b), { kind: "sep" }, row("", r.res, "res")] }; };
const WHY = [
  { t: "সমস্যাটা কী?", p: "কম্পিউটারে আছে শুধু 0 আর 1। খাতায় যেমন সংখ্যার আগে (−) লিখি, সার্কিটে তেমন চিহ্ন বসানোর জায়গা নেই। তাহলে Negative সংখ্যা লিখব কীভাবে? আর বিয়োগের জন্য আলাদা সার্কিট না বানিয়ে যোগের সার্কিটেই কি বিয়োগ চালানো যায়?" },
  { t: "Negative সংখ্যা আসলে কী?", p: "যে সংখ্যা যোগ করলে ফল **শূন্য** হয়, সেটিই ওই সংখ্যার Negative রূপ। যেমন 5 + (−5) = 0। বাইনারিতেও আমরা এমন একটি সংখ্যা খুঁজব।" },
  { t: "1-এর পরিপূরক দিয়ে শুরু", p: "8 বিটের সংখ্যা {{10110011|2}} ধরি। প্রতিটি বিট উল্টালে পাই {{01001100|2}}। দুটি যোগ করলে সবগুলো বিট 1 হয়, মানে 8 বিটের সবচেয়ে বড় সংখ্যা।",
    blocks: [{ t: "cols", rows: [row("মূল", "10110011"), row("1's", "01001100"), { kind: "sep" }, row("যোগ", "11111111", "res")] }] },
  { t: "আর 1 যোগ করলেই শূন্য", p: "{{11111111|2}} এর সাথে 1 যোগ করলে 9 বিটের {{100000000|2}} হয়। আমরা 8 বিটেই থাকতে চাই, তাই বাড়তি 9ম বিটটি ফেলে দিই। থাকে {{00000000|2}} = শূন্য।",
    blocks: [sumBlock("", "11111111", "+", "00000001"), { t: "warn", text: "সবচেয়ে বামে যে বাড়তি 1 (9ম বিট) এসেছে সেটি ফেলে দিই; থাকে {{00000000|2}}।" }] },
  { t: "তাহলে নিয়মটা দাঁড়াল", p: "বিট উল্টে (1's) তার সাথে 1 যোগ করলে Negative রূপ পাই। এটাই **2-এর পরিপূরক**। দুইবার করলে মূল সংখ্যায় ফিরে আসে: {{10110011|2}} → {{01001101|2}} → {{10110011|2}}।" },
  { t: "কোনটি Positive, কোনটি Negative?", p: "4 বিটে {{1001|2}} আর {{0111|2}} একে অপরের 2's, কিন্তু কোনটি +7 আর কোনটি −7? এর জন্য নিয়ম: সবচেয়ে বামের বিট (MSB) **0** হলে সংখ্যা Positive, **1** হলে Negative। তাই {{0111|2}} = +7 এবং {{1001|2}} = −7।" },
  { t: "আসল লাভ: বিয়োগ হয়ে গেল যোগ", p: "A − B = A + (B-এর 2's)। তাই বিয়োগের জন্য আলাদা সার্কিট লাগে না। 50 − 25 করে দেখি: 25 এর 2's হলো {{11100111|2}}, এটি 50 এর সাথে যোগ করি।",
    blocks: [sumBlock("+50", "00110010", "−25", "11100111"), { t: "p", text: "যোগফল {{100011001|2}}; বাড়তি 9ম বিট ফেলে দিই। ফল {{00011001|2}}, MSB 0 (Positive) এবং মান 25 ✓" }] },
  { t: "ফল Negative এলে?", p: "এবার 25 − 50। 50 এর 2's হলো {{11001110|2}}। যোগ করলে {{11100111|2}}, MSB **1** মানে Negative। আবার 2's নিলে {{00011001|2}} = 25, তাই উত্তর **−25** ✓",
    blocks: [sumBlock("+25", "00011001", "−50", "11001110")] },
];

function Why() {
  return (
    <Reveal y={16}>
      <div className="card p-5 sm:p-7">
        <h2 className="text-2xl font-extrabold">কেন লাগে এই পরিপূরক?</h2>
        <p className="mt-1 text-ink/55">সাতটি ছোট ধাপে বুঝে নিই, একটার পর একটা।</p>
        <ol className="mt-4 grid items-start gap-3 lg:grid-cols-2">
          {WHY.map((w, i) => (
            <li key={w.t} className="min-w-0 rounded-3xl bg-ink/[.04] p-4 ring-1 ring-ink/[.06] sm:p-5">
              <div className="flex items-center gap-3">
                <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{i + 1}</span>
                <h3 className="text-lg font-extrabold leading-snug">{w.t}</h3>
              </div>
              <p className="mt-2 leading-[1.85] text-ink/80"><Rich text={w.p} /></p>
              {w.blocks && <Blocks nested blocks={w.blocks} />}
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

function Live() {
  const [v, setV] = useState("1011.01");
  const p = useMemo(() => parseBits(v), [v]);
  const d = useMemo(() => (p.ok ? { c: complements(p.int, p.frac), blocks: complementBlocks(p.int, p.frac) } : null), [p]);
  return (
    <div className="card p-4 sm:p-7">
      <h2 className="text-2xl font-extrabold">নিজে করে দেখুন</h2>
      <p className="mt-1 hidden text-ink/55 sm:block">যেকোনো বাইনারি সংখ্যা (দশমিক বিন্দুসহ) দিন, ধাপে ধাপে সমাধান পাবেন।</p>
      <div className="mt-3 sm:mt-4">
        <NumberField label="বাইনারি সংখ্যা" base={2} value={v} onChange={setV} error={p.ok || p.empty ? null : p.msg} id="comp-in" />
      </div>
      <div className="mt-3"><ExampleGrid items={EX_LIVE.map((e) => ({ key: e, title: e }))} onPick={(e) => setV(e.title)} limit={5} cols="grid-cols-3 sm:grid-cols-5" /></div>
      {d && (
        <div className="mt-4 sm:mt-5">
          <div id="comp-result" className="grid scroll-mt-20 grid-cols-2 gap-2 sm:gap-3">
            <Tile label="1-এর পরিপূরক" value={dot(d.c.ones.int, d.c.ones.frac)} bg="bg-lilac" />
            <Tile label="2-এর পরিপূরক" value={dot(d.c.twos.int, d.c.twos.frac)} bg="bg-mint" />
          </div>
          <Detail title="ধাপে ধাপে সমাধান দেখুন" blocks={d.blocks} open />
        </div>
      )}
      {d && <MobileResultBar targetId="comp-result" items={[{ label: "1-এর পরিপূরক", value: dot(d.c.ones.int, d.c.ones.frac), base: 2 }, { label: "2-এর পরিপূরক", value: dot(d.c.twos.int, d.c.twos.frac), base: 2 }]} />}
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
          <h2 className="text-2xl font-extrabold">Negative সংখ্যা বাইনারিতে</h2>
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
          <p className="mt-1 text-ink/55">একই বিট প্যাটার্ন তিন পদ্ধতিতে কোন মান বোঝায়। সবচেয়ে বামের বিট হলো সাইন বিট (0 = Positive, 1 = Negative)।</p>
          <Blocks nested blocks={[{ t: "table", head: ["বিট", "সাইন-ম্যাগ.", "1's", "2's"], rows, hlCol: 3, note: "সাইন-ম্যাগনিটিউড ও 1's এ দুটি শূন্য (+0, −0) থাকে; 2's এ শূন্য একটিই, আর একটি বাড়তি Negative মান (−8) পাওয়া যায়।" }]} />
        </div>
      </div>
    </Reveal>
  );
}

function Subtract() {
  const ex = useMemo(() => [
    { a: "1101.1", b: "101.01", title: "{{1101.1|2}} − {{101.01|2}} (ফল Positive)" },
    { a: "101.01", b: "1101.1", title: "{{101.01|2}} − {{1101.1|2}} (ফল Negative)" },
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
              <li><Rich text="3. বামে ক্যারি এলে ক্যারিটি ডানের বিটে যোগ করি (end-around carry); ফল **Positive**।" /></li>
              <li><Rich text="4. ক্যারি না এলে যোগফলের আবার 1's নিই, সামনে (−) বসাই; ফল **Negative**।" /></li>
            </ol>
          </div>
          <div className="rounded-2xl bg-mint p-4 ring-1 ring-emerald-500/20">
            <p className="text-lg font-extrabold">2's দিয়ে A − B</p>
            <ol className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-ink/80">
              <li><Rich text="1. B এর 2-এর পরিপূরক নিই (উল্টে 1 যোগ)।" /></li>
              <li><Rich text="2. A এর সাথে সেটি যোগ করি।" /></li>
              <li><Rich text="3. বামে ক্যারি এলে ফেলে দিই; ফল **Positive**।" /></li>
              <li><Rich text="4. ক্যারি না এলে যোগফলের আবার 2's নিই, সামনে (−) বসাই; ফল **Negative**।" /></li>
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
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="1's ও 2's পরিপূরক" sub="এটি কেন লাগে, কীভাবে বের করে, দশমিকসহ উদাহরণ, Negative সংখ্যা ও পরিপূরক দিয়ে বিয়োগ।" />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <Reveal y={16}><Live /></Reveal>
        <Reveal y={16}><Rules /></Reveal>
      </div>
      <div className="mt-5 space-y-5">
        <Why />
        <Solved />
        <Signed />
        <Subtract />
      </div>
    </div>
  );
}
