import { SiGithub, SiCodeforces, SiLeetcode, SiX, SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";
import { FaLinkedin, FaGlobe } from "react-icons/fa6";
import { useDark } from "../theme";

/* পোর্টফোলিওর Icon: ব্র্যান্ডের রঙে লোগো; রাতের মোডে গাঢ় রঙ হালকা করা হয় */
const MAP = {
  GitHub: [SiGithub, "#14151A"], LinkedIn: [FaLinkedin, "#0A66C2"], Codeforces: [SiCodeforces, "#1F8ACB"], LeetCode: [SiLeetcode, "#FFA116"],
  Portfolio: [FaGlobe, "#14151A"], Live: [FaGlobe, "#14151A"], X: [SiX, "#14151A"], Instagram: [SiInstagram, "#E4405F"], Facebook: [SiFacebook, "#1877F2"], WhatsApp: [SiWhatsapp, "#25D366"],
};
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
const night = (hex) => (hex === "#14151A" ? "rgb(var(--ink))" : lum(hex) < 0.42 ? `color-mix(in srgb, ${hex} ${Math.round(50 + (lum(hex) / 0.42) * 20)}%, #fff)` : hex);

export function Icon({ name, className = "h-4 w-4" }) {
  const dark = useDark();
  const hit = MAP[name];
  if (!hit) return null;
  const [Cmp, color] = hit;
  return <Cmp aria-hidden className={`shrink-0 ${className}`} style={{ color: dark ? night(color) : color }} />;
}
