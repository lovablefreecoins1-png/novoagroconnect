
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  user_type TEXT NOT NULL DEFAULT 'produtor',
  city TEXT DEFAULT 'Boa Esperança',
  state TEXT DEFAULT 'MG',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  avatar_url TEXT,
  production_types TEXT[],
  property_size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type, city, state, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'produtor'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Boa Esperança'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'MG'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Providers table
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT,
  description TEXT,
  disponibilidade TEXT DEFAULT 'disponivel',
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view providers" ON public.providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own provider" ON public.providers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own provider" ON public.providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Leads table (pedidos/service requests)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  producer_name TEXT,
  provider_name TEXT,
  service TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  requested_date TEXT,
  location_text TEXT,
  budget NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = producer_id OR auth.uid() = provider_id);
CREATE POLICY "Owner can update leads" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = producer_id OR auth.uid() = provider_id);
CREATE POLICY "Owner can delete leads" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = producer_id);

-- Contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  producer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_name TEXT,
  scheduled_date TEXT,
  gross_amount NUMERIC DEFAULT 0,
  cost_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts" ON public.contracts FOR SELECT TO authenticated USING (auth.uid() = provider_id OR auth.uid() = producer_id);
CREATE POLICY "Authenticated can insert contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id OR auth.uid() = producer_id);
CREATE POLICY "Users can update own contracts" ON public.contracts FOR UPDATE TO authenticated USING (auth.uid() = provider_id OR auth.uid() = producer_id);

-- Anuncios table (marketplace)
CREATE TABLE public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  price_type TEXT DEFAULT 'fixed',
  photos TEXT[],
  whatsapp TEXT,
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active anuncios" ON public.anuncios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own anuncios" ON public.anuncios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own anuncios" ON public.anuncios FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own anuncios" ON public.anuncios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
