
-- 1. Base tables

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 2 AND age <= 5),
  language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  duration TEXT NOT NULL DEFAULT '5 mins',
  icon TEXT NOT NULL DEFAULT '🎯',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, plan_date)
);

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL UNIQUE REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('yes', 'somewhat', 'no')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  completed_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, category)
);

-- 2. Helper functions (SECURITY DEFINER to avoid RLS recursion)

CREATE OR REPLACE FUNCTION public.is_profile_owner(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_child_owner(_child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.children c
    JOIN public.profiles p ON p.id = c.profile_id
    WHERE c.id = _child_id AND p.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_plan_owner(_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.daily_plans dp
    JOIN public.children c ON c.id = dp.child_id
    JOIN public.profiles p ON p.id = c.profile_id
    WHERE dp.id = _plan_id AND p.user_id = auth.uid()
  );
$$;

-- 3. Enable RLS on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- children
CREATE POLICY "Parents can view own children" ON public.children FOR SELECT USING (public.is_profile_owner(profile_id));
CREATE POLICY "Parents can insert own children" ON public.children FOR INSERT WITH CHECK (public.is_profile_owner(profile_id));
CREATE POLICY "Parents can update own children" ON public.children FOR UPDATE USING (public.is_profile_owner(profile_id));
CREATE POLICY "Parents can delete own children" ON public.children FOR DELETE USING (public.is_profile_owner(profile_id));

-- activities (globally readable by authenticated users)
CREATE POLICY "Activities are readable by authenticated users" ON public.activities FOR SELECT TO authenticated USING (true);

-- daily_plans
CREATE POLICY "Parents can view own plans" ON public.daily_plans FOR SELECT USING (public.is_child_owner(child_id));
CREATE POLICY "Parents can insert own plans" ON public.daily_plans FOR INSERT WITH CHECK (public.is_child_owner(child_id));
CREATE POLICY "Parents can update own plans" ON public.daily_plans FOR UPDATE USING (public.is_child_owner(child_id));
CREATE POLICY "Parents can delete own plans" ON public.daily_plans FOR DELETE USING (public.is_child_owner(child_id));

-- feedback
CREATE POLICY "Parents can view own feedback" ON public.feedback FOR SELECT USING (public.is_plan_owner(daily_plan_id));
CREATE POLICY "Parents can insert own feedback" ON public.feedback FOR INSERT WITH CHECK (public.is_plan_owner(daily_plan_id));
CREATE POLICY "Parents can update own feedback" ON public.feedback FOR UPDATE USING (public.is_plan_owner(daily_plan_id));
CREATE POLICY "Parents can delete own feedback" ON public.feedback FOR DELETE USING (public.is_plan_owner(daily_plan_id));

-- progress_tracking
CREATE POLICY "Parents can view own progress" ON public.progress_tracking FOR SELECT USING (public.is_child_owner(child_id));
CREATE POLICY "Parents can insert own progress" ON public.progress_tracking FOR INSERT WITH CHECK (public.is_child_owner(child_id));
CREATE POLICY "Parents can update own progress" ON public.progress_tracking FOR UPDATE USING (public.is_child_owner(child_id));

-- 5. Auto-create profile on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Updated_at trigger

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Seed activities

INSERT INTO public.activities (title, description, category, difficulty, duration, icon, steps) VALUES
('Learn Colors', 'Explore colors using everyday objects around the house.', 'Cognitive', 'easy', '5–10 mins', '🎨',
 '[{"id":1,"instruction":"Pick 3 colorful objects from around the room.","tip":"Let your child choose one!"},{"id":2,"instruction":"Hold up each object and say the color name clearly."},{"id":3,"instruction":"Play a matching game — ask ''Can you find something else that is red?''"},{"id":4,"instruction":"Praise your child for every attempt."}]'::jsonb),
('Counting Steps', 'Practice counting by walking and counting steps together.', 'Math', 'easy', '5 mins', '🦶',
 '[{"id":1,"instruction":"Hold your child''s hand and say ''Let''s count our steps!''"},{"id":2,"instruction":"Walk slowly and count each step aloud: 1, 2, 3..."},{"id":3,"instruction":"Try counting up to 10, then start over."},{"id":4,"instruction":"Ask your child to count on their own."}]'::jsonb),
('Animal Sounds', 'Learn about animals and the sounds they make.', 'Language', 'easy', '5–10 mins', '🐾',
 '[{"id":1,"instruction":"Show your child a picture or toy of an animal."},{"id":2,"instruction":"Make the animal''s sound and ask ''What does the cow say?''"},{"id":3,"instruction":"Let your child try making the sounds. Clap and cheer!"},{"id":4,"instruction":"Ask ''Which animal do you like best?''"}]'::jsonb),
('Shape Hunt', 'Find shapes in everyday objects around your home.', 'Cognitive', 'easy', '10 mins', '🔷',
 '[{"id":1,"instruction":"Explain what a circle, square, and triangle look like."},{"id":2,"instruction":"Walk around the house and find objects that match each shape."},{"id":3,"instruction":"Draw the shapes on paper and let your child trace them."},{"id":4,"instruction":"Ask your child to name the shape of their favorite toy."}]'::jsonb),
('Fruit Names', 'Teach your child the names of common fruits.', 'Language', 'easy', '5 mins', '🍎',
 '[{"id":1,"instruction":"Place 3–4 fruits on a table."},{"id":2,"instruction":"Point to each fruit and say its name. Ask your child to repeat."},{"id":3,"instruction":"Ask ''Which fruit is yellow?'' and let your child point."},{"id":4,"instruction":"Let your child hold and feel each fruit while saying its name."}]'::jsonb);
