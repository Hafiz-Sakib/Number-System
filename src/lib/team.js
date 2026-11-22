/* Nodes on the Developer page globe (GlobeCard `members`, with `hub="Hafiz Sakib"`).
   The hub is me (profile photo); every other node is an area I work in, joined to the hub by an edge.
   Member: { name, city, lat, lon, color?, icon?, img? }. icon keys live in lib/node-icons.js (ai, nlp, ml, dl, web, data, algo, research, cp, llm).
   `city` is only where the node sits on the globe. */
export const HUB = "Hafiz Sakib";

export const team = [
  { name: HUB, city: "Chattogram", lat: 22.36, lon: 91.78, color: "#7c3aed", img: "/profile.webp" },
  { name: "AI", city: "San Francisco", lat: 37.8, lon: -122.4, icon: "ai", color: "#9150e0" },
  { name: "NLP", city: "Stockholm", lat: 59.3, lon: 18.1, icon: "nlp", color: "#d6498f" },
  { name: "Machine Learning", city: "Tokyo", lat: 35.7, lon: 139.7, icon: "ml", color: "#3d66d6" },
  { name: "Deep Learning", city: "Sydney", lat: -33.9, lon: 151.2, icon: "dl", color: "#2a9fbf" },
  { name: "LLMs", city: "Sao Paulo", lat: -23.5, lon: -46.6, icon: "llm", color: "#cf7a1c" },
  { name: "Full-stack", city: "Lagos", lat: 6.5, lon: 3.4, icon: "web", color: "#269a5a" },
  { name: "Data", city: "Dubai", lat: 25.2, lon: 55.3, icon: "data", color: "#3d66d6" },
  { name: "Algorithms", city: "Berlin", lat: 52.5, lon: 13.4, icon: "algo", color: "#9150e0" },
  { name: "Research", city: "Mexico City", lat: 19.4, lon: -99.1, icon: "research", color: "#d6498f" },
  { name: "Competitive", city: "Cape Town", lat: -33.9, lon: 18.4, icon: "cp", color: "#cf7a1c" },
  { name: "Python", city: "Auckland", lat: -36.85, lon: 174.76, icon: "code", color: "#3d66d6" },
  { name: "React & UI", city: "Seoul", lat: 37.57, lon: 126.98, icon: "ui", color: "#2a9fbf" },
  { name: "PWA", city: "Singapore", lat: 1.35, lon: 103.82, icon: "pwa", color: "#269a5a" },
  { name: "Cloud", city: "Dublin", lat: 53.35, lon: -6.26, icon: "cloud", color: "#2a9fbf" },
  { name: "Git & Open Source", city: "Toronto", lat: 43.65, lon: -79.38, icon: "git", color: "#cf7a1c" },
  { name: "Three.js / 3D", city: "Vancouver", lat: 49.28, lon: -123.12, icon: "3d", color: "#9150e0" },
  { name: "Backend & APIs", city: "Reykjavik", lat: 64.15, lon: -21.9, icon: "server", color: "#3d66d6" },
  { name: "Networking", city: "Nairobi", lat: -1.29, lon: 36.82, icon: "net", color: "#269a5a" },
  { name: "Math", city: "Cairo", lat: 30.04, lon: 31.24, icon: "math", color: "#d6498f" },
  { name: "UI/UX Design", city: "Paris", lat: 48.86, lon: 2.35, icon: "design", color: "#d6498f" },
  { name: "C++ & Systems", city: "Moscow", lat: 55.75, lon: 37.62, icon: "cpu", color: "#cf7a1c" },
  { name: "Security", city: "Istanbul", lat: 41.0, lon: 28.98, icon: "shield", color: "#9150e0" },
  { name: "Teaching", city: "Buenos Aires", lat: -34.6, lon: -58.38, icon: "book", color: "#269a5a" },
];
