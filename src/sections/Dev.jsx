import { useState } from "react";
import { Reveal, SectionTitle } from "../components/ui";
import { Icon } from "../components/icons";
import { ME, SOCIAL } from "../lib/site";

/* Developer page: a light summary of the motion-brew portfolio. Content is English (it is about the developer, not the app). */
const STATS = [["647", "Codeforces problems"], ["1574", "LeetCode rating"], ["10", "Projects shipped"], ["4+", "Years building"]];
const SKILLS = [
  ["Languages", "bg-lilac", ["C", "C++", "Java", "Python", "JavaScript", "TypeScript"]],
  ["Frontend", "bg-sky", ["React", "Next.js", "Tailwind CSS", "Redux"]],
  ["Backend & data", "bg-mint", ["Node.js", "Express.js", "Firebase", "MongoDB", "PostgreSQL"]],
  ["Algorithms & ML", "bg-peach", ["Dynamic Programming", "Graph Theory", "Number Theory", "NLP", "LSTM"]],
];
const WORK = [
  ["Software Engineering Intern", "Pathao Courier", "2024 – Present"],
  ["Junior Frontend Developer", "CodeStack", "2022 – 2023"],
  ["Course Instructor", "ICT School", "2021 – 2022"],
];
const EDU = [
  ["B.Sc in Computer Science & Engineering", "Premier University, Chittagong", "2022 – 2026"],
  ["Higher Secondary Certificate", "Govt. Hazi Mohammad Mohsin College", "2017 – 2019"],
];
const PROJECTS = [
  ["CP Pathshala", "Offline-first C++ competitive programming course in Bangla", "https://cp-pathshala.vercel.app/"],
  ["AlgoViz", "60+ algorithms with frame-by-frame playback", "https://algorithm-hunter.vercel.app/"],
  ["NOVA MathPlot", "Browser-based 2D/3D math plotting", "https://nova-mathplot.vercel.app/"],
  ["SubCalc Pro", "IPv4 subnetting toolkit with FLSM and VLSM", "https://subcalc-pro.vercel.app/"],
];

const Arrow = () => <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>;
const btn = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-semibold transition active:scale-95";

function Timeline({ title, rows }) {
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-ink/[.07]">
        {rows.map(([t, o, p]) => (
          <li key={t} className="py-3 first:pt-0 last:pb-0">
            <p className="font-semibold">{t}</p>
            <p className="text-sm text-ink/60">{o}</p>
            <p className="num mt-0.5 text-xs font-semibold text-violet-600 dark:text-violet-300">{p}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dev() {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(ME.email); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ } };
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-6 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="Developer" sub="The person behind this app." />

      <Reveal y={16}>
        <div className="card grid items-center gap-6 p-5 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-8">
          <img src="/profile.webp" alt={`Portrait of ${ME.name}`} width="160" height="160" className="mx-auto h-36 w-36 rounded-full object-cover ring-4 ring-surface shadow-lg sm:h-44 sm:w-44" />
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{ME.full}</h2>
            <p className="mt-1 text-ink/60">{ME.tagline}</p>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">{ME.bio}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button type="button" onClick={copy} className={`${btn} bg-ink text-paper hover:bg-ink/85`}>{copied ? "Email copied" : ME.email}</button>
              <a href={ME.cv} download className={`${btn} bg-ink/[.07] hover:bg-ink/[.12]`}>Download CV</a>
              <a href={SOCIAL[0].href} target="_blank" rel="noreferrer" className={`${btn} bg-ink/[.07] hover:bg-ink/[.12]`}><Icon name="GitHub" className="h-4 w-4" />GitHub</a>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal y={16} delay={0.05}>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(([v, l], i) => (
            <div key={l} className={`flex flex-col rounded-3xl px-4 py-4 text-center ring-1 ring-ink/[.06] ${["bg-lilac", "bg-lemon", "bg-mint", "bg-sky"][i]}`}>
              <dt className="order-2 text-xs font-semibold text-ink/60">{l}</dt>
              <dd className="num text-3xl font-extrabold">{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal y={16}>
        <div className="card mt-4 p-5 sm:p-6">
          <h2 className="text-lg font-bold">What I work with</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {SKILLS.map(([g, bg, items]) => (
              <div key={g}>
                <p className="mb-1.5 text-sm font-semibold text-ink/55">{g}</p>
                <div className="flex flex-wrap gap-1.5">{items.map((x) => <span key={x} className={`rounded-full px-3 py-1 text-[13px] font-semibold ring-1 ring-ink/[.06] ${bg}`}>{x}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal y={16}>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Timeline title="Experience" rows={WORK} />
          <Timeline title="Education" rows={EDU} />
        </div>
      </Reveal>

      <Reveal y={16}>
        <div className="card mt-4 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Selected projects</h2>
          <ul className="mt-2 divide-y divide-ink/[.07]">
            {PROJECTS.map(([t, d, u]) => (
              <li key={t}>
                <a href={u} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 py-3 transition">
                  <span className="min-w-0"><span className="block font-semibold">{t}</span><span className="block truncate text-sm text-ink/60">{d}</span></span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[.06] transition group-hover:bg-ink group-hover:text-paper"><Arrow /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
