import TopicPage from "./logic/Shell";
import { Algebra, DeMorgan, Theorems } from "./logic/Algebra";
import { TruthTables } from "./logic/Gates";

/* এইচএসসি আইসিটি 3.7: বুলিয়ান এলজেবরা (রাশি, উপপাদ্য, সত্যক সারণী, ডি-মরগান) */
const TOPICS = [
  ["algebra", "3.7.1", "বুলিয়ান এলজেবরা", "Boolean Algebra", Algebra],
  ["theorem", "3.7.2", "বুলিয়ান উপপাদ্য", "Boolean Theorem", Theorems],
  ["truth", "3.7.3", "সত্যক সারণী", "Truth Table", TruthTables],
  ["demorgan", "3.7.4", "ডি-মরগানের উপপাদ্য", "De Morgan's Theorem", DeMorgan],
];

export default function BooleanAlgebra() {
  return <TopicPage title="বুলিয়ান এলজেবরা" sub="রাশি, উপপাদ্য, সত্যক সারণী ও ডি-মরগান। নিজের রাশি লিখে সার্কিট ও সারণী (সর্বোচ্চ 4 চলক) বানিয়ে দেখুন।" topics={TOPICS} />;
}
