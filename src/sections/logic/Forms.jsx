import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Circuit, Lab, useInputs } from "../../components/Circuit";
import { ExampleGrid, PillChoice } from "../../components/controls";
import { astToSpec, autoLayout, parseExpr, tableOf } from "../../lib/logic";
import { VARS, analyse, bits, evalTerm, expandForm, maxterm, minterm } from "../../lib/forms";
import { Eq, Facts, P, Panel, spec } from "./shared";

/* ---------- SOP (3.7.5) ও POS (3.7.6): একই কাঠামোয় দুটি টপিক। mode = "sop" | "pos" ---------- */
const BN = "০১২৩৪৫৬৭৮৯";
const bn = (x) => String(x).replace(/\d/g, (d) => BN[d]);
const litCount = (s) => (s.match(/[A-D]/g) || []).length;
const H = ({ no, children }) => <h5 className="mb-2 mt-5 flex items-center gap-2 text-[15px] font-extrabold first:mt-0"><span className="num grid h-6 w-6 place-items-center rounded-full bg-violet-500/15 text-xs text-violet-700 dark:text-violet-300">{no}</span>{children}</h5>;
const Box = ({ children, className = "" }) => <div className={`rounded-2xl bg-ink/[.035] p-3.5 ring-1 ring-ink/[.06] sm:p-5 ${className}`}>{children}</div>;
const Result = ({ children, note }) => (
  <div className="mt-4 rounded-2xl bg-mint px-4 py-3 ring-1 ring-emerald-500/20">
    <p className="num break-words text-xl font-extrabold">{children}</p>
    {note && <p className="mt-1 text-sm text-ink/65">{note}</p>}
  </div>
);
const chipCls = (sop) => `num rounded-xl ${sop ? "bg-sky" : "bg-peach"} px-2.5 py-1 text-sm font-bold ring-1 ring-ink/[.06]`;
const Chip = ({ sop, k, n, term, vars }) => (
  <span className={chipCls(sop)}>{sop ? "m" : "M"}<sub>{k}</sub> = {bits(k, n)} <span className="font-semibold text-ink/50">→ {term ?? (sop ? minterm(k, vars) : maxterm(k, vars))}</span></span>
);
const listOf = (a) => (a.length ? a.join(", ") : "—");

/* ================= মিনটার্ম / ম্যাক্সটার্ম সারণী: একটি সারিতে ক্লিক করলে মান বসিয়ে হিসাব দেখায় ================= */
function TermTable({ mode }) {
  const sop = mode === "sop";
  const [n, setN] = useState(3);
  const [sel, setSel] = useState(3);
  const vars = VARS.slice(0, n);
  const s = Math.min(sel, (1 << n) - 1);
  const other = s ^ 1;
  const here = evalTerm(s, s, vars, mode), near = evalTerm(s, other, vars, mode);
  const Calc = ({ at, d }) => (
    <div className="rounded-xl bg-surface px-3.5 py-2.5 ring-1 ring-ink/10">
      <p className="text-xs font-bold text-ink/50">সারি <span className="num">{bits(at, n)}</span> এ বসালে</p>
      <p className="num mt-1 break-words text-[15px] font-semibold leading-[1.9]">{d.text} <span className="text-ink/40">=</span> {d.sub} <span className="text-ink/40">=</span> {d.vals} <span className="text-ink/40">=</span> <span className={`font-extrabold ${d.res === (sop ? 1 : 0) ? "text-emerald-600 dark:text-emerald-300" : ""}`}>{d.res}</span></p>
    </div>
  );
  return (
    <div>
      <PillChoice id={`tt-n-${mode}`} value={n} onChange={(x) => { setN(x); setSel(Math.min(sel, (1 << x) - 1)); }} options={[2, 3, 4].map((x) => ({ id: x, label: `${bn(x)} চলক` }))} />
      <div className="mt-3 max-w-full overflow-x-auto no-sb rounded-2xl ring-1 ring-ink/10">
        <table className="mx-auto min-w-max text-[15px] sm:min-w-[22rem]" aria-label={sop ? "মিনটার্ম সারণী" : "ম্যাক্সটার্ম সারণী"}>
          <thead>
            <tr className="bg-ink/[.05]">
              <th className="px-3.5 py-2 text-center font-semibold text-ink/70">{sop ? "m" : "M"}</th>
              {vars.map((v) => <th key={v} className="px-3.5 py-2 text-center font-semibold text-ink/70"><span className="num">{v}</span></th>)}
              <th className="border-l-2 border-ink/15 px-3.5 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300">{sop ? "মিনটার্ম" : "ম্যাক্সটার্ম"}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 1 << n }, (_, k) => (
              <tr key={k} aria-selected={s === k} onClick={() => setSel(k)} className={`cursor-pointer border-t border-ink/[.07] transition-colors hover:bg-ink/[.04] ${s === k ? "bg-violet-500/[.12] hover:bg-violet-500/[.12]" : ""}`}>
                <td className="num px-3.5 py-1.5 text-center font-bold text-ink/55">{k}</td>
                {bits(k, n).split("").map((b, i) => <td key={i} className="num px-3.5 py-1.5 text-center text-ink/75">{b}</td>)}
                <td className="num border-l-2 border-ink/15 px-3.5 py-1.5 text-center font-bold">{sop ? minterm(k, vars) : maxterm(k, vars)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-center text-xs text-ink/45">যেকোনো সারিতে ক্লিক করে দেখো, ওই পদটি কখন {sop ? "1" : "0"} হয়।</p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <Calc at={s} d={here} />
        <Calc at={other} d={near} />
      </div>
      <p className="mt-3 leading-[1.9] text-ink/70">
        {sop
          ? <>তাই <Eq>{here.text}</Eq> শুধু নিজের সারিতেই (<span className="num font-bold">{bits(s, n)}</span>) 1 হয়, বাকি সব সারিতে 0।</>
          : <>তাই <Eq>{here.text}</Eq> শুধু নিজের সারিতেই (<span className="num font-bold">{bits(s, n)}</span>) 0 হয়, বাকি সব সারিতে 1।</>}
      </p>
    </div>
  );
}

/* ================= সত্যক সারণী থেকে আদর্শ ও সরল রূপ (নিজে ছক ভরে দেখো) ================= */
const PRESETS = [
  { title: "XOR", sub: "২ চলক, A'·B + A·B'", n: 2, ones: [1, 2] },
  { title: "সংখ্যাগরিষ্ঠ", sub: "৩টির ২টি বা বেশি 1", n: 3, ones: [3, 5, 6, 7] },
  { title: "বিজোড় প্যারিটি", sub: "1-এর সংখ্যা বিজোড়", n: 3, ones: [1, 2, 4, 7] },
  { title: "F = C", sub: "অনেক পদ, সরল হয় একটিতে", n: 3, ones: [1, 3, 5, 7] },
  { title: "৪ চলক", sub: "সরল রূপ B'D' + BD", n: 4, ones: [0, 2, 5, 7, 8, 10, 13, 15] },
];
const DEFAULT_ONES = { 2: [1, 2], 3: [3, 5, 6, 7], 4: [0, 2, 5, 7, 8, 10, 13, 15] };
const fromOnes = (n, ones) => Array.from({ length: 1 << n }, (_, k) => (ones.includes(k) ? 1 : 0));

function FormLab({ mode }) {
  const sop = mode === "sop";
  const [n, setN] = useState(3);
  const [F, setF] = useState(() => fromOnes(3, DEFAULT_ONES[3]));
  const [view, setView] = useState("min");
  const vars = VARS.slice(0, n);
  const d = useMemo(() => analyse(F, vars), [F, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const want = sop ? 1 : 0;
  const rowsSel = sop ? d.ones : d.zeros;
  const canon = sop ? d.sopCanon : d.posCanon;
  const min = sop ? d.sopMin : d.posMin;
  const sym = sop ? "Σm" : "ΠM";

  const nets = useMemo(() => {
    const mk = (s) => { if (s === "0" || s === "1") return null; const p = parseExpr(s); return p.ok ? autoLayout(astToSpec(p.ast)) : null; };
    return { canon: mk(canon), min: mk(min) };
  }, [canon, min]);
  const verified = (s) => { const p = parseExpr(s); return p.ok && tableOf(p.ast, vars).every((x, i) => x === F[i]); };
  const { st, toggle } = useInputs(vars);
  const shown = view === "canon" ? nets.canon : nets.min;
  const constant = min === "0" || min === "1";

  const changeN = (x) => { setN(x); setF(fromOnes(x, DEFAULT_ONES[x])); };
  const pick = (p) => { setN(p.n); setF(fromOnes(p.n, p.ones)); };
  const flip = (k) => setF((f) => f.map((v, i) => (i === k ? 1 - v : v)));
  const termOf = (k) => (sop ? minterm(k, vars) : maxterm(k, vars));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-ink/60">চলকের সংখ্যা</span>
        <PillChoice id={`fl-n-${mode}`} value={n} onChange={changeN} options={[2, 3, 4].map((x) => ({ id: x, label: `${bn(x)} চলক` }))} />
      </div>
      <div className="mt-4"><ExampleGrid items={PRESETS} onPick={pick} limit={5} label="উদাহরণ ফাংশন" cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" mono={false} /></div>

      <p className="mb-1.5 mt-5 text-sm font-semibold text-ink/55">F কলামের বোতামে ক্লিক করে 0/1 বদলাও। {sop ? "F = 1" : "F = 0"} সারিগুলো রঙিন হবে।</p>
      <div className="max-w-full overflow-x-auto no-sb rounded-2xl ring-1 ring-ink/10">
        <table className="mx-auto min-w-max text-[15px] sm:min-w-[22rem]" aria-label="সত্যক সারণী (F বদলানো যায়)">
          <thead>
            <tr className="bg-ink/[.05]">
              <th className="px-3 py-2 text-center font-semibold text-ink/50">{sop ? "m" : "M"}</th>
              {vars.map((v) => <th key={v} className="px-3.5 py-2 text-center font-semibold text-ink/70"><span className="num">{v}</span></th>)}
              <th className="border-l-2 border-ink/15 px-3.5 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300"><span className="num">F</span></th>
              <th className="px-3.5 py-2 text-center font-semibold text-ink/60">{sop ? "মিনটার্ম" : "ম্যাক্সটার্ম"}</th>
            </tr>
          </thead>
          <tbody>
            {F.map((f, k) => {
              const on = f === want;
              return (
                <tr key={k} className={`border-t border-ink/[.07] transition-colors ${on ? (sop ? "bg-mint/70" : "bg-peach/70") : ""}`}>
                  <td className="num px-3 py-1 text-center text-xs font-bold text-ink/45">{k}</td>
                  {bits(k, n).split("").map((b, i) => <td key={i} className="num px-3.5 py-1 text-center text-ink/75">{b}</td>)}
                  <td className="border-l-2 border-ink/15 px-3.5 py-1 text-center">
                    <button type="button" onClick={() => flip(k)} aria-label={`সারি ${bits(k, n)}: F = ${f}, বদলাও`} className={`num h-8 w-10 rounded-lg font-extrabold ring-1 transition active:scale-90 ${f ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300" : "bg-ink/[.06] text-ink/50 ring-ink/10"}`}>{f}</button>
                  </td>
                  <td className="num px-3.5 py-1 text-center text-[14px] font-bold">{on ? termOf(k) : <span className="text-ink/20">·</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Box className="mt-5">
        <h4 className="text-lg font-extrabold">{sop ? "SOP" : "POS"} বের করার ধাপ</h4>

        <H no="১">{sop ? "যেসব সারিতে F = 1 সেগুলো বাছো" : "যেসব সারিতে F = 0 সেগুলো বাছো"}</H>
        {rowsSel.length
          ? <div className="flex flex-wrap gap-1.5">{rowsSel.map((k) => <span key={k} className={chipCls(sop)}>{bits(k, n)} <span className="font-semibold text-ink/50">({sop ? "m" : "M"}<sub>{k}</sub>)</span></span>)}</div>
          : <p className="leading-[1.9] text-ink/70">{sop ? "কোনো সারিতেই F = 1 নেই, অর্থাৎ F সবসময় 0।" : "কোনো সারিতেই F = 0 নেই, অর্থাৎ F সবসময় 1।"}</p>}

        {rowsSel.length > 0 && (<>
          <H no="২">{sop ? "প্রতিটি সারির মিনটার্ম লেখো (1 → চলক, 0 → পরিপূরক)" : "প্রতিটি সারির ম্যাক্সটার্ম লেখো (0 → চলক, 1 → পরিপূরক)"}</H>
          <div className="flex flex-wrap gap-1.5">{rowsSel.map((k) => <Chip key={k} sop={sop} k={k} n={n} vars={vars} />)}</div>

          <H no="৩">{sop ? "সবগুলো OR (+) করো → আদর্শ SOP" : "সবগুলো AND (·) করো → আদর্শ POS"}</H>
          <p className="num break-words text-[15px] font-bold leading-[1.9]">F = {sym}({rowsSel.join(", ")}) = {canon}</p>
        </>)}

        <H no={rowsSel.length ? "৪" : "২"}>সরল করো (কম গেট, কম লিটারেল)</H>
        {!sop && d.zeros.length > 0 && d.ones.length > 0 && (
          <p className="mb-2 text-sm leading-[1.9] text-ink/60">কৌশল: F = 0 সারিগুলো থেকে প্রথমে <b>F'</b> এর সরল SOP বের করি, তারপর ডি-মরগান দিয়ে পুরো রাশির পরিপূরক নিই (প্রতিটি লিটারেল উল্টে, গুণ ↔ যোগ)।
            <span className="num mt-1 block font-semibold text-ink/80">F' = {d.compSop} ⟹ F = (F')' = {d.posMin}</span></p>
        )}
        <p className="num break-words text-[15px] font-bold leading-[1.9]">F = {min}</p>
        <Result note={<>লিটারেল <span className="num font-bold">{litCount(canon)} → {litCount(min)}</span>{nets.canon && nets.min ? <> · গেট <span className="num font-bold">{nets.canon.gates.length} → {nets.min.gates.length}</span></> : null}। দুই রূপই সত্যক সারণীর সাথে মিলিয়ে দেখা হয়েছে {verified(canon) && verified(min) ? "✓" : "✗"}</>}>∴ F = {min}</Result>
        <p className="mt-3 text-sm leading-[1.9] text-ink/60">একই ফাংশনের দুই রূপ: <span className="num font-semibold text-ink/80">Σm({listOf(d.ones)}) = ΠM({listOf(d.zeros)})</span>। যে সারি SOP-তে আছে, POS-এ তা নেই; আর উল্টোটাও।</p>
      </Box>

      <div className="mt-5">
        {constant
          ? <p className="rounded-2xl bg-mint px-4 py-3 font-semibold ring-1 ring-ink/[.06]">F = {min}: আউটপুট সবসময় {min}, তাই কোনো গেটই লাগে না।</p>
          : <>
            <PillChoice id={`fl-v-${mode}`} value={view} onChange={setView} options={[{ id: "canon", label: "আদর্শ রূপের সার্কিট" }, { id: "min", label: "সরল রূপের সার্কিট" }]} />
            <div className="board mt-3 overflow-x-auto no-sb rounded-2xl p-1.5 ring-1 ring-ink/10 sm:p-2 lg:p-3">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={view + canon} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {shown && <Circuit net={shown} state={st} onToggle={toggle} />}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="mt-2 text-sm text-ink/55">{sop ? "প্রথমে AND গেট (প্রতিটি গুণফল পদের জন্য), তারপর একটি OR গেট।" : "প্রথমে OR গেট (প্রতিটি যোগফল পদের জন্য), তারপর একটি AND গেট।"} সুইচে ক্লিক করে ইনপুট বদলাও।</p>
          </>}
      </div>
    </div>
  );
}

/* ================= তোমার রাশি → আদর্শ রূপ (অনুপস্থিত চলক বসিয়ে বিস্তার) ================= */
const EX = {
  sop: [
    { title: "A + B·C", sub: "২টি পদে অনুপস্থিত চলক" },
    { title: "A·B + A'·C", sub: "প্রতিটিতে ১টি অনুপস্থিত" },
    { title: "A·B + B'·C' + A'", sub: "তিনটি পদ" },
    { title: "A·B + A'·B'", sub: "সব চলক আছে (XNOR)" },
    { title: "A·(B + C)", sub: "SOP নয়, ভেঙে নিতে হয়" },
  ],
  pos: [
    { title: "(A + B)·(A' + C)", sub: "প্রতিটিতে ১টি অনুপস্থিত" },
    { title: "A·(B + C)", sub: "একচলক পদও POS-এর অংশ" },
    { title: "(A + B + C)·(A' + B')", sub: "মিশ্র দৈর্ঘ্য" },
    { title: "(A + B')·(A' + B)", sub: "সব চলক আছে (XNOR)" },
    { title: "A·B + C", sub: "POS নয়, ভেঙে নিতে হয়" },
  ],
};

function FormExpand({ mode }) {
  const sop = mode === "sop";
  const [src, setSrc] = useState(EX[mode][0].title);
  const r = useMemo(() => parseExpr(src, 4), [src]);
  const d = useMemo(() => (r.ok ? expandForm(r.ast, r.vars, mode) : null), [r, mode]);
  const vars = r.ok ? r.vars : [];
  const n = vars.length;
  const canon = d && d.rows.length ? (sop ? d.rows.map((k) => minterm(k, vars)).join(" + ") : d.rows.map((k) => maxterm(k, vars)).join("·")) : sop ? "0" : "1";

  return (
    <div>
      <label htmlFor={`fx-${mode}`} className="mb-2 block text-sm font-semibold text-ink/60">{sop ? "একটি SOP রাশি লেখো" : "একটি POS রাশি লেখো"} (সর্বোচ্চ 4টি চলক)</label>
      <input id={`fx-${mode}`} value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-invalid={!r.ok}
        className="num w-full rounded-2xl bg-surface px-4 py-3 text-xl font-semibold ring-1 ring-ink/10 transition focus:ring-2 focus:ring-violet-500/60" />
      <p className="mt-1.5 text-sm text-ink/50">যোগ <Eq>+</Eq> · গুণ <Eq>·</Eq> বা পাশাপাশি লেখো (<Eq>AB</Eq>) · পরিপূরক <Eq>'</Eq></p>
      <div className="mt-3"><ExampleGrid items={EX[mode]} onPick={(e) => setSrc(e.title)} limit={4} cols="grid-cols-2 lg:grid-cols-4" /></div>

      {!r.ok ? (
        <p role="alert" className="mt-5 rounded-2xl bg-rose-500/10 px-4 py-3 font-semibold text-rose-700 dark:text-rose-300">{r.empty ? "উপরে একটি রাশি লেখো।" : r.error}</p>
      ) : !d.valid ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-2xl bg-lemon px-4 py-3 leading-[1.9] ring-1 ring-amber-500/20">
            {sop ? "রাশিটি SOP আকারে নেই: প্রতিটি পদ শুধু চলক বা পরিপূরকের গুণফল হতে হবে, আর পদগুলো যোগ করা থাকবে। " : "রাশিটি POS আকারে নেই: প্রতিটি পদ শুধু চলক বা পরিপূরকের যোগফল হতে হবে, আর পদগুলো গুণ করা থাকবে। "}
            {sop ? "বণ্টন নিয়মে ভেঙে (যেমন A·(B + C) = A·B + A·C) আগে SOP বানিয়ে নাও।" : "বণ্টন নিয়মে ভেঙে (যেমন A + B·C = (A + B)·(A + C)) আগে POS বানিয়ে নাও।"}
          </p>
          <Result note="সত্যক সারণী থেকে সরাসরি বের করা আদর্শ রূপ:">∴ F = {sop ? "Σm" : "ΠM"}({listOf(d.rows)}) = {canon}</Result>
        </div>
      ) : (
        <Box className="mt-5">
          <h4 className="text-lg font-extrabold">{sop ? "অনুপস্থিত চলক বসিয়ে মিনটার্ম বের করা" : "অনুপস্থিত চলক বসিয়ে ম্যাক্সটার্ম বের করা"}</h4>
          <p className="mt-1 text-sm leading-[1.8] text-ink/55">
            {sop ? "যে পদে কোনো চলক নেই, তাকে (X + X') দিয়ে গুণ করি। (X + X') = 1, তাই মান বদলায় না; তারপর বণ্টন নিয়মে ভাঙলে মিনটার্মগুলো পাওয়া যায়।" : "যে পদে কোনো চলক নেই, তার সাথে X·X' যোগ করি। X·X' = 0, তাই মান বদলায় না; তারপর বণ্টন নিয়মে ভাঙলে ম্যাক্সটার্মগুলো পাওয়া যায়।"}
          </p>
          <div className="mt-3 space-y-2.5">
            {d.terms.map((t, i) => (
              <div key={i} className="rounded-2xl bg-surface px-3.5 py-3 ring-1 ring-ink/10">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="num grid h-6 w-6 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-700 dark:text-violet-300">{i + 1}</span>
                  <span className="num text-lg font-bold">{t.text}</span>
                  <span className="text-sm text-ink/55">{t.missing.length ? <>নেই: <span className="num font-semibold">{t.missing.join(", ")}</span></> : "সব চলক আছে"}</span>
                </div>
                {t.missing.length > 0 && <p className="num mt-1.5 break-words text-[15px] font-semibold leading-[1.9]"><span className="text-ink/40">= </span>{t.full}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.rows.length
                    ? t.rows.map((k) => <Chip key={k} sop={sop} k={k} n={n} vars={vars} />)
                    : <span className="text-sm text-ink/55">এই পদ {sop ? "কোনো সারিতেই 1" : "কোনো সারিতেই 0"} হয় না।</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-[1.8] text-ink/60">{sop ? "একই মিনটার্ম একাধিক পদ থেকে এলে একবারই ধরা হয় (A + A = A)।" : "একই ম্যাক্সটার্ম একাধিক পদ থেকে এলে একবারই ধরা হয় (A·A = A)।"}</p>
          <Result note={<>মূল রাশি: <span className="num font-semibold">{src}</span></>}>∴ F = {sop ? "Σm" : "ΠM"}({listOf(d.rows)}){d.rows.length ? ` = ${canon}` : ""}</Result>
        </Box>
      )}
    </div>
  );
}

/* ================= দুই স্তরের সার্কিট ================= */
const TWO = {
  sop: {
    eq: "F = A·B + C·D",
    opts: [
      { id: "a", label: "AND – OR", s: spec(["A", "B", "C", "D"], [["g1", "AND", ["A", "B"]], ["g2", "AND", ["C", "D"]], ["g3", "OR", ["g1", "g2"]]], [["F", "g3"]]) },
      { id: "b", label: "শুধু NAND", s: spec(["A", "B", "C", "D"], [["g1", "NAND", ["A", "B"]], ["g2", "NAND", ["C", "D"]], ["g3", "NAND", ["g1", "g2"]]], [["F", "g3"]]) },
    ],
    say: { a: "প্রতিটি গুণফল পদের জন্য একটি AND গেট, তাদের আউটপুটে একটি OR গেট। এটিই SOP-এর সরাসরি সার্কিট।", b: "AND–OR এর জায়গায় সব গেট NAND বসালেও ফল একই: ((A·B)'·(C·D)')' = A·B + C·D (ডি-মরগান)। NAND সর্বজনীন গেট বলে একটি IC দিয়েই সার্কিট হয়ে যায়।" },
  },
  pos: {
    eq: "F = (A + B)·(C + D)",
    opts: [
      { id: "a", label: "OR – AND", s: spec(["A", "B", "C", "D"], [["g1", "OR", ["A", "B"]], ["g2", "OR", ["C", "D"]], ["g3", "AND", ["g1", "g2"]]], [["F", "g3"]]) },
      { id: "b", label: "শুধু NOR", s: spec(["A", "B", "C", "D"], [["g1", "NOR", ["A", "B"]], ["g2", "NOR", ["C", "D"]], ["g3", "NOR", ["g1", "g2"]]], [["F", "g3"]]) },
    ],
    say: { a: "প্রতিটি যোগফল পদের জন্য একটি OR গেট, তাদের আউটপুটে একটি AND গেট। এটিই POS-এর সরাসরি সার্কিট।", b: "OR–AND এর জায়গায় সব গেট NOR বসালেও ফল একই: ((A + B)' + (C + D)')' = (A + B)·(C + D) (ডি-মরগান)। NOR-ও সর্বজনীন গেট।" },
  },
};

function TwoLevel({ mode }) {
  const T = TWO[mode];
  const [v, setV] = useState("a");
  const o = T.opts.find((x) => x.id === v);
  const net = useMemo(() => autoLayout(o.s, { inGap: 52 }), [o]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Eq className="text-lg">{T.eq}</Eq>
        <PillChoice id={`two-${mode}`} value={v} onChange={setV} options={T.opts.map((x) => ({ id: x.id, label: x.label }))} />
      </div>
      <P className="my-3">{T.say[v]}</P>
      <Lab key={`${mode}-${v}`} net={net} />
    </div>
  );
}

/* ================= তুলনা সারণী ================= */
const CMP = [
  ["গঠন", "গুণফল পদের যোগ (AND-এর OR)", "যোগফল পদের গুণ (OR-এর AND)"],
  ["কোন সারি দেখি", "যেখানে F = 1", "যেখানে F = 0"],
  ["প্রতি সারির পদ", "মিনটার্ম m", "ম্যাক্সটার্ম M"],
  ["চলক বসানোর নিয়ম", "1 → A, 0 → A'", "0 → A, 1 → A'"],
  ["আদর্শ রূপের সংকেত", "Σm(…)", "ΠM(…)"],
  ["দুই স্তরের গেট", "AND → OR", "OR → AND"],
  ["শুধু এক ধরনের গেটে", "NAND – NAND", "NOR – NOR"],
  ["অনুপস্থিত চলকের জন্য", "(X + X') দিয়ে গুণ", "X·X' যোগ"],
];

/* ---------- 3.7.5 SOP ---------- */
export function SOP() {
  return (
    <div className="space-y-4">
      <Panel>
        <P>**সমষ্টি-গুণফল (Sum of Products, সংক্ষেপে SOP)** এমন একটি বুলিয়ান রাশি, যেখানে কয়েকটি **গুণফল পদকে** (AND) **যোগ** (OR) করা থাকে। নামটা তাই "গুণফলের যোগফল"। যেমন <Eq>A·B + A'·C</Eq>।</P>
        <div className="mt-4"><Facts items={[
          ["A, B', C", "**লিটারেল (Literal)**: একটি চলক বা তার পরিপূরক।", "bg-lilac"],
          ["A·B'·C", "**গুণফল পদ (Product term)**: এক বা একাধিক লিটারেলের AND।", "bg-sky"],
          ["A·B + A'·C", "**SOP**: গুণফল পদগুলোর OR। প্রতিটি পদ এক-একটি AND গেট।", "bg-mint"],
          ["A·(B + C)", "**SOP নয়**: গুণের ভেতরে যোগ আছে। বণ্টন নিয়মে ভাঙলে A·B + A·C হয়, সেটি SOP।", "bg-peach"],
        ]} /></div>
        <P className="mt-4">**আদর্শ (Canonical) SOP:** যে SOP-এর প্রতিটি পদে **সবগুলো** চলক আছে (প্রতিটি পদ একটি **মিনটার্ম**)। আর যে SOP-এর কোনো পদে চলক কম, সেটি **সাধারণ (Standard)** SOP। সত্যক সারণী থেকে সরাসরি আদর্শ SOP পাওয়া যায়, তারপর সরল করে সাধারণ SOP বানানো হয়।</P>
      </Panel>

      <Panel title="মিনটার্ম (Minterm)" sub="সব চলক আছে এমন গুণফল পদ, যেটি সারণীর ঠিক একটি সারিতে 1 হয়।">
        <P className="mb-4">**নিয়ম:** সারির বিটে **1** থাকলে চলকটি যেমন আছে তেমন লেখো, **0** থাকলে তার পরিপূরক (A') লেখো। তারপর সবগুলো গুণ (·) করো। যেমন সারি <Eq>011</Eq> এর মিনটার্ম <Eq>A'·B·C</Eq>, সংকেত **m3** (011 = দশমিক 3)।</P>
        <TermTable mode="sop" />
      </Panel>

      <Panel title="সত্যক সারণী থেকে SOP কীভাবে বের করবে" sub="নিজের ফাংশন বানাও বা উদাহরণ বেছে নাও। প্রতিটি ধাপের হিসাব নিচে দেখা যাবে।">
        <P className="mb-4">**ধাপ:** ① যেসব সারিতে F = 1 সেগুলো চিহ্নিত করো ② প্রতিটির মিনটার্ম লেখো ③ সব মিনটার্ম OR করো (আদর্শ SOP) ④ বুলিয়ান নিয়ম বা Quine–McCluskey দিয়ে সরল করো।</P>
        <FormLab mode="sop" />
      </Panel>

      <Panel title="রাশি থেকে আদর্শ SOP" sub="কোনো পদে চলক কম থাকলে কীভাবে মিনটার্ম পাওয়া যায় দেখো। নিজের রাশিও লিখতে পারো।">
        <FormExpand mode="sop" />
      </Panel>

      <Panel title="SOP-এর সার্কিট" sub="SOP সবসময় দুই স্তরের সার্কিট: প্রথমে AND, তারপর OR।">
        <TwoLevel mode="sop" />
      </Panel>
    </div>
  );
}

/* ---------- 3.7.6 POS ---------- */
export function POS() {
  return (
    <div className="space-y-4">
      <Panel>
        <P>**গুণফল-সমষ্টি (Product of Sums, সংক্ষেপে POS)** এমন একটি বুলিয়ান রাশি, যেখানে কয়েকটি **যোগফল পদকে** (OR) **গুণ** (AND) করা থাকে। এটি SOP-এর দ্বৈত রূপ। যেমন <Eq>(A + B)·(A' + C)</Eq>।</P>
        <div className="mt-4"><Facts items={[
          ["A, B', C", "**লিটারেল (Literal)**: একটি চলক বা তার পরিপূরক।", "bg-lilac"],
          ["A + B' + C", "**যোগফল পদ (Sum term)**: এক বা একাধিক লিটারেলের OR।", "bg-sky"],
          ["(A + B)·(A' + C)", "**POS**: যোগফল পদগুলোর AND। প্রতিটি পদ এক-একটি OR গেট।", "bg-mint"],
          ["A + B·C", "**POS নয়**: যোগের ভেতরে গুণ আছে। বণ্টনের দ্বিতীয় নিয়মে (A + B)·(A + C) হয়, সেটি POS।", "bg-peach"],
        ]} /></div>
        <P className="mt-4">**আদর্শ (Canonical) POS:** যে POS-এর প্রতিটি পদে **সবগুলো** চলক আছে (প্রতিটি পদ একটি **ম্যাক্সটার্ম**)। যেমন তিন চলকে <Eq>(A + B + C)·(A + B' + C)</Eq>।</P>
        <P className="mt-3">**কেন POS?** একটি ম্যাক্সটার্ম ঠিক একটি সারিতে 0 হয়। যেসব সারিতে F = 0 সেগুলোর ম্যাক্সটার্ম AND করলে আউটপুট ঠিক ওই সারিগুলোতেই 0 হয়, বাকি সব সারিতে 1। তাই F = 0 এর সারি কম হলে POS ছোট হয়।</P>
      </Panel>

      <Panel title="ম্যাক্সটার্ম (Maxterm)" sub="সব চলক আছে এমন যোগফল পদ, যেটি সারণীর ঠিক একটি সারিতে 0 হয়।">
        <P className="mb-4">**নিয়ম (মিনটার্মের উল্টো):** সারির বিটে **0** থাকলে চলকটি যেমন আছে তেমন লেখো, **1** থাকলে তার পরিপূরক লেখো। তারপর সবগুলো যোগ (+) করো। যেমন সারি <Eq>011</Eq> এর ম্যাক্সটার্ম <Eq>(A + B' + C')</Eq>, সংকেত **M3**।</P>
        <TermTable mode="pos" />
      </Panel>

      <Panel title="সত্যক সারণী থেকে POS কীভাবে বের করবে" sub="একই ফাংশনের জন্য এবার F = 0 সারিগুলো থেকে POS বের হবে।">
        <P className="mb-4">**ধাপ:** ① যেসব সারিতে F = 0 সেগুলো চিহ্নিত করো ② প্রতিটির ম্যাক্সটার্ম লেখো ③ সব ম্যাক্সটার্ম AND করো (আদর্শ POS) ④ সরল করো। সরল করার সহজ উপায়: F = 0 সারি থেকে **F'** এর সরল SOP বের করে ডি-মরগান প্রয়োগ।</P>
        <FormLab mode="pos" />
      </Panel>

      <Panel title="রাশি থেকে আদর্শ POS" sub="কোনো পদে চলক কম থাকলে কীভাবে ম্যাক্সটার্ম পাওয়া যায় দেখো। নিজের রাশিও লিখতে পারো।">
        <FormExpand mode="pos" />
      </Panel>

      <Panel title="POS-এর সার্কিট" sub="POS-ও দুই স্তরের সার্কিট: প্রথমে OR, তারপর AND।">
        <TwoLevel mode="pos" />
      </Panel>

      <Panel title="SOP বনাম POS" sub="দুটিই একই ফাংশন প্রকাশ করে; কোনটি ছোট হবে তা ফাংশনের উপর নির্ভর করে।">
        <div className="overflow-x-auto no-sb rounded-xl ring-1 ring-ink/10">
          <table className="w-full min-w-[26rem] border-collapse bg-surface text-sm">
            <thead><tr className="bg-ink/[.05] text-left"><th className="px-3 py-2">বিষয়</th><th className="px-3 py-2">SOP</th><th className="px-3 py-2">POS</th></tr></thead>
            <tbody>
              {CMP.map(([a, b, c]) => (
                <tr key={a} className="border-t border-ink/[.07]">
                  <td className="px-3 py-2 font-semibold text-ink/70">{a}</td>
                  <td className="num bg-mint/40 px-3 py-2 font-semibold">{b}</td>
                  <td className="num bg-peach/40 px-3 py-2 font-semibold">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P className="mt-4">**মনে রাখার উপায়:** SOP = F-এর **1** খুঁজে **মিনটার্ম (1 → সরাসরি)** OR করো। POS = F-এর **0** খুঁজে **ম্যাক্সটার্ম (0 → সরাসরি)** AND করো। দুই ক্ষেত্রেই মোট সারি 2^[n]টি, তাই <Eq>Σm এর সারি + ΠM এর সারি = 2^n</Eq>।</P>
      </Panel>
    </div>
  );
}
