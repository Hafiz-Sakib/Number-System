import "@fontsource-variable/anek-bangla/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/* ইনস্টল প্রম্পট ধরে রাখি, যাতে উপরের ডান কোণের বোতাম পরে সেটা চালাতে পারে */
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); window.__pwaPrompt = e; window.dispatchEvent(new Event("pwa-ready")); });
window.addEventListener("appinstalled", () => { window.__pwaPrompt = null; try { localStorage.setItem("pwa-installed", "1"); } catch { /* private mode */ } window.dispatchEvent(new Event("pwa-installed")); });
createRoot(document.getElementById("root")).render(<App />);
