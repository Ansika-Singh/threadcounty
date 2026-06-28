-- Allow anonymous authenticated users (signInAnonymously) to upload images and save analysis reports
-- Anonymous users in Supabase have auth.uid() set and role = 'authenticated'

-- Uploads: allow any authenticated user (incl. anonymous) to insert/select their own uploads
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.uploads;
CREATE POLICY "Users can insert own uploads" ON public.uploads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own uploads" ON public.uploads;
CREATE POLICY "Users can view own uploads" ON public.uploads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own uploads" ON public.uploads;
CREATE POLICY "Users can delete own uploads" ON public.uploads
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Reports: allow any authenticated user (incl. anonymous) to insert/select their own reports
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
