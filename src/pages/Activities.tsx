import { useState } from "react";
import { motion } from "framer-motion";
import ActivityCard from "@/components/ActivityCard";
import { useActivities } from "@/hooks/useActivities";
import { useProfile } from "@/hooks/useProfile";

const categories = ["All", "Cognitive", "Math", "Language"];

const Activities = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: profile } = useProfile();
  const { data: activities, isLoading } = useActivities(profile?.childId ?? null);

  const filtered = activeCategory === "All" 
    ? (activities ?? []) 
    : (activities ?? []).filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <h1 className="text-2xl font-bold text-foreground mb-1">Activities</h1>
      <p className="text-muted-foreground text-sm mb-5">Choose an activity to start learning</p>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center mt-10">Loading activities...</p>
      ) : (
        <motion.div layout className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ActivityCard activity={a} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Activities;
