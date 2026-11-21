import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TopBar from "./components/TopBar";
import { TabBar } from "./components/TabBar";
import Footer from "./components/Footer";
import Home from "./sections/Home";
import Convert from "./sections/Convert";
import Calc from "./sections/Calc";
import Practice from "./sections/Practice";
import Learn from "./sections/Learn";
import { ROUTES, navigate, useRoute } from "./lib/router";
import { APP_NAME } from "./lib/site";
import Dev from "./sections/Dev";

const tabs = ROUTES.map((r) => ({ id: r.path, label: r.label, icon: r.icon }));

export default function App() {
  const path = useRoute();
  const reduce = useReducedMotion();
  /* ট্যাব বদলালেও ইনপুট হারায় না, তাই অবস্থা এখানে রাখা */
  const [cv, setCv] = useState({ from: 10, to: 2, value: "25.625" });
  const [ca, setCa] = useState({ base: 2, a: "1011", b: "110", more: [], op: "+", method: "direct" });
  const first = useRef(true);

  /* শিরোনাম সবসময় একই: ওয়েব ও PWA দুই জায়গাতেই "সংখ্যা পদ্ধতি", পেজ বদলালেও বদলায় না */
  useEffect(() => { if (document.title !== APP_NAME) document.title = APP_NAME; }, [path]);
  useEffect(() => { if (first.current) { first.current = false; if (location.pathname !== path) history.replaceState(null, "", path); } }, [path]);

  const openConvert = (from, to, value) => { setCv({ from, to, value }); navigate("/convert"); };
  const useInCalc = (base, text) => { setCa((c) => ({ ...c, base, a: text })); navigate("/calc"); };

  const view =
    path === "/convert" ? <Convert s={cv} set={setCv} onUse={useInCalc} />
    : path === "/calc" ? <Calc s={ca} set={setCa} onConvert={openConvert} />
    : path === "/practice" ? <Practice />
    : path === "/learn" ? <Learn />
    : path === "/dev" ? <Dev />
    : <Home onOpen={openConvert} />;

  return (
    <>
      <TopBar />
      {/* ফোন ও ট্যাবলেট: নিচে motion-brew TabBar; বড় পর্দায় মেনু হেডারে */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <TabBar tabs={tabs} variant="pill" value={path} onChange={navigate} className="pointer-events-auto" />
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
