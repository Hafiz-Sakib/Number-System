/* AnnotationText, from Motion Brew (https://motion-brew.com/components/annotation-text).
   Installed as a single file: hand-drawn pen marks (underline, circle, box, strike) draw themselves around a word
   when it scrolls into view. Chain several marks with `delay`. Reduced motion shows the marks already drawn.
   Needs: motion, clsx, tailwind-merge (via @/lib/cn). */
import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/* a small deterministic wobble so the stroke reads as drawn, not ruled */
const jitter = (n) => Math.sin(n * 12.9898) * 1.6;

function markPath(type, w, h) {
  switch (type) {
    case "underline":
      return `M -2 ${h + 2 + jitter(1)} Q ${w / 2} ${h + 5 + jitter(2)} ${w + 3} ${h + 1 + jitter(3)}`;
    case "strike":
      return `M -3 ${h * 0.55 + jitter(4)} Q ${w / 2} ${h * 0.5 + jitter(5)} ${w + 3} ${h * 0.52 + jitter(6)}`;
    case "box":
      return `M -5 ${-3 + jitter(7)} L ${w + 5} ${-4 + jitter(8)} L ${w + 4 + jitter(9)} ${h + 4} L ${-4} ${h + 3 + jitter(10)} Z`;
    case "circle": {
      const cx = w / 2;
      const cy = h / 2;
      const rx = w / 2 + 7;
      const ry = h / 2 + 4;
      const pts = [];
      for (let k = 0; k <= 26; k++) {
        const t = (k / 24) * Math.PI * 2 - Math.PI / 1.6;
        const wob = 1 + jitter(k + 11) * 0.02;
        pts.push(`${(cx + Math.cos(t) * rx * wob).toFixed(1)} ${(cy + Math.sin(t) * ry * wob).toFixed(1)}`);
      }
      return `M ${pts.join(" L ")}`;
    }
    default:
      return "";
  }
}

/**
 * <AnnotationText type="circle" color="#e5484d" duration={1.6} delay={0}>word</AnnotationText>
 * type: "underline" | "circle" | "box" | "strike" (default "underline")
 */
export function AnnotationText({ children, type = "underline", color = "#e5484d", strokeWidth = 2.5, delay = 0, duration = 0.7, className }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const still = useReducedMotion();
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} className={cn("relative inline-block whitespace-nowrap", className)}>
      {box.w > 0 && (
        <svg aria-hidden className="pointer-events-none absolute left-0 top-0 overflow-visible" width={box.w} height={box.h}>
          <motion.path
            d={markPath(type, box.w, box.h)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={still ? false : { pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ pathLength: { duration, ease: [0.65, 0, 0.35, 1], delay }, opacity: { duration: 0.01, delay } }}
          />
        </svg>
      )}
      <span className="relative">{children}</span>
    </span>
  );
}
