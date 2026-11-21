import { useRef } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useFmt } from "../lib/settings";

/* motion-brew শৈলীর ছোট অ্যানিমেটেড টুকরোগুলো (পোর্টফোলিও থেকে নেওয়া, বাংলার জন্য মানিয়ে) */

/* শব্দগুলো হালকা ঝাপসা থেকে উঠে আসে। শব্দ ধরে ভাগ করা হয়, অক্ষর ধরে নয় - তাই বাংলা যুক্তাক্ষর ভাঙে না। */
export function BlurText({ text, className = "", delay = 0, as: Tag = "span" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} aria-hidden className="inline-block whitespace-pre"
          initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(12px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>{w + " "}</motion.span>
      ))}
    </Tag>
  );
}

/* একটি শব্দ আরেকটিতে বদলায় (পুরো শব্দ ধরে, বাংলার জন্য নিরাপদ) */
export function SwapWord({ words, index, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-grid ${className}`} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={words[index]} className="whitespace-nowrap"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "70%", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-70%", filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>{words[index]}</motion.span>
      </AnimatePresence>
    </span>
  );
}

/* সংখ্যার প্রতিটি অঙ্ক আলাদা করে ওপর-নিচ গড়িয়ে বদলায় (শুধু সংখ্যা/হেক্স অক্ষরের জন্য) */
export function DigitRoll({ text, className = "" }) {
  const reduce = useReducedMotion();
  const fmt = useFmt();
  const s = fmt(text);
  const chars = [...s];
  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={s}>
      <AnimatePresence initial={false} mode="popLayout">
        {chars.map((ch, i) => (
          <motion.span key={`${chars.length - i}-${ch}`} aria-hidden className="inline-block whitespace-pre"
            initial={reduce ? { opacity: 0 } : { y: "55%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { y: "-55%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>{ch}</motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

/* কার্সরের দিকে ঝুঁকে পড়ে */
export function Magnetic({ children, strength = 0.3, className = "" }) {
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength); };
  const leave = () => { x.set(0); y.set(0); };
  return <motion.div style={{ x, y }} onMouseMove={move} onMouseLeave={leave} className={`inline-block ${className}`}>{children}</motion.div>;
}

export function Pill({ children, onClick, dark = true, className = "", ...p }) {
  return (
    <Magnetic>
      <button type="button" onClick={onClick} {...p}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition-colors active:scale-[.97] ${dark ? "bg-ink text-paper hover:bg-ink/85" : "bg-surface text-ink shadow-sm ring-1 ring-ink/[.08] hover:bg-surface/70"} ${className}`}>
        {children}
      </button>
    </Magnetic>
  );
}

/* 3ডি-তে কার্সরের দিকে হেলে, আলোর ঝলক ধরে */
export function TiltCard({ children, className = "", max = 5 }) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const gx = useMotionValue(50), gy = useMotionValue(50);
  const glare = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a}% ${b}%, rgb(255 255 255 / var(--glare)), transparent 55%)`);
  const move = (e) => { if (reduce || e.pointerType === "touch") return; const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; ry.set((px - 0.5) * max * 2); rx.set((0.5 - py) * max * 2); gx.set(100 - px * 100); gy.set(100 - py * 100); };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }} className={`relative ${className}`}>
      {children}
      <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity [div:hover>&]:opacity-100" />
    </motion.div>
  );
}

/* স্ক্রলে প্রথমবার দেখা গেলে ভেসে ওঠে */
export function Reveal({ children, className = "", delay = 0, y = 28, as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduce) { const T = as; return <T className={className}>{children}</T>; }
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </M>
  );
}

export function SectionTitle({ title, sub, className = "" }) {
  return (
    <div className={`mb-6 max-w-2xl sm:mb-8 ${className}`}>
      <BlurText as="h1" text={title} className="text-4xl font-extrabold sm:text-5xl" />
      {sub && <Reveal y={14} delay={0.2}><p className="mt-3 text-lg text-ink/60">{sub}</p></Reveal>}
    </div>
  );
}
