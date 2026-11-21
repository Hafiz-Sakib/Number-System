import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import TopBar from "./components/TopBar";
import { TabBar } from "./components/TabBar";
import Home from "./sections/Home";
import Convert from "./sections/Convert";
import Calc from "./sections/Calc";
import Practice from "./sections/Practice";
import Learn from "./sections/Learn";
import { ROUTES, navigate, useRoute } from "./lib/router";

const tabs = ROUTES.map((r) => ({ id: r.path, label: r.label, icon: r.icon }));

export default function App() {
  const path = useRoute();
  const reduce = useReducedMotion();
  /* ট্যাব বদলালেও ইনপুট হারায় না, তাই অবস্থা এখানে রাখা */
  const [cv, setCv] = useState({ from: 10, to: 2, value: "25.625" });
  const [ca, setCa] = useState({ base: 2, a: "1011", b: "110", op: "+", method: "direct" });
  const first = useRef(true);

  useEffect(() => { document.title = (ROUTES.find((r) => r.path === path) || ROUTES[0]).title; }, [path]);
  useEffect(() => { if (first.current) { first.current = false; if (location.pathname !== path) history.replaceState(null, "", path); } }, [path]);

  const openConvert = (from, to, value) => { setCv({ from, to, value }); navigate("/convert"); };
  const useInCalc = (base, text) => { setCa((c) => ({ ...c, base, a: text })); navigate("/calc"); };

  const view =
    path === "/convert" ? <Convert s={cv} set={setCv} onUse={useInCalc} />
    : path === "/calc" ? <Calc s={ca} set={setCa} onConvert={openConvert} />
    : path === "/practice" ? <Practice />
    : path === "/learn" ? <Learn />
    : <Home onOpen={openConvert} />;

  return (
    <>
      <TopBar />
      {/* ফোন ও ট্যাবলেট: নিচে motion-brew TabBar; বড় পর্দায় মেনু হেডারে */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <TabBar tabs={tabs} variant="pill" value={path} onChange={navigate} className="pointer-events-auto" />
      </div>
      <main className="min-h-[100svh] pb-[6.5rem] pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pb-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={path} initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {view}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
