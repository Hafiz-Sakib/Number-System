import { useMemo } from "react";
import { BASES, BASE_NAME, convert } from "../lib/engine";
import { Blocks, Detail, Rich } from "../components/Steps";
import { SectionTitle, Reveal } from "../components/ui";
import { CLR } from "../components/controls";

const INFO = {
  2: { digits: "0, 1", eg: "1011", use: "কম্পিউটার শুধু 0 ও 1 বোঝে" },
  8: { digits: "0 থেকে 7", eg: "13", use: "3 বিট = 1 অক্টাল অঙ্ক" },
  10: { digits: "0 থেকে 9", eg: "11", use: "আমাদের দৈনন্দিন সংখ্যা" },
  16: { digits: "0–9, A–F", eg: "B", use: "4 বিট = 1 হেক্স অঙ্ক" },
};

const ref = (() => {
  const rows = [];
  for (let i = 0; i < 32; i++) rows.push([`${i}`, i.toString(2).padStart(5, "0"), i.toString(8), i.toString(16).toUpperCase()]);
  return rows;
})();

export default function Learn() {
  const ex = useMemo(() => ({
    dec2: convert("25.625", 10, 2),
    toDec: convert("1010.01", 2, 10),
    bin8: convert("1011010.101", 2, 8),
    hex2: convert("3A.8", 16, 2),
    oct16: convert("755", 8, 16),
  }), []);

  const rules = [
    { title: "ডেসিমাল → বাইনারি / অক্টাল / হেক্স", intro: "পূর্ণ অংশকে ভিত্তি (2, 8 বা 16) দিয়ে বারবার ভাগ করি, ভাগশেষ নিচ থেকে উপরে সাজাই। ভগ্নাংশ অংশকে ভিত্তি দিয়ে বারবার গুণ করি, গুণফলের পূর্ণ অংশ উপর থেকে নিচে সাজাই।", ex: ex.dec2, label: "উদাহরণ: 25.625 কে বাইনারিতে" },
    { title: "বাইনারি / অক্টাল / হেক্স → ডেসিমাল", intro: "প্রতিটি অঙ্ককে তার স্থানীয় মান (ভিত্তির ঘাত) দিয়ে গুণ করে সব যোগ করি। দশমিকের বামে ঘাত 0, 1, 2 … ডানে −1, −2 …", ex: ex.toDec, label: "উদাহরণ: 1010.01 কে ডেসিমালে" },
    { title: "বাইনারি → অক্টাল / হেক্স", intro: "দশমিক বিন্দু থেকে শুরু করে অক্টালের জন্য 3 বিট, হেক্সের জন্য 4 বিট করে গ্রুপ করি; প্রতিটি গ্রুপ একটি অঙ্ক।", ex: ex.bin8, label: "উদাহরণ: 1011010.101 কে অক্টালে" },
    { title: "অক্টাল / হেক্স → বাইনারি", intro: "প্রতিটি অক্টাল অঙ্ককে 3 বিটে এবং প্রতিটি হেক্স অঙ্ককে 4 বিটে লিখি।", ex: ex.hex2, label: "উদাহরণ: 3A.8 কে বাইনারিতে" },
    { title: "অক্টাল ↔ হেক্স", intro: "সরাসরি নয়, বাইনারি হয়ে যাই: প্রথমে বাইনারিতে, তারপর গ্রুপ করে অন্য পদ্ধতিতে।", ex: ex.oct16, label: "উদাহরণ: 755 অক্টালকে হেক্সে" },
  ];

  const opTables = [
    { t: "h", text: "বাইনারি যোগের নিয়ম" },
    { t: "table", head: ["যোগ", "যোগফল", "ক্যারি"], rows: [["0 + 0", "0", "0"], ["0 + 1", "1", "0"], ["1 + 0", "1", "0"], ["1 + 1", "0", "1"], ["1 + 1 + 1 (ক্যারিসহ)", "1", "1"]], note: "1 + 1 = 2 = {{10|2}}, তাই লিখি 0 আর ক্যারি 1।" },
    { t: "h", text: "বাইনারি বিয়োগের নিয়ম" },
    { t: "table", head: ["বিয়োগ", "ফল", "ধার"], rows: [["0 − 0", "0", "0"], ["1 − 0", "1", "0"], ["1 − 1", "0", "0"], ["0 − 1", "1", "1 (পাশ থেকে ধার)"]], note: "0 − 1 এ পাশের কলাম থেকে ধার নিলে 0 হয় {{10|2}} = 2, তাই 2 − 1 = 1।" },
    { t: "h", text: "1-এর পরিপূরক দিয়ে বিয়োগ" },
    { t: "list", items: ["বিয়োগ্য (B) এর প্রতিটি বিট উল্টে দিই (0 → 1, 1 → 0): এটিই 1-এর পরিপূরক।", "A এর সাথে সেটি যোগ করি।", "বামে ক্যারি এলে ক্যারিটি ফেলে দিয়ে সবচেয়ে ডানের বিটে যোগ করি (end-around carry)। ফল ধনাত্মক।", "ক্যারি না এলে ফল ঋণাত্মক: যোগফলের আবার 1-এর পরিপূরক নিয়ে (−) বসাই।"] },
    { t: "h", text: "2-এর পরিপূরক দিয়ে বিয়োগ" },
    { t: "list", items: ["বিয়োগ্য (B) এর প্রতিটি বিট উল্টে দিই: 1-এর পরিপূরক।", "তার সাথে 1 যোগ করি: 2-এর পরিপূরক।", "A এর সাথে সেটি যোগ করি।", "বামে ক্যারি এলে ফেলে দিই, ফল ধনাত্মক। ক্যারি না এলে ফল ঋণাত্মক: যোগফলের আবার 2-এর পরিপূরক নিয়ে (−) বসাই।"] },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="নিয়মকানুন" sub="পরীক্ষার আগে ঝালিয়ে নেওয়ার জন্য ছোট করে সব নিয়ম।" />

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

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">স্থানীয় মান</h2>
              <p className="mt-2 leading-[1.85] text-ink/80"><Rich text="প্রতিটি অঙ্কের মান নির্ভর করে সে কোথায় বসেছে তার ওপর। ভিত্তি **b** হলে ডান থেকে প্রথম অঙ্কের স্থানীয় মান b^[0], তারপর b^[1], b^[2] …। দশমিক বিন্দুর ডানে b^[−1], b^[−2] …" /></p>
              <p className="mt-3 leading-[1.85] text-ink/80"><Rich text="{{1011|2}} = 1×2^[3] + 0×2^[2] + 1×2^[1] + 1×2^[0] = 8 + 0 + 2 + 1 = {{11|10}}" /></p>
            </div>
          </Reveal>
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">রূপান্তরের নিয়ম</h2>
              <p className="mt-1 text-ink/55">প্রতিটিতে চাপ দিলে একটি করে সমাধান করা উদাহরণ দেখা যাবে।</p>
              {rules.map((r) => (
                <div key={r.title} className="mt-4">
                  <h3 className="text-lg font-bold">{r.title}</h3>
                  <p className="mt-1.5 leading-[1.85] text-ink/75"><Rich text={r.intro} /></p>
                  <Detail title={r.label} blocks={r.ex.blocks} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="min-w-0 space-y-5">
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">যোগ-বিয়োগের ছক</h2>
              <Blocks blocks={opTables} nested />
            </div>
          </Reveal>
          <Reveal y={16}>
            <div className="card p-5 sm:p-7">
              <h2 className="text-2xl font-extrabold">0 থেকে 31 এর সারণি</h2>
              <p className="mt-1 text-ink/55">চার পদ্ধতিতে পাশাপাশি।</p>
              <Blocks nested blocks={[{ t: "table", head: ["ডেসিমাল", "বাইনারি", "অক্টাল", "হেক্স"], rows: ref }]} />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
