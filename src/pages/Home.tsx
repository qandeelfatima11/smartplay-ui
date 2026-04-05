import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useProfile } from "@/hooks/useProfile";
import { useActivities } from "@/hooks/useActivities";
import { useProgress } from "@/hooks/useProgress";

const Home = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: activities, isLoading: activitiesLoading } = useActivities(profile?.childId ?? null);
  const { data: progress, isLoading: progressLoading } = useProgress(profile?.childId ?? null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (profileLoading || activitiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const completedCount = progress?.completedActivities ?? 0;
  // Show first non-completed activity as today's activity, or first one if all completed
  const todayActivity = activities?.find((a) => !a.completed) ?? activities?.[0];

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm">👋 {greeting},</p>
        <h1 className="text-2xl font-bold text-foreground">{profile?.parentName ?? "Parent"}</h1>
      </motion.div>

      {todayActivity && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Today's Activity</h2>
          <ActivityCard activity={todayActivity} featured />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid grid-cols-2 gap-3"
      >
        <div className="bg-mint rounded-2xl p-4">
          <CheckCircle2 className="w-6 h-6 text-secondary mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="bg-peach rounded-2xl p-4">
          <Star className="w-6 h-6 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{progress?.streakDays ?? 0}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </motion.div>

      {activities && activities.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">More Activities</h2>
          <div className="space-y-3">
            {activities.filter((a) => a.id !== todayActivity?.id).slice(0, 4).map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
