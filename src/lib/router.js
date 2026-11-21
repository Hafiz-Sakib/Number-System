import { useSyncExternalStore } from "react";

/* ছোট রাউটার: /  /convert  /calc  /practice  /learn - অন্য যেকোনো ঠিকানা হোমে যায়। */
export const ROUTES = [
  { path: "/", id: "home", label: "হোম", icon: "home", title: "সংখ্যা পদ্ধতি - বাইনারি, অক্টাল, ডেসিমাল, হেক্সাডেসিমাল" },
  { path: "/convert", id: "convert", label: "রূপান্তর", icon: "convert", title: "রূপান্তর - সংখ্যা পদ্ধতি" },
  { path: "/calc", id: "calc", label: "হিসাব", icon: "calc", title: "যোগ বিয়োগ গুণ ভাগ - সংখ্যা পদ্ধতি" },
  { path: "/practice", id: "practice", label: "অনুশীলন", icon: "practice", title: "অনুশীলন - সংখ্যা পদ্ধতি" },
  { path: "/learn", id: "learn", label: "শিখুন", icon: "learn", title: "নিয়মকানুন - সংখ্যা পদ্ধতি" },
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
