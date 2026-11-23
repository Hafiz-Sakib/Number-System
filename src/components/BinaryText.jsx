/**
 * BinaryText, from https://motion-brew.com/components/binary-text (MIT, Md Eftakher)
 *
 * Ported to plain JSX for this Vite + Tailwind v3 project: framer-motion (already installed) instead of motion/react,
 * and the project's own cn() helper. The text scrambles into 0s and 1s, then decodes left to right.
 * It plays once when it scrolls into view and again on every hover or focus. Screen readers only get the real text.
 *
 * Props: text, duration (seconds for the full decode), charset (characters used while scrambling), as, className.
 */
import * as React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "../lib/cn";

export const BinaryText = React.forwardRef(function BinaryText({ text = "Access granted", duration = 1.1, charset = "01", as: Tag = "p", className }, forwardedRef) {
  const ref = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => ref.current);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const still = useReducedMotion();
  const [shown, setShown] = React.useState(text);
  const run = React.useRef(null);

  const play = React.useCallback(() => {
    if (still) return;
    run.current?.stop();
    const chars = Array.from(text);
    run.current = animate(0, chars.length, {
      duration,
      ease: "linear",
      onUpdate: (p) => setShown(chars.map((ch, i) => (ch === " " || i < Math.floor(p) ? ch : charset[Math.floor(Math.random() * charset.length)])).join("")),
      onComplete: () => setShown(text),
    });
  }, [text, duration, charset, still]);

  React.useEffect(() => { if (inView) play(); }, [inView, play]);
  React.useEffect(() => () => run.current?.stop(), []);

  return (
    <Tag ref={ref} aria-label={text} tabIndex={0} onPointerEnter={play} onFocus={play} className={cn("cursor-default whitespace-pre font-mono tabular-nums outline-none", className)}>
      <span aria-hidden>{shown}</span>
    </Tag>
  );
});
