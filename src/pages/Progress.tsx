import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { useProfile } from "@/hooks/useProfile";
import { useProgress } from "@/hooks/useProgress";

const Progress = () => {
  const { data: profile } = useProfile();
  const { data: progress, isLoading } = useProgress(profile?.childId ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading progress...</p>
      </div>
    );
  }

  const maxActivities = Math.max(...(progress?.weeklyProgress ?? []).map((d) => d.activities), 1);

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <h1 className="text-2xl font-bold text-foreground mb-1">Progress</h1>
      <p className="text-muted-foreground text-sm mb-6">Track {profile?.childName ?? "your child"}'s learning journey</p>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-mint rounded-2xl p-4 text-center">
          <Trophy className="w-6 h-6 text-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{progress?.completedActivities ?? 0}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-lavender rounded-2xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{progress?.streakDays ?? 0} days</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">This Week</h2>
        <div className="bg-card rounded-2xl p-4 border border-border flex items-end justify-between gap-1 h-32">
          {(progress?.weeklyProgress ?? []).map((d) => (
            <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
              <div className="w-full flex justify-center">
                <motion.div
                  className="w-6 bg-primary rounded-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.activities / maxActivities) * 60}px` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {progress?.strengths && progress.strengths.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Category Progress</h2>
          <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
            {progress.strengths.map((s) => (
              <ProgressBar key={s.area} label={s.area} value={s.score} color="bg-secondary" />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Progress;
