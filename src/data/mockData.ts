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

export interface ActivityStep {
  id: number;
  instruction: string;
  tip?: string;
}

export const activities: Activity[] = [
  {
    id: "1",
    title: "Learn Colors",
    description: "Explore colors using everyday objects around the house.",
    duration: "5–10 mins",
    category: "Cognitive",
    icon: "🎨",
    steps: [
      { id: 1, instruction: "Pick 3 colorful objects from around the room (e.g., a red apple, blue cup, yellow toy).", tip: "Let your child choose one!" },
      { id: 2, instruction: "Hold up each object and say the color name clearly. Ask your child to repeat it." },
      { id: 3, instruction: "Play a matching game — ask 'Can you find something else that is red?'" },
      { id: 4, instruction: "Praise your child for every attempt, even if the answer isn't perfect." },
    ],
  },
  {
    id: "2",
    title: "Counting Steps",
    description: "Practice counting by walking and counting steps together.",
    duration: "5 mins",
    category: "Math",
    icon: "🦶",
    steps: [
      { id: 1, instruction: "Hold your child's hand and say 'Let's count our steps!'" },
      { id: 2, instruction: "Walk slowly and count each step aloud: 1, 2, 3..." },
      { id: 3, instruction: "Try counting up to 10, then start over." },
      { id: 4, instruction: "Ask your child to count on their own while you walk together." },
    ],
  },
  {
    id: "3",
    title: "Animal Sounds",
    description: "Learn about animals and the sounds they make.",
    duration: "5–10 mins",
    category: "Language",
    icon: "🐾",
    steps: [
      { id: 1, instruction: "Show your child a picture or toy of an animal (cat, dog, cow)." },
      { id: 2, instruction: "Make the animal's sound and ask 'What does the cow say?'" },
      { id: 3, instruction: "Let your child try making the sounds. Clap and cheer!" },
      { id: 4, instruction: "Ask 'Which animal do you like best?' and talk about it." },
    ],
  },
  {
    id: "4",
    title: "Shape Hunt",
    description: "Find shapes in everyday objects around your home.",
    duration: "10 mins",
    category: "Cognitive",
    icon: "🔷",
    completed: true,
    steps: [
      { id: 1, instruction: "Explain what a circle, square, and triangle look like." },
      { id: 2, instruction: "Walk around the house together and find objects that match each shape." },
      { id: 3, instruction: "Draw the shapes on paper and let your child trace them." },
      { id: 4, instruction: "Ask your child to name the shape of their favorite toy." },
    ],
  },
  {
    id: "5",
    title: "Fruit Names",
    description: "Teach your child the names of common fruits.",
    duration: "5 mins",
    category: "Language",
    icon: "🍎",
    completed: true,
    steps: [
      { id: 1, instruction: "Place 3–4 fruits on a table (apple, banana, orange)." },
      { id: 2, instruction: "Point to each fruit and say its name. Ask your child to repeat." },
      { id: 3, instruction: "Ask 'Which fruit is yellow?' and let your child point." },
      { id: 4, instruction: "Let your child hold and feel each fruit while saying its name." },
    ],
  },
];

export const progressData = {
  completedActivities: 12,
  totalActivities: 20,
  streakDays: 5,
  strengths: [
    { area: "Colors & Shapes", score: 85 },
    { area: "Counting", score: 70 },
    { area: "Language", score: 60 },
  ],
  improvements: [
    { area: "Fine Motor Skills", score: 40 },
    { area: "Social Skills", score: 35 },
  ],
  weeklyProgress: [
    { day: "Mon", activities: 2 },
    { day: "Tue", activities: 3 },
    { day: "Wed", activities: 1 },
    { day: "Thu", activities: 2 },
    { day: "Fri", activities: 3 },
    { day: "Sat", activities: 1 },
    { day: "Sun", activities: 0 },
  ],
};

export const userProfile = {
  parentName: "Sarah",
  childName: "Aayan",
  childAge: 3,
  language: "English",
  notifications: true,
};
