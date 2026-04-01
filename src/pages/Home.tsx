import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { activities, userProfile, progressData } from "@/data/mockData";

const Home = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const todayActivity = activities[0];
  const completedCount = activities.filter((a) => a.completed).length;

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground text-sm">👋 {greeting},</p>
        <h1 className="text-2xl font-bold text-foreground">{userProfile.parentName}</h1>
      </motion.div>

      {/* Today's Activity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Today's Activity</h2>
        <ActivityCard activity={todayActivity} featured />
      </motion.div>

      {/* Progress Summary */}
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
          <p className="text-2xl font-bold text-foreground">{progressData.streakDays}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </motion.div>

      {/* More Activities */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">More Activities</h2>
        <div className="space-y-3">
          {activities.slice(1, 4).map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
