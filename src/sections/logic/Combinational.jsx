import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Bits3D from "../../components/Bits3D";
import { Lab, TruthTable } from "../../components/Circuit";
import { GenButton, PillChoice } from "../../components/controls";
import { genGateInputs, genRippleExample } from "../../lib/exampleGen";
import { autoLayout } from "../../lib/logic";
import { BitBtn, Eq, Facts, P, Panel, spec } from "./shared";

const SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇"];
const bin = (k, n) => k.toString(2).padStart(n, "0");

/* ---------- 3.7.8 এনকোডার ---------- */
export function Encoder() {
  const net = useMemo(() => autoLayout(spec(
    [...Array(8)].map((_, i) => ({ id: `D${i}`, label: `D${i}` })),
    [["a2", "OR", ["D4", "D5", "D6", "D7"]], ["a1", "OR", ["D2", "D3", "D6", "D7"]], ["a0", "OR", ["D1", "D3", "D5", "D7"]]],
    [["A2", "a2", "A₂"], ["A1", "a1", "A₁"], ["A0", "a0", "A₀"]],
  ), { inGap: 42, colGap: 150 }), []);
  const table = useMemo(() => ({
    ins: [...Array(8)].map((_, i) => `D${i}`), outs: ["A₂", "A₁", "A₀"],
    rows: [...Array(8)].map((_, k) => ({ in: [...Array(8)].map((__, i) => +(i === k)), out: [(k >> 2) & 1, (k >> 1) & 1, k & 1] })),
  }), []);
  return (
    <div className="space-y-4">
      <Panel>
        <P>**এনকোডার (Encoder)** 2^[n] টি ইনপুট লাইনের **একটি সক্রিয় লাইনকে** n বিটের বাইনারি কোডে বদলে দেয়। যেমন **অক্টাল-টু-বাইনারি এনকোডারে** 8টি ইনপুট (D₀–D₇) ও 3টি আউটপুট (A₂ A₁ A₀) থাকে।</P>
        <div className="mt-3"><Facts items={[["A₂ = D₄+D₅+D₆+D₇", "যে ইনপুটের বাইনারি কোডে সবচেয়ে বামের বিট 1।", "bg-lilac"], ["A₁ = D₂+D₃+D₆+D₇", "মাঝের বিট 1 হয় যেসব ইনপুটে।", "bg-sky"], ["A₀ = D₁+D₃+D₅+D₇", "ডানের বিট 1 হয় যেসব ইনপুটে।", "bg-mint"]]} /></div>
        <P className="mt-3">প্রতিটি আউটপুট একটি **OR গেট**। D₀ কোনো গেটে যায় না, কারণ কোড 000 আসে কোনো বিট 1 না হলেই।</P>
      </Panel>
      <Panel title="অক্টাল-টু-বাইনারি এনকোডার" sub="একটি ইনপুট চালু করো (একবারে একটিই সক্রিয় থাকে)।">
        <Lab net={net} table={table} radio init={{ D5: 1 }} below={(st) => {
          const act = Object.keys(st).filter((k) => st[k]);
          const k = act.length ? +act[0].slice(1) : 0;
          return <p className="mt-3 rounded-2xl bg-mint px-4 py-3 text-center font-semibold ring-1 ring-ink/[.06]">{act.length ? <>সক্রিয় ইনপুট <Eq>D{k}</Eq> → আউটপুট <Eq>{bin(k, 3)}</Eq> (ডেসিমাল {k})</> : <>কোনো ইনপুট সক্রিয় নয় → আউটপুট <Eq>000</Eq></>}</p>;
        }} />
      </Panel>
    </div>
  );
}

/* ---------- 3.7.9 ডিকোডার ---------- */
function Dec38() {
  const [b, setB] = useState([1, 0, 1]);
  const k = b[0] * 4 + b[1] * 2 + b[2];
  const rows = [...Array(8)].map((_, i) => ({ in: [(i >> 2) & 1, (i >> 1) & 1, i & 1], out: [...Array(8)].map((__, j) => +(i === j)) }));
  const flip = (i) => setB((x) => x.map((v, j) => (j === i ? 1 - v : v)));
  const [exLabel, setExLabel] = useState("");
  const generate = () => {
    const ex = genGateInputs(["A", "B", "C"], { cur: { A: b[0], B: b[1], C: b[2] }, key: "dec38" });
    const nb = [ex.values.A, ex.values.B, ex.values.C];
    setB(nb);
    const c = nb[0] * 4 + nb[1] * 2 + nb[2];
    setExLabel(c === 0 ? "প্রথম কোড 000 (Y₀ জ্বলবে)" : c === 7 ? "শেষ কোড 111 (Y₇ জ্বলবে)" : `কোড ${nb.join("")} → Y${SUB[c]} জ্বলবে`);
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {["A", "B", "C"].map((n, i) => (
          <div key={n} className="flex items-center gap-2"><span className="num font-bold">{n}</span><BitBtn v={b[i]} onClick={() => flip(i)} label={`ইনপুট ${n}`} /></div>
        ))}
        <span className="text-ink/60">কোড <Eq>{b.join("")}</Eq> = ডেসিমাল {k}</span>
      </div>
      <div className="mt-3"><GenButton onClick={generate} note={exLabel || "৩ বিটের একটি র‍্যান্ডম কোড"} /></div>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} initial={false} animate={{ backgroundColor: i === k ? "#10b981" : "rgba(120,124,150,.14)", scale: i === k ? 1.06 : 1 }} transition={{ type: "spring", stiffness: 420, damping: 26 }} className={`rounded-2xl px-2 py-3 text-center ${i === k ? "text-white shadow-lg" : ""}`}>
            <p className="num text-xs font-bold opacity-70">Y{SUB[i]}</p>
            <p className="num text-2xl font-extrabold">{i === k ? 1 : 0}</p>
            <p className="num text-[11px] opacity-60">{bin(i, 3)}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-ink/55">প্রতিটি আউটপুট একটি 3-ইনপুট AND গেট (মিনটার্ম)। যেমন <Eq>Y₅ = A·B'·C</Eq></p>
      <div className="mt-3"><TruthTable ins={["A", "B", "C"]} outs={SUB.slice(0, 8).map((s) => `Y${s}`)} rows={rows} active={k} onPick={(i) => setB([(i >> 2) & 1, (i >> 1) & 1, i & 1])} /></div>
    </div>
  );
}

export function Decoder() {
  const [v, setV] = useState("24");
  const net = useMemo(() => autoLayout(spec(["A", "B"], [
    ["n1", "NOT", ["A"]], ["n2", "NOT", ["B"]],
    ["y0", "AND", ["n1", "n2"], { label: "A'·B'" }], ["y1", "AND", ["n1", "B"], { label: "A'·B" }],
    ["y2", "AND", ["A", "n2"], { label: "A·B'" }], ["y3", "AND", ["A", "B"], { label: "A·B" }],
  ], [["Y0", "y0", "Y₀"], ["Y1", "y1", "Y₁"], ["Y2", "y2", "Y₂"], ["Y3", "y3", "Y₃"]]), { inGap: 70, colGap: 120 }), []);
  return (
    <div className="space-y-4">
      <Panel>
        <P>**ডিকোডার (Decoder)** এনকোডারের উল্টো কাজ করে: n বিটের বাইনারি কোড নিয়ে 2^[n] টি আউটপুটের **ঠিক একটিকে 1** করে। মেমরির ঠিকানা বাছাই, 7-সেগমেন্ট ডিসপ্লে চালানো ইত্যাদিতে ডিকোডার লাগে।</P>
        <div className="mt-3"><PillChoice id="dec" value={v} onChange={setV} options={[{ id: "24", label: "2-টু-4 ডিকোডার" }, { id: "38", label: "3-টু-8 ডিকোডার" }]} /></div>
      </Panel>
      {v === "24"
        ? <Panel title="2-টু-4 ডিকোডার" sub="দুটি ইনপুট A, B → চারটি আউটপুট। প্রতিটি আউটপুট একটি AND গেট।"><Lab net={net} init={{ A: 1 }} /></Panel>
        : <Panel title="3-টু-8 ডিকোডার" sub="তিন বিটের কোড বদলে দেখো কোন আউটপুট জ্বলে।"><Dec38 /></Panel>}
    </div>
  );
}

/* ---------- 3.7.10 অ্যাডার ---------- */
const HA = spec(["A", "B"], [["x", "XOR", ["A", "B"]], ["a", "AND", ["A", "B"]]], [["S", "x", "Sum (S)"], ["C", "a", "Carry (C)"]]);
const FA = spec(["A", "B", "Cin"], [
  ["x1", "XOR", ["A", "B"], { label: "XOR" }], ["s", "XOR", ["x1", "Cin"], { label: "XOR" }],
  ["a1", "AND", ["A", "B"]], ["a2", "AND", ["x1", "Cin"]], ["c", "OR", ["a1", "a2"]],
], [["S", "s", "Sum (S)"], ["C", "c", "Cout"]]);

function Ripple() {
  const [a, setA] = useState([1, 0, 1, 1]); // MSB-আগে: 11
  const [b, setB] = useState([0, 1, 1, 0]); // 6
  const [cin, setCin] = useState(0);
  const calc = useMemo(() => {
    const out = [], carries = [cin]; // index 0 = LSB (bit0)
    for (let i = 0; i < 4; i++) {
      const x = a[3 - i], y = b[3 - i], c = carries[i];
      out.push(x ^ y ^ c);
      carries.push((x & y) | (c & (x ^ y)));
    }
    return { sum: out, carries };
  }, [a, b, cin]);
  const av = parseInt(a.join(""), 2), bv = parseInt(b.join(""), 2);
  const total = av + bv + cin;
  const result = [calc.carries[4], calc.sum[3], calc.sum[2], calc.sum[1], calc.sum[0]];
  const flip = (set, i) => set((x) => x.map((v, j) => (j === i ? 1 - v : v)));
  const [exLabel, setExLabel] = useState("");
  const generate = () => { const ex = genRippleExample({ a, b, cin }); setA(ex.a); setB(ex.b); setCin(ex.cin); setExLabel(ex.label); };
  const col = [3, 2, 1, 0]; // বাম থেকে ডানে বিট নম্বর
  return (
    <div>
      <div className="overflow-x-auto no-sb pb-1">
        <div className="mx-auto grid min-w-[430px] max-w-xl grid-cols-[auto_repeat(4,minmax(0,1fr))_auto] items-center gap-x-1.5 gap-y-2.5 text-center">
          <span />{col.map((bit) => <span key={bit} className="num text-sm font-bold text-ink/50">বিট {bit}</span>)}<span className="num text-sm font-bold text-ink/50">Cin</span>
          <span className="num font-bold">A</span>{col.map((bit, i) => <div key={bit} className="flex justify-center"><BitBtn v={a[i]} onClick={() => flip(setA, i)} label={`A বিট ${bit}`} /></div>)}<span />
          <span className="num font-bold">B</span>{col.map((bit, i) => <div key={bit} className="flex justify-center"><BitBtn v={b[i]} onClick={() => flip(setB, i)} label={`B বিট ${bit}`} /></div>)}
          <div className="flex justify-center"><BitBtn v={cin} onClick={() => setCin(1 - cin)} label="ক্যারি-ইন" /></div>
          <span className="num text-xs font-bold text-ink/50">অ্যাডার</span>
          {col.map((bit) => {
            const i = bit, ci = calc.carries[i + 1];
            return (
              <motion.div key={bit} initial={false} animate={{ backgroundColor: calc.sum[i] ? "rgba(16,185,129,.18)" : "rgba(120,124,150,.12)" }} transition={{ delay: i * 0.1, duration: 0.25 }} className="rounded-2xl px-1 py-2 ring-1 ring-ink/10">
                <p className="text-xs font-bold text-ink/55">FA</p>
                <p className="num text-lg font-extrabold">S={calc.sum[i]}</p>
                <motion.p initial={false} animate={{ color: ci ? "#059669" : "rgba(120,124,150,.8)" }} transition={{ delay: i * 0.1 + 0.08 }} className="num text-xs font-bold">{bit === 3 ? "C₄" : `← C${SUB[i + 1]}`}={ci}</motion.p>
              </motion.div>
            );
          })}
          <span />
        </div>
      </div>
      <div className="mx-auto mt-4 max-w-xl"><GenButton onClick={generate} note={exLabel || "A, B ও Cin-এর একটি র‍্যান্ডম উদাহরণ"} /></div>
      <p className="mt-4 rounded-2xl bg-mint px-4 py-3 text-center text-lg font-semibold ring-1 ring-ink/[.06]">
        <span className="num">{av} + {bv}{cin ? " + 1" : ""} = <b>{total}</b></span> <span className="text-ink/50">→</span> <Eq>{bin(total, 5)}</Eq>
      </p>
      <div className="mx-auto mt-2 max-w-xl">
        <Bits3D bits={result} height={118} />
        <div className="grid grid-cols-5 text-center">{["Cout", "S₃", "S₂", "S₁", "S₀"].map((l) => <span key={l} className="num text-xs font-bold text-ink/50">{l}</span>)}</div>
      </div>
      <p className="mt-3 text-center text-sm text-ink/55">প্রথমে বিট ০ যোগ হয়; তার ক্যারি পরের বিটে যায় (ডানে থেকে বামে)। এভাবে ক্যারি সারি ধরে ছড়ায় বলে একে <b>রিপল-ক্যারি অ্যাডার</b> বলে।</p>
    </div>
  );
}

export function Adder() {
  const [v, setV] = useState("half");
  const half = useMemo(() => autoLayout(HA, { inGap: 64 }), []);
  const full = useMemo(() => autoLayout(FA, { inGap: 60 }), []);
  return (
    <div className="space-y-4">
      <Panel>
        <P>**অ্যাডার (Adder)** এমন সার্কিট যা বাইনারি সংখ্যা যোগ করে। **হাফ অ্যাডার** দুটি বিট যোগ করে; **ফুল অ্যাডার** আগের ধাপের ক্যারিসহ তিনটি বিট যোগ করে। অনেক ফুল অ্যাডার পরপর জুড়ে বহু-বিটের যোগ করা হয়।</P>
        <div className="mt-3"><PillChoice id="adder" value={v} onChange={setV} options={[{ id: "half", label: "হাফ অ্যাডার" }, { id: "full", label: "ফুল অ্যাডার" }, { id: "ripple", label: "৪-বিট অ্যাডার" }]} /></div>
      </Panel>
      {v === "half" && (
        <Panel title="হাফ অ্যাডার (Half Adder)" sub="একটি XOR ও একটি AND গেট দিয়ে তৈরি।">
          <div className="mb-3 flex flex-wrap gap-2"><Eq>Sum = A ⊕ B</Eq><Eq>Carry = A·B</Eq></div>
          <Lab net={half} init={{ A: 1, B: 1 }} below={(st) => <p className="mt-3 rounded-2xl bg-mint px-4 py-3 text-center font-semibold ring-1 ring-ink/[.06]"><span className="num">{st.A} + {st.B} = {st.A + st.B}</span> → ক্যারি <Eq>{st.A & st.B}</Eq> সাম <Eq>{st.A ^ st.B}</Eq> (বাইনারি <Eq>{bin(st.A + st.B, 2)}</Eq>)</p>} />
          <P className="mt-3">সীমাবদ্ধতা: হাফ অ্যাডার আগের ধাপের ক্যারি নিতে পারে না। তাই বহু-বিট যোগে ফুল অ্যাডার লাগে।</P>
        </Panel>
      )}
      {v === "full" && (
        <Panel title="ফুল অ্যাডার (Full Adder)" sub="দুটি হাফ অ্যাডার (XOR+AND) ও একটি OR গেট দিয়ে তৈরি।">
          <div className="mb-3 flex flex-wrap gap-2"><Eq>Sum = A ⊕ B ⊕ Cin</Eq><Eq>Cout = A·B + Cin·(A ⊕ B)</Eq></div>
          <Lab net={full} init={{ A: 1, B: 1, Cin: 1 }} below={(st) => { const t = st.A + st.B + st.Cin; return <p className="mt-3 rounded-2xl bg-mint px-4 py-3 text-center font-semibold ring-1 ring-ink/[.06]"><span className="num">{st.A} + {st.B} + {st.Cin} = {t}</span> → Cout <Eq>{t >> 1}</Eq> Sum <Eq>{t & 1}</Eq> (বাইনারি <Eq>{bin(t, 2)}</Eq>)</p>; }} />
        </Panel>
      )}
      {v === "ripple" && <Panel title="৪-বিট রিপল-ক্যারি অ্যাডার" sub="চারটি ফুল অ্যাডার পরপর জোড়া। A ও B এর বিট বদলে ক্যারি ছড়াতে দেখো।"><Ripple /></Panel>}
    </div>
  );
}
