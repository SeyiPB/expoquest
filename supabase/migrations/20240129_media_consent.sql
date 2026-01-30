-- Add media_consent to attendees table
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS media_consent boolean DEFAULT false;
