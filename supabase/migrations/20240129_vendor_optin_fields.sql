-- Add solution_overview and value_proposition to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS solution_overview text;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS value_proposition text;
