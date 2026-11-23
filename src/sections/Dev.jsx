import { useRef } from "react";
import { BookOpen, GraduationCap, School } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BlurText, Reveal } from "../components/ui";
import { BackspaceText } from "../components/BackspaceText";
import { HighlightText, ProfileCard } from "../components/devui";
import { Icon } from "../components/icons";
import { GlobeCard } from "@/components/globe-card";
import { ME, SOCIAL } from "../lib/site";
import { HUB, team } from "../lib/team";

/* Developer page (English): profile card, marker-highlighted bio, education, four projects and the Motion Brew GlobeCard.
   Links: only Portfolio, GitHub, LinkedIn and Instagram (lib/site.js). */
const MARKS = ["full-stack", "clean UI", "competitive programming", "Competitive programming", "Natural Language Processing", "NLP", "Codeforces", "LeetCode"];
const WORDS = ["full-stack developer.", "competitive programmer.", "NLP researcher."];
const EDU = [
  { t: "B.Sc in Computer Science & Engineering", o: "Premier University, Chittagong", p: "2022 – 2026", d: "Software engineering, algorithms and full-stack development. Undergraduate thesis on applied AI/ML.", done: true, icon: GraduationCap },
  { t: "Higher Secondary Certificate", o: "Govt. Hazi Mohammad Mohsin College", p: "2017 – 2019", d: "Science group, GPA 5.00.", icon: BookOpen },
  { t: "Secondary School Certificate", o: "Govt. Muslim High School", p: "2015 – 2017", d: "Science group, GPA 5.00.", icon: School },
];
const PROJECTS = [
  { img: "cp-pathshala", t: "CP Pathshala", k: "Educational PWA", d: "An offline app for learning C++ competitive programming in Bangla: 144 lessons and 200 runnable examples.", u: "https://cp-pathshala.vercel.app/", tags: ["React", "Vite", "PWA"], bg: "bg-lilac" },
  { img: "subcalc", t: "SubCalc Pro", k: "Networking tool", d: "IPv4 subnetting with FLSM and VLSM splits, overlap detection and a subnet tree.", u: "https://subcalc-pro.vercel.app/", tags: ["React", "Tailwind", "VLSM"], bg: "bg-peach" },
  { img: "algoviz", t: "AlgoViz", k: "Algorithm visualizer", d: "60+ algorithms play frame by frame, with live C++ code and Three.js scenes.", u: "https://algorithm-hunter.vercel.app/", tags: ["React", "Three.js", "TypeScript"], bg: "bg-mint" },
  { img: "nova", t: "NOVA MathPlot", k: "2D / 3D math plots", d: "60+ surfaces, parametric curves and neural activation functions, right in the browser.", u: "https://nova-mathplot.vercel.app/", tags: ["React", "R3F", "Math.js"], bg: "bg-sky" },
];

const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>;
const btnDark = "inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/85";
const btnSoft = "inline-flex items-center gap-2 rounded-full bg-ink/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-ink/15";
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

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:gap-10">
        <Reveal x={-28} y={0}>
          <ProfileCard name={ME.full} line="Full-stack developer · Competitive programmer · NLP researcher" place={ME.place}>
            <a href={portfolio.href} target="_blank" rel="noreferrer" className={btnDark}><Icon name="Portfolio" className="h-4 w-4 !text-paper" />Visit portfolio</a>
          </ProfileCard>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08}>
          <HighlightText className="text-xl leading-[1.75] text-ink/80 sm:text-2xl" text={ME.bio} marks={MARKS} />
        </Reveal>
      </div>

      <section className="mt-20" aria-labelledby="edu-h">
        <Reveal y={16}><p className={pill}>Education</p><h2 id="edu-h" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Where I studied.</h2></Reveal>
        <Reveal y={16}><div className="card mt-6 p-5 sm:p-8"><Path items={EDU} /></div></Reveal>
      </section>

      <section className="mt-20" aria-labelledby="pro-h">
        <Reveal y={16}><p className={pill}>Projects</p><h2 id="pro-h" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Things I've built.</h2><p className="mt-2 text-ink/60">Tap a card to open the live site.</p></Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PROJECTS.map((p, k) => (
            <Reveal key={p.t} y={20} delay={(k % 2) * 0.06}>
              <a href={p.u} target="_blank" rel="noreferrer" className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1">
                <div className={`overflow-hidden ${p.bg}`}><img src={`/dev/${p.img}.webp`} alt={`${p.t} screenshot`} width="800" height="450" loading="lazy" className="aspect-video w-full object-cover object-top transition duration-500 group-hover:scale-[1.04]" /></div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs font-bold text-ink/45">{p.k}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2"><h3 className="font-display text-xl font-extrabold">{p.t}</h3><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[.06] transition group-hover:bg-ink group-hover:text-paper"><Arrow /></span></div>
                  <p className="mt-1.5 flex-1 text-[15px] leading-[1.75] text-ink/65">{p.d}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{p.tags.map((x) => <span key={x} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-ink/[.06] ${p.bg}`}>{x}</span>)}</div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="globe-title" className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,27.5rem)] lg:gap-14">
        <Reveal x={-28} y={0} className="lg:order-1">
          <p className={pill}>Let's build</p>
          <h2 id="globe-title" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">Let's build something together.</h2>
          <p className="mt-4 max-w-md text-ink/60">A new idea, freelance work or an open-source project, anything is worth a chat. I work with designers, engineers and writers from many parts of the world. Wherever you are, I'm happy to hear from you.</p>
          <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Links">
            {SOCIAL.map((s) => (
              <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" className={btnSoft}><Icon name={s.name} className="h-4 w-4" />{s.name}</a></li>
            ))}
          </ul>
        </Reveal>
        <Reveal x={28} y={0} delay={0.08} className="lg:order-2">
          <GlobeCard title="Global team" subtitle="AI, NLP, machine learning and full-stack work, all wired back to one place. Drag the globe to look around." cta="Meet the team" href="/team" members={team} hub={HUB} turn={22} arcs={9} className="mx-auto lg:mx-0" />
        </Reveal>
      </section>
    </motion.div>
  );
}
