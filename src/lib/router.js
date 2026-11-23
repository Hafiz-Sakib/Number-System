import { useSyncExternalStore } from "react";

/* ছোট রাউটার: /  /convert  /calc  /complement  /algebra  /gates  /dev - অন্য যেকোনো ঠিকানায় ৪০৪ পেজ দেখায় (ঠিকানা যেমন ছিল তেমনই থাকে)। পুরনো /logic যায় লজিক গেটে। */
export const ROUTES = [
  { path: "/", id: "home", label: "হোম", icon: "home" },
  { path: "/convert", id: "convert", label: "রূপান্তর", icon: "convert" },
  { path: "/calc", id: "calc", label: "হিসাব", icon: "calc" },
  { path: "/complement", id: "complement", label: "পরিপূরক", icon: "complement", sub: "1's ও 2's পরিপূরক" },
  { path: "/algebra", id: "algebra", label: "বুলিয়ান এলজেবরা", icon: "algebra", sub: "রাশি · উপপাদ্য · সত্যক সারণী" },
  { path: "/gates", id: "gates", label: "লজিক গেট", icon: "gates", sub: "গেট · অ্যাডার · কাউন্টার" },
  { path: "/dev", id: "dev", label: "ডেভেলপার", icon: "dev" },
];
export const NOT_FOUND = "/404";
const ALIAS = { "/logic": "/gates" };
const norm = (p) => { let x = "/" + String(p).replace(/^\/+|\/+$/g, ""); x = ALIAS[x] || x; return ROUTES.some((r) => r.path === x) ? x : NOT_FOUND; };
const sub = (cb) => { addEventListener("popstate", cb); addEventListener("route", cb); return () => { removeEventListener("popstate", cb); removeEventListener("route", cb); }; };

export function navigate(to) {
  const p = norm(to);
  if (p !== norm(location.pathname)) history.pushState(null, "", p);
  window.dispatchEvent(new Event("route"));
  window.scrollTo({ top: 0, behavior: "auto" });
}
export const useRoute = () => useSyncExternalStore(sub, () => norm(location.pathname), () => "/");
