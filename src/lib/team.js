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
  { name: "React & UI", city: "Seoul", lat: 37.57, lon: 126.98, icon: "ui", color: "#2a9fbf" },
];
