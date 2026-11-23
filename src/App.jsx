import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TopBar from "./components/TopBar";
import { TabBar } from "./components/TabBar";
import Footer from "./components/Footer";
import Home from "./sections/Home";
import Convert from "./sections/Convert";
import Calc from "./sections/Calc";
import Complement from "./sections/Complement";
import { NOT_FOUND, ROUTES, navigate, useRoute } from "./lib/router";
import { ICONS } from "./components/TabBar";
import { AnimatePresence } from "framer-motion";
import { APP_NAME } from "./lib/site";

/* বুলিয়ান ও লজিক গেট পেজ ভারী (সার্কিট ও 3D), তাই আলাদা চাঙ্কে; অ্যাপ খোলার পর অলস সময়ে আগেই নামিয়ে রাখি */
const Loading = () => <div className="grid min-h-[60svh] place-items-center text-ink/50">লোড হচ্ছে…</div>;

const loadAlgebra = () => import("./sections/BooleanAlgebra");
const loadGates = () => import("./sections/LogicGates");
const Algebra = lazy(loadAlgebra);
const Gates = lazy(loadGates);
/* Developer page (three.js globe, motion-brew) is loaded only when opened */
const Dev = lazy(() => import("./sections/Dev"));
const NotFound = lazy(() => import("./sections/NotFound"));
if (typeof window !== "undefined") (window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(() => { loadAlgebra(); loadGates(); });

/* ফোন-ট্যাবলেটের নিচের বারে ৪টি প্রধান পেজ + "আরও"; বাকি পেজ আরও-র শিটে। বড় পর্দায় সব মেনু হেডারে। */
const PRIMARY = ["/", "/convert", "/calc", "/complement"];
const byPath = Object.fromEntries(ROUTES.map((r) => [r.path, r]));

function MoreSheet({ open, onClose, path }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [open, onClose]);
  const rest = ROUTES.filter((r) => !PRIMARY.includes(r.path));
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="more" className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <button type="button" aria-label="বন্ধ করো" onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <motion.div role="dialog" aria-label="আরও পেজ" initial={reduce ? false : { y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }} transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-2 bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.75rem))] mx-auto max-w-[380px] rounded-3xl bg-surface p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,.45)] ring-1 ring-ink/[.08]">
            <p className="px-2 pb-2 pt-1 text-sm font-bold text-ink/55">আরও পেজ</p>
            <ul className="grid gap-1">
              {rest.map((r) => {
                const Icon = ICONS[r.icon];
                const on = r.path === path;
                return (
                  <li key={r.path}>
                    <button type="button" aria-current={on ? "page" : undefined} onClick={() => { onClose(); navigate(r.path); }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition active:scale-[.98] ${on ? "bg-ink text-paper" : "hover:bg-ink/[.06]"}`}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? "bg-paper/15" : "bg-ink/[.06]"}`}><Icon className="size-[22px]" strokeWidth={2.1} active={on} /></span>
                      <span className="min-w-0"><span className="block font-bold leading-tight">{r.label}</span>{r.sub && <span className={`block text-[13px] ${on ? "text-paper/65" : "text-ink/50"}`}>{r.sub}</span>}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const path = useRoute();
  const reduce = useReducedMotion();
  /* ট্যাব বদলালেও ইনপুট হারায় না, তাই অবস্থা এখানে রাখা */
  const [cv, setCv] = useState({ from: 10, to: 2, value: "25.625" });
  const [ca, setCa] = useState({ base: 2, a: "1011", b: "110", more: [], op: "+", method: "direct" });
  const first = useRef(true);
  const [more, setMore] = useState(false);
  useEffect(() => { setMore(false); }, [path]);

  /* শিরোনাম সবসময় একই: ওয়েব ও PWA দুই জায়গাতেই "সংখ্যা পদ্ধতি", পেজ বদলালেও বদলায় না */
  useEffect(() => { if (document.title !== APP_NAME) document.title = APP_NAME; }, [path]);
  useEffect(() => { if (first.current) { first.current = false; if (path !== NOT_FOUND && location.pathname !== path) history.replaceState(null, "", path); } }, [path]);
  /* ৪০৪ ঠিকানা সার্চ ইঞ্জিনে জমা হওয়া ঠিক নয় */
  useEffect(() => {
    if (path !== NOT_FOUND) return undefined;
    const m = document.createElement("meta"); m.name = "robots"; m.content = "noindex"; document.head.appendChild(m);
    return () => m.remove();
  }, [path]);

  const openConvert = (from, to, value) => { setCv({ from, to, value }); navigate("/convert"); };
  const useInCalc = (base, text) => { setCa((c) => ({ ...c, base, a: text })); navigate("/calc"); };

  const inPrimary = PRIMARY.includes(path);
  /* খোলা পেজ প্রধান ৪টির বাইরে হলে পঞ্চম ট্যাবটি সেই পেজের নাম-আইকন দেখায় */
  const mobileTabs = [...PRIMARY.map((p) => ({ id: p, label: byPath[p].label, icon: byPath[p].icon })), inPrimary ? { id: "more", label: "আরও", icon: "more" } : { id: "more", label: byPath[path]?.label ?? "আরও", icon: byPath[path]?.icon ?? "more" }];

  const view =
    path === "/convert" ? <Convert s={cv} set={setCv} onUse={useInCalc} />
    : path === "/calc" ? <Calc s={ca} set={setCa} onConvert={openConvert} />
    : path === "/complement" ? <Complement onUse={useInCalc} />
    : path === "/algebra" ? <Suspense fallback={<Loading />}><Algebra /></Suspense>
    : path === "/gates" ? <Suspense fallback={<Loading />}><Gates /></Suspense>
    : path === "/dev" ? <Suspense fallback={<Loading />}><Dev /></Suspense>
    : path === NOT_FOUND ? <Suspense fallback={<Loading />}><NotFound /></Suspense>
    : <Home onOpen={openConvert} />;

  return (
    <>
      <TopBar />
      <MoreSheet open={more} onClose={() => setMore(false)} path={path} />
      {/* ফোন ও ট্যাবলেট: নিচে motion-brew TabBar; বড় পর্দায় মেনু হেডারে */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <TabBar tabs={mobileTabs} value={inPrimary ? path : "more"} onChange={(id) => (id === "more" ? setMore(true) : navigate(id))} onReselect={(id) => id === "more" && setMore(true)} className="pointer-events-auto" />
      </div>
      <main className="min-h-[100svh] pt-[calc(3.5rem+env(safe-area-inset-top))]">
        {/* কোনো "wait" বা ব্লার নেই: নতুন পেজ সাথে সাথে বসে, শুধু হালকা ফেড-ইন। তাই ট্যাব বদলে কখনো সাদা পর্দা থাকে না। */}
        <motion.div key={path} initial={reduce ? false : { opacity: 0.001, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
          {view}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
