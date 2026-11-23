/**
 * TabBar, from https://motion-brew.com/components/tab-bar
 *
 * Ported to plain JSX for this Vite + Tailwind v3 project (framer-motion, no clsx/tailwind-merge).
 * Only the "pill" look is kept: the open tab grows a label, a tap bounces the tab, plays its icon and sends a ripple.
 */
import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useAnimation, useInView, useReducedMotion } from "framer-motion";

const cn = (...a) => a.filter(Boolean).join(" ");

/* ---------- animated icons (play while `active`) ---------- */
function useIcon(active) {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  React.useEffect(() => {
    if (reduced) return;
    controls.start(active ? "animate" : "normal");
  }, [active, reduced, controls]);
  return controls;
}

const Shell = ({ className, children, strokeWidth = 2, motionProps }) => {
  const Svg = motionProps ? motion.svg : "svg";
  return (
    <span className={cn("inline-grid size-6 shrink-0 place-items-center align-middle [&>svg]:size-full", className)}>
      <Svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...motionProps}>
        {children}
      </Svg>
    </span>
  );
};

function HomeIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <motion.path animate={c} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" transition={{ duration: 0.6, opacity: { duration: 0.2 } }}
        variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1] } }} />
    </Shell>
  );
}

/* রূপান্তর: দুই তীর উল্টো দিকে সরে */
function ConvertIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <motion.g animate={c} transition={{ duration: 0.5, ease: "easeInOut" }} variants={{ normal: { x: 0 }, animate: { x: [0, -3, 0] } }}><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /></motion.g>
      <motion.g animate={c} transition={{ duration: 0.5, ease: "easeInOut" }} variants={{ normal: { x: 0 }, animate: { x: [0, 3, 0] } }}><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></motion.g>
    </Shell>
  );
}

/* হিসাব: ক্যালকুলেটরের বোতামগুলো জ্বলে ওঠে */
function CalcIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  const dots = ["M16 10h.01", "M12 10h.01", "M8 10h.01", "M12 14h.01", "M8 14h.01", "M12 18h.01", "M8 18h.01"];
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      {dots.map((d, i) => (
        <motion.path key={d} d={d} animate={c} transition={{ duration: 0.5, delay: i * 0.05 }} variants={{ normal: { opacity: 1, scale: 1 }, animate: { opacity: [1, 0.15, 1], scale: [1, 1.5, 1] } }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      ))}
    </Shell>
  );
}

/* ডেভ পেজ: </> কোড আইকন, ট্যাপে দুই বন্ধনী বাইরের দিকে সরে (পোর্টফোলিওর Projects আইকন) */
function DevIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <motion.path animate={c} d="m18 16 4-4-4-4" transition={{ duration: 0.5, ease: "easeInOut" }} variants={{ normal: { x: 0 }, animate: { x: [0, 3, 0] } }} />
      <motion.path animate={c} d="m6 8-4 4 4 4" transition={{ duration: 0.5, ease: "easeInOut" }} variants={{ normal: { x: 0 }, animate: { x: [0, -3, 0] } }} />
      <path d="m14.5 4-5 16" />
    </Shell>
  );
}

/* লজিক: AND গেটের প্রতীক; সক্রিয় হলে ইনপুট দুটি আগে-পরে আঁকা হয় */
function LogicIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <path d="M7 4h5a8 8 0 0 1 0 16H7Z" />
      <motion.path animate={c} d="M2 9h5" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0.3, 1] } }} transition={{ duration: 0.4 }} />
      <motion.path animate={c} d="M2 15h5" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0.3, 1] } }} transition={{ duration: 0.4, delay: 0.12 }} />
      <motion.path animate={c} d="M20 12h2" variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { pathLength: [0, 1], opacity: [0.3, 1] } }} transition={{ duration: 0.3, delay: 0.3 }} />
    </Shell>
  );
}


/* পরিপূরক: অর্ধেক ভরা বৃত্ত, ট্যাপে উল্টে যায় (বিট উল্টানো = 1's কমপ্লিমেন্ট) */
function ComplementIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="10" />
      <motion.path animate={c} d="M12 18a6 6 0 0 0 0-12v12z" transition={{ duration: 0.6, ease: "easeInOut" }} variants={{ normal: { rotate: 0 }, animate: { rotate: [0, 180] } }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
    </Shell>
  );
}

/* বুলিয়ান এলজেবরা: সিগমা (Σ) চিহ্ন, সক্রিয় হলে নতুন করে আঁকা হয় */
function AlgebraIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      <motion.path animate={c} d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" transition={{ duration: 0.7, opacity: { duration: 0.2 } }}
        variants={{ normal: { pathLength: 1, opacity: 1 }, animate: { opacity: [0, 1], pathLength: [0, 1] } }} />
    </Shell>
  );
}

/* আরও: চার ঘরের গ্রিড, ট্যাপে ঘরগুলো একে একে স্পন্দিত হয় */
function MoreIcon({ active, className, strokeWidth }) {
  const c = useIcon(active);
  const sq = [[3, 3], [14, 3], [14, 14], [3, 14]];
  return (
    <Shell className={className} strokeWidth={strokeWidth}>
      {sq.map(([x, y], i) => (
        <motion.rect key={i} width="7" height="7" x={x} y={y} rx="1" animate={c} transition={{ duration: 0.45, delay: i * 0.07 }} variants={{ normal: { scale: 1 }, animate: { scale: [1, 0.7, 1] } }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      ))}
    </Shell>
  );
}

export const ICONS = { home: HomeIcon, convert: ConvertIcon, calc: CalcIcon, complement: ComplementIcon, algebra: AlgebraIcon, gates: LogicIcon, dev: DevIcon, more: MoreIcon };

const GLIDE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 500, damping: 34 };

/** tabs: [{ id, label, icon: key of ICONS }] (up to 7) */
export const TabBar = React.forwardRef(function TabBar({ tabs = [], value, onChange, onReselect, className }, ref) {
  const still = !!useReducedMotion();
  const uid = React.useId();
  const root = React.useRef(null);
  React.useImperativeHandle(ref, () => root.current);
  const seen = useInView(root, { once: true, amount: 0.4 });
  const shown = seen || still;
  const list = tabs.slice(0, 7);
  const crowded = list.length > 5;
  const packed = list.length > 6;
  const [own, setOwn] = React.useState(list[0]?.id ?? "");
  const current = value ?? own;
  const [playing, setPlaying] = React.useState(null);
  const [taps, setTaps] = React.useState({});
  const timer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const choose = (id) => {
    setTaps((t) => ({ ...t, [id]: (t[id] ?? 0) + 1 }));
    setPlaying(id);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPlaying(null), 900);
    if (id === current) { onReselect?.(id); return; }
    if (value === undefined) setOwn(id);
    onChange?.(id);
  };

  const onKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const buttons = Array.from(root.current?.querySelectorAll("[data-tab]") ?? []);
    const at = buttons.indexOf(document.activeElement);
    if (at < 0) return;
    e.preventDefault();
    buttons[(at + (e.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length]?.focus();
  };

  const tab = (t, i) => {
    const on = t.id === current;
    const Icon = ICONS[t.icon] || HomeIcon;
    const ripple = taps[t.id] ?? 0;
    return (
      <motion.button
        key={t.id}
        type="button"
        data-tab=""
        layout={still ? false : "position"}
        aria-label={t.label}
        aria-current={on ? "page" : undefined}
        onClick={() => choose(t.id)}
        initial={still ? false : { opacity: 0, y: 12 }}
        animate={shown ? { opacity: 1, y: 0 } : undefined}
        whileTap={still ? undefined : { scale: 0.88 }}
        transition={{ ...SPRING, opacity: { duration: 0.4, delay: still ? 0 : 0.15 + i * 0.05 }, y: { ...SPRING, delay: still ? 0 : 0.15 + i * 0.05 } }}
        className={cn(
          "group relative flex h-12 cursor-pointer select-none items-center justify-center rounded-full outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-ink/30",
          on ? "gap-1.5 pl-3 pr-4 min-[380px]:gap-2 min-[380px]:pl-4 min-[380px]:pr-5" : packed ? "w-8 min-[360px]:w-9 min-[400px]:w-10" : crowded ? "w-9 min-[360px]:w-10 min-[400px]:w-12" : "w-12",
        )}
      >
        {on && <motion.span layoutId={`${uid}-pill`} transition={still ? { duration: 0 } : SPRING} className="absolute inset-0 rounded-full bg-ink/[0.07]" />}
        {!on && <span aria-hidden className="absolute inset-0 rounded-full bg-ink/[0.05] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />}

        <span className="relative grid place-items-center">
          <AnimatePresence>
            {!still && ripple > 0 && (
              <motion.span key={ripple} aria-hidden initial={{ scale: 0.4, opacity: 0.45 }} animate={{ scale: 2.2, opacity: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: GLIDE }} className="absolute size-8 rounded-full bg-ink/15" />
            )}
          </AnimatePresence>
          <motion.span className={cn("relative grid transition-colors duration-300", on ? "text-ink" : "text-ink/40 group-hover:text-ink/70")}>
            <motion.span key={ripple} className="grid" initial={ripple > 0 && !still ? { scale: 0.7, rotate: -14 } : false} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 11 }}>
              <Icon className="size-[22px]" strokeWidth={on ? 2.25 : 2} active={playing === t.id} />
            </motion.span>
          </motion.span>
        </span>

        <AnimatePresence initial={false} mode="popLayout">
          {on && (
            <motion.span key="label" initial={still ? { opacity: 0 } : { opacity: 0, x: -6, filter: "blur(3px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.3, ease: GLIDE, delay: still ? 0 : 0.06 }}
              className="relative whitespace-nowrap text-[13px] font-medium text-ink min-[380px]:text-[14px]">
              {t.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <motion.nav
      ref={root}
      aria-label="প্রধান মেনু"
      onKeyDown={onKeyDown}
      initial={still ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={shown ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, ease: GLIDE }}
      className={cn("relative w-[380px] max-w-full rounded-full bg-surface p-2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-ink/[.07]", className)}
    >
      <LayoutGroup id={uid}>
        <div className="flex items-center justify-between px-1">{list.map(tab)}</div>
      </LayoutGroup>
    </motion.nav>
  );
});
