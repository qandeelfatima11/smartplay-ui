import { motion } from "framer-motion";
import { User, Baby, Globe, Bell, ChevronRight, LogOut, Pencil, Check, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Profile = () => {
  const { data: profile, isLoading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      if (editing === "parentName") {
        const { error } = await supabase
          .from("profiles")
          .update({ name: editValue.trim() })
          .eq("id", profile.profileId);
        if (error) throw error;
      } else if (editing === "childName" && profile.childId) {
        const { error } = await supabase
          .from("children")
          .update({ name: editValue.trim() })
          .eq("id", profile.childId);
        if (error) throw error;
      } else if (editing === "childAge" && profile.childId) {
        const age = parseInt(editValue);
        if (isNaN(age) || age < 1 || age > 18) {
          toast.error("Please enter a valid age (1-18)");
          setSaving(false);
          return;
        }
        const { error } = await supabase
          .from("children")
          .update({ age })
          .eq("id", profile.childId);
        if (error) throw error;
      } else if (editing === "language" && profile.childId) {
        const { error } = await supabase
          .from("children")
          .update({ language: editValue.trim() })
          .eq("id", profile.childId);
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Updated successfully!");
      setEditing(null);
      setEditValue("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const items = [
    { icon: User, label: "Parent Name", value: profile?.parentName ?? "—", field: "parentName" },
    { icon: Baby, label: "Child's Name", value: profile?.childName ?? "—", field: "childName" },
    { icon: Baby, label: "Child's Age", value: profile?.childAge ? `${profile.childAge}` : "—", field: "childAge", displayValue: profile?.childAge ? `${profile.childAge} years` : "—" },
    { icon: Globe, label: "Language", value: profile?.language ?? "—", field: "language" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-sky flex items-center justify-center text-3xl mb-3">
          👩‍👦
        </div>
        <h2 className="text-lg font-bold text-foreground">{profile?.parentName ?? "Parent"}</h2>
        <p className="text-sm text-muted-foreground">Parent of {profile?.childName ?? "..."}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 px-4 py-4">
            <item.icon className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              {editing === item.field ? (
                <div className="flex items-center gap-2 mt-1">
                  {item.field === "language" ? (
                    <div className="flex gap-2">
                      {["English", "Urdu"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setEditValue(lang)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${
                            editValue === lang
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  ) : item.field === "childAge" ? (
                    <div className="flex gap-2">
                      {["2", "3", "4", "5"].map((age) => (
                        <button
                          key={age}
                          onClick={() => setEditValue(age)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border transition-colors ${
                            editValue === age
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-foreground border-border"
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="py-1 px-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
                      autoFocus
                    />
                  )}
                  <button onClick={saveEdit} disabled={saving} className="p-1 text-secondary hover:opacity-80">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-destructive hover:opacity-80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">{item.displayValue ?? item.value}</p>
              )}
            </div>
            {editing !== item.field && (
              <button onClick={() => startEdit(item.field, item.value === "—" ? "" : item.value)}>
                <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>
            )}
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 bg-card rounded-2xl border border-border px-4 py-4 flex items-center gap-4">
        <Bell className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Notifications</p>
          <p className="text-sm font-semibold text-foreground">{notifications ? "Enabled" : "Disabled"}</p>
        </div>
        <button
          onClick={() => setNotifications(!notifications)}
          className={`w-12 h-7 rounded-full transition-colors relative ${notifications ? "bg-primary" : "bg-muted"}`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-1 transition-transform ${
              notifications ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-destructive text-destructive-foreground font-semibold py-3.5 rounded-2xl transition-opacity hover:opacity-90"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
