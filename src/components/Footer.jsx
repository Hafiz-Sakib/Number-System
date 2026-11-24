import { Reveal } from "./ui";
import { Icon } from "./icons";
import { ME, SOCIAL, brand } from "../lib/site";
import { navigate } from "../lib/router";

/* Footer, same as the motion-brew portfolio: © chip that slides to Instagram on hover, full name, tagline, social icons, back to top. */
export default function Footer() {
  const year = new Date().getFullYear();
  const insta = SOCIAL.find((x) => x.name === "Instagram");
  const top = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  return (
    <Reveal y={16}>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <div className="border-t border-ink/10 pt-7 sm:pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <a href={insta.href} target="_blank" rel="noreferrer" aria-label={`© ${year} ${ME.full}. Open Instagram`} className="group inline-flex max-w-full flex-col items-start gap-2">
                <span aria-hidden className={`${brand("Instagram")} relative inline-grid overflow-hidden rounded-full bg-ink/[.06] px-3 py-1 text-xs font-semibold text-ink/60 transition-colors duration-300`}>
                  <span className="col-start-1 row-start-1 transition duration-300 group-hover:-translate-y-full group-hover:opacity-0 group-focus-visible:-translate-y-full group-focus-visible:opacity-0">© {year}</span>
                  <span className="col-start-1 row-start-1 inline-flex translate-y-full items-center gap-1.5 whitespace-nowrap opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"><Icon name="Instagram" className="h-3 w-3" />Follow on Instagram</span>
                </span>
                <span className="inline-flex max-w-full items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-[length:0%_3px] bg-[position:0_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_3px] group-focus-visible:bg-[length:100%_3px]">{ME.full}</span>
                  <Icon name="Instagram" className="h-5 w-5 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
                </span>
              </a>
              <p className="mt-2 max-w-md text-ink/60">{ME.tagline}</p>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Social links">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name} className={`${brand(s.name)} grid h-11 w-11 place-items-center rounded-full bg-surface shadow-sm ring-1 ring-ink/[.08] transition duration-200 hover:-translate-y-1 hover:shadow-md`}>
                    <Icon name={s.name} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-row items-center justify-between gap-4 text-sm text-ink/55">
            <p>All rights reserved. <a href="/dev" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navigate("/dev"); }} className="font-semibold text-ink/70 underline decoration-ink/25 underline-offset-4 transition hover:text-ink hover:decoration-ink/60">ডেভেলপার সম্পর্কে</a></p>
            <a href="/" onClick={top} className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink/[.06] px-4 py-2 font-semibold text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink">
              Back to top
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </Reveal>
  );
}
