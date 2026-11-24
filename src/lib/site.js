/* App name and the developer's details (summarised from the motion-brew portfolio's data.js). */
export const APP_NAME = "সংখ্যা পদ্ধতি";

export const ME = {
  name: "Hafiz Sakib",
  full: "Mohammad Hafizur Rahman Sakib",
  email: "hafizsakib5@gmail.com",
  place: "Chattogram, Bangladesh",
  cv: "/Hafiz-Sakib-CV.pdf",
  tagline: "Full-stack developer and NLP researcher in Chattogram, Bangladesh.",
  bio: "CSE student at Premier University who builds full-stack web apps with clean UI and solid architecture. Competitive programming on Codeforces and LeetCode keeps the fundamentals sharp, and Natural Language Processing is the main area for higher study.",
};

/* Only four links on the site (footer and Developer page). */
export const SOCIAL = [
  { name: "Portfolio", label: "hsakib.vercel.app", href: "https://hsakib.vercel.app" },
  { name: "GitHub", label: "Hafiz-Sakib", href: "https://github.com/Hafiz-Sakib" },
  { name: "LinkedIn", label: "hafiz-sakib", href: "https://www.linkedin.com/in/hafiz-sakib-96b8b3229/" },
  { name: "Instagram", label: "___sakib.404", href: "https://www.instagram.com/___sakib.404/" },
];

/* Hover colour: a link takes the brand colour of the site or app it opens (rules in index.css, `.brand`). */
export const brand = (name) => `brand brand-${String(name).toLowerCase()}`;
