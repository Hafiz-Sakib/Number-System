import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFmt } from "../lib/settings";

/* ইঞ্জিনের "ব্লক" গুলো স্ক্রিনে আঁকে: শিরোনাম, অনুচ্ছেদ, টেবিল, কলাম-হিসাব, ভাঁজ-করা বিস্তারিত ইত্যাদি */

const TOKEN = /(\{\{[^}]*\}\}|\[\[[^\]]*\]\]|\*\*[^*]+\*\*|\^\[[^\]]*\]|_\[[^\]]*\])/g;

/* বিট-গ্রুপের আলাদা আলাদা পটভূমি রঙ: পাশাপাশি দুটি গ্রুপ কখনো একই রঙের হয় না (৪টি রঙ ঘুরে ঘুরে আসে) */
const GROUP_BG = ["bg-lilac ring-violet-500/30", "bg-mint ring-emerald-500/30", "bg-peach ring-orange-500/30", "bg-sky ring-sky-500/30"];

/** {{1010|2}} → (1010)₂ , {{25}} → সংখ্যা-ব্যাজ, **মোটা**, 2^[3] → 2³ */
export function Rich({ text, className = "" }) {
  const fmt = useFmt();
  return (
    <span className={className}>
      {String(text).split(TOKEN).map((p, i) => {
        if (p.startsWith("{{")) {
          const [v, b] = p.slice(2, -2).split("|");
          return (
            <span key={i} className="num break-all rounded-md bg-ink/[.06] px-1.5 py-0.5 text-[.95em] font-semibold">
              {b ? <>({fmt(v)})<sub className="text-[.72em] font-bold">{fmt(b)}</sub></> : fmt(v)}
            </span>
          );
        }
        if (p.startsWith("[[")) {
          const [v, n] = p.slice(2, -2).split("|");
          return <span key={i} className={`num mx-[1.5px] inline-block rounded-md px-1.5 py-0.5 text-[.95em] font-semibold text-ink ring-1 ${GROUP_BG[(+n || 0) % GROUP_BG.length]}`}>{fmt(v)}</span>;
        }
        if (p.startsWith("**")) return <b key={i} className="font-bold text-ink">{fmt(p.slice(2, -2))}</b>;
        if (p.startsWith("^[")) return <sup key={i} className="text-[.75em]">{fmt(p.slice(2, -1))}</sup>;
        if (p.startsWith("_[")) return <sub key={i} className="text-[.75em]">{fmt(p.slice(2, -1))}</sub>;
        return <span key={i}>{fmt(p)}</span>;
      })}
    </span>
  );
}

function Tbl({ head, rows, note, hlCol }) {
  return (
    <div className="mt-3">
      <div className="max-w-full overflow-x-auto rounded-2xl ring-1 ring-ink/10">
        <table className="w-full min-w-max text-[15px]">
          <thead>
            <tr className="bg-ink/[.05]">{head.map((h, i) => <th key={i} className="whitespace-nowrap px-3.5 py-2.5 text-left font-semibold text-ink/70"><Rich text={h} /></th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-ink/[.07]">
                {r.map((c, j) => {
                  const o = typeof c === "object" && c !== null;
                  const hl = (o && c.hl) || hlCol === j;
                  return <td key={j} className={`num whitespace-nowrap px-3.5 py-2 ${hl ? "bg-violet-500/10 font-bold" : ""}`}><Rich text={o ? c.x : c} /></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="mt-2 text-sm text-ink/55"><Rich text={note} /></p>}
    </div>
  );
}

/* কলাম ধরে যোগ-বিয়োগ-গুণের ছক (পাঠ্যবইয়ের মতো) */
function Cols({ rows }) {
  const fmt = useFmt();
  const reduce = useReducedMotion();
  const n = Math.max(...rows.filter((r) => r.cells).map((r) => r.cells.length));
  return (
    <div className="mt-3 max-w-full overflow-x-auto rounded-2xl bg-ink/[.04] px-3 py-4 ring-1 ring-ink/10 sm:px-5">
      <div className="mx-auto w-max">
        {rows.map((r, ri) => {
          if (r.kind === "sep") return <div key={ri} className="my-1 ml-12 border-t-2 border-ink/70" />;
          const cells = r.cells || [];
          const pad = n - cells.length;
          return (
            <div key={ri} className="flex items-center">
              <span className={`w-12 shrink-0 pr-2 text-right text-sm ${r.kind === "carry" ? "font-semibold text-violet-600 dark:text-violet-300" : "text-xl font-bold text-ink/60"}`}>{r.label ? <Rich text={r.label} /> : ""}</span>
              {[...Array(Math.max(pad, 0)).fill(""), ...cells].map((c, ci) => (
                <motion.span key={ci}
                  initial={r.kind === "res" && !reduce ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: r.kind === "res" ? (n - ci) * 0.05 : 0, duration: 0.3 }}
                  className={`num grid shrink-0 place-items-center ${c === "." ? "w-3.5" : "w-8 sm:w-9"} ${r.kind === "carry" ? "h-5 text-sm font-semibold text-violet-600 dark:text-violet-300" : r.kind === "res" ? "h-10 text-2xl font-extrabold" : "h-9 text-xl font-semibold"}`}>
                  {fmt(c)}
                </motion.span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Detail({ title, blocks, open: initial = false }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-ink/10">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[15px] font-semibold transition-colors hover:bg-ink/[.04]">
        <motion.svg animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }} viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink/50" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></motion.svg>
        <span className="min-w-0 flex-1"><Rich text={title} /></span>
        <span className="shrink-0 text-xs font-medium text-ink/45">{open ? "লুকান" : "দেখুন"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="px-4 pb-4"><Blocks blocks={blocks} nested /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function One({ b }) {
  switch (b.t) {
    case "h":
      return <h4 className="mt-6 flex items-start gap-2.5 text-lg font-bold first:mt-0"><span aria-hidden className="mt-1.5 h-5 w-1.5 shrink-0 rounded-full bg-violet-500" /><span><Rich text={b.text} /></span></h4>;
    case "p":
      return <p className="mt-2.5 leading-[1.85] text-ink/80"><Rich text={b.text} /></p>;
    case "list":
      return <ol className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink/80">{b.items.map((t, i) => <li key={i} className="rounded-xl bg-ink/[.04] px-3.5 py-2"><Rich text={t} /></li>)}</ol>;
    case "table":
      return <Tbl {...b} />;
    case "cols":
      return <Cols rows={b.rows} />;
    case "box":
      return <div className="mt-3 rounded-2xl bg-lilac px-4 py-3 text-lg font-semibold ring-1 ring-violet-500/20"><Rich text={b.text} /></div>;
    case "warn":
      return <div className="mt-3 rounded-2xl bg-lemon px-4 py-3 text-[15px] ring-1 ring-amber-500/25"><Rich text={b.text} /></div>;
    case "detail":
      return <Detail title={b.title} blocks={b.blocks} open={b.open} />;
    default:
      return null;
  }
}

export function Blocks({ blocks, nested = false }) {
  const reduce = useReducedMotion();
  return (
    <div>
      {blocks.map((b, i) => (
        <motion.div key={i} initial={reduce || nested ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: nested ? 0 : Math.min(i * 0.05, 0.5), ease: [0.22, 1, 0.36, 1] }}>
          <One b={b} />
        </motion.div>
      ))}
    </div>
  );
}
