import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Activity } from "@/data/mockData";

interface ActivityCardProps {
  activity: Activity;
  featured?: boolean;
}

const ActivityCard = ({ activity, featured = false }: ActivityCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 shadow-sm border border-border cursor-pointer transition-shadow hover:shadow-md ${
        featured ? "bg-sky" : "bg-card"
      }`}
      onClick={() => navigate(`/activity/${activity.id}`)}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{activity.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{activity.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
          <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{activity.duration}</span>
          </div>
        </div>
      </div>
      {featured && (
        <button
          className="mt-4 w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-base transition-colors hover:opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/activity/${activity.id}`);
          }}
        >
          Start Activity
        </button>
      )}
    </motion.div>
  );
};

export default ActivityCard;
