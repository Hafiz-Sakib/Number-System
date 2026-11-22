import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { ICONS } from "./TabBar";
import { ROUTES, navigate, useRoute } from "../lib/router";

const FLAG = "pwa-installed";
const standalone = () => typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: minimal-ui)").matches || window.matchMedia("(display-mode: window-controls-overlay)").matches || window.navigator.standalone === true);
const flagged = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };
const remember = () => { try { localStorage.setItem(FLAG, "1"); } catch { /* private mode */ } };

/* ওয়েব ও PWA দুই জায়গাতেই একই হেডার: বামে অ্যাপের নাম, মাঝে মেনু (বড় পর্দায়), ডানে ইনস্টল ও থিম */
export default function TopBar() {
  const path = useRoute();
  const [installed, setInstalled] = useState(() => standalone() || flagged());
  const [hint, setHint] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const done = () => { remember(); setInstalled(true); };
    const offer = () => { try { localStorage.removeItem(FLAG); } catch { /* ignore */ } setInstalled(false); };
    if (standalone()) remember();
    navigator.getInstalledRelatedApps?.().then((a) => a?.length && done()).catch(() => {});
    if (window.__pwaPrompt && !standalone()) offer();
    window.addEventListener("pwa-installed", done);
    window.addEventListener("pwa-ready", offer);
    return () => { window.removeEventListener("pwa-installed", done); window.removeEventListener("pwa-ready", offer); };
  }, []);

  useEffect(() => {
    if (!hint) return;
    const off = (e) => box.current && !box.current.contains(e.target) && setHint(false);
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [hint]);

  const install = async () => {
    const ev = window.__pwaPrompt;
    if (!ev) return setHint((h) => !h);
    ev.prompt();
    try { const r = await ev.userChoice; if (r.outcome === "accepted") { remember(); setInstalled(true); } } catch { /* dismissed */ }
    window.__pwaPrompt = null;
  };
  /* ইনস্টল করা না থাকলে সবসময় দেখাই; ব্রাউজার সরাসরি প্রম্পট না দিলে নিয়ম বলে দিই */
  const showInstall = !installed;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/[.07] bg-mist/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        <a href="/" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navigate("/"); }} aria-label="সংখ্যা পদ্ধতি - হোম" className="flex shrink-0 items-center gap-2.5 transition active:scale-95">
          <img src="/pwa-192.png" alt="" width="34" height="34" className="h-[34px] w-[34px] rounded-xl shadow-sm" />
          <span className="font-display text-lg font-extrabold leading-none">সংখ্যা পদ্ধতি</span>
        </a>

        <nav aria-label="প্রধান মেনু" className="hidden rounded-full bg-surface/80 p-1 ring-1 ring-ink/[.08] lg:block">
          <ul className="flex gap-0.5">
            {ROUTES.map((r) => {
              const Icon = ICONS[r.icon];
              const on = path === r.path;
              return (
                <li key={r.path}>
                  <a href={r.path} title={r.label} aria-label={r.label} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navigate(r.path); }} aria-current={on ? "page" : undefined} className="relative block whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold min-[1400px]:px-3 min-[1400px]:text-[15px]">
                    {on && <motion.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 rounded-full bg-ink" />}
                    <span className={`relative flex items-center gap-1.5 ${on ? "text-paper" : "text-ink/60 hover:text-ink"}`}><Icon className="size-[18px]" strokeWidth={2.1} active={on} /><span className={on ? "" : "hidden min-[1400px]:inline"}>{r.label}</span></span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div ref={box} className="relative flex shrink-0 items-center gap-2">
          {showInstall && (
            <>
              <button type="button" onClick={install} aria-label="অ্যাপ ইনস্টল করুন" title="অ্যাপ ইনস্টল করুন"
                className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-2.5 text-sm font-semibold text-paper shadow-[0_8px_30px_-8px_rgba(20,21,26,.35)] transition hover:bg-ink/85 active:scale-95 sm:px-3.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
                <span className="hidden sm:inline">ইনস্টল</span>
              </button>
              <AnimatePresence>
                {hint && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status" className="absolute right-0 top-11 z-10 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-surface p-4 text-sm leading-relaxed text-ink/70 shadow-[0_12px_40px_-12px_rgba(20,21,26,.3)] ring-1 ring-ink/[.08]">
                    <p className="font-bold text-ink">অ্যাপ ইনস্টল করুন</p>
                    <p className="mt-1">Chrome/Edge: ঠিকানার ঘরের ডানে ইনস্টল আইকন বা মেনু (⋮) থেকে <b>Install app</b>। ফোনে: <b>Add to Home screen</b>। আইফোনে: Share → Add to Home Screen।</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
