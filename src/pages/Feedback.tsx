import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const options = [
  { label: "Yes", emoji: "👍", value: "yes" },
  { label: "Somewhat", emoji: "🤔", value: "somewhat" },
  { label: "No", emoji: "❌", value: "no" },
];

const Feedback = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-12 pb-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Great job!</h1>
        <p className="text-muted-foreground mb-8">Did your child understand the activity?</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all ${
                selected === opt.value
                  ? "border-primary bg-sky"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-sm font-semibold text-foreground">{opt.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Notes (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any observations about your child..."
            rows={3}
            className="w-full py-3 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base resize-none"
          />
        </div>
      </motion.div>

      <button
        onClick={() => navigate("/home")}
        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg transition-opacity hover:opacity-90"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default Feedback;
