
-- Revoke broad execute on definer functions; allow only what's needed
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
-- authenticated still needs has_role for RLS policy evaluation; service_role keeps full access

-- Tighten contact_messages with content checks
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit valid contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email LIKE '%@%.%'
    AND length(trim(message)) BETWEEN 1 AND 5000
  );

-- Storage policies for fabric-images (private bucket)
CREATE POLICY "Users read own fabric images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'fabric-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own fabric images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fabric-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own fabric images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fabric-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars (private bucket)
CREATE POLICY "Users read own avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
