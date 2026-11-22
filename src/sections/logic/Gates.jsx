import { useMemo, useState } from "react";
import { Lab, TruthTable } from "../../components/Circuit";
import { PillChoice } from "../../components/controls";
import { Rich } from "../../components/Steps";
import { astToSpec, autoLayout, parseExpr } from "../../lib/logic";
import { ExprLab } from "./Algebra";
import { Eq, P, Panel, gateNet, spec } from "./shared";

const INFO = {
  AND: { bn: "অ্যান্ড গেট", expr: (n) => `Y = ${"ABCD".slice(0, n).split("").join("·")}`, say: "**সব** ইনপুট 1 হলেই আউটপুট 1। সিরিজে যুক্ত সুইচের মতো: সবকটি সুইচ চালু থাকলে তবেই বাতি জ্বলে।", multi: true },
  OR: { bn: "অর গেট", expr: (n) => `Y = ${"ABCD".slice(0, n).split("").join(" + ")}`, say: "**যেকোনো একটি** ইনপুট 1 হলেই আউটপুট 1। প্যারালাল সুইচের মতো: যেকোনো একটি চালু থাকলেই বাতি জ্বলে।", multi: true },
  NOT: { bn: "নট গেট (ইনভার্টার)", expr: () => "Y = A'", say: "ইনপুটের **উল্টো** মান দেয়: 0 → 1, 1 → 0। এতে একটিই ইনপুট থাকে।" },
  NAND: { bn: "ন্যান্ড গেট", expr: (n) => `Y = (${"ABCD".slice(0, n).split("").join("·")})'`, say: "AND এর উল্টো। সব ইনপুট 1 হলে **শুধু তখনই** 0, অন্য সব ক্ষেত্রে 1।", multi: true },
  NOR: { bn: "নর গেট", expr: (n) => `Y = (${"ABCD".slice(0, n).split("").join(" + ")})'`, say: "OR এর উল্টো। সব ইনপুট 0 হলে **শুধু তখনই** 1, অন্য সব ক্ষেত্রে 0।", multi: true },
  XOR: { bn: "এক্সক্লুসিভ-অর গেট", expr: () => "Y = A⊕B = A'·B + A·B'", say: "ইনপুট দুটি **ভিন্ন** হলে আউটপুট 1 (1-এর সংখ্যা বিজোড় হলে 1)।" },
  XNOR: { bn: "এক্সক্লুসিভ-নর গেট", expr: () => "Y = (A⊕B)' = A·B + A'·B'", say: "ইনপুট দুটি **সমান** হলে আউটপুট 1। এটি XOR এর উল্টো, তাই একে সমতা ডিটেক্টরও বলে।" },
};

/** একটি গেটের ল্যাব: সার্কিট + সত্যক সারণী + বর্ণনা; AND/OR/NAND/NOR এ ২ বা ৩ ইনপুট বেছে নেওয়া যায় */
export function GateLab({ type, title }) {
  const I = INFO[type];
  const [n, setN] = useState(2);
  const k = I.multi ? n : type === "NOT" ? 1 : 2;
  const net = useMemo(() => gateNet(type, k), [type, k]);
  return (
    <Panel title={title ?? `${I.bn} (${type})`}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Eq className="text-lg">{I.expr(k)}</Eq>
        {I.multi && <PillChoice id={`n-${type}`} value={n} onChange={setN} options={[{ id: 2, label: "২ ইনপুট" }, { id: 3, label: "৩ ইনপুট" }]} />}
      </div>
      <P className="mb-4">{I.say}</P>
      <Lab net={net} />
    </Panel>
  );
}

/* ---------- 3.7.3 সত্যক সারণী ---------- */
function RowsDemo() {
  const [n, setN] = useState(3);
  const cols = "ABCD".slice(0, n).split("");
  const rows = Array.from({ length: 1 << n }, (_, k) => ({ in: cols.map((_, i) => (k >> (n - 1 - i)) & 1), out: [] }));
  return (
    <div>
      <PillChoice id="rows-n" value={n} onChange={setN} options={[1, 2, 3, 4].map((x) => ({ id: x, label: `${x} ইনপুট` }))} />
      <p className="mt-3 text-ink/70"><Rich text={`{{${n}}} টি ইনপুটের সম্ভাব্য সংমিশ্রণ = 2^[${n}] = **${1 << n}** টি সারি। ইনপুটগুলো বাইনারি গণনার মতো 0 থেকে শুরু করে সাজানো হয়।`} /></p>
      <div className="mt-3 overflow-x-auto no-sb rounded-2xl"><TruthTable ins={cols} outs={[]} rows={rows} /></div>
    </div>
  );
}

export function TruthTables() {
  const [t, setT] = useState("AND");
  return (
    <div className="space-y-4">
      <Panel>
        <P>**সত্যক সারণী (Truth Table)** হলো কোনো লজিক সার্কিট বা বুলিয়ান ফাংশনের সব সম্ভাব্য ইনপুট সংমিশ্রণ এবং প্রতিটির জন্য আউটপুটের তালিকা। সারণী থেকেই বোঝা যায় সার্কিটটি ঠিক কী কাজ করে।</P>
      </Panel>
      <Panel title="সারির সংখ্যা কীভাবে হিসাব হয়?"><RowsDemo /></Panel>
      <Panel title="সব গেটের সত্যক সারণী" sub="একটি গেট বেছে নিন, সুইচ টিপে ইনপুট বদলান, সারণীর সংশ্লিষ্ট সারি হাইলাইট হবে।">
        <div className="mb-4"><PillChoice id="tt-gate" value={t} onChange={setT} options={Object.keys(INFO).map((g) => ({ id: g, label: g }))} /></div>
        <GateBody key={t} type={t} />
      </Panel>
      <Panel title="নিজের রাশির সত্যক সারণী" sub="যেকোনো রাশি লিখে তার সারণী বানিয়ে নিন (সর্বোচ্চ 5 চলক = 32 সারি)।"><ExprLab initial="A·B' + C" /></Panel>
    </div>
  );
}
function GateBody({ type }) {
  const I = INFO[type];
  const [n, setN] = useState(2);
  const k = I.multi ? n : type === "NOT" ? 1 : 2;
  const net = useMemo(() => gateNet(type, k), [type, k]);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2"><Eq className="text-lg">{I.expr(k)}</Eq>{I.multi && <PillChoice id={`tt-n-${type}`} value={n} onChange={setN} options={[{ id: 2, label: "২ ইনপুট" }, { id: 3, label: "৩ ইনপুট" }]} />}</div>
      <P className="mb-4">{I.say}</P>
      <Lab net={net} />
    </div>
  );
}

/* ---------- 3.7.5 মৌলিক গেট ---------- */
export function BasicGates() {
  return (
    <div className="space-y-4">
      <Panel><P>ডিজিটাল সার্কিটের সবচেয়ে ছোট একক হলো **লজিক গেট**। **AND, OR ও NOT** তিনটি মৌলিক গেট; অন্য সব গেট ও সার্কিট এদের দিয়েই বানানো যায়। প্রতিটির নিচে সুইচ টিপুন: ইনপুট 1 হলে তার সবুজ হয়ে সিগন্যাল চলতে দেখা যাবে।</P></Panel>
      <GateLab type="AND" />
      <GateLab type="OR" />
      <GateLab type="NOT" />
    </div>
  );
}

/* ---------- 3.7.6 সর্বজনীন গেট ---------- */
const UNI = {
  NAND: {
    NOT: { s: spec(["A"], [["g1", "NAND", ["A", "A"]]], [["Y", "g1"]]), eq: "(A·A)' = A'", say: "দুই ইনপুটে একই সিগন্যাল দিলে NAND কেবল ইনভার্টার হয়ে যায়।" },
    AND: { s: spec(["A", "B"], [["g1", "NAND", ["A", "B"]], ["g2", "NAND", ["g1", "g1"]]], [["Y", "g2"]]), eq: "((A·B)')' = A·B", say: "NAND এর পর একটি NAND-ইনভার্টার বসালে AND পাওয়া যায়।" },
    OR: { s: spec(["A", "B"], [["g1", "NAND", ["A", "A"]], ["g2", "NAND", ["B", "B"]], ["g3", "NAND", ["g1", "g2"]]], [["Y", "g3"]]), eq: "(A'·B')' = A + B", say: "আগে দুই ইনপুট উল্টে নিই, তারপর NAND করি। ডি-মরগান: (A'·B')' = A + B।" },
  },
  NOR: {
    NOT: { s: spec(["A"], [["g1", "NOR", ["A", "A"]]], [["Y", "g1"]]), eq: "(A + A)' = A'", say: "দুই ইনপুটে একই সিগন্যাল দিলে NOR কেবল ইনভার্টার হয়ে যায়।" },
    OR: { s: spec(["A", "B"], [["g1", "NOR", ["A", "B"]], ["g2", "NOR", ["g1", "g1"]]], [["Y", "g2"]]), eq: "((A + B)')' = A + B", say: "NOR এর পর একটি NOR-ইনভার্টার বসালে OR পাওয়া যায়।" },
    AND: { s: spec(["A", "B"], [["g1", "NOR", ["A", "A"]], ["g2", "NOR", ["B", "B"]], ["g3", "NOR", ["g1", "g2"]]], [["Y", "g3"]]), eq: "(A' + B')' = A·B", say: "আগে দুই ইনপুট উল্টে নিই, তারপর NOR করি। ডি-মরগান: (A' + B')' = A·B।" },
  },
};

export function Universal() {
  const [base, setBase] = useState("NAND");
  const [to, setTo] = useState("AND");
  const U = UNI[base][to];
  const net = useMemo(() => autoLayout(U.s, { inGap: 52 }), [U]);
  return (
    <div className="space-y-4">
      <Panel>
        <P>**NAND** ও **NOR** কে **সর্বজনীন গেট (Universal Gate)** বলা হয়, কারণ শুধু একটি ধরনের গেট দিয়েই AND, OR ও NOT তিনটিই বানানো যায়। বাস্তবে এগুলো সস্তা ও ছোট, তাই আইসি-তে সবচেয়ে বেশি ব্যবহৃত হয়।</P>
      </Panel>
      <GateLab type="NAND" />
      <GateLab type="NOR" />
      <Panel title="শুধু একটি গেট দিয়ে সব বানাই" sub="কোন গেট দিয়ে, কী বানাবেন বেছে নিন।">
        <div className="flex flex-wrap gap-2">
          <PillChoice id="uni-base" value={base} onChange={setBase} options={[{ id: "NAND", label: "NAND দিয়ে" }, { id: "NOR", label: "NOR দিয়ে" }]} />
          <PillChoice id="uni-to" value={to} onChange={setTo} options={["NOT", "AND", "OR"].map((x) => ({ id: x, label: `${x} বানাই` }))} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3"><Eq className="text-lg">{U.eq}</Eq></div>
        <P className="mb-4 mt-2">{U.say}</P>
        <Lab key={`${base}-${to}`} net={net} />
      </Panel>
    </div>
  );
}

/* ---------- 3.7.7 বিশেষ গেট ---------- */
export function SpecialGates() {
  const xorNet = useMemo(() => autoLayout(astToSpec(parseExpr("A'·B + A·B'").ast), { inGap: 52 }), []);
  const xnorNet = useMemo(() => autoLayout(astToSpec(parseExpr("A·B + A'·B'").ast), { inGap: 52 }), []);
  return (
    <div className="space-y-4">
      <Panel><P>**XOR** ও **XNOR** বিশেষ গেট, কারণ এরা দুটি বিটের **তুলনা** করে। যোগকারী (adder) সার্কিটের মূল উপাদান XOR; আর সমতা যাচাইয়ে XNOR লাগে।</P></Panel>
      <GateLab type="XOR" />
      <GateLab type="XNOR" />
      <Panel title="মৌলিক গেট দিয়ে XOR" sub="XOR = A'·B + A·B': দুটি NOT, দুটি AND ও একটি OR লাগে।"><Lab net={xorNet} /></Panel>
      <Panel title="মৌলিক গেট দিয়ে XNOR" sub="XNOR = A·B + A'·B': ইনপুট সমান হলে 1।"><Lab net={xnorNet} /></Panel>
    </div>
  );
}
