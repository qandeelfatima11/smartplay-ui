import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProgressSummary {
  completedActivities: number;
  streakDays: number;
  strengths: { area: string; score: number }[];
  weeklyProgress: { day: string; activities: number }[];
}

export const useProgress = (childId: string | null) => {
  return useQuery({
    queryKey: ["progress", childId],
    queryFn: async (): Promise<ProgressSummary> => {
      if (!childId) {
        return { completedActivities: 0, streakDays: 0, strengths: [], weeklyProgress: [] };
      }

      // Total completed
      const { data: allPlans } = await supabase
        .from("daily_plans")
        .select("id, completed, completed_at, plan_date, activity_id")
        .eq("child_id", childId)
        .eq("completed", true);

      const completedActivities = allPlans?.length ?? 0;

      // Streak calculation
      let streakDays = 0;
      if (allPlans && allPlans.length > 0) {
        const completedDates = [...new Set(allPlans.map((p) => p.plan_date))].sort().reverse();
        const today = new Date();
        for (let i = 0; i < completedDates.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          const expectedStr = expected.toISOString().split("T")[0];
          if (completedDates.includes(expectedStr)) {
            streakDays++;
          } else {
            break;
          }
        }
      }

      // Category strengths from progress_tracking
      const { data: tracking } = await supabase
        .from("progress_tracking")
        .select("category, completed_count, average_rating")
        .eq("child_id", childId);

      const maxCount = Math.max(...(tracking ?? []).map((t) => t.completed_count), 1);
      const strengths = (tracking ?? []).map((t) => ({
        area: t.category,
        score: Math.round((t.completed_count / maxCount) * 100),
      }));

      // Weekly progress
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const weeklyProgress = weekDays.map((day, i) => {
        const d = new Date(today);
        const currentDay = today.getDay();
        d.setDate(d.getDate() - ((currentDay - i + 7) % 7));
        const dateStr = d.toISOString().split("T")[0];
        const count = allPlans?.filter((p) => p.plan_date === dateStr).length ?? 0;
        return { day, activities: count };
      });

      return { completedActivities, streakDays, strengths, weeklyProgress };
    },
    enabled: !!childId,
  });
};
