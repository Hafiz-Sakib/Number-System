import { useSyncExternalStore } from "react";

/* ছোট গ্লোবাল সেটিং: ভগ্নাংশে কয় ঘর পর্যন্ত যাবে (localStorage-এ জমা থাকে)। সংখ্যা সবসময় ইংরেজি অঙ্কে দেখানো হয়। */
const mk = (key, initial, parse, ser) => {
  let v = initial;
  try { const s = localStorage.getItem(key); if (s !== null) v = parse(s); } catch { /* private mode */ }
  const ls = new Set();
  const set = (n) => { v = n; try { localStorage.setItem(key, ser(n)); } catch { /* ignore */ } ls.forEach((l) => l()); };
  const sub = (cb) => { ls.add(cb); return () => ls.delete(cb); };
  return { get: () => v, set, sub };
};

const prec = mk("precision", 8, (s) => ([4, 6, 8, 12].includes(+s) ? +s : 8), String);
export const usePrecision = () => [useSyncExternalStore(prec.sub, prec.get, () => 8), prec.set];
export const PRECISIONS = [4, 6, 8, 12];

/** সংখ্যা যেমন আছে তেমনই দেখায় (ইংরেজি অঙ্ক)। */
export const useFmt = () => (s) => String(s);
