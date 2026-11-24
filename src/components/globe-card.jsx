/* GlobeCard, from Motion Brew (https://motion-brew.com/components/globe-card).
   Installed as a single file: three.js globe (land = points kept by an embedded bit mask), colored city dots,
   arcs along lifted great circles with a glowing comet head, avatar sprites that pop in with a ripple.
   Needs: three, motion, lucide-react, clsx, tailwind-merge. Tailwind opacity shorthands (/6, /8, /12) are written as
   /[.06] etc. so they also work on Tailwind v3. */
import { cn } from "@/lib/cn";
import { NODE_ICONS } from "@/lib/node-icons";
import * as React from "react";
import * as THREE from "three";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
var PALETTE = [
  "#9150e0",
  "#3d66d6",
  "#d6498f",
  "#269a5a",
  "#cf7a1c",
  "#2a9fbf"
];
var GLIDE = [0.22, 1, 0.36, 1];
var DEFAULT_MEMBERS = [
  { name: "Ava Chen", city: "San Francisco", lat: 37.8, lon: -122.4 },
  { name: "Leo Martins", city: "S\xE3o Paulo", lat: -23.5, lon: -46.6 },
  { name: "Maya Lindqvist", city: "Stockholm", lat: 59.3, lon: 18.1 },
  { name: "Daniel Okafor", city: "Lagos", lat: 6.5, lon: 3.4 },
  { name: "Priya Raman", city: "Bengaluru", lat: 12.97, lon: 77.6 },
  { name: "Kenji Sato", city: "Tokyo", lat: 35.7, lon: 139.7 },
  { name: "Grace Hill", city: "Sydney", lat: -33.9, lon: 151.2 },
  { name: "Omar Haddad", city: "Dubai", lat: 25.2, lon: 55.3 },
  { name: "Sofia Ruiz", city: "Mexico City", lat: 19.4, lon: -99.1 },
  { name: "Tom Becker", city: "Berlin", lat: 52.5, lon: 13.4 }
];
var LAND = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADf//8AAf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////D//////n/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gf/x////////wAAAAAbgAAB4AAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAf//8A///////+AAAAB/ngAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAcH3Hv/5////////8AAAAA/gAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAcIAAQP/AH///////+AAAAAPCAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAADwDAc+f+AP///////4AAAAAAAAAAAAAB4AAAAB/8AAAAAAAAAAAAAAAAAAAAAH9wc374AAAf/////8AAAAAAAAAAAAH4AAAA////AAAB/gAAAAAAAAAAAAAAAAwAAA+QAAAH/////8AAAAAAAAAAAAOAAAAP///wAAAAAAAAAAAAAAAAAAAAP8AYe+c3AAAD/////4AAAAAAAAAAAA4AAAH////++HgAOAAAAAAAAAAAAAAAfv+4+w/4gAAB/////wAAAAAAAAAAADwAHgH///////4AfwAAAAAgAAAAAAAAPf/4O4//9AAB/////wAAAAAAAAAAADwAPb////////4m//gAAAAAAAf+AAAAAAf+A8f//4AB////8gAAAAAAA/gAAAAAfv/////////////8AAAAAB///+H//H/+PeDwf+AA3////AAAAAAA//4AAAA8fv///////////////P8wAf////////A4CPz4H8AAP///wAAAAAAD///wADH/n3/////////////////8AD////////////34Z/wA///4AAAAAAAP///+M////n/////////////////+4E/////////////gD/8Af//gAAIAAAAf//4+P////f/////////////////fw/////////////6AD8YAf/wAAf8AAAA/8f+D///////////////////////AgEf///////////zw7/AAP/gAAP4AAAB/4/+f//////////////////////8AMAf//////////+DIA/gAH/gAAAAAAAH/z/////////////////////////+AAH///////////8AwgGAAD+AAAAAAAA//H/////////////////////////6AAP///////////wAA/AAAB+AAAAAAAB/+H//////////////////////nP+AAAH//z////////wAA/wAAAOAAAAAAAB//D/////////////////////+A/4AAAA/zAD///////gAA/4wAAAAAAAAAAB//Ab///////////////////+eDgAAAAABwAA///////4AA/94AAAAAAAAAYA5+A///////////////////4AAHAAAAAADcAAD//////4AAf/8AAAAAAAAA8AC+C///////////////////wAAfgAAAAAMAAAA///////wAf/8AAAAAAAAA4AO8H///////////////////AAA/gAAAABgAAAA///////8A///AAAAAAAAA8ANwH//////////////////8AAB/AAAAAEAAAAAf///////z///4AAAAAAAHOAEDv//////////////////+AAA+AAAAAAAAAABH///////x///8AAAAAAAHHAf/////////////////////6AA8AAAAAAAAAAAD///////x///8AAAAAAAGPz//////////////////////6AAwAAAAAAAAAAAD///////9///6AAAAAAAAPj//////////////////////6AAQAAAAAAAAAAAC///////////MAAAAAAAAYf//////////////////////7AAAAAAAAAAAAAABv////////+MNAAAAAAAAD///////////////////////zAAAAAAAAAAAAAAAH////////7gfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAL/////////gCgAAAAAAAH///////////////////////iAAAAAAAAAAAAAAAP/////////pAAAAAAAAAD/////uP/x//////////////DAAAAAAAAAAAAAAAP/////////+AAAAAAAAAB//v//Gf/B/////////////+AAAAAAAAAAAAAAAAP////////8wAAAAAAAAAB//H/+AP+P/////////////8CAAAAAAAAAAAAAAAP////////wAAAAAAAAADj/jz/8AD/H/////////////4HgAAAAAAAAAAAAAAP////////gAAAAAAAAAH/4Bw/8AA/B////////////+APAAAAAAAAAAAAAAAP////////gAAAAAAAAAH/wA8f8Ph/g////////////8AAAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/gMHfJ///x///////////v4AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAH/AMCOP///h//////////+JwAMAAAAAAAAAAAAAAAH///////4AAAAAAAAAAH/AAAHP///g//////////8BwAIAAAAAAAAAAAAAAAH///////wAAAAAAAAAAH+AAYGH///w//////////+w4A4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAAgf+ACBs//////////////g4D4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAAj/+AAAA//////////////AYf4AAAAAAAAAAAAAAAA///////gAAAAAAAAAAB//8AAAA//////////////Ah2AAAAAAAAAAAAAAAAAP/////+AAAAAAAAAAAD//+AAAB//////////////gDwAAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4GAB//////////////gDAAAAAAAAAAAAAAAAAAG/////4AAAAAAAAAAAP///8P4h//////////////wCAAAAAAAAAAAAAAAAAACf////4AAAAAAAAAAAP////v////////////////gAAAAAAAAAAAAAAAAAAABP//hgYAAAAAAAAAAAP//////3//P///////////wAAAAAAAAAAAAAAAAAAAAv//AAYAAAAAAAAAAAf//////9//H///////////wAAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAB///////4//h///////////gAAAAAAAAAAAAAAAAAAAAR/+AANAAAAAAAAAAD///////8//wH//////////AAAAAAAAAAAAAAAAAAAAAJ/+AAEAAAAAAAAAAH///////+f/0B/////////+AAAAAAAAAAAAAAAAAAAAAI/8AAAAAAAAAAAAAH///////+f/44Af///////+QAAAAAAAAAAAAAAAAAAAAAf8AAAAAAAAAAAAAP////////H//+AP///////4gAAAAAAAAAAAAAAAAAAAAAP8AAuAAAAAAAAAAP////////H///AD///v///ggAAAAAAAAAAAAAAAAAAAAAH+AABgAAAAAAAAAf////////n//+AD//4P//YAAAAAAAAAAAAAAAAAAAAAAAP+A4AYAAAAAAAAAP////////j//+AAf/4H/+AAAAAAAAAAAAAAAAgAAAAAAAH/B4ABwAAAAAAAAP////////h//8AAf/gD/8YAAAAAAAAAAAAAAAAAAAAAAAD/nwAD9AAAAAAAAP////////x//4AAf/AD/8QAAAAAAAAAAAAAAAAAAAAAAAAf/wAAAAAAAAAAAP////////4//gAAf+AD/+AAwAAAAAAAAAAAAAAAAAAAAAAH/wAAAAAAAAAAAf////////4f+AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAf////////8f8AAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf////////+fgAAAPwAAP/gAwAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAf/////////eAAAAHwAAP/gAMAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAf/////////gAAAAHwAAM/gACAAAAAAAAAAAAAAAAAAAAAAAADABAAAAAAAAAP/////////gYAAADwAAEfgAJAAAAAAAAAAAAAAAAAAAAAAAADgPfKAAAAAAAH/////////34AAADwAAIOABAAAAAAAAAAAAAAAAAAAAAAAAAAyPf+AAAAAAAD//////////4AAADoAAIEACBAAAAAAAAAAAAAAAAAAAAAAAAA8///AAAAAAAB//////////wAAABIAAMAAAFAAAAAAAAAAAAAAAAAAAAAAAAAE///gAAAAAAB//////////wAAAAMAAEAAALgAAAAAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAf/////////gAAAAMAADAAMCAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAACAA///////AAAAAAAAxgA+AAAAAAAAAAAAAAAAAAAAAAAAAAAf///4AAAAAAAAAD/////+AAAAAAAAZgB4AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAD/////8AAAAAAAAMwH8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAHQf8AIAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////gAAAAAAAAHgf88IAAAAAAAAAAAAAAAAAAAAAAAAD////+AAAAAAAAAH/////AAAAAAAAADwf8AAgAAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAABwP5wBwAAAAAAAAAAAAAAAAAAAAAAAH/////6AAAAAAAAD////+AAAAAAAAAB8P5wATwAAAAAAAAAAAAAAAAAAAAAAD//////4AAAAAAAB////8AAAAAAAAAA8AxQif+AAAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAB////4AAAAAAAAAAcAAIAD/gAAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAAMAAIAI/ywAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////4AAAAAAAAAADgAAAI/8BAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///4AAAAAAAAAAB+AAAA/4AIAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///4AAAAAAAAAAAAmogAOMAAAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///8AAAAAAAAAAAABCAAAGADAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///8AAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAf/////+AAAAAAAAP///8AAAAAAAAAAAAAAAgCAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAB+CAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAAf///+AQAAAAAAAAAAAAD8DAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+AwAAAAAAAAAAAA38DgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////8BwAAAAAAAAAAAD/8DgAAAAAAAAAAAAAAAAAAAAAAB/////4AAAAAAAA////8PwAAAAAAAAAAAD//HwAABABAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////wPgAAAAAAAAAAAP//3wAAAACAAAAAAAAAAAAAAAAAAP////wAAAAAAAA////APgAAAAAAAAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAAf///4AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgAAAAAAAAAAD////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP//+AfAAAAAAAAAAAf////+AAEAAAAAAAAAAAAAAAAAAAAP////AAAAAAAAAP///AfAAAAAAAAAAA//////AAAAAAAAAAAAAAAAAAAAAAAP///4AAAAAAAAAP//+APAAAAAAAAAAA//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAH//+AOAAAAAAAAAAB//////wAAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AEAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAH//4AAAAAAAAAAAAA//////4AAAAAAAAAAAAAAAAAAAAAAf//+AAAAAAAAAAD//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAAf//8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAP/////4AAAAAAAAAAAAAAAAAAAAAAf//wAAAAAAAAAAA/+AAAAAAAAAAAAAAP/AP//wAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/4AAAAAAAAAAAAAAf8AG//gAAAAAAAAAAAAAAAAAAAAAA//3AAAAAAAAAAAAYAAAAAAAAAAAAAAAOAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAABAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAgAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAQAAAAAAAAAAAAAAAAAB//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYAAAAcAAAAAAAAAAAAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAADQAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAOAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAH4AAAAAAB4HgAD8AAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAA//AAAD//////////wAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAf///4Af///////////AAAAAAAAAAAAAAAAAAAAAAAz4AAAAAAAAAAAAAAAPz////8B/////////////wAAAAAAAAAAAAAAAAAAAAA78AAAAAAAAAAA8/8///////wf/////////////+AAAAAAAAAAAAAAAAAAAAH9+AAAAAAAAZ////////////w////////////////4AAAAAAAAAAAAAAAAAAAB+AAAAAAAB//////////////////////////////4AAAAAAAAABmAAB8f+HB/+AAAAAAAP//////////////////////////////gAAAAAAAAP/Y/oAf/////4AAAAAAAP/////////////////////////////8AAAAAAAD/////////////gAAAAAAB//////////////////////////////wAAAAAAAD////////////wAAAAAAP///////////////////////////////wAAAAAD/////////////4AAAAAAD////////////////////////////////wAAAADh/////////////AAAAB8A/////////////////////////////////+AAAAA4Af///////////gAAAH+AA///////////////////////////////+AAAAAAAAH///////////+A/A/wAA///////////////////////////////8AAAAAAAf//////////////gAAAf////////////////////////////////+AAAAAAAH///////////////h////////////////////////////////////wAAAAAAP/////////////////////////////////////////////////////gA+/gAAH/////////////////////////////////////////////////////8/////v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";
var landBits = null;
function isLand(lat, lon) {
  if (!landBits) {
    const raw = atob(LAND);
    landBits = new Uint8Array(raw.length);
    for (let i2 = 0; i2 < raw.length; i2++) landBits[i2] = raw.charCodeAt(i2);
  }
  const r = Math.min(179, Math.max(0, Math.floor(90 - lat)));
  const c = Math.min(359, Math.max(0, Math.floor(lon + 180)));
  const i = r * 360 + c;
  return landBits[i >> 3] >> 7 - (i & 7) & 1;
}
function toVec(lat, lon, r = 1) {
  const phi = lat * Math.PI / 180;
  const lam = lon * Math.PI / 180;
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.sin(lam),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lam)
  );
}
var initials = (name) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
var dotTexture = () => canvasTexture(64, 64, (g) => {
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(32, 32, 26, 0, Math.PI * 2);
  g.fill();
});
var glowTexture = (color, inner = 0) => canvasTexture(128, 128, (g) => {
  const grad = g.createRadialGradient(64, 64, 64 * inner, 64, 64, 64);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
});
var avatarTexture = (name, color) => canvasTexture(128, 128, (g) => {
  g.shadowColor = "rgba(0,0,0,0.22)";
  g.shadowBlur = 12;
  g.shadowOffsetY = 4;
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(64, 60, 46, 0, Math.PI * 2);
  g.fill();
  g.shadowColor = "transparent";
  g.fillStyle = color;
  g.beginPath();
  g.arc(64, 60, 39, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "600 32px ui-sans-serif, system-ui, -apple-system, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(initials(name), 64, 62);
});
/* Node badge: a colored disc with a white icon (member.icon -> NODE_ICONS) or a photo (member.img, used for the hub). */
var nodeTexture = (m) => {
  const paint = (g, img) => {
    g.clearRect(0, 0, 128, 128);
    g.shadowColor = "rgba(0,0,0,0.22)";
    g.shadowBlur = 12;
    g.shadowOffsetY = 4;
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(64, 60, 46, 0, Math.PI * 2);
    g.fill();
    g.shadowColor = "transparent";
    if (m.img) {
      g.save();
      g.beginPath();
      g.arc(64, 60, 41, 0, Math.PI * 2);
      g.clip();
      if (img) g.drawImage(img, 0, 0, img.width, img.height, 64 - 41, 60 - 41, 82, 82);
      else {
        g.fillStyle = m.color;
        g.fillRect(0, 0, 128, 128);
      }
      g.restore();
    } else {
      g.fillStyle = m.color;
      g.beginPath();
      g.arc(64, 60, 39, 0, Math.PI * 2);
      g.fill();
      if (img) g.drawImage(img, 64 - 22, 60 - 22, 44, 44);
    }
  };
  let src = m.img;
  if (!src && m.icon && NODE_ICONS[m.icon])
    src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${NODE_ICONS[m.icon]}</svg>`);
  const tex = canvasTexture(128, 128, (g) => paint(g, null));
  if (src) {
    const img = new Image();
    img.onload = () => {
      paint(tex.image.getContext("2d"), img);
      tex.needsUpdate = true;
    };
    img.src = src;
  }
  return tex;
};
var DRAW = 1.4;
var HOLD = 1.8;
var FADE = 0.9;
var LIFE = DRAW + HOLD + FADE;
var SEGMENTS = 80;
function Reveal({
  text,
  show,
  delay = 0,
  still,
  className
}) {
  return jsx("span", { className, "aria-label": text, children: text.split(" ").map((w, i) => jsxs(React.Fragment, { children: [
    jsx(
      motion.span,
      {
        "aria-hidden": true,
        className: "inline-block",
        initial: still ? false : { opacity: 0, y: "0.35em", filter: "blur(6px)" },
        animate: show ? { opacity: 1, y: 0, filter: "blur(0px)" } : void 0,
        transition: {
          duration: 0.55,
          ease: GLIDE,
          delay: delay + i * 0.05
        },
        children: w
      }
    ),
    " "
  ] }, i)) });
}
function GhostButton({
  label,
  href,
  onClick,
  still
}) {
  const Tag = href ? "a" : "button";
  const arrow = "absolute inset-0 size-4 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
  return jsxs(
    Tag,
    {
      ...href ? { href } : { type: "button", onClick },
      className: cn(
        "group pointer-events-auto inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-ink/[.07] px-4 text-sm font-semibold text-ink outline-none transition-[background-color,transform] duration-200 hover:bg-ink/[.12] focus-visible:ring-2 focus-visible:ring-violet-500/60 active:bg-ink/[.16]",
        !still && "active:scale-[0.97]"
      ),
      children: [
        label,
        jsxs("span", { "aria-hidden": true, className: "relative size-4 overflow-hidden", children: [
          jsx(
            ArrowRight,
            {
              className: cn(arrow, !still && "group-hover:translate-x-[140%]"),
              strokeWidth: 2.25
            }
          ),
          jsx(
            ArrowRight,
            {
              className: cn(
                arrow,
                "-translate-x-[140%]",
                !still && "group-hover:translate-x-0 group-hover:delay-75"
              ),
              strokeWidth: 2.25
            }
          )
        ] })
      ]
    }
  );
}
var GlobeCard = React.forwardRef(
  function GlobeCard2({
    title = "Global team",
    subtitle = "We are designers, engineers and writers spread across ten countries. Wherever you are, someone on the team is awake and building.",
    cta = "Meet the team",
    eyebrow,
    stats,
    href,
    members = DEFAULT_MEMBERS,
    hub,
    arcs = 6,
    turn = 70,
    onCta,
    className
  }, ref) {
    const still = !!useReducedMotion();
    const card = React.useRef(null);
    React.useImperativeHandle(ref, () => card.current);
    const mount = React.useRef(null);
    const inView = useInView(card, { once: true, amount: 0.4 });
    const show = still || inView;
    const people = React.useMemo(
      () => members.map((m, i) => ({
        ...m,
        color: m.color ?? PALETTE[i % PALETTE.length]
      })),
      [members]
    );
    const settings = React.useRef({ turn, arcs, still, people, hub });
    settings.current = { turn, arcs, still, people, hub };
    const pointer = React.useRef({
      x: 0,
      y: 0,
      inside: false,
      dragging: false,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      vx: 0,
      vy: 0
    });
    React.useEffect(() => {
      const host = mount.current;
      if (!host) return;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, 4.7);
      const pivot = new THREE.Group();
      pivot.position.set(0, 0, 0);
      scene.add(pivot);
      const tilt = new THREE.Group();
      tilt.rotation.x = 0.38;
      pivot.add(tilt);
      const globe = new THREE.Group();
      globe.rotation.y = -0.25;
      tilt.add(globe);
      scene.add(new THREE.AmbientLight(16777215, 2.3));
      const sun = new THREE.DirectionalLight(16777215, 1.1);
      sun.position.set(-2.5, 3, 4);
      scene.add(sun);
      const haloTex = glowTexture("rgba(145, 80, 224, 0.16)", 0.62);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: haloTex,
          transparent: true,
          depthWrite: false
        })
      );
      halo.scale.set(2.6, 2.6, 1);
      halo.renderOrder = -1;
      pivot.add(halo);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.992, 80, 80),
        new THREE.MeshLambertMaterial({ color: 15790319 })
      );
      globe.add(sphere);
      const pts = [];
      const N = 22e3;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - i / (N - 1) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        const x = Math.cos(th) * rad;
        const z = Math.sin(th) * rad;
        const lat = Math.asin(y) * 180 / Math.PI;
        const lon = Math.atan2(x, z) * 180 / Math.PI;
        if (isLand(lat, lon)) pts.push(x * 1.001, y * 1.001, z * 1.001);
      }
      const dotsGeo = new THREE.BufferGeometry();
      dotsGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(pts, 3)
      );
      const dotTex = dotTexture();
      const dots = new THREE.Points(
        dotsGeo,
        new THREE.PointsMaterial({
          color: 11119013,
          size: 0.02,
          map: dotTex,
          transparent: true,
          alphaTest: 0.4,
          sizeAttenuation: true
        })
      );
      globe.add(dots);
      const paintTheme = () => {
        const night = document.documentElement.classList.contains("dark");
        sphere.material.color.set(night ? 0x15172b : 0xf0f0ef);
        dots.material.color.set(night ? 0x8b90c8 : 0xa9a9a5);
      };
      paintTheme();
      const themeObs = new MutationObserver(paintTheme);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      const cityGeo = new THREE.BufferGeometry();
      const cityPos = [];
      const cityCol = [];
      for (const m of settings.current.people) {
        const v = toVec(m.lat, m.lon, 1.004);
        cityPos.push(v.x, v.y, v.z);
        const c = new THREE.Color(m.color);
        cityCol.push(c.r, c.g, c.b);
      }
      cityGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(cityPos, 3)
      );
      cityGeo.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(cityCol, 3)
      );
      const cities = new THREE.Points(
        cityGeo,
        new THREE.PointsMaterial({
          size: 0.045,
          map: dotTex,
          vertexColors: true,
          transparent: true,
          alphaTest: 0.4,
          sizeAttenuation: true
        })
      );
      globe.add(cities);
      const textures = new Map();
      const tex = (key, make) => {
        if (!textures.has(key)) textures.set(key, make());
        return textures.get(key);
      };
      const flights = [];
      const hubOf = () => settings.current.people.find((m) => m.name === settings.current.hub);
      const makePath = (va, vb) => {
        const angle = va.angleTo(vb);
        const lift = 0.1 + 0.42 * (angle / Math.PI);
        const s = Math.max(1e-4, Math.sin(angle));
        const path = [];
        for (let i = 0; i <= SEGMENTS; i++) {
          const t = i / SEGMENTS;
          const q = va.clone().multiplyScalar(Math.sin((1 - t) * angle) / s).add(vb.clone().multiplyScalar(Math.sin(t * angle) / s)).normalize().multiplyScalar(1.004 + lift * Math.sin(Math.PI * t));
          path.push(q);
        }
        return path;
      };
      /* Hub mode: every member is a permanent node badge joined to the hub by a thin edge; comets fly out from the hub. */
      const statics = [];
      const hubMember = hubOf();
      if (hubMember) {
        const vh = toVec(hubMember.lat, hubMember.lon);
        globe.rotation.y = -hubMember.lon * Math.PI / 180 - 0.9;
        for (const m of settings.current.people) {
          const isHub = m === hubMember;
          const v = toVec(m.lat, m.lon);
          if (!isHub) {
            const edge = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(makePath(vh, v)),
              new THREE.LineBasicMaterial({ color: m.color, transparent: true, opacity: 0.4 })
            );
            globe.add(edge);
            statics.push(edge);
          }
          const badge = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: tex("node" + m.name, () => nodeTexture(m)),
              transparent: true,
              depthWrite: false
            })
          );
          badge.center.set(0.5, 0.1);
          badge.position.copy(v).multiplyScalar(1.006);
          const sc = isHub ? 0.24 : 0.13;
          badge.scale.set(sc, sc, 1);
          globe.add(badge);
          statics.push(badge);
        }
      }
      const launch = (now, settled = false) => {
        const list = settings.current.people;
        if (list.length < 2) return;
        const hubM = hubOf();
        const a = hubM || list[Math.floor(Math.random() * list.length)];
        let b = a;
        while (b === a) b = list[Math.floor(Math.random() * list.length)];
        const va = toVec(a.lat, a.lon);
        const vb = toVec(b.lat, b.lon);
        const path = makePath(va, vb);
        const geo = new THREE.BufferGeometry().setFromPoints(path);
        geo.setDrawRange(0, settled ? path.length : 0);
        const line = new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: b.color,
            transparent: true,
            opacity: 0.85
          })
        );
        globe.add(line);
        const comet = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: tex("glow" + b.color, () => glowTexture(b.color, 0.05)),
            transparent: true,
            depthWrite: false
          })
        );
        comet.scale.set(0.16, 0.16, 1);
        comet.visible = false;
        globe.add(comet);
        const heads = [];
        const rings = [];
        for (const [m, v] of [
          [a, va],
          [b, vb]
        ]) {
          if (!hubM) {
            const sprite = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: tex("av" + m.name, () => avatarTexture(m.name, m.color)),
                transparent: true,
                depthWrite: false
              })
            );
            sprite.center.set(0.5, 0.1);
            sprite.position.copy(v).multiplyScalar(1.006);
            sprite.scale.set(0, 0, 1);
            globe.add(sprite);
            heads.push(sprite);
          }
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.022, 0.03, 40),
            new THREE.MeshBasicMaterial({
              color: m.color,
              transparent: true,
              opacity: 0,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          );
          ring.position.copy(v).multiplyScalar(1.005);
          ring.lookAt(v.clone().multiplyScalar(2));
          globe.add(ring);
          rings.push(ring);
        }
        flights.push({
          line,
          comet,
          heads,
          rings,
          path,
          born: settled ? now - DRAW - 0.4 : now
        });
      };
      const drop = (f) => {
        globe.remove(f.line, f.comet, ...f.heads, ...f.rings);
        f.line.geometry.dispose();
        f.line.material.dispose();
        f.comet.material.dispose();
        f.heads.forEach((h) => h.material.dispose());
        f.rings.forEach((r) => {
          r.geometry.dispose();
          r.material.dispose();
        });
      };
      const size = { w: 0, h: 0 };
      const resize = () => {
        size.w = host.clientWidth;
        size.h = host.clientHeight;
        renderer.setSize(size.w, size.h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = size.w / Math.max(1, size.h);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      let visible = true;
      const io = new IntersectionObserver(
        ([e]) => void (visible = !!e?.isIntersecting)
      );
      io.observe(host);
      if (settings.current.still)
        for (let i = 0; i < settings.current.arcs; i++) launch(0, true);
      let last = performance.now();
      let elapsed = 0;
      let nextLaunch = 0.3;
      let raf = 0;
      const easeOut = (t) => 1 - (1 - t) ** 3;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        const t = performance.now();
        const dt = Math.min(0.05, (t - last) / 1e3);
        last = t;
        if (!visible || !size.w) return;
        elapsed += dt;
        const now = elapsed;
        const s = settings.current;
        const p = pointer.current;
        if (!s.still) {
          const base = s.turn > 0 ? Math.PI * 2 / s.turn : 0;
          if (!p.dragging) {
            p.vx *= Math.exp(-dt * 2.2);
            p.vy *= Math.exp(-dt * 3);
          }
          globe.rotation.y += (base + p.vx) * dt;
          tilt.rotation.x = Math.max(
            0,
            Math.min(0.9, tilt.rotation.x + p.vy * dt)
          );
          const lean = p.inside && !p.dragging ? 1 : 0;
          pivot.rotation.y += (p.x * 0.28 * lean - pivot.rotation.y) * Math.min(1, dt * 4);
          pivot.rotation.x += (p.y * 0.14 * lean - pivot.rotation.x) * Math.min(1, dt * 4);
          if (now >= nextLaunch && flights.length < s.arcs) {
            launch(now);
            nextLaunch = now + LIFE / Math.max(1, s.arcs) + Math.random() * 0.25;
          }
        }
        for (let i = flights.length - 1; i >= 0; i--) {
          const f = flights[i];
          const age = s.still ? DRAW + 0.4 : now - f.born;
          const n = f.path.length;
          const geo = f.line.geometry;
          let head = n - 1;
          if (age < DRAW) {
            head = Math.max(1, Math.floor(easeOut(age / DRAW) * (n - 1)));
            geo.setDrawRange(0, head + 1);
          } else if (age < DRAW + HOLD) geo.setDrawRange(0, n);
          else {
            const k = Math.min(1, (age - DRAW - HOLD) / FADE);
            const start = Math.floor(easeOut(k) * n);
            geo.setDrawRange(start, n - start);
          }
          f.comet.visible = !s.still && age < DRAW + 0.15;
          if (f.comet.visible) {
            f.comet.position.copy(f.path[Math.min(head, n - 1)]);
            f.comet.material.opacity = age < DRAW ? 1 : 1 - (age - DRAW) / 0.15;
          }
          const fade = age > DRAW + HOLD ? 1 - Math.min(1, (age - DRAW - HOLD) / FADE) : 1;
          f.heads.forEach((h, j) => {
            const at = j === 0 ? 0 : DRAW * 0.94;
            const k = Math.max(0, Math.min(1, (age - at) / 0.4));
            const pop = 1 + Math.sin(k * Math.PI) * 0.3 * (1 - k);
            const sc = 0.13 * Math.min(1, k * 1.8) * pop * fade;
            h.scale.set(sc, sc, 1);
            h.material.opacity = fade;
          });
          f.rings.forEach((r, j) => {
            const at = j === 0 ? 0 : DRAW * 0.94;
            const k = (age - at) / 1.1;
            const m = r.material;
            if (k < 0 || k > 1 || s.still) return void (m.opacity = 0);
            r.scale.setScalar(1 + k * 3.4);
            m.opacity = (1 - k) * 0.55 * fade;
          });
          if (!s.still && age >= LIFE) {
            drop(f);
            flights.splice(i, 1);
          }
        }
        renderer.render(scene, camera);
      };
      frame();
      const local = (e) => {
        const r = host.getBoundingClientRect();
        return {
          x: (e.clientX - r.left) / r.width * 2 - 1,
          y: (e.clientY - r.top) / r.height * 2 - 1
        };
      };
      const onEnter = () => void (pointer.current.inside = true);
      const onLeave = () => Object.assign(pointer.current, { inside: false, x: 0, y: 0 });
      const onDown = (e) => {
        if (settings.current.still) return;
        Object.assign(pointer.current, {
          dragging: true,
          lastX: e.clientX,
          lastY: e.clientY,
          lastT: performance.now()
        });
        host.setPointerCapture(e.pointerId);
      };
      const onMove = (e) => {
        const p = pointer.current;
        Object.assign(p, local(e));
        if (!p.dragging) return;
        const now = performance.now();
        const dts = Math.max(1, now - p.lastT) / 1e3;
        const dx = (e.clientX - p.lastX) * 8e-3;
        const dy = (e.clientY - p.lastY) * 6e-3;
        globe.rotation.y += dx;
        tilt.rotation.x = Math.max(0, Math.min(0.9, tilt.rotation.x + dy));
        p.vx = p.vx * 0.5 + dx / dts * 0.5;
        p.vy = p.vy * 0.5 + dy / dts * 0.5;
        Object.assign(p, { lastX: e.clientX, lastY: e.clientY, lastT: now });
      };
      const onUp = () => {
        const p = pointer.current;
        p.dragging = false;
        p.vx = Math.max(-6, Math.min(6, p.vx));
        p.vy = Math.max(-2, Math.min(2, p.vy));
      };
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        themeObs.disconnect();
        io.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerup", onUp);
        host.removeEventListener("pointercancel", onUp);
        flights.forEach(drop);
        statics.forEach((o) => {
          globe.remove(o);
          o.geometry?.dispose();
          o.material.dispose();
        });
        sphere.geometry.dispose();
        sphere.material.dispose();
        dotsGeo.dispose();
        dots.material.dispose();
        cityGeo.dispose();
        cities.material.dispose();
        halo.material.dispose();
        haloTex.dispose();
        dotTex.dispose();
        textures.forEach((x) => x.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    }, []);
    return (
      <div
        ref={card}
        className={cn(
          "relative flex h-full min-h-[24rem] w-full flex-col overflow-hidden rounded-3xl bg-surface text-ink shadow-[0_1px_2px_rgba(20,21,26,.04),0_16px_40px_-16px_rgba(20,21,26,.18)] ring-1 ring-ink/[.06]",
          className
        )}
      >
        <div className="relative px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {eyebrow && (
                <motion.span
                  initial={still ? false : { opacity: 0, y: 6 }}
                  animate={show ? { opacity: 1, y: 0 } : void 0}
                  transition={{ duration: 0.5, ease: GLIDE }}
                  className="inline-flex items-center gap-2 rounded-full bg-ink/[.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.12em] text-ink/60"
                >
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {eyebrow}
                </motion.span>
              )}
              <Reveal text={title} show={show} still={still} className={cn("block text-2xl font-semibold tracking-tight", eyebrow && "mt-2")} />
            </div>
            <motion.div
              initial={still ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : void 0}
              transition={{ duration: 0.5, ease: GLIDE, delay: 0.3 }}
              className="shrink-0"
            >
              <GhostButton label={cta} href={href} onClick={onCta} still={still} />
            </motion.div>
          </div>
          <Reveal text={subtitle} show={show} delay={0.12} still={still} className="mt-1.5 block text-[15px] leading-relaxed text-ink/60" />
        </div>
        <div className="relative min-h-[15rem] flex-1 border-t border-ink/[.07]">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 62% at 50% 52%, rgb(145 80 224 / .12), transparent 72%)" }} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: "radial-gradient(rgb(var(--ink) / .10) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              WebkitMaskImage: "radial-gradient(closest-side at 50% 50%, #000 20%, transparent 100%)",
              maskImage: "radial-gradient(closest-side at 50% 50%, #000 20%, transparent 100%)"
            }}
          />
          <div ref={mount} aria-hidden className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing" style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 11%, #000 90%, transparent 100%)", maskImage: "linear-gradient(to bottom, transparent 0, #000 11%, #000 90%, transparent 100%)" }} />
          <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between gap-2 text-[11px] font-medium text-ink/55">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/85 px-3 py-1 ring-1 ring-ink/[.08] backdrop-blur">
              {stats && stats.length > 0 ? stats.map((x) => `${x.value} ${x.label.toLowerCase()}`).join(" · ") : "Global team"}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface/85 px-3 py-1 ring-1 ring-ink/[.08] backdrop-blur">
              <svg viewBox="0 0 24 24" aria-hidden className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>
              Drag to explore
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export { GlobeCard };
