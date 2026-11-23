<div align="center">

# Number System (সংখ্যা পদ্ধতি)

**An interactive web app for HSC ICT: number systems, complements, Boolean algebra and logic gates, with step-by-step solutions in Bangla.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-ictlogic.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://ictlogic.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Number--System-181717?style=for-the-badge&logo=github)](https://github.com/Hafiz-Sakib/Number-System)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?logo=threedotjs&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)

<br />

<a href="https://ictlogic.vercel.app/">
  <img src="docs/screenshot.png" alt="Number System home page" width="100%" />
</a>

</div>

---

## Links

| | |
|---|---|
| **Live demo** | [ictlogic.vercel.app](https://ictlogic.vercel.app/) |
| **Source code** | [github.com/Hafiz-Sakib/Number-System](https://github.com/Hafiz-Sakib/Number-System) |

## Features

| Page | Route | What it does |
|---|---|---|
| **Home** | `/` | Live conversion card, 10 interactive animations (byte switches, counting race, divide-by-2, magic cards, mini logic gates, hex color mixer, ASCII/Unicode, IPv4, BCD clock, 7-segment decoder) and real-life examples (why a 64 GB pendrive shows 59 GB, color depth and image size) |
| **Convert** | `/convert` | Binary, octal, decimal and hexadecimal, including fractions, with a full textbook-style solution |
| **Calculate** | `/calc` | Addition, subtraction, multiplication and division (up to 10 numbers for addition), with column-by-column steps |
| **Complement** | `/complement` | 1's and 2's complement (with decimals), negative numbers, subtraction using complements |
| **Boolean Algebra** | `/algebra` | Laws and theorems, truth tables (up to 4 variables), De Morgan's laws, simplification and the full Quine–McCluskey working |
| **Logic Gates** | `/gates` | AND/OR/NOT, NAND/NOR, XOR/XNOR, encoder, decoder, half/full/4-bit adders, registers and counters as SVG circuits |
| **Developer** | `/dev` | About the developer, skills and projects |
| **404** | any unknown address | Animated not-found page: `404` decodes from 0s and 1s (motion-brew Binary text), falling bits, and nine clickable bit switches |

**Also:** light/dark theme, bottom tab bar on phones, installable PWA that works offline, and input support for Bangla digits (১০১০) and lowercase hex (`ff`).

## Tech Stack

- **React 18** and **Vite 6**
- **Tailwind CSS 3** with a CSS-variable based theme
- **Framer Motion** for animations
- **three.js** for the 3D bit cubes (lazy-loaded)
- **vite-plugin-pwa / Workbox** for the PWA
- Fonts: Anek Bangla, JetBrains Mono

## Getting Started

```bash
git clone https://github.com/Hafiz-Sakib/Number-System.git
cd Number-System

npm install
npm run dev        # start the development server
npm run build      # production build (dist/)
npm run preview    # preview the production build
npm test           # run the automated math engine tests
```

When deployed on Vercel, `vercel.json` rewrites every path to `/` so client-side routing works.

## Project Structure

```text
Number-System/
├── docs/
│   └── screenshot.png          # screenshot used in this README
├── public/                     # static files: icons, PWA icons, CV, developer page images
│   └── dev/                    # project thumbnails
├── scripts/
│   ├── make-icons.py           # generates the PWA icons
│   ├── test-engine.mjs         # tests for conversion and arithmetic engine
│   ├── test-complement.mjs     # tests for complements
│   ├── test-logic.mjs          # tests for the logic engine
│   ├── test-simplify.mjs       # tests for expression simplification
│   └── test-qm.mjs             # tests for Quine–McCluskey
├── src/
│   ├── main.jsx                # entry point
│   ├── App.jsx                 # layout and routes
│   ├── theme.js, index.css     # theme and global styles
│   ├── lib/
│   │   ├── engine.js           # all the math (BigInt, exact fractions) and explanation blocks
│   │   ├── complement.js       # 1's / 2's complement logic
│   │   ├── logic.js            # Boolean algebra, simplification, qmTrace()
│   │   ├── router.js           # lightweight custom router
│   │   ├── settings.js         # user settings (e.g. fraction precision)
│   │   └── site.js, team.js    # app name and developer info
│   ├── components/
│   │   ├── Steps.jsx           # renders solution steps (tables, column working)
│   │   ├── HomePlay.jsx        # the 10 interactive home sections
│   │   ├── HomeExtra.jsx       # real-life examples on the home page
│   │   ├── Circuit.jsx         # gate-level SVG circuits
│   │   ├── Bits3D.jsx, BitCubes.jsx   # three.js bit cubes
│   │   ├── TopBar.jsx, TabBar.jsx, Footer.jsx, ThemeToggle.jsx
│   │   └── ui.jsx, controls.jsx, icons.jsx, ...
│   └── sections/               # one file per page
│       ├── Home.jsx
│       ├── Convert.jsx
│       ├── Calc.jsx
│       ├── Complement.jsx
│       ├── BooleanAlgebra.jsx
│       ├── LogicGates.jsx
│       ├── Dev.jsx
│       └── logic/              # Algebra, Gates, Combinational, Sequential, Shell
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── package.json
```

## Notes

- When a decimal fraction does not terminate in another base, the result is cut off (truncated, not rounded) after **n digits past the point** and shown with `≈`.
- Addition, subtraction, multiplication and 2/8/16 conversions are always exact.
- Binary subtraction shows both the 1's complement and the 2's complement methods.

## Developer

**Hafiz Sakib** · Chattogram, Bangladesh

[Portfolio](https://hsakib.vercel.app) · [GitHub](https://github.com/Hafiz-Sakib) · [LinkedIn](https://www.linkedin.com/in/hafiz-sakib-96b8b3229/) · [Instagram](https://www.instagram.com/___sakib.404/)

---

<div align="center">

If you find this useful, consider giving it a ⭐

</div>
