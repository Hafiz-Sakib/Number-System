import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks: { react: ["react", "react-dom"], motion: ["framer-motion"] } } },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "favicon.svg", "favicon-16.png", "favicon-32.png", "apple-touch-icon.png"],
      manifest: {
        name: "সংখ্যা পদ্ধতি - এইচএসসি আইসিটি",
        short_name: "সংখ্যা পদ্ধতি",
        description: "বাইনারি, অক্টাল, ডেসিমাল ও হেক্সাডেসিমাল: রূপান্তর এবং যোগ-বিয়োগ-গুণ-ভাগ, ধাপে ধাপে বাংলা ব্যাখ্যাসহ।",
        lang: "bn",
        dir: "ltr",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        categories: ["education"],
        background_color: "#F3F4F7",
        theme_color: "#151633",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        ],
        shortcuts: [
          { name: "রূপান্তর", short_name: "রূপান্তর", url: "/convert", icons: [{ src: "/pwa-192.png", sizes: "192x192" }] },
          { name: "যোগ-বিয়োগ-গুণ-ভাগ", short_name: "হিসাব", url: "/calc", icons: [{ src: "/pwa-192.png", sizes: "192x192" }] },
          { name: "অনুশীলন", short_name: "অনুশীলন", url: "/practice", icons: [{ src: "/pwa-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        // JS, CSS, ফন্ট, ছবি - সবই precache, তাই ইন্টারনেট ছাড়াও অ্যাপ খোলে।
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}"],
        globIgnores: ["**/*latin-ext*.woff2"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});
