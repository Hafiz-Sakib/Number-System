/* উদাহরণ জেনারেটর — প্রতিটি সংখ্যা পদ্ধতির জন্য বৈচিত্র্যময় র‍্যান্ডম সংখ্যা তৈরি করে।
   অন্য পাতায়ও এই ফাইল থেকেই ব্যবহার করা যাবে। */

const DIGITS = "0123456789ABCDEF";
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* পূর্ণসংখ্যা অংশের অঙ্ক-সংখ্যার পরিসর (পদ্ধতি অনুযায়ী) */
const INT_LEN = { 2: [3, 12], 8: [2, 6], 10: [1, 7], 16: [2, 6] };
/* ভগ্নাংশ অংশের অঙ্ক-সংখ্যার পরিসর */
const FRAC_LEN = { 2: [1, 5], 8: [1, 3], 10: [1, 3], 16: [1, 3] };

/* প্রোফাইল: কেমন ধরনের উদাহরণ হবে (ওজন সহ) */
const PROFILES = [
  { id: "short", w: 2, frac: false, len: "short", label: "ছোট পূর্ণসংখ্যা" },
  { id: "mid", w: 3, frac: false, len: "mid", label: "মাঝারি পূর্ণসংখ্যা" },
  { id: "long", w: 2, frac: false, len: "long", label: "বড় পূর্ণসংখ্যা" },
  { id: "fracShort", w: 2, frac: true, len: "short", label: "ছোট ভগ্নাংশসহ" },
  { id: "fracMid", w: 3, frac: true, len: "mid", label: "দশমিকসহ" },
  { id: "fracLong", w: 1, frac: true, len: "long", label: "বড় ভগ্নাংশসহ" },
  { id: "fracOnly", w: 1, frac: true, len: "zero", label: "শুধু ভগ্নাংশ (০ . …)" },
  { id: "neg", w: 1, frac: null, len: "mid", label: "ঋণাত্মক সংখ্যা", neg: true },
];

function weighted(list, skipId) {
  const pool = list.filter((p) => p.id !== skipId);
  const total = pool.reduce((s, p) => s + p.w, 0);
  let r = Math.random() * total;
  for (const p of pool) { if ((r -= p.w) < 0) return p; }
  return pool[0];
}

function intLength(base, kind) {
  const [lo, hi] = INT_LEN[base];
  const span = hi - lo;
  if (kind === "short") return ri(lo, lo + Math.floor(span / 3));
  if (kind === "mid") return ri(lo + Math.floor(span / 3), lo + Math.ceil((2 * span) / 3));
  if (kind === "long") return ri(lo + Math.ceil((2 * span) / 3), hi);
  return 1;
}

function randInt(base, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += DIGITS[ri(i === 0 && len > 1 ? 1 : 0, base - 1)];
  return s;
}

/* ভগ্নাংশ: শেষ অঙ্ক কখনো 0 হবে না */
function randFrac(base, len) {
  let s = "";
  for (let i = 0; i < len; i++) s += DIGITS[ri(0, base - 1)];
  if (s.endsWith("0")) s = s.slice(0, -1) + DIGITS[ri(1, base - 1)];
  return s;
}

/* ডেসিমাল ভগ্নাংশ: বেশিরভাগ সময় k/2^m (যাতে বাইনারি/অক্টাল/হেক্সে সসীম হয়), মাঝে মাঝে সাধারণ দশমিক */
function decFrac(kindLen) {
  if (Math.random() < 0.2) {
    const n = ri(1, kindLen === "long" ? 3 : 2);
    return randFrac(10, n);
  }
  const m = kindLen === "short" ? ri(1, 2) : kindLen === "mid" ? ri(2, 3) : ri(3, 5);
  const k = ri(0, 1) ? 2 * ri(0, 2 ** (m - 1) - 1) + 1 : 1; // বিজোড় লবে ভগ্নাংশ অনিবার্য
  const num = k % 2 === 0 ? k + 1 : k;
  const den = 2 ** m;
  let digits = String((num % den) * 5 ** m); // (num/2^m) = num*5^m / 10^m
  digits = digits.padStart(m, "0").replace(/0+$/, "");
  return digits || "5";
}

let last = { profile: null, value: null };

/* মূল ফাংশন: { value, label } ফেরত দেয় */
export function genNumberExample(base) {
  for (let tries = 0; tries < 10; tries++) {
    const p = weighted(PROFILES, last.profile);
    const withFrac = p.frac === null ? Math.random() < 0.5 : p.frac;
    const intPart = p.len === "zero" ? "0" : randInt(base, intLength(base, p.len));
    let value = intPart;
    if (withFrac) {
      const fr = base === 10
        ? decFrac(p.len === "zero" ? "mid" : p.len)
        : randFrac(base, ri(FRAC_LEN[base][0], p.len === "short" ? Math.min(2, FRAC_LEN[base][1]) : FRAC_LEN[base][1]));
      value += "." + fr;
    }
    if (p.neg) value = "-" + value;
    if (value !== last.value) {
      last = { profile: p.id, value };
      return { value, label: p.label };
    }
  }
  return { value: randInt(base, 4), label: "পূর্ণসংখ্যা" };
}

/* রূপান্তরের জন্য: নির্বাচিত 'থেকে' পদ্ধতির উদাহরণ */
export function genConvertExample(fromBase) {
  return genNumberExample(fromBase);
}
