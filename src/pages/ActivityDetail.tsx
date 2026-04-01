import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, ChevronRight, CheckCircle } from "lucide-react";
import { activities } from "@/data/mockData";

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const activity = activities.find((a) => a.id === id);
  const [currentStep, setCurrentStep] = useState(0);

  if (!activity) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Activity not found</div>;
  }

  const step = activity.steps[currentStep];
  const isLast = currentStep === activity.steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{activity.icon} {activity.title}</h1>
          <p className="text-sm text-muted-foreground">{activity.duration}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5 px-5 mb-6">
        {activity.steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= currentStep ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step card */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-primary bg-sky px-3 py-1 rounded-full">
                Step {step.id} of {activity.steps.length}
              </span>
              <button className="flex items-center gap-1.5 text-sm text-primary font-medium bg-sky px-3 py-1.5 rounded-full">
                <Volume2 className="w-4 h-4" />
                Listen
              </button>
            </div>
            <p className="text-foreground text-lg leading-relaxed">{step.instruction}</p>
            {step.tip && (
              <div className="mt-4 bg-warm rounded-xl p-3">
                <p className="text-sm text-accent-foreground">💡 <span className="font-semibold">Tip:</span> {step.tip}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div className="p-5 space-y-3">
        {isLast ? (
          <button
            onClick={() => navigate(`/feedback/${activity.id}`)}
            className="w-full bg-secondary text-secondary-foreground font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            <CheckCircle className="w-5 h-5" />
            Finish Activity
          </button>
        ) : (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
