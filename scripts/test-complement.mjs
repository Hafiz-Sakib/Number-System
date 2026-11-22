import { complements, parseBits, signedForms, signedTable } from "../src/lib/complement.js";

let pass = 0, fail = 0;
const chk = (c, m) => { if (c) pass++; else { fail++; console.error("FAIL:", m); } };
const t = (i, f, o, w) => { const r = complements(i, f); const O = r.ones.int + "." + r.ones.frac, W = r.twos.int + "." + r.twos.frac; chk(O === o && W === w, `${i}.${f} → ${O} / ${W} (চাই ${o} / ${w})`); };

t("1011", "01", "0100.10", "0100.11");
t("0110", "10", "1001.01", "1001.10");
t("1000", "", "0111.", "1000.");
t("10110", "100", "01001.011", "01001.100");
t("0", "0", "1.1", "0.0");

/* সব 8-বিট প্যাটার্নে: 2's = (2^8 − x) mod 2^8 এবং 1's = 2's − 1 (mod 2^8) */
for (let x = 0; x < 256; x++) {
  const b = x.toString(2).padStart(8, "0"), r = complements(b, "");
  chk(parseInt(r.twos.int, 2) === (256 - x) % 256, `2's of ${b}`);
  chk(parseInt(r.ones.int, 2) === 255 - x, `1's of ${b}`);
}
/* দশমিকসহ: 5 পূর্ণ বিট + 3 ভগ্নাংশ বিট, মান x/8 */
for (let x = 0; x < 256; x++) {
  const b = x.toString(2).padStart(8, "0"), r = complements(b.slice(0, 5), b.slice(5));
  chk(parseInt(r.twos.int + r.twos.frac, 2) === (256 - x) % 256, `2's of ${b.slice(0, 5)}.${b.slice(5)}`);
}

chk(!parseBits("102").ok && !parseBits("-101").ok && !parseBits("").ok && !parseBits(".").ok && parseBits("1.1").ok && parseBits("১০১.১").ok, "parseBits");
const s = signedForms(-5, 8);
chk(s.sm === "10000101" && s.ones === "11111010" && s.twos === "11111011", "-5 in 8 bit");
chk(signedForms(-8, 4).twos === "1000" && signedForms(-8, 4).ones === null && !signedForms(9, 4).ok && !signedForms(-9, 4).ok && !signedForms(1.5, 4).ok, "limits");
chk(signedForms(5, 4).twos === "0101" && signedForms(0, 4).twos === "0000", "positive");
for (let d = -127; d <= 127; d++) { const f = signedForms(d, 8); chk(f.ok && f.twos === ((256 + d) % 256).toString(2).padStart(8, "0"), `2's ${d}`); }
const tb = signedTable(4);
chk(tb.length === 16 && tb[15][3] === "−1" && tb[8][3] === "−8" && tb[8][1] === "−0" && tb[15][2] === "−0", "table");

/* "কেন লাগে" অংশের উদাহরণগুলো */
{
  const c = (b) => complements(b, "");
  chk(c("10110011").ones.int === "01001100" && c("10110011").twos.int === "01001101" && c("01001101").twos.int === "10110011", "why 8-bit");
  chk(parseInt("10110011", 2) + parseInt("01001100", 2) === 255, "why sum 255");
  chk(c("1001").twos.int === "0111" && c("0111").twos.int === "1001", "why 4-bit");
  chk(c("00011001").twos.int === "11100111" && ((50 + parseInt("11100111", 2)) & 255) === 25 && ((50 + parseInt("11100111", 2)) >> 8) === 1, "why 50-25");
  chk(c("00110010").twos.int === "11001110" && (25 + parseInt("11001110", 2)) === parseInt("11100111", 2), "why 25-50");
  chk(c("11100111").twos.int === "00011001", "why 25-50 back");
}
console.log(`complement: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
