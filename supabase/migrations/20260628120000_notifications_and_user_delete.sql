-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_id_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Notify user when a report completes
CREATE OR REPLACE FUNCTION public.notify_report_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      NEW.user_id,
      'Analysis complete',
      COALESCE(NEW.fabric_type, 'Fabric') || ' report is ready to view.',
      'success',
      '/analysis/' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER on_report_completed
  AFTER INSERT OR UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_report_completed();

-- Self-service account deletion (requires service role for auth.users removal)
CREATE OR REPLACE FUNCTION public.delete_user_self()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM auth.users WHERE id = uid;
END $$;

GRANT EXECUTE ON FUNCTION public.delete_user_self() TO authenticated;

-- Admin delete user (cannot delete self)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account from admin panel';
  END IF;
  DELETE FROM auth.users WHERE id = target_user_id;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
