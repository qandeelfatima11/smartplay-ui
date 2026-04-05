import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const options = [
  { label: "Yes", emoji: "👍", value: "yes" },
  { label: "Somewhat", emoji: "🤔", value: "somewhat" },
  { label: "No", emoji: "❌", value: "no" },
];

const Feedback = () => {
  const { id: activityId } = useParams();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || !activityId || !profile?.childId) return;
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Step 1: Check if plan already exists for this activity+child+date
      const { data: existingPlan } = await supabase
        .from("daily_plans")
        .select("id")
        .eq("child_id", profile.childId)
        .eq("activity_id", activityId)
        .eq("plan_date", today)
        .maybeSingle();

      let planId: string;

      if (existingPlan) {
        planId = existingPlan.id;
        // Mark as completed
        const { error: updateErr } = await supabase
          .from("daily_plans")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("id", planId);
        if (updateErr) throw updateErr;
      } else {
        // Create new plan marked as completed
        const { data: newPlan, error: planError } = await supabase
          .from("daily_plans")
          .insert({
            child_id: profile.childId,
            activity_id: activityId,
            plan_date: today,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (planError) throw planError;
        planId = newPlan.id;
      }

      // Step 2: Check if feedback already exists for this plan
      const { data: existingFeedback } = await supabase
        .from("feedback")
        .select("id")
        .eq("daily_plan_id", planId)
        .maybeSingle();

      if (existingFeedback) {
        // Update existing feedback
        const { error: fbError } = await supabase
          .from("feedback")
          .update({ rating: selected, notes: note || null })
          .eq("id", existingFeedback.id);
        if (fbError) throw fbError;
      } else {
        // Insert new feedback
        const { error: fbError } = await supabase.from("feedback").insert({
          daily_plan_id: planId,
          rating: selected,
          notes: note || null,
        });
        if (fbError) throw fbError;
      }

      // Step 3: Update progress tracking
      const { data: activity } = await supabase
        .from("activities")
        .select("category")
        .eq("id", activityId)
        .single();

      if (activity) {
        const ratingVal = selected === "yes" ? 5 : selected === "somewhat" ? 3 : 1;

        const { data: existing } = await supabase
          .from("progress_tracking")
          .select("*")
          .eq("child_id", profile.childId)
          .eq("category", activity.category)
          .maybeSingle();

        if (existing) {
          const newCount = existing.completed_count + 1;
          const newAvg =
            (existing.average_rating * existing.completed_count + ratingVal) /
            newCount;
          const { error: progErr } = await supabase
            .from("progress_tracking")
            .update({ completed_count: newCount, average_rating: newAvg })
            .eq("id", existing.id);
          if (progErr) throw progErr;
        } else {
          const { error: progErr } = await supabase
            .from("progress_tracking")
            .insert({
              child_id: profile.childId,
              category: activity.category,
              completed_count: 1,
              average_rating: ratingVal,
            });
          if (progErr) throw progErr;
        }
      }

      // Invalidate all relevant queries so UI updates
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["activities"] }),
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);

      toast.success("Activity completed! 🎉");
      navigate("/home");
    } catch (err: any) {
      console.error("Feedback submit error:", err);
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

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
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
};

export default Feedback;
