import { motion } from "framer-motion";
import { User, Baby, Globe, Bell, ChevronRight } from "lucide-react";
import { userProfile } from "@/data/mockData";
import { useState } from "react";

const Profile = () => {
  const [notifications, setNotifications] = useState(userProfile.notifications);

  const items = [
    { icon: User, label: "Parent Name", value: userProfile.parentName },
    { icon: Baby, label: "Child's Name", value: userProfile.childName },
    { icon: Baby, label: "Child's Age", value: `${userProfile.childAge} years` },
    { icon: Globe, label: "Language", value: userProfile.language },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-5 pt-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-sky flex items-center justify-center text-3xl mb-3">
          👩‍👦
        </div>
        <h2 className="text-lg font-bold text-foreground">{userProfile.parentName}</h2>
        <p className="text-sm text-muted-foreground">Parent of {userProfile.childName}</p>
      </motion.div>

      {/* Details */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4 px-4 py-4">
            <item.icon className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </motion.div>

      {/* Notifications */}
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
    </div>
  );
};

export default Profile;
