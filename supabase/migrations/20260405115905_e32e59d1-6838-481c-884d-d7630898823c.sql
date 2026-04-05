
-- 1. Create role enum and table first
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Now create has_role function (table exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 3. Policies on user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Update handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- 5. Recreate policies with admin bypass

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- CHILDREN
DROP POLICY IF EXISTS "Parents can view own children" ON public.children;
DROP POLICY IF EXISTS "Parents can insert own children" ON public.children;
DROP POLICY IF EXISTS "Parents can update own children" ON public.children;
DROP POLICY IF EXISTS "Parents can delete own children" ON public.children;

CREATE POLICY "Parents can view own children" ON public.children
  FOR SELECT TO authenticated
  USING (is_child_owner(id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can insert own children" ON public.children
  FOR INSERT TO authenticated
  WITH CHECK (is_profile_owner(profile_id));

CREATE POLICY "Parents can update own children" ON public.children
  FOR UPDATE TO authenticated
  USING (is_child_owner(id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can delete own children" ON public.children
  FOR DELETE TO authenticated
  USING (is_child_owner(id) OR public.has_role(auth.uid(), 'admin'));

-- DAILY_PLANS
DROP POLICY IF EXISTS "Parents can view own plans" ON public.daily_plans;
DROP POLICY IF EXISTS "Parents can insert own plans" ON public.daily_plans;
DROP POLICY IF EXISTS "Parents can update own plans" ON public.daily_plans;
DROP POLICY IF EXISTS "Parents can delete own plans" ON public.daily_plans;

CREATE POLICY "Parents can view own plans" ON public.daily_plans
  FOR SELECT TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can insert own plans" ON public.daily_plans
  FOR INSERT TO authenticated
  WITH CHECK (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can update own plans" ON public.daily_plans
  FOR UPDATE TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can delete own plans" ON public.daily_plans
  FOR DELETE TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

-- FEEDBACK
DROP POLICY IF EXISTS "Parents can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Parents can insert own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Parents can update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Parents can delete own feedback" ON public.feedback;

CREATE POLICY "Parents can view own feedback" ON public.feedback
  FOR SELECT TO authenticated
  USING (is_plan_owner(daily_plan_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can insert own feedback" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (is_plan_owner(daily_plan_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can update own feedback" ON public.feedback
  FOR UPDATE TO authenticated
  USING (is_plan_owner(daily_plan_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can delete own feedback" ON public.feedback
  FOR DELETE TO authenticated
  USING (is_plan_owner(daily_plan_id) OR public.has_role(auth.uid(), 'admin'));

-- PROGRESS_TRACKING
DROP POLICY IF EXISTS "Parents can view own progress" ON public.progress_tracking;
DROP POLICY IF EXISTS "Parents can insert own progress" ON public.progress_tracking;
DROP POLICY IF EXISTS "Parents can update own progress" ON public.progress_tracking;

CREATE POLICY "Parents can view own progress" ON public.progress_tracking
  FOR SELECT TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can insert own progress" ON public.progress_tracking
  FOR INSERT TO authenticated
  WITH CHECK (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can update own progress" ON public.progress_tracking
  FOR UPDATE TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Parents can delete own progress" ON public.progress_tracking
  FOR DELETE TO authenticated
  USING (is_child_owner(child_id) OR public.has_role(auth.uid(), 'admin'));
