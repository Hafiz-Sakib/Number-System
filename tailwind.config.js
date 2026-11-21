const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    fontFamily: {
      display: ["Anek Bangla Variable", "Anek Bangla", "sans-serif"],
      body: ["Anek Bangla Variable", "Anek Bangla", "sans-serif"],
      mono: ["JetBrains Mono Variable", "JetBrains Mono", "Anek Bangla Variable", "monospace"],
    },
    // সব রঙ CSS variable (index.css), তাই একই class দিন ও রাত দুই মোডেই কাজ করে।
    colors: { ink: v("ink"), mist: v("mist"), surface: v("surface"), paper: v("paper"), lilac: v("lilac"), mint: v("mint"), peach: v("peach"), sky: v("sky"), lemon: v("lemon") },
  } },
};
