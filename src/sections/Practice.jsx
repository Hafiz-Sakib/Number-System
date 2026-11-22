import { useState } from "react";
import { SectionTitle } from "../components/ui";
import { PillChoice } from "../components/controls";
import { QUESTIONS } from "../lib/quizbank";
import Quiz from "./Quiz";
import WritePractice from "./WritePractice";

/* অনুশীলন: ডিফল্ট বহুনির্বাচনী কুইজ; চাইলে লিখে উত্তর দেওয়ার এলোমেলো প্রশ্নও আছে */
export default function Practice() {
  const [tab, setTab] = useState("quiz");
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <SectionTitle title="অনুশীলন" sub={`${QUESTIONS.length}টি বহুনির্বাচনী প্রশ্নের কুইজ: রূপান্তর, যোগ-বিয়োগ-গুণ-ভাগ, পরিপূরক, লজিক গেট ও বুলিয়ান এলজেবরা। উত্তরের সাথে সাথে ব্যাখ্যা ও পুরো সমাধান।`} />
      <div className="mb-5">
        <PillChoice id="ptab" value={tab} onChange={setTab} options={[{ id: "quiz", label: "বহুনির্বাচনী কুইজ" }, { id: "write", label: "লিখে অনুশীলন" }]} />
      </div>
      {tab === "quiz" ? <Quiz /> : <WritePractice />}
    </div>
  );
}
