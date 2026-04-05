import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [saving, setSaving] = useState(false);

  // If user already has a child, skip to home
  if (profile?.childId) {
    navigate("/home", { replace: true });
    return null;
  }

  const slides = [
    {
      emoji: "🌟",
      title: "Welcome to SmartPlay AI",
      subtitle: "Guide your child's early learning through fun, screen-free activities.",
    },
    {
      emoji: "🧩",
      title: "Real-World Play",
      subtitle: "Short 5–10 minute activities using everyday objects. No screens needed for your child!",
    },
  ];

  const handleGetStarted = async () => {
    if (!childName.trim() || !childAge || !user) return;
    setSaving(true);
    try {
      // Get profile id
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!prof) throw new Error("Profile not found");

      const { error } = await supabase.from("children").insert({
        profile_id: prof.id,
        name: childName.trim(),
        age: parseInt(childAge),
        language,
      });

      if (error) throw error;
      navigate("/home");
    } catch (err: any) {
      toast.error(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence mode="wait">
        {step < 2 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="text-7xl mb-6">{slides[step].emoji}</div>
            <h1 className="text-2xl font-bold text-foreground mb-3">{slides[step].title}</h1>
            <p className="text-muted-foreground text-base max-w-xs">{slides[step].subtitle}</p>
            <div className="flex gap-2 mt-8">
              {[0, 1].map((i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <button
              onClick={() => setStep(step + 1)}
              className="mt-10 flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 px-8 rounded-2xl text-lg transition-opacity hover:opacity-90"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col px-6 pt-12 pb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold text-foreground">Tell us about your child</h1>
            </div>
            <p className="text-muted-foreground mb-8">We'll personalize activities just for them.</p>

            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Child's Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g., Aayan"
                  className="w-full py-3.5 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Age</label>
                <div className="flex gap-3">
                  {["2", "3", "4", "5"].map((age) => (
                    <button
                      key={age}
                      onClick={() => setChildAge(age)}
                      className={`flex-1 py-3.5 rounded-xl font-semibold text-lg border transition-colors ${
                        childAge === age
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Language</label>
                <div className="flex gap-3">
                  {["English", "Urdu"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-3.5 rounded-xl font-semibold border transition-colors ${
                        language === lang
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              disabled={saving || !childName.trim() || !childAge}
              className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg transition-opacity hover:opacity-90 mt-6 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Get Started 🚀"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
