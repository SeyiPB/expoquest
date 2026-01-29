-- Create sequence for attendee numbers
CREATE SEQUENCE IF NOT EXISTS attendee_number_seq START 1;

-- Add attendee_number column to attendees table
ALTER TABLE public.attendees ADD COLUMN IF NOT EXISTS attendee_number text;

-- Create function to generate attendee number
CREATE OR REPLACE FUNCTION generate_attendee_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate formatted number: QNY-0001, QNY-0002, etc.
  NEW.attendee_number := 'QNY-' || LPAD(nextval('attendee_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign number on insert
DROP TRIGGER IF EXISTS set_attendee_number ON public.attendees;
CREATE TRIGGER set_attendee_number
BEFORE INSERT ON public.attendees
FOR EACH ROW
EXECUTE FUNCTION generate_attendee_number();
