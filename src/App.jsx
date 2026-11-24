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
import { APP_NAME } from "./lib/site";
import ScrollProgress from "./components/ScrollProgress";
import { useAutoReveal } from "./lib/autoReveal";

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

/* ফোন-ট্যাবলেটের নিচের বারে সব পেজ এক লাইনে ("আরও" নেই); জায়গা কম, তাই লম্বা নামের ছোট রূপ। বড় পর্দায় সব মেনু হেডারে। */
const SHORT = { "/algebra": "এলজেবরা", "/gates": "লজিক", "/dev": "ডেভ" };

export default function App() {
  const path = useRoute();
  const reduce = useReducedMotion();
  /* ট্যাব বদলালেও ইনপুট হারায় না, তাই অবস্থা এখানে রাখা */
  const [cv, setCv] = useState({ from: 10, to: 2, value: "25.625" });
  const [ca, setCa] = useState({ base: 2, a: "1011", b: "110", more: [], op: "+", method: "direct" });
  const first = useRef(true);
  useAutoReveal(path);

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

  const mobileTabs = ROUTES.map((r) => ({ id: r.path, label: SHORT[r.path] ?? r.label, icon: r.icon }));

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
      <ScrollProgress />
      {/* ফোন ও ট্যাবলেট: নিচে motion-brew TabBar (সব পেজ এক লাইনে); বড় পর্দায় মেনু হেডারে */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[380px]:px-3 lg:hidden">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[max(0.75rem,env(safe-area-inset-bottom))] bg-mist" />
        <TabBar tabs={mobileTabs} value={path} onChange={(id) => navigate(id)} className="pointer-events-auto" />
      </div>
      <main className="min-h-[100svh] pt-[calc(3.5rem+env(safe-area-inset-top))]">
        {/* কোনো "wait" বা ব্লার নেই: নতুন পেজ সাথে সাথে বসে, শুধু হালকা ফেড-ইন। তাই ট্যাব বদলে কখনো সাদা পর্দা থাকে না। */}
        <motion.div key={path} data-page="" initial={reduce ? false : { opacity: 0.001, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
          {view}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
