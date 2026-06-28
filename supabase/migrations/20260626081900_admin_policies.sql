-- Allow authenticated users to manage their own roles (useful for hackathon demo role toggling)
CREATE POLICY "Users insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own roles" ON public.user_roles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own roles" ON public.user_roles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins view all profiles
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins view and manage all roles
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admins view and manage all subscriptions
CREATE POLICY "Admins view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
