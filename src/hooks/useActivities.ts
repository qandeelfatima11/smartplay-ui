import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityStep {
  id: number;
  instruction: string;
  tip?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: string;
  steps: ActivityStep[];
  completed?: boolean;
}

export const useActivities = (childId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activities", childId],
    queryFn: async (): Promise<Activity[]> => {
      const { data: activities, error } = await supabase
        .from("activities")
        .select("*");

      if (error) throw error;

      // Get today's completed plans for this child
      let completedActivityIds: string[] = [];
      if (childId) {
        const today = new Date().toISOString().split("T")[0];
        const { data: plans } = await supabase
          .from("daily_plans")
          .select("activity_id, completed")
          .eq("child_id", childId)
          .eq("completed", true);

        completedActivityIds = (plans ?? []).map((p) => p.activity_id);
      }

      return (activities ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        duration: a.duration,
        category: a.category,
        icon: a.icon,
        steps: (a.steps as unknown as ActivityStep[]) ?? [],
        completed: completedActivityIds.includes(a.id),
      }));
    },
    enabled: !!user,
  });
};
