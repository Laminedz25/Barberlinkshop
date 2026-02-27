-- Add salon_type field to barbers table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_type') THEN
    CREATE TYPE public.salon_type AS ENUM ('men', 'women', 'unisex');
  END IF;
END $$;

ALTER TABLE public.barbers 
ADD COLUMN IF NOT EXISTS salon_type public.salon_type DEFAULT 'men';

-- Add phone number to barbers for contact
ALTER TABLE public.barbers 
ADD COLUMN IF NOT EXISTS phone text;