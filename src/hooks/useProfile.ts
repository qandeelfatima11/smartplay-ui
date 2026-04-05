import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileWithChild {
  profileId: string;
  parentName: string;
  childId: string | null;
  childName: string | null;
  childAge: number | null;
  language: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<ProfileWithChild | null> => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) return null;

      const { data: children } = await supabase
        .from("children")
        .select("*")
        .eq("profile_id", profile.id)
        .limit(1);

      const child = children?.[0] ?? null;

      return {
        profileId: profile.id,
        parentName: profile.name || user.user_metadata?.name || "Parent",
        childId: child?.id ?? null,
        childName: child?.name ?? null,
        childAge: child?.age ?? null,
        language: child?.language ?? null,
      };
    },
    enabled: !!user,
  });
};
