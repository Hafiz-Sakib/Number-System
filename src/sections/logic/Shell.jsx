import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "../../components/ui";

/* বুলিয়ান এলজেবরা ও লজিক গেট পেজের একই কাঠামো: বামে টপিক তালিকা (ফোনে আড়াআড়ি চিপ), ডানে বিষয়বস্তু। */
export default function TopicPage({ title: pageTitle, sub: pageSub, topics: TOPICS }) {
  const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)); return TOPICS.some((t) => t[0] === h) ? h : TOPICS[0][0]; };
  const [id, setId] = useState(fromHash);
  const nav = useRef(null);
  const idx = TOPICS.findIndex((t) => t[0] === id);
  const [, , title, en, View] = TOPICS[idx];

  useEffect(() => { const on = () => setId(fromHash()); addEventListener("hashchange", on); return () => removeEventListener("hashchange", on); }, []);
  const pick = (k) => { setId(k); history.replaceState(null, "", `#${k}`); window.scrollTo({ top: 0, behavior: "auto" }); };
  // বাছাই করা চিপ স্ক্রল করে দৃশ্যমান রাখি (মোবাইলের আড়াআড়ি তালিকায়)
  useEffect(() => { nav.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }, [id]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title={pageTitle} sub={pageSub} />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="টপিক তালিকা" className="min-w-0 lg:sticky lg:top-24">
          <ol ref={nav} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {TOPICS.map(([k, no, bn, e], i) => {
              const on = k === id;
              return (
                <li key={k} className="shrink-0">
                  <button type="button" aria-current={on} onClick={() => pick(k)} className="relative flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-violet-500/60 lg:rounded-2xl">
                    {on && <motion.span layoutId="logic-topic" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-full bg-ink lg:rounded-2xl" />}
                    <span className={`num relative hidden text-xs font-bold lg:inline ${on ? "text-paper/60" : "text-ink/40"}`}>{no.replace("3.7.", "")}</span>
                    <span className="relative min-w-0">
                      <span className={`block whitespace-nowrap font-semibold ${on ? "text-paper" : "text-ink/75"}`}><span className="num mr-1.5 text-xs opacity-60 lg:hidden">{i + 1}</span>{bn}</span>
                      <span className={`hidden whitespace-nowrap text-xs lg:block ${on ? "text-paper/60" : "text-ink/40"}`}>{e}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0">
          <motion.div key={id} initial={{ opacity: 0.001, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="num rounded-full bg-lilac px-3 py-1 text-sm font-bold ring-1 ring-ink/[.06]">{TOPICS[idx][1]}</span>
              <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
              <span className="text-ink/50">{en}</span>
            </header>
            <View />
          </motion.div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" disabled={idx === 0} onClick={() => pick(TOPICS[idx - 1][0])} className="rounded-full bg-ink/[.07] px-5 py-2.5 font-semibold transition enabled:hover:bg-ink/[.12] enabled:active:scale-95 disabled:opacity-35">← {idx > 0 ? TOPICS[idx - 1][2] : "আগের"}</button>
            <button type="button" disabled={idx === TOPICS.length - 1} onClick={() => pick(TOPICS[idx + 1][0])} className="rounded-full bg-ink px-5 py-2.5 font-semibold text-paper transition enabled:hover:bg-ink/85 enabled:active:scale-95 disabled:opacity-35">{idx < TOPICS.length - 1 ? TOPICS[idx + 1][2] : "পরের"} →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
