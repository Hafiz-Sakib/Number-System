import { useRef, useState } from "react";
import { BookOpen, GraduationCap, School } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BlurText, Reveal } from "../components/ui";
import { BackspaceText } from "../components/BackspaceText";
import { HighlightText, ProfileCard } from "../components/devui";
import { Icon } from "../components/icons";
import { GlobeCard } from "@/components/globe-card";
import { DuoFlip } from "@/components/duo-flip";
import { ME, SOCIAL, brand } from "../lib/site";
import { HUB, team } from "../lib/team";

/* Developer page (English): profile card, marker-highlighted bio, education, four projects shown in a Motion Brew DuoFlip gallery, and the Motion Brew GlobeCard.
   Links: only Portfolio, GitHub, LinkedIn and Instagram (lib/site.js). */
const MARKS = ["software development", "competitive programming", "full-stack development", "Codeforces Pupil", "LeetCode", "Data Structures & Algorithms", "machine learning"];
const WORDS = ["full-stack developer.", "competitive programmer.", "NLP researcher."];
const EDU = [
  { t: "B.Sc in Computer Science & Engineering", o: "Premier University, Chittagong", p: "2022 – 2026", d: "Software engineering, algorithms and full-stack development. Undergraduate thesis on applied AI/ML.", done: true, icon: GraduationCap },
  { t: "Higher Secondary Certificate", o: "Govt. Hazi Mohammad Mohsin College", p: "2017 – 2019", d: "Science group, GPA 5.00.", icon: BookOpen },
  { t: "Secondary School Certificate", o: "Govt. Muslim High School", p: "2015 – 2017", d: "Science group, GPA 5.00.", icon: School },
];
const PROJECTS = [
  { img: "nikah", t: "Nikah Community Center", k: "Booking platform", u: "https://nikah-convention.vercel.app/", c: "#ea7a2f", tags: ["React", "Node.js", "Express", "Supabase"], bg: "bg-peach",
    d: "A full-stack booking system for a wedding venue in Chattogram, with live availability and advance payments.",
    pts: ["Live date availability and advance payments", "PDF invoices and an admin dashboard"] },
  { img: "cp-pathshala", t: "CP Pathshala", k: "Educational PWA", u: "https://cp-pathshala.vercel.app/", c: "#7c6cf6", tags: ["React", "Vite", "PWA", "Python"], bg: "bg-lilac",
    d: "A full C++ competitive programming course in plain Bangla. It works offline once installed, and every code sample was checked against a real compiler.",
    pts: ["144 lessons and 200 runnable C++ examples in 5 tracks", "STL, bit manipulation, number theory, DP and graphs"] },
  { img: "subcalc", t: "SubCalc Pro", k: "Networking tool", u: "https://subcalc-pro.vercel.app/", c: "#ea7a2f", tags: ["React", "Tailwind", "IPv4", "VLSM"], bg: "bg-peach",
    d: "A subnetting helper for students and network engineers. It works out the splits live and explains each step, not just the answer.",
    pts: ["FLSM and VLSM splits with a step-by-step breakdown", "Overlap detection and a visual subnet tree"] },
  { img: "algoviz", t: "AlgoViz", k: "Algorithm visualizer", u: "https://algorithm-hunter.vercel.app/", c: "#10a56b", tags: ["React", "TypeScript", "Three.js", "Tailwind v4"], bg: "bg-mint",
    d: "Watch algorithms think. Playback can step, pause and rewind while the matching C++ code lights up line by line.",
    pts: ["60+ algorithms in 11 categories", "Live C++ STL code panel and a Three.js hero scene"] },
  { img: "nova", t: "NOVA MathPlot", k: "2D / 3D math plots", u: "https://nova-mathplot.vercel.app/", c: "#2f7fe0", tags: ["React", "Three.js", "R3F", "Math.js"], bg: "bg-sky",
    d: "A browser-only math playground for students and teachers. Plot a function, spin a surface or watch a curve draw itself.",
    pts: ["60+ ready 3D surfaces and 40+ animated curves", "17 neural activation functions with derivative overlay"] },
];
const IMAGES = PROJECTS.map((p) => ({ src: `/dev/${p.img}.webp`, alt: `${p.t} screenshot`, label: p.t }));


const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>;
const btnDark = "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition";
const btnSoft = "inline-flex items-center gap-2 rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold transition";
const pill = "mb-3 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold tracking-wide text-ink/70";

/* Education path: the line on the left fills as you scroll, the current step pulses */
function Path({ items }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 65%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  return (
    <ol ref={ref} className="relative space-y-8">
      <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-[3px] rounded-full bg-ink/10" />
      <motion.span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-[3px] origin-top rounded-full bg-ink" style={{ scaleY: reduce ? 1 : fill }} />
      {items.map((r) => (
        <li key={r.t} className="relative grid grid-cols-[28px_1fr] gap-x-5 sm:grid-cols-[28px_9rem_1fr]">
          <span className="relative z-10 mt-0.5 grid h-7 w-7 place-items-center">
            {r.now && !reduce && <motion.span aria-hidden className="absolute h-7 w-7 rounded-full ring-2 ring-emerald-400" animate={{ scale: [1, 1.6], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
            <span className={`grid h-7 w-7 place-items-center rounded-full text-paper ring-4 ring-surface ${r.now ? "bg-emerald-500" : "bg-ink text-paper"}`}>
              {r.now ? <span className="h-2 w-2 rounded-full bg-white" /> : r.icon ? <r.icon aria-hidden className="h-4 w-4" strokeWidth={2.4} /> : <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>}
            </span>
          </span>
          <p className="col-start-2 text-sm font-semibold text-ink/50 sm:pt-1"><span className="whitespace-nowrap">{r.p}</span>{r.done && <span className="mt-1 block w-fit rounded-full bg-mint px-2 py-0.5 text-xs text-ink">Graduated</span>}</p>
          <div className="col-start-2 mt-1 sm:col-start-3 sm:mt-0">
            <h3 className="font-display text-lg font-bold leading-snug sm:text-xl">{r.t}</h3>
            <p className="text-sm font-semibold text-ink/70">{r.o}</p>
            <p className="mt-2 max-w-xl text-ink/65">{r.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* Project Showcase: Motion Brew DuoFlip gallery on one side, details of the picture on show on the other */
function Showcase() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const p = PROJECTS[i];
  return (
    <div className="mx-auto mt-8 flex w-full max-w-[64rem] flex-col gap-4 lg:-mx-8 lg:w-[calc(100%+4rem)] lg:max-w-none">
      <Reveal y={20} className="min-w-0"><DuoFlip images={IMAGES} onChange={setI} aspect={2.4} className="!w-full" /></Reveal>
      <div className="min-w-0" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article key={p.t} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="card p-5 sm:p-6">
            <p className="text-xs font-bold text-ink/45"><span className="num">{String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}</span> · {p.k}</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{p.t}</h3>
            <p className="mt-2 text-[15px] leading-[1.75] text-ink/70">{p.d}</p>
            <ul className="mt-3 space-y-1.5 text-[15px] leading-[1.7] text-ink/75">
              {p.pts.map((x) => <li key={x} className="flex gap-2"><span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ink/35" />{x}</li>)}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">{p.tags.map((x) => <span key={x} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-ink/[.06] ${p.bg}`}>{x}</span>)}</div>
            <a href={p.u} target="_blank" rel="noreferrer" style={{ "--b": p.c }} className={`${btnDark} brand mt-5`}>Open live site<Arrow /></a>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Dev() {
  const portfolio = SOCIAL[0];
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <header className="mb-10 sm:mb-14">
        <p className={pill}>Developer</p>
        <h1 className="font-display text-3xl font-semibold leading-[1.1] min-[400px]:text-4xl sm:text-5xl lg:text-6xl">
          <BlurText text={ME.full} />
          <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">.</span>
        </h1>
        <Reveal y={16} delay={0.25}>
          <p className="mt-3 min-h-[3.2rem] max-w-xl text-lg text-ink/65 sm:min-h-0 sm:text-xl">
            <BackspaceText before="I'm a" words={WORDS} caretClassName="text-violet-500" />
          </p>
        </Reveal>
      </header>

      <div className="grid items-stretch gap-6 lg:grid-cols-[22rem_1fr] lg:gap-10">
        <Reveal x={-28} y={0}>
          <ProfileCard name={ME.full} line="Full-stack developer · Competitive programmer · NLP researcher" place={ME.place}>
            <a href={portfolio.href} target="_blank" rel="noreferrer" className={`${btnDark} ${brand("Portfolio")}`}><Icon name="Portfolio" className="h-4 w-4 !text-paper" />Visit portfolio</a>
          </ProfileCard>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08} className="flex items-center">
          <HighlightText className="text-xl leading-[1.75] text-ink/80 sm:text-2xl" text={ME.bio} marks={MARKS} links={{ "Codeforces Pupil": ME.codeforces }} />
        </Reveal>
      </div>

      <section className="mt-20" aria-labelledby="edu-h">
        <Reveal y={16}><p className={pill}>Education</p><h2 id="edu-h" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Where I studied.</h2></Reveal>
        <Reveal y={16}><div className="card mt-6 p-5 sm:p-8"><Path items={EDU} /></div></Reveal>
      </section>

      <section className="mt-20" aria-labelledby="pro-h">
        <Reveal y={16}><p className={pill}>Projects</p><h2 id="pro-h" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Things I've built.</h2><p className="mt-2 text-ink/60">Tap the picture or use the arrows to flip through. Each project has a link to its live site.</p></Reveal>
        <Showcase />
      </section>

      <section aria-labelledby="globe-title" className="mt-20 grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal x={-28} y={0} className="flex flex-col items-start justify-center lg:order-1">
          <p className={pill}>Let's build</p>
          <h2 id="globe-title" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Let's build something together.</h2>
          <p className="mt-4 max-w-md text-ink/60">A new idea, freelance work or an open-source project, anything is worth a chat. I work with designers, engineers and writers from many parts of the world. Wherever you are, I'm happy to hear from you.</p>
          <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Links">
            {SOCIAL.map((s) => (
              <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" className={`${btnSoft} ${brand(s.name)}`}><Icon name={s.name} className="h-4 w-4" />{s.name}</a></li>
            ))}
          </ul>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08} className="lg:order-2 [&>*]:h-full">
          <GlobeCard title="Global team" eyebrow="Network" subtitle="AI, NLP, machine learning and full-stack work, all wired back to one place." stats={[{ value: String(team.length - 1), label: "Focus areas" }, { value: "BD", label: "Home base" }]} cta="Meet the team" href="https://hsakib.vercel.app" members={team} hub={HUB} turn={22} arcs={6} className="mx-auto lg:mx-0" />
        </Reveal>
      </section>
    </motion.div>
  );
}
