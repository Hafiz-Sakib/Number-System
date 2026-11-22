import TopicPage from "./logic/Shell";
import { BasicGates, SpecialGates, Universal } from "./logic/Gates";
import { Adder, Decoder, Encoder } from "./logic/Combinational";
import { Counter, Register } from "./logic/Sequential";

/* এইচএসসি আইসিটি 3.7: লজিক গেট ও ডিজিটাল ডিভাইস */
const TOPICS = [
  ["basic", "3.7.5", "মৌলিক গেট", "AND, OR, NOT Gate", BasicGates],
  ["universal", "3.7.6", "সর্বজনীন গেট", "Universal Gate", Universal],
  ["special", "3.7.7", "বিশেষ গেট", "XOR, XNOR Gate", SpecialGates],
  ["encoder", "3.7.8", "এনকোডার", "Encoder", Encoder],
  ["decoder", "3.7.9", "ডিকোডার", "Decoder", Decoder],
  ["adder", "3.7.10", "অ্যাডার", "Adder", Adder],
  ["register", "3.7.11", "রেজিস্টার", "Register", Register],
  ["counter", "3.7.12", "কাউন্টার", "Counter", Counter],
];

export default function LogicGates() {
  return <TopicPage title="লজিক গেট" sub="গেট, অ্যাডার, এনকোডার, রেজিস্টার, কাউন্টার। সুইচ টিপে সার্কিট নিজে চালিয়ে দেখুন।" topics={TOPICS} />;
}
