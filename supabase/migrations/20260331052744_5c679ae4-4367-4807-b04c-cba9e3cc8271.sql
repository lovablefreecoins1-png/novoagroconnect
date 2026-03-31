
-- Insert profiles for existing users who don't have one yet
INSERT INTO public.profiles (id, full_name, email, user_type, city, state, phone)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  u.email,
  COALESCE(u.raw_user_meta_data->>'user_type', 'produtor'),
  COALESCE(u.raw_user_meta_data->>'city', 'Boa Esperança'),
  COALESCE(u.raw_user_meta_data->>'state', 'MG'),
  COALESCE(u.raw_user_meta_data->>'phone', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
