
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS available text;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS radius_km integer;

-- Copy existing data from disponibilidade to available
UPDATE public.providers SET available = disponibilidade WHERE disponibilidade IS NOT NULL AND available IS NULL;
-- Copy existing data from description to bio  
UPDATE public.providers SET bio = description WHERE description IS NOT NULL AND bio IS NULL;
