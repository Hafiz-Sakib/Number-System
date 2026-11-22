import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { PixelBlast } from "motion-brew/pixel-blast";
import { useDark } from "../theme";

/* Small animated pieces for the Developer page (same as the portfolio's About page).
   The avatar is /public/profile.webp. */

function Blob({ mx, my, f, className }) {
  const x = useTransform(mx, (n) => n * f), y = useTransform(my, (n) => n * f);
  return <motion.span aria-hidden className={`absolute rounded-full blur-2xl ${className}`} style={{ x, y }} />;
}

/** Pastel cover: colour blobs drift toward the cursor with a PixelBlast over them; the avatar overlaps the cover. */
export function ProfileCard({ name, line, place, children, className = "" }) {
  const still = !!useReducedMotion();
  const dark = useDark();
  const mx = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 90, damping: 18 });
  const move = (e) => { if (still) return; const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width - 0.5) * 2); my.set(((e.clientY - r.top) / r.height - 0.5) * 2); };
  const leave = () => { mx.set(0); my.set(0); };
  return (
    <div onMouseMove={move} onMouseLeave={leave} className={`card overflow-hidden p-3 ${className}`}>
      <div className="relative h-40 overflow-hidden rounded-[1.4rem] bg-lilac sm:h-48">
        <Blob mx={mx} my={my} f={22} className="-left-6 -top-10 h-44 w-44 bg-sky" />
        <Blob mx={mx} my={my} f={-30} className="right-0 top-2 h-40 w-40 bg-peach" />
        <Blob mx={mx} my={my} f={40} className="bottom-[-3rem] left-1/3 h-40 w-52 bg-mint" />
        <div className="absolute inset-0">
          <PixelBlast color={dark ? "#b4a8ff" : "#7c6cf6"} cellSize={5} speed={0.8} coverage={1.3} density={0.7} className="h-full min-h-0" />
        </div>
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <img src="/profile.webp" alt={name} width="128" height="128" className="relative z-10 -mt-14 h-28 w-28 rounded-full object-cover object-top shadow-xl ring-4 ring-surface sm:-mt-16 sm:h-32 sm:w-32" />
        <h2 className="mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">{name}</h2>
        {line && <p className="mt-1 text-ink/60">{line}</p>}
        {place && <p className="mt-0.5 text-sm text-ink/45">{place}</p>}
        {children && <div className="mt-5 flex flex-wrap gap-2.5">{children}</div>}
      </div>
    </div>
  );
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Key words are set bold and a violet underline fades in under them when scrolled into view. */
export function HighlightText({ text = "", marks = [], className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const still = !!useReducedMotion();
  const list = marks.filter((m) => m && text.includes(m));
  const parts = list.length ? text.split(new RegExp(`(${list.map(esc).join("|")})`, "g")) : [text];
  let k = 0;
  return (
    <p ref={ref} className={className}>
      {parts.map((p, i) => {
        if (!list.includes(p)) return <span key={i}>{p}</span>;
        const n = k++;
        return (
          <motion.span key={i} className="font-semibold text-ink underline decoration-2 underline-offset-[6px] [box-decoration-break:clone]"
            initial={false} animate={{ textDecorationColor: still || seen ? "rgb(139 92 246 / .85)" : "rgb(139 92 246 / 0)" }} transition={{ duration: 0.6, delay: 0.3 + n * 0.3 }}>{p}</motion.span>
        );
      })}
    </p>
  );
}

/** Odometer: every digit is a 0-9 wheel that rolls to its value when scrolled into view. */
export function Odometer({ to, suffix = "", className = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const still = !!useReducedMotion();
  const text = Number(to).toLocaleString("en-US") + suffix;
  return (
    <span ref={ref} className={`inline-flex tabular-nums leading-[1] ${className}`} aria-label={text} role="img">
      {[...text].map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden className="inline-block h-[1em] leading-[1]">{ch}</span>;
        const d = Number(ch), on = still || seen;
        return (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden leading-[1]">
            <motion.span className="flex flex-col" initial={false} animate={{ y: on ? `${-d * 10}%` : "0%" }} transition={still ? { duration: 0 } : { duration: 1.1 + d * 0.06, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
              {Array.from({ length: 10 }, (_, k) => <span key={k} className="block h-[1em] leading-[1]">{k}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
