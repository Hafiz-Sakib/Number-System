import { useSyncExternalStore } from "react";

/* ছোট রাউটার: /  /convert  /calc  /practice  /learn  /logic  /dev - অন্য যেকোনো ঠিকানা হোমে যায়। */
export const ROUTES = [
  { path: "/", id: "home", label: "হোম", icon: "home" },
  { path: "/convert", id: "convert", label: "রূপান্তর", icon: "convert" },
  { path: "/calc", id: "calc", label: "হিসাব", icon: "calc" },
  { path: "/practice", id: "practice", label: "অনুশীলন", icon: "practice" },
  { path: "/learn", id: "learn", label: "শিখুন", icon: "learn" },
  { path: "/logic", id: "logic", label: "লজিক", icon: "logic" },
  { path: "/dev", id: "dev", label: "ডেভ পেজ", icon: "dev" },
];
const norm = (p) => { const x = "/" + String(p).replace(/^\/+|\/+$/g, ""); return ROUTES.some((r) => r.path === x) ? x : "/"; };
const sub = (cb) => { addEventListener("popstate", cb); addEventListener("route", cb); return () => { removeEventListener("popstate", cb); removeEventListener("route", cb); }; };

export function navigate(to) {
  const p = norm(to);
  if (p !== norm(location.pathname)) history.pushState(null, "", p);
  window.dispatchEvent(new Event("route"));
  window.scrollTo({ top: 0, behavior: "auto" });
}
export const useRoute = () => useSyncExternalStore(sub, () => norm(location.pathname), () => "/");
