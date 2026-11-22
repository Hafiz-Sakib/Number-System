import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { isDark } from "../theme";

/* three.js: প্রতিটি বিটের জন্য একটি 3D ঘনক। 1 হলে ঘনকটি উঠে সবুজ জ্বলে ও দুলতে থাকে, 0 হলে নেমে ধূসর হয়।
   ক্যামেরা orthographic, তাই ঘনকগুলো ঠিক HTML গ্রিডের কলামের নিচে বসে (bits[0] = সবচেয়ে বাম)। */
const OFF_L = new THREE.Color("#c9cde0"), OFF_D = new THREE.Color("#2b2e4a"), ON = new THREE.Color("#10b981");

function digitTex(ch, color) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.font = "700 84px 'JetBrains Mono Variable','JetBrains Mono',monospace";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = color;
  g.fillText(ch, 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function BitCubes({ bits, height = 128, className = "" }) {
  const wrap = useRef(null);
  const live = useRef(bits);
  live.current = bits;
  const n = bits.length;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-n / 2, n / 2, 1, -1, 0.1, 50);
    cam.position.set(0, 0, 10);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(-2, 4, 6);
    scene.add(sun);

    const geo = new RoundedBoxGeometry(0.66, 0.66, 0.66, 4, 0.11);
    const tex = { 0: digitTex("0", "#8b90a8"), 1: digitTex("1", "#ffffff") };
    const cubes = Array.from({ length: n }, (_, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: OFF_L.clone(), roughness: 0.38, metalness: 0.08, emissive: ON.clone(), emissiveIntensity: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = i - (n - 1) / 2;
      scene.add(mesh);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[0], transparent: true, depthTest: false }));
      sprite.scale.set(0.5, 0.5, 1);
      sprite.userData.base = 0.5;
      sprite.position.set(mesh.position.x, 0, 3);
      scene.add(sprite);
      return { mesh, mat, sprite, v: 0, shown: 0 };
    });

    let k = 1; // ঘনকের আকারের গুণক: উচ্চতা কম হলে ছোট করে ফ্রেমে ঢোকাই (কলামের অবস্থান বদলায় না)
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = Math.round(Math.min(height, Math.max(84, (w / n) * 0.95)));
      el.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      const halfW = n / 2, halfH = (halfW * h) / w;
      k = Math.min(1, halfH / 0.74);
      cam.left = -halfW; cam.right = halfW; cam.top = halfH; cam.bottom = -halfH;
      cam.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let raf = 0, last = performance.now(), visible = true;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const off = isDark() ? OFF_D : OFF_L;
      cubes.forEach((c, i) => {
        const target = live.current[i] ? 1 : 0;
        c.v = reduce ? target : c.v + (target - c.v) * (1 - Math.exp(-dt * 11));
        c.mat.color.copy(off).lerp(ON, c.v);
        c.mat.emissiveIntensity = c.v * 0.55;
        c.mesh.position.y = (-0.1 + c.v * 0.24) * k;
        c.mesh.scale.setScalar((0.94 + c.v * 0.12) * k);
        c.sprite.scale.setScalar(0.5 * k);
        const wob = reduce ? 0 : Math.sin(t * 1.6 + i) * 0.22 * c.v;
        c.mesh.rotation.set(0.5 - c.v * 0.12, -0.55 + wob + (reduce ? 0 : c.v * Math.sin(t * 0.9 + i) * 0.15), 0);
        c.sprite.position.y = c.mesh.position.y;
        if (c.shown !== target) { c.shown = target; c.sprite.material.map = tex[target]; c.sprite.material.needsUpdate = true; }
      });
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }, { threshold: 0 });
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      cubes.forEach((c) => { c.mat.dispose(); c.sprite.material.dispose(); });
      geo.dispose(); tex[0].dispose(); tex[1].dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [n, height]);

  if (failed) return null;
  return <div ref={wrap} className={className} style={{ height }} role="img" aria-label={`বিট: ${bits.join("")}`} />;
}
